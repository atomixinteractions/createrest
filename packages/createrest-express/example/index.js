const {
  createRest,
  printRoutes,
} = require('createrest')
const { createExressMiddleware } = require('../dist')
const express = require('express')

const app = express()

function before1(req, res, next) {
  console.log('- before1()')
  next()
}
function before2(req, res, next) {
  console.log('-- before2()')
  next()
}
function before3(req, res, next) {
  console.log('--- before3()')
  next()
}
function after1(req, res, next) {
  console.log('- after1()')
  next()
}
function after2(req, res, next) {
  console.log('-- after2()')
  next()
}
function after3(req, res, next) {
  console.log('--- after3()')
  next()
}
function get1(req, res, next) {
  res.json({ content: 'get1()' })
  console.log('- get1()')
  next()
}
function get2(req, res, next) {
  res.json({ content: 'get2()' })
  console.log('-- get2()')
  next()
}
function get3(req, res, next) {
  res.json({ content: 'get3()' })
  console.log('--- get3()')
  next()
}

function get4(req, res, next) {
  res.json({ content: 'get4()' })
  console.log('---- get4()')
  next()
}

const routes = createRest(e => {
  e.before(before1)
  e.after(after1)

  e.get('/', get1)

  e.scope('demo', e => {
    e.before(before2)
    e.after(after2)

    e.get('/', get2)
    e.get('/foo', get3)

    e.scope('bar', e => {
      e.before(before3)
      e.after(after3)

      e.get('/baz', get4)
    })
  })
})

app.use(createExressMiddleware(routes))

app.listen(4001, () => {
  printRoutes(routes)
  console.log('Listening port 4001...')
})
