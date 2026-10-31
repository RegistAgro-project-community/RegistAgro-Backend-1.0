import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  transform: { "^.+\\.tsx?$": ["ts-jest", { useESM: true }] },
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  testMatch: ["<rootDir>/tests/**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/doc/**"],
  coverageDirectory: "coverage",
  coverageThreshold: {
    // Keep security-critical modules fully covered while legacy coverage is raised incrementally.
    global: {},
    "./src/middlewares/error-handler.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/middlewares/not-found.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/middlewares/require-admin.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/services/authenticate-password.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/services/geocoder.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/services/turnstile-validator.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/utils/argon2id-hasher.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/utils/bcrypt-legacy-hasher.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/utils/password.hash.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/utils/paymentSplit.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/config/rate-limiting.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/utils/schemas/authorization.zod.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/utils/schemas/coordinates.zod.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/utils/schemas/login.zod.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
    "./src/utils/schemas/params.zod.ts": { statements: 100, branches: 100, functions: 100, lines: 100 },
  },
};

export default config;
