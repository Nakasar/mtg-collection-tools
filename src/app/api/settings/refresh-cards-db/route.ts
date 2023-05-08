import {NextResponse} from "next/server";

export async function POST() {
  await fetch('http://localhost:3080/refresh-cards-db', {
    method: 'POST',
  });

  return NextResponse.json({
    status: 200,
    body: {
      message: 'Refresh of card database triggered.'
    },
  });
}
