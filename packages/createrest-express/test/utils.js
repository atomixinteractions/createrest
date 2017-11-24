import express from 'express'
import { createRest } from 'createrest'
import { createExpressMiddleware } from '../lib'


let port = 6000 + Math.floor(Math.random() * 1000)

export function createRawServer(routesFn) {
  const app = express()
  app.use(createExpressMiddleware(createRest(routesFn)))
  return app.listen(port++)
}
