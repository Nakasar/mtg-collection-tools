'use server';

import "server-only";

import clientPromise from "@/lib/mongo";
import {nanoid} from "nanoid";
import {revalidateTag} from "next/cache";
import {redirect} from "next/navigation";
import {MeiliSearch} from "meilisearch";
import BigNumber from "bignumber.js";

const client = new MeiliSearch({
  host: 'http://127.0.0.1:7700',
});

export type Card = {
  id: string;
  name: string;
  setCode: string;
  collectorNumber: string;
  foil: boolean;
  imageUrl: string;
  price?: string;
  newInCollection?: boolean;
};

export type Booster = {
  setCode: string; // Set code (MH3, OTJ, ...)
  lang: string;
  type: string; // Play Booster, Set Booster, Draft Booster, Jumpstart, ...
  id: string;
  cards: Card[];
  price?: string;
  archived: boolean;
  createdAt: string;
};

export async function getBoosters(): Promise<Booster[]> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const boosters = await db.collection<Booster>('boosters')
    .find()
    .sort({createdAt: -1})
    .toArray();

  return boosters.map((booster) => ({
    setCode: booster.setCode,
    lang: booster.lang,
    id: booster.id,
    type: booster.type,
    cards: booster.cards,
    price: booster.price,
    createdAt: booster.createdAt,
    archived: booster.archived,
  }));
}

export async function getBooster(boosterId: Booster['id']): Promise<Booster | null> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({id: boosterId});

  if (!booster) {
    return null;
  }

  const cardNames = booster.cards.map((card) => card.name);

  const cardsInCollection = await db.collection('collection').aggregate(
    [
      { $sort: { cardName: 1 } },
      {
        $group:
          {
            _id: "$cardName",
            cardName: { $first: "$cardName" }
          }
      },
      { $match: { _id: { $in: cardNames } } },
    ]
  ).toArray();


  console.log(cardNames);
  console.log(cardsInCollection);

  booster.cards.map((card) => {
    if (!cardsInCollection.find((cardInCollection) => cardInCollection._id === card.name)) {
      card.newInCollection = true;
    }
  });


  return {
    setCode: booster.setCode,
    id: booster.id,
    lang: booster.lang,
    type: booster.type,
    cards: booster.cards,
    price: booster.price,
    createdAt: booster.createdAt,
    archived: booster.archived,
  };
}

export async function deleteBooster(boosterId: Booster['id']): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  await db.collection<Booster>('boosters').deleteOne({id: boosterId});

  revalidateTag('boosters');
  redirect('/boosters');
}

export async function addCardToBoster(boosterId: Booster['id'], card: {
  setCode: string;
  collectorNumber: string;
  foil: boolean;
}): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({id: boosterId});

  if (!booster) {
    throw new Error('Booster not found');
  }

  const index = client.index('cards');
  const result = await index.search("", {
    filter: [`set = ${card.setCode}`, `collector_number = ${card.collectorNumber}`, `lang IN [${booster.lang}, en]`],
  });

  if (result.hits.length === 0) {
    throw new Error('Card not found');
  }

  const cardFound = result.hits[0];

  let cardPrice = 0;
  if (card.foil) {
    cardPrice = cardFound.prices?.eur_foil ?? (cardFound.prices?.usd_foil ? BigNumber(cardFound.prices?.usd_foil).multipliedBy(0.92) : 0);
  } else {
    cardPrice = cardFound.prices?.eur ?? (cardFound.prices?.usd ? BigNumber(cardFound.prices?.usd).multipliedBy(0.92) : 0);
  }

  let imageUrl = cardFound.image_uris ? cardFound.image_uris?.small : cardFound.card_faces ? cardFound.card_faces[0]?.image_uris?.small : null;

  const cardData = {
    id: nanoid(12),
    name: cardFound.name,
    setCode: cardFound.set,
    collectorNumber: cardFound.collector_number,
    foil: card.foil,
    imageUrl: imageUrl,
    price: BigNumber(cardPrice).toFixed(2),
  };

  const boosterPrice = booster.price ? BigNumber(booster.price) : BigNumber(0);
  const newPrice = boosterPrice.plus(cardPrice);

  await db.collection<Booster>('boosters').updateOne({id: boosterId}, {
    $push: {cards: cardData},
    $set: {price: newPrice.toFixed(2)},
  });

  revalidateTag('boosters');
}

