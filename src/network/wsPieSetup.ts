// Note: headless server MUST NOT import this file because @websocketpie/client is a browser only package
// If you get something like the following error:
// C:\git\Golems\node_modules\@websocketpie\client\dist\src\PieClient.js:10
// import { MessageType } from './enums';
// ^^^^^^

// SyntaxError: Cannot use import statement outside a module
// Trace the imports for headless server and you will find that somewhere this file
// is imported.

import PieClient, { Room } from '@websocketpie/client';
import { onData } from './networkHandler';
import { getVersionInequality, onClientPresenceChanged, typeGuardHostApp } from './networkUtil';
import { setView, View } from '../views';
import * as storage from '../storage';
import { updateGlobalRefToCurrentClientPlayer } from '../entity/Player';
import Underworld from '../Underworld';
import { version } from '../../package.json';
import makeOverworld, { Overworld } from '../Overworld';
import { MESSAGE_TYPES } from '../types/MessageTypes';
import { isSinglePlayer } from '../types/commonTypes';
// Locally hosted, locally accessed
// const wsUri = 'ws://localhost:8080';
// Locally hosted, available to LAN (use your own IP)
//const wsUri = 'ws://192.168.0.19:8080';
// Locally hosted, externally accessed (use your own IP)
// const wsUri = 'ws://68.48.199.138:7337';
// Current digital ocean wsPie app:
// const wsUri = 'wss://orca-app-99xgk.ondigitalocean.app/';
function connect_to_wsPie_server(wsUri: string | undefined, overworld: Overworld): Promise<void> {
  const pie = overworld.pie;
  if (typeGuardHostApp(pie)) {
    console.error('This file should only ever be used with the client, never with the Headless Server');
    return Promise.reject();
  }
  addHandlers(pie, overworld);
  return new Promise<void>((resolve, reject) => {
    const storedClientId = localStorage.getItem('pie-clientId');
    pie.onConnectInfo = (o) => {
      console.log('onConnectInfo', o);
      if (o.connected) {
        console.log("Pie: Successfully connected to PieServer.")
        // If connection is restored after unexpected disconnection
        if (view == View.Disconnected) {
          // Always return to the menu on a disconnect so that the player can choose to reload the auto save
          // if the disconnect was due to the server
          setView(View.Menu);
        }
        resolve();
      } else {
        const elVersionInfoHeadless = document.getElementById('version-info-headless-server')
        if (elVersionInfoHeadless) {
          elVersionInfoHeadless.innerHTML = '';
        }
        if (view == View.Game) {
          setView(View.Disconnected);
          // pie IS PieClient because wsPieSetup is only called in the context of the client
          if (!globalThis.headless) {
            // Change menu state so that when player reconnects they will be in the lobby
            // so they can choose to reload the backup save
            if (globalThis.player) {
              globalThis.setMenu?.('MULTIPLAYER_SERVER_CHOOSER');
              globalThis.player.lobbyReady = false;
            }
            if (globalThis.save) {
              const backupSaveName = `backup ${(overworld.pie as PieClient).currentRoomInfo?.name || ''}`
              globalThis.save(`${Date.now().toString()}-${backupSaveName}`, true);
              Jprompt({ text: 'Game auto saved: "' + backupSaveName + '"', yesText: 'Okay', forceShow: true });
            }
          }
          if (overworld.underworld) {
            // Allow forcing receiving a new init_game_state since after disconnect
            // a user will be out of sync with the server
            overworld.underworld.allowForceInitGameState = true;
          }
        }
      }
    };
    if (wsUri) {
      console.log(`Pie: Connecting to ${wsUri} with clientId ${storedClientId}`)
      pie.connect(wsUri + (storedClientId ? `?clientId=${storedClientId}` : ''), true).catch(() => {
        console.error('Unable to connect to server.  Please check the wsURI. The protocol should be wss:// or ws://');
        reject('Unable to connect to server at ' + wsUri);
      }).then(() => {
        console.log(`Pie: Connection to server ${wsUri} succeeded`);
        resolve();
      });
    } else {
      pie.connectSolo().then(() => {
        resolve();
      });
    }
  });
}

let maxClients = 8;
function defaultRoomInfo(_room_info = {}): Room {
  const room_info = Object.assign({
    name: 'Default Lobby',
    app: 'Spellmasons',
    version: globalThis.SPELLMASONS_PACKAGE_VERSION,
    maxClients,
  }, _room_info);
  maxClients = room_info.maxClients;
  return room_info;
}

export function joinRoom(overworld: Overworld, _room_info = {}): Promise<void> {
  if (!overworld.pie) {
    console.error('Could not join room, pie instance is undefined');
    return Promise.reject();
  }
  const pie = overworld.pie;
  if (typeGuardHostApp(pie)) {
    console.error('wsPieSetup is for client only, not host app. This function should never be called with a pie of IHostApp');
    return Promise.reject();
  }
  const room_info = defaultRoomInfo(_room_info);
  // Lowercase room name so capitalization won't cause confusion
  // when people are trying to join each other's games
  room_info.name = room_info.name.toLowerCase();
  // Create a new underworld to sync with the payload so that no old state carries over
  const underworld = new Underworld(overworld, overworld.pie, Math.random().toString());
  if (isSinglePlayer(globalThis.clientId)) {
    // set mods:
    underworld.activeMods = globalThis.activeMods || [];
    console.log('Mods: set active mods', underworld.activeMods);
  }
  return pie.joinRoom(room_info, true).then(() => {
    console.log('Pie: You are now in the room', JSON.stringify(room_info, null, 2));
    // Useful for development to get into the game quickly
    let quickloadName = storage.get('quickload');
    if (quickloadName) {
      console.log('ADMIN: quickload:', quickloadName);
      globalThis.load?.(quickloadName);
    } else {
      // All clients should join at the CharacterSelect screen so they can
      // choose their character.  Once they choose their character their
      // Player entity is created and then the messageQueue can begin processing
      // including LOAD_GAME_STATE.
      // --
      // Note: This must occur AFTER PIXI assets are done being loaded
      // or else the characters to select wont display
      // setView(View.CharacterSelect);
      // FUTURE: THis might be a good place to view the lobby
    }
  }).catch((err: string) => {
    console.error('wsPieSetup: Failed to join room:', err);
    return Promise.reject(err);
  });
}

