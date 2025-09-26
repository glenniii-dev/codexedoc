"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import page from "@/app/(root)/liked/page";
import { FilterQuery, SortOrder } from "mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  name,
  bio,
  image,
  path
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      { id: userId },
      { 
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true } // update and insert info into the database
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }

}

export async function fetchUser(userId: string): Promise<any> {
  try {
    connectToDB();
    // Return a plain JS object to avoid sending Mongoose documents to client components
    const userDoc = await User.findOne({ id: userId }).lean({ virtuals: true });
    if (!userDoc) return null;
    return userDoc;
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    // find all threads created by the user with the given userIds

    // TODO: Populate Community
    const userDoc: any = await User
      .findOne({ id: userId })
      .populate({
        path: 'threads',
        model: Thread,
        populate: {
          path: 'children',
          model: 'Thread',
          populate: {
            path: 'author',
            model: 'User',
            select: 'name image id'
          }
        }
      })
      .lean({ virtuals: true });

    if (!userDoc) return null;

    // Helpers to serialize buffer-like fields and typed arrays
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
      } catch (e) {}
      return null;
    }

    function deepSerialize(value: any): any {
      if (value == null) return value;
      const t = typeof value;
      if (t === 'string' || t === 'number' || t === 'boolean') return value;
      try {
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) return value.toString('base64');
      } catch (e) {}
      const fromTyped = bufferFromTyped(value);
      if (fromTyped) return fromTyped;
      if (Array.isArray(value)) return value.map((v) => deepSerialize(v));
      if (t === 'object') {
        const out: any = {};
        for (const k of Object.keys(value)) {
          out[k] = deepSerialize(value[k]);
        }
        return out;
      }
      return value;
    }

    function normalizeThread(t: any) {
      if (!t) return t;
      const author = t.author ? { ...t.author, _id: t.author._id?.toString(), image: deepSerialize(t.author.image) } : null;
      const community = t.community ? (typeof t.community === 'string' ? t.community : { ...t.community, _id: t.community._id?.toString(), image: deepSerialize(t.community.image) }) : null;
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

    const threads = (userDoc.threads || []).map((t: any) => normalizeThread(t));

    return { ...userDoc, threads };
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}

export async function fetchUsers({ 
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;
    
    const regex = new RegExp(searchString, 'i'); // 'i' flag for case-insensitive search

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };

  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

export async function getActivity(userId: string) {
  try {
    connectToDB();
    // Resolve the Mongo user _id. `userId` may be either the application's external id (User.id)
    // or the Mongo `_id` string/object. Find the corresponding user document.
    let mongoUser: any = null;
    try {
      // First try finding by external id field
      mongoUser = await User.findOne({ id: userId }).lean();
    } catch (e) {
      // ignore
    }

    // If not found, and the passed userId looks like a Mongo ObjectId, try findById
    const mongoose = require('mongoose');
    if (!mongoUser) {
      if (typeof userId === 'string' && mongoose.Types.ObjectId.isValid(userId)) {
        mongoUser = await User.findById(userId).lean();
      }
    }

    if (!mongoUser) {
      // No matching user in our DB — return empty activity list
      return [];
    }

    // Debug: show resolved user early
    try { if (process.env.DEBUG_ACTIVITY === '1') console.log('[getActivity] resolved local user:', mongoUser); } catch (e) {}

    // Try matching ObjectId forms only. Avoid passing non-ObjectId external ids (like Clerk ids)
    const targetId = new mongoose.Types.ObjectId(mongoUser._id);
    const candidates: any[] = [targetId, targetId.toString()];

    // if external id itself looks like a 24-hex ObjectId, include it as well
    const externalId = mongoUser.id;
    if (typeof externalId === 'string' && /^[a-fA-F0-9]{24}$/.test(externalId)) {
      candidates.push(externalId);
    }

    const docs = await Thread.find({ likes: { $in: candidates } })
      .populate({ path: 'author', model: User, select: 'name image _id' })
      .lean({ virtuals: true });

    // Optional debug logging when DEBUG_ACTIVITY=1 in env
    try {
      if (process.env.DEBUG_ACTIVITY === '1') {
        console.log('[getActivity] resolved user:', { id: mongoUser.id, _id: mongoUser._id?.toString() });
        console.log('[getActivity] query targetId:', targetId?.toString());
        console.log('[getActivity] matched docs count:', (docs || []).length);
        if (docs && docs.length) console.log('[getActivity] sample doc ids:', docs.slice(0,5).map((d: any) => d._id));
      }
    } catch (e) {
      // ignore logging errors
    }

    // minimal buffer serializer (copied from thread.actions)
    function serializeMaybeBuffer(value: any) {
      if (value == null) return value;
      if (typeof value === 'string') return value;
      try {
        if (typeof Buffer !== 'undefined' && Buffer.isBuffer(value)) {
          return value.toString('base64');
        }
      } catch (e) {}

      if (value && (value.buffer || value.data)) {
        try {
          if (value.buffer && typeof value.buffer === 'object') {
            return Buffer.from(value.buffer).toString('base64');
          }
          if (Array.isArray(value.data)) {
            return Buffer.from(value.data).toString('base64');
          }
        } catch (e) {}
      }

      return value;
    }

    function normalizeDoc(d: any) {
      if (!d) return d;
      const author = d.author ? { ...d.author, _id: d.author._id?.toString(), image: serializeMaybeBuffer(d.author.image) } : null;
      const community = d.community ? (typeof d.community === 'string' ? d.community : { ...d.community, _id: d.community._id?.toString(), image: serializeMaybeBuffer(d.community?.image) }) : null;
      return {
        ...d,
        _id: d._id?.toString(),
        parentId: d.parentId ?? null,
        createdAt: d.createdAt?.toString(),
        author,
        community,
      };
    }

    const threads = (docs || []).map((d: any) => normalizeDoc(d));

    return threads;

  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`)
  }
}