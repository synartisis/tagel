import * as parse5 from '../parse5.js'
import { evaluate, getContext, findParent } from '../utils.js'

const BINDING_ATTRS = ['tg-bind', 'tg-text', 'tg-html']
const BIND_ATTRIBUTE_PREFIX = 'tg:'

/**
 * binds element content and attributes
 * @param {tagel.Node} root 
 * 
 */
export async function tgBind(root) {
  if (!root) return 0
  const refs = parse5.qsa(root, el => 
    !!el.attribs?.['tg-bind'] || !!el.attribs?.['tg-text'] || !!el.attribs?.['tg-html'] ||
    !!(el.attribs && Object.keys(el.attribs).find(k => k.startsWith(BIND_ATTRIBUTE_PREFIX)))
  ).filter(el => !findParent(el, par => !!par?.attribs?.['tg-for']))
  // skip nested tg-for elements to avoid missing context
  if (!refs.length) return 0

  for (const el of refs) {
    const context = getContext(el)
    // content binding
    if (!el.attribs) return
    const attrs = Object.keys(el.attribs)
    const bingindAttr = BINDING_ATTRS.find(bAttr => attrs.includes(bAttr))
    if (bingindAttr) {
      const expression = el.attribs[bingindAttr]
      if (expression) {
        const value = evaluate(expression, context)
        if (value != null) {
          const sValue = String(value)
          if (bingindAttr === 'tg-text') parse5.textContent(el, sValue)
          if (bingindAttr === 'tg-html') parse5.innerHTML(el, sValue)
          if (bingindAttr === 'tg-bind') {
            const newEl = parse5.parseFragment(sValue)
            newEl.children.forEach(child => parse5.insertBefore(child, el))
            parse5.remove(el)
          }
        }
      }
      delete el.attribs[bingindAttr]
    }
    // attributes binding
    if (el.attribs) {
      for (const bindAttr of Object.keys(el.attribs).filter(o => o.startsWith(BIND_ATTRIBUTE_PREFIX))) {
        const attr = bindAttr.substring(BIND_ATTRIBUTE_PREFIX.length)
        const attrContent = el.attribs[bindAttr]
        delete el.attribs[bindAttr]
        const value = evaluate(attrContent, context)
        if (value) {
          el.attribs[attr] = value
        }
      }
    }
  }
  return refs.length
}
