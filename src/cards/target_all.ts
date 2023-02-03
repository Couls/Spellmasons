import { addTarget, getCurrentTargets, Spell } from './index';
import { CardCategory } from '../types/commonTypes';
import { Vec2, add } from '../jmath/Vec';
import * as Unit from '../entity/Unit';
import * as math from '../jmath/math';
import { isUnit } from '../entity/Unit';
import { isPickup } from '../entity/Pickup';
import { isDoodad } from '../entity/Doodad';
import { CardRarity, probabilityMap } from '../types/commonTypes';
import { raceTimeout } from '../Promise';
import { easeOutCubic } from '../jmath/Easing';
import * as config from '../config';
import * as colors from '../graphics/ui/colors';

const id = 'Target Kind';
const NUMBER_OF_TARGETS_PER_STACK = 5;
const spell: Spell = {
  card: {
    id,
    category: CardCategory.Targeting,
    supportQuantity: true,
    manaCost: 60,
    healthCost: 0,
    expenseScaling: 3,
    probability: probabilityMap[CardRarity.FORBIDDEN],
    thumbnail: 'spellIconTargetKind.png',
    requiresFollowingCard: true,
    description: ['spell_target_kind', NUMBER_OF_TARGETS_PER_STACK.toString()],
    allowNonUnitTarget: true,
    effect: async (state, card, quantity, underworld, prediction, outOfRange) => {
      // Note: This loop must NOT be a for..of and it must cache the length because it
      // mutates state.targetedUnits as it iterates.  Otherwise it will continue to loop as it grows
      let targets: Vec2[] = getCurrentTargets(state);
      targets = targets.length ? targets : [state.castLocation];
      const length = targets.length;
      for (let i = 0; i < length; i++) {
        const target = targets[i];
        if (!target) {
          continue;
        }
        const filterFn = (x: any) => {
          if (Unit.isUnit(x) && Unit.isUnit(target)) {
            if (target.alive) {
              // Match living units of the same faction
              return x.faction == target.faction && x.alive;
            } else {
              // Match any dead unit
              return !x.alive;
            }
          } else if (!Unit.isUnit(x) && !Unit.isUnit(target)) {
            // Match both non units to each other
            return true;
          } else {
            // Do not match unit and non unit
            return false;
          }
        }
        const newTargets = underworld.getPotentialTargets(prediction)
          // Filter out current targets
          .filter(t => !targets.includes(t))
          // Filter out dissimilar types
          // @ts-ignore Find similar units by unitSourceId, find similar pickups by name
          .filter(t => {
            if (isUnit(target)) {
              return isUnit(t) && t.alive == target.alive;
            } else if (isPickup(target)) {
              return isPickup(t);
            } else if (isDoodad(target)) {
              return isDoodad(t);
            }
          })
          .filter(filterFn)
          .slice(0, NUMBER_OF_TARGETS_PER_STACK * quantity);
        if (!prediction) {
          playSFXKey('targeting');
          // Animate lines to new targets
          await animate(target, newTargets, [target]);
          // Animate circles for all now-selected targets
          await animate(target, [], [target, ...newTargets]);
        }
        for (let newTarget of newTargets) {
          addTarget(newTarget, state);
        }
      }

      return state;
    },
  },
};

async function animate(pos: Vec2, newTargets: Vec2[], oldTargets: Vec2[]) {
  if (globalThis.headless) {
    // Animations do not occur on headless, so resolve immediately or else it
    // will just waste cycles on the server
    return Promise.resolve();
  }
  const iterations = 100;
  const millisBetweenIterations = 4;
  // Keep track of which entities have been targeted so far for the sake
  // of making a new sfx when a new entity gets targeted
  const entitiesTargeted: Vec2[] = [];
  // "iterations + 10" gives it a little extra time so it doesn't timeout right when the animation would finish on time
  return raceTimeout(millisBetweenIterations * (iterations + 10), 'animatedConnect', new Promise<void>(resolve => {
    for (let i = 0; i < iterations; i++) {

      setTimeout(() => {
        if (globalThis.predictionGraphics) {
          globalThis.predictionGraphics.clear();
          globalThis.predictionGraphics.lineStyle(2, colors.targetingSpellGreen, 1.0);
          // between 0 and 1;
          const proportionComplete = easeOutCubic((i + 1) / iterations);
          newTargets.forEach(target => {

            globalThis.predictionGraphics?.moveTo(pos.x, pos.y);
            const dist = math.distance(pos, target)
            const pointApproachingTarget = add(pos, math.similarTriangles(target.x - pos.x, target.y - pos.y, dist, dist * proportionComplete));
            globalThis.predictionGraphics?.lineTo(pointApproachingTarget.x, pointApproachingTarget.y);
            if (proportionComplete >= 1) {
              globalThis.predictionGraphics?.drawCircle(target.x, target.y, config.COLLISION_MESH_RADIUS);
            }
          });
          // Draw completed lines and circles on old targets
          oldTargets.forEach(target => {
            if (!entitiesTargeted.includes(target)) {
              entitiesTargeted.push(target);
              playSFXKey('targetAquired');
            }
            // globalThis.predictionGraphics?.moveTo(pos.x, pos.y);
            // globalThis.predictionGraphics?.lineTo(target.x, target.y);
            globalThis.predictionGraphics?.drawCircle(target.x, target.y, config.COLLISION_MESH_RADIUS);
          });
        }
        if (i >= iterations - 1) {
          resolve();
        }

      }, millisBetweenIterations * i)
    }
  })).then(() => {
    globalThis.predictionGraphics?.clear();
  });
}
export default spell;