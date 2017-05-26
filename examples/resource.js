const stringify = require('stringify-object')
const chalk = require('chalk')

const { createRest, flattenRoutes, printRoutes } = require('../dist')

const ObjectController = {
  read() {},
  create() {},
  update() {},
  destroy() {},

  beforeEach() {},
  afterEach() {},
}

const routes = createRest(r => {
  r.resource('demo', ObjectController)
})

printRoutes(routes, true)
