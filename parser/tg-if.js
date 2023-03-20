import * as htmlParser from '../html-parser.js'
import { evaluate, getContext, findParent } from '../utils.js'



/**
 * removes elements (with children) when the expression evaluates to false
 * @param {tagel.Node} root
 * @returns {Promise<number>}
 */
export async function tgIf(root) {
  if (!root) return 0
  const refs = htmlParser.qsa(root, el => !!el?.attribs?.['tg-if'])
    .filter(el => !findParent(el, par => !!par?.attribs?.['tg-for']))
    // skip nested tg-for elements to avoid missing context
  if (!refs.length) return 0

  for (const el of refs) {
    const context = getContext(el)
    const expression = el.attribs?.['tg-if']
    if (!expression) continue
    try {
      const value = evaluate(expression, context)
      if (!value) {
        htmlParser.remove(el)
      } else {
        delete el.attribs?.['tg-if']
      }
    } catch (error) {
      // @ts-ignore
      el.$tagelError = `[tg-if: ${expression}] ${error.message}`
    }
  }
  return refs.length
}
