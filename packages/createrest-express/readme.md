# createrest-express [![npm](https://img.shields.io/npm/v/createrest-express.svg)](https://npmjs.com/createrest-express)


## Readme

[createRest](/packages/createrest) generator for Express

## Usage example

```js
const { createRest, printRoutes } = require('createrest')
const { createExpressMiddleware } = require('createrest-express')
const express = require('express')

const app = express()

const routes = createRest(e => {
  // Your routes here
})

app.use(createExpressMiddlware(routes))

app.listen(3000, () => {
  printRoutes(routes)
  console.log('Listening port 3000...')
})
```
