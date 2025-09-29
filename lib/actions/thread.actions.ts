"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

// Full implementation for thread actions including likes and thread CRUD.

export async function getLikeInfo(threadId: string) {
  connectToDB();
  try {
    const doc = await Thread.findById(threadId).populate({ path: "likes", select: "_id id name" });
    return { likeCount: doc?.likes?.length ?? 0, likedBy: doc?.likes ?? [] };
  } catch (err: any) {
    throw new Error(`getLikeInfo failed: ${err?.message ?? err}`);
  }
}

// Helper: convert Buffer-like or binary fields into plain strings
function serializeMaybeBuffer(value: any) {
  if (value == null) return value;
  if (typeof value === 'string') return value;
  try {
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
      return value.toString('base64');
    }
  } catch (e) {
    // ignore
  }

  if (value && (value.buffer || value.data)) {
    try {
      if (value.buffer && typeof value.buffer === 'object') {
        return Buffer.from(value.buffer).toString('base64');
      }
      if (Array.isArray(value.data)) {
        return Buffer.from(value.data).toString('base64');
      }
    } catch (e) {
      // fallthrough
    }
  }

  return value;
}

function isArrayBufferView(v: any) {
  if (typeof ArrayBuffer !== 'undefined') {
    return ArrayBuffer.isView ? ArrayBuffer.isView(v) : v instanceof Uint8Array;
  }
  return v instanceof Uint8Array;
}

