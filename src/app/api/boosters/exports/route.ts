import clientPromise from "@/lib/mongo";
import {NextResponse} from "next/server";
import {Booster, Card} from "@/app/boosters/actions";
import {MAGIC_SETS} from "@/constants/mtg-sets";
import {DateTime} from "luxon";

export async function POST(request: Request) {
  const body = await request.json();

  if (!['JSON', 'DRAGONSHIELD', 'DATABASE'].includes(body.format)) {
    return NextResponse.json({ error: 'Invalid format (accepted: JSON, DRAGONSHIELD' }, { status: 400 });
  }

  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const filter = body.format === 'DATABASE' ? {} : { archived: false };

  const boosters = body.allBoosters ? await db.collection<Booster>('boosters').find(filter).toArray() : await db.collection<Booster>('boosters').find({
    id: {
      $in: body.boosters
    }
  }).toArray();

  if (body.format === 'JSON' || body.format === 'DATABASE') {
    return NextResponse.json(boosters, {
      headers: {
        'filename': 'boosters-export.json',
      },
    });
  } else if (body.format === 'DRAGONSHIELD') {
    const date = new Date();

    const cards = boosters.reduce((acc: (Card & { createdAt: string; lang: string })[], booster) => {
      return acc.concat(booster.cards.map(card => ({ ...card, createdAt: booster.createdAt, lang: booster.lang })));
    }, []);

    const header = 'Folder Name,Quantity,Trade Quantity,Card Name,Set Code,Set Name,Card Number,Condition,Printing,Language,Price Bought,Date Bought';
    const cardLines = cards.map((card) => {
      const sanitizedName = card.name.includes(',') ? `"${card.name}"` : card.name;

      if (!MAGIC_SETS[card.setCode.toUpperCase()]) {
        throw new Error(`Set not found for card: ${card.name} (${card.setCode.toUpperCase()})`);
      }

      const cardDate = DateTime.fromISO(card.createdAt ?? date.toISOString());

      return `${'ACR'},1,0,${sanitizedName},${card.setCode.toUpperCase()},${MAGIC_SETS[card.setCode.toUpperCase()]},${card.collectorNumber},NearMint,${card.foil ? 'Foil' : 'Normal'},${card.lang},0.5,${cardDate.toFormat('dd/LLL/yyyy')}`;
    });

    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('filename', 'booster-cards-export-for-dragonshield.csv');

    return new NextResponse(header + '\n' + cardLines.join('\n'), { status: 200, headers: headers });
  } else {
    return NextResponse.json({ error: 'Invalid format (accepted: JSON, DRAGONSHIELD' }, { status: 400 });
  }
}
