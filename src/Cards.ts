import type * as Player from './Player';
import * as Unit from './Unit';
import * as Pickup from './Pickup';
import type { Coords } from './commonTypes';
import { modifiersSource } from './Modifiers';
// import * as math from './math';

// Guiding rules for designing card effects:
// Follow the Priciple of Least Surpise
// Every card should be designed to respond well to potentially more than one target

export interface EffectState {
  caster: Player.IPlayer;
  targets: Coords[];
  cards: string[];
  // aggregator carries extra information that can be passed
  // between card effects.
  // For example, "Vampiric" adds all damage taken
  // to the caster, this damage taken needs to be aggregated
  // for "Vampiric" to know how much to apply
  aggregator: any;
}
export type EffectFn = {
  (state: EffectState): EffectState;
};

export interface ICard {
  id: string;
  thumbnail: string;
  probability: number;
  effect: EffectFn;
  onlyChangesTarget?: boolean;
  isDark?: boolean;
}
export const allCards: ICard[] = [
  //   {
  //     id: 'obliterate',
  //     thumbnail: 'images/spell/obliterate.png',
  //     probability: 1,
  //     isDark: true,
  //   },
  {
    id: 'damage',
    thumbnail: 'images/spell/damage.png',
    probability: 120,
    effect: (state) => {
      for (let target of state.targets) {
        const unit = window.game.getUnitAt(target.x, target.y);
        if (unit) {
          const damage = 1;
          Unit.takeDamage(unit, damage);
          state.aggregator.damageDealt =
            (state.aggregator.damageDealt || 0) + damage;
        }
      }
      return state;
    },
  },
  {
    id: 'heal',
    thumbnail: 'images/spell/heal.png',
    probability: 50,
    effect: (state) => {
      for (let target of state.targets) {
        const unit = window.game.getUnitAt(target.x, target.y);
        if (unit) {
          const damage = -1;
          Unit.takeDamage(unit, damage);
          state.aggregator.damageDealt =
            (state.aggregator.damageDealt || 0) + damage;
        }
      }
      return state;
    },
  },
  {
    id: 'area_of_effect',
    thumbnail: 'images/spell/aoe.png',
    probability: 10,
    onlyChangesTarget: true,
    effect: (state) => {
      let updatedTargets = [...state.targets];
      for (let target of state.targets) {
        const withinRadius = window.game.getCoordsWithinDistanceOfTarget(
          target.x,
          target.y,
          1,
        );
        updatedTargets = updatedTargets.concat(withinRadius);
      }
      // deduplicate
      updatedTargets = updatedTargets.filter((coord, index) => {
        return (
          updatedTargets.findIndex(
            (findCoords) => findCoords.x == coord.x && findCoords.y === coord.y,
          ) === index
        );
      });
      // Update targets
      state.targets = updatedTargets;
      return state;
    },
  },
  {
    id: 'chain',
    thumbnail: 'images/spell/chain.png',
    probability: 10,
    onlyChangesTarget: true,
    effect: (state) => {
      let updatedTargets = [...state.targets];
      for (let target of state.targets) {
        const unit = window.game.getUnitAt(target.x, target.y);
        if (unit) {
          // Find all units touching the spell origin
          const chained_units = window.game.getTouchingUnitsRecursive(
            target.x,
            target.y,
            updatedTargets,
          );
          updatedTargets = updatedTargets.concat(chained_units);
        }
      }
      // deduplicate
      updatedTargets = updatedTargets.filter((coord, index) => {
        return (
          updatedTargets.findIndex(
            (findCoords) => findCoords.x == coord.x && findCoords.y === coord.y,
          ) === index
        );
      });
      // Update targets
      state.targets = updatedTargets;

      return state;
    },
  },
  {
    id: 'freeze',
    thumbnail: 'images/spell/freeze.png',
    probability: 20,
    effect: (state) => {
      for (let target of state.targets) {
        const unit = window.game.getUnitAt(target.x, target.y);
        if (unit) {
          modifiersSource.freeze.add(unit);
        }
        return state;
      }
    },
  },
  {
    id: 'shield',
    thumbnail: 'images/spell/shield.png',
    probability: 10,
    effect: (state) => {
      for (let target of state.targets) {
        const unit = window.game.getUnitAt(target.x, target.y);
        if (unit) {
          modifiersSource.shield.add(unit);
        }
        return state;
      }
      return state;
    },
  },

  {
    id: 'swap',
    thumbnail: 'images/spell/swap.png',
    probability: 3,
    effect: (state) => {
      const { caster, targets, aggregator } = state;
      if (!aggregator.swap) {
        aggregator.swap = {
          originalCasterPosition: {
            x: caster.unit.x,
            y: caster.unit.y,
          },
        };
      }
      if (targets.length) {
        // Find movement change between caster and original target
        const dx = targets[0].x - aggregator.swap.originalCasterPosition.x;
        const dy = targets[0].y - aggregator.swap.originalCasterPosition.y;

        // Loop through all targets and swap if possible
        for (let target of targets) {
          const swapLocation = { x: target.x - dx, y: target.y - dy };
          // You cannot swap with a statically blocked cell
          if (window.game.isCellStaticallyBlocked(swapLocation)) {
            continue;
          }
          const targetUnit = window.game.getUnitAt(target.x, target.y);
          const swapUnit = window.game.getUnitAt(
            swapLocation.x,
            swapLocation.y,
          );
          const pickupToSwapWith = window.game.getPickupAt(target.x, target.y);
          // Physically swap with target
          if (targetUnit) {
            Unit.setLocation(targetUnit, swapLocation);
          }
          if (swapUnit) {
            Unit.setLocation(caster.unit, target);
          }
          // Physically swap with pickups
          if (pickupToSwapWith) {
            Pickup.setPosition(
              pickupToSwapWith,
              swapLocation.x,
              swapLocation.y,
            );
          }
        }
      }
      return state;
    },
  },
  {
    id: 'push',
    thumbnail: 'images/spell/push.png',
    probability: 5,
    effect: (state) => {
      return state;
    },
    // effect: {
    //   singleTargetEffect: (caster, target, magnitude) => {
    //     for (let i = 0; i < magnitude; i++) {
    //       const unit = window.game.getUnitAt(target.x, target.y);
    //       if (unit) {
    //         const moveTo = math.oneCellAwayFromCell(unit, caster.unit);
    //         Unit.moveTo(unit, moveTo);
    //       }
    //     }
    //   },
    // },
  },
];
