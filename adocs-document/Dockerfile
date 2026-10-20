FROM node:22-alpine

WORKDIR /app
ENV NODE_ENV=production

RUN corepack enable

COPY document/package.json document/pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY document .

RUN pnpm build

CMD ["pnpm", "start"]