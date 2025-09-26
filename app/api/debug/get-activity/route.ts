import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getActivity } from '@/lib/actions/user.actions';
import { connectToDB } from '@/lib/mongoose';

export async function GET(request: any) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  connectToDB();

  try {
    // Call getActivity with the local user's external id — getActivity resolves the local Mongo id internally
    const activity = await getActivity(userId);
    return NextResponse.json({ activity });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? String(err) }, { status: 500 });
  }
}
