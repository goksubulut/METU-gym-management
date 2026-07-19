# METU Gym Management System — API imajı (NFR-5: taşınabilir kurulum)
# Çok aşamalı: builder'da derlenir, çalışma imajına yalnızca üretim
# bağımlılıkları + derlenmiş çıktı gider.

FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine
ENV NODE_ENV=production
# Saat dilimi: "bugünün randevuları" gibi tarih hesapları yerel güne göre
# yapılır. tzdata olmadan alpine UTC'de kalır ve gece yarısı civarı gün kayar.
RUN apk add --no-cache tzdata
ENV TZ=Europe/Istanbul
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
# prisma CLI çalışma imajında da gerekli: konteyner açılışında "migrate deploy" koşar.
# --ignore-scripts: postinstall (prisma generate) atlanır; client builder aşamasından kopyalanır.
RUN npm ci --omit=dev --ignore-scripts && npm install --no-save prisma@^6 && npm cache clean --force
# Üretilmiş Prisma Client builder'dan kopyalanır (prod npm ci ile aynı sürüm)
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY media ./media

EXPOSE 3000
# Açılışta bekleyen migration'lar uygulanır, sonra API başlar.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
