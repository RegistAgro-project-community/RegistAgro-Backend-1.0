/*
  Warnings:

  - Added the required column `reference` to the `payments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `registagroValue` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "reference" TEXT NOT NULL,
ADD COLUMN     "registagroValue" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pendent';
