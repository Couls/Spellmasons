import type * as PIXI from 'pixi.js';
import * as Image from '../graphics/Image';
import type * as Player from './Player';
import { addPixiSprite, addPixiSpriteAnimated, containerUnits, pixiText, startBloodParticleSplatter } from '../graphics/PixiUtils';
import { syncPlayerHealthManaUI, IUnit, takeDamage, playAnimation } from './Unit';
import { checkIfNeedToClearTooltip } from '../graphics/PlanningView';
import { MESSAGE_TYPES } from '../types/MessageTypes';
import * as config from '../config';
import { clone, Vec2 } from '../jmath/Vec';
import { MultiColorReplaceFilter } from '@pixi/filter-multi-color-replace';
import { manaBlue, manaDarkBlue, stamina } from '../graphics/ui/colors';
import Underworld from '../Underworld';
import { hasBloodCurse } from '../cards/blood_curse';
import { HasSpace } from './Type';
import { explain, EXPLAIN_INVENTORY, EXPLAIN_OVERFILL, tutorialCompleteTask, updateTutorialChecklist } from '../graphics/Explain';
import * as CardUI from '../graphics/ui/CardUI';
import { bossmasonUnitId } from './units/deathmason';
import { chooseOneOfSeeded, getUniqueSeedString } from '../jmath/rand';
import { skyBeam } from '../VisualEffects';
import { BLUE_PORTAL_JID, makeCursedEmitter, makeDeathmasonPortal, RED_PORTAL_JID, stopAndDestroyForeverEmitter } from '../graphics/ParticleCollection';
import { Localizable } from '../localization';
import seedrandom from 'seedrandom';
import { JEmitter } from '../types/commonTypes';
import { raceTimeout } from '../Promise';
import { createVisualLobbingProjectile } from './Projectile';
import floatingText from '../graphics/FloatingText';
import { containerParticles } from '../graphics/Particles';
import { elEndTurnBtn } from '../HTMLElements';

export const PICKUP_RADIUS = config.SELECTABLE_RADIUS;
export const PICKUP_IMAGE_PATH = 'pickups/scroll';
export const RED_PORTAL = 'Red Portal';
export const BLUE_PORTAL = 'Blue Portal';
export const CURSED_MANA_POTION = 'Cursed Mana Potion';
const RED_PORTAL_DAMAGE = 30;
type IPickupEffect = ({ unit, player, pickup, prediction }: { unit?: IUnit; player?: Player.IPlayer, pickup: IPickup, underworld: Underworld, prediction: boolean }) => void;
type IPickupInit = ({ pickup, underworld }: { pickup: IPickup, underworld: Underworld }) => void;
type IPickupWillTrigger = ({ unit, player, pickup }: { unit?: IUnit; player?: Player.IPlayer, pickup: IPickup, underworld: Underworld }) => boolean;
export function isPickup(maybePickup: any): maybePickup is IPickup {
  return maybePickup && maybePickup.type == 'pickup';
}
export type IPickup = HasSpace & {
  type: 'pickup';
  id: number;
  name: string;
  description: Localizable;
  imagePath?: string;
  image?: Image.IImageAnimated;
  // if this IPickup is a prediction copy, real is a reference to the real pickup that it is a copy of
  real?: IPickup;
  // Only can be picked up by players
  playerOnly: boolean;
  // Pickups optionally have a "time limit" and will disappear after this many turns
  turnsLeftToGrab?: number;
  text?: PIXI.Text;
  // effect is ONLY to be called within triggerPickup
  // returns true if the pickup did in fact trigger - this is useful
  // for preventing one use health potions from triggering if the unit
  // already has max health
  effect: IPickupEffect;
  // Determines if the pickup will trigger for a given unit
  willTrigger: IPickupWillTrigger;
  emitter?: JEmitter;
  // Identifier for serailized emitter
  emitterJID?: string;
  flaggedForRemoval: boolean;

}
export interface IPickupSource {
  name: string;
  // If a pickup belongs to a mod, it's modName will be automatically assigned
  // This is used to dictate wether or not the modded pickup is used
  modName?: string;
  description: Localizable;
  imagePath?: string;
  animationSpeed?: number;
  playerOnly?: boolean;
  turnsLeftToGrab?: number;
  scale: number;
  probability: number;
  init?: IPickupInit;
  effect: IPickupEffect;
  willTrigger: IPickupWillTrigger;
}
export function copyForPredictionPickup(p: IPickup): IPickup {
  // Remove image and text since prediction pickups won't be rendered
  const { image, text, ...rest } = p;
  if (p.id > lastPredictionPickupId) {
    lastPredictionPickupId = p.id;
  }
  return {
    real: p,
    ...rest
  }
}
export const TIME_CIRCLE_JID = 'timeCircle';

