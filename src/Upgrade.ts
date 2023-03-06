import seedrandom from 'seedrandom';
import type { CardCost } from './cards/cardUtils';
import { cardRarityAsString, getCardRarityColor } from './graphics/ui/CardUI';
import { chooseObjectWithProbability } from './jmath/rand';
import { MESSAGE_TYPES } from './types/MessageTypes';
import { IPlayer } from './entity/Player';
import Underworld from './Underworld';
import { CardCategory, CardRarity, probabilityMap } from './types/commonTypes';
import { poisonCardId } from './cards/poison';
import { bleedCardId } from './cards/bleed';
import { drownCardId } from './cards/drown';
import { suffocateCardId } from './cards/suffocate';
import { isModActive } from './registerMod';
export interface IUpgrade {
  title: string;
  // If a upgrade belongs to a mod, it's modName will be automatically assigned
  // This is used to dictate wether or not the modded upgrade is used
  modName?: string;
  type: 'card' | 'special';
  cardCategory?: CardCategory;
  description: (player: IPlayer) => string;
  thumbnail: string;
  // The maximum number of copies a player can have of this upgrade
  maxCopies?: number;
  // note: effect shouldn't be called directly, use Underworld.chooseUpgrade instead so
  // it will keep track of how many upgrades the player has left to choose
  effect: (player: IPlayer, underworld: Underworld) => void;
  // The probability of getting this as an upgrade
  probability: number;
  cost: CardCost;
}
// Chooses a random card based on the card's probabilities
// minimumProbability ensures that super rare cards won't be presented too early on
// onlyStats: means it'll present stats upgrades instead of card upgrades
export function generateUpgrades(player: IPlayer, numberOfUpgrades: number, minimumProbability: number, underworld: Underworld): IUpgrade[] {
  let upgrades: IUpgrade[] = [];
  const filterUpgrades = (u: IUpgrade) =>
    (u.maxCopies === undefined
      ? // Always include upgrades that don't have a specified maxCopies
      true
      : // Filter out  upgrades that the player can't have more of
      player.upgrades.filter((pu) => pu.title === u.title).length <
      u.maxCopies)
    // Now that upgrades are cards too, make sure it doesn't
    // show upgrades that the player already has as cards
    && !player.cards.includes(u.title)
    && isModActive(u, underworld);
  let filteredUpgradeCardsSource = upgradeCardsSource.filter(filterUpgrades);
  // Every other level, players get to choose from stas upgrades or card upgrades
  // Unless Player already has all of the upgrades, in which case they
  // only have stat upgrades to choose from
  let upgradeList = filteredUpgradeCardsSource;
  // Limit the rarity of cards that are possible to attain
  upgradeList = upgradeList.filter(u => u.probability >= minimumProbability);

  // For third pick, override upgradeList with damage spells
  if (player.upgrades.length == 2) {
    upgradeList = upgradeCardsSource
      // Prevent picking the same upgrade twice
      .filter(filterUpgrades)
      // Ensure they pick from only damage cards
      .filter(c => (![bleedCardId, drownCardId].includes(c.title) && c.cardCategory == CardCategory.Damage) || [poisonCardId, suffocateCardId].includes(c.title));
  }

  // Clone upgrades for later mutation
  const clonedUpgradeSource = [...upgradeList];
  // Choose from upgrades
  const numberOfCardsToChoose = Math.min(
    numberOfUpgrades,
    clonedUpgradeSource.length,
  );
  // Upgrade random generate should be unique for the underworld seed, each player, the number of rerolls that they have,
  // the number of cards that they have  This will prevent save scamming the chances and also make sure each time you are presented with
  // cards it is unique.
  // Note: Only count non-empty card spaces
  const playerUniqueIdentifier = globalThis.numberOfHotseatPlayers > 1 ? player.name : player.clientId;
  const rSeed = `${underworld.seed}-${playerUniqueIdentifier}-${player.reroll}-${player.cards.filter(x => !!x).length}`;
  const random = seedrandom(rSeed);
  for (
    let i = 0;
    // limited by the config.NUMBER_OF_UPGRADES_TO_CHOOSE_FROM or the number of cloned
    // upgrades that are left, whichever is less
    i < numberOfCardsToChoose;
    i++
  ) {
    const upgrade = chooseObjectWithProbability(clonedUpgradeSource, random);
    if (upgrade) {
      const index = clonedUpgradeSource.indexOf(upgrade);
      upgrades = upgrades.concat(clonedUpgradeSource.splice(index, 1));
    } else {
      console.log('No upgrades to choose from', clonedUpgradeSource);
    }
  }
  return upgrades;
}
export function createUpgradeElement(upgrade: IUpgrade, player: IPlayer, underworld: Underworld) {
  if (globalThis.headless) {
    // There is no DOM in headless mode
    return;
  }
  const { pie } = underworld;
  const element = document.createElement('div');
  element.classList.add('card', 'upgrade');
  element.classList.add(cardRarityAsString(upgrade));
  element.dataset.upgrade = upgrade.title;
  const elCardInner = document.createElement('div');
  elCardInner.classList.add('card-inner');
  elCardInner.style.borderColor = getCardRarityColor(upgrade);
  element.appendChild(elCardInner);
  // Card costs
  const elCardBadgeHolder = document.createElement('div');
  elCardBadgeHolder.classList.add('card-badge-holder');
  element.appendChild(elCardBadgeHolder);
  if (upgrade.cost.manaCost) {
    const elCardManaBadge = document.createElement('div');
    elCardManaBadge.classList.add('card-mana-badge', 'card-badge');
    elCardManaBadge.innerHTML = upgrade.cost.manaCost.toString();
    elCardBadgeHolder.appendChild(elCardManaBadge);
  }
  if (upgrade.cost.healthCost) {
    const elCardHealthBadge = document.createElement('div');
    elCardHealthBadge.classList.add('card-health-badge', 'card-badge');
    elCardHealthBadge.innerHTML = upgrade.cost.healthCost.toString();
    elCardBadgeHolder.appendChild(elCardHealthBadge);
  }

  const thumbHolder = document.createElement('div');
  const thumbnail = document.createElement('img');
  thumbnail.src = upgrade.thumbnail;
  thumbHolder.appendChild(thumbnail);
  thumbHolder.classList.add('card-thumb');
  elCardInner.appendChild(thumbHolder);
  const title = document.createElement('h2');
  title.classList.add('card-title');
  title.innerText = i18n(upgrade.title);
  elCardInner.appendChild(title);
  if (upgrade.type === 'card') {
    const rarityText = document.createElement('div');
    rarityText.classList.add('card-rarity')
    rarityText.style.color = getCardRarityColor(upgrade);
    rarityText.innerHTML = cardRarityAsString(upgrade).toLocaleLowerCase();
    elCardInner.appendChild(rarityText);
  }

  const desc = document.createElement('div');
  desc.classList.add('card-description');
  const descriptionText = document.createElement('div');
  descriptionText.innerHTML = upgrade.description(player).trimStart();
  desc.appendChild(descriptionText);

  elCardInner.appendChild(desc);
  element.addEventListener('click', (e) => {
    globalThis.timeLastChoseUpgrade = Date.now();
    // Prevent click from "falling through" upgrade and propagating to vote for overworld level
    e.stopPropagation();
    pie.sendData({
      type: MESSAGE_TYPES.CHOOSE_UPGRADE,
      upgrade,
    });
  });
  element.addEventListener('mouseenter', (e) => {
    playSFXKey('click');
  });
  return element;
}
export function getUpgradeByTitle(title: string): IUpgrade | undefined {
  const all_upgrades = [...upgradeCardsSource, ...upgradeSourceWhenDead];
  return all_upgrades.find((u) => u.title === title);
}
export const upgradeSourceWhenDead: IUpgrade[] = [
  {
    title: 'Resurrect',
    type: 'special',
    description: () => 'Resurrects you so the adventure can continue!',
    // TODO needs new icon
    thumbnail: 'images/upgrades/resurrect.png',
    // Resurrection happens automatically at the start of each level
    effect: () => { },
    probability: 30,
    cost: { healthCost: 0, manaCost: 0 },
  },
];

export const upgradeCardsSource: IUpgrade[] = []

