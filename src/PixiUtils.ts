import * as PIXI from 'pixi.js';
import { BOARD_HEIGHT, CELL_SIZE, BOARD_WIDTH } from './config';
// if PIXI is finished setting up
let isReady = false;
// PIXI app
export const app = new PIXI.Application();
export const containerBoard = new PIXI.Container();
export const containerDangerOverlay = new PIXI.Container();
containerDangerOverlay.alpha = 0.5;
export const containerUnits = new PIXI.Container();
export const containerPickup = new PIXI.Container();
export const containerSpells = new PIXI.Container();
export const containerUI = new PIXI.Container();
export const containerFloatingText = new PIXI.Container();
app.renderer.backgroundColor = 0x45b6fe;
app.renderer.view.style.position = 'absolute';
app.renderer.view.style.top = '0';
app.renderer.view.style.display = 'block';

resizePixi();
window.addEventListener('resize', resizePixi);
function resizePixi() {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  // Center the app in the middle of the board
  app.stage.x = app.renderer.width / 2 - (CELL_SIZE * BOARD_WIDTH) / 2;
  app.stage.y = app.renderer.height / 2 - (CELL_SIZE * BOARD_HEIGHT) / 2;
}
// PIXI textures
let resources;
export function setupPixi(): Promise<void> {
  // The application will create a canvas element for you that you
  // can then insert into the DOM
  document.getElementById('PIXI-holder').appendChild(app.view);

  // Add containers to the stage in the order that they will be rendered on top of each other
  app.stage.addChild(containerBoard);
  app.stage.addChild(containerDangerOverlay);
  app.stage.addChild(containerUnits);
  app.stage.addChild(containerPickup);
  app.stage.addChild(containerSpells);
  app.stage.addChild(containerUI);
  app.stage.addChild(containerFloatingText);
  return loadTextures();
}
function loadTextures(): Promise<void> {
  return new Promise((resolve) => {
    const loader = PIXI.Loader.shared;
    const images = [
      'images/tiles/ground.png',
      'images/units/golem.png',
      'images/units/golem-blue.png',
      'images/units/golem-red.png',
      'images/units/golem-sand.png',
      'images/units/man-blue.png',
      'images/spell/aoe.png',
      'images/spell/chain.png',
      'images/spell/damage.png',
      'images/spell/freeze.png',
      'images/spell/heal.png',
      'images/spell/target.png',
      'images/spell/feet.png',
      'images/spell/shield.png',
      'images/spell/swap.png',
      'images/spell/arrow.png',
      'images/spell/green-thing.png',
      'images/spell/resurrect.png',
      'images/spell/weaken.png',
      'images/portal.png',
      'images/units/unit-underline.png',
      'images/pickups/card.png',
      'images/empty.png',
    ];
    images.forEach((path) => {
      loader.add(path);
    });
    loader.load((_loader, all_resources) => {
      resources = all_resources;
      isReady = true;
      resolve();
    });
  });
}
export function addPixiSprite(
  imagePath: string,
  parent: PIXI.Container,
): PIXI.Sprite {
  if (!isReady) {
    throw new Error(
      'PIXI is not finished setting up.  Cannot add a sprite yet',
    );
  }
  const resource = resources[imagePath];
  const sprite = new PIXI.Sprite(
    resource ? resource.texture : resources['images/empty.png'].texture,
  );
  parent.addChild(sprite);
  return sprite;
}
