const { createRest, flattenRoutes, printRoutes } = require('../dist')

const before1 = () => { console.log('before1()') }
const before2 = () => { console.log('before2()') }
const before3 = () => { console.log('before3()') }
const after1 = () => { console.log('after1()') }
const after2 = () => { console.log('after2()') }
const after3 = () => { console.log('after3()') }
const post1 = () => { console.log('post1()') }
const get1 = () => { console.log('get1()') }
const get2 = () => { console.log('get2()') }
const put3 = () => { console.log('put3()') }

const ExampleController = {
  beforeEach() { console.log('Call before each handler') },
  afterEach() {},
  read() {},
  create() {},
  update() {},
  destroy () {},
}

const BooksController = {
  beforeEach() { console.log('Call before each handler') },
  afterEach() {},
  index() {},
  create() {},
  read() {},
  update() {},
  patch() {},
  destroy () {},
}

const routes = createRest(root => {
  root.beforeEach(before1)
  root.afterEach(after1)

  root.post('/', post1)

  root.scope('demo', demoRoute => {
    demoRoute.beforeEach(before2)
    demoRoute.afterEach(after2)

    demoRoute.get('/', get1)
    demoRoute.get('/foo', get2)

    demoRoute.scope('bar', barRoute => {
      barRoute.beforeEach(before3)
      barRoute.afterEach(after3)

      barRoute.put('/', put3)

      barRoute.crud('example', ExampleController)
    })
  })

  root.resources('books', BooksController)
})

printRoutes(routes)
