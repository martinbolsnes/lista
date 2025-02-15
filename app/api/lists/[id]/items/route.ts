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

    const items = await db
      .collection('items')
      .find({ listId: new ObjectId(params.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(items);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while fetching items' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
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

    const result = await db.collection('items').insertOne({
      listId: new ObjectId(params.id),
      content,
      completed: false,
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId, completed } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    await db
      .collection('items')
      .updateOne(
        { _id: new ObjectId(itemId), listId: new ObjectId(params.id) },
        { $set: { completed } }
      );

    return NextResponse.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while updating the item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { itemId } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    await db.collection('items').deleteOne({
      _id: new ObjectId(itemId),
      listId: new ObjectId(params.id),
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the item' },
      { status: 500 }
    );
  }
}
