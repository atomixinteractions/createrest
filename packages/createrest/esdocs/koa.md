# koa example

## Installation

```shell
npm install koa createrest createrest-koa
```

## Source code

```js
// routes.js
const { createRest } = require('createrest')


module.exports.routes = createRest(root => {
  root.beforeEach(beforeEachRequest)

  root.get('/', handleIndexRequest)

  root.scope('scoped', scoped => {
    scoped.get('/example', handleScopedRequest)
  })
})

function beforeEachRequest(ctx, next) {
  console.log('Request')
  next()
}

function handleIndexRequest(ctx) {
  console.log('Handled GET /')
  ctx.body = 'Hello!'
  ctx.status = 200
}

function handleScopedRequest(ctx) {
  console.log('Handled GET /scoped/example')
  ctx.body = 'That\'s scoped example''
}
```

```js
// app.js
const Express = require('express')
const { printRoutes } = require('createrest')
const { createKoaRouter } = require('createrest-koa')

const { routes } = require('./routes')

const PORT = 8000
const app = Express()
const router = createKoaRouter(routes)

app.use(router.routes(), router.allowedMethods())

app.listen(PORT, () => {
  printRoutes(routes)
  console.log(`Listening port ${PORT}...`)
})
```
