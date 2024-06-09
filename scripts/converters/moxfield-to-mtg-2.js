const fs = require('node:fs/promises');
const path = require('node:path');

const folder = 'MH3';
const lang = 'French';
const cardLineRegex = /(?<quantity>[0-9]{1,2}) (?<name>.+) \((?<set>[A-Z0-9]{3,4})\) (?<code>[0-9]{1,5})(?<foil> \*F\*){0,1}/gm;
const sets = {
    'OTJ': 'Outlaws of Thunder Junction',
    'OTC': 'Outlaws of Thunder Junction Commander',
    '40K': '"Warhammer 40,000"',
    'CLU': 'Ravnica: Clue Edition',
    'MH3': 'Modern Horizons 3',
    'M3C': 'Modern Horizons 3 Commander'
};
(async () => {
    const input = await fs.readFile(path.join(__dirname, './input.txt'));

    const cards = [...input.toString().matchAll(cardLineRegex)];

    const header = 'Folder Name,Quantity,Trade Quantity,Card Name,Set Code,Set Name,Card Number,Condition,Printing,Language,Price Bought,Date Bought';
    const cardLines = cards.map((card) => {
        const sanitizedName = card.groups.name.includes(',') ? `"${card.groups.name}"` : card.groups.name;

        if (!sets[card.groups.set]) {
            throw new Error(`Set not found for card: ${card.groups.name} (${card.groups.set})`);
        }

        return `${folder},${card.groups.quantity},0,${sanitizedName},${card.groups.set},${sets[card.groups.set]},${card.groups.code},NearMint,${card.groups.foil ? 'Foil' : 'Normal'},${lang},0.5,05/09/2024`;
    });

    await fs.writeFile(path.join(__dirname, './output.csv'), [header, ...cardLines].join('\n'));
})();
