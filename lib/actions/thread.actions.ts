"use server"; // Cannot directly create database actions on the browser or client side. Databases are mostly server or api oriented.

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
}

export async function createThread({ text, author, communityId, path }: Params) {
  
  try {
    connectToDB();

    const createdThread = await Thread.create(
      {
        text,
        author,
        community: null,
      }
    );

    // Update user model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }

}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of posts to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // Fetch threads that have no parents (top-level threads)
  const threadQuery = await Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: -1 }) // Sort by createdAt in descending order
    .skip(skipAmount) // Skip the specified number of documents
    .limit(pageSize) // Limit the number of documents returned
    .populate({ path: "author", model: User })
    .populate({ 
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId image"
      }
    });

  const totalThreadsCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });

  const threads = threadQuery;

  const isNext = totalThreadsCount > skipAmount + threads.length;

  return { threads, isNext };
}

export async function fetchThreadById(id: string) {
  connectToDB();

  try {

    // TODO Populate Community
    const thread = await Thread.findById(id)
      .populate({ 
        path: "author", 
        model: User,
        select: "_id id name image"
      })
      .populate({ 
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image"
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image"
            }
          }
        ]
      }).exec();

    return thread;

  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread(
  threadId: string, 
  commentText: string,
  userId: string,
  path: string
) {
  connectToDB();

  try {
    // Find the original thread by its id
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    // Create a new thread with the comment text
    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    // Save the new thread
    const savedCommentThread = await commentThread.save();

    // Update the original thread to include the new thread
    originalThread.children.push(savedCommentThread._id);

    // Save the updated thread
    await originalThread.save();

    // Revalidate the path so the new comment is immediately visible
    revalidatePath(path);

  } catch (error: any) {
    throw new Error(`Failed to add comment to thread: ${error.message}`);
  }
}