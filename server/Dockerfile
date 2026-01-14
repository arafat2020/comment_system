ARG NODE_VERSION=22.14.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /usr/src/app

# ---------------- Dependencies ----------------
FROM base AS deps
COPY package*.json ./
RUN npm ci --omit=dev

# ---------------- Build ----------------
FROM base AS build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------------- Runtime ----------------
FROM base AS final
ENV NODE_ENV=production

RUN mkdir -p uploads && chown -R node:node /usr/src/app
USER node

COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/package*.json ./

EXPOSE 5000
CMD ["npm","start"]
