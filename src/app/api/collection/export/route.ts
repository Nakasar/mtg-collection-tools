import {NextRequest, NextResponse} from "next/server";
import clientPromise from "@/lib/mongo";

export async function GET(request: NextRequest) {
  const exportFormat = request.nextUrl.searchParams.get('format');
  switch (exportFormat) {
    case 'moxfield':
      return exportToMoxfield(request);
    case 'mtgo':
      return exportToMTGO(request);
    default:
      return NextResponse.json({
        error: {
          message: 'Invalid export format'
        },
      }, { status: 400 });
  }
}

async function exportToMoxfield(request: NextRequest) {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const cardsCursor = db.collection('collection').find({});

  const result = [
    "\"Count\",\"Tradelist Count\",\"Name\",\"Edition\",\"Condition\",\"Language\",\"Foil\",\"Tags\",\"Last Modified\",\"Collector Number\",\"Alter\",\"Proxy\",\"Purchase Price\""
  ];

  for await (const card of cardsCursor) {
    if (card.cardName.includes('Brudiclad')) {
      console.log(card);
    }

    let cardSetCode = card.setCode?.toLowerCase() ?? '';
    if (['mb1', 'pctb', 'pagl', 'peld', 'pthb'].includes(cardSetCode)) {
      cardSetCode = 'plst';
    }

    result.push(
      `"${card.quantity}","${card.quantity}","${card.cardName}","${cardSetCode}","","${card.language}","${card.printing?.toLowerCase() ?? ''}","","","${card.cardNumber}","","",""`
    );
  }

  return new Response(
    result.join('\n'),
    {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="moxfield-export.csv"',
      },
    },
  );
}

async function exportToMTGO(request: NextRequest) {
  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  const cardsCursor = db.collection('collection').find({});

  const result = [];

  for await (const card of cardsCursor) {
    let cardSetCode = card.setCode?.toLowerCase() ?? '';
    if (['mb1', 'pctb', 'pagl', 'peld', 'pthb'].includes(cardSetCode)) {
      cardSetCode = 'plst';
    }

    result.push(
      `${card.quantity} ${card.cardName} (${cardSetCode}) ${card.cardNumber} ${card.printing?.toLowerCase() === 'foil' ? '*F*' : ''}`
    )
  }

  return new Response(
    result.join('\n'),
    {
      headers: {
        'Content-Type': 'text/txt',
        'Content-Disposition': 'attachment; filename="mtgo-export.txt"',
      },
    },
  );
}