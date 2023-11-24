FROM node:12-alpine
ARG NPM_TOKEN
ENV NPM_TOKEN=$NPM_TOKEN
RUN test -n "$NPM_TOKEN"
ENV workdir=/home/node/app
RUN mkdir -p ${workdir} && chown -R node:node ${workdir}
WORKDIR ${workdir}
COPY package*.json ./
RUN echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
USER node
RUN npm install --production
RUN rm .npmrc
COPY --chown=node:node dist/ .
EXPOSE 3000
CMD [ "node", "index.js" ]
