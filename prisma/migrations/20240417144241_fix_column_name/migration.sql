/*
  Warnings:

  - You are about to drop the column `discoountAmount` on the `DiscountCode` table. All the data in the column will be lost.
  - Added the required column `discountAmount` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DiscountCode" DROP COLUMN "discoountAmount",
ADD COLUMN     "discountAmount" INTEGER NOT NULL;
