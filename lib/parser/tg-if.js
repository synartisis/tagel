import * as html from '@synartisis/htmlparser'
import { notTgForDescendant } from '../utils.js'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'


/** @type {(root: html.domhandler.Document | html.domhandler.Element) => Promise<number>} */
export async function tgIf(root) {
  if (!root) return 0
  const refs = html.qsa(root, el => !!el.attribs['tg-if']).filter(notTgForDescendant)

  for (const el of refs) {
    await tgIfElement(el)
  }
  return refs.length
}


/** @type {(el: html.domhandler.Element) => Promise<void>} */
export async function tgIfElement(el) {
  if (!el.attribs['tg-if']) return
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