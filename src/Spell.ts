import type Game from './Game';
import type { IPlayer } from './Player';
import * as Unit from './Unit';
import floatingText from './FloatingText';
import Image from './Image';

export interface Spell {
  caster?: IPlayer;
  x?: number;
  y?: number;
  // index in spell pool
  index: number;
  // damage can be negative for healing
  damage?: number;
  freeze?: boolean;
  chain?: boolean;
  aoe_radius?: number;
  image?: Image;
}

export function modifySpell(modifier: string, spell?: Spell) {
  switch (modifier) {
    case 'Damage':
      spell.damage = (spell.damage || 0) + 1;
      break;
    case 'Heal':
      spell.damage = (spell.damage || 0) - 1;
      break;
    case 'Freeze':
      spell.freeze = true;
      break;
    case 'Chain':
      spell.chain = true;
      break;
    case 'AOE':
      spell.aoe_radius = (spell.aoe_radius || 0) + 1;
      break;
  }
}
export function getImage(s: Spell) {
  let imgPath = 'spell/damage.png';
  if (s.damage) {
    imgPath = 'spell/damage.png';
  }
  if (s.freeze) {
    imgPath = 'spell/freeze.png';
  }
  if (s.chain) {
    imgPath = 'spell/chain.png';
  }
  if (s.aoe_radius > 0) {
    imgPath = 'spell/aoe.png';
  }
  return imgPath;
}
function toString(s: Spell) {
  const strings = [];
  if (s.damage > 0) {
    strings.push('Hurt');
  }
  if (s.damage < 0) {
    strings.push('Heal');
  }
  if (s.freeze) {
    strings.push('Freeze');
  }
  if (s.chain) {
    strings.push('Chain');
  }
  if (s.aoe_radius > 0) {
    strings.push('AOE');
  }
  return strings.join('|');
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
  if (unit && spell.freeze) {
    unit.frozen = true;
  }
  // Show an image when cast occurs
  const castImage = new Image(spell.x, spell.y, 0, 0, getImage(spell));
  castImage.scale(1.5);
  castImage.updateFilter(0);
  castImage.remove();
}
