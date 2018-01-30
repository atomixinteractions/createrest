/* eslint-disable no-console, no-magic-numbers */
const {
  createRest,
  printRoutes,
} = require('createrest')
const express = require('express')
const { createExressMiddleware } = require('../dist')


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

const routes = createRest((root) => {
  root.before(before1)
  root.after(after1)

  root.get('/', get1)

  root.scope('demo', (demo) => {
    demo.before(before2)
    demo.after(after2)

    demo.get('/', get2)
    demo.get('/foo', get3)

    demo.scope('bar', (bar) => {
      bar.before(before3)
      bar.after(after3)

      bar.get('/baz', get4)
    })
  })
})

app.use(createExressMiddleware(routes))

app.listen(4001, () => {
  printRoutes(routes)
  console.log('Listening port 4001...')
})
