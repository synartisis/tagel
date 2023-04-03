import * as html from '@synartisis/htmlparser'


/** @type {(el: html.domhandler.AnyNode, predicate: (node: html.domhandler.Element) => boolean) => html.domhandler.Element | null} */
function findParent(el, predicate) {
  if (el.parent?.type !== 'tag') return null
  if (predicate(el.parent)) return el.parent
  return findParent(el.parent, predicate)
}


/** @param {html.domhandler.AnyNode} el */
export function notTgForDescendant(el) {
  return !findParent(el, par => !!par.attribs['tg-for'])
}


/** @type {(el: html.domhandler.AnyNode) => boolean} el */
export function isInBody(el) {
  if (el.type === 'root') return false
  if (el.type === 'tag' && el.name === 'body') return true
  if (!el.parent) return false
  return isInBody(el.parent)
}
