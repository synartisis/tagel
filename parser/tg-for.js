import * as html from '@synartisis/htmlparser'
import { evaluate, getContext, setContext, findMatchingParent } from '../utils.js'


/**
 * repeats a template, once for each item oa an array
 * @type {(root: html.domhandler.Document | html.domhandler.Element, errors: string[]) => Promise<number>}
 */
export async function tgFor(root, errors) {
  let changes = 0
  if (!root) return changes
  const refs = html.qsa(root, el => el.type === 'tag' && !!el.attribs['tg-for'])
    .filter(el => el.type === 'tag' && !findMatchingParent(el, par => par.type === 'tag' && !!par.attribs['tg-for']))
    // skip nested tg-for elements to avoid missing context
  if (refs.length === 0) return changes
  
  for (const el of refs) {
    if (el.type !== 'tag') continue
    const context = getContext(el)
    const expression = el.attribs['tg-for']
    const limit = Number.isInteger(el.attribs['tg-for-limit']) ? Number(el.attribs['tg-for-limit']) : -1
    delete el.attribs['tg-for']
    delete el.attribs['tg-for-limit']
    let value
    try {
      value = evaluate(expression, context)
    } catch (error) {
      // @ts-ignore
      errors.push(`[tg-for: ${expression}] ${error.message}`)
      continue
    }
    if (!Array.isArray(value)) {
      errors.push(`[tg-for] expression "${expression}" does not evaluate to array`)
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
    changes++
  }
  return changes
}
