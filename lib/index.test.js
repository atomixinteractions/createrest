import test from 'ava'
import { createRest } from './index'

/* eslint-disable no-shadow */

const get = () => {}
const post = () => {}
const put = () => {}
const patch = () => {}
const destroy = () => {}
const before = () => {}
const after = () => {}

const make = (before = [], after = [], scoped = {}, local = {}) => ({
  before,
  after,
  scoped,
  local,
})

test('Base structure', t => {
  t.deepEqual(
    createRest(r => {}),
    make()
  )
})

test('Before', t => {
  t.deepEqual(
    createRest(r => {
      r.before(before)
    }),
    make([before])
  )
})

test('After', t => {
  t.deepEqual(
    createRest(r => {
      r.after(after)
    }),
    make([], [after])
  )
})

test('Methods', t => {
  t.deepEqual(
    createRest(r => {
      r.get('/', get)
      r.post('/', post)
      r.put('/', put)
      r.patch('/', patch)
      r.delete('/', destroy)
    }),
    make([], [], {}, {
      POST: [post],
      GET: [get],
      PUT: [put],
      PATCH: [patch],
      DELETE: [destroy],
    })
  )
})

test('Methods with before/after', t => {
  t.deepEqual(
    createRest(r => {
      r.before(before)
      r.after(after)
      r.get('/', get)
      r.post('/', post)
      r.put('/', put)
      r.patch('/', patch)
      r.delete('/', destroy)
    }),
    make([before], [after], {}, {
      POST: [post],
      GET: [get],
      PUT: [put],
      PATCH: [patch],
      DELETE: [destroy],
    })
  )
})
