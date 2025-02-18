import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const ownedLists = await db
      .collection('lists')
      .find({ ownerId: userId })
      .toArray();

    const sharedListIds = await db
      .collection('list_permissions')
      .find({ userId: userId })
      .toArray();

    const sharedListObjectIds = sharedListIds.map(
      (permission) => permission.listId
    );

    const sharedLists = await db
      .collection('lists')
      .find({ _id: { $in: sharedListObjectIds } })
      .toArray();

    const combinedLists = [
      ...ownedLists.map((list) => ({ ...list, isOwner: true })),
      ...sharedLists.map((list) => ({ ...list, isOwner: false })),
    ];

    return NextResponse.json(combinedLists);
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while fetching lists' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    const result = await db.collection('lists').insertOne({
      name,
      ownerId: userId,
      createdAt: new Date(),
    });

    return NextResponse.json({ listId: result.insertedId }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while creating the list' },
      { status: 500 }
    );
  }
}
