import { Payments } from "../../src/services/payment.service.js";

jest.mock("../../lib/prisma.js", () => ({ prisma: {} }));
jest.mock("../../src/utils/referenceGenerate.js", () => ({ referenceGenerate: jest.fn() }));

describe("simulated payment production guard", () => {
  it("blocks simulated references, confirmations and ledger releases in production", async () => {
    const previous = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    try {
      const payments = new Payments();
      expect(Payments.isSimulationAllowed()).toBe(false);
      await expect(payments.create("order", 1, 1, 1, 1, 4)).resolves.toMatchObject({ unavailable: true });
      await expect(payments.confirmPayment("consumer", "123456789")).resolves.toMatchObject({ unavailable: true });
      await expect(payments.releasePayment("order")).resolves.toMatchObject({ unavailable: true, success: false });
    } finally {
      if (previous === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = previous;
    }
  });
});
