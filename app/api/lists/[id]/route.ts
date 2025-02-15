import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { getUserIdFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const list = await db.collection('lists').findOne({
      _id: new ObjectId(params.id),
      $or: [
        { ownerId: new ObjectId(userId) },
        { 'permissions.userId': new ObjectId(userId) },
      ],
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the list' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    const list = await db.collection('lists').findOne({
      _id: new ObjectId(params.id),
      $or: [
        { ownerId: new ObjectId(userId) },
        {
          'permissions.userId': new ObjectId(userId),
          'permissions.access': 'edit',
        },
      ],
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    const result = await db.collection('items').insertOne({
      listId: new ObjectId(params.id),
      content,
      createdAt: new Date(),
    });

    return NextResponse.json({ itemId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while adding the item' },
      { status: 500 }
    );
  }
}
