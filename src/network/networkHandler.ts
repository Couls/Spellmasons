import type { OnDataArgs } from '@websocketpie/client';

import stringify from 'fast-safe-stringify';
import { MESSAGE_TYPES } from '../types/MessageTypes';
import * as Image from '../graphics/Image';
import floatingText from '../graphics/FloatingText';
import { getUpgradeByTitle } from '../Upgrade';
import Underworld, { elUpgradePickerContent, IUnderworldSerialized, IUnderworldSerializedForSyncronize, LevelData, showUpgradesClassName, turn_phase } from '../Underworld';
import * as Player from '../entity/Player';
import * as Unit from '../entity/Unit';
import * as Pickup from '../entity/Pickup';
import * as messageQueue from '../messageQueue';
import * as storage from '../storage';
import * as config from '../config';
import * as Cards from '../cards';
import * as Chat from '../graphics/ui/Chat';
import * as colors from '../graphics/ui/colors';
import { allUnits } from '../entity/units';
import { hostGiveClientGameState, typeGuardHostApp } from './networkUtil';
import { skyBeam } from '../VisualEffects';
import { tryFallInOutOfLiquid } from '../entity/Obstacle';
import { IPickupSerialized, removePickup } from '../entity/Pickup';
import { triggerAdminCommand } from '../graphics/ui/eventListeners';
import { clone, Vec2 } from '../jmath/Vec';
import pingSprite from '../graphics/Ping';
import { clearLastNonMenuView, setView, View } from '../views';
import { autoExplain, explain, EXPLAIN_END_TURN, tutorialCompleteTask } from '../graphics/Explain';
import { cacheBlood, cameraAutoFollow, runCinematicLevelCamera } from '../graphics/PixiUtils';
import { ensureAllClientsHaveAssociatedPlayers, Overworld, recalculateGameDifficulty } from '../Overworld';
import { playerCastAnimationColor, playerCastAnimationColorLighter, playerCastAnimationGlow } from '../graphics/ui/colors';
import { lightenColor } from '../graphics/ui/colorUtil';
import { choosePerk, tryTriggerPerk } from '../Perk';
import { runPredictions } from '../graphics/PlanningView';
import seedrandom from 'seedrandom';
import { getUniqueSeedString, SeedrandomState } from '../jmath/rand';
import { setPlayerNameUI } from '../PlayerUtils';
import { GameMode } from '../types/commonTypes';
import { recalcPositionForCards } from '../graphics/ui/CardUI';
import { isSinglePlayer } from './wsPieSetup';

