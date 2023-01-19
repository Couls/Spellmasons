import type * as PIXI from 'pixi.js';
import * as Image from '../graphics/Image';
import type * as Player from './Player';
import { addPixiSprite, addPixiSpriteAnimated, containerUnits, pixiText } from '../graphics/PixiUtils';
import { IUnit, takeDamage } from './Unit';
import { checkIfNeedToClearTooltip } from '../graphics/PlanningView';
import { MESSAGE_TYPES } from '../types/MessageTypes';
import * as config from '../config';
import { Vec2 } from '../jmath/Vec';
import { MultiColorReplaceFilter } from '@pixi/filter-multi-color-replace';
import { manaBlue, stamina } from '../graphics/ui/colors';
import Underworld from '../Underworld';
import { hasBloodCurse } from '../cards/blood_curse';
import { HasSpace } from './Type';
import { explain, EXPLAIN_INVENTORY, EXPLAIN_OVERFILL, tutorialCompleteTask, updateTutorialChecklist } from '../graphics/Explain';
import * as CardUI from '../graphics/ui/CardUI';
import { bossmasonUnitId } from './units/bossmason';
import { chooseOneOf } from '../jmath/rand';
import { skyBeam } from '../VisualEffects';
import { makeRedPortal, RED_PORTAL_JID, stopAndDestroyForeverEmitter } from '../graphics/ParticleCollection';
import * as particles from '@pixi/particle-emitter'
import { Localizable } from '../localization';

export const PICKUP_RADIUS = config.SELECTABLE_RADIUS;
export const PICKUP_IMAGE_PATH = 'pickups/scroll';
export const RED_PORTAL = 'Red Portal';
const RED_PORTAL_DAMAGE = 30;
type IPickupEffect = ({ unit, player, pickup, prediction }: { unit?: IUnit; player?: Player.IPlayer, pickup: IPickup, underworld: Underworld, prediction: boolean }) => boolean | undefined;
export function isPickup(maybePickup: any): maybePickup is IPickup {
  return maybePickup && maybePickup.type == 'pickup';
}
export type IPickup = HasSpace & {
  type: 'pickup';
  name: string;
  description: Localizable;
  imagePath: string;
  image?: Image.IImageAnimated;
  // if this IPickup is a prediction copy, real is a reference to the real pickup that it is a copy of
  real?: IPickup;
  // Only can be picked up once
  singleUse: boolean;
  // Only can be picked up by players
  playerOnly: boolean;
  // Pickups optionally have a "time limit" and will disappear after this many turns
  turnsLeftToGrab?: number;
  // Defines custom behavior when turnsLeftToGrab reaches 0
  onTurnsLeftDone?: (self: IPickup) => Promise<void>;
  text?: PIXI.Text;
  // effect is ONLY to be called within triggerPickup
  // returns true if the pickup did in fact trigger - this is useful
  // for preventing one use health potions from triggering if the unit
  // already has max health
  effect: IPickupEffect;
  emitter?: particles.Emitter;
  flaggedForRemoval: boolean;

}
interface IPickupSource {
  name: string;
  description: Localizable;
  imagePath: string;
  animationSpeed?: number;
  singleUse: boolean;
  playerOnly?: boolean;
  turnsLeftToGrab?: number;
  scale: number;
  probability: number;
  effect: IPickupEffect
}
export function copyForPredictionPickup(p: IPickup): IPickup {
  // Remove image and text since prediction pickups won't be rendered
  const { image, text, ...rest } = p;
  return {
    real: p,
    ...rest
  }
}
export const TIME_CIRCLE_JID = 'timeCircle';

