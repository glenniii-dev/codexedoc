"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { getProfileByUsername } from "./profile.action";

// export async function syncUser() {
//   try {
//     const { userId } = await auth();
//     const user = await currentUser();

//     if (!userId || !user) return;

//     const existingUser = await prisma.user.findUnique({
//       where: {
//         clerkId: userId,
//       },
//     });

//     if (existingUser) {
//       // Update the user's image if it has changed
//       if (user.imageUrl !== existingUser.image) {
//         await prisma.user.update({
//           where: {
//             clerkId: userId,
//           },
//           data: {
//             image: user.imageUrl,
//           },
//         });
//       }

//       return existingUser;
//     }

//     const dbUser = await prisma.user.create({
//       data: {
//         clerkId: userId,
//         name: `${user.firstName || ""} ${user.lastName || ""}`,
//         username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
//         email: user.emailAddresses[0].emailAddress,
//         image: user.imageUrl,
//       },
//     });

//     return dbUser;
//   } catch (error) {
//     console.log("Error in syncUser", error);
//   }
// }

export async function syncUser() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) return;

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      // Update the user's image if it has changed
      if (user.imageUrl !== existingUser.image) {
        await prisma.user.update({
          where: {
            clerkId: userId,
          },
          data: {
            image: user.imageUrl,
          },
        });
      }

      // Add a follow relationship between the user and codexedoc.com
      const codexedocUser = await prisma.user.findUnique({
        where: {
          username: 'codexedoc.com',
        },
      });

      if (codexedocUser) {
        await prisma.follows.create({
          data: {
            followerId: existingUser.id,
            followingId: codexedocUser.id,
          },
        });
      }

      return existingUser;
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    // Add a follow relationship between the user and codexedoc.com
    const codexedocUser = await prisma.user.findUnique({
      where: {
        username: 'codexedoc.com',
      },
    });

    if (codexedocUser) {
      await prisma.follows.create({
        data: {
          followerId: dbUser.id,
          followingId: codexedocUser.id,
        },
      });
    }

    return dbUser;
  } catch (error) {
    console.log("Error in syncUser", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      image: true,
      location: true,
      website: true,
      bio: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    // get 3 random users exclude ourselves & users that we already follow
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId,
                },
              },
            },
          },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 3,
    });

    return randomUsers;
  } catch (error) {
    console.log("Error fetching random users", error);
    return [];
  }
}

export async function toggleFollow(targetUserId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    if (userId === targetUserId) throw new Error("You cannot follow yourself");

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: targetUserId,
        },
      },
    });

    if (existingFollow) {
      // unfollow
      await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });
    } else {
      // follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetUserId,
          },
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserId, // user being followed
            creatorId: userId, // user following
          },
        }),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.log("Error in toggleFollow", error);
    return { success: false, error: "Error toggling follow" };
  }
}