import clientPromise from "@/lib/mongo";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  const mongoClient = await clientPromise;
  const db = mongoClient.db(process.env.MONGODB_DBNAME);

  if (body.allBoosters) {
    const boosters = await db.collection('boosters').find().toArray();

    return NextResponse.json(boosters);
  }

  const boosters = await db.collection('boosters').find({
    id: {
      $in: body.boosters
    }
  }).toArray();

  return NextResponse.json(boosters);
}