export async function removeCardFromBooster(boosterId: Booster['id'], cardId: Card['id']): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({id: boosterId});

  if (!booster) {
    throw new Error('Booster not found');
  }

  await db.collection<Booster>('boosters').updateOne({id: boosterId}, {$pull: {cards: {id: cardId}}});

  revalidateTag('boosters');
}

export async function updateCardInBooster(boosterId: Booster['id'], cardId: Card['id'], data: Partial<Card>): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({id: boosterId});

  if (!booster) {
    throw new Error('Booster not found');
  }

  const update: Record<string, any> = {};

  if (data.foil !== undefined) {
    update['cards.$.foil'] = data.foil;
    update['cards.$.price'] = undefined;
  }

  await db.collection<Booster>('boosters').updateOne({id: boosterId, 'cards.id': cardId}, {$set: update});

  revalidateTag('boosters');
}

export async function refreshBoosterPrices(boosterId: Booster['id']): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({id: boosterId});

  if (!booster) {
    throw new Error('Booster not found');
  }

  let boosterPrice = BigNumber(0);

  const index = client.index('cards');

  for (const card of booster.cards) {
    const result = await index.search("", {
      filter: [`set = ${card.setCode}`, `collector_number = ${card.collectorNumber}`, `lang IN [${booster.lang}, en]`],
    });

    if (result.hits.length === 0) {
      throw new Error('Card not found');
    }

    let cardFound = result.hits[0];

    if (cardFound.prices.eur === null && result.hits[1]) {
      cardFound = result.hits[1];
    }

    if (cardFound) {
      let cardPrice = 0;
      if (card.foil) {
        cardPrice = cardFound.prices?.eur_foil ?? (cardFound.prices?.usd_foil ? BigNumber(cardFound.prices?.usd_foil).multipliedBy(0.92) : 0);
      } else {
        cardPrice = cardFound.prices?.eur ?? (cardFound.prices?.usd ? BigNumber(cardFound.prices?.usd).multipliedBy(0.92) : 0);
      }

      boosterPrice = boosterPrice.plus(cardPrice);

      await db.collection<Booster>('boosters').updateOne({
        id: boosterId,
        'cards.id': card.id
      }, {$set: {'cards.$.price': cardPrice.toString()}});
    }
  }

  await db.collection<Booster>('boosters').updateOne({id: boosterId}, {$set: {price: boosterPrice.toString()}});

  revalidateTag('boosters');
}

export async function createBooster(formData: FormData): Promise<void> {
  const rawFormData = {
    setCode: formData.get('setCode'),
    boosterType: formData.get('boosterType'),
    lang: formData.get('lang'),
  };

  if (!rawFormData.setCode || !rawFormData.boosterType || !rawFormData.lang || typeof rawFormData.setCode !== 'string' || typeof rawFormData.boosterType !== 'string' || typeof rawFormData.lang !== 'string') {
    throw new Error('Invalid form data');
  }

  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = {
    lang: rawFormData.lang,
    id: nanoid(12),
    setCode: rawFormData.setCode,
    type: rawFormData.boosterType,
    cards: [],
    createdAt: new Date().toISOString(),
    archived: false,
  };

  await db.collection<Booster>('boosters').insertOne(booster);

  revalidateTag('boosters');
  redirect(`/boosters/${booster.id}`);
}

export async function archiveBoosters(boosterIds: string[]): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  await db.collection('boosters').updateMany({id: {$in: boosterIds}}, {$set: {archived: true}});
  revalidateTag('boosters');
}

export async function archiveAllBoosters(): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  await db.collection('boosters').updateMany({}, {$set: {archived: true}});
  revalidateTag('boosters');
}

export async function refreshPrices(boosterIds: string[]): Promise<void> {
  await Promise.all(boosterIds.map(async (boosterId) => {
    await refreshBoosterPrices(boosterId);
  }));

  revalidateTag('boosters');
}

export async function refreshPricesAllBoosters(): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const boosters = await db.collection<Booster>('boosters').find().project({id: 1}).toArray();

  const boosterIds = boosters.map((booster) => booster.id);

  await refreshPrices(boosterIds);

  revalidateTag('boosters');
}
