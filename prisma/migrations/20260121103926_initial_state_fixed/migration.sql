-- CreateEnum
CREATE TYPE "Province" AS ENUM ('Luanda', 'Bengo');

-- CreateEnum
CREATE TYPE "Rule" AS ENUM ('farm', 'consumer', 'carrier');

-- CreateEnum
CREATE TYPE "Deleted" AS ENUM ('active', 'inactive', 'pendent');

-- CreateEnum
CREATE TYPE "Stock" AS ENUM ('kg', 't');

-- CreateEnum
CREATE TYPE "ProductsType" AS ENUM ('frutas', 'vegetais', 'cereais', 'carnes', 'raizes', 'legumes');

-- CreateEnum
CREATE TYPE "orders_status" AS ENUM ('pendent', 'confirmed', 'canceled');

-- CreateEnum
CREATE TYPE "Payment_status" AS ENUM ('retained', 'released', 'canceled');

-- CreateEnum
CREATE TYPE "VehiclesType" AS ENUM ('frigorifico', 'fechado', 'aberto_coberto', 'aberto');

-- CreateEnum
CREATE TYPE "Requests" AS ENUM ('pendente', 'aceite', 'em_transporte', 'cancelado', 'entregue');

-- CreateEnum
CREATE TYPE "Duration" AS ENUM ('dias', 'horas');

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'farm',
    "location" TEXT NOT NULL,
    "province" "Province" NOT NULL,
    "municipality" TEXT NOT NULL,
    "phone" INTEGER NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rule" "Rule" NOT NULL,
    "adress" TEXT NOT NULL,
    "province" "Province" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "Deleted" NOT NULL DEFAULT 'active',
    "profile" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "farms" (
    "id" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,

    CONSTRAINT "farms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consumers" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,

    CONSTRAINT "consumers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carriers" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,

    CONSTRAINT "carriers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL,
    "unit" "Stock" NOT NULL,
    "type" "ProductsType" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photo" TEXT NOT NULL,
    "status" "Deleted" NOT NULL DEFAULT 'active',

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "consumerId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" "orders_status" NOT NULL DEFAULT 'pendent',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" "Payment_status" NOT NULL DEFAULT 'retained',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "type" "VehiclesType" NOT NULL,
    "capacity" INTEGER NOT NULL,
    "unit" "Stock" NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_requests" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "status" "Requests" NOT NULL DEFAULT 'pendente',
    "start_at" TIMESTAMP(3) NOT NULL,
    "delivered_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transport_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routes" (
    "id" TEXT NOT NULL,
    "carrierId" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "unit" "Stock" NOT NULL,
    "duration" INTEGER NOT NULL,
    "durationUnit" "Duration" NOT NULL,

    CONSTRAINT "routes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "latitude" TEXT NOT NULL,
    "altitude" TEXT NOT NULL,
    "time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationCode" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VerificationCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pendingUser" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "rule" "Rule" NOT NULL,
    "adress" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "pendingUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_phone_key" ON "company"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "company_email_key" ON "company"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pendingUser_email_key" ON "pendingUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "pendingUser_phone_key" ON "pendingUser"("phone");

-- AddForeignKey
ALTER TABLE "farms" ADD CONSTRAINT "farms_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consumers" ADD CONSTRAINT "consumers_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carriers" ADD CONSTRAINT "carriers_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_consumerId_fkey" FOREIGN KEY ("consumerId") REFERENCES "consumers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "farms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transport_requests" ADD CONSTRAINT "transport_requests_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routes" ADD CONSTRAINT "routes_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "carriers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Location" ADD CONSTRAINT "Location_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
