import { normalizeName } from "../../src/utils/normalize-name.js";
import { ConsoleLogger } from "../../src/services/logger.js";

describe("small pure and cross-cutting utilities", () => {
  it("normalizes names without mutating the input", () => {
    expect(normalizeName("  joÃO   DA silva ")).toBe("João Da Silva");
  });

  it("emits structured logs using only provided safe context", () => {
    const out = jest.spyOn(process.stdout, "write").mockImplementation(() => true);
    const err = jest.spyOn(process.stderr, "write").mockImplementation(() => true);
    try {
      const logger = new ConsoleLogger();
      logger.info("test.started", { requestId: "r-1" });
      logger.error("test.failed", { requestId: "r-1" });
      expect(out).toHaveBeenCalledWith('{"level":"info","event":"test.started","requestId":"r-1"}\n');
      expect(err).toHaveBeenCalledWith('{"level":"error","event":"test.failed","requestId":"r-1"}\n');
    } finally { out.mockRestore(); err.mockRestore(); }
  });
});
