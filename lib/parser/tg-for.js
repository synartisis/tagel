import * as html from '@synartisis/htmlparser'
import { notTgForDescendant } from '../utils.js'
import { evaluate, getContext, setContext } from '../context.js'
import { addError } from '../errors.js'


/**
 * repeats a template, once for each item on an array
 * @type {(root: html.domhandler.Document | html.domhandler.Element) => Promise<number>}
 */
export async function tgFor(root) {
  const refs = html.qsa(root, el => !!el.attribs['tg-for']).filter(notTgForDescendant)
  
  for (const el of refs) {
    const context = getContext(el)
    const expression = el.attribs['tg-for']
    const limit = Number.isInteger(el.attribs['tg-for-limit']) ? Number(el.attribs['tg-for-limit']) : -1
    delete el.attribs['tg-for']
    delete el.attribs['tg-for-limit']
    let value
    try {
      value = evaluate(expression, context)
    } catch (error) {
      addError(el, expression, error)
    }
    if (!Array.isArray(value)) {
      addError(el, expression, null, `[tg-for] expression "${expression}" does not evaluate to array`)
    }
    if (limit !== -1) value = value.slice(0, limit)
    const itemTemplate = html.cloneElement(el)
    for (const itemContext of value.values()) {
      const newItem = html.cloneElement(itemTemplate)
      setContext(newItem, itemContext)
      html.insertBefore(newItem, el)
    }
    html.detachNode(el)
  }
  return refs.length
}
