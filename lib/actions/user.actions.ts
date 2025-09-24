"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import page from "@/app/(root)/activity/page";
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

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User
    .findOne({ id: userId })
    // .populate({
    //   path: 'communities',
    //   model: 'Community'
    // });
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

    // find all threads created by the user
    const userThreads = await Thread.find({ author: userId });

    // Collect all the child thread ids (replies) from the 'children' field
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId }
    }).populate({
      path: 'author',
      model: User,
      select: 'name image _id'
    })

    return replies

  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`)
  }
}