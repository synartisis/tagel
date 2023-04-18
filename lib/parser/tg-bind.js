import * as html from 'syn-html-parser'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'

const BIND_CONTENT_ATTRS = ['tg-bind', 'tg-text', 'tg-html']
const BIND_ATTRIBUTE_PREFIX = 'tg:'
const regex = new RegExp(`${BIND_CONTENT_ATTRS.join('|')}|.*${BIND_ATTRIBUTE_PREFIX}.*`)


/** 
 * binds element content and attributes
 * @type {(el: html.Element, state: tagel.State) => Promise<void>}
 * */
export async function tgBindElement(el, state) {
  if (state.toDetach.includes(el)) return
  if (!regex.test(el.attrs.map(o => o.name).join(' '))) return
  const context = getContext(el)
  await contentBinding(el, context, state)
  await attributeBinding(el, context)
}



/** @type {(el: html.Element, context: any, state: tagel.State) => Promise<void>} */
async function contentBinding(el, context, state) {
  const bindindAttrs = el.attrs.filter(o => BIND_CONTENT_ATTRS.includes(o.name))
  if (!bindindAttrs.length) return
  if (bindindAttrs.length > 1) return addError({ el, expression: 'tg-*', message: `only one of ${BIND_CONTENT_ATTRS.join(',')} can be used in an element` })
  const bindindAttr = bindindAttrs[0]
  const expression = bindindAttr.value
  let value
  try {
    value = await evaluate(expression, context)
    if (value === undefined) throw new Error(`binding error: ${expression}`)
    html.removeAttribute(el, bindindAttr.name)
  } catch (error) {
    addError({ el, expression, error })
  }
  if (value !== undefined) {
    if (bindindAttr.name === 'tg-text') html.insertText(el, String(value ?? ''))
    if (bindindAttr.name === 'tg-html') html.innerHTML(el, String(value ?? ''))
    if (bindindAttr.name === 'tg-bind') {
      const newEl = html.parseFragment(value)
      /** @type {html.ChildNode} */
      let lastElement = el
      newEl.childNodes.forEach(child => {
        if (html.adapter.isElementNode(child) || html.adapter.isTextNode(child)) {
          html.insertAfter(child, lastElement)
          lastElement = child
        }
      })
    }
  }
  if (bindindAttr.name === 'tg-bind') state.toDetach.push(el)
}



/** @type {(el: html.Element, context: any) => Promise<void>} */
async function attributeBinding(el, context) {
  for (const boundAttrName of el.attrs.map(o => o.name).filter(o => o.startsWith(BIND_ATTRIBUTE_PREFIX))) {
    const realAttrName = boundAttrName.substring(BIND_ATTRIBUTE_PREFIX.length)
    const expression = html.getAttribute(el, boundAttrName)
    if (!expression) continue
    let value
    try {
      value = await evaluate(expression, context)
      if (value === undefined) throw new Error(`binding error`)
      html.removeAttribute(el, boundAttrName)
      html.setAttribute(el, realAttrName, String(value ?? ''))
    } catch (error) {
      addError({ el, expression, error })
    }
  }
}