import {NextRequest, NextResponse} from "next/server";
import {MongoClient} from "mongodb";
import {MeiliSearch} from "meilisearch";

const mongoClient = new MongoClient('mongodb://localhost:27017');
const db = mongoClient.db('mtg-tools');

const meiliClient = new MeiliSearch({
  host: 'http://localhost:7700',
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (!body.cards) {
    return NextResponse.json({
      status: 400,
      body: {
        message: 'No cards were provided.',
      },
    });
  }

  const cardsToFind: ({
    name: string,
    collectorNumber: string,
    set: string,
    setName: string,
    colors: string[],
  } | null)[] = await Promise.all(
    body.cards.map(
      async (cardRaw: string) => {
        let cardFound: any = null;

        if (cardRaw.includes("cn:") && cardRaw.includes("e:")) {
          const searchResults = await meiliClient.index('cards').search('', {
            filter: [`collector_number = ${cardRaw.split('cn:')[1].split(' ')[0]}`, `set = ${cardRaw.split('e:')[1].split(' ')[0]}`],
          });

          if (searchResults.hits.length === 0) {
            return null;
          }

          cardFound = searchResults.hits[0];
        } else {
          const searchResults = await meiliClient.index('cards').search(cardRaw);
          if (searchResults.hits.length === 0) {
            return null;
          }

          cardFound = searchResults.hits[0];
        }

        if (!cardFound) {
          return null;
        }

        return {
          query: cardRaw,
          name: cardFound.name,
          collectorNumber: cardFound.collector_number,
          set: cardFound.set,
          setName: cardFound.set_name,
          colors: cardFound.colors,
        };
      },
    ),
  );



  const collectionMatch = await Promise.all(
    cardsToFind
      .filter(card => card !== null)
      .map(async (card) => {
        if (!card) {
          return null;
        }

        const cardsInCollection = await db.collection('collection').find({
          cardName: card.name,
        }).toArray();

        return {
          card,
          collection: {
            quantity: cardsInCollection.reduce((acc, card) => acc + parseInt(card.quantity), 0),
          },
        };
      }),
    );

  return NextResponse.json(collectionMatch.filter(match => match !== null));
}
