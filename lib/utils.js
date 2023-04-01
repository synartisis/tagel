import * as html from '@synartisis/htmlparser'


/** @type {(el: html.domhandler.Element, predicate: (node: html.domhandler.Element) => boolean) => html.domhandler.Element | null} */
export function findMatchingParent(el, predicate) {
  if (el.parent?.type !== 'tag') return null
  if (predicate(el.parent)) return el.parent
  return findMatchingParent(el.parent, predicate)
}
