import * as html from 'syn-html-parser'


/** @type {(el: html.ChildNode, predicate: (node: html.ParentNode) => boolean) => html.Element | null} */
function findAncestor(el, predicate) {
  if (!el.parentNode || !html.adapter.isElementNode(el.parentNode)) return null
  if (predicate(el.parentNode)) return el.parentNode
  return findAncestor(el.parentNode, predicate)
}


/** @param {html.ChildNode} el */
export function notTgForDescendant(el) {
  if (el.parentNode) return true
  return !findAncestor(el, par => !!html.getAttributes(par)['tg-for'])
}


/** @type {(el: html.ChildNode) => boolean} el */
export function isInBody(el) {
  if (html.adapter.isElementNode(el) && el.tagName === 'body') return true
  if (!el.parentNode || !html.adapter.isElementNode(el.parentNode)) return false
  return isInBody(el.parentNode)
}
