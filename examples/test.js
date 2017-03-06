const {
  createRest,
  printRoutes,
  get,
  post,
  put,
  patch,
  destroy,
  scope,
  childs,
  resources,
  member,
} = require('../dist/index')

const noop = () => {}
const Demo = { load() {} }
const authByToken = () => {}
const Foo = { index() {}, create() {}, read() {}, update() {}, patch() {}, destroy() {} }

const router = createRest({}, childs(
  get('example_get', noop),
  post('post_example', [noop, noop]),
  put('update_example', noop),
  patch('patching', [noop, noop, noop]),
  destroy('drop', noop),
  scope('first', childs(
    get('getter', noop),
    scope('another', childs(
      get('read', noop),
      post('create', noop),
      put('update', noop),
      patch('patch', [authByToken, Demo.load]),
      destroy('remove', [noop, noop])
    ))
  )),
  resources('resource', {}, Foo, childs(
    get('foo'),
    member(
      get('bar', noop),
      post('baz', [authByToken, noop])
    )
  ))
))

console.log('\n\n', router, '\n\n')
printRoutes(router)
