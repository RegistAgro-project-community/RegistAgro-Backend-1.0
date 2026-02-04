/*
  Warnings:

  - Added the required column `qtd` to the `orders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "qtd" INTEGER NOT NULL,
ADD COLUMN     "unit" "Stock" NOT NULL;
