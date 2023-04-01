import * as html from '@synartisis/htmlparser'
import { findMatchingParent } from '../utils.js'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'


/** @type {(root: html.domhandler.Document | html.domhandler.Element) => Promise<number>} */
export async function tgIf(root) {
  if (!root) return 0
  const refs = html.qsa(root, el => !!el.attribs['tg-if'])
    .filter(el => !findMatchingParent(el, par => !!par.attribs['tg-for']))
    // skip nested tg-for elements to avoid missing context

  for (const el of refs) {
    const expression = el.attribs['tg-if']
    const context = getContext(el)
    let value = false
    try {
      value = evaluate(expression, context)
    } catch (error) {
      addError(el, expression, error)
    }
    if (!value) {
      html.detachNode(el)
    } else {
      delete el.attribs['tg-if']
    }
  }
  return refs.length
}
