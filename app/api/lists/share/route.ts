import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    console.log('Current user ID:', userId);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ✅ Read the request body only once
    const requestBody = await request.json();
    console.log('Request Body:', requestBody);

    const { listId, userEmail } = requestBody;
    console.log('Email to share with:', userEmail);

    if (!listId || !userEmail) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // ✅ Ensure listId is a valid ObjectId
    if (!ObjectId.isValid(listId)) {
      return NextResponse.json({ error: 'Invalid list ID' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('lista-app');

    // ✅ Convert listId to ObjectId before querying
    const list = await db.collection('lists').findOne({
      _id: new ObjectId(listId),
      ownerId: userId,
    });
    console.log('Found list:', list);

    if (!list) {
      return NextResponse.json(
        { error: "List not found or you don't have permission to share" },
        { status: 404 }
      );
    }

    // Find the user to share with
    const sharedUser = await db
      .collection('users')
      .findOne({ 'email.emailAddress': userEmail });
    console.log('Shared user:', sharedUser);

    if (!sharedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use clerkId as the userId for permissions
    const sharedUserId = sharedUser.clerkId;
    console.log('Shared user ID:', sharedUserId);

    if (!sharedUserId) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 500 });
    }

    // Check if the list is already shared with this user
    const existingPermission = await db.collection('list_permissions').findOne({
      listId: new ObjectId(listId), // ✅ Convert here too
      userId: sharedUserId,
    });
    console.log('Existing permission:', existingPermission);

    if (existingPermission) {
      return NextResponse.json(
        { error: 'List already shared with this user' },
        { status: 400 }
      );
    }

    // Add sharing permission
    const newPermission = {
      listId: new ObjectId(listId),
      name: list.name,
      userId: sharedUserId,
      permission_level: 'edit',
    };
    console.log('New permission to be added:', newPermission);

    const insertResult = await db
      .collection('list_permissions')
      .insertOne(newPermission);
    console.log('Insert result:', insertResult);

    return NextResponse.json({ message: 'List shared successfully' });
  } catch (error) {
    console.error('Error in share route:', error);
    return NextResponse.json(
      { error: 'An error occurred while sharing the list' },
      { status: 500 }
    );
  }
}
