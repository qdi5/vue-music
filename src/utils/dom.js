// 获取离当前el元素最近的父元素selector
export function closest (el, selector) {
  const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector
  while (el) {
    if (matchesSelector.call(el, selector)) {
      return el
    } else {
      el = el.parentElement
    }
  }
  return null
}

// 获取兄弟元素集合(数组)
export function siblings (el) {
  return [...el.parentNode.children].filter(child => child !== el)
}

// addClass
export function addClass (el, className) {
  if (hasClass(el, className)) {
    return
  }
  el.classList.add(className)
}

// removeClass
export function removeClass (el, className) {
  el.classList.remove(className)
}

// hasClass
export function hasClass (el, className) {
  return el.classList.contains(className)
}

// toggleClass
export function toggleClass (el, className) {
  el.classList.toggleClass(className)
}
