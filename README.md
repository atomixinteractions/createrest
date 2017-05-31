# createrest

[![Travis](https://img.shields.io/travis/atomixinteractions/createrest.svg)](https://travis-ci.org/atomixinteractions/createrest)
[![Coverage Status](https://coveralls.io/repos/github/atomixinteractions/createrest/badge.svg?branch=master)](https://coveralls.io/github/atomixinteractions/createrest?branch=master)
[![npm](https://img.shields.io/npm/v/createrest.svg)](https://npmjs.com/createrest)
[![GitHub tag](https://img.shields.io/github/tag/atomixinteractions/createrest.svg)](https://github.com/atomixinteractions/createrest)
[![license](https://img.shields.io/github/license/atomixinteractions/createrest.svg)](https://github.com/atomixinteractions/createrest)


Declare your routes

Docs at https://atomixinteractions.github.io/createrest



## Usage example

```js
const {
  createRest,
  printRoutes,
} = require('createrest')
const { expressMiddleware } = require('createrest-express')
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
    })
  })
})

app.use(expressMiddleware(routes))

app.listen(4001, () => {
  printRoutes(routes)
})
```
