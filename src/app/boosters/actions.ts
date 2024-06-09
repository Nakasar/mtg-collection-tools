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
};

export type Booster = {
  setCode: string; // Set code (MH3, OTJ, ...)
  type: string; // Play Booster, Set Booster, Draft Booster, Jumpstart, ...
  id: string;
  cards: Card[];
  price?: string;
};

export async function getBoosters(): Promise<Booster[]> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const boosters = await db.collection<Booster>('boosters').find().toArray();

  return boosters.map((booster) => ({
    setCode: booster.setCode,
    id: booster.id,
    type: booster.type,
    cards: booster.cards,
    price: booster.price,
  }));
}

export async function getBooster(boosterId: Booster['id']): Promise<Booster | null> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({ id: boosterId });

  if (!booster) {
    return null;
  }

  return {
    setCode: booster.setCode,
    id: booster.id,
    type: booster.type,
    cards: booster.cards,
    price: booster.price,
  };
}

export async function deleteBooster(boosterId: Booster['id']): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  await db.collection<Booster>('boosters').deleteOne({ id: boosterId });

  revalidateTag('boosters');
  redirect('/boosters');
}

export async function addCardToBoster(boosterId: Booster['id'], card: { setCode: string; collectorNumber: string }): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({ id: boosterId });

  if (!booster) {
    throw new Error('Booster not found');
  }

  const index = client.index('cards');
  const result = await index.search("", {
    filter: [`set = ${card.setCode}`, `collector_number = ${card.collectorNumber}`],
  });

  if (result.hits.length === 0) {
    throw new Error('Card not found');
  }

  const cardFound = result.hits[0];

  const cardPrice = (cardFound.foil ? cardFound.prices?.eur_foil : cardFound.prices?.eur) ?? 0;

  const cardData = {
    id: nanoid(12),
    name: cardFound.name,
    setCode: cardFound.set,
    collectorNumber: cardFound.collector_number,
    foil: cardFound.foil,
    imageUrl: cardFound.card_faces ? cardFound.card_faces[0].image_uris.small : cardFound.image_uris.small,
    price: cardPrice.toString(),
  };

  const boosterPrice = booster.price ? BigNumber(booster.price) : BigNumber(0);
  const newPrice = boosterPrice.plus(cardPrice);

  await db.collection<Booster>('boosters').updateOne({ id: boosterId }, {
    $push: { cards: cardData },
    $set: { price: newPrice.toString() },
  });

  revalidateTag('boosters');
}

export async function removeCardFromBooster(boosterId: Booster['id'], cardId: Card['id']): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({ id: boosterId });

  if (!booster) {
    throw new Error('Booster not found');
  }

  await db.collection<Booster>('boosters').updateOne({ id: boosterId }, { $pull: { cards: { id: cardId } } });

  revalidateTag('boosters');
}

export async function updateCardInBooster(boosterId: Booster['id'], cardId: Card['id'], data: Partial<Card>): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({ id: boosterId });

  if (!booster) {
    throw new Error('Booster not found');
  }

  const update: Record<string, any> = {};

  if (data.foil !== undefined) {
    update['cards.$.foil'] = data.foil;
    update['cards.$.price'] = undefined;
  }

  await db.collection<Booster>('boosters').updateOne({ id: boosterId, 'cards.id': cardId }, { $set: update });

  revalidateTag('boosters');
}

export async function refreshBoosterPrices(boosterId: Booster['id']): Promise<void> {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = await db.collection<Booster>('boosters').findOne({ id: boosterId });

  if (!booster) {
    throw new Error('Booster not found');
  }

  let boosterPrice = BigNumber(0);

  const index = client.index('cards');

  for (const card of booster.cards) {
    const result = await index.search("", {
      filter: [`set = ${card.setCode}`, `collector_number = ${card.collectorNumber}`],
    });

    if (result.hits.length === 0) {
      throw new Error('Card not found');
    }

    const cardFound = result.hits[0];

    const cardPrice = (card.foil ? cardFound.prices?.eur_foil : cardFound.prices?.eur) ?? 0;
    boosterPrice = boosterPrice.plus(cardPrice);

    await db.collection<Booster>('boosters').updateOne({ id: boosterId, 'cards.id': card.id }, { $set: { 'cards.$.price': cardPrice.toString() } });
  }

  await db.collection<Booster>('boosters').updateOne({ id: boosterId }, { $set: { price: boosterPrice.toString() } });

  revalidateTag('boosters');
}

export async function createBooster(formData: FormData): Promise<void> {
  const rawFormData = {
    setCode: formData.get('setCode'),
    boosterType: formData.get('boosterType'),
  };

  if (!rawFormData.setCode || !rawFormData.boosterType || typeof rawFormData.setCode !== 'string' || typeof rawFormData.boosterType !== 'string') {
    throw new Error('Invalid form data');
  }

  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const booster = {
    id: nanoid(12),
    setCode: rawFormData.setCode,
    type: rawFormData.boosterType,
    cards: [],
  };

  await db.collection<Booster>('boosters').insertOne(booster);

  revalidateTag('boosters');
  redirect(`/boosters/${booster.id}`);
}
