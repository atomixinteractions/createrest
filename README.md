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

const routes = createRest(root => {
  root.before(before1)
  root.after(after1)

  root.post('/', post1)

  root.scope('demo', demoRoute => {
    demoRoute.before(before2)
    demoRoute.after(after2)

    demoRoute.get('/', get1)
    demoRoute.get('/foo', get2)

    demoRoute.scope('bar', barRoute => {
      barRoute.before(before3)
      barRoute.after(after3)

      barRoute.put('/', put3)

      barRoute.resource('example', ExampleController)
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
