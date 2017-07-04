# createrest-koa

[![npm](https://img.shields.io/npm/v/createrest-koa.svg)](https://npmjs.com/createrest-koa)

## Readme

Koa middleware for [createrest](https://github.com/atomixinteractions/createrest)

## Usage example

```js
const { createRest, printRoutes } = require('createrest')
const { createKoaRouter } = require('createrest-koa')
const Koa = require('koa')

const app = new Koa()

const routes = createRest(root => {
  // Your routes here
})
const router = createKoaRouter(routes)


app.use(router.routes(), router.allowedMethods())

app.listen(3000, () => {
  printRoutes(routes)
  console.log('Listening port 3000...')
})
```
