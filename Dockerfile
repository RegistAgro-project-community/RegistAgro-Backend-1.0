FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
ENV DATABASE_URL=postgresql://build:build@127.0.0.1:5432/build
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts && npm rebuild argon2 bcrypt
COPY --from=build /app/dist ./dist
COPY --from=build /app/generated ./generated
COPY --from=build /app/generated ./dist/generated
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY src/upload ./src/upload
EXPOSE 5500
CMD ["node", "dist/src/server.js"]
