import {NextRequest, NextResponse} from "next/server";
import {MongoClient} from "mongodb";

const mongoClient = new MongoClient('mongodb://localhost:27017');
const db = mongoClient.db('mtg-tools');

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

  collectionFile.text()
    .then((content) => {
      const [separator, header, ...lines] = content.split('\n');

      const cards = lines.map((line) => {
        const [folderName, quantity, tradeQuantity, cardName, setCode, setName, cardNumber, condition, printing, language] = line.split(',');

        return {
          quantity,
          cardName,
          setCode,
          setName,
          cardNumber,
          language,
          printing,
        };
      });

      return cards;
    })
    .then(async cards => {
      await db.collection('collection').insertMany(cards);
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
