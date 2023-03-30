import * as htmlParser from '../html-parser.js'
import { evaluate, getContext, findParent } from '../utils.js'

const BINDING_ATTRS = ['tg-bind', 'tg-text', 'tg-html']
const BIND_ATTRIBUTE_PREFIX = 'tg:'

/**
 * binds element content and attributes
 * @param {tagel.Node} root 
 * @param {string[]} errors 
 * 
 */
export async function tgBind(root, errors) {
  if (!root) return 0
  const refs = htmlParser.qsa(root, el => 
    !!el.attribs?.['tg-bind'] || !!el.attribs?.['tg-text'] || !!el.attribs?.['tg-html'] ||
    !!(el.attribs && Object.keys(el.attribs).find(k => k.startsWith(BIND_ATTRIBUTE_PREFIX)))
  ).filter(el => !findParent(el, par => !!par?.attribs?.['tg-for']))
  // skip nested tg-for elements to avoid missing context
  if (!refs.length) return 0

  for (const el of refs) {
    const context = getContext(el)
    // content binding
    if (!el.attribs) return 0
    const attrs = Object.keys(el.attribs)
    const bindindAttr = BINDING_ATTRS.find(bAttr => attrs.includes(bAttr))
    if (bindindAttr) {
      const expression = el.attribs[bindindAttr]
      if (expression) {
        let result
        try {
          const value = evaluate(expression, context)
          if (value !== undefined) result = String(value)
        } catch (error) {
          // @ts-ignore
          errors.push(`[${bindindAttr}: ${expression}] ${error.message}`)
        }
        if (result) {
          if (bindindAttr === 'tg-text') htmlParser.textContent(el, result)
          if (bindindAttr === 'tg-html') htmlParser.innerHTML(el, result)
          if (bindindAttr === 'tg-bind') {
            const newEl = htmlParser.parseFragment(result)
            newEl.children?.forEach(child => htmlParser.insertBefore(child, el))
          }
        }
      }
      if (bindindAttr === 'tg-bind') htmlParser.remove(el)
      delete el.attribs[bindindAttr]
    }
    // attributes binding
    if (el.attribs) {
      for (const bindAttr of Object.keys(el.attribs).filter(o => o.startsWith(BIND_ATTRIBUTE_PREFIX))) {
        const attr = bindAttr.substring(BIND_ATTRIBUTE_PREFIX.length)
        const attrContent = el.attribs[bindAttr]
        delete el.attribs[bindAttr]
        try {
          const value = evaluate(attrContent, context)
          if (value !== undefined) {
            el.attribs[attr] = String(value)
          }
        } catch (error) {
          // @ts-ignore
          errors.push(`[${attr}: ${attrContent}] ${error.message}`)
        }
      }
    }
  }
  return refs.length
}
