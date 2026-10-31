export const sessionPaths = {
  "/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Roda o refresh token e emite um novo access token",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenInput" } } },
      },
      responses: {
        200: {
          description: "Tokens emitidos; o refresh token anterior foi invalidado",
          content: { "application/json": { schema: { $ref: "#/components/schemas/TokenPair" } } },
        },
        400: { description: "Pedido inválido" },
        401: { description: "Sessão inválida ou expirada" },
      },
    },
  },
  "/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Revoga a sessão do refresh token",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { $ref: "#/components/schemas/RefreshTokenInput" } } },
      },
      responses: { 204: { description: "Sessão revogada" }, 400: { description: "Refresh token inválido" } },
    },
  },
};

export const sessionSchemas = {
  VerifyOtp: {
    type: "object",
    additionalProperties: false,
    required: ["email", "code"],
    properties: {
      email: { type: "string", format: "email" },
      code: { type: "string", pattern: "^[0-9]{6}$" },
    },
  },
  RefreshTokenInput: {
    type: "object",
    additionalProperties: false,
    required: ["refreshToken"],
    properties: { refreshToken: { type: "string", minLength: 32, maxLength: 256 } },
  },
  TokenPair: {
    type: "object",
    required: ["accessToken", "refreshToken", "tokenType", "expiresIn"],
    properties: {
      accessToken: { type: "string" },
      refreshToken: { type: "string" },
      tokenType: { type: "string", enum: ["Bearer"] },
      expiresIn: { type: "integer", example: 900 },
    },
  },
};
