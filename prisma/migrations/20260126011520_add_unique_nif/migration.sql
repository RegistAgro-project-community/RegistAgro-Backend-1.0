/*
  Warnings:

  - A unique constraint covering the columns `[nif]` on the table `farms` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "status" SET DEFAULT 'pendent';

-- CreateIndex
CREATE UNIQUE INDEX "farms_nif_key" ON "farms"("nif");
