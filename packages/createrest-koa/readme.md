# createrest-koa

[![Travis](https://img.shields.io/travis/atomixinteractions/createrest-koa.svg)](https://travis-ci.org/atomixinteractions/createrest-koa)
[![Coverage Status](https://coveralls.io/repos/github/atomixinteractions/createrest-koa/badge.svg?branch=master)](https://coveralls.io/github/atomixinteractions/createrest-koa?branch=master)
[![npm](https://img.shields.io/npm/v/createrest-koa.svg)](https://npmjs.com/createrest-koa)
[![GitHub tag](https://img.shields.io/github/tag/atomixinteractions/createrest-koa.svg)](https://github.com/atomixinteractions/createrest-koa)
[![license](https://img.shields.io/github/license/atomixinteractions/createrest-koa.svg)](https://github.com/atomixinteractions/createrest-koa)


## Readme

Koa middleware for [createrest](https://github.com/atomixinteractions/createrest)

## Usage example

```js
const { createRest, printRoutes } = require('createrest)
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
