import * as htmlParser from '../html-parser.js'
import { evaluate, getContext, findParent } from '../utils.js'



/** @type {(root: tagel.Node, errors: string[]) => Promise<number>} */
export async function tgIf(root, errors) {
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
      errors.push(`[tg-if: ${expression}] ${error.message}`)
    }
  }
  return refs.length
}