// This does not need to be unique to underworld, it just needs to be unique
let lastPredictionPickupId = 0;
// Creates a pickup directly (as opposed to via a network message)
// Sometimes clients need to call this directly, like if they got
// pickup info from a sync from the host or loading a pickup
// or for a prediction pickup
export function create({ pos, pickupSource, idOverride, logSource }:
  {
    pos: Vec2, pickupSource: IPickupSource, idOverride?: number, logSource?: string,
  }, underworld: Underworld, prediction: boolean): IPickup {
  const { name, description, imagePath, effect, willTrigger, scale, animationSpeed, playerOnly = false, turnsLeftToGrab } = pickupSource;
  const { x, y } = pos
  if (isNaN(x) || isNaN(y)) {
    console.error('Unexpected: Created pickup at NaN', pickupSource.name);
  }
  if (idOverride !== undefined) {
    underworld.lastPickupId = idOverride;
  }
  const id = idOverride !== undefined
    ? idOverride
    : prediction
      ? ++lastPredictionPickupId
      : ++underworld.lastPickupId;
  const duplicatePickup = (prediction ? underworld.pickupsPrediction : underworld.pickups).find(p => p.id == id)
  if (duplicatePickup) {
    if (prediction) {
      console.log('Pickup ids', underworld.pickupsPrediction.map(p => p.id), id, 'incrementor:', lastPredictionPickupId, 'prediction:', prediction);
    } else {
      console.log('Pickup ids', underworld.pickups.map(p => p.id), id, 'incrementor:', underworld.lastPickupId, 'prediction:', prediction);
    }
    console.error('Aborting: creating a pickup with duplicate id.');
    console.error(`Aborting: creating a pickup with duplicate id. source: ${logSource} idOverride: ${!!idOverride} prediction: ${prediction}`);
    if (duplicatePickup.name != name) {
      console.error('Duplicate pickup is over a different name', duplicatePickup.name, name);
    }
    return duplicatePickup;
  }
  const self: IPickup = {
    id,
    type: 'pickup',
    x,
    y,
    radius: PICKUP_RADIUS,
    name,
    immovable: true,
    inLiquid: false,
    description,
    imagePath,
    // Pickups are stored in containerUnits so that they
    // will be automatically z-indexed
    image: (!imagePath || !containerUnits || prediction) ? undefined : Image.create({ x, y }, imagePath, containerUnits, { animationSpeed, loop: true }),
    playerOnly,
    effect,
    willTrigger,
    flaggedForRemoval: false,
    beingPushed: false
  };
  if (self.image) {
    self.image.sprite.scale.x = scale;
    self.image.sprite.scale.y = scale;
  }
  if (name == RED_PORTAL) {
    // Right now red portal and cursed mana potion are the only pickup that uses an emitter;
    // however if that changes in the future this should be refactored so
    // that there isn't a special case inside of Pickup.create
    assignEmitter(self, RED_PORTAL_JID, prediction, underworld);
  } else if (name == BLUE_PORTAL) {
    // Right now red portal and cursed mana potion are the only pickup that uses an emitter;
    // however if that changes in the future this should be refactored so
    // that there isn't a special case inside of Pickup.create
    assignEmitter(self, BLUE_PORTAL_JID, prediction, underworld);
  } else if (name == CURSED_MANA_POTION) {
    assignEmitter(self, CURSED_MANA_POTION, prediction, underworld);
  }

  if (turnsLeftToGrab) {
    self.turnsLeftToGrab = turnsLeftToGrab;

    // Only add timeCircle and text if the pickup has an image (meaning it is rendered)
    // Prediction pickups are not rendered and don't need these.
    if (self.image) {
      const timeCircle = addPixiSprite('time-circle.png', self.image.sprite);
      if (timeCircle) {
        // @ts-ignore jid is a custom identifier to id the text element used for the player name
        timeCircle.jid = TIME_CIRCLE_JID;
        timeCircle.anchor.x = 0;
        timeCircle.anchor.y = 0;
      }

      addText(self);
    }
  }
  if (pickupSource.init) {
    pickupSource.init({ pickup: self, underworld });
  }

  underworld.addPickupToArray(self, prediction);
  // Ensure players get outstanding scroll pickups at the end of the level
  if (self) {
    // If pickup is a portal
    // make existing scroll pickups fly to player
    if (self.name == PORTAL_PURPLE_NAME) {
      let timeBetweenPickupFly = 100;
      const scrolls = underworld.pickups.filter(p => p.name == CARDS_PICKUP_NAME && !p.flaggedForRemoval);
      for (let scroll of scrolls) {
        removePickup(scroll, underworld, false);
      }
      scrolls.map(pickup => {
        return raceTimeout(5000, 'spawnPortalFlyScrolls', new Promise<void>((resolve) => {
          timeBetweenPickupFly += 100;
          // Make the pickup fly to the player. this gives them some time so it doesn't trigger immediately.
          setTimeout(() => {
            if (pickup.image) {
              pickup.image.sprite.visible = false;
            }
            const flyingPickupPromises = [];
            for (let p of underworld.players) {
              flyingPickupPromises.push(createVisualLobbingProjectile(pickup, p.unit, pickup.imagePath))
            }
            Promise.all(flyingPickupPromises)
              .then(() => {
                underworld.players.forEach(p => givePlayerUpgrade(p, underworld));
                resolve();
              });
          }, timeBetweenPickupFly);
        }))
      });
    }

    // If there are existing portals and a pickup is spawned make pickups fly to player
    if (self.name == CARDS_PICKUP_NAME && underworld.pickups.some(p => p.name == PORTAL_PURPLE_NAME)) {
      removePickup(self, underworld, false);
      raceTimeout(5000, 'spawnScrollFlyScroll', new Promise<void>((resolve) => {
        // Make the pickup fly to the player. this gives them some time so it doesn't trigger immediately.
        setTimeout(() => {
          if (self) {
            if (self.image) {
              self.image.sprite.visible = false;
            }
            const flyingPickupPromises = [];
            for (let p of underworld.players) {
              flyingPickupPromises.push(createVisualLobbingProjectile(self, p.unit, self.imagePath))
            }
            Promise.all(flyingPickupPromises)
              .then(() => {
                underworld.players.forEach(p => givePlayerUpgrade(p, underworld));
                resolve();
              });
          }
        }, 100);
      }));
    }
  }

  return self;
}
function assignEmitter(pickup: IPickup, emitterId: string, prediction: boolean, underworld: Underworld) {
  if (prediction || globalThis.headless) {
    // Don't show if just a prediction
    return;
  }
  // If there's a previous emitter, remove it because it is about to be replaced
  if (pickup.emitter) {
    stopAndDestroyForeverEmitter(pickup.emitter);
  }
  if (emitterId == RED_PORTAL_JID) {
    pickup.emitter = makeDeathmasonPortal(pickup, prediction, '#520606', '#e03636');
    if (pickup.image) {
      if (pickup.emitter) {
        Image.cleanup(pickup.image);
      } else {
        // Use tinted portal image as backup in case emitters are limited
        // @ts-ignore: Special property to keep the tint of portals
        pickup.image.sprite.keepTint = 0xe43636;
        // @ts-ignore: Special property to keep the tint of portals
        pickup.image.sprite.tint = pickup.image.sprite.keepTint;
      }
    }
  } else if (emitterId == BLUE_PORTAL_JID) {
    pickup.emitter = makeDeathmasonPortal(pickup, prediction, '#1a276e', '#5252fa');
    if (pickup.image) {
      if (pickup.emitter) {
        Image.cleanup(pickup.image);
      } else {
        // Use tinted portal image as backup in case emitters are limited
        // @ts-ignore: Special property to keep the tint of portals
        pickup.image.sprite.keepTint = 0x5252fa;
        // @ts-ignore: Special property to keep the tint of portals
        pickup.image.sprite.tint = pickup.image.sprite.keepTint;
      }
    }
  } else if (emitterId == CURSED_MANA_POTION) {
    pickup.emitter = makeCursedEmitter(pickup, prediction);
  } else {
    console.error('Attempting to assignEmitter with unkown id:', emitterId);
  }
  if (pickup.emitter) {
    // Pickup emitters should not be cleaned up until they are intentionally destroyed
    pickup.emitter.cleanAfterTurn = false;
    if (containerParticles) {
      underworld.particleFollowers.push({
        displayObject: containerParticles,
        emitter: pickup.emitter,
        target: pickup
      });
    }
  }
  // @ts-ignore: jid custom property for serialization
  pickup.emitterJID = emitterId;
}
function addText(pickup: IPickup) {
  if (pickup.real) {
    // Pickup is a prediction copy and is not rendered.  This is known because it has a reference to
    // the real instance.
    return;
  }
  // Value of text is set in sync()
  pickup.text = pixiText('', { fill: 'white', align: 'center', ...config.PIXI_TEXT_DROP_SHADOW });
  sync(pickup);
  if (pickup.text) {
    pickup.text.anchor.x = 0;
    pickup.text.anchor.y = 0;
    // Center the text in the timeCircle
    pickup.text.x = 13;
    pickup.text.y = 5;
    if (pickup.image) {
      pickup.image.sprite.addChild(pickup.text);
    } else {
      console.error('Cannot add text to pickup, image is missing')
    }
  }

}

