# Installation

## NPM packages

[createrest](https://npmjs.com/createrest)

```shell
npm install --save createrest
```

## Import functions

If you use babel or latest build of node.js:

```js
import { createRest, flattenRoutes, printRoutes } from 'createrest'
```

For commonjs based modules:

```js
const { createRest, flattenRoutes, printRoutes } = require('createrest')
```

## Express

[createrest-express](https://npmjs.com/createrest-express)

```shell
npm install --save createrest createrest-express express
```

```js
const Express = require('express')
const { createExpressMiddleware } = require('createrest-express')
const routes = require('./routes')

const app = Express()

app.use(createExpressMiddleware(routes))

app.listen(8000)
```

## Koa2

[createrest-koa](https://npmjs.com/createrest-koa)

```shell
npm install --save createrest createrest-koa koa@2
```
```js
const Express = require('koa')
const { createKoaRouter } = require('createrest-express')
const routes = require('./routes')

const app = new Koa()
const router = createKoaRouter(routes)

app.use(router.routes(), router.allowedMethods())

app.listen(8000)
```

