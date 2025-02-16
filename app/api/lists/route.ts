import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    // Fetch lists owned by the user
    const ownedLists = await db
      .collection('lists')
      .find({ ownerId: userId })
      .toArray();

    // Fetch lists shared with the user
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

    // Combine and format the results
    const combinedLists = [
      ...ownedLists.map((list) => ({ ...list, isOwner: true })),
      ...sharedLists.map((list) => ({ ...list, isOwner: false })),
    ];

    return NextResponse.json(combinedLists);
  } catch (error) {
    console.error(error);
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
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while creating the list' },
      { status: 500 }
    );
  }
}
