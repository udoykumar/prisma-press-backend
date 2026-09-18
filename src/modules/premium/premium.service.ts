import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IPostQuery } from "../post/post.interface";

const getPremiumContent = async (query: IPostQuery) => {
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
    isPremium: true,
  });

  const posts = await prisma.post.findMany({
    where: {
      AND: andConditions,
    }, // dynamic pagination and sorting
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

export const premiumService = {
  getPremiumContent,
};