export function sync(pickup: IPickup) {
  if (pickup.image) {
    pickup.image.sprite.x = pickup.x;
    pickup.image.sprite.y = pickup.y;
  }
  if (pickup.turnsLeftToGrab !== undefined && pickup.text) {
    pickup.text.text = `${pickup.turnsLeftToGrab}`;
  }
}
export function setPosition(pickup: IPickup, x: number, y: number) {
  pickup.x = x;
  pickup.y = y;
  Image.setPosition(pickup.image, { x, y });
}
export type IPickupSerialized = Omit<IPickup, "image" | "effect" | "text" | "real" | "emitter"> & {
  image?: Image.IImageAnimatedSerialized,
  emitter?: string
};
export function serialize(p: IPickup): IPickupSerialized {
  // effect is a callback and cannot be serialized
  // real is a reference to self if self is not a prediction copy and cannot be serialized
  // because it would be cyclical
  const { effect, text, real, emitter, ...rest } = p;
  const serialized: IPickupSerialized = {
    ...rest,
    image: p.image ? Image.serialize(p.image) : undefined,
    // @ts-ignore: jid custom property for serialization
    emitter: emitter?.jid
  };
  return serialized;
}
// Reinitialize a pickup from another pickup object, this is used in loading game state after reconnect
export function load(pickup: IPickupSerialized, underworld: Underworld, prediction: boolean): IPickup | undefined {
  // Get the pickup object
  let foundPickup = pickups.find((p) => p.name == pickup.name);
  if (foundPickup) {
    // Note, emitter but be desctructured here or else it will clobber
    // newPickups emitter during Object.assign without removing it
    const { image, flaggedForRemoval, emitter, ...toCopy } = pickup;
    if (flaggedForRemoval) {
      // Do not create a pickup that has been removed
      console.error('Attempted to Load a pickup that is flaggedForRemoval');
      return undefined;
    }
    const newPickup = create({ pos: pickup, pickupSource: foundPickup, idOverride: pickup.id }, underworld, prediction);
    // Note: It is important here to use Object.assign so that the pickup reference is the SAME ref as is created in the
    // create function because the create function passes that ref to the underworld pickups array.
    // So when you mutate the properties, the ref must stay the same.
    Object.assign(newPickup, toCopy);
    if (!prediction) {
      addText(newPickup);
    }
    if (newPickup.emitter && newPickup.emitterJID) {
      assignEmitter(newPickup, newPickup.emitterJID, prediction, underworld);
    }
    return newPickup;
  } else {
    console.error('Could not load pickup with path', pickup.imagePath);
    return undefined;
  }
}
export function removePickup(pickup: IPickup, underworld: Underworld, prediction: boolean) {
  pickup.flaggedForRemoval = true;
  Image.cleanup(pickup.image);
  stopAndDestroyForeverEmitter(pickup.emitter);
  checkIfNeedToClearTooltip();
  // Remove any associated forcePushs
  const fms = (prediction ? underworld.forceMovePrediction : underworld.forceMove).filter(fm => fm.pushedObject == pickup)
  if (fms.length) {
    // set the associated forceMove to velocity of 0 so it will be removed at the next invocation of runForceMove
    fms.forEach(fm => { fm.velocity = { x: 0, y: 0 } });
  }
}
export function triggerPickup(pickup: IPickup, unit: IUnit, player: Player.IPlayer | undefined, underworld: Underworld, prediction: boolean) {
  const willTrigger = !pickup.flaggedForRemoval && unit.alive && pickup.willTrigger({ unit, player, pickup, underworld });
  if (willTrigger) {
    pickup.effect({ unit, player, pickup, underworld, prediction });
    // Removal all pickups when they are "picked up", unless it is
    // the Purple Portal.  This is because in multiplayer, it's possible
    // for a player to trigger multiple portals at once, leaving the other
    // player stranded.  This ensures that portals are not removed when
    // used but all other pickups should be.  If, in the future, there's
    // another pickup that shouldn't be removed when used, this behavior
    // should be refactored into a property on IPickup
    if (pickup.name !== PORTAL_PURPLE_NAME) {
      removePickup(pickup, underworld, prediction);
    }
    // Now that the players attributes may have changed, sync UI
    syncPlayerHealthManaUI(underworld);
  }
}
export function tryTriggerPickup(pickup: IPickup, unit: IUnit, underworld: Underworld, prediction: boolean) {
  if (pickup.flaggedForRemoval) {
    // Don't trigger pickup if flagged for removal
    return;
  }
  if (!unit.alive) {
    // Only living units can trigger pickups
    return;
  }
  const player = underworld.players.find((p) => p.unit === unit);
  if (pickup.playerOnly && !player) {
    // If pickup is playerOnly, do not trigger if a player is not the one triggering it
    return;
  }
  if (player && !player.isSpawned) {
    // Don't trigger pickups for players that haven't spawned yet
    // (and are looking for a spawn my moving their "ghost self" around)
    return;
  }
  if (prediction) {
    triggerPickup(pickup, unit, player, underworld, prediction);
  } else {
    // All pickups triggering must be networked to prevent desyncs resulting 
    // from slight position differences that can result in cascading desyncs due to
    // a pickup triggering on one client or host but not on others.
    // Server (or singleplayer as host) initiates all pickups
    if (globalThis.isHost(underworld.pie)) {
      // Try a prediction effect to see if it will trigger and
      // only send QUEUE_PICKUP_TRIGGER if it will trigger
      const willTrigger = pickup.willTrigger({ unit, player, pickup, underworld });
      if (willTrigger) {
        triggerPickup(pickup, unit, player, underworld, prediction);
        // send QUEUE_PICKUP_TRIGGER network message to make sure the same pickup gets triggered
        // on any other client that may have missed this collision
        underworld.pie.sendData({
          type: MESSAGE_TYPES.QUEUE_PICKUP_TRIGGER,
          pickupId: pickup.id,
          pickupName: pickup.name,
          unitId: unit.id,
          playerClientId: player?.clientId
        });
      }
    } else {
      // Trigger if in queue
      const pickupInQueue = underworld.aquirePickupQueue.find(x => x.pickupId == pickup.id && x.unitId == unit.id);
      if (pickupInQueue) {
        pickupInQueue.flaggedForRemoval = true;
        triggerPickup(pickup, unit, player, underworld, prediction);
      } else {
        const willTrigger = !pickup.flaggedForRemoval && unit.alive && pickup.willTrigger({ unit, player, pickup, underworld });
        // Do not send FORCE_TRIGGER_PICKUP if the pickup won't trigger, for example, health potions
        // don't trigger if you are full health
        if (willTrigger) {
          // Unit has touched pickup before headless has, so force trigger it
          // This happens when unit is walking as opposed to being pushed
          console.log(`Unit touched pickup before headless has: ${pickup.name}, ${unit.id}, ${player?.name}`)
          // Only send a FORCE_TRIGGER_PICKUP message if the unit is the client's own player unit or a non player unit
          if (!player || player && globalThis.player == player) {
            underworld.pie.sendData({
              type: MESSAGE_TYPES.FORCE_TRIGGER_PICKUP,
              pickupId: pickup.id,
              pickupName: pickup.name,
              unitId: unit.id,
              playerClientId: player?.clientId
            });
          }
        }

      }
    }
  }
}

