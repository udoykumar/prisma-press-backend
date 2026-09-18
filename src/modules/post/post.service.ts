import { equal } from "node:assert";
import { CommentStatus, PostStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import {
  CreatePostPayload,
  IPostQuery,
  IUpdatePostPayload,
} from "./post.interface";

import { title } from "node:process";
import { PostWhereInput } from "../../../generated/prisma/models";

const createPost = async (payload: CreatePostPayload, userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    },
    include: {
      subscription: true,
    },
  });

  if (payload.isPremium && user.subscription?.status !== "ACTIVE") {
    throw new Error(
      "you are not a premium user. so you can not create premium content",
    );
  }
  const result = await prisma.post.create({
    data: {
      ...payload,
      authorId: userId,
    },
  });
  return result;
};

const getAllPost = async (query: IPostQuery) => {
  const limit = query.limit ? Number(query.limit) : 10;
  const page = query.page ? Number(query.page) : 1;
  const skip = (page - 1) * limit;

  const sortBy = query.sortBy ? query.sortBy : "createdAt";
  const sortOrder = query.sortOrder ? query.sortOrder : "desc";
  const andConditions: PostWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: query.searchTerm,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (query.title) {
    andConditions.push({
      AND: [{ title: query.title }],
    });
  }
  if (query.content) {
    andConditions.push({
      AND: [{ content: query.content }],
    });
  }
  if (query.authorId) {
    andConditions.push({
      authorId: query.authorId,
    });
  }
  if (query.isFeatured) {
    andConditions.push({
      isFeatured: query.isFeatured,
    });
  }
  if (query.tags) {
    andConditions.push({
      tags: {
        hasSome: JSON.parse(query.tags as string),
      },
    });
  }

  if (query.status) {
    andConditions.push({
      status: query.status,
    });
  }

  andConditions.push({
    isPremium: false,
  });
  const posts = await prisma.post.findMany({
    //filtering / exact match without AND operator
    // where: {
    //   title: "Mysecend Post",
    //   content: "ronaldo",
    // },

    //filtering / exact match with AND operator
    // where: {
    //   AND: [
    //     {
    //       title: "My first Post",
    //     },
    //     {
    //       content: "Ronaldo",
    //     },
    //     {
    //       tags: {
    //         equals: ["typescript", "prisma", "express"],
    //       },
    //     },
    //   ],
    // },

    // searching  / parrial match
    // where: {
    //   title: {
    //     contains: "ronaldo",
    //     mode: "insensitive",
    //   },

    // not idea for partial match

    // content: {
    //   contains: "Ronaldo",
    // },
    // },

    //searching  / partial search or operator
    // where: {
    //   OR: [
    //     { title: { contains: "Ronaldo", mode: "insensitive" } },
    //     {
    //       content: {
    //         contains: "Ronaldo",
    //         mode: "insensitive",
    //       },
    //     },
    //   ],
    // },

    //combaining search and filrering
    // where: {
    //   // filtering

    //   AND: [
    //     {
    //       // searching
    //       OR: [
    //         {
    //           title: { contains: "Ron", mode: "insensitive" },
    //         },
    //         {
    //           content: { contains: "ron", mode: "insensitive" },
    //         },
    //       ],
    //     },
    //     // filtering
    //     { title: "Ronaldo" },
    //     { content: "Ronaldo" },
    //   ],
    // },

    // pagination

    // take: 2,
    // skip: 14,

    // sorting
    // orderBy: {
    //   createdAt: "desc",
    //   title: "asc",
    //   content: "asc",
    // },

    // dynamic searching and filtering
    // where: {
    //   AND: [
    //     query.searchTerm
    //       ? {
    //           OR: [
    //             {
    //               title: {
    //                 contains: query.searchTerm,
    //                 mode: "insensitive",
    //               },
    //             },
    //             {
    //               content: { contains: query.searchTerm, mode: "insensitive" },
    //             },
    //           ],
    //         }
    //       : {},

    //     //title filtering
    //     query.title
    //       ? {
    //           title: query.title,
    //         }
    //       : {},
    //     query.content ? { content: query.content } : {},
    //   ],
    // },

    where: {
      AND: andConditions,
    },
    // dynamic pagination and sorting
    take: limit,
    skip: skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    include: {
      author: {
        omit: { password: true },
      },
      comments: true,
    },
  });

  const totalPostCount = await prisma.post.count({
    where: {
      AND: andConditions,
    },
  });
  return {
    data: posts,
    meta: {
      page: page,
      limit: limit,
      total: totalPostCount,
      totalPages: Math.ceil(totalPostCount / limit),
    },
  };
};