function bufferFromTyped(v: any) {
  try {
    if (typeof Buffer !== 'undefined') {
      if (isArrayBufferView(v)) return Buffer.from(v).toString('base64');
      if (v instanceof ArrayBuffer) return Buffer.from(new Uint8Array(v)).toString('base64');
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function deepSerialize(value: any): any {
  if (value == null) return value;
  // primitives
  const t = typeof value;
  if (t === 'string' || t === 'number' || t === 'boolean') return value;

  // Buffer
  try {
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value.toString('base64');
  } catch (e) {}

  // Typed arrays / ArrayBuffer
  const fromTyped = bufferFromTyped(value);
  if (fromTyped) return fromTyped;

  // Arrays
  if (Array.isArray(value)) return value.map((v) => deepSerialize(v));

  // Objects: recursively process keys
  if (t === 'object') {
    const out: any = {};
    for (const k of Object.keys(value)) {
      try {
        out[k] = deepSerialize(value[k]);
      } catch (e) {
        out[k] = value[k];
      }
    }
    return out;
  }

  return value;
}

// Recursively normalize a thread document (or plain object) to remove Mongoose docs
function normalizeThread(t: any): any {
  if (!t) return t;
  const author = t.author
    ? { ...t.author, _id: t.author._id?.toString(), image: serializeMaybeBuffer(t.author.image) }
    : null;
  const community = t.community
    ? (typeof t.community === 'string' ? t.community : { ...t.community, _id: t.community._id?.toString(), image: serializeMaybeBuffer(t.community.image) })
    : null;

  return deepSerialize({
    ...t,
    _id: t._id?.toString(),
    parentId: t.parentId ?? null,
    createdAt: t.createdAt?.toString(),
    author,
    community,
    children: (t.children || []).map((c: any) => normalizeThread(c)),
  });
}

export async function toggleLikeOnThread(threadId: string, externalUserId: string, path?: string) {
  connectToDB();
  try {
    const thread = await Thread.findById(threadId);
    if (!thread) throw new Error("Thread not found");

    const user = await User.findOne({ id: externalUserId });
    if (!user) throw new Error("User not found in application database");

    const userObjId = user._id;
    const already = thread.likes?.some((u: any) => u.toString() === userObjId.toString());

    if (already) {
      thread.likes = (thread.likes || []).filter((u: any) => u.toString() !== userObjId.toString());
      await thread.save();
      if (path) revalidatePath(path);
      return { likeCount: thread.likes.length, liked: false };
    }

    // add like
    thread.likes = thread.likes || [];
    thread.likes.push(userObjId);
    await thread.save();
    if (path) revalidatePath(path);
    return { likeCount: thread.likes.length, liked: true };
  } catch (err: any) {
    throw new Error(`toggleLikeOnThread failed: ${err?.message ?? err}`);
  }
}

// Minimal stubs so other imports don't fail while we repair.
export async function createThread({ text, author, communityId, path }: any) {
  connectToDB();
  try {
    const created = await Thread.create({ text, author, community: communityId ?? null });
    // add thread ref to user
    await User.findByIdAndUpdate(author, { $push: { threads: created._id } });
    if (path) revalidatePath(path);
    // Return a plain JS object to avoid sending Mongoose documents back to client components
    return normalizeThread(created.toObject ? created.toObject({ virtuals: true }) : created);
  } catch (err: any) {
    throw new Error(`createThread failed: ${err?.message ?? err}`);
  }
}
export async function fetchThreads(pageNumber: number = 1, pageSize: number = 20) {
  connectToDB();
  const skip = (pageNumber - 1) * pageSize;
  try {
    const docs = await Thread.find({ parentId: { $in: [null, undefined] } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate({ path: 'author', select: '_id id name image' })
      .populate({ path: 'children', populate: { path: 'author', select: '_id id name image' } })
      .lean({ virtuals: true });
    const total = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });

    // Normalize to plain JS objects with string ids/dates (recursively)
    const threads = docs.map((d: any) => normalizeThread(d));

    return { threads, isNext: total > skip + threads.length };
  } catch (err: any) {
    throw new Error(`fetchThreads failed: ${err?.message ?? err}`);
  }
}
export async function fetchThreadById(id?: string) {
  connectToDB();
  try {
    const doc = await Thread.findById(id)
      .populate({ path: 'author', select: '_id id name image' })
      .populate({ path: 'children', populate: [{ path: 'author', select: '_id id name parentId image' }, { path: 'children', model: Thread, populate: { path: 'author', select: '_id id name parentId image' } }] })
      .lean({ virtuals: true });

    if (!doc) return null;

    // Use recursive normalizer to sanitize entire tree
    return normalizeThread(doc);
  } catch (err: any) {
    throw new Error(`fetchThreadById failed: ${err?.message ?? err}`);
  }
}
export async function deleteThread(id?: string, path?: string) {
  connectToDB();
  try {
    if (!id) throw new Error('id required');
    const main = await Thread.findById(id).populate('author');
    if (!main) throw new Error('Thread not found');

    // recursively find children
    async function fetchAllChildren(tid: any): Promise<any[]> {
      const children = await Thread.find({ parentId: tid });
      const out: any[] = [];
      for (const c of children) {
        const desc = await fetchAllChildren(c._id);
        out.push(c, ...desc);
      }
      return out;
    }

    const descendants = await fetchAllChildren(id);
    const ids = [id, ...descendants.map((d) => d._id)];

    await Thread.deleteMany({ _id: { $in: ids } });
    // remove thread refs from authors
    // Helper to get a primitive id from either an ObjectId, a populated doc, or a string
    function extractId(a: any) {
      if (!a) return null;
      try {
        if (typeof a === 'string') return a;
        if (a._id) return a._id.toString();
        if (a.toString && typeof a.toString === 'function') return a.toString();
      } catch (e) {
        // fallthrough
      }
      return null;
    }

    const authorIds = Array.from(new Set(
      [
        ...descendants.map((t) => extractId(t.author)).filter(Boolean) as string[],
        extractId(main.author),
      ].filter(Boolean)
    ));

    if (authorIds.length) await User.updateMany({ _id: { $in: authorIds } }, { $pull: { threads: { $in: ids } } });
    if (path) revalidatePath(path);
  } catch (err: any) {
    throw new Error(`deleteThread failed: ${err?.message ?? err}`);
  }
}
export async function addCommentToThread(threadId?: string, commentText?: string, userId?: any, path?: string) {
  connectToDB();
  try {
    if (!threadId) throw new Error('threadId required');
    const parent = await Thread.findById(threadId);
    if (!parent) throw new Error('Parent thread not found');
    const comment = new Thread({ text: commentText, author: userId, parentId: threadId });
    const saved = await comment.save();
    parent.children.push(saved._id);
    await parent.save();
    if (path) revalidatePath(path);
    // Return a plain JS object for the saved comment
    return normalizeThread(saved.toObject ? saved.toObject({ virtuals: true }) : saved);
  } catch (err: any) {
    throw new Error(`addCommentToThread failed: ${err?.message ?? err}`);
  }
}
export async function searchThreads(searchString?: string, pageNumber: number = 1, pageSize: number = 20) {
  connectToDB();
  const skip = (pageNumber - 1) * pageSize;
  try {
    if (!searchString) {
      // fallback to listing threads
      return fetchThreads(pageNumber, pageSize);
    }

    // Build a case-insensitive regex to search the text field
    const regex = new RegExp(searchString.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), 'i');

    const docs = await Thread.find({ parentId: { $in: [null, undefined] }, text: { $regex: regex } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .populate({ path: 'author', select: '_id id name image' })
      .populate({ path: 'children', populate: { path: 'author', select: '_id id name image' } })
      .lean({ virtuals: true });

    const total = await Thread.countDocuments({ parentId: { $in: [null, undefined] }, text: { $regex: regex } });
    const threads = docs.map((d: any) => normalizeThread(d));

    return { threads, isNext: total > skip + threads.length };
  } catch (err: any) {
    throw new Error(`searchThreads failed: ${err?.message ?? err}`);
  }
}