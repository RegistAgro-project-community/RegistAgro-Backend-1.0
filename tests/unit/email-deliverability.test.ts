import { AbstractApiEmailValidator } from "../../src/services/email-deliverability.js";

describe("email deliverability adapter", () => {
  const response = (payload: unknown, status = 200) => new Response(JSON.stringify(payload), { status });

  it("accepts only deliverable mailboxes", async () => {
    const valid = new AbstractApiEmailValidator("secret", jest.fn().mockResolvedValue(response({ email_deliverability: { status: "deliverable", status_detail: "valid_email" } })));
    await expect(valid.isDeliverable("user@example.com")).resolves.toBe(true);
    const invalid = new AbstractApiEmailValidator("secret", jest.fn().mockResolvedValue(response({ email_deliverability: { status: "deliverable", status_detail: "invalid_mailbox" } })));
    await expect(invalid.isDeliverable("user@example.com")).resolves.toBe(false);
    const unavailable = new AbstractApiEmailValidator("secret", jest.fn().mockResolvedValue(response({}, 503)));
    await expect(unavailable.isDeliverable("user@example.com")).resolves.toBe(false);
  });

  it("fails closed on missing credentials and network failures", async () => {
    await expect(new AbstractApiEmailValidator(undefined).isDeliverable("user@example.com")).resolves.toBe(false);
    const broken = new AbstractApiEmailValidator("secret", jest.fn().mockRejectedValue(new Error("private")));
    await expect(broken.isDeliverable("user@example.com")).resolves.toBe(false);
  });
});
