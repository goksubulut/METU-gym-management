# METU Gym Management System — API imajı (NFR-5: taşınabilir kurulum)
# Çok aşamalı: builder'da derlenir, çalışma imajına yalnızca üretim
# bağımlılıkları + derlenmiş çıktı gider.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
# prisma CLI çalışma imajında da gerekli: konteyner açılışında "migrate deploy" koşar
RUN npm ci --omit=dev && npm install --no-save prisma@^6 && npm cache clean --force
# Üretilmiş Prisma Client builder'dan kopyalanır (postinstall'da şema yoktu)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY media ./media

EXPOSE 3000
# Açılışta bekleyen migration'lar uygulanır, sonra API başlar.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
