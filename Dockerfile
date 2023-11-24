FROM node:12-alpine as base
USER root
ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN
RUN test -n "$NPM_TOKEN"
ENV workdir=/home/node/app
RUN mkdir -p ${workdir} && chown -R node:node ${workdir}
WORKDIR ${workdir}
RUN apk update
# add puppeteer build dependencies
ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD="true"
# Installs latest Chromium package.
RUN apk --no-cache add chromium nss freetype harfbuzz ca-certificates ttf-freefont \
  && rm -rf /var/cache/apk/* /tmp/*
# japanese font
RUN apk add --no-cache curl fontconfig font-noto-cjk \
  && fc-cache -fv


FROM base as builder
USER root
# add bcrypt build dependencies
RUN apk --no-cache add --virtual builds-deps build-base python2 git
COPY package*.json ./
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
RUN chown -R node:node ${workdir}
USER node
RUN npm install --production
RUN rm .npmrc


FROM base
USER node
# copy node_modules from builder
COPY --chown=node:node --from=builder ${workdir} .
# copy source code from host
COPY --chown=node:node dist/ .
# expose package version to env variables
RUN echo VERSION=`npm run get-version --silent` >> .env
EXPOSE 3000
CMD [ "node", "-r", "dotenv/config", "index.js" ]
