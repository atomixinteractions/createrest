import test from 'ava'
import { createRest } from '../lib'

/* eslint-disable no-shadow */

const get = () => {}
const post = () => {}
const put = () => {}
const patch = () => {}
const destroy = () => {}
const before = () => {}
const after = () => {}

const ObjectController = {
  create() {},
  read() {},
  update() {},
  destroy() {},
}

const make = (before = [], after = [], local = {}, scoped = {}) => ({
  before,
  after,
  local,
  scoped,
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
      r.get(get)
      r.post(post)
      r.put(put)
      r.patch('/', patch)
      r.delete('/', destroy)
    }),
    make([], [], {
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
    make([before], [after], {
      POST: [post],
      GET: [get],
      PUT: [put],
      PATCH: [patch],
      DELETE: [destroy],
    })
  )
})

test('Simple scoping', t => {
  t.deepEqual(
    createRest(r => {
      r.scope('demo', r => {
      })
    }),
    make([], [], {}, {
      demo: make(),
    })
  )
})

test('Scoped methods', t => {
  t.deepEqual(
    createRest(r => {
      r.scope('demo', r => {
        r.get('/', get)
        r.post('/', post)
        r.put('/', put)
        r.patch('/', patch)
        r.delete('/', destroy)
      })
    }),
    make([], [], {}, {
      demo: make([], [], {
        POST: [post],
        GET: [get],
        PUT: [put],
        PATCH: [patch],
        DELETE: [destroy],
      })
    })
  )
})

test('before/after in scope', t => {
  t.deepEqual(
    createRest(r => {
      r.before(before)
      r.after(after)
      r.scope('demo', r => {
        r.before(before)
        r.after(after)
        r.get('/', get)
        r.post('/', post)
        r.put('/', put)
      })
      r.patch('/', patch)
      r.delete('/', destroy)
    }),
    make(
      [before], [after],
      {
        PATCH: [patch],
        DELETE: [destroy],
      },
      {
        demo: make([before], [after], {
          POST: [post],
          GET: [get],
          PUT: [put],
        })
      },
    )
  )
})

test('Deep scope', t => {
  t.deepEqual(
    createRest(r => {
      r.scope('foo', r => {
        r.scope('bar', r => {
          r.get('/', get)
        })
      })
    }),
    make([], [], {},
      {
        foo: make([], [], {}, {
          bar: make([], [], {
            GET: [get],
          })
        })
      }
    )
  )
})

test('Create scoped by methods', t => {
  t.deepEqual(
    createRest(r => {
      r.post('/foo', post, post)
      r.get('bar', get, get)
    }),
    make([], [], {}, {
      foo: make([], [], { POST: [post, post] }),
      bar: make([], [], { GET: [get, get] }),
    })
  )
})

test('Local methods attach', t => {
  t.deepEqual(
    createRest(r => {
      r.get('/bar', get)
      r.get('bar', get, get)
    }),
    make([], [], {}, {
      bar: make([], [],  { GET: [get, get, get] }),
    })
  )
})

test('Fail for wrong scope name', t => {
  t.throws(() => {
    createRest(r => {
      r.scope('', () => {})
    })
  })
  t.throws(() => {
    createRest(r => {
      r.scope(null, () => {})
    })
  })
  t.throws(() => {
    createRest(r => {
      r.scope('/', () => {})
    })
  })
})

test('Fail if passed deep path to method', t => {
  t.throws(() => {
    createRest(r => {
      r.post('foo/bar', post)
    })
  })
})

test('Fail if no listeners passed to method', t => {
  t.throws(() => {
    createRest(r => {
      r.put('demo')
    })
  })
})

test('Simple resource with default options', t => {
  t.deepEqual(
    createRest(r => {
      r.resource('unicorn', ObjectController)
    }),
    make([], [], {}, {
      unicorn: make([], [], {
        GET: [ObjectController.read],
        POST: [ObjectController.create],
        PUT: [ObjectController.update],
        DELETE: [ObjectController.destroy],
      }),
    })
  )
})

test('resource with partial controller and before/after', t => {
  t.deepEqual(
    createRest(r => {
      r.resource( 'unicorn',
        Object.assign({}, ObjectController, {
          beforeEach: before, afterEach: after, create: undefined,
        })
      )
    }),
    make([], [], {}, {
      unicorn: make([before], [after], {
        GET: [ObjectController.read],
        PUT: [ObjectController.update],
        DELETE: [ObjectController.destroy],
      })
    })
  )
})


test('Fail resource with def opts', t => {
  t.deepEqual(
    createRest(r => {
      r.resource('unicorn')
    }),
    make()
  )

  t.throws(() => {
    createRest(r => {
      r.resource()
    })
  })
})

test('Resource with options.only', t => {
  t.deepEqual(
    createRest(r => {
      r.resource('unicorn', ObjectController, { only: ['create'] })
    }),
    make([], [], {}, {
      unicorn: make([], [], {
        POST: [ObjectController.create],
      }),
    })
  )
})

test('Resource with options.except', t => {
  t.deepEqual(
    createRest(r => {
      r.resource('unicorn', ObjectController, { except: ['create'] })
    }),
    make([], [], {}, {
      unicorn: make([], [], {
        GET: [ObjectController.read],
        PUT: [ObjectController.update],
        DELETE: [ObjectController.destroy],
      }),
    })
  )
})


test('resource in scope', t => {
  t.deepEqual(
    createRest(r => {
      r.scope('rainbow', r => {
        r.resource('unicorn', ObjectController, { except: ['create'] })
      })
    }),
    make([], [], {}, {
      rainbow: make([], [], {}, {
        unicorn: make([], [], {
          GET: [ObjectController.read],
          PUT: [ObjectController.update],
          DELETE: [ObjectController.destroy],
        }),
      })
    })
  )
})
