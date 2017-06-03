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
const {
  createRest,
  printRoutes,
} = require('createrest')
const { createRestExpress } = require('createrest-express')
const express = require('express')

const app = express()

function before1() { console.log('before1()') }
function before2() { console.log('before2()') }
function before3() { console.log('before3()') }
function after1() { console.log('after1()') }
function after2() { console.log('after2()') }
function after3() { console.log('after3()') }
function post1() { console.log('post1()') }
function get1() { console.log('get1()') }
function get2() { console.log('get2()') }
function put3() { console.log('put3()') }

const ExampleController = {
  beforeEach() {},
  afterEach() {},
  read() {},
  create() {},
  update() {},
  destroy () {},
}

const routes = createRest(e => {
  e.before(before1)
  e.after(after1)

  e.post('/', post1)

  e.scope('demo', e => {
    e.before(before2)
    e.after(after2)

    e.get('/', get1)
    e.get('/foo', get2)

    e.scope('bar', e => {
      e.before(before3)
      e.after(after3)

      e.put('/', put3)

      e.resource('example', ExampleController)
    })
  })
})

app.use(createRestExpress(routes))

app.listen(4001, () => {
  printRoutes(routes)
})

```


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
```