function addHandlers(pie: PieClient, overworld: Overworld) {
  pie.onServerAssignedData = (o) => {
    console.log('Pie: set globalThis.clientId:', o.clientId, o);
    // The headless server's version
    const elVersionInfoHeadless = document.getElementById('version-info-headless-server')
    if (elVersionInfoHeadless) {
      if (o?.hostAppVersion) {
        elVersionInfoHeadless.innerText = `Server v${o.hostAppVersion}`;
        // Log error if client and server versions are minor or major out of sync:
        const versionInequality = getVersionInequality(globalThis.SPELLMASONS_PACKAGE_VERSION, o.hostAppVersion);
        if (versionInequality !== 'equal' && versionInequality !== 'malformed') {
          const explainUpdateText = versionInequality == 'client behind' ? 'Please reboot Steam to get the latest Version of Spellmasons' : 'This server is scheduled to update soon to the latest version.';
          Jprompt({
            text: `Server and Game versions are out of sync.
<pre>
Server: ${o.hostAppVersion}
Client: ${globalThis.SPELLMASONS_PACKAGE_VERSION}
</pre>
${explainUpdateText}
`, yesText: "Disconnect", forceShow: true
          }).then(() => {
            pie.disconnect();
            globalThis.syncConnectedWithPieState();
          });
        }
      } else {
        elVersionInfoHeadless.innerText = '';
      }
    }
    if (o?.hostAppVersion !== version) {
      console.warn('Host app version does not match client version');

    }
    globalThis.clientId = o.clientId;
    if (overworld.underworld) {
      const selfPlayer = overworld.underworld.players.find(p => p.clientId == globalThis.clientId);
      if (selfPlayer) {
        updateGlobalRefToCurrentClientPlayer(selfPlayer, overworld.underworld);
      }
    }
    if (globalThis.allowCookies) {
      // Only store clientId if it is from a multiplayer session
      // 'solomode_client_id' comes from pieclient's solo mode
      if (!isSinglePlayer(o.clientId)) {
        localStorage.setItem('pie-clientId', o.clientId);
      }
    }
  };
  pie.onData = d => onData(d, overworld);
  pie.onError = ({ message }: { message: any }) => console.warn('wsPie Error:', message);
  pie.onClientPresenceChanged = c => onClientPresenceChanged(c, overworld);
  pie.onLatency = (l) => {
    if (globalThis.latencyPanel) {
      globalThis.latencyPanel.update(l.average, l.max);
    }
  };
}

export function setupPieAndUnderworld() {
  if (globalThis.headless) {
    console.error('wsPieSetup is only for browser clients and should not be invoked from headless server.')
    return;
  } else {
    console.log('Client: Initialize PieClient');
    const pie = new PieClient();
    // useStats must be true for latency information to come through
    pie.useStats = true;
    console.log('Client: Initialize Underworld');
    const overworld = makeOverworld(pie);
    globalThis.connect_to_wsPie_server = wsUri => connect_to_wsPie_server(wsUri, overworld);
    globalThis.isConnected = pie.isConnected.bind(pie);
    globalThis.pieDisconnect = pie.disconnect.bind(pie);
    globalThis.saveActiveMods = (activeMods: string[]) => {
      // Persist to storage
      if (globalThis.setOption) {
        globalThis.setOption(
          "activeMods",
          globalThis.activeMods
        );
      }
      console.log('Pie: setting active mods');
      pie.sendData({ type: MESSAGE_TYPES.SET_MODS, activeMods });
    }
    globalThis.pieLeaveRoom = () => {
      globalThis.exitCurrentGame?.();
      pie.leaveRoom();
    }
    globalThis.pieInhabitPlayer = (asPlayerClientId: string) => {
      pie.sendData({
        type: MESSAGE_TYPES.JOIN_GAME_AS_PLAYER,
        asPlayerClientId
      });
    }

    globalThis.joinRoom = room_info => joinRoom(overworld, room_info);
    function connectToSingleplayer() {
      document.body?.classList.toggle('loading', true);
      return new Promise<void>((resolve) => {
        // setTimeout allows the UI to refresh before locking up the CPU with
        // heavy level generation code
        setTimeout(() => {
          connect_to_wsPie_server(undefined, overworld).then(() => {
            joinRoom(overworld).then(resolve);
          })
        }, 10)
      });

    }
    globalThis.connectToSingleplayer = connectToSingleplayer;
    globalThis.startSingleplayer = function startSingleplayer(numberOfHotseatPlayers: number) {
      console.log('Start Game: Attempt to start the game')
      globalThis.numberOfHotseatPlayers = numberOfHotseatPlayers;
      return connectToSingleplayer().then(() => {
        // Create first level
        if (overworld.underworld) {
          overworld.underworld.lastLevelCreated = overworld.underworld.generateLevelDataSyncronous(0);
        } else {
          console.error('Overworld does not have underworld, cannot setup first level');
        }
        // Go directly into the game
        setView(View.Game);
      });
    }
    globalThis.setMenu?.('PLAY');
    setView(View.Menu);
  }
}