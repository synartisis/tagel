import * as html from 'syn-html-parser'
import { evaluate, getContext, setContext } from '../context.js'
import { addError } from '../errors.js'


/** 
 * repeats a template, once for each item on an array
 *  @type {(el: html.Element, state: tagel.State) => Promise<void>}
 * */
export async function tgForElement(el, state) {
  if (state.toDetach.includes(el)) return
  const expression = html.getAttribute(el, 'tg-for')
  if (!expression) return
  const context = getContext(el)
  const limitAttr = html.getAttribute(el, 'tg-for-limit')
  const limit = limitAttr && Number.isInteger(limitAttr) ? Number(limitAttr) : -1
  let value
  try {
    value = await evaluate(expression, context)
  } catch (error) {
    addError({ el, expression, error })
    return
  }
  if (!Array.isArray(value)) {
    addError({ el, expression, message: `expression "${expression}" does not evaluate to array` })
    return
  }
  if (limit !== -1) value = value.slice(0, limit)
  html.removeAttribute(el, 'tg-for')
  html.removeAttribute(el, 'tg-for-limit')
  const itemTemplate = html.serializeOuter(el)
  let lastElement = el
  for (const itemContext of value) {
    const newItem = html.createElementFromHTML(itemTemplate)
    html.insertAfter(newItem, lastElement)
    setContext(newItem, itemContext)
    // html.setAttribute(newItem, 'tagel-debug', itemContext._id)
    lastElement = newItem
  }
  state.toDetach.push(el)
}