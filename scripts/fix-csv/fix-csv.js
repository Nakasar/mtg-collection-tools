const fs = require("node:fs/promises");
const path = require("node:path");
const {parse, stringify} = require("csv/sync");

(async () => {
    const file = await fs.readFile(path.join(__dirname, "input.csv"), "utf8");

    const data = parse(file.toString(), { columns: true });

    data.map(data => {
        if (data.Language === 'French') {
            data.Language = 'English';
        }

        if (!['MH3', 'XLN', 'RNA', 'GRN', 'RIX', 'WAR', 'UST', 'SOI', 'HOU', 'ZNR', 'AER', 'OGW', 'KLD', 'IMA', 'M3C', 'OTJ', 'CMB2', 'CMB1'].includes(data['Set Code'])) {
            data['Set Code'] = 'PLST';
            data['Set Name'] = 'The List';
        }
    });

    await fs.writeFile(path.join(__dirname, "output.csv"), stringify(data, { header: true }));
})();