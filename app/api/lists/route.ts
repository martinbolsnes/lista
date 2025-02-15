import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pathname } = request.nextUrl;
    const listId = pathname.split('/').pop(); // Extract listId from URL

    if (!listId) {
      return NextResponse.json(
        { error: 'List ID is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const lists = await db
      .collection('lists')
      .find({ ownerId: userId })
      .toArray();

    return NextResponse.json(lists);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching lists' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
