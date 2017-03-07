const {
  createRest,
  printRoutes,
  flattenRoutes,
  get,
  post,
  put,
  patch,
  destroy,
  scope,
  childs,
  resources,
  resource,
  member,
} = require('../dist/index')

const noop = () => {}
const totalBefore = () => {}
const Demo = { load() {} }
const authByToken = () => {}
const Foo = { index() {}, create() {}, read() {}, update() {}, patch() {}, destroy() {} }

const router = createRest({ before: [totalBefore] }, childs(
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
      post('baz', [authByToken, noop]),
      resource('like', { before: [authByToken], after: [noop] }, Foo)
    )
  ))
))

console.log(JSON.stringify(router, 2, 2))

// console.log('\n\n', router.childs[0], '\n\n')
// printRoutes(router)
// console.log('\n\n', flattenRoutes(router))
