const target = new EventTarget()

export function emit(name, detail) {
  target.dispatchEvent(new CustomEvent(name, { detail }))
}

export function on(name, handler) {
  const fn = (e) => handler(e.detail)
  target.addEventListener(name, fn)
  return () => target.removeEventListener(name, fn)
}
