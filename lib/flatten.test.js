import test from 'ava'
import { createRest, flattenRoutes } from './index'

/* eslint-disable no-shadow */

const get = () => {}
const post = () => {}
const put = () => {}
const patch = () => {}
const destroy = () => {}
const before = () => {}
const after = () => {}

const make = (method, listeners = []) => ({
  method, listeners,
})

test('Empty', t => {
  t.deepEqual(
    flattenRoutes(createRest(r => {
    })),
    {
    }
  )
})

test('Local methods', t => {
  t.deepEqual(
    flattenRoutes(createRest(r => {
      r.get(get)
      r.post(post)
      r.put(put)
      r.patch(patch)
      r.delete(destroy)
    })),
    {
      '/': {
        GET: [get],
        POST: [post],
        PUT: [put],
        PATCH: [patch],
        DELETE: [destroy],
      }
    }
  )
})

test('Local and scoped methods', t => {
  t.deepEqual(
    flattenRoutes(createRest(r => {
      r.get(get)
      r.post(post)
      r.get('/name', get)
      r.post('/name', post)
    })),
    {
      '/': {
        GET: [get],
        POST: [post],
      },
      '/name/': {
        GET: [get],
        POST: [post],
      },
    }
  )
})

test('Local, scoped methods and methods in scope', t => {
  t.deepEqual(
    flattenRoutes(createRest(r => {
      r.get(get)
      r.post(post)
      r.get('/name', get)
      r.post('name', post)
      r.scope('foo', r => {
        r.get(get)
        r.post('bar', post)
      })
      r.get(get)
      r.post('name', post)
    })),
    {
      '/': {
        GET: [get, get],
        POST: [post],
      },
      '/name/': {
        GET: [get],
        POST: [post, post],
      },
      '/foo/': {
        GET: [get],
      },
      '/foo/bar/': {
        POST: [post],
      },
    }
  )
})
