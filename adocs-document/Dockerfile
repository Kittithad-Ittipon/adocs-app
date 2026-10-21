FROM node:22-alpine

WORKDIR /app

# pnpm 10 matches the lockfile; newer pnpm fails on the build scripts ignored in pnpm-workspace.yaml
RUN npm install -g pnpm@10

COPY document/package.json document/pnpm-lock.yaml document/pnpm-workspace.yaml ./

# Dev dependencies (tailwind, pagefind) are needed to build, so NODE_ENV is set afterwards
RUN pnpm install --frozen-lockfile

COPY document .

RUN pnpm build

ENV NODE_ENV=production

CMD ["pnpm", "start"]
