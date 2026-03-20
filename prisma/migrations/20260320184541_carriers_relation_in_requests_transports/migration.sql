/*
  Warnings:

  - Added the required column `carrierId` to the `transport_requests` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transport_requests" ADD COLUMN     "carrierId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
