import { checkHealth, type HealthProbe } from "../../src/services/health.service.js";

describe("health probe aggregation", () => {
  it("reports healthy only when database and Redis both answer", async () => {
    const healthy: HealthProbe = { database: jest.fn().mockResolvedValue(undefined), redis: jest.fn().mockResolvedValue(undefined) };
    await expect(checkHealth(healthy)).resolves.toEqual({ healthy: true, database: true, redis: true });
    const partial: HealthProbe = { database: jest.fn().mockResolvedValue(undefined), redis: jest.fn().mockRejectedValue(new Error("private")) };
    await expect(checkHealth(partial)).resolves.toEqual({ healthy: false, database: true, redis: false });
    const databaseDown: HealthProbe = { database: jest.fn().mockRejectedValue(new Error("private")), redis: jest.fn().mockResolvedValue(undefined) };
    await expect(checkHealth(databaseDown)).resolves.toEqual({ healthy: false, database: false, redis: true });
  });
});
