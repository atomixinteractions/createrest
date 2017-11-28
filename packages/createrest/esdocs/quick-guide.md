# Quick guide

Let's create REST API on createRest and koa2.

### Create app package

```bash
mkdir restapi
cd restapi
npm init --force
```

### Install koa2, createrest and createrest-koa

```bash
npm install --save koa@2 createrest createrest-koa
```

### Create common files

```bash
mkdir src

touch src/app.js
touch src/routes.js
```

Open `app.js` and `routes.js` in IDE/editor.

#### `src/routes.js`

```js
// Import createRest function
const { createRest } = require('createrest')
// Here you can import all of your route handlers

// Let's create index and ping-pong handlers
const ping = (ctx) => {
  ctx.body = 'pong'
}

const index = (ctx) => {
  ctx.body = 'Hello world'
}

// Now create routes for your handlers with createRest function
const routes = createRest((root) => {
  // root is a instance of Maker class
  // with root you can define your routes, scopes, hooks

  // Let's create hanler for `GET /` http request
  root.get('/', index) // Complete! .get creates handler

  // Now create handler for `GET /ping`
  root.get('/ping', ping)
})

// Okay, export routes to use in app.js
module.exports = routes
```


#### `src/app.js`

```js
// Import only most necessary dependencies
const Koa = require('koa')
const { createRest, printRoutes } = require('createrest')
const { createKoaRouter } = require('createrest-koa')

// Import our routes
const routes = require('./routes')


// Create simple Koa2 application instance
const app = new Koa()

// Now create router special for koa2
const router = createKoaRouter(routes)

// Here just pass routes to application instance
app.use(router.routes())

// You can change port to listen
app.listen(3000, () => {
  // after app created print available routes to console
  printRoutes(routes)
  console.log('Listening port 3000...')
})
```

### Run your application

```bash
node ./src/app.js
```

> You can add npm-script `start` with `node src/app` or use [nodemon](https://npmjs.com/nodemon) in `dev` task.

You should see in your console:

```text
GET / -> index()
GET /ping/ -> ping()
Listening port 3000...
```

And if you open [http://localhost:3000/](http://localhost:3000/) and [http://localhost:3000/ping](http://localhost:3000/ping), you see answers from your `index` and `ping` handlers.

