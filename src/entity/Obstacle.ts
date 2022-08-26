import { OBSTACLE_SIZE } from '../config';
import { Vec2, subtract, magnitude, add, clone } from '../jmath/Vec';
import { IUnit } from './Unit';
import { closestLineSegmentIntersectionWithLine, isOnOutside } from '../jmath/lineSegment';
import { Material } from '../Conway';
import { isVec2InsidePolygon, Polygon2 } from '../jmath/Polygon2';
import { distance, similarTriangles } from '../jmath/math';
import type Underworld from '../Underworld';
import * as inLiquid from '../inLiquid';
export interface IObstacle {
  x: number;
  y: number;
  bounds: Polygon2;
  material: Material;
}

export function coordToPoly(coord: Vec2): Polygon2 {
  const width = OBSTACLE_SIZE;
  const height = OBSTACLE_SIZE;
  const _x = coord.x - width / 2;
  const _y = coord.y - height / 2;
  const bounds = [
    { x: _x, y: _y },
    { x: _x, y: _y + height },
    { x: _x + width, y: _y + height },
    { x: _x + width, y: _y },
  ]

  return bounds;
}

export const lavaDamage = 2;
// Returns a point that would be "safe" to move a unit to where visually they would be completely submerged in liquid.
// "safe" meaning visually safe so it doesn't look buggy where they are half submerged but also half on land
export function findSafeFallInPoint(currentPosition: Vec2, nextPosition: Vec2, underworld: Underworld): { safeFallInPosition: Vec2, hitLava: boolean } {
  let liquidMovedUnit = false;
  // Check intersections with lava:
  let hitLava = false;
  const fallInThreshold = 10;
  // + 10 gives a margin so that they don't just fall right back out.
  const fallInDistance = fallInThreshold + 10;
  let safeFallInPosition = clone(nextPosition);
  const intersectionInfo = closestLineSegmentIntersectionWithLine({ p1: currentPosition, p2: nextPosition }, underworld.liquidBounds)
  if (intersectionInfo) {
    const { intersection, lineSegment: liquidBoundary } = intersectionInfo;

    const dist = distance(nextPosition, intersection);
    let fallInPoint = similarTriangles(nextPosition.x - intersection.x, nextPosition.y - intersection.y, dist, fallInDistance)
    // Edge case: If unit is closer than fallInThreshold from endpoint of wall
    // and the wall is connected to another wall by a right angle, when they
    // "fall in", they will immediately come back out in a perpendicular direction
    // because they fell in within the fall out threshold of the other wall.
    // Ensure that if they fall in they are at least fallInThreshold away from other
    // walls too.
    const diffFromP1 = subtract(intersection, liquidBoundary.p1);
    const diffFromP2 = subtract(intersection, liquidBoundary.p2);
    const isOutside = isOnOutside(liquidBoundary, currentPosition);
    if (isOutside && magnitude(diffFromP1) <= fallInThreshold) {
      const deltaX = liquidBoundary.p1.x - liquidBoundary.p2.x;
      const deltaY = liquidBoundary.p1.y - liquidBoundary.p2.y;
      const fromCorner = similarTriangles(deltaX, deltaY, magnitude(subtract(liquidBoundary.p1, liquidBoundary.p2)), fallInDistance)
      const fallInThresholdProjectedFromWallP1toWallP2 = subtract(liquidBoundary.p1, fromCorner);
      // Rotate vector 90 degrees https://stackoverflow.com/a/4780141/4418836
      safeFallInPosition = add(fallInThresholdProjectedFromWallP1toWallP2, { x: -fromCorner.y, y: fromCorner.x });
    } else if (isOutside && magnitude(diffFromP2) <= fallInThreshold) {
      const deltaX = liquidBoundary.p2.x - liquidBoundary.p1.x;
      const deltaY = liquidBoundary.p2.y - liquidBoundary.p1.y;
      const fromCorner = similarTriangles(deltaX, deltaY, magnitude(subtract(liquidBoundary.p2, liquidBoundary.p1)), fallInDistance)
      const fallInThresholdProjectedFromWallP2toWallP1 = subtract(liquidBoundary.p2, fromCorner);
      safeFallInPosition = add(fallInThresholdProjectedFromWallP2toWallP1, { x: fromCorner.y, y: -fromCorner.x });
    } else {
      safeFallInPosition.x = intersection.x + fallInPoint.x;
      safeFallInPosition.y = intersection.y + fallInPoint.y;
    }
    liquidMovedUnit = true;

    hitLava = !isOnOutside(liquidBoundary, safeFallInPosition);
  }
  return { safeFallInPosition, hitLava };


}

export function tryFallInOutOfLiquid(unit: IUnit, underworld: Underworld, prediction: boolean) {
  if (underworld.liquidPolygons.length) {
    let insideLiquid = false;
    for (let poly of underworld.liquidPolygons) {
      insideLiquid = isVec2InsidePolygon(unit, poly);
      if (insideLiquid) {
        inLiquid.add(unit, underworld, prediction);
        break;
      }
    }
    if (!insideLiquid) {
      inLiquid.remove(unit);
    }
  }

}
