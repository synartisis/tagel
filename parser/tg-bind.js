import * as parse5 from '../parse5.js'
import { evaluate, getContext } from '../utils.js'

const BIND_ATTRIBUTE_PREFIX = 'tg:'

/**
 * binds element content and attributes
 * @param {tagel.Element} root 
 * 
 */
export async function tgBind(root) {
  if (!root) return 0
  const refs = parse5.qsa(root, el => 
    el?.attribs?.['tg-bind'] || 
    el.attribs && Object.keys(el.attribs).find(k => k.startsWith(BIND_ATTRIBUTE_PREFIX))
  )
  if (!refs.length) return 0

  for (const el of refs) {
    const context = getContext(el)
    // content binding
    const expression = el.attribs?.['tg-bind']
    if (expression) {
      const value = evaluate(expression, context)
      if (value != null) {
        delete el.attribs['tg-bind']
        const fragment = parse5.parseFragment(String(value))
        while (el.children.length > 0) {
          parse5.remove(el.children[0])
        } 
        for (const child of fragment.children) {
          parse5.append(el, child)
        }
      }
    }
    // attributes binding
    if (el.attribs) {
      for (const bindAttr of Object.keys(el.attribs).filter(o => o.startsWith(BIND_ATTRIBUTE_PREFIX))) {
        const attr = bindAttr.substring(BIND_ATTRIBUTE_PREFIX.length)
        const attrContent = el.attribs[bindAttr]
        const value = evaluate(attrContent, context)
        delete el.attribs[bindAttr]
        if (value) {
          el.attribs[attr] = value
        }
      }
    }
  }
  return refs.length
}
