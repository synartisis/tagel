import * as html from 'syn-html-parser'
import { notTgForDescendant } from '../utils.js'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'

const BIND_CONTENT_ATTRS = ['tg-bind', 'tg-text', 'tg-html']
const BIND_ATTRIBUTE_PREFIX = 'tg:'

/**
 * binds element content and attributes
 * @param {html.Document | html.Element} root 
 */
export async function tgBind(root) {
  const regex = new RegExp(`${BIND_CONTENT_ATTRS.join('|')}|.*${BIND_ATTRIBUTE_PREFIX}.*`)
  const refs = html.qsa(root, el => regex.test(el.attrs.map(o => o.name).join(' ')) && notTgForDescendant(el))
//   const refs = html.qsa(root, el => (
//     !!el.attribs['tg-bind'] || !!el.attribs['tg-text'] || !!el.attribs['tg-html'] ||
//     !!(Object.keys(el.attribs).find(k => k.startsWith(BIND_ATTRIBUTE_PREFIX))
//   ) && notTgForDescendant(el))
// )

  for await (const el of refs) {
    const context = getContext(el)
    await contentBinding(el, context)
    await attributeBinding(el, context)
  }
  return refs.length
}


const regex = new RegExp(`${BIND_CONTENT_ATTRS.join('|')}|.*${BIND_ATTRIBUTE_PREFIX}.*`)

/** @type {(el: html.Element, attrs: any, state: tagel.State) => Promise<void>} */
export async function tgBindElement(el, attrs, state) {
  if (state.toDetach.includes(el)) return
  if (!regex.test(el.attrs.map(o => o.name).join(' '))) return
  const context = getContext(el)

  contentBinding(el, context, state)
  attributeBinding(el, context)
}



/** @type {(el: html.Element, context: any, state: tagel.State) => void} */
function contentBinding(el, context, state) {
  const bindindAttr = el.attrs.find(o => BIND_CONTENT_ATTRS.includes(o.name))
  if (!bindindAttr) return
  const expression = bindindAttr.value
  let value
  try {
    value = evaluate(expression, context)
    if (value === undefined) throw new Error(`binding error: ${expression}`)
  } catch (error) {
    addError(el, expression, error)
  }
  if (value !== undefined) {
    if (bindindAttr.name === 'tg-text') html.insertText(el, String(value ?? ''))
    if (bindindAttr.name === 'tg-html') html.innerHTML(el, String(value ?? ''))
    if (bindindAttr.name === 'tg-bind') {
      const newEl = html.parseFragment(value)
      newEl.childNodes.forEach(child => { if (html.adapter.isElementNode(child) || html.adapter.isTextNode(child)) html.insertBefore(child, el) })
    }
  }
  if (bindindAttr.name === 'tg-bind') state.toDetach.push(el) //html.detachNode(el)
  el.attrs.splice(el.attrs.indexOf(bindindAttr), 1)
}



/** @type {(el: html.Element, context: any) => void} */
function attributeBinding(el, context) {
  for (const bindAttrName of el.attrs.map(o => o.name).filter(o => o.startsWith(BIND_ATTRIBUTE_PREFIX))) {
    const attrName = bindAttrName.substring(BIND_ATTRIBUTE_PREFIX.length)
    const attr = el.attrs.find(o => o.name === bindAttrName)



    // if (attrName === 'tg:src') console.log({attr})
    if (!attr) continue
    attr.name = attrName
    const expression = attr.value
    // console.debug({attrName, attr})
    let value
    try {
      value = evaluate(expression, context)
      if (value === undefined) throw new Error(`binding error: ${expression}`)
    } catch (error) {
      // if (expression === 'this.image') console.log(error, Object.keys(context), context._id)
      addError(el, expression, error)
    }
    attr.value = String(value ?? '')
  }
}