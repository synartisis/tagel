import * as html from '@synartisis/htmlparser'
import { evaluate, getContext, findMatchingParent } from '../utils.js'

const BINDING_ATTRS = ['tg-bind', 'tg-text', 'tg-html']
const BIND_ATTRIBUTE_PREFIX = 'tg:'

/**
 * binds element content and attributes
 * @param {html.domhandler.Document | html.domhandler.Element} root 
 * @param {string[]} errors 
 * 
 */
export async function tgBind(root, errors) {
  let changes = 0
  if (!root) return changes
  const refs = html.qsa(root, el => 
    !!el.attribs['tg-bind'] || !!el.attribs['tg-text'] || !!el.attribs['tg-html'] ||
    !!(Object.keys(el.attribs).find(k => k.startsWith(BIND_ATTRIBUTE_PREFIX)))
  ).filter(el => !findMatchingParent(el, par => !!par.attribs['tg-for']))
  // skip nested tg-for elements to avoid missing context
  if (refs.length === 0) return changes

  for (const el of refs) {
    const context = getContext(el)
    // content binding
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
          continue
        }
        if (result !== undefined) {
          if (bindindAttr === 'tg-text') html.insertText(el, result)
          if (bindindAttr === 'tg-html') html.innerHTML(el, result)
          if (bindindAttr === 'tg-bind') {
            const newEl = html.parseFragment(result)
            newEl.children.forEach(child => { if (child.type === 'tag' || child.type === 'text') html.insertBefore(child, el) })
          }
        }
      }
      if (bindindAttr === 'tg-bind') html.detachNode(el)
      delete el.attribs[bindindAttr]
    }
    // attributes binding
    if (el.attribs) {
      for (const bindAttr of Object.keys(el.attribs).filter(o => o.startsWith(BIND_ATTRIBUTE_PREFIX))) {
        const attr = bindAttr.substring(BIND_ATTRIBUTE_PREFIX.length)
        const attrContent = el.attribs[bindAttr]
        // console.log({bindAttr, attr, attrContent})
        delete el.attribs[bindAttr]
        try {
          const value = evaluate(attrContent, context)
          if (value !== undefined) {
            el.attribs[attr] = String(value)
            // console.log(el.attribs)
          }
        } catch (error) {
          // @ts-ignore
          errors.push(`[${attr}: ${attrContent}] ${error.message}`)
        }
      }
    }
    changes++
  }
  return changes
}
