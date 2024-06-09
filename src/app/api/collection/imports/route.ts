import {NextRequest, NextResponse} from "next/server";
import neatCsv from "neat-csv";
import clientPromise from "@/lib/mongo";

export async function POST(request: NextRequest) {
  // Retrieve the file in form data and parse the CSV to JSON
  const formData = await request.formData();

  const collectionFile = formData.get('collection-file') as File;

  if (!collectionFile) {
    return NextResponse.json({
      status: 400,
      body: {
        message: 'No file was uploaded.',
      },
    });
  }

  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  let content = await collectionFile.text();

  if (content.startsWith('"sep=,"')) {
    content = content.substring(9);
  }

  neatCsv(content)
    .then((content) => {
      return content.map(row => ({
        quantity: row['Quantity'],
        cardName: row['Card Name'],
        setCode: row['Set Code'],
        setName: row['Set Name'],
        cardNumber: row['Card Number'],
        language: row['Language'],
        printing: row['Printing'],
      }));
    })
    .then(async cards => {
      await db.collection('collection').drop();
      await db.collection('collection').insertMany(cards.filter(card => card.cardName !== null));
    })
    .then(() => {
      console.info('Collection imported successfully.');
    })
    .catch(error => {
      console.error('Error parsing file when importing collection: ', error);
    });


  return NextResponse.json({
    status: 200,
    body: {
      message: 'Collection import triggered.',
    },
  });
}
