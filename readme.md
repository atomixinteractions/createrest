# createrest

[![Travis](https://img.shields.io/travis/atomixinteractions/createrest.svg)](https://travis-ci.org/atomixinteractions/createrest)
[![Coverage Status](https://coveralls.io/repos/github/atomixinteractions/createrest/badge.svg?branch=master)](https://coveralls.io/github/atomixinteractions/createrest?branch=master)
[![npm](https://img.shields.io/npm/v/createrest.svg)](https://npmjs.com/createrest)
![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)
[![license](https://img.shields.io/github/license/atomixinteractions/createrest.svg)](https://github.com/atomixinteractions/createrest)


Declare your routes

Docs at https://atomixinteractions.github.io/createrest



## Usage example

```js
// routes.js
const {
  createRest,
  printRoutes,
} = require('createrest')

const before1 = () => { console.log('before1()') }
const before2 = () => { console.log('before2()') }
const before3 = () => { console.log('before3()') }
const after1 = () => { console.log('after1()') }
const after2 = () => { console.log('after2()') }
const after3 = () => { console.log('after3()') }
const post1 = () => { console.log('post1()') }
const get1 = () => { console.log('get1()') }
const get2 = () => { console.log('get2()') }
const put3 = () => { console.log('put3()') }

const ExampleController = {
  beforeEach() { console.log('Call before each handler') },
  afterEach() {},
  read() {},
  create() {},
  update() {},
  destroy () {},
}

const BooksController = {
  beforeEach() { console.log('Call before each handler') },
  afterEach() {},
  index() {},
  create() {},
  read() {},
  update() {},
  patch() {},
  destroy () {},
}

const routes = createRest(root => {
  root.beforeEach(before1)
  root.afterEach(after1)

  root.post('/', post1)

  root.scope('demo', demoRoute => {
    demoRoute.beforeEach(before2)
    demoRoute.afterEach(after2)

    demoRoute.get('/', get1)
    demoRoute.get('/foo', get2)

    demoRoute.scope('bar', barRoute => {
      barRoute.beforeEach(before3)
      barRoute.afterEach(after3)

      barRoute.put('/', put3)

      barRoute.crud('example', ExampleController)
    })
  })

  root.resources('books', BooksController)
})

module.exports = routes
```

### Express

More in its repo [createrest-express](https://atmx.in/rest-ex)

```js
const { createRestExpress } = require('createrest-express')
const express = require('express')
const routes = require('./routes')

const app = express()

app.use(createRestExpress(routes))

app.listen(4001, () => {
  printRoutes(routes)
})
```

### Koa

More in its repo [createrest-koa](https://atmx.in/rest-koa)

```js
const Koa = require('koa')
const { createKoaRouter } = require('createrest-koa')
const routes = require('./routes')

const app = new Koa()
const router = createKoaRouter(routes)

app.use(router.routes(), router.allowedMethods())

app.listen(3000, () => {
  printRoutes(routes)
})
```

---

Output:

```
POST / -> before1(), post1(), after1()
GET /demo/ -> before1(), before2(), get1(), after2(), after1()
GET /demo/foo/ -> before1(), before2(), get2(), after2(), after1()
PUT /demo/bar/ -> before1(), before2(), before3(), put3(), after3(), after2(), after1()
GET /demo/bar/example/ -> before1(), before2(), before3(), beforeEach(), read(), afterEach(), after3(), after2(), after1()
POST /demo/bar/example/ -> before1(), before2(), before3(), beforeEach(), create(), afterEach(), after3(), after2(), after1()
PUT /demo/bar/example/ -> before1(), before2(), before3(), beforeEach(), update(), afterEach(), after3(), after2(), after1()
DELETE /demo/bar/example/ -> before1(), before2(), before3(), beforeEach(), destroy(), afterEach(), after3(), after2(), after1()
GET /books/ -> before1(), beforeEach(), index(), afterEach(), after1()
POST /books/ -> before1(), beforeEach(), create(), afterEach(), after1()
GET /books/:bookId/ -> before1(), beforeEach(), read(), afterEach(), after1()
PUT /books/:bookId/ -> before1(), beforeEach(), update(), afterEach(), after1()
PATCH /books/:bookId/ -> before1(), beforeEach(), patch(), afterEach(), after1()
DELETE /books/:bookId/ -> before1(), beforeEach(), destroy(), afterEach(), after1()
```
