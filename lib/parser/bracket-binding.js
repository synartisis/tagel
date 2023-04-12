import * as html from 'syn-html-parser'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/
const reBracketsAll = new RegExp(reBrackets, 'g')


/** @type {(el: html.TextNode) => void} */
export function brackets(el) {
  if (!reBrackets.test(el.value) || !el.parentNode || !html.adapter.isElementNode(el.parentNode)) return
  const context = getContext(el.parentNode)
  const matches = el.value.matchAll(reBracketsAll)
  for (const match of matches) {
    const expression = match.groups?.expression ?? ''
    let value
    try {
      value = evaluate(expression, context)
      if (value === undefined) throw new Error(`binding error: ${expression}`)
    } catch (error) {
      addError(el, expression, error, undefined, match[0], isInBody(el))
    }
    if (value !== undefined) {
      el.value = el.value.replace(match[0], String(value ?? ''))
    }
  }
}


/** @type {(el: html.ChildNode) => boolean} el */
export function isInBody(el) {
  if (html.adapter.isElementNode(el) && el.tagName === 'body') return true
  if (!el.parentNode || !html.adapter.isElementNode(el.parentNode)) return false
  return isInBody(el.parentNode)
}
