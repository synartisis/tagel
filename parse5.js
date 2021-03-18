import parse5 from 'parse5'
import htmlparser2Adapter from 'parse5-htmlparser2-tree-adapter'


export function parseHtml(html) {
  return parse5.parse(html, { treeAdapter: htmlparser2Adapter })
}


export function parseFragment(html) {
  return parse5.parseFragment(html, { treeAdapter: htmlparser2Adapter })
}


export function serialize(document) {
  return parse5.serialize(document, { treeAdapter: htmlparser2Adapter })
}

export function qs(node, predicate) {
  let result
  if (predicate(node)) {
    result = node
  } else {
    if (node.children) {
      for (let child of node.children) {
        result = qs(child, predicate)
        if (result) break
      }
    }
  }
  return result
}


export function qsa(node, predicate, res = []) {
  if (predicate(node)) res.push(node)
  if (node.children) node.children.forEach(child => qsa(child, predicate, res))
  return res
}


export async function walk(node, fn) {
  await fn(node)
  if (node.children) await Promise.all(node.children.map(child => walk(child, fn)))
}


export function createElement(type, attributes = {}) {
  return {
    type: 'tag',
    name: type,
    namespace: 'http://www.w3.org/1999/xhtml',
    attribs: Object.create(null, Object.getOwnPropertyDescriptors(attributes)),
    ['x-attribsNamespace']: Object.create(null, { src: {}, type: {} }),
    ['x-attribsPrefix']: Object.create(null, { src: {}, type: {} }),
    children: [],
    parent: null,
    prev: null,
    next: null
  }
}

export function createTextNode(content) {
  return {
    type: 'text',
    data: String(content),
  }
}


export function insertBefore(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  newChild.parent = refChild.parent
  refChild.parent.children.splice(refChild.parent.children.indexOf(refChild), 0, newChild)
  const oldSibbling = refChild.prev
  refChild.prev = newChild
  newChild.next = refChild
  newChild.prev = oldSibbling
}


export function insertAfter(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  newChild.parent = refChild.parent
  refChild.parent.children.splice(refChild.parent.children.indexOf(refChild) + 1, 0, newChild)
  const oldSibbling = refChild.next
  refChild.next = newChild
  newChild.prev = refChild
  newChild.next = oldSibbling 
}


export function remove(el) {
  if (!el) throw new Error('missing parameter')
  el.parent.children.splice(el.parent.children.indexOf(el), 1)
  if (el.prev) el.prev.next = el.next
  if (el.next) el.next.prev = el.prev
}


export function append(parent, el) {
  if (!parent || !el) throw new Error('missing parameter')
  el.parent = parent
  parent.children.push(el)
  if (parent.children.length > 1) {
    el.prev = parent.children[0]
  }
  el.next = null
}


export function clone(el) {
  const newEl = { ...el, attribs: el.attribs ? { ...el.attribs } : null, children: [], parent: null, prev: null, next: null }
  if (el.children) {
    el.children.forEach(child => {
      const newChild = clone(child)
      append(newEl, newChild)
    })
  }
  return newEl
}

export function documentBody(document) {
  return qs(document, el => el.name === 'body')
}

export function createScriptElement(content) {
  const scriptEl = createElement('script')
  const scriptContent = createTextNode(content)
  append(scriptEl, scriptContent)
  return scriptEl
}
