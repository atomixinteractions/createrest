# createrest

[![Travis](https://img.shields.io/travis/atomixinteractions/createrest.svg)](https://travis-ci.org/atomixinteractions/createrest)
[![Coverage Status](https://coveralls.io/repos/github/atomixinteractions/createrest/badge.svg?branch=master)](https://coveralls.io/github/atomixinteractions/createrest?branch=master)
[![npm](https://img.shields.io/npm/v/createrest.svg)](https://npmjs.com/createrest)
[![GitHub tag](https://img.shields.io/github/tag/atomixinteractions/createrest.svg)](https://github.com/atomixinteractions/createrest)
[![license](https://img.shields.io/github/license/atomixinteractions/createrest.svg)](https://github.com/atomixinteractions/createrest)


Declare your routes

Docs at https://atomixinteractions.github.io/createrest


## Warning!

> Now in development! Use in production only after v1 release!


## Usage example

```js
import {
  createRest,
  printRoutes,
} from 'createrest'
import expressMiddleware from 'createrest-express'
import express from 'express'

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


## CLI

```bash
rest               # Show man page
rest init          # Create main files
rest routes        # Show routes
```

or with alias: `createrest`

## API

### before

Add before handlers to current scope.

```js
createRest(r => {
  r.before(() => console.log(1))
  r.before(() => console.log(2), () => console.log(3))
})
```

```
 1
 2
 3
```

### after

Add after handler to current scope.

```js
createRest(r => {
  r.after(() => console.log(3))
  r.after(() => console.log(2), () => console.log(1))
})
```

```
 3
 2
 1
```

### get, post, put, patch, delete

Simple handlers for general HTTP methods. Handlers will be merged.

```js
createRest(r => {
  r.get('name', () => console.log('named handler'))
  r.get(() => console.log('root handler'))
  r.get(() => console.log('second root handler'))
  r.post('create',
    (req, res, next) => next(),
    authorize('user'),
    () => console.log('handle with middlewares')
  )
})
```

### scope

Add scoped address, before/after handlers and simple handlers.
Before/After handlers is inherits from parent scope.

```js
createRest(r => {
  r.before(() => console.log(1))
  r.after(() => console.log(4))

  r.scope('foo', r => {
    r.before(() => console.log(2))
    r.after(() => console.log(5))

    r.get('bar', () => console.log(3))
  })
})
```

```
GET /foo/bar

1
2
3
4
5
```

### resource

Create 4 handlers for single resource.

```
resource(name: string, controller: object, options?: { only?: string[], except?: string[] })
```

```js
const Controller = {
  read() {},
  create() {},
  update() {},
  destroy() {},
  beforeEach() {},
  afterEach() {},
}
const SecondCtrl = {
  read() {},
  update() {},
}
const routes = createRest(r => {
  r.resource('example', Controller)
  r.resource('demo', Controller, { only: ['create', 'read'] })
  r.resource('single', Controller, { except: ['destroy', 'create'] })
})
printRoutes(routes, true)
```

```
GET /example/ -> beforeEach(), read(), afterEach()
POST /example/ -> beforeEach(), create(), afterEach()
PUT /example/ -> beforeEach(), update(), afterEach()
DELETE /example/ -> beforeEach(), destroy(), afterEach()

GET /demo/ -> beforeEach(), read(), afterEach()
POST /demo/ -> beforeEach(), create(), afterEach()

GET /single/ -> beforeEach(), read(), afterEach()
PUT /single/ -> beforeEach(), update(), afterEach()
```
