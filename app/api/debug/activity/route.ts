import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Thread from '@/lib/models/thread.model';
import User from '@/lib/models/user.model';
import { connectToDB } from '@/lib/mongoose';

export async function GET(request: any) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  connectToDB();

  try {
  // Resolve local user by external id
  const local: any = await User.findOne({ id: userId }).lean();

  // Fetch up to 10 threads that have a non-empty likes array
  const samples: any[] = await Thread.find({ likes: { $exists: true, $ne: [] } }).limit(10).lean();

    // Build diagnostics: per-thread likes analysis
    const mongoose = require('mongoose');
  const localIdStr = local && local._id ? String(local._id) : null;
  const externalId = local && local.id ? String(local.id) : null;

    const sampleDiagnostics = (samples || []).map((t: any) => {
      const likes = (t.likes || []).map((l: any) => {
        const raw = l;
        const asString = l && l._id ? l._id.toString() : (typeof l === 'object' && l !== null && l.toString ? l.toString() : String(l));
        const isObjectId = mongoose && mongoose.Types && mongoose.Types.ObjectId && mongoose.Types.ObjectId.isValid(asString);
        const equalsLocalObjectId = localIdStr ? asString === localIdStr : false;
        const equalsExternalId = externalId ? String(l) === externalId : false;
        return { raw, asString, isObjectId: !!isObjectId, equalsLocalObjectId, equalsExternalId };
      });
      return { _id: t._id?.toString(), text: t.text, likes };
    });

  return NextResponse.json({ localUser: { _id: localIdStr, id: externalId, username: local?.username }, sampleDiagnostics });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
