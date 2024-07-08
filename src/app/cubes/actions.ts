"use server";

import "server-only";
import {nanoid} from "nanoid";
import {revalidatePath, revalidateTag} from "next/cache";
import {redirect} from "next/navigation";
import neatCsv from "neat-csv";

import clientPromise from "@/lib/mongo";

export type Cube = {
  id: string;
  name: string;
  boosters: CubeBooster[];
};

export type CubeBooster = {
  id: string;
  name: string;
  cards: CubeBoosterCards[];
}

export type CubeBoosterCards = {
  name: string;
  quantity: number;
  owned?: boolean;
  ownedEnough?: boolean;
}

export async function getCubes(): Promise<Cube[]> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);

  const cubes = await db.collection('cubes').find().sort({createdAt: -1}).toArray();

  return cubes.map((cube) => ({
    id: cube.id,
    name: cube.name,
    boosters: cube.boosters,
  }));
}

export async function createCube(formData: FormData): Promise<void> {
  const rawFormData = {
    name: formData.get('name'),
    cubeFile: formData.get('cube-file'),
  };

  if (!rawFormData.name || typeof rawFormData.name !== 'string') {
    throw new Error('Name is required');
  }

  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);

  const cube: Cube = {
    id: nanoid(12),
    name: rawFormData.name,
    boosters: [],
  };

  if (rawFormData.cubeFile) {
    const cubeFile = rawFormData.cubeFile as File;
    const cubeDataString = await cubeFile.text()
    const cubeCsv = await neatCsv(cubeDataString);

    const boosters = cubeCsv.map(row => ({
      boosterName: row['tags'],
      cardName: row['name'],
    })).reduce((acc: { [boosterName: string]: CubeBooster }, card) => {
      if (!acc[card.boosterName]) {
        acc[card.boosterName] = {
          id: nanoid(12),
          name: card.boosterName,
          cards: [{
            name: card.cardName,
            quantity: 1,
          }],
        }
      } else {
        acc[card.boosterName].cards.push({
          name: card.cardName,
          quantity: 1,
        });
      }

      return acc;
    }, {});

    cube.boosters = Object.values(boosters);
  }

  await db.collection('cubes').insertOne(cube);

  revalidateTag('cubes');
  redirect(`/cubes/${cube.id}`);
}

export async function getCube(cubeId: string): Promise<Cube | null> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);

  const cube = await db.collection('cubes').findOne({id: cubeId});

  if (!cube) {
    return null;
  }

  return {
    id: cube.id,
    name: cube.name,
    boosters: cube.boosters,
  };
}

export async function deleteCube(cubeId: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);

  await db.collection('cubes').deleteOne({id: cubeId});

  revalidateTag('cubes');
  redirect(`/cubes`);
}

export async function refreshCube(cubeId: string): Promise<void> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DBNAME);

  const cube = await db.collection<Cube>('cubes').findOne({id: cubeId});

  if (!cube) {
    throw new Error('Cube not found');
  }

  const cards = cube.boosters.flatMap(booster => booster.cards.map(card => ({...card, boosterId: booster.id})));
  const cardsWithBoosters = cards.reduce((acc: { [cardName: string]: string[] }, card) => {
    if (acc[card.name]) {
      acc[card.name].push(card.boosterId);
    } else {
      acc[card.name] = [card.boosterId];
    }

    return acc;
  }, {});

  await Promise.all(Object.entries(cardsWithBoosters).map(async ([cardName, boosterIds]) => {
    const card = await db.collection('collection').aggregate(
      [
        { $match: { cardName } },
        {
          $group: {
            _id: '$cardName',
            quantity: { $sum: '$quantity' }
          }
        }
      ],
      {
        collation: { locale: 'en', strength: 1 }
      }
    ).next();

    if (card && card.quantity > 0) {
      boosterIds.forEach(boosterId => {
        db.collection('cubes').updateOne(
          {id: cubeId, 'boosters.id': boosterId},
          {
            $set: {
              'boosters.$.cards.$[card].owned': true,
              'boosters.$.cards.$[card].ownedEnough': card.quantity >= boosterIds.length,
            }
          },
          {
            arrayFilters: [
              {'card.name': cardName}
            ]
          }
        );
      });
    }
  }));

  revalidatePath(`/cubes/${cubeId}`);
}