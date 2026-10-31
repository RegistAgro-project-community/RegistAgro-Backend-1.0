import { AuthModel } from "../../src/model/auth/auth.model.js";
import type { PasswordHasher } from "../../src/utils/password-hasher.js";
import type { EmailDeliverabilityValidator } from "../../src/services/email-deliverability.js";
import type { Geocoder } from "../../src/services/geocoder.js";
import type { AuthTokenService } from "../../src/services/auth-token.service.js";
import { verifyOTPCode } from "../../src/services/email.service.js";
import { prisma } from "../../lib/prisma.js";

jest.mock("../../lib/prisma.js", () => ({ prisma: {
  users: { findFirst: jest.fn(), update: jest.fn() },
  consumers: { create: jest.fn() },
  carriers: { create: jest.fn() },
} }));
jest.mock("../../src/services/email.service.js", () => ({ sendEmailWithOTP: jest.fn(), verifyOTPCode: jest.fn() }));
jest.mock("../../src/services/auth-token.store.js", () => ({ authTokenService: { issue: jest.fn(), rotate: jest.fn(), revoke: jest.fn() } }));

describe("OTP confirmation is bound to the submitted email", () => {
  it("verifies the Supabase code for that email and activates only its pending user", async () => {
    const db = prisma as unknown as { users: { findFirst: jest.Mock; update: jest.Mock }; consumers: { create: jest.Mock } };
    const pendingUser = {
      id: "user-pending-1", rule: "consumer", name: "User", email: "buyer@example.com",
      phone: "+244900000000", province: "Luanda", adress: "Luanda",
    };
    db.users.findFirst.mockResolvedValue(pendingUser);
    db.users.update.mockResolvedValue({ ...pendingUser, status: "active" });
    db.consumers.create.mockResolvedValue({});
    (verifyOTPCode as jest.Mock).mockResolvedValue({ valid: true });
    const tokens = { issue: jest.fn().mockResolvedValue({ accessToken: "access", refreshToken: "refresh" }) };
    const hasher = {} as PasswordHasher;
    const emailValidator = {} as EmailDeliverabilityValidator;
    const geocoder = {} as Geocoder;
    const model = new AuthModel(hasher, emailValidator, geocoder, tokens as unknown as AuthTokenService);

    const result = await model.verifyCode("buyer@example.com", "123456");

    expect(verifyOTPCode).toHaveBeenCalledWith("buyer@example.com", "123456");
    expect(db.users.findFirst).toHaveBeenCalledWith({ where: { email: "buyer@example.com", status: "pendent" } });
    expect(db.users.update).toHaveBeenCalledWith({ where: { id: "user-pending-1" }, data: { status: "active" } });
    expect(tokens.issue).toHaveBeenCalledWith("user-pending-1", "consumer");
    expect(result).toMatchObject({ valid: true, tokens: { accessToken: "access", refreshToken: "refresh" } });
  });
});
