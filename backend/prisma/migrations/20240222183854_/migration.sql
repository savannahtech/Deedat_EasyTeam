-- DropForeignKey
ALTER TABLE "Commission" DROP CONSTRAINT "Commission_productId_fkey";

-- AlterTable
ALTER TABLE "Commission" ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
