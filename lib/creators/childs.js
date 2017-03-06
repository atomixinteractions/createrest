
export default function childs(...funcs) {
  return context => {
    funcs.forEach(func => func(context))
  }
}