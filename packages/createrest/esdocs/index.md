# createRest

`createRest` is a node.js library for [Express](https://expressjs.com) and [koa](http://koajs.com) designed to build REST API routing scheme.


## Routing sample

> Example for express

```js
// routes.js
const { createExpressMiddleware } = require('createrest-express')
const { createRest } = require('createrest')

const routes = createRest(root => {
  root.get('/', handleIndexRequest)
})

function handleIndexRequest(req, res) {
  console.log('Handled GET /')
  res.send('Hello!').status(200)
}

module.exports = createExpressMiddleware(routes)
```

```js
// app.js
const Express = require('express')
const routes = require('./routes')

const app = Express()

app.use(routes)
app.listen(8000)
```
