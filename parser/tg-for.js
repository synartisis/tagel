import * as parse5 from '../parse5.js'
import { evaluate, getContext, findParent } from '../utils.js'


/**
 * repeats a template, once for each item oa an array
 * @param {tagel.Node} root 
 * @returns {Promise<number>}
 */
export async function tgFor(root) {
  if (!root) return 0
  const refs = parse5.qsa(root, el => !!el?.attribs?.['tg-for'])
    .filter(el => !findParent(el, par => !!par?.attribs?.['tg-for']))
    // skip nested tg-for elements to avoid missing context
  if (!refs.length) return 0
  
  for (const el of refs) {
    const context = getContext(el)
    const expression = el.attribs?.['tg-for']
    const limit = Number.isInteger(el.attribs?.['tg-for-limit']) ? Number(el.attribs?.['tg-for-limit']) : -1
    delete el.attribs?.['tg-for']
    delete el.attribs?.['tg-for-limit']
    if (!expression) continue
    let value
    try {
      value = evaluate(expression, context)
    } catch (error) {
      // @ts-ignore
      el.$tagelError = `[tg-for: ${expression}] ${error.message}`
    }
    if (value == null || !Array.isArray(value)) {
      el.$tagelError = `[tg-for] expression "${expression}" does not evaluate to array`
      continue
    }
    if (limit !== -1) value = value.slice(0, limit)
    let lastEl = el
    for (const [$index, $item] of value.entries()) {
      const itemTemplate = parse5.clone(el)
      itemTemplate.$context = $item
      parse5.insertAfter(itemTemplate, lastEl)
      lastEl = itemTemplate
    }
    parse5.remove(el)
  }
  return refs.length
}
