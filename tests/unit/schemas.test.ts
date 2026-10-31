import { signupSchema } from "../../src/utils/schemas/schema.zod.js";
import { loginSchema } from "../../src/utils/schemas/login.zod.js";
import { refreshTokenSchema, verifyOtpSchema } from "../../src/utils/schemas/login.zod.js";
import { createSchema as createProductSchema } from "../../src/utils/schemas/products.zod.js";
import { createOrderSchema } from "../../src/utils/schemas/orders.zod.js";
import { updateUser } from "../../src/utils/schemas/users.zod.js";
import { createVehiclesSchema, hireCarrierSchema } from "../../src/utils/schemas/vehicles.schema.js";
import { confirmPaymentSchema } from "../../src/utils/schemas/confirmPayment.zod.js";

describe("strict API input schemas", () => {
  it("requires the email and code together for OTP verification", () => {
    expect(verifyOtpSchema.safeParse({ email: " user@example.com ", code: "123456" }).success).toBe(true);
    expect(verifyOtpSchema.safeParse({ code: "123456" }).success).toBe(false);
    expect(verifyOtpSchema.safeParse({ email: "user@example.com", code: "123456", userId: "other" }).success).toBe(false);
  });

  it("accepts only a bounded refresh token payload", () => {
    expect(refreshTokenSchema.safeParse({ refreshToken: "r".repeat(48) }).success).toBe(true);
    expect(refreshTokenSchema.safeParse({ refreshToken: "short" }).success).toBe(false);
    expect(refreshTokenSchema.safeParse({ refreshToken: "r".repeat(257) }).success).toBe(false);
  });

  it("rejects extra signup fields such as role escalation", () => {
    const result = signupSchema.safeParse({ name: "Nome Teste", email: "user@example.com", phone: "923123456", adress: "Rua A", province: "Luanda", pass1: "SafePass!2026", pass2: "SafePass!2026", role: "admin" });
    expect(result.success).toBe(false);
  });

  it("rejects extra login fields and oversized passwords", () => {
    expect(loginSchema.safeParse({ email: "user@example.com", password: "x", role: "admin" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "user@example.com", password: "x".repeat(129) }).success).toBe(false);
  });

  it("rejects extra product and order fields", () => {
    const product = { name: "Produto", description: "Produto agrícola", price: 20, stock: 5, unit: "kg", type: "frutas", transport: "aberto", isAdmin: true };
    expect(createProductSchema.safeParse(product).success).toBe(false);
    expect(createOrderSchema.safeParse({ name: "Produto", qtd: 1, unit: "kg", consumerId: "other" }).success).toBe(false);
  });

  it("accepts valid signup, product, order and profile payloads", () => {
    expect(signupSchema.safeParse({ name: "Nome Teste", email: "user@example.com", phone: "923123456", adress: "Rua A", province: "Luanda", pass1: "SafePass!2026", pass2: "SafePass!2026" }).success).toBe(true);
    expect(createProductSchema.safeParse({ name: "Tomate Fresco", description: "Produto agrícola", price: 500, stock: 10, unit: "kg", type: "frutas", transport: "aberto" }).success).toBe(true);
    expect(createOrderSchema.safeParse({ name: "Tomate Fresco", qtd: 10, unit: "kg", delivery: "Rua A, Luanda" }).success).toBe(true);
    expect(updateUser.safeParse({ name: "Nome Teste", adress: "Rua A", province: "Bengo" }).success).toBe(true);
  });

  it("validates vehicle, transport request and payment reference schemas", () => {
    expect(createVehiclesSchema.safeParse({ brand: "Toyota", plate: "LDA-12-34-AA", category: "aberto", capacity: 1000, unit: "kg" }).success).toBe(true);
    expect(hireCarrierSchema.safeParse({ orderId: "d9428888-122b-4e05-9d75-6c6e9c47c7f4", vehicleId: "d9428888-122b-4e05-9d75-6c6e9c47c7f4" }).success).toBe(true);
    expect(confirmPaymentSchema.safeParse({ reference: "123456789" }).success).toBe(true);
  });
});
