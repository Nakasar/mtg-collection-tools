const Koa = require('koa');
const Router = require("@koa/router");
const {createWriteStream, createReadStream} = require("fs");
const {join} = require("path");
const {finished} = require("stream/promises");
const {Readable} = require("stream");
const {createInterface} = require("readline");

const app = new Koa();
const router = new Router();

router.post('/refresh-cards-db', async (req, res) => {
    console.info('Starting refreshing card database...');

    const bulkDataMeta = await fetch('https://api.scryfall.com/bulk-data/all-cards').then(res => res.json());

    console.info('Refreshing database from Scryfall using the following bulk data:', bulkDataMeta);

    fetch(bulkDataMeta.download_uri).then(async res => {
        return '922288cb-4bef-45e1-bb30-0c2bd3d3534f';

        if (!res.ok) {
            throw new Error('Response does not include a stream body.');
        }
        if (!res.body){
            throw new Error('Response does not include a stream body.');
        }
        const fileStream = createWriteStream(join(__dirname, `tmp/cards-db-downloads/${bulkDataMeta.id}.json`), {flags: 'w'});
        await finished(Readable.fromWeb(res.body).pipe(fileStream));
        console.info('Bulk DB of all files downloaded.');

        return bulkDataMeta.id;
    }).then(async (fileId) => {
        console.info('Starting import to search db');

        const readInterface = createInterface({
            input: createReadStream(join(__dirname, `tmp/cards-db-downloads/${fileId}.json`))
        });

        let cards = [];

        const batchSize = 50000;

        for await (const line of readInterface){
            if (line.startsWith('[') || line.startsWith(']')) {
                continue;
            }

            const card = JSON.parse(line.trim().replace(/,$/, ''));

            cards.push({
                id: card.id,
                oracle_id: card.oracle_id,
                name: card.name,
                printed_name: card.printed_name,
                printed_text: card.printed_text,
                lang: card.lang,
                released_at: card.released_at,
                mana_cost: card.mana_cost,
                cmc: card.cmc,
                type_line: card.type_line,
                printed_type_line: card.printed_type_line,
                oracle_text: card.oracle_text,
                power: card.power,
                toughness: card.toughness,
                colors: card.colors,
                color_identity: card.color_identity,
                keywords: card.keywords,
                games: card.games,
                set_id: card.set_id,
                set: card.set,
                set_name: card.set_name,
                collector_number: card.collector_number,
                rarity: card.rarity,
                flavor_name: card.flavor_name,
                flavor_text: card.flavor_text,
                artist: card.artist,
                prices: card.prices,
                edhrec_rank: card.edhrec_rank,
                poster: card.image_uris?.normal,
                image_uris: card.image_uris,
                card_faces: card.card_faces?.map(face => ({
                    cmc: face.cmc,
                    mana_cost: face.mana_cost,
                    printed_name: face.printed_name,
                    name: face.name,
                    oracle_text: face.oracle_text,
                    power: face.power,
                    toughness: face.toughness,
                    type_line: face.type_line,
                    colors: face.colors,
                    color_indicator: face.color_indicator,
                    printed_text: face.printed_text,
                    printed_type_line: face.printed_type_line,
                    flavor_text: face.flavor_text,
                    poster: face.image_uris?.normal,
                    image_uris: face.image_uris,
                })),
            });

            if (cards.length >= batchSize) {
                console.debug(`Indexing ${batchSize} cards`);

                await fetch('http://localhost:7700/indexes/cards/documents?primaryKey=id', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cards),
                }).then(res => {
                    if (!res.ok) {
                        console.error(`Error while importing cards batch to search db (${res.status}).`);
                    }
                }).catch(() => {
                    console.error('Error while importing cards batch to search db.');
                });

                cards = [];

                await new Promise((resolve) => setTimeout(resolve, 60000));
            }
        }

        if (cards.length > 0) {
            console.debug(`Indexing ${cards.length} cards`);

            await fetch('http://localhost:7700/indexes/cards/documents?primaryKey=id', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cards),
            }).then(res => {
                if (!res.ok) {
                    console.error(`Error while importing cards batch to search db (${res.status}).`);
                }
            }).catch(() => {
                console.error('Error while importing cards batch to search db.');
            });
        }

        console.log('Finished importing to search db.');
    }).catch(error => {
        console.error('Error while refreshing card database:', error);
    });

    return { success: true };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3080, () => {
    console.info('MTG tools companion server up and running.');
});
