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

    // Step 1: Try to fetch the list from the owned lists collection
    const ownedList = await db.collection('lists').findOne({
      _id: new ObjectId(listId),
      ownerId: userId,
    });

    // Step 2: If the list is not found in owned lists, check the shared lists
    if (!ownedList) {
      // Check if the user has permissions for this list
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

      // If shared permissions are found, fetch the list
      const sharedList = await db.collection('lists').findOne({
        _id: new ObjectId(listId),
      });

      if (!sharedList) {
        return NextResponse.json(
          { error: 'List not found or access denied' },
          { status: 404 }
        );
      }

      // Return the list with the permission level
      return NextResponse.json({
        ...sharedList,
        isOwner: false,
        canEdit: sharedPermission.permission_level === 'edit', // Add canEdit flag based on permissions
      });
    }

    // If the user is the owner, return the list with isOwner = true
    return NextResponse.json({
      ...ownedList,
      isOwner: true,
      canEdit: true, // Owner can always edit
    });
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

    const segments = request.nextUrl.pathname.split('/');
    const listId = segments[segments.length - 2];
    if (!listId) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const { content } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    // Check if the user is either the owner or has 'edit' permissions
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
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: 'An error occurred while deleting the list' },
      { status: 500 }
    );
  }
}
