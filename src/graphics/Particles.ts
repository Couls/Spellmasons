import * as PIXI from 'pixi.js';
import * as particles from '@pixi/particle-emitter'
import * as Vec from '../jmath/Vec';
import { Vec2 } from '../jmath/Vec';
import * as math from '../jmath/math';
import { randFloat } from '../jmath/rand';
import { normalizeAngle } from '../jmath/Angle';

export const containerParticles = new PIXI.ParticleContainer(5000, {
    scale: true,
    position: true,
    rotation: false,
    uvs: false,
    tint: true
});
interface Trail {
    position: Vec2;
    target: Vec2;
    angleRad: number;
    velocity: number;
    emitter: particles.Emitter;
}
const trails: Trail[] = [];
export function addTrail(position: Vec2, target: Vec2, startVelocity: number, angleRad: number, config: particles.EmitterConfigV3) {
    const emitter = new particles.Emitter(containerParticles, config);
    emitter.updateOwnerPos(position.x, position.y);
    trails.push({ position, target, velocity: startVelocity, angleRad: normalizeAngle(angleRad), emitter });
    console.log('trails', trails.length);
}
export function cleanUpTrail(trail: Trail) {
    trail.emitter.destroy();
    const i = trails.indexOf(trail);
    if (i !== -1) {
        trails.splice(i, 1)
    }
}
export function testTrail(app: PIXI.Application, position: Vec2) {
    const texture = createTexture(0, 8, app.renderer.resolution);
    addTrail(
        position,
        window.player?.unit || { x: 0, y: 0 },
        10,
        randFloat(window.underworld.random, 0, Math.PI * 2),
        particles.upgradeConfig({
            autoUpdate: true,
            alpha: {
                start: 0.8,
                end: 0.15
            },
            scale: {
                start: 1,
                end: 0.2,
                minimumScaleMultiplier: 1
            },
            color: {
                start: "#2196F3",
                end: "#e3f9ff"
            },
            speed: {
                start: 0,
                end: 0,
                minimumSpeedMultiplier: 1
            },
            acceleration: {
                x: 0,
                y: 0
            },
            maxSpeed: 0,
            startRotation: {
                min: 0,
                max: 0
            },
            noRotation: true,
            rotationSpeed: {
                min: 0,
                max: 0
            },
            lifetime: {
                min: 0.3,
                max: 0.3
            },
            blendMode: "normal",
            frequency: 0.0008,
            emitterLifetime: -1,
            maxParticles: 400,
            pos: {
                x: 0,
                y: 0
            },
            addAtBack: false,
            spawnType: "point"
        }, [texture]));

}


// window.addEventListener("resize", () => resized = true);

export function onTick(delta: number, pointer: Vec2) {

    // if (!Vec.equal(emitterPos, pointer)) {

    //     const dt = 1 - Math.pow(1 - sharpness, delta);
    //     const dx = pointer.x - emitterPos.x;
    //     const dy = pointer.y - emitterPos.y;

    //     if (Math.abs(dx) > minDelta) {
    //         emitterPos.x += dx * dt;
    //     } else {
    //         emitterPos.x = pointer.x;
    //     }

    //     if (Math.abs(dy) > minDelta) {
    //         emitterPos.y += dy * dt;
    //     } else {
    //         emitterPos.y = pointer.y;
    //     }
    // }

    const inverseRotationSpeed = 10;
    const velocityIncrease = 0.1;
    for (let t of trails) {
        const movementDirectionPos = math.getPosAtAngleAndDistance(t.position, t.angleRad, 100);
        t.position = math.getCoordsAtDistanceTowardsTarget(t.position, movementDirectionPos, t.velocity);
        const distanceToTarget = math.distance(t.position, t.target);
        if (distanceToTarget <= t.velocity * 2) {
            // Stop moving and stop emitting new particles once it reaches it's destination
            t.position = Vec.clone(t.target);
            t.emitter.updateOwnerPos(t.position.x, t.position.y);
            // Essentially, stop spawning new particles
            t.emitter.frequency = 10000;
        }
        const targetRad = normalizeAngle(Vec.getAngleBetweenVec2s(t.position, t.target));
        const diffToTargetRad = Math.abs(targetRad - t.angleRad);
        if (Math.abs(diffToTargetRad) < 0.01) {
            t.angleRad = targetRad;
        } else {
            t.angleRad += diffToTargetRad / inverseRotationSpeed;
        }
        t.angleRad = normalizeAngle(t.angleRad);
        t.velocity += velocityIncrease;
        // console.log('jtest', diffToTargetRad)
        // const changeInVelocity = Vec.subtract(math.getCoordsAtDistanceTowardsTarget(
        //     t.position,
        //     t.target,
        //     t.acceleration
        // ), t.position);
        // t.velocity.x += changeInVelocity.x;
        // t.velocity.y += changeInVelocity.y;
        // const nextX = t.position.x + t.velocity.x;
        // const nextY = t.position.y + t.velocity.y;
        // if (math.distance({ x: nextX, y: nextY }, t.position) >= math.distance(t.target, t.position)) {
        //     // Stop moving and stop emitting new particles once it reaches it's destination
        //     t.position = Vec.clone(t.target);
        //     t.emitter.updateOwnerPos(t.position.x, t.position.y);
        //     // Essentially, stop spawning new particles
        //     t.emitter.frequency = 10000;
        // } else {
        // t.position.x += t.velocity.x;
        // t.position.y += t.velocity.y;
        t.emitter.updateOwnerPos(t.position.x, t.position.y);
        // }
        if (t.emitter.particleCount == 0) {
            cleanUpTrail(t);
        }
    }
}

function createTexture(r1: number, r2: number, resolution: number) {

    const c = (r2 + 1) * resolution;
    r1 *= resolution;
    r2 *= resolution;

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = canvas.height = c * 2;

    const gradient = context.createRadialGradient(c, c, r1, c, c, r2);
    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    return PIXI.Texture.from(canvas);
}
