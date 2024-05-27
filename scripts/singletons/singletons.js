const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
    const input = await fs.readFile(path.join(__dirname, './input.txt'));
    const cards = input.toString().split('\r\n');

    const uniques = new Set(cards);

    const lines = [...uniques.keys()].map(card => {
        return `${card} (UNF)`;
    });

    await fs.writeFile(path.join(__dirname, './output.txt'), lines.join('\n'));
})();
