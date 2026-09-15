/*
  Warnings:

  - You are about to drop the column `isReatured` on the `Posts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Posts" DROP COLUMN "isReatured",
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;
