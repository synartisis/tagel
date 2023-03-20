import * as htmlparser2 from 'htmlparser2'
import serializer from 'dom-serializer'


/** 
 * @param {string} html 
 * @returns {tagel.Node}
*/
export function parseHtml(html) {
  const doc = htmlparser2.parseDocument(html)
  // @ts-ignore
  patchTitleTag(doc)
  // @ts-ignore
  return doc
}


/** 
 * @param {string} html 
 * @returns {tagel.Node}
*/
export function parseFragment(html) {
  // @ts-ignore
  return htmlparser2.parseDocument(html)
}


/** @param {tagel.Node} document */
export function serialize(document) {
  // @ts-ignore
  return serializer(document)
}



/**
 * returns the first Element matching the predicate
 * @param {tagel.Node} root 
 * @param {tagel.Predicate} predicate 
 * @returns {tagel.Node | undefined}
 */
 export function qs(root, predicate) {
  let result
  if (predicate(root)) {
    result = root
  } else {
    if (root.children) {
      for (let child of root.children) {
        result = qs(child, predicate)
        if (result) break
      }
    }
  }
  return result
}


/**
 * returns an array of Elements that matching the predicate
 * @param {tagel.Node} root 
 * @param {tagel.Predicate} predicate 
 * @param {tagel.Node[]} res 
 * @returns {tagel.Node[]}
 */
export function qsa(root, predicate, res = []) {
  if (predicate(root)) res.push(root)
  if (root.children) root.children.forEach(child => {
    qsa(child, predicate, res)
  })
  return res
}


/**
 * walks throught the dom and applies fn
 * @param {tagel.Node} root 
 * @param {(el: tagel.Node) => void} fn 
 */
export async function walk(root, fn) {
  await fn(root)
  if (root.children) {
    for await (const child of root.children) {
      await walk(child, fn)
    }
  }
}


/** @type {(type: string, attributes?: tagel.Attribs) => tagel.Node} */
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
    next: null,
  }
}


/** @type {(content: string) => tagel.Node} */
export function createTextNode(content) {
  return {
    type: 'text',
    name: 'text',
    data: String(content),
    parent: null,
    prev: null,
    next: null,
  }
}


/** @type {(newChild: tagel.Node, refChild: tagel.Node) => void} */
export function insertBefore(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  newChild.parent = refChild.parent
  refChild.parent?.children?.splice(refChild.parent.children.indexOf(refChild), 0, newChild)
  const oldSibbling = refChild.prev
  refChild.prev = newChild
  newChild.next = refChild
  newChild.prev = oldSibbling
}


/** @type {(newChild: tagel.Node, refChild: tagel.Node) => void} */
export function insertAfter(newChild, refChild) {
  if (!newChild || !refChild) throw new Error('missing parameter')
  newChild.parent = refChild.parent
  refChild.parent?.children?.splice(refChild.parent.children.indexOf(refChild) + 1, 0, newChild)
  const oldSibbling = refChild.next
  refChild.next = newChild
  newChild.prev = refChild
  newChild.next = oldSibbling 
}


/** @type {(el: tagel.Node) => void} */
export function remove(el) {
  if (!el) throw new Error('missing parameter')
  el.parent?.children?.splice(el.parent.children.indexOf(el), 1)
  el.children = []
  if (el.prev) el.prev.next = el.next
  if (el.next) el.next.prev = el.prev
}


/** @type {(parent: tagel.Node, el: tagel.Node) => void} */
export function append(parent, el) {
  if (!parent || !el) throw new Error('missing parameter')
  el.parent = parent
  parent.children?.push(el)
  if (parent.children && parent.children.length > 1) {
    el.prev = parent.children[0]
  }
  el.next = null
}


/** @type {(el: tagel.Node) => tagel.Node} */
export function clone(el) {
  const newEl = { ...el, attribs: el.attribs ? { ...el.attribs } : undefined, children: [], parent: null, prev: null, next: null }
  if (el.children) {
    el.children.forEach(child => {
      const newChild = clone(child)
      append(newEl, newChild)
    })
  }
  return newEl
}


/** @param {tagel.Node} document */
export function documentBody(document) {
  return qs(document, el => el.name === 'body')
}


/** @type {(content: string) => tagel.Node} */
export function createScriptElement(content) {
  const scriptEl = createElement('script')
  const scriptContent = createTextNode(content)
  append(scriptEl, scriptContent)
  return scriptEl
}


/** @type {(el: tagel.Node, contect: string) => void} */
export function textContent(el, content) {
  if (!el || content == null) throw new Error('missing parameter')
  el.children = []
  const textNode = createTextNode(content)
  el.children.push(textNode)
}


/** @type {(el: tagel.Node, html: string) => void} */
export function innerHTML(el, html) {
  if (!el || html == null) throw new Error('missing parameter')
  if (!(typeof html === 'string')) throw new TypeError('parse5.innerHTML: html param must be a string')
  el.children = []
  const fragment = parseFragment(html)
  if (fragment.children) {
    for (const child of fragment.children) {
      append(el, child)
    }
  }
}



/**
 * patches doc's <title> tag to accept html
 * @param {tagel.Node} doc 
 */
function patchTitleTag(doc) {
  const titleTag = qs(doc, el => el.name === 'title')
  if (titleTag) {
    const titleTagChild = titleTag?.children?.[0]
    if (titleTagChild?.data) {
      for (const child of parseFragment(titleTagChild.data)?.children ?? []) {
        append(titleTag, child)
      }
      remove(titleTagChild)
    }
  }
}