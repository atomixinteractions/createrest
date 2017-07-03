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
      root.beforeEach(before)
    }),
    make([before])
  )
})

avaTest('Creates after', test => {
  test.deepEqual(
    createRest(root => {
      root.afterEach(after)
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
      root.beforeEach(before)
      root.afterEach(after)
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

avaTest('Creates simple crud with default options', test => {
  test.deepEqual(
    createRest(root => {
      root.crud('unicorn', ObjectController)
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

avaTest('Creates crud with partial controller and before/after', test => {
  const Controller = Object.assign({}, ObjectController, {
    beforeEach: before,
    afterEach: after,
    create: undefined,
  })
  test.deepEqual(
    createRest(root => {
      root.crud( 'unicorn', Controller)
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


avaTest('Fails for crud with default options', test => {
  test.deepEqual(
    createRest(root => {
      root.crud('unicorn')
    }),
    make()
  )

  test.throws(() => {
    createRest(root => {
      root.crud()
    })
  })
})

avaTest('Creaets crud with options.only', test => {
  test.deepEqual(
    createRest(root => {
      root.crud('unicorn', ObjectController, { only: ['create'] })
    }),
    make([], [], {}, {
      unicorn: make([], [], {
        POST: [ObjectController.create],
      }),
    })
  )
})

avaTest('Creates crud with options.except', test => {
  test.deepEqual(
    createRest(root => {
      root.crud('unicorn', ObjectController, { except: ['create'] })
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

avaTest('Creates crud with options.methodNames', test => {
  const RenamedController = {
    first() {},
    second() {},
    third() {},
    fourth() {},
  }
  test.deepEqual(
    createRest(root => {
      root.crud('unicorn', RenamedController, {
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

avaTest('Creates crud in scope', test => {
  test.deepEqual(
    createRest(root => {
      root.scope('rainbow', rainbow => {
        rainbow.crud('unicorn', ObjectController, { except: ['create'] })
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

avaTest('Crud with child scope', test => {
  const spy = () => {}
  test.deepEqual(
    createRest(root => {
      root.scope('rainbow', rainbow => {
        rainbow.crud('unicorn', ObjectController, {}, unicorn => {
          unicorn.get('excellent', spy)
        })
      })
    }),
    make([], [], {}, {
      rainbow: make([], [], {}, {
        unicorn: make([], [], {
          POST: [ObjectController.create],
          GET: [ObjectController.read],
          PUT: [ObjectController.update],
          DELETE: [ObjectController.destroy],
        },{
          excellent: make([], [], {
            GET: [spy],
          })
        }),
      })
    })
  )
})

const DefaultController = {
  beforeEach() {},
  afterEach() {},
  index() {},
  create () {},
  read() {},
  update() {},
  patch() {},
  destroy() {},
}

avaTest('Resources with default', test => {
  test.deepEqual(
    createRest(root => {
      root.resources('books', DefaultController)
    }),
    make([], [], {}, {
      books: make(
        [DefaultController.beforeEach],
        [DefaultController.afterEach],
        {
          GET: [DefaultController.index], POST: [DefaultController.create]
        },
        {
          ':bookId': make([], [], {
            GET: [DefaultController.read],
            PUT: [DefaultController.update],
            PATCH: [DefaultController.patch],
            DELETE: [DefaultController.destroy],
          }),
        }
      ),
    })
  )
})

avaTest('Resource with empty controller', test => {
  test.deepEqual(
    createRest(root => {
      root.resources('books', {})
    }),
    make([], [], {}, {
      books: make([], [], {}, {
        ':bookId': make()
      })
    })
  )
})

avaTest('Resources with only', test => {
  test.deepEqual(
    createRest(root => {
      root.resources('books', DefaultController, { only: ['index', 'read'] })
    }),
    make([], [], {}, {
      books: make(
        [DefaultController.beforeEach],
        [DefaultController.afterEach],
        {
          GET: [DefaultController.index],
        },
        {
          ':bookId': make([], [], {
            GET: [DefaultController.read],
          }),
        }
      ),
    })
  )
})

avaTest('Resources with except', test => {
  test.deepEqual(
    createRest(root => {
      root.resources('books', DefaultController, { except: ['index', 'read', 'update'] })
    }),
    make([], [], {}, {
      books: make(
        [DefaultController.beforeEach],
        [DefaultController.afterEach],
        {
          POST: [DefaultController.create]
        },
        {
          ':bookId': make([], [], {
            PATCH: [DefaultController.patch],
            DELETE: [DefaultController.destroy],
          }),
        }
      ),
    })
  )
})

avaTest('Resources with patch/update case', test => {
  test.deepEqual(
    createRest(root => {
      root.resources('books', Object.assign({}, DefaultController, { patch: undefined }))
    }),
    make([], [], {}, {
      books: make(
        [DefaultController.beforeEach],
        [DefaultController.afterEach],
        {
          GET: [DefaultController.index], POST: [DefaultController.create]
        },
        {
          ':bookId': make([], [], {
            GET: [DefaultController.read],
            PUT: [DefaultController.update],
            PATCH: [DefaultController.update],
            DELETE: [DefaultController.destroy],
          }),
        }
      ),
    })
  )
})

avaTest('Resources with patch/update case w/o update()', test => {
  test.deepEqual(
    createRest(root => {
      root.resources('books', Object.assign({}, DefaultController, { patch: undefined, update: undefined }))
    }),
    make([], [], {}, {
      books: make(
        [DefaultController.beforeEach],
        [DefaultController.afterEach],
        {
          GET: [DefaultController.index], POST: [DefaultController.create]
        },
        {
          ':bookId': make([], [], {
            GET: [DefaultController.read],
            DELETE: [DefaultController.destroy],
          }),
        }
      ),
    })
  )
})

avaTest('Resources with memberId option', test => {
  test.deepEqual(
    createRest(root => {
      root.resources('books', DefaultController, { memberId: 'demoId' })
    }),
    make([], [], {}, {
      books: make(
        [DefaultController.beforeEach],
        [DefaultController.afterEach],
        {
          GET: [DefaultController.index], POST: [DefaultController.create]
        },
        {
          ':demoId': make([], [], {
            GET: [DefaultController.read],
            PUT: [DefaultController.update],
            PATCH: [DefaultController.patch],
            DELETE: [DefaultController.destroy],
          }),
        }
      ),
    })
  )
})


avaTest('Resources with patch in only and w/o patch(), update() methods', test => {
  test.deepEqual(
    createRest(root => {
      root.resources(
        'books',
        Object.assign({}, DefaultController, { patch: undefined, update: undefined }),
        { only: ['patch'] }
      )
    }),
    make([], [], {}, {
      books: make(
        [DefaultController.beforeEach],
        [DefaultController.afterEach],
        {
        },
        {
          ':bookId': make([], [], {
          }),
        }
      ),
    })
  )
})

avaTest('Resources should be named', test => {
  test.throws(() => {
    createRest(root => {
      root.resources()
    }, /Resources should be named/, 'unnamed resources not throws')
  })
})

avaTest('Resources controller should be object', test => {
  test.throws(() => {
    createRest(root => {
      root.resources('ex', null)
    })
  }, /Controller should be object/, 'null not throws')
  test.throws(() => {
    createRest(root => {
      root.resources('ex', function(){})
    })
  }, /Controller should be object/, 'function not throws')
  test.throws(() => {
    createRest(root => {
      root.resources('ex', 1)
    })
  }, /Controller should be object/, 'number not throws')
})

avaTest('Resources cannot use only and expect at the same time', test => {
  test.throws(() => {
    createRest(root => {
      root.resources('demo', {}, { only: [], except: [] })
    })
  }, /You can't use/, 'except and only not throws')
})
