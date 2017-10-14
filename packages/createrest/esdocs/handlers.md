# Handlers

## [get](/class/lib/index.js~Maker.html#instance-method-get)

Add handler for GET route.

```js
createRest(root => {
  root.get('/', () => console.log('Handle GET /'))

  root.scope('demo', demo => {
    demo.get('/', () => console.log('Handle GET /demo'))
  })
})
```
