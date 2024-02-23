/*
  Warnings:

  - You are about to drop the column `orderId` on the `Commission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_orderId_fkey";

-- AlterTable
ALTER TABLE "Commission" DROP COLUMN "orderId";
