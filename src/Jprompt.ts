import * as storage from './storage';
interface Prompt {
    text: string;
    noBtnText?: string;
    noBtnKey?: string;
    yesText: string;
    yesKey: string;
    yesKeyText: string;
    imageSrc?: string;
}
export default async function Jprompt(prompt: Prompt): Promise<boolean> {
    const { text, noBtnText, noBtnKey, yesText, yesKey, yesKeyText, imageSrc } = prompt;
    const el = document.createElement('div')
    el.classList.add('prompt');
    el.innerHTML = `
<div class="prompt-inner">
    ${imageSrc ? `<div class="text-center"><img src="${imageSrc}"/></div>` : ''}
    <p class="text">
        ${text}
    </p>
    <div class="button-holder">
        ${noBtnText ? `<button class="no jbutton" data-key="${noBtnKey}"> ${noBtnText}
            <div class="hotkey-badge-holder">
                <kbd class="hotkey-badge">${noBtnKey}</kbd>
            </div>
        </button>` : ''}
        <button class="yes jbutton" data-key="${yesKey}">${yesText}
            <div class="hotkey-badge-holder">
                <kbd class="hotkey-badge">${yesKeyText}</kbd>
            </div>
        </button>
    </div>
</div>
`;
    document.body.appendChild(el);

    return new Promise<boolean>((res) => {
        const noBtn = el.querySelector('.no') as HTMLElement;
        const yesBtn = el.querySelector('.yes') as HTMLElement;
        if (noBtn) {
            noBtn.addEventListener('click', (e) => {
                res(false);
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        }
        // Click outside is the same as no
        // unless there is only a yes button, then it clicks yes
        const cancelFn = (e: MouseEvent) => {
            // Ignore clicks on the prompt inner
            if (!(e.target && (e.target as Element).closest('.prompt-inner'))) {
                // Handle clicks outside the prompt the same as if the user clicked the no/cancel button
                if (noBtn) {
                    noBtn.click();
                } else if (yesBtn) {
                    // If there is only a yesBtn, then a click outside would represent "Acknoledged"
                    yesBtn.click();
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        }
        el.addEventListener('click', cancelFn);
        el.addEventListener('contextmenu', cancelFn);
        if (yesBtn) {
            yesBtn.addEventListener('click', (e) => {
                res(true);
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
        }
    }).then((result) => {
        document.body.removeChild(el);
        return result;
    });
}

export function explainManaOverfill() {
    if (window.player) {
        if (window.player.unit.mana > window.player.unit.manaMax && window.allowCookies) {
            const MANA_INFO_STORAGE_KEY = 'mana-info';
            const YES = 'y'
            if (storage.get(MANA_INFO_STORAGE_KEY) != YES) {
                Jprompt({ imageSrc: 'images/pickups/mana-potion_1.png', text: 'You are able to fill your mana up to 3x its maximum amount using potions or spells.', yesText: 'Cool!', yesKey: 'Space', yesKeyText: 'Spacebar' });
                storage.set(MANA_INFO_STORAGE_KEY, YES);
            }
        }
    }
}