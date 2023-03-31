import * as html from '@synartisis/htmlparser'
import { evaluate, getContext, findMatchingParent } from '../utils.js'


/** @type {(root: html.domhandler.Document | html.domhandler.Element, errors: string[]) => Promise<number>} */
export async function tgIf(root, errors) {
  let changes = 0
  if (!root) return changes
  const refs = html.qsa(root, el => el.type === 'tag' && !!el.attribs['tg-if'])
    .filter(el => el.type === 'tag' && !findMatchingParent(el, par => par.type === 'tag' && !!par.attribs['tg-for']))
    // skip nested tg-for elements to avoid missing context
  if (refs.length === 0) return changes

  for (const el of refs) {
    if (el.type !== 'tag') continue
    const context = getContext(el)
    const expression = el.attribs['tg-if']
    try {
      const value = evaluate(expression, context)
      if (!value) {
        html.detachNode(el)
      } else {
        delete el.attribs['tg-if']
      }
      changes++
    } catch (error) {
      // @ts-ignore
      errors.push(`[tg-if: ${expression}] ${error.message}`)
    }
  }
  return changes
}
