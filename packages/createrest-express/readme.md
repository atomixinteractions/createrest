# createrest-express

[![Travis](https://img.shields.io/travis/atomixinteractions/createrest-express.svg)](https://travis-ci.org/atomixinteractions/createrest-express)
[![Coverage Status](https://coveralls.io/repos/github/atomixinteractions/createrest-express/badge.svg?branch=master)](https://coveralls.io/github/atomixinteractions/createrest-express?branch=master)
[![npm](https://img.shields.io/npm/v/createrest-express.svg)](https://npmjs.com/createrest-express)
[![GitHub tag](https://img.shields.io/github/tag/atomixinteractions/createrest-express.svg)](https://github.com/atomixinteractions/createrest-express)
[![license](https://img.shields.io/github/license/atomixinteractions/createrest-express.svg)](https://github.com/atomixinteractions/createrest-express)


## Readme

Express middleware for [createrest](https://github.com/atomixinteractions/createrest)

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
