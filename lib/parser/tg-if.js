import * as html from 'syn-html-parser'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'



/** 
 * removes the element if it is not satisfying tg-if condition
 * @type {(el: html.Element, state: tagel.State) => Promise<void>}
 * */
export async function tgIfElement(el, state) {
  if (state.toDetach.includes(el)) return
  const expression = html.getAttribute(el, 'tg-if')
  if (!expression) return
  const context = getContext(el)
  let value = false
  try {
    value = await evaluate(expression, context)
  } catch (error) {
    addError({ el, expression, error })
  }
  if (!value) {
    state.toDetach.push(el)
  } else {
    html.removeAttribute(el, 'tg-if')
  }
}