import * as parse5 from '../parse5.js'
import { evaluate, getContext } from '../utils.js'



/**
 * removes elements (with children) when the expression evaluates to false
 * @param {tagel.Element} root
 * @returns {Promise<number>}
 */
export async function tgIf(root) {
  if (!root) return 0
  const refs = parse5.qsa(root, el => el?.attribs?.['tg-if'])
  if (!refs.length) return 0

  for (const el of refs) {
    const context = getContext(el)
    const expression = el.attribs['tg-if']
    if (!expression) continue
    const value = evaluate(expression, context)
    if (!value) {
      parse5.remove(el)
    } else {
      delete el.attribs['tg-if']
    }
  }
  return refs.length
}
