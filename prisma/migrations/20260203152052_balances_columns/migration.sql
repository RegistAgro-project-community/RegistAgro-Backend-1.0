/*
  Warnings:

  - Added the required column `productValue` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transportValue` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "carriers" ADD COLUMN     "balance" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "productValue" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "transportValue" DOUBLE PRECISION NOT NULL;