export const NO_LOG_LIST = [MESSAGE_TYPES.PREVENT_IDLE_TIMEOUT, MESSAGE_TYPES.PING, MESSAGE_TYPES.PLAYER_THINKING];
export const HANDLE_IMMEDIATELY = [MESSAGE_TYPES.PREVENT_IDLE_TIMEOUT, MESSAGE_TYPES.PING, MESSAGE_TYPES.PLAYER_THINKING];
export const elInstructions = document.getElementById('instructions') as (HTMLElement | undefined);
export function onData(d: OnDataArgs, overworld: Overworld) {
  const { payload, fromClient } = d;
  if (!NO_LOG_LIST.includes(d.payload.type)) {
    // Don't clog up server logs with payloads, leave that for the client which can handle them better
    try {
      console.log("Recieved onData:", MESSAGE_TYPES[d.payload.type], globalThis.headless ? '' : JSON.stringify(d))
    } catch (e) {
      console.warn('Prevent error due to Stringify:', e);
    }
  }
  const type: MESSAGE_TYPES = payload.type;
  const { underworld } = overworld;
  if (!underworld) {
    console.error('Cannot process onData, underworld does not exist');
    return;
  }
  // Note: If the message is from the server there will not be a fromPlayer
  const fromPlayer = globalThis.numberOfHotseatPlayers > 1 ? underworld.players[underworld.hotseatCurrentPlayerIndex] : underworld.players.find(p => p.clientId == fromClient);

  switch (type) {
    case MESSAGE_TYPES.CHAT_SENT:
      const { message } = payload;
      Chat.ReceiveMessage(fromPlayer, message);
      break;
    case MESSAGE_TYPES.PLAYER_THINKING:
      const thinkingPlayer = fromPlayer;
      if (thinkingPlayer && thinkingPlayer != globalThis.player) {
        const thought = underworld.playerThoughts[thinkingPlayer.clientId];
        // Default the currentDrawLocation to target if it doesn't already exist
        // Clear currentDrawLocation if thought contains no cardIds
        const currentDrawLocation = thought && thought.cardIds.length == 0 ? undefined : thought?.currentDrawLocation || payload.target
        // When a new thought comes in, reset the lerp value so the currentDrawLocation will smoothly animate to the new target
        underworld.playerThoughts[thinkingPlayer.clientId] = { ...payload, currentDrawLocation, lerp: 0 };
      }
      break;
    case MESSAGE_TYPES.CLIENT_SEND_PLAYER_TO_SERVER:
      // This message is only ever handled by the host.  It is for the client
      // to send it's Player state to the host because the client is the source of truth for the player object
      // Do NOT process this message for hotseat or else it will may overwrite a player https://github.com/jdoleary/Spellmasons/issues/198
      if (isHost(overworld.pie) && overworld.underworld && globalThis.numberOfHotseatPlayers == 1) {
        const { player } = payload;
        const foundPlayerIndex = overworld.underworld.players.findIndex(p => p.clientId == player.clientId);
        if (foundPlayerIndex !== undefined) {
          // Report Differences to evaluate where client server player desyncs are ocurring
          const currentPlayer = overworld.underworld.players[foundPlayerIndex];
          if (currentPlayer) {
            const currentPlayerSerialized = Player.serialize(currentPlayer);
            for (let key of new Set([...Object.keys(currentPlayerSerialized), ...Object.keys(player)])) {
              // @ts-ignore: No index signature with a parameter of type 'string' was found on type 'IPlayerSerialized'.
              // This is fine because we're just checking inequality to report desyncs
              if (JSON.stringify(currentPlayerSerialized[key]) != JSON.stringify(player[key])) {
                // @ts-ignore: No index signature with a parameter of type 'string' was found on type 'IPlayerSerialized'.
                // This is fine because we're just checking inequality to report desyncs
                console.error(`CLIENT_SEND_PLAYER_TO_SERVER property desync: property:${key}, host:${currentPlayerSerialized[key]}, client:${player[key]}`);
              }
            }
          }
          // End Report Differences to evaluate where client server player desyncs are ocurring


          // Host loads player data from client to syncronize the state
          Player.load(player, foundPlayerIndex, overworld.underworld, false);
        }
      }
      break;
    case MESSAGE_TYPES.SET_GAME_MODE:
      const { gameMode } = payload;
      if (underworld.levelIndex <= 1) {
        underworld.gameMode = gameMode;
        // Must be called when difficulty (gameMode) changes to update summon spell stats
        Cards.refreshSummonCardDescriptions(underworld);
        recalculateGameDifficulty(underworld);
        // Clear lastLevelCreated in order to allow it to regenerate the level without
        // changing the levelIndex
        underworld.lastLevelCreated = undefined;
        underworld.generateLevelData(underworld.levelIndex);

        // Since svelte can't keep track of state outside of itself,
        // any time the view switches back to the Menu it should force rerender
        if (globalThis.refreshMenu) {
          globalThis.refreshMenu();
        }
        console.log('gamemode set to: "', gameMode, '"');
      } else {
        Jprompt({ text: 'Cannot change difficulty for an ongoing game', yesText: 'Okay', forceShow: true });
      }
      break;
    case MESSAGE_TYPES.SET_MODS:
      const { activeMods } = payload;
      if (activeMods) {
        underworld.activeMods = activeMods;
      }
      break;
    case MESSAGE_TYPES.JOIN_GAME_AS_PLAYER:
      const { asPlayerClientId } = payload;
      joinGameAsPlayer(asPlayerClientId, overworld, fromClient);
      break;
    case MESSAGE_TYPES.FORCE_TRIGGER_PICKUP:
      {
        const { pickupId, pickupName, unitId, playerClientId } = payload;
        let pickup = underworld.pickups.find(p => p.id == pickupId);
        const unit = underworld.units.find(u => u.id == unitId);
        // Important: This is NOT fromPlayer, this is the optional player that collided
        // with the pickup
        const player = underworld.players.find(p => p.clientId == playerClientId);
        if (pickup) {
          if (pickup.name !== pickupName) {
            console.error("FORCE_TRIGGER_PICKUP: pickup name is desynced", pickup.name, pickupName);
          }
          if (unit) {
            Pickup.triggerPickup(pickup, unit, player, underworld, false);
          } else {
            console.error('Force trigger pickup failed, unit is undefined');
          }
        } else {
          console.error('Force trigger pickup failed, pickup is undefined');
        }
      }
      break;
    case MESSAGE_TYPES.QUEUE_PICKUP_TRIGGER:
      // QUEUE_PICKUP_TRIGGER is only for clients, the headless server triggers pickups
      // as soon as they are touched and is the source of truth on what pickups are touched
      // Also this should be ignored by single player host
      if (globalThis.isHost(underworld.pie)) {
        return;
      }
      const { pickupId, pickupName, unitId, playerClientId } = payload;
      let pickup = underworld.pickups.find(p => p.id == pickupId);
      const unit = underworld.units.find(u => u.id == unitId);
      if (!pickup) {
        const pickupSource = Pickup.pickups.find(p => p.name == pickupName);
        if (pickupSource) {
          console.log('pickups:', underworld.pickups.map(p => `${p.id},${p.name}`), 'pickupId:', pickupId)
          console.error('Attempted to aquire pickup but could not find it in list, creating one to aquire', pickupName);
          pickup = Pickup.create({ pos: { x: -1000, y: -1000 }, pickupSource, logSource: 'QUEUE_PICKUP_TRIGGER force create' }, underworld, false);
        } else {
          console.error(`Pickup source not found for name: ${pickupName}`)
        }
      }
      // note: player is optionally undefined, but pickup and unit are required
      if (pickup) {
        if (unit) {
          // Place it in the queue, server sees that unit has touched pickup but animations are still happening locally
          // and the unit hasn't collided with the pickup yet, placing it in the queue will allow the unit to pickup
          // the pickup once it touches
          underworld.aquirePickupQueue.push({ pickupId: pickup.id, unitId: unit.id, timeout: Date.now() + 3000, flaggedForRemoval: false });
        } else {
          console.log('units:', underworld.units.map(u => u.id), 'UnitId:', unitId);
          console.error('Attempted to aquire pickup but could not find unit');
        }
      } else {
        console.log('pickups:', underworld.pickups.map(p => `${p.id},${p.name}`), 'pickupId:', pickupId)
        console.error('Attempted to aquire pickup but could not find it in list');
      }
      break;
    case MESSAGE_TYPES.SPEND_STAT_POINT:
      {
        const { stat } = payload;
        if (stat) {
          if (fromPlayer) {
            underworld.spendStatPoint(stat, fromPlayer);
          } else {
            console.error('SPEND_STAT_POINT, missing fromPlayer', fromClient);
          }
        } else {
          console.error('Missing stat in payload', payload);
        }

        break;
      }
    case MESSAGE_TYPES.PING:
      if (fromPlayer) {
        pingSprite({ coords: payload as Vec2, color: fromPlayer.color });
      }
      break;
    case MESSAGE_TYPES.INIT_GAME_STATE:
      // This is executed on all clients, even ones that ignore the 
      // message due to logic below because if one client updates
      // the seed state, they all must in order to stay in sync
      // --
      // Update the seed (this MUST come before syncronizeRNG)
      if (payload.underworld) {
        underworld.seed = payload.underworld.seed;
        // Now sync the seed-based RNG state
        if (payload.RNGState) {
          underworld.syncronizeRNG(payload.underworld.RNGState);
        }
      }
      // If the underworld is not yet initialized for this client then
      // load the game state
      // INIT_GAME_STATE is only to be handled by clients who just
      // connected to the room and need the first transfer of game state
      // This is why it is okay that updating the game state happens 
      // asynchronously.
      // or in the case of allowForceInitGameState, clients who have reconnected
      if (underworld.allowForceInitGameState || underworld.lastLevelCreated === undefined) {
        underworld.allowForceInitGameState = false;
        // If a client loads a full game state, they should be fully synced
        // so clear the onDataQueue to prevent old messages from being processed
        // after the full gamestate sync
        onDataQueueContainer.queue = [d];
        processNextInQueueIfReady(overworld);
      } else {
        console.log('Ignoring INIT_GAME_STATE because underworld has already been initialized.');
      }
      break;
    case MESSAGE_TYPES.CHOOSE_PERK:
      {
        console.log('onData: CHOOSE_PERK', `${fromClient}: ${JSON.stringify(payload?.perk || {})}`);
        if (payload.curse) {
          const player = fromPlayer;
          if (player) {
            player.spellState[payload.curse] = { disabledUntilLevel: underworld.levelIndex + (payload.disableFor || 2) };
            player.cursesChosen++;
            // Reset last level card counts
            for (let spellStateInst of Object.values(player.spellState || {})) {
              spellStateInst.count = 0;
            }
            // If current player
            if (player == globalThis.player) {
              // Update disabled label
              recalcPositionForCards(player, underworld);
            }
          } else {
            console.error('Could not find player to give curse perk.')
          }
          // Clear upgrades
          document.body?.classList.toggle(showUpgradesClassName, false);
          // There may be upgrades left to choose
          underworld.showUpgrades();
        } else if (payload.statCalamity) {
          const player = fromPlayer;
          if (player) {
            player.cursesChosen++;
            underworld.statCalamities.push(payload.statCalamity);
            // Apply the newly chosen calamity to current units
            for (let unit of underworld.units) {
              Unit.adjustUnitStatsByUnderworldCalamity(unit, payload.statCalamity);
            }
          } else {
            console.error('Could not find player to give curse perk.')
          }
          // Clear upgrades
          document.body?.classList.toggle(showUpgradesClassName, false);
          // There may be upgrades left to choose
          underworld.showUpgrades();
        } else {
          if (fromPlayer) {
            choosePerk(payload.perk, fromPlayer, underworld);
          } else {
            console.error('Cannot CHOOSE_PERK, fromPlayer is undefined', fromClient, fromPlayer)
          }
        }
      }
      break;
    case MESSAGE_TYPES.CHOOSE_UPGRADE:
      console.log('onData: CHOOSE_UPGRADE', `${fromClient}: ${payload?.upgrade?.title}`);
      if (fromPlayer) {
        const upgrade = getUpgradeByTitle(payload.upgrade.title);
        if (upgrade) {
          underworld.chooseUpgrade(fromPlayer, upgrade);
          if (fromPlayer === globalThis.player) {
            playSFXKey('levelUp');
          }
        } else {
          console.error(
            'Cannot CHOOSE_UPGRADE, upgrade does not exist',
            payload.upgrade.title,
          );
        }
      } else {
        console.error('Cannot CHOOSE_UPGRADE, fromPlayer is undefined', fromClient, fromPlayer)
      }
      break;
    case MESSAGE_TYPES.LOAD_GAME_STATE:
      // If a client loads a full game state, they should be fully synced
      // so clear the onDataQueue to prevent old messages from being processed
      onDataQueueContainer.queue = [d];
      // The LOAD_GAME_STATE message is tricky, it is an 
      // exception to the normal pattern used
      // with the queue, but it should still be processed sequentially to prevent
      // weird race conditions.
      // Since it is a fully copy of the latest
      // game state, it should empty the queue (except for itself).
      // And rather than calling handleOnDataMessageSyncronously(d) here,
      // we just skip right to calling processNextInQueue since this message
      // can execute regardless of whether readyState.isReady() is true or not
      // --
      processNextInQueueIfReady(overworld);
      break;
    default:
      // MESSAGE_TYPES in HANDLE_IMMEDIATELY are not to be queued and can be processed
      // as soon as they are received.
      if (Object.values(HANDLE_IMMEDIATELY).includes(d.payload.type)) {
        handleOnDataMessage(d, overworld).catch(e => {
          console.error('handled: Error in immediate handleOnDataMessage:', e);
        })
      } else {
        // All other messages should be handled one at a time to prevent desync
        handleOnDataMessageSyncronously(d, overworld);
      }
      break;
  }
}
function joinGameAsPlayer(asPlayerClientId: string, overworld: Overworld, fromClient: string) {
  const underworld = overworld.underworld;
  if (underworld) {
    const asPlayer = underworld.players.find(p => p.clientId == asPlayerClientId);
    const oldFromPlayer = underworld.players.find(p => p.clientId == fromClient);
    if (fromClient && asPlayer) {
      if (asPlayer.clientConnected) {
        console.error('Cannot join as player that is controlled by another client')
        return;
      }
      console.log('JOIN_GAME_AS_PLAYER: Reassigning player', asPlayer.clientId, 'to', fromClient);
      const oldAsPlayerClientId = asPlayer.clientId;
      asPlayer.clientId = fromClient;
      // Ensure their turn doesn't get skipped
      asPlayer.endedTurn = false;
      // Change the clientId of fromClient's old player now that they have inhabited the asPlayer
      if (oldFromPlayer) {
        oldFromPlayer.clientId = oldAsPlayerClientId;
        // force update clientConnected due to client switching players
        const isConnected = overworld.clients.includes(oldFromPlayer.clientId);
        oldFromPlayer.clientConnected = isConnected;
        // Delete old player if just created
        if (!oldFromPlayer.clientConnected && oldFromPlayer.inventory.length == 0) {
          underworld.players = underworld.players.filter(p => p !== oldFromPlayer);
        } else {
          console.error('Unexpected, joinGameAsPlayer could not delete oldPlayer')
        }
      } else {
        console.error('Unexpected, joinGameAsPlayer: oldFromPlayer does not exist')
      }


      const players = underworld.players.map(Player.serialize)
      // isClientPlayerSourceOfTruth: false; Overwrite client's own player object because the client is switching players
      underworld.syncPlayers(players, false);
    }
  }

}
let onDataQueueContainer = messageQueue.makeContainer<OnDataArgs>();
// Waits until a message is done before it will continue to process more messages that come through
// This ensures that players can't move in the middle of when spell effects are occurring for example.
function handleOnDataMessageSyncronously(d: OnDataArgs, overworld: Overworld) {
  // Queue message for processing one at a time
  onDataQueueContainer.queue.push(d);
  // 10 is an arbitrary limit which will report that something may be wrong
  // because it's unusual for the queue to get this large
  const arbitraryQueueStuckLimit = 10;
  if (onDataQueueContainer.queue.length > arbitraryQueueStuckLimit) {
    const cachedQueue = JSON.stringify(onDataQueueContainer.queue.slice(0, arbitraryQueueStuckLimit));
    setTimeout(() => {
      if (cachedQueue == JSON.stringify(onDataQueueContainer.queue.slice(0, arbitraryQueueStuckLimit))) {
        console.error("onData queue: growing unusually large", MESSAGE_TYPES[currentlyProcessingOnDataMessage.payload.type], JSON.stringify(currentlyProcessingOnDataMessage), '\nPayload Types:', onDataQueueContainer.queue.map(x => MESSAGE_TYPES[x.payload.type]));
      } else {
        console.log('onData queue: Thought there might be a stuck queue but it resolved itself', cachedQueue, JSON.stringify(onDataQueueContainer.queue.slice(0, arbitraryQueueStuckLimit)));
      }
    }, 5000);
  }
  // process the "next" (the one that was just added) immediately
  processNextInQueueIfReady(overworld);
}
// currentlyProcessingOnDataMessage is used to help with bug reports to show
// which message is stuck and didn't finish being processed.
let currentlyProcessingOnDataMessage: any = null;
export function processNextInQueueIfReady(overworld: Overworld) {
  // If game is ready to process messages, begin processing
  // (if not, they will remain in the queue until the game is ready)
  messageQueue.processNextInQueue(onDataQueueContainer, d => handleOnDataMessage(d, overworld).catch(e => {
    if (e) {
      console.error('Handled: error in handleOnDataMessage:', e.message, e.stack);
    } else {
      console.error('Handled: undefined error in handleOnDataMessage');
    }
  }));
}
function logHandleOnDataMessage(type: MESSAGE_TYPES, payload: any, fromClient: string, underworld: Underworld) {
  try {
    if (!NO_LOG_LIST.includes(type)) {
      // Count processed messages (but only those that aren't in the NO_LOG_LIST)
      underworld.processedMessageCount++;
      let payloadForLogging = '';
      // For headless, log only portions of some payloads so as to not swamp the logs with
      // unnecessary info
      if (globalThis.headless) {
        switch (type) {
          case MESSAGE_TYPES.SET_PHASE:
            payloadForLogging = `phase: ${turn_phase[payload.phase]}`
            break;
          case MESSAGE_TYPES.SYNC_PLAYERS:
            payloadForLogging = `units: ${payload?.units.length}; players: ${payload?.players.length}`;
            break;
          case MESSAGE_TYPES.CREATE_LEVEL:
            payloadForLogging = `levelIndex: ${payload?.level?.levelIndex}; enemies: ${payload?.level?.enemies.length}`;
            break;
          default:
            // To prevent heavy server logs, default payloadForLogging for server is empty
            payloadForLogging = '';
            break;
        }
      } else {
        payloadForLogging = payload;
      }
      // Don't clog up server logs with payloads, leave that for the client which can handle them better
      console.log("Handle onData", underworld.processedMessageCount, ":", MESSAGE_TYPES[type], payloadForLogging)
    }
  } catch (e) {
    console.error('Error in logging', e);
  }

}
let lastSpellMessageTime = 0;
async function handleOnDataMessage(d: OnDataArgs, overworld: Overworld): Promise<any> {
  currentlyProcessingOnDataMessage = d;
  const { payload, fromClient } = d;
  const type: MESSAGE_TYPES = payload.type;
  const { underworld } = overworld;
  if (!underworld) {
    console.error('Cannot handleOnDataMessage, underworld does not exist');
    return;
  }
  logHandleOnDataMessage(type, payload, fromClient, underworld);
  // Get player of the client that sent the message 
  const fromPlayer = globalThis.numberOfHotseatPlayers > 1 ? underworld.players[underworld.hotseatCurrentPlayerIndex] : underworld.players.find(p => p.clientId == fromClient);
  switch (type) {
    case MESSAGE_TYPES.CHANGE_CHARACTER:
      if (fromPlayer) {
        const userSource = allUnits[payload.unitId];
        if (!userSource) {
          console.error('User unit source file not registered, cannot create player');
          return undefined;
        }
        fromPlayer.unit.unitSourceId = payload.unitId;
        // Update the player image
        fromPlayer.unit.defaultImagePath = userSource.info.image;
        Unit.returnToDefaultSprite(fromPlayer.unit);
      } else {
        console.error('Cannot change character, player not found with id', fromClient);
        // TODO: This should request a unit and player sync
      }
      break;
    case MESSAGE_TYPES.REQUEST_SYNC_GAME_STATE:
      // If host, send sync; if non-host, ignore 
      if (globalThis.isHost(overworld.pie)) {
        console.log('Host: Sending game state for REQUEST_SYNC_GAME_STATE')
        hostGiveClientGameState(fromClient, underworld, underworld.lastLevelCreated, MESSAGE_TYPES.LOAD_GAME_STATE);
      }
      break;
    case MESSAGE_TYPES.SYNC_PLAYERS:
      {
        console.log('sync: SYNC_PLAYERS; syncs units and players')
        const { units, players, lastUnitId } = payload as {
          // Note: When syncing players, must also sync units
          // because IPlayerSerialized doesn't container a full
          // unit serialized
          units: Unit.IUnitSerialized[],
          // Sync data for players
          players: Player.IPlayerSerialized[],
          lastUnitId: number
        }
        // Units must be synced before players so that the player's
        // associated unit is available for referencing
        underworld.syncUnits(units);
        // isClientPlayerSourceOfTruth: true; for regular syncs the client's own player object
        // is the source of truth so that the server's async player sync call doesn't overwrite
        // something that happened syncronously on the client
        underworld.syncPlayers(players, true);
        // Protect against old versions that didn't send lastUnitId with
        // this message
        if (lastUnitId !== undefined) {
          underworld.lastUnitId = lastUnitId
        }
      }
      break;
    case MESSAGE_TYPES.SYNC_SOME_STATE:
      {
        if (globalThis.headless) {
          // SYNC_SOME_STATE is only ever sent from headless and doesn't need to be run on headless
          break;
        }
        console.log('sync: SYNC_SOME_STATE; syncs non-player units')
        const { timeOfLastSpellMessage, units, pickups, lastUnitId, lastPickupId, RNGState } = payload as {
          // timeOfLastSpellMessage ensures that SYNC_SOME_STATE won't overwrite valid state with old state
          // if someone a second SPELL message is recieved between this message and it's corresponding SPELL message
          // Messages don't currently have a unique id so I'm storing d.time which should be good enough
          timeOfLastSpellMessage: number,
          // Sync data for units
          units?: Unit.IUnitSerialized[],
          // Sync data for pickups
          pickups?: Pickup.IPickupSerialized[],
          lastUnitId: number,
          lastPickupId: number,
          RNGState: SeedrandomState,
        }
        if (timeOfLastSpellMessage !== lastSpellMessageTime) {
          // Do not sync, state has changed since this sync message was sent
          console.warn('Discarding SYNC_SOME_STATE message, it is no longer valid');
          break;
        }
        if (RNGState) {
          underworld.syncronizeRNG(RNGState);
        }

        if (units) {
          // Sync all non-player units.  If it syncs player units it will overwrite player movements
          // that occurred during the cast
          underworld.syncUnits(units, true);
        }

        if (pickups) {
          underworld.syncPickups(pickups);
        }

        // Syncronize the lastXId so that when a new unit or pickup is created
        // it will get the same id on both server and client
        underworld.lastUnitId = lastUnitId;
        underworld.lastPickupId = lastPickupId;

        break;
      }
    case MESSAGE_TYPES.SET_PHASE:
      console.log('sync: SET_PHASE; syncs units and players')
      const { phase, units, players, pickups, lastUnitId, lastPickupId, RNGState } = payload as {
        phase: turn_phase,
        // Sync data for players
        players?: Player.IPlayerSerialized[],
        // Sync data for units
        units?: Unit.IUnitSerialized[],
        // Sync data for pickups
        pickups?: Pickup.IPickupSerialized[],
        lastUnitId: number,
        lastPickupId: number,
        RNGState: SeedrandomState,
      }
      if (RNGState) {
        underworld.syncronizeRNG(RNGState);
      }
      // Do not set the phase redundantly, this can occur due to tryRestartTurnPhaseLoop
      // being invoked multiple times before the first message is processed.  This is normal.
      if (underworld.turn_phase == phase) {
        console.debug(`Phase is already set to ${turn_phase[phase]}; Aborting SET_PHASE.`);
        return;
      }

      if (units) {
        underworld.syncUnits(units);
      }
      // Note: Players should sync after units so
      // that the player.unit reference is synced
      // with up to date units
      if (players) {
        // isClientPlayerSourceOfTruth: true; for regular syncs the client's own player object
        // is the source of truth so that the server's async player sync call doesn't overwrite
        // something that happened syncronously on the client
        underworld.syncPlayers(players, true);
      }

      if (pickups) {
        underworld.syncPickups(pickups);
      }

      // Syncronize the lastXId so that when a new unit or pickup is created
      // it will get the same id on both server and client
      underworld.lastUnitId = lastUnitId;
      underworld.lastPickupId = lastPickupId;

      // Use the internal setTurnPhrase now that the desired phase has been sent
      // via the public setTurnPhase
      await underworld.initializeTurnPhase(phase);
      break;
    case MESSAGE_TYPES.CREATE_LEVEL:
      const { level, gameMode } = payload as {
        level: LevelData,
        gameMode?: GameMode
      }
      console.log('sync: CREATE_LEVEL: Syncing / Creating level');
      if (underworld) {
        await underworld.createLevel(level, gameMode);
      } else {
        console.error('Cannot sync level, no underworld exists')
      }

      break;
    case MESSAGE_TYPES.INIT_GAME_STATE:
      await handleLoadGameState(payload, overworld);
      break;
    case MESSAGE_TYPES.LOAD_GAME_STATE:
      // Make everyone go back to the lobby
      for (let p of overworld.underworld?.players || []) {
        p.lobbyReady = false;
      }

      await handleLoadGameState(payload, overworld);
      if (!isSinglePlayer()) {
        setView(View.Menu);
        globalThis.setMenu?.('MULTIPLAYER_SERVER_CHOOSER');
      }
      break;
    case MESSAGE_TYPES.ENTER_PORTAL:
      if (fromPlayer) {
        Player.enterPortal(fromPlayer, underworld);
      } else {
        console.error('Recieved ENTER_PORTAL message but "caster" is undefined')
      }
      break;
    case MESSAGE_TYPES.PLAYER_CARDS:
      if (fromPlayer) {
        fromPlayer.cardsInToolbar = payload.cards;
      } else {
        console.error('No fromPlayer to set card order on')
      }
      break;
    case MESSAGE_TYPES.PLAYER_CONFIG:
      if (globalThis.numberOfHotseatPlayers > 1) {
        // Hotseat multiplayer has it's own player config management
        // because it needs to hold configs for multiple players on a single
        // computer
        return;
      }
      const { color, colorMagic, name, lobbyReady } = payload;
      if (fromPlayer) {
        if (lobbyReady !== undefined) {
          fromPlayer.lobbyReady = lobbyReady;
          // If all connected players are also ready, start the game:
          const connectedPlayers = underworld.players.filter(p => p.clientConnected);
          if (connectedPlayers.length > 0 && connectedPlayers.every(p => p.lobbyReady)) {
            console.log('Lobby: All players are ready, start game.');
            // If loading into a game, tryGameOver so that if the game over modal is up, it will
            // be removed if there are acting players.
            underworld.tryGameOver();
            setView(View.Game);
            if (globalThis.player && fromPlayer.clientId == globalThis.player.clientId && !globalThis.player.isSpawned) {
              // Retrigger the cinematic camera since the first time
              // a user joins a game from the lobby, postLevelSetup will
              // already have completed before they enter View.Game, so now
              // that they have, run the cinematic again.
              runCinematicLevelCamera(underworld);
            }
          }
        }
        if (name !== undefined) {
          fromPlayer.name = name;
        }
        setPlayerNameUI(fromPlayer);
        Player.setPlayerRobeColor(fromPlayer, color, colorMagic);
        Player.syncLobby(underworld);
        // Improve joining games so that if there is an uncontrolled player with the same name, this client
        // takes over that player.  This allows clients to join saved games and reassume control of
        // a player with their same name automatically even if their cliendID has changed
        const takeControlOfPlayer = underworld.players.find(p => !p.clientConnected && p.name == name);
        if (takeControlOfPlayer) {
          joinGameAsPlayer(takeControlOfPlayer.clientId, overworld, fromClient);
        }
        underworld.tryRestartTurnPhaseLoop();
      } else {
        console.log('Players: ', underworld.players.map(p => p.clientId))
        console.error('Cannot PLAYER_CONFIG, fromPlayer is undefined.');
      }
      break;
    case MESSAGE_TYPES.SPAWN_PLAYER:
      if (fromPlayer) {
        // Ensure a newly spawned player unit has fresh stats
        Unit.resetUnitStats(fromPlayer.unit, underworld);
        // If the spawned player is the current client's player
        if (fromPlayer == globalThis.player) {
          tutorialCompleteTask('spawn');
          autoExplain();
          // When player spawns, send their config from storage
          // to the server
          if (globalThis.numberOfHotseatPlayers > 1) {
            Player.setPlayerRobeColor(fromPlayer, fromPlayer.color, fromPlayer.colorMagic);
          } else {
            overworld.pie.sendData({
              type: MESSAGE_TYPES.PLAYER_CONFIG,
              color: storage.get(storage.STORAGE_ID_PLAYER_COLOR),
              name: storage.get(storage.STORAGE_ID_PLAYER_NAME),
            });
          }
        }
        if (!(isNaN(payload.x) && isNaN(payload.y))) {
          fromPlayer.isSpawned = true;
          if (fromPlayer.clientId == globalThis.clientId) {
            globalThis.awaitingSpawn = false;
          }
          if (fromPlayer == globalThis.player) {
            if (elInstructions) {
              elInstructions.innerText = '';
            }
            cameraAutoFollow(true);
          }
          Unit.setLocation(fromPlayer.unit, payload);
          // Trigger 'everyLevel' attributePerks
          // now that the player has spawned in at the new level
          const perkRandomGenerator = seedrandom(getUniqueSeedString(underworld, fromPlayer));
          for (let i = 0; i < fromPlayer.attributePerks.length; i++) {
            const perk = fromPlayer.attributePerks[i];
            if (perk) {
              tryTriggerPerk(perk, fromPlayer, 'everyLevel', perkRandomGenerator, underworld, 700 * i);
            }
          }
          // Detect if player spawns in liquid
          tryFallInOutOfLiquid(fromPlayer.unit, underworld, false);
          // Animate effect of unit spawning from the sky
          skyBeam(fromPlayer.unit);
          playSFXKey('summonDecoy');
          // Once a player spawns make sure to show their image as
          // their image may be hidden if they are the non-current user
          // player in multiplayer
          Image.show(fromPlayer.unit.image);
          fromPlayer.endedTurn = false;
          underworld.syncTurnMessage();
          // Used for the tutorial but harmless if invoked under other circumstances.
          // Spawns the portal after the player choses a spawn point if there are no
          // enemies left
          underworld.checkIfShouldSpawnPortal();
        } else {
          console.error('Cannot spawn player at NaN')
        }
        // This check protects against potential bugs where the upgrade screen still hasn't come up
        // by the time the player spawns
        if (fromPlayer == globalThis.player && (underworld.upgradesLeftToChoose(globalThis.player) > 0 || underworld.perksLeftToChoose(globalThis.player) > 0)) {
          // This can happen if they die and then the ally npc finished the level for them and the unit killed by the ally npc triggers a level up
          // or the first time that they spawn
          underworld.showUpgrades();
        }

      } else {
        console.error('Cannot SPAWN_PLAYER, fromPlayer is undefined.')
      }
      Player.syncLobby(underworld);
      underworld.tryRestartTurnPhaseLoop();
      underworld.assertDemoExit();
      break;
    case MESSAGE_TYPES.SET_PLAYER_POSITION:
      // This message is only for the host, it ensures that the player position
      // of the host matches exactly the player position on the player's client
      if (isHost(overworld.pie)) {
        if (fromPlayer && fromPlayer.unit && payload.x !== undefined && payload.y !== undefined) {
          Unit.setLocation(fromPlayer.unit, payload);
        }
      }
      break;
    case MESSAGE_TYPES.MOVE_PLAYER:
      if (fromPlayer == globalThis.player) {
        // Do not do anything, own player movement is handled locally
        // so that it is smooth
        break;
      }
      if (underworld.turn_phase == turn_phase.Stalled) {
        // This check shouldn't have to be here but it protects against the game getting stuck in stalled phase
        console.error('Game was in Stalled turn_phase when a player sent MESSAGE_TYPES.MOVE_PLAYER.');
        underworld.tryRestartTurnPhaseLoop();
      }
      if (fromPlayer) {
        // Only allow spawned players to move
        if (fromPlayer.isSpawned) {
          // Network Sync: Make sure other players move a little slower so that the MOVE_PLAYER messages have time to set the
          // next move point on the client's screen.  This prevents jagged movement due to network latency
          fromPlayer.unit.moveSpeed = config.UNIT_MOVE_SPEED * 0.9;
          // Network Sync: Make sure the other player always has stamina to get where they're going, this is to ensure that
          // the local copies of other player's stay in sync with the server and aren't prematurely stopped due
          // to a stamina limitation
          fromPlayer.unit.stamina = 100;
          const moveTowardsPromise = Unit.moveTowards(fromPlayer.unit, payload, underworld).then(() => {
            if (fromPlayer.unit.path?.points.length && fromPlayer.unit.stamina == 0) {
              // If they do not reach their destination, notify that they are out of stamina
              floatingText({
                coords: fromPlayer.unit,
                text: 'Out of Stamina!'
              });
              explain(EXPLAIN_END_TURN);
              playSFXKey('deny_stamina');
            }
            // Clear player unit path when they are done moving so they get
            // to choose a new path next turn
            fromPlayer.unit.path = undefined;
          });
          // Now that player movement has been set up, trigger the headless server to process it immediately
          underworld.triggerGameLoopHeadless();
          await moveTowardsPromise;

          // Trigger run predictions when the position of any player changes since
          // this could change prediction results
          runPredictions(underworld);
        }
      } else {
        console.error('Cannot move player, caster does not exist');
      }
      break;
    case MESSAGE_TYPES.SPELL:
      lastSpellMessageTime = d.time;
      if (fromPlayer) {
        if (underworld.turn_phase == turn_phase.Stalled) {
          // This check shouldn't have to be here but it protects against the game getting stuck in stalled phase
          console.error('Game was in Stalled turn_phase when a player sent MESSAGE_TYPES.SPELL.');
          underworld.tryRestartTurnPhaseLoop();
        }
        await handleSpell(fromPlayer, payload, underworld);
        // Await forcemoves in case the result of any spells caused a forceMove to be added to the array
        // such as Bloat's onDeath
        await underworld.awaitForceMoves();
        // Only send SYNC_SOME_STATE from the headless server
        if (globalThis.headless) {
          // Sync state directly after each cast to attempt to reduce snowballing desyncs
          underworld.pie.sendData({
            type: MESSAGE_TYPES.SYNC_SOME_STATE,
            timeOfLastSpellMessage: lastSpellMessageTime,
            units: underworld.units.filter(u => !u.flaggedForRemoval).map(Unit.serialize),
            pickups: underworld.pickups.filter(p => !p.flaggedForRemoval).map(Pickup.serialize),
            lastUnitId: underworld.lastUnitId,
            lastPickupId: underworld.lastPickupId,
            // the state of the Random Number Generator
            RNGState: underworld.random.state(),
          });
        }
      } else {
        console.error('Cannot cast, caster does not exist');
      }
      break;
    case MESSAGE_TYPES.END_TURN:
      if (fromPlayer) {
        underworld.endPlayerTurn(fromPlayer.clientId);
      } else {
        console.error('Unable to end turn because caster is undefined');
      }
      break;
    case MESSAGE_TYPES.ADMIN_COMMAND:
      const { label } = payload;
      triggerAdminCommand(label, fromClient, payload)
      break;
    case MESSAGE_TYPES.ADMIN_CHANGE_STAT:
      const { unitId, stats } = payload;
      const unit = underworld.units.find(u => u.id == unitId);
      if (unit) {
        Object.assign(unit, stats);
      } else {
        console.error('ADMIN_CHANGE_STAT failed', payload)
      }
      break;

  }
}
async function handleLoadGameState(payload: {
  underworld: IUnderworldSerializedForSyncronize,
  phase: turn_phase,
  pickups: IPickupSerialized[],
  units: Unit.IUnitSerialized[],
  players: Player.IPlayerSerialized[]
}, overworld: Overworld) {
  console.log("Setup: Load game state", payload)
  const { underworld: payloadUnderworld, phase, pickups, units, players } = payload
  console.log('Setup: activeMods', payloadUnderworld.activeMods);
  // Sync underworld properties
  const loadedGameState: IUnderworldSerializedForSyncronize = { ...payloadUnderworld };
  const { underworld } = overworld;
  if (!underworld) {
    return console.error('Cannot handleLoadGameState, underworld is undefined');
  }

  const level = loadedGameState.lastLevelCreated;
  if (!level) {
    console.error('Cannot handleLoadGameState, level is undefined');
    return;
  }
  underworld.levelIndex = loadedGameState.levelIndex;
  // Update level tracker
  const elLevelTracker = document.getElementById('level-tracker');
  if (elLevelTracker) {
    elLevelTracker.innerHTML = i18n(['Level', underworld.getLevelText()]);
  }

  // Update the seed (this MUST come before syncronizeRNG)
  underworld.seed = loadedGameState.seed;
  // Now sync the seed-based RNG state
  if (loadedGameState.RNGState) {
    underworld.syncronizeRNG(loadedGameState.RNGState);
  }
  underworld.gameMode = loadedGameState.gameMode;
  underworld.turn_phase = loadedGameState.turn_phase;
  underworld.turn_number = loadedGameState.turn_number;
  underworld.processedMessageCount = loadedGameState.processedMessageCount;
  underworld.cardDropsDropped = loadedGameState.cardDropsDropped;
  underworld.enemiesKilled = loadedGameState.enemiesKilled;
  underworld.activeMods = loadedGameState.activeMods;
  underworld.statCalamities = loadedGameState.statCalamities || [];
  // simulatingMovePredictions should never be serialized, it is only for a running instance to keep track of if the simulateRunForceMovePredictions is running
  underworld.simulatingMovePredictions = false;
  // backwards compatible for save state that didn't have this:
  underworld.allyNPCAttemptWinKillSwitch = loadedGameState.allyNPCAttemptWinKillSwitch || 0;

  // Sync Level.  Must await createLevel since it uses setTimeout to ensure that
  // the DOM can update with the "loading..." message before locking up the CPU with heavy processing.
  // This is important so that createLevel runs BEFORE loading units and syncing Players
  // Note: createLevel syncronizes a bunch of underworld properties; for example it invokes cache_walls.
  // Check it carefully before manually syncronizing properties
  await underworld.createLevel(level, underworld.gameMode);

  // Since level data has pickups stored in it and since those pickups' locations
  // for existance may have changed between when the level was created and when
  // the gamestate was saved, remove all pickups and spawn pickups from the pickups array
  for (let p of underworld.pickups) {
    removePickup(p, underworld, false);
  }
  // Clear pickups array now that they have been removed in preparation for loading pickups
  underworld.pickups = [];
  if (pickups) {
    for (let p of pickups) {
      // Don't spawn pickups that are flagged to be removed
      if (p.flaggedForRemoval) {
        continue;
      }
      const pickup = Pickup.pickups.find(pickupSource => pickupSource.name == p.name);
      if (pickup) {
        const newPickup = Pickup.create({ pos: { x: p.x, y: p.y }, pickupSource: pickup, idOverride: p.id, logSource: 'handleLoadGameState' }, underworld, false);
        if (newPickup) {
          const { image, ...rest } = p;
          // Override pickup properties such as turnsLeftToGrab
          Object.assign(newPickup, rest);
        }
      } else {
        console.error('Could not spawn pickup, pickup source missing for imagePath', p.imagePath);
      }
    }
  }

  // Clear upgrades UI when loading a new game
  if (elUpgradePickerContent) {
    elUpgradePickerContent.innerHTML = '';
  }
  document.body?.classList.toggle(showUpgradesClassName, false);

  // Load units
  if (units) {
    // Clean up previous units:
    underworld.units.forEach(u => Unit.cleanup(u));
    underworld.units = units.filter(u => !u.flaggedForRemoval).map(u => Unit.load(u, underworld, false));
  }
  // Note: Players should sync after units are loaded so
  // that the player.unit reference is synced
  // with up to date units
  if (players) {
    // isClientPlayerSourceOfTruth: false; loading a new game means the player should be 
    // fully overwritten
    underworld.syncPlayers(players, false);
  }
  // After a load always start all players with endedTurn == false so that
  // it doesn't skip the player turn if players rejoin out of order
  for (let p of underworld.players) {
    p.endedTurn = false;
  }
  // lastUnitId must be synced AFTER all of the units are synced since the synced
  // units are id aware
  underworld.lastUnitId = loadedGameState.lastUnitId;
  underworld.lastPickupId = loadedGameState.lastPickupId;
  // Set the turn_phase; do not use initializeTurnPhase
  // because that function runs initialization logic that would
  // make the loaded underworld desync from the host's underworld
  underworld.setTurnPhase(phase);

  underworld.syncTurnMessage();
  if (globalThis.headless) {
    ensureAllClientsHaveAssociatedPlayers(overworld, overworld.clients);
  }

  underworld.assertDemoExit();

  // Resyncronize RNG after level has been created
  // This is because createLevel uses a lot of RNG causing the seed state
  // to drift and some clients will get INIT_GAME_STATE at a different time
  // than others, and when INIT_GAME_STATE is received, it drops previous messages
  // in the queue. This means that some clients may sync their RNG after the level is
  // created (due to getting a SET_PHASE) and others may not (because SET_PHASE was dropped)
  // Syncing here ensures everyone starts the level with the same seeded rng.
  // ---
  // Update the seed (this MUST come before syncronizeRNG)
  underworld.seed = loadedGameState.seed;
  // Now sync the seed-based RNG state
  if (loadedGameState.RNGState) {
    underworld.syncronizeRNG(loadedGameState.RNGState);
  }

  // Must be called when difficulty (gameMode) changes to update summon spell stats
  // Must be called AFTER players array is synced
  Cards.refreshSummonCardDescriptions(underworld);

  if (globalThis.player) {
    // Ensures that when loading a hotseat multiplayer saved game,
    // that the inventory is filled with the spells it had when saved
    recalcPositionForCards(globalThis.player, underworld);
  }

}
async function handleSpell(caster: Player.IPlayer, payload: any, underworld: Underworld) {
  if (typeof payload.x !== 'number' || typeof payload.y !== 'number' || typeof payload.casterPositionAtTimeOfCast.x !== 'number' || typeof payload.casterPositionAtTimeOfCast.y !== 'number') {
    console.error('Spell is invalid, it must have target and casterPositionAtTimeOfCast', payload);
    return;
  }
  // Clear out player thought (and the line that points to it) once they cast
  delete underworld.playerThoughts[caster.clientId];

  console.log('Handle Spell:', payload?.cards.join(','));

  // Only allow casting during the PlayerTurns phase
  if (underworld.turn_phase === turn_phase.PlayerTurns) {
    globalThis.animatingSpells = true;
    let animationKey = 'playerAttackEpic';
    if (payload.cards.length < 3) {
      animationKey = 'playerAttackSmall';
    } else if (payload.cards.length < 6) {
      animationKey = 'playerAttackMedium0';
    }
    if (['units/playerBookIn', 'units/playerBookIdle'].includes(caster.unit.image?.sprite.imagePath || '')) {
      await new Promise<void>((resolve) => {
        if (caster.unit.image) {
          Image.changeSprite(
            caster.unit.image,
            'units/playerBookReturn',
            caster.unit.image.sprite.parent,
            resolve,
            {
              loop: false,
              // Play the book close animation a little faster than usual so
              // the player can get on with casting
              animationSpeed: 0.2
            }
          );
          Image.addOneOffAnimation(caster.unit, 'units/playerBookReturnMagic', { doRemoveWhenPrimaryAnimationChanges: true }, {
            loop: false,
            // Play the book close animation a little faster than usual so
            // the player can get on with casting
            animationSpeed: 0.2
          });
        } else {
          resolve();
        }
      });
    }
    if (caster.colorMagic === null) {
      caster.colorMagic = caster.color !== colors.playerNoColor ? playerCastAnimationColor : caster.color;
    }
    // count cards:
    if (caster.spellState) {
      for (let cardId of payload.cards) {
        let record = caster.spellState[cardId];
        if (!record) {
          record = { count: 0 };
          caster.spellState[cardId] = record;
        }
        record.count++;
      }
    }
    const keyMoment = () => underworld.castCards({
      casterCardUsage: caster.cardUsageCounts,
      casterUnit: caster.unit,
      casterPositionAtTimeOfCast: payload.casterPositionAtTimeOfCast,
      cardIds: payload.cards,
      castLocation: clone(payload),
      prediction: false,
      outOfRange: false,
      magicColor: caster.colorMagic,
      casterPlayer: caster,
      initialTargetedUnitId: payload.initialTargetedUnitId,
      initialTargetedPickupId: payload.initialTargetedPickupId,
    });
    const colorMagicMedium = lightenColor(caster.colorMagic, 0.3);
    const colorMagicLight = lightenColor(caster.colorMagic, 0.6);

    const statsUnitDeadBeforeCast = underworld.enemiesKilled;

    await Unit.playComboAnimation(caster.unit, animationKey, keyMoment, {
      animationSpeed: 0.2, loop: false, colorReplace: {
        colors: [
          [playerCastAnimationGlow, caster.colorMagic],
          [playerCastAnimationColor, colorMagicMedium],
          [playerCastAnimationColorLighter, colorMagicLight],
        ],
        epsilon: 0.2
      }
    });

    // Sync cards to reflect "cooldown" label on cards in inventory
    recalcPositionForCards(globalThis.player, underworld);

    // Record best spell stats
    const statsUnitsKilledFromCast = underworld.enemiesKilled - statsUnitDeadBeforeCast;
    if (globalThis.player == caster) {
      const { stats } = globalThis.player;
      if (stats) {
        if (stats.bestSpell.unitsKilled < statsUnitsKilledFromCast) {
          stats.bestSpell.unitsKilled = statsUnitsKilledFromCast;
          stats.bestSpell.spell = payload.cards;
        }
        if (stats.longestSpell.length < payload.cards.length) {
          stats.longestSpell = payload.cards;
        }
      } else {
        console.error('player.stats is undefined');
      }
      // Updates the game over modal in the event that this spell caused the game over modal to render
      // before the stats were updated
      underworld.updateGameOverModal();
    }

    // Optimize: Cache blood after every cast
    cacheBlood();

    globalThis.animatingSpells = false;

    // Now that the previous spell is over, rerun predictions because
    // the player may have queued up another spell while the previous spell was
    // executing and they'll need to see the prediction for that next spell
    // Note: This must be invoked AFTER animatingSpells is set to false or else
    // it will short-circuit
    runPredictions(underworld);
  } else {
    console.log('Someone is trying to cast out of turn');
  }
}

