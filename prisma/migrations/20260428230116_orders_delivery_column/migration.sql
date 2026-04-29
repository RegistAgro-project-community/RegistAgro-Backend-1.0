/*
  Warnings:

  - You are about to drop the column `latitude` on the `Location` table. All the data in the column will be lost.
  - Added the required column `longitude` to the `Location` table without a default value. This is not possible if the table is not empty.
  - Added the required column `delivery` to the `orders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "orders_status" ADD VALUE 'delivered';

-- AlterTable
ALTER TABLE "Location" DROP COLUMN "latitude",
ADD COLUMN     "longitude" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "delivery" TEXT NOT NULL;
