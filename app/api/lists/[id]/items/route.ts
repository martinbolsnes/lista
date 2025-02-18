import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';
import pusherServer from '@/lib/pusher-server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const segments = request.nextUrl.pathname.split('/');
    const listId = segments[segments.length - 2];
    if (!listId) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const items = await db
      .collection('items')
      .find({ listId: new ObjectId(listId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while fetching items' },
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

    const segments = request.nextUrl.pathname.split('/');
    const listId = segments[segments.length - 2];

    if (!listId || !ObjectId.isValid(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const { content } = await request.json();
    console.log('Received content:', content);

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const result = await db.collection('items').insertOne({
      listId: new ObjectId(listId),
      content,
      completed: false,
      createdAt: new Date(),
    });

    const newItem = {
      _id: result.insertedId,
      listId: new ObjectId(listId),
      content,
      completed: false,
      createdAt: new Date(),
    };

    await pusherServer.trigger(`list-${listId}`, 'item-added', newItem);

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while adding the item' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const segments = request.nextUrl.pathname.split('/');
    const listId = segments[segments.length - 2];
    if (!listId) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const { itemId, completed } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    await db
      .collection('items')
      .updateOne(
        { _id: new ObjectId(itemId), listId: new ObjectId(listId) },
        { $set: { completed } }
      );

    await pusherServer.trigger(`list-${listId}`, 'item-updated', {
      itemId,
      completed,
    });

    return NextResponse.json({ message: 'Item updated successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while updating the item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const segments = request.nextUrl.pathname.split('/');
    const listId = segments[segments.length - 2];
    if (!listId) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const { itemId } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    await db.collection('items').deleteOne({
      _id: new ObjectId(itemId),
      listId: new ObjectId(listId),
    });

    await pusherServer.trigger(`list-${listId}`, 'item-deleted', { itemId });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'An error occurred while deleting the item' },
      { status: 500 }
    );
  }
}
