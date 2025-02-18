import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { clerkId, email, name } = await request.json();
    const client = await clientPromise;
    const db = client.db('lista-app');

    const existingUser = await db.collection('users').findOne({ clerkId });

    if (!existingUser) {
      await db.collection('users').insertOne({
        clerkId,
        email,
        name,
        createdAt: new Date(),
      });
    }

    return NextResponse.json(
      { message: 'User saved successfully' },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
