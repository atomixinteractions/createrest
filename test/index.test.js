import avaTest from 'ava'
import { createRest } from '../lib'
import { createRestInstanceSymbol } from '../lib/symbol'


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
  [createRestInstanceSymbol]: true,
})

avaTest('Creates base structure', test => {
  test.deepEqual(
    createRest(r => {}),
    make()
  )
})

avaTest('createRest fails if a function is not passed', test => {
  test.throws(() => {
    createRest(null)
  })
  test.throws(() => {
    createRest({})
  })
  test.throws(() => {
    createRest([])
  })
  test.throws(() => {
    createRest(true)
  })
  test.throws(() => {
    createRest(1)
  })
  test.throws(() => {
    createRest('')
  })
  test.throws(() => {
    createRest()
  })
})

avaTest('Creates before', test => {
  test.deepEqual(
    createRest(root => {
      root.before(before)
    }),
    make([before])
  )
})

avaTest('Creates after', test => {
  test.deepEqual(
    createRest(root => {
      root.after(after)
    }),
    make([], [after])
  )
})

avaTest('Creates methods', test => {
  test.deepEqual(
    createRest(root => {
      root.get(get)
      root.post(post)
      root.put(put)
      root.patch('/', patch)
      root.delete('/', destroy)
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

avaTest('Creates methods with before/after', test => {
  test.deepEqual(
    createRest(root => {
      root.before(before)
      root.after(after)
      root.get('/', get)
      root.post('/', post)
      root.put('/', put)
      root.patch('/', patch)
      root.delete('/', destroy)
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

avaTest('Creates simple scoping', test => {
  test.deepEqual(
    createRest(root => {
      root.scope('demo', demo => {
      })
    }),
    make([], [], {}, {
      demo: make(),
    })
  )
})

avaTest('Creates scoped methods', test => {
  test.deepEqual(
    createRest(root => {
      root.scope('demo', demo => {
        demo.get('/', get)
        demo.post('/', post)
        demo.put('/', put)
        demo.patch('/', patch)
        demo.delete('/', destroy)
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

avaTest('Creates before/after in a scope', test => {
  test.deepEqual(
    createRest(root => {
      root.beforeEach(before)
      root.afterEach(after)
      root.scope('demo', demo => {
        demo.beforeEach(before)
        demo.afterEach(after)
        demo.get('/', get)
        demo.post('/', post)
        demo.put('/', put)
      })
      root.patch('/', patch)
      root.delete('/', destroy)
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

avaTest('Creates deep scope', test => {
  test.deepEqual(
    createRest(root => {
      root.scope('foo', foo => {
        foo.scope('bar', bar => {
          bar.get('/', get)
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

avaTest('Creates scoped by methods', test => {
  test.deepEqual(
    createRest(root => {
      root.post('/foo', post, post)
      root.get('bar', get, get)
    }),
    make([], [], {}, {
      foo: make([], [], { POST: [post, post] }),
      bar: make([], [], { GET: [get, get] }),
    })
  )
})

avaTest('Attaches local methods', test => {
  test.deepEqual(
    createRest(root => {
      root.get('/bar', get)
      root.get('bar', get, get)
    }),
    make([], [], {}, {
      bar: make([], [],  { GET: [get, get, get] }),
    })
  )
})

avaTest('Fails for wrong scope name', test => {
  test.throws(() => {
    createRest(root => {
      root.scope('', () => {})
    })
  })
  test.throws(() => {
    createRest(root => {
      root.scope(null, () => {})
    })
  })
  test.throws(() => {
    createRest(root => {
      root.scope('/', () => {})
    })
  })
})

avaTest('Fails if deep path to a method is passed', test => {
  test.throws(() => {
    createRest(root => {
      root.post('foo/bar', post)
    })
  })
})

avaTest('Fails if no listeners are passed to a method', test => {
  test.throws(() => {
    createRest(root => {
      root.put('demo')
    })
  })
})

avaTest('Creates simple resource with default options', test => {
  test.deepEqual(
    createRest(root => {
      root.resource('unicorn', ObjectController)
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

avaTest('Creates resource with partial controller and before/after', test => {
  const Controller = Object.assign({}, ObjectController, {
    beforeEach: before,
    afterEach: after,
    create: undefined,
  })
  test.deepEqual(
    createRest(root => {
      root.resource( 'unicorn', Controller)
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


avaTest('Fails for resource with default options', test => {
  test.deepEqual(
    createRest(root => {
      root.resource('unicorn')
    }),
    make()
  )

  test.throws(() => {
    createRest(root => {
      root.resource()
    })
  })
})

avaTest('Creaets resource with options.only', test => {
  test.deepEqual(
    createRest(root => {
      root.resource('unicorn', ObjectController, { only: ['create'] })
    }),
    make([], [], {}, {
      unicorn: make([], [], {
        POST: [ObjectController.create],
      }),
    })
  )
})

avaTest('Creates resource with options.except', test => {
  test.deepEqual(
    createRest(root => {
      root.resource('unicorn', ObjectController, { except: ['create'] })
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

avaTest('Creates resource with options.methodNames', test => {
  const RenamedController = {
    first() {},
    second() {},
    third() {},
    fourth() {},
  }
  test.deepEqual(
    createRest(root => {
      root.resource('unicorn', RenamedController, {
        methodNames: { read: 'first', create: 'second', update: 'third', destroy: 'fourth' }
      })
    }),
    make([], [], {}, {
      unicorn: make([], [], {
        GET: [RenamedController.first],
        POST: [RenamedController.second],
        PUT: [RenamedController.third],
        DELETE: [RenamedController.fourth],
      }),
    })
  )
})

avaTest('Creates resource in scope', test => {
  test.deepEqual(
    createRest(root => {
      root.scope('rainbow', rainbow => {
        rainbow.resource('unicorn', ObjectController, { except: ['create'] })
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

avaTest('Overrides scopes with the same name', test => {
  test.deepEqual(
    createRest(root => {
      root.scope('foo', foo => {
        foo.get('bar', get)
      })
      root.scope('foo', foo => {
        foo.post('baz', post)
      })
    }),
    make([], [], {}, {
      foo: make([], [], {}, {
        baz: make([], [], { POST: [post] })
      })
    })
  )
})
