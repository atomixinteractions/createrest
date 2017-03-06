
export default function root(...funcs) {
  return context => {
    funcs.forEach(func => func(context))
  }
}
