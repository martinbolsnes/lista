import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const listId = params.id;
    if (!listId) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const ownedList = await db.collection('lists').findOne({
      _id: new ObjectId(listId),
      ownerId: userId,
    });

    if (!ownedList) {
      const sharedPermission = await db.collection('list_permissions').findOne({
        listId: new ObjectId(listId),
        userId: userId,
      });

      if (!sharedPermission) {
        return NextResponse.json(
          { error: 'List not found or access denied' },
          { status: 404 }
        );
      }

      const sharedList = await db.collection('lists').findOne({
        _id: new ObjectId(listId),
      });

      if (!sharedList) {
        return NextResponse.json(
          { error: 'List not found or access denied' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        ...sharedList,
        isOwner: false,
        canEdit: sharedPermission.permission_level === 'edit',
      });
    }

    return NextResponse.json({
      ...ownedList,
      isOwner: true,
      canEdit: true,
    });
  } catch {
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
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while adding the item' },
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
    const listId = segments[segments.length - 1];
    if (!ObjectId.isValid(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const result = await db.collection('lists').deleteOne({
      _id: new ObjectId(listId),
      ownerId: userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'List not found or you do not have permission to delete it' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while deleting the list' },
      { status: 500 }
    );
  }
}
