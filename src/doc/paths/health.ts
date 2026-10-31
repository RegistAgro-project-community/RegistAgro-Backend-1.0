export const healthPaths = {
  "/": {
    get: {
      tags: ["Health"],
      summary: "Confirma que a API está a responder",
      responses: { 200: { description: "API disponível" } },
    },
  },
  "/health": {
    get: {
      tags: ["Health"],
      summary: "Verifica a saúde da API e dependências",
      responses: {
        200: { description: "API, PostgreSQL e Redis disponíveis" },
        503: { description: "Uma ou mais dependências estão indisponíveis" },
      },
    },
  },
  "/ready": {
    get: {
      tags: ["Health"],
      summary: "Indica se a instância pode receber tráfego",
      responses: { 200: { description: "Instância pronta" }, 503: { description: "Instância não pronta" } },
    },
  },
};
