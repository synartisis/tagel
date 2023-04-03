import * as html from '@synartisis/htmlparser'
import { notTgForDescendant } from '../utils.js'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'

const BIND_CONTENT_ATTRS = ['tg-bind', 'tg-text', 'tg-html']
const BIND_ATTRIBUTE_PREFIX = 'tg:'

/**
 * binds element content and attributes
 * @param {html.domhandler.Document | html.domhandler.Element} root 
 */
export async function tgBind(root) {
  const refs = html.qsa(root, el => 
    !!el.attribs['tg-bind'] || !!el.attribs['tg-text'] || !!el.attribs['tg-html'] ||
    !!(Object.keys(el.attribs).find(k => k.startsWith(BIND_ATTRIBUTE_PREFIX)))
  ).filter(notTgForDescendant)

  for (const el of refs) {
    const context = getContext(el)
    contentBinding(el, context)
    attributeBinding(el, context)
  }
  return refs.length
}



/** @type {(el: html.domhandler.Element, context: any) => void} */
function contentBinding(el, context) {
  const attributeNames = Object.keys(el.attribs)
  const bindindAttr = BIND_CONTENT_ATTRS.find(attr => attributeNames.includes(attr))
  if (!bindindAttr) return
  const expression = el.attribs[bindindAttr]
  let value
  try {
    value = evaluate(expression, context)
    if (value === undefined) throw new Error(`binding error: ${expression}`)
  } catch (error) {
    addError(el, expression, error)
  }
  if (value !== undefined) {
    if (bindindAttr === 'tg-text') html.insertText(el, String(value ?? ''))
    if (bindindAttr === 'tg-html') html.innerHTML(el, String(value ?? ''))
    if (bindindAttr === 'tg-bind') {
      const newEl = html.parseFragment(value)
      newEl.children.forEach(child => { if (child.type === 'tag' || child.type === 'text') html.insertBefore(child, el) })
    }
  }
  if (bindindAttr === 'tg-bind') html.detachNode(el)
  delete el.attribs[bindindAttr]
}



/** @type {(el: html.domhandler.Element, context: any) => void} */
function attributeBinding(el, context) {
  for (const bindAttr of Object.keys(el.attribs).filter(o => o.startsWith(BIND_ATTRIBUTE_PREFIX))) {
    const attr = bindAttr.substring(BIND_ATTRIBUTE_PREFIX.length)
    const expression = el.attribs[bindAttr]
    // console.debug({bindAttr, attr, attrContent})
    delete el.attribs[bindAttr]
    let value
    try {
      value = evaluate(expression, context)
      if (value === undefined) throw new Error(`binding error: ${expression}`)
    } catch (error) {
      addError(el, expression, error)
    }
    if (value !== undefined && value !== null) {
      el.attribs[attr] = String(value)
    }
  }
}