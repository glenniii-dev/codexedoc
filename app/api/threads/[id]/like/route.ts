import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { toggleLikeOnThread, getLikeInfo } from '@/lib/actions/thread.actions';

export async function POST(request: any, { params }: any) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const threadId = params.id;

  try {
    const body = await request.json().catch(() => ({}));
    const path = body?.path;

    const result = await toggleLikeOnThread(threadId, userId, path);

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request: any, { params }: any) {
  const threadId = params?.id;

  try {
    const info = await getLikeInfo(threadId);
    return NextResponse.json(info);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