export function create({ pos, pickupSource, onTurnsLeftDone }:
  {
    pos: Vec2, pickupSource: IPickupSource, onTurnsLeftDone?: (self: IPickup) => Promise<void>
  }, underworld: Underworld, prediction: boolean) {
  const { name, description, imagePath, effect, scale, singleUse, animationSpeed, playerOnly = false, turnsLeftToGrab } = pickupSource;
  const { x, y } = pos
  if (isNaN(x) || isNaN(y)) {
    console.error('Unexpected: Created pickup at NaN', pickupSource, pos);
  }
  const self: IPickup = {
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
    image: (!containerUnits || prediction) ? undefined : Image.create({ x, y }, imagePath, containerUnits, { animationSpeed, loop: true }),
    singleUse,
    playerOnly,
    effect,
    onTurnsLeftDone,
    flaggedForRemoval: false
  };
  if (self.image) {
    self.image.sprite.scale.x = scale;
    self.image.sprite.scale.y = scale;
    if (self.image.sprite && name == RED_PORTAL) {
      Image.cleanup(self.image);
      // Right now red portal is the only pickup that uses an emitter;
      // however if that changes in the future this should be refactored so
      // that there isn't a special case inside of Pickup.create
      assignEmitter(self, RED_PORTAL_JID);
    }
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

  underworld.addPickupToArray(self, prediction);

  return self;
}
function assignEmitter(pickup: IPickup, emitterId: string) {
  if (emitterId == RED_PORTAL_JID) {
    pickup.emitter = makeRedPortal(pickup, false);
  } else {
    console.error('Attempting to assignEmitter with unkown id:', emitterId);
  }
  // @ts-ignore: jid custom property for serialization
  pickup.emitterJID = RED_PORTAL_JID;
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
export function load(pickup: IPickup, underworld: Underworld, prediction: boolean): IPickup | undefined {
  // Get the pickup object
  let foundPickup = pickups.find((p) => p.name == pickup.name);
  if (foundPickup) {
    // TODO verify that complex pickup behavior like onTurnsLeftDone still work after load, traps
    // probably don't work after load because callbacks can't be serialized
    const { image, ...toCopy } = pickup;
    const newPickup = create({ pos: pickup, pickupSource: foundPickup }, underworld, prediction);
    // Note: It is important here to use Object.assign so that the pickup reference is the SAME ref as is created in the
    // create function because the create function passes that ref to the underworld pickups array.
    // So when you mutate the properties, the ref must stay the same.
    Object.assign(newPickup, toCopy);
    addText(newPickup);
    // @ts-ignore: jid custom property for serialization
    if (newPickup.emitter && newPickup.emitterJID) {
      // @ts-ignore: jid custom property for serialization
      assignEmitter(newPickup, newPickup.emitterJID);
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
  underworld.removePickupFromArray(pickup, prediction);
  checkIfNeedToClearTooltip();
  // Remove any associated forcePushs
  const fms = (prediction ? underworld.forceMovePrediction : underworld.forceMove).filter(fm => fm.pushedObject == pickup)
  if (fms.length) {
    // set the associated forceMove to velocity of 0 so it will be removed at the next invocation of runForceMove
    fms.forEach(fm => { fm.velocity = { x: 0, y: 0 } });
  }
}
export function triggerPickup(pickup: IPickup, unit: IUnit, underworld: Underworld, prediction: boolean) {
  if (pickup.flaggedForRemoval) {
    // Don't trigger pickup if flagged for removal
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
  const didTrigger = pickup.effect({ unit, player, pickup, underworld, prediction });
  // Only remove pickup if it triggered AND is a singleUse pickup
  if (pickup.singleUse && didTrigger) {
    removePickup(pickup, underworld, prediction);
  }
}

const manaPotionRestoreAmount = 40;
const healthPotionRestoreAmount = 50;
const spike_damage = 30;
export const CARDS_PICKUP_NAME = 'Spells';
export const PICKUP_SPIKES_NAME = 'Trap';
export const PICKUP_PORTAL_NAME = 'Portal';
export const pickups: IPickupSource[] = [
  {
    imagePath: 'pickups/trap',
    animationSpeed: -config.DEFAULT_ANIMATION_SPEED,
    playerOnly: false,
    singleUse: true,
    name: PICKUP_SPIKES_NAME,
    probability: 70,
    scale: 1,
    description: ['Deals 🍞 to any unit that touches it', spike_damage.toString()],
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
        return true;
      }
      return false;
    }
  },
  {
    imagePath: '',
    animationSpeed: -0.5,
    playerOnly: true,
    singleUse: false,
    name: RED_PORTAL,
    probability: 0,
    scale: 1,
    description: ['red portal description', bossmasonUnitId, RED_PORTAL_DAMAGE.toString()],
    effect: ({ unit, player, pickup, underworld }) => {
      const otherRedPortals = underworld.pickups.filter(p => p.name == RED_PORTAL && p !== pickup)
      const randomOtherRedPortal = chooseOneOf(otherRedPortals);
      if (player) {
        // Remove the pickups before teleporting the unit so they don't trigger
        // the 2nd portal
        removePickup(pickup, underworld, false);
        if (randomOtherRedPortal) {
          removePickup(randomOtherRedPortal, underworld, false);
          player.unit.x = randomOtherRedPortal.x;
          player.unit.y = randomOtherRedPortal.y;
          skyBeam(pickup);
          skyBeam(randomOtherRedPortal);
        }
        takeDamage(player.unit, RED_PORTAL_DAMAGE, undefined, underworld, false);
      }
      return true;
    },
  },
  {
    imagePath: 'portal',
    animationSpeed: -0.5,
    playerOnly: true,
    singleUse: false,
    name: PICKUP_PORTAL_NAME,
    probability: 0,
    scale: 1,
    description: 'explain portal',
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
      return true;
    },
  },
  {
    imagePath: PICKUP_IMAGE_PATH,
    name: CARDS_PICKUP_NAME,
    description: 'Pickup a spell scroll to get more spells',
    probability: 0,
    singleUse: true,
    scale: 0.5,
    turnsLeftToGrab: 4,
    playerOnly: true,
    effect: ({ unit, player, underworld }) => {
      // Give EVERY player an upgrade when any one player picks up a scroll
      underworld.players.forEach(p => givePlayerUpgrade(p, underworld));
      tutorialCompleteTask('pickupScroll');
      playSFXKey('levelUp');
      return true;
    },
  },
  {
    imagePath: 'pickups/staminaPotion',
    animationSpeed: 0.2,
    name: 'Stamina Potion',
    description: ['Restores stamina to 🍞', '100%'],
    probability: 40,
    singleUse: true,
    scale: 1.0,
    playerOnly: true,
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
        return true;
      }
      return false;
    },
  },
  {
    imagePath: 'pickups/manaPotion',
    animationSpeed: 0.2,
    name: 'Mana Potion',
    description: [`mana potion description`, manaPotionRestoreAmount.toString()],
    probability: 80,
    singleUse: true,
    scale: 1.0,
    playerOnly: true,
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
        return true;
      }
      return false;
    },
  },
  {
    imagePath: 'pickups/healthPotion',
    animationSpeed: 0.2,
    name: 'Health Potion',
    probability: 80,
    scale: 1.0,
    playerOnly: true,
    singleUse: true,
    description: ['health potion description', healthPotionRestoreAmount.toString()],
    effect: ({ player, underworld, prediction }) => {
      // Only trigger the health potion if the player will be affected by the health potion
      // Normally that's when they have less than full health, but there's an exception where
      // players that have blood curse will be damaged by healing so it should trigger for them too
      if (player && (player.unit.health < player.unit.healthMax || hasBloodCurse(player.unit))) {
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
        return true;
      }
      return false;
    },
  },
];
export function givePlayerUpgrade(p: Player.IPlayer, underworld: Underworld) {
  // All players get to pick a new upgrade when one picks up the scroll.
  p.upgradesLeftToChoose++;
  underworld.showUpgrades();
  if (player && player == globalThis.player) {
    if (player.inventory.length > config.NUMBER_OF_TOOLBAR_SLOTS) {
      explain(EXPLAIN_INVENTORY);
    }
  }
}