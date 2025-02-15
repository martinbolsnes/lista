import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract list ID from the URL
    const segments = request.nextUrl.pathname.split('/');
    const listId = segments[segments.length - 2];
    if (!listId) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const list = await db.collection('lists').findOne({
      _id: new ObjectId(listId),
      $or: [
        { ownerId: userId }, // `userId` stored as a string
        { 'permissions.userId': userId }, // Match permission by `userId` as a string
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
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching the list' },
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

    // Extract list ID from the URL
    const segments = request.nextUrl.pathname.split('/');
    const listId = segments[segments.length - 2];
    if (!listId) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const { content } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    const list = await db.collection('lists').findOne({
      _id: new ObjectId(listId),
      $or: [
        { ownerId: userId },
        { 'permissions.userId': userId, 'permissions.access': 'edit' },
      ],
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found or access denied' },
        { status: 404 }
      );
    }

    const result = await db.collection('items').insertOne({
      listId: new ObjectId(listId),
      content,
      createdAt: new Date(),
    });

    return NextResponse.json({ itemId: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error adding item:', error);
    return NextResponse.json(
      { error: 'An error occurred while adding the item' },
      { status: 500 }
    );
  }
}
