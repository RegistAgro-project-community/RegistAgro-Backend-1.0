/*
  Warnings:

  - You are about to drop the column `carrierId` on the `transport_requests` table. All the data in the column will be lost.
  - Added the required column `vehicleId` to the `transport_requests` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transport_requests" DROP CONSTRAINT "transport_requests_carrierId_fkey";

-- AlterTable
ALTER TABLE "transport_requests" DROP COLUMN "carrierId",
ADD COLUMN     "vehicleId" TEXT NOT NULL,
ALTER COLUMN "start_at" DROP NOT NULL,
ALTER COLUMN "delivered_at" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
