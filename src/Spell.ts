import type Game from './Game';
import type { IPlayer } from './Player';
import * as Unit from './Unit';
import floatingText from './FloatingText';
import Image from './Image';
import { SHIELD_MULTIPLIER } from './config';

const elCurrentSpellDescription = document.getElementById(
  'current-spell-description',
);
let currentSpell: Spell = {};
export function clearCurrentSpell() {
  currentSpell = {};
  updateSelectedSpellUI();
}
export function getSelectedSpell(): Spell {
  return currentSpell;
}
export function updateSelectedSpellUI() {
  elCurrentSpellDescription.innerText = toString(currentSpell);
}
export interface Spell {
  caster?: IPlayer;
  x?: number;
  y?: number;
  // damage can be negative for healing
  damage?: number;
  freeze?: number;
  shield?: number;
  chain?: boolean;
  aoe_radius?: number;
  image?: Image;
}

export function modifySpell(modifier: string) {
  const spell = currentSpell;
  switch (modifier) {
    case 'Damage':
      spell.damage = (spell.damage || 0) + 1;
      break;
    case 'Heal':
      spell.damage = (spell.damage || 0) - 1;
      break;
    case 'Freeze':
      spell.freeze = (spell.freeze || 0) + 1;
      break;
    case 'Chain':
      spell.chain = true;
      break;
    case 'AOE':
      spell.aoe_radius = (spell.aoe_radius || 0) + 1;
      break;
    case 'Shield':
      spell.shield = (spell.shield || 0) + 1;
      break;
  }
  updateSelectedSpellUI();
}
export function unmodifySpell(modifier: string) {
  const spell = currentSpell;
  switch (modifier) {
    case 'Damage':
      spell.damage = (spell.damage || 0) - 1;
      break;
    case 'Heal':
      spell.damage = (spell.damage || 0) + 1;
      break;
    case 'Freeze':
      spell.freeze = (spell.freeze || 0) - 1;
      break;
    case 'Chain':
      spell.chain = false;
      break;
    case 'AOE':
      spell.aoe_radius = (spell.aoe_radius || 0) - 1;
      break;
    case 'Shield':
      spell.shield = (spell.shield || 0) - 1;
      break;
  }
  updateSelectedSpellUI();
}
export function getImage(s: Spell) {
  let imgPath = 'images/spell/damage.png';
  if (s.damage) {
    imgPath = 'images/spell/damage.png';
  }
  if (s.freeze > 0) {
    imgPath = 'images/spell/freeze.png';
  }
  if (s.chain) {
    imgPath = 'images/spell/chain.png';
  }
  if (s.aoe_radius > 0) {
    imgPath = 'images/spell/aoe.png';
  }
  if (s.shield > 0) {
    imgPath = 'images/spell/shield.png';
  }
  return imgPath;
}
export function toString(s?: Spell) {
  if (!s) {
    return '';
  }
  const strings = [];
  if (s.damage > 0) {
    strings.push(`${s.damage}🔥`);
  }
  if (s.damage < 0) {
    strings.push(`${Math.abs(s.damage)}✨`);
  }
  if (s.freeze > 0) {
    strings.push(`${s.freeze}🧊`);
  }
  if (s.chain) {
    strings.push('⚡');
  }
  if (s.aoe_radius > 0) {
    strings.push(`${s.aoe_radius}💣`);
  }
  if (s.shield > 0) {
    strings.push('🛡️');
  }
  return strings.join(' ');
}
export interface EffectArgs {
  unit?: Unit.IUnit;
  // Used to prevent infinite loops when recuring via chain for example
  ignore?: Unit.IUnit[];
}
export function effect(spell: Spell, args: EffectArgs) {
  const { unit, ignore = [] } = args;
  if (unit && ignore.includes(unit)) {
    return;
  }
  if (unit && spell.damage) {
    floatingText({
      cellX: unit.x,
      cellY: unit.y,
      text: toString(spell),
      color: 'red',
    });
    Unit.takeDamage(unit, spell.damage, 'spell');
  }
  if (unit && spell.freeze > 0) {
    unit.frozenForTurns += spell.freeze;
    const frozenSprite = unit.image.addSubSprite(
      'images/spell/freeze.png',
      'frozen',
    );
    frozenSprite.alpha = 0.5;
    frozenSprite.anchor.x = 0;
    frozenSprite.anchor.y = 0;
    frozenSprite.scale.x = 0.5;
    frozenSprite.scale.y = 0.5;
  }
  if (unit && spell.shield > 0) {
    unit.shield += spell.shield * SHIELD_MULTIPLIER;
    const shieldSprite = unit.image.addSubSprite(
      'images/spell/shield.png',
      'shield',
    );
    shieldSprite.alpha = 0.5;
    shieldSprite.anchor.x = 0;
    shieldSprite.anchor.y = 0;
    shieldSprite.scale.x = 0.5;
    shieldSprite.scale.y = 0.5;
  }
  // Show an image when cast occurs
  const castImage = new Image(spell.x, spell.y, getImage(spell));
  castImage.scale(1.5);
  castImage.updateFilter(0);
  castImage.remove();
}
