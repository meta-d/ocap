ARG HOST
ARG PORT

FROM node:18-alpine AS build

LABEL maintainer="meta.digital.cloud@gmail.com"
LABEL org.opencontainers.image.source https://github.com/meta-d/ocap

ENV CI=true

# Set Python interpreter for `node-gyp` to use
ENV PYTHON /usr/bin/python

RUN apk --update add bash && npm i -g npm \
    && apk add --no-cache --virtual build-dependencies dos2unix gcc g++ git make python3 vips-dev

# Output Python3 version
RUN python3 --version

RUN npm install --quiet node-gyp@9.3.1 -g
RUN npm install yarn -g --force
RUN mkdir /srv/pangolin && chown -R node:node /srv/pangolin

USER node:node

WORKDIR /srv/pangolin

COPY --chown=node:node packages/store/package.json ./packages/store/
COPY --chown=node:node packages/core/package.json ./packages/core/
COPY --chown=node:node packages/copilot/package.json ./packages/copilot/
COPY --chown=node:node packages/contracts/package.json ./packages/contracts/
COPY --chown=node:node packages/common/package.json ./packages/common/
COPY --chown=node:node packages/config/package.json ./packages/config/
COPY --chown=node:node packages/auth/package.json ./packages/auth/
COPY --chown=node:node packages/server/package.json ./packages/server/
COPY --chown=node:node packages/server-ai/package.json ./packages/server-ai/
COPY --chown=node:node packages/adapter/package.json ./packages/adapter/
COPY --chown=node:node packages/analytics/package.json ./packages/analytics/

COPY --chown=node:node .deploy/api/package.json ./
COPY --chown=node:node yarn.lock ./

RUN npm install --legacy-peer-deps

COPY --chown=node:node nx.json ./
COPY --chown=node:node tsconfig.base.json ./
COPY --chown=node:node packages ./packages
COPY --chown=node:node apps/api ./apps/api
RUN yarn nx build api

#////////////////////////////////////////////////////////////////////////////////
FROM node:18-alpine AS production

ENV NODE_OPTIONS=${NODE_OPTIONS:-"--max-old-space-size=2048"} \
    NODE_ENV=${NODE_ENV:-production} \
    API_HOST=${API_HOST:-api} \
    API_PORT=${API_PORT:-3000} \
    API_BASE_URL=${API_BASE_URL:-http://localhost:3000} \
    SENTRY_DSN=${SENTRY_DSN} \
    DB_HOST=${DB_HOST:-db} \
    DB_NAME=${DB_NAME:-postgres} \
    DB_PORT=${DB_PORT:-5432} \
    DB_USER=${DB_USER} \
    DB_PASS=${DB_PASS} \
    DB_TYPE=${DB_TYPE:-sqlite} \
    DB_SSL_MODE=${DB_SSL_MODE} \
    HOST=${HOST:-0.0.0.0} \
    PORT=${PORT:-3000} \
    DEMO=${DEMO:-false}

WORKDIR /srv/pangolin

RUN npm install pm2 -g

# COPY dist and dependencies
COPY --chown=node:node --from=build /srv/pangolin/dist/packages ./packages
COPY --chown=node:node --from=build /srv/pangolin/dist/apps/api .
COPY --chown=node:node --from=build /srv/pangolin/tsconfig.base.json ./
COPY --chown=node:node --from=build /srv/pangolin/package-lock.json .
COPY --chown=node:node .deploy/api/package-prod.json ./package.json

# RUN yarn config set network-timeout 300000
RUN npm install --legacy-peer-deps && \
    touch ormlogs.log && chown -R node:node /srv/pangolin

USER node:node

EXPOSE ${PORT}

CMD [ "pm2-runtime", "main.js" ]