const manaPotionRestoreAmount = 40;
const healthPotionRestoreAmount = 50;
export const spike_damage = 30;
export const CARDS_PICKUP_NAME = 'Spells';
export const PICKUP_SPIKES_NAME = 'Trap';
export const PORTAL_PURPLE_NAME = 'Portal';
const cursedManaPotionRemovalProportion = 0.1;
export const pickups: IPickupSource[] = [
  {
    imagePath: 'pickups/trap',
    animationSpeed: -config.DEFAULT_ANIMATION_SPEED,
    playerOnly: false,
    name: PICKUP_SPIKES_NAME,
    probability: 40,
    scale: 1,
    description: ['Deals 🍞 to any unit that touches it', spike_damage.toString()],
    willTrigger: ({ unit, player, pickup, underworld }) => {
      return !!unit;
    },
    effect: ({ unit, player, pickup, prediction, underworld }) => {
      if (unit) {
        // Play trap spring animation
        if (!prediction) {
          const animationSprite = addPixiSpriteAnimated('pickups/trapAttack', containerUnits, {
            loop: false,
            animationSpeed: 0.2,
            onComplete: () => {
              if (animationSprite?.parent) {
                animationSprite.parent.removeChild(animationSprite);
              }
            }
          });
          if (animationSprite) {

            animationSprite.anchor.set(0.5);
            animationSprite.x = pickup.x;
            animationSprite.y = pickup.y;
          }
          const animationSprite2 = addPixiSpriteAnimated('pickups/trapAttackMagic', containerUnits, {
            loop: false,
            animationSpeed: 0.2,
            onComplete: () => {
              if (animationSprite2?.parent) {
                animationSprite2.parent.removeChild(animationSprite2);
              }
            }
          });
          if (animationSprite2) {
            animationSprite2.anchor.set(0.5);
            animationSprite2.x = pickup.x;
            animationSprite2.y = pickup.y;
          }

        }
        takeDamage(unit, spike_damage, unit, underworld, prediction)
      }
    }
  },
  {
    imagePath: 'portal',
    animationSpeed: -0.5,
    playerOnly: true,
    name: RED_PORTAL,
    probability: 0,
    scale: 1,
    description: ['red portal description', bossmasonUnitId, RED_PORTAL_DAMAGE.toString()],
    willTrigger: ({ unit, player, pickup, underworld }) => {
      return !!player;
    },
    effect: ({ unit, player, pickup, underworld }) => {
      const otherRedPortals = underworld.pickups.filter(p => !p.flaggedForRemoval && p.name == RED_PORTAL && p !== pickup)
      const seed = seedrandom(getUniqueSeedString(underworld, player));
      const randomOtherRedPortal = chooseOneOfSeeded(otherRedPortals, seed);
      if (player) {
        // Remove the pickups before teleporting the unit so they don't trigger
        // the 2nd portal
        removePickup(pickup, underworld, false);
        if (randomOtherRedPortal) {
          removePickup(randomOtherRedPortal, underworld, false);
          // Ensure the teleport point is valid
          // Note: pickup MUST be removed before checking if the point is valid because
          // isPointValidSpawn returns false if it's spawning a unit on a point taken up by a pickup
          // (that isn't flagged for removal)
          if (underworld.isPointValidSpawn(randomOtherRedPortal, config.COLLISION_MESH_RADIUS / 2)) {
            player.unit.x = randomOtherRedPortal.x;
            player.unit.y = randomOtherRedPortal.y;
            playSFXKey('swap');
            skyBeam(pickup);
            skyBeam(randomOtherRedPortal);
          } else {
          }
        }
        takeDamage(player.unit, RED_PORTAL_DAMAGE, undefined, underworld, false);
      }
    },
  },
  {
    imagePath: 'portal',
    animationSpeed: -0.5,
    playerOnly: true,
    name: BLUE_PORTAL,
    probability: 0,
    scale: 1,
    description: ['blue portal description', (RED_PORTAL_DAMAGE).toString()],
    willTrigger: ({ unit, player, pickup, underworld }) => {
      return !!player;
    },
    effect: ({ unit, player, pickup, underworld }) => {
      const otherBluePortals = underworld.pickups.filter(p => !p.flaggedForRemoval && p.name == BLUE_PORTAL && p !== pickup)
      const seed = seedrandom(getUniqueSeedString(underworld, player));
      const randomOtherBluePortal = chooseOneOfSeeded(otherBluePortals, seed);
      if (player) {
        // Remove the pickups before teleporting the unit so they don't trigger
        // the 2nd portal
        removePickup(pickup, underworld, false);
        if (randomOtherBluePortal) {
          removePickup(randomOtherBluePortal, underworld, false);
          // Ensure the teleport point is valid
          // Note: pickup MUST be removed before checking if the point is valid because
          // isPointValidSpawn returns false if it's spawning a unit on a point taken up by a pickup
          // (that isn't flagged for removal)
          if (underworld.isPointValidSpawn(randomOtherBluePortal, config.COLLISION_MESH_RADIUS / 2)) {
            player.unit.x = randomOtherBluePortal.x;
            player.unit.y = randomOtherBluePortal.y;
            skyBeam(pickup);
            skyBeam(randomOtherBluePortal);
          }
        }
        takeDamage(player.unit, -RED_PORTAL_DAMAGE, undefined, underworld, false);
      }
    },
  },
  {
    imagePath: 'portal',
    animationSpeed: -0.5,
    playerOnly: true,
    name: PORTAL_PURPLE_NAME,
    probability: 0,
    scale: 1,
    description: 'explain portal',
    willTrigger: ({ unit, player, pickup, underworld }) => {
      return !!player;
    },
    effect: ({ unit, player, underworld }) => {
      // Only send the ENTER_PORTAL message from
      // the client of the player that entered the portal
      if (player && player == globalThis.player) {
        underworld.pie.sendData({
          type: MESSAGE_TYPES.ENTER_PORTAL
        });
        CardUI.clearSelectedCards(underworld);
        tutorialCompleteTask('portal');
      }
      // Move the player unit so they don't continue to trigger the pickup more than once
      if (player && player.unit) {
        player.unit.resolveDoneMoving();
        player.unit.x = NaN;
        player.unit.y = NaN;
      }
    },
  },
  // {
  //   imagePath: PICKUP_IMAGE_PATH,
  //   name: CARDS_PICKUP_NAME,
  //   description: 'Pickup a spell scroll to get more spells',
  //   probability: 0,
  //   scale: 0.5,
  //   playerOnly: true,
  //   willTrigger: ({ unit, player, pickup, underworld }) => {
  //     return !!player;
  //   },
  //   effect: ({ unit, player, underworld }) => {
  //     // Give EVERY player an upgrade when any one player picks up a scroll
  //     underworld.players.forEach(p => givePlayerUpgrade(p, underworld));
  //     playSFXKey('levelUp');
  //   },
  // },
  {
    imagePath: 'pickups/staminaPotion',
    animationSpeed: 0.2,
    name: 'Stamina Potion',
    description: ['Restores stamina to 🍞', '100%'],
    probability: 40,
    scale: 1.0,
    playerOnly: true,
    willTrigger: ({ unit, player, pickup, underworld }) => {
      return !!player;
    },
    effect: ({ unit, player, underworld, prediction }) => {
      if (player) {
        player.unit.stamina += player.unit.staminaMax;
        if (!prediction) {
          playSFXKey('potionPickupMana');
        }
        // Animate
        if (player.unit.image) {
          // Note: This uses the lower-level addPixiSpriteAnimated directly so that it can get a reference to the sprite
          // and add a filter; however, addOneOffAnimation is the higher level and more common for adding a simple
          // "one off" animated sprite.  Use it instead of addPixiSpriteAnimated unless you need more direct control like
          // we do here
          const animationSprite = addPixiSpriteAnimated('spell-effects/potionPickup', player.unit.image.sprite, {
            loop: false,
            animationSpeed: 0.3,
            onComplete: () => {
              if (animationSprite && animationSprite.parent) {
                animationSprite.parent.removeChild(animationSprite);
              }
            }
          });
          if (animationSprite) {
            if (!animationSprite.filters) {
              animationSprite.filters = [];
            }
            // Change the health color to yellow 
            animationSprite.filters.push(
              new MultiColorReplaceFilter(
                [
                  [0xff0000, stamina],
                ],
                0.15
              )
            );
          }
        }

        // Now that the player unit's stamina has increased,sync the new
        // stamina state with the player's predictionUnit so it is properly
        // refelcted in the stamina bar
        // (note: this would be auto corrected on the next mouse move anyway)
        underworld.syncPlayerPredictionUnitOnly();
      }
    },
  },
  {
    imagePath: 'pickups/manaPotion',
    animationSpeed: 0.2,
    name: 'Mana Potion',
    description: [`mana potion description`, manaPotionRestoreAmount.toString()],
    probability: 80,
    scale: 1.0,
    playerOnly: true,
    willTrigger: ({ unit, player, pickup, underworld }) => {
      return !!player;
    },
    effect: ({ unit, player, underworld, prediction }) => {
      if (player) {
        player.unit.mana += manaPotionRestoreAmount;
        explain(EXPLAIN_OVERFILL);
        if (!prediction) {
          playSFXKey('potionPickupMana');
        }
        // Animate
        if (player.unit.image) {
          // Note: This uses the lower-level addPixiSpriteAnimated directly so that it can get a reference to the sprite
          // and add a filter; however, addOneOffAnimation is the higher level and more common for adding a simple
          // "one off" animated sprite.  Use it instead of addPixiSpriteAnimated unless you need more direct control like
          // we do here
          const animationSprite = addPixiSpriteAnimated('spell-effects/potionPickup', player.unit.image.sprite, {
            loop: false,
            animationSpeed: 0.3,
            onComplete: () => {
              if (animationSprite && animationSprite.parent) {
                animationSprite.parent.removeChild(animationSprite);
              }
            }
          });
          if (animationSprite) {
            if (!animationSprite.filters) {
              animationSprite.filters = [];
            }
            // Change the health color to blue
            animationSprite.filters.push(
              new MultiColorReplaceFilter(
                [
                  [0xff0000, manaBlue],
                ],
                0.15
              )
            );
          }
        }

        // Now that the player unit's mana has increased,sync the new
        // mana state with the player's predictionUnit so it is properly
        // refelcted in the mana bar
        // (note: this would be auto corrected on the next mouse move anyway)
        underworld.syncPlayerPredictionUnitOnly();
      }
    },
  },
  {
    imagePath: 'pickups/manaPotion',
    animationSpeed: 0.2,
    name: CURSED_MANA_POTION,
    description: ['curse_mana_potion_copy', '10%'],
    probability: 1,
    scale: 1.0,
    playerOnly: true,
    init: ({ pickup, underworld }) => {
      if (pickup.image) {
        pickup.image.sprite.filters = [
          new MultiColorReplaceFilter(
            [
              [0xa7cfff, 0xa69feb],
              [0x819eff, 0x6458dc],
              [0x3e6bff, 0x3024ac],
              [0x184dff, 0x221a7b],
            ],
            0.15
          )
        ]
      }

    },
    willTrigger: ({ unit, player, pickup, underworld }) => {
      return !!player;
    },
    effect: ({ unit, player, underworld, prediction }) => {
      if (player) {
        const previousMana = player.unit.manaMax;
        player.unit.manaMax *= (1.0 - cursedManaPotionRemovalProportion);
        player.unit.manaMax = Math.floor(player.unit.manaMax);
        player.unit.mana = Math.min(player.unit.mana, player.unit.manaMax);
        if (!prediction && !globalThis.headless) {
          playSFXKey('unitDamage');
          // Animate
          if (player.unit.image) {
            playAnimation(player.unit, player.unit.animations.hit, { loop: false, animationSpeed: 0.2 });
            // Changing the player's blood color is a quick hack to make the blood particle splatter be blue
            // like the mana lost
            const tempBlood = player.unit.bloodColor;
            player.unit.bloodColor = manaDarkBlue;
            startBloodParticleSplatter(underworld, player.unit, player.unit);
            player.unit.bloodColor = tempBlood;
            floatingText({ coords: player.unit, text: `- ${previousMana - player.unit.manaMax} ${i18n('mana')}` });
          }
        }

        // Now that the player unit's mana has changed, sync the new
        // mana state with the player's predictionUnit so it is properly
        // refelcted in the mana bar
        // (note: this would be auto corrected on the next mouse move anyway)
        underworld.syncPlayerPredictionUnitOnly();
      }
    },
  },
  {
    imagePath: 'pickups/healthPotion',
    animationSpeed: 0.2,
    name: 'Health Potion',
    probability: 80,
    scale: 1.0,
    playerOnly: true,
    description: ['health potion description', healthPotionRestoreAmount.toString()],
    willTrigger: ({ unit, player, pickup, underworld }) => {
      // Only trigger the health potion if the player will be affected by the health potion
      // Normally that's when they have less than full health, but there's an exception where
      // players that have blood curse will be damaged by healing so it should trigger for them too
      return !!(player && (player.unit.health < player.unit.healthMax || hasBloodCurse(player.unit)));
    },
    effect: ({ player, underworld, prediction }) => {
      // TODO: A lot of the pickup effects don't actually trigger in prediction mode because
      // player is undefined and there is no prediction version of a player
      if (player) {
        takeDamage(player.unit, -healthPotionRestoreAmount, undefined, underworld, false);
        // Add spell effect animation
        Image.addOneOffAnimation(player.unit, 'spell-effects/potionPickup', {}, { animationSpeed: 0.3, loop: false });
        if (!prediction) {
          playSFXKey('potionPickupHealth');
        }

        // Cap health at max
        player.unit.health = Math.min(player.unit.health, player.unit.healthMax);
        // Now that the player unit's mana has increased,sync the new
        // mana state with the player's predictionUnit so it is properly
        // refelcted in the health bar
        // (note: this would be auto corrected on the next mouse move anyway)
        underworld.syncPlayerPredictionUnitOnly();
      }
    },
  },
];
export function givePlayerUpgrade(p: Player.IPlayer, underworld: Underworld) {
  elEndTurnBtn.classList.toggle('upgrade', true);
  skyBeam(p.unit);
  if (player && player == globalThis.player) {
    if (player.inventory.length > config.NUMBER_OF_TOOLBAR_SLOTS - 1) {
      explain(EXPLAIN_INVENTORY);
    }
  }
}