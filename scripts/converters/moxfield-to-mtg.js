const fs = require('node:fs/promises');
const path = require('node:path');

const cardLineRegex = /1 (?<name>.+) \((?<set>[A-Z0-9]{3,4})\) (?<code>[0-9]{1,5})(?<foil> \*F\*){0,1}/gm;
(async () => {
    const input = await fs.readFile(path.join(__dirname, './input.txt'));

    const cards = [...input.toString().matchAll(cardLineRegex)];

    const header = 'Count,Tradelist Count,Name,Edition,Condition,Language,Foil,Tags,Last Modified,Collector Number';
    const cardLines = cards.map((card) => {
        const sanitizedName = card.groups.name.includes(',') ? `"${card.groups.name}"` : card.groups.name;
        return `1,0,${sanitizedName},${card.groups.set.toLowerCase()},Near Mint,French,${card.groups.foil ? 'foil' : ''},,,${card.groups.code}`;
    });

    await fs.writeFile(path.join(__dirname, './output.csv'), [header, ...cardLines].join('\n'));
})();
