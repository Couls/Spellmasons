
import { Mod } from '../types/types/commonTypes';

//Imports for spells here
import Vampire_bite from './cards/Vampire_bite';
import Summon_trap from './cards/Summon_trap';
import Sadism from './cards/Sadism'
import Burning_Rage from './cards/Burning_rage'
// import Thorns from './cards/Thorns'
import Caltrops from './cards/Caltrops'

const mod: Mod = {
    modName: 'Rene\s gimmicks',
    author: 'Renesans123/Edeusz',
    description: 'Adds some new spells to the game',
    screenshot: 'spellmasons-mods/Renes_gimmicks/graphics/icons/Renes_Gimmicks_icon.png',
    spells: [
        //Add or Remove spells here.
        Vampire_bite,
        Summon_trap,
        Sadism,
        Burning_Rage,
        Caltrops, //OnMove doesnt seem to be implemented
        //Thorns,//composeOnDamageEvents do not pass argument damageDealer right now
    ],
    spritesheet: 'spellmasons-mods/Renes_gimmicks/graphics/icons/renes_spritesheet.json'
};
export default mod;