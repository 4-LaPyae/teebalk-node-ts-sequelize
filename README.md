Tells service

Boilerplate for Node.JS services based on Express.

## Run locally

Provide required configuration

```sh
cp .env.sample .env
```

Add your npm auth token

```sh
cp .npmrc.sample .npmrc
```

Replace \${NPM_TOKEN} with your token

Install dependencies

```sh
npm install
```

Start service

```sh
npm start
```

Will run nodemon with ts-node

## CI flow

add `NPM_TOKEN` environment variable, containing npm auth token with read access to private repositories

```sh
echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" > .npmrc
npm install
rm .npmrc

npm run lint
npm run test
npm run build

docker build -t service-name --build-arg NPM_TOKEN=${NPM_TOKEN}
docker tag ....
docker push ....
```