const getPostById = async (postId: string) => {
  // const post = await prisma.post.findUniqueOrThrow({
  //   where: { id: postId },
  // });

  // await prisma.post.update({
  //   where: {
  //     id: postId,
  //   },
  //   data: {
  //     views: {
  //       increment: 1,
  //     },
  //   },
  // });

  const transactionResult = await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    // throw new Error("fake error ");
    const post = await tx.post.findFirstOrThrow({
      where: {
        id: postId,
        isPremium: false,
      },
      include: {
        author: {
          omit: {
            password: true,
          },
        },
        comments: {
          where: {
            status: CommentStatus.APPROVED,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });
    return post;
  });
  return transactionResult;

  // const post = await prisma.post.findUniqueOrThrow({});
  // return post;
};

const getMyPosts = async (authorId: string) => {
  const result = await prisma.post.findMany({
    where: { authorId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      comments: true,
      author: {
        omit: { password: true },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return result;
};

const updatePost = async (
  postId: string,
  payload: IUpdatePostPayload,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findFirstOrThrow({
    where: { id: postId },
  });
  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("You are not authorized to update this post");
  }

  const result = await prisma.post.update({
    where: { id: postId },
    data: payload,
  });
};

const deletedPost = async (
  postId: string,
  authorId: string,
  isAdmin: boolean,
) => {
  const post = await prisma.post.findUniqueOrThrow({
    where: { id: postId },
  });

  if (!isAdmin && post.authorId !== authorId) {
    throw new Error("Post deleted failed");
  }
  const result = await prisma.post.delete({
    where: { id: postId },
  });
};

const getPostsStats = async () => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    // const totalPost = await tx.post.count();
    // const totalPublicPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.PUBLISHED,
    //   },
    // });
    // const totalDraftPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.DRAFT,
    //   },
    // });
    // const totalArchivedPosts = await tx.post.count({
    //   where: {
    //     status: PostStatus.ARCHIVED,
    //   },
    // });
    // const totalComments = await tx.comment.count();
    // const totalApprovedComments = await tx.comment.count({
    //   where: {
    //     status: CommentStatus.APPROVED,
    //   },
    // });
    // const totalRejectedComments = await tx.comment.count({
    //   where: {
    //     status: CommentStatus.REJECT,
    //   },
    // });
    // // not a good approach
    // // const allPost = await tx.post.findMany();
    // // let totalPostView = 0;
    // // allPost.forEach((post) => {
    // //   totalPostView = totalPostView + post.views;
    // // });
    // const totalPostViewsAggregate = await tx.post.aggregate({
    //   _sum: {
    //     views: true,
    //   },
    // });
    // const totalPostView = totalPostViewsAggregate._sum.views;
    // return {
    // totalPost,
    // totalPublicPosts,
    // totalDraftPosts,
    // totalArchivedPosts,
    // totalComments,
    // totalApprovedComments,
    // totalRejectedComments,
    // totalPostView,
    // };

    const [
      totalPost,
      totalPublicPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostViewsAggregate,
    ] = await Promise.all([
      await tx.post.count(),
      await tx.post.count({
        where: { status: PostStatus.PUBLISHED },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.DRAFT,
        },
      }),
      await tx.post.count({
        where: {
          status: PostStatus.ARCHIVED,
        },
      }),
      await tx.comment.count(),
      await tx.comment.count({
        where: {
          status: CommentStatus.APPROVED,
        },
      }),
      await tx.comment.count({
        where: {
          status: CommentStatus.REJECT,
        },
      }),
      await tx.post.aggregate({
        _sum: {
          views: true,
        },
      }),
    ]);
    return {
      totalPost,
      totalPublicPosts,
      totalDraftPosts,
      totalArchivedPosts,
      totalComments,
      totalApprovedComments,
      totalRejectedComments,
      totalPostView: totalPostViewsAggregate._sum.views,
    };
  });

  return transactionResult;
};

export const postService = {
  createPost,
  getAllPost,
  getPostById,
  getMyPosts,
  updatePost,
  deletedPost,
  getPostsStats,
};
