import * as htmlParser from '../html-parser.js'
import { evaluate, getContext, findParent } from '../utils.js'


/**
 * repeats a template, once for each item oa an array
 * @type {(root: tagel.Node, errors: string[]) => Promise<number>}
 */
export async function tgFor(root, errors) {
  if (!root) return 0
  const refs = htmlParser.qsa(root, el => !!el?.attribs?.['tg-for'])
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
      errors.push(`[tg-for: ${expression}] ${error.message}`)
    }
    if (value === undefined || !Array.isArray(value)) {
      errors.push(`[tg-for] expression "${expression}" does not evaluate to array`)
      continue
    }
    if (limit !== -1) value = value.slice(0, limit)
    let lastEl = el
    for (const [$index, $item] of value.entries()) {
      const itemTemplate = htmlParser.clone(el)
      itemTemplate.$context = $item
      htmlParser.insertAfter(itemTemplate, lastEl)
      lastEl = itemTemplate
    }
    htmlParser.remove(el)
  }
  return refs.length
}
