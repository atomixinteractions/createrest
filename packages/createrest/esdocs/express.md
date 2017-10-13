# Express example

## Installation

```shell
npm install express createrest createrest-express
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

function beforeEachRequest(req, res, next) {
  console.log('Request')
  next()
}

function handleIndexRequest(req, res) {
  console.log('Handled GET /')
  res.send('Hello!').status(200)
}

function handleScopedRequest(req, res) {
  console.log('Handled GET /scoped/example')
  res.send('That\'s scoped example')
}
```

```js
// app.js
const Express = require('express')
const { printRoutes } = require('createrest')
const { createExpressMiddleware } = require('createrest-express')

const { routes } = require('./routes')

const PORT = 8000
const app = Express()

app.use(createExpressMiddleware(routes))

app.listen(PORT, () => {
  printRoutes(routes)
  console.log(`Listening port ${PORT}...`)
})
```
