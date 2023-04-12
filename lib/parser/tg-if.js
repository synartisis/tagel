import * as html from 'syn-html-parser'
import { notTgForDescendant } from '../utils.js'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'


/** @type {(root: html.Document | html.Element) => Promise<number>} */
export async function tgIf(root) {
  if (!root) return 0
  const refs = html.qsa(root, el => !!el.attrs.find(o => o.name === 'tg-if') && notTgForDescendant(el))

  for (const el of refs) {
    const attr = el.attrs.find(o => o.name === 'tg-if')
    if (!attr) continue
    const expression = attr.value
    const context = getContext(el)
    let value = false
    try {
      value = evaluate(expression, context)
    } catch (error) {
      addError(el, expression, error)
    }
    if (!value) {
      html.detachNode(el)
    } else {
      el.attrs.splice(el.attrs.indexOf(attr), 1)
    }
  }
  return refs.length
}



/** @type {(el: html.Element, attrs: any, state: tagel.State) => Promise<void>} */
export async function tgIfElement(el, attrs, state) {
  if (state.toDetach.includes(el)) return
  if (!attrs['tg-if']) return
  const expression = attrs['tg-if']
  const context = getContext(el)
  let value = false
  try {
    value = evaluate(expression, context)
  } catch (error) {
    addError(el, expression, error)
  }
  if (!value) {
    state.toDetach.push(el)
    // html.detachNode(el)
  } else {
    el.attrs.splice(el.attrs.indexOf(attrs['tg-if']), 1)
  }
}