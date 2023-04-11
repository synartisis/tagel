import * as html from 'syn-html-parser'
import { notTgForDescendant } from '../utils.js'
import { evaluate, getContext, setContext } from '../context.js'
import { addError } from '../errors.js'


/**
 * repeats a template, once for each item on an array
 * @type {(root: html.Document | html.Element) => Promise<number>}
 */
export async function tgFor(root) {
  const refs = html.qsa(root, el => !!el.attrs.find(o => o.name === 'tg-for') && notTgForDescendant(el))
  
  for (const el of refs) {
    const attr = el.attrs.find(o => o.name === 'tg-for')
    const attrLimit = el.attrs.find(o => o.name === 'tg-for-limit')
    if (!attr) continue
    const context = getContext(el)
    const expression = attr.value
    const limit = attrLimit && Number.isInteger(attrLimit.value) ? Number(attrLimit.value) : -1
    el.attrs.splice(el.attrs.indexOf(attr), 1)
    if (attrLimit) el.attrs.splice(el.attrs.indexOf(attrLimit), 1)
    let value
    try {
      value = evaluate(expression, context)
    } catch (error) {
      addError(el, expression, error)
      continue
    }
    if (!Array.isArray(value)) {
      addError(el, expression, null, `[tg-for] expression "${expression}" does not evaluate to array`)
      continue
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
