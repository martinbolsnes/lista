import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requestBody = await request.json();
    const { listId, userEmail } = requestBody;

    if (!listId || !userEmail) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!ObjectId.isValid(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    const list = await db.collection('lists').findOne({
      _id: new ObjectId(listId),
      ownerId: userId,
    });

    if (!list) {
      return NextResponse.json(
        { error: "List not found or you don't have permission to share" },
        { status: 404 }
      );
    }

    const sharedUser = await db
      .collection('users')
      .findOne({ 'email.emailAddress': userEmail });

    if (!sharedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sharedUserId = sharedUser.clerkId;

    if (!sharedUserId) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 500 });
    }

    const existingPermission = await db.collection('list_permissions').findOne({
      listId: new ObjectId(listId),
      userId: sharedUserId,
    });

    if (existingPermission) {
      return NextResponse.json(
        { error: 'List already shared with this user' },
        { status: 400 }
      );
    }

    const newPermission = await db.collection('list_permissions').insertOne({
      listId: new ObjectId(listId),
      name: list.name,
      userId: sharedUserId,
      permission_level: 'edit',
    });

    if (!newPermission.acknowledged) {
      return NextResponse.json(
        { error: 'Failed to share the list' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'List shared successfully' });
  } catch {
    return NextResponse.json(
      { error: 'An error occurred while sharing the list' },
      { status: 500 }
    );
  }
}
