import test from 'ava'
import supertest from 'supertest'
import { createRawServer } from './utils'


const newAnswer = () => ({
  sampleJSON: data => (req, res) => {
    res.send({ data })
  },
})

test('response from base methods', async (t) => {
  t.plan(5 * 2)
  const answer = newAnswer()
  const server = createRawServer((root) => {
    root.get('/', answer.sampleJSON('get'))
    root.post('/', answer.sampleJSON('post'))
    root.put('/', answer.sampleJSON('put'))
    root.patch('/', answer.sampleJSON('patch'))
    root.delete('/', answer.sampleJSON('delete'))
  })

  for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
    const res = await supertest(server)[method]('/')
      .expect('Content-Type', /json/)

    t.is(res.status, 200)
    t.is(res.body.data, method)
  }
})

test('crud', async (t) => {
  const CrudCtrl = {
    beforeEach(req, res, next) {
      res.data = { mdw: 1 }; next()
    },
    afterEach(req, res) {
      res.data.mdw++
      res.send(res.data)
    },
    read(req, res, next) {
      res.data.type = 'get'
      next()
    },
    create(req, res, next) {
      res.data.type = 'post'
      next()
    },
    update(req, res, next) {
      res.data.type = 'put'
      next()
    },
    destroy(req, res, next) {
      res.data.type = 'delete'
      next()
    },
  }
  const server = createRawServer((root) => {
    root.crud('demo', CrudCtrl)
  })

  for (const method of ['get', 'post', 'put', 'delete']) {
    const res = await supertest(server)[method]('/demo')
      .expect('Content-Type', /json/)

    t.is(res.status, 200)
    t.is(res.body.mdw, 2)
    t.is(res.body.type, method)
  }
})
