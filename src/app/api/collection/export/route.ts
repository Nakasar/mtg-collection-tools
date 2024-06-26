import {NextRequest, NextResponse} from "next/server";
import {MongoClient} from "mongodb";

const mongoClient = new MongoClient('mongodb://localhost:27017');
const db = mongoClient.db(process.env.MONGODB_DBNAME);

export async function GET(request: NextRequest) {
  const exportFormat = request.nextUrl.searchParams.get('format');
  switch (exportFormat) {
    case 'moxfield':
      return exportToMoxfield(request);
    default:
      return NextResponse.json({
        error: {
          message: 'Invalid export format'
        },
      }, { status: 400 });
  }
}

async function exportToMoxfield(request: NextRequest) {
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