export function setupNetworkHandlerGlobalFunctions(overworld: Overworld) {
  globalThis.configPlayer = ({ color, colorMagic, name, lobbyReady }: { color?: number, colorMagic?: number, name?: string, lobbyReady?: boolean }) => {
    if (color !== undefined) {
      storage.set(storage.STORAGE_ID_PLAYER_COLOR, color);
    }
    if (color !== undefined) {
      storage.set(storage.STORAGE_ID_PLAYER_COLOR_MAGIC, colorMagic);
    }
    let capped_name = name;
    if (capped_name !== undefined) {
      capped_name = capped_name.slice(0, 70);
      storage.set(storage.STORAGE_ID_PLAYER_NAME, capped_name || '');
    }
    overworld.pie.sendData({
      type: MESSAGE_TYPES.PLAYER_CONFIG,
      color,
      colorMagic,
      name: capped_name,
      lobbyReady
    });
  }


  globalThis.getAllSaveFiles = () => Object.keys(localStorage).filter(x => x.startsWith(globalThis.savePrefix)).map(x => x.substring(globalThis.savePrefix.length));

  // Returns '' if save is successful,
  // otherwise returns error message
  globalThis.save = async (title: string, forceOverwrite?: boolean): Promise<string> => {
    const { underworld } = overworld;
    if (!underworld) {
      const err = 'Cannot save game, underworld does not exist';
      console.error(err);
      return err;
    }
    // Wait till existing forceMoves are complete to save
    await underworld.awaitForceMoves()
    if (underworld.turn_phase != turn_phase.PlayerTurns) {
      globalThis.saveASAP = title;
      return 'Game will be saved at the start of your next turn.';
    }

    // Prompt overwrite, don't allow for saving multiple saves with the same name
    if (getAllSaveFiles && !forceOverwrite) {

      const allSaveFiles = getAllSaveFiles();
      // A safe file key consists of a prefix, a timestamp and a wordTitle, find and compare the word titles
      // the timestamp exists to sort them by recency.
      const isolateWordsInTitle = (title: string) => title.split('-').slice(-1)?.[0] || '';
      const conflictingSaveTitles = allSaveFiles.filter(otherSaveFileKey => {
        const titleWords = isolateWordsInTitle(otherSaveFileKey);
        return titleWords == isolateWordsInTitle(title);
      });
      if (conflictingSaveTitles.length) {
        const doOverwrite = await Jprompt({ text: 'There is a previous save file with this name, are you sure you want to overwrite it?', yesText: 'Yes, Overwrite it', noBtnText: 'Cancel', noBtnKey: 'Escape', forceShow: true })
        if (doOverwrite) {
          conflictingSaveTitles.forEach(otherTitle => {
            storage.remove(globalThis.savePrefix + otherTitle);
          });
        } else {
          console.log('Save cancelled');
          return 'Save Cancelled';
        }

      }
    }

    if (underworld.forceMove.length) {
      console.error('Attempting to save before resolving all forceMoves');
    }
    const saveObject: SaveFile = {
      version: globalThis.SPELLMASONS_PACKAGE_VERSION,
      underworld: underworld.serializeForSaving(),
      phase: underworld.turn_phase,
      pickups: underworld.pickups.filter(p => !p.flaggedForRemoval).map(Pickup.serialize),
      units: underworld.units.filter(u => !u.flaggedForRemoval).map(Unit.serialize),
      players: underworld.players.map(Player.serialize),
      numberOfHotseatPlayers
    };
    try {
      storage.set(
        globalThis.savePrefix + title,
        JSON.stringify(saveObject),
      );
      // Successful save should clear saveASAP
      globalThis.saveASAP = undefined;
      // Empty string means "No error, save successful"
      return '';
    } catch (e) {
      // @ts-ignore
      if (e.message && e.message.includes('exceeded the quota')) {
        return i18n('failed to save') + '\n' + i18n('too many save files');
      }
      console.error('Failed to save', e);
      return i18n('failed to save');
    }
  };
  globalThis.deleteSave = async (title: string) => {
    const doDelete = await Jprompt({ text: 'Are you sure you want to delete this save file?', yesText: 'Yes', noBtnText: 'No', noBtnKey: 'Escape', forceShow: true })
    if (doDelete) {
      storage.remove(globalThis.savePrefix + title);
    }
  }
  globalThis.load = async (title: string) => {
    const savedGameString = storage.get(globalThis.savePrefix + title);
    if (savedGameString) {
      let fileSaveObj = undefined;
      try {
        fileSaveObj = JSON.parse(savedGameString);
      } catch (e) {
        // Log, not error because some users modify save files
        console.log(e);
        Jprompt({
          text: `The save file appears to be corrupted.`,
          yesText: 'Okay',
          forceShow: true
        });
        return;
      }
      if (globalThis.player == undefined) {
        console.log('LOAD: connectToSingleplayer in preparation for load');
        if (globalThis.connectToSingleplayer) {
          await globalThis.connectToSingleplayer();
        } else {
          console.error('Unexpected: Attempting to load but globalThis.connectToSingleplayer is undefined');
        }
      }

      const { underworld: savedUnderworld, phase, units, players, pickups, version, numberOfHotseatPlayers } = fileSaveObj as SaveFile;
      if (numberOfHotseatPlayers !== undefined) {
        globalThis.numberOfHotseatPlayers = numberOfHotseatPlayers;
      }
      if (version !== globalThis.SPELLMASONS_PACKAGE_VERSION) {
        Jprompt({
          text: `This save file is from a previous version of the game and may not run as expected.
Save file version: ${version}.
Current game version: ${globalThis.SPELLMASONS_PACKAGE_VERSION}`,
          yesText: 'Okay',
          forceShow: true
        });
      }
      // If connected to a multiplayer server
      if (globalThis.player && !isSinglePlayer() && overworld.underworld) {
        // Cannot load a game if a player is already playing, can only load games if the game has not started yet
        if (overworld.underworld.players.some(p => p.isSpawned)) {
          console.log('Cannot load multiplayer game over a game that is ongoing.')
          Jprompt({
            text: 'You cannot overwrite an ongoing game with a saved game - if you wish to load a multiplayer game, do so from a new lobby.',
            yesText: 'Okay',
            forceShow: true
          });
          return;
        }
      }
      if (globalThis.player && isSinglePlayer()) {
        if (!globalThis.clientId) {
          console.error('Attempted to load a game with no globalThis.clientId')
          Jprompt({
            text: 'Error: Failed to load game, try restarting.',
            yesText: 'Okay',
            forceShow: true
          });
          return;
        }
        const firstPlayer = players[0];
        if (firstPlayer) {
          // Assume control of the existing single player in the load file
          firstPlayer.clientId = globalThis.clientId;
        } else {
          console.error('Attempted to load a game with no players in it.')
          Jprompt({
            text: 'Error: Attempted to load a game with no players in it.',
            yesText: 'Okay',
            forceShow: true
          });
          return;

        }
      }
      console.log('LOAD: send LOAD_GAME_STATE');
      overworld.pie.sendData({
        type: MESSAGE_TYPES.LOAD_GAME_STATE,
        underworld: savedUnderworld,
        pickups,
        phase,
        units,
        players
      });
      setView(View.Game);

    } else {
      console.error('no save game found with title', title);
    }
  };

  globalThis.exitCurrentGame = function exitCurrentGame(): Promise<void> {
    // Go back to the main PLAY menu
    globalThis.setMenu?.('PLAY');
    if (overworld.underworld) {
      overworld.underworld.cleanup();
    }
    // This prevents 'esc' key from going "back" to viewGame after the underworld is cleaned up
    clearLastNonMenuView();
    // Ensure the menu is open
    setView(View.Menu);
    intentionalDisconnect = true;
    return typeGuardHostApp(overworld.pie) ? Promise.resolve() : overworld.pie.disconnect();
  }
}
export interface SaveFile {
  version: string;
  underworld: IUnderworldSerialized;
  phase: turn_phase.PlayerTurns;
  pickups: Pickup.IPickupSerialized[];
  units: Unit.IUnitSerialized[];
  players: Player.IPlayerSerialized[];
  numberOfHotseatPlayers: number;
}