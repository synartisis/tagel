import * as html from 'syn-html-parser'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/
const reBracketsAll = new RegExp(reBrackets, 'g')


/** @type {(el: html.TextNode) => Promise<void>} */
export async function brackets(el) {
  if (!reBrackets.test(el.value) || !el.parentNode || !html.adapter.isElementNode(el.parentNode)) return
  const context = getContext(el.parentNode)
  const matches = el.value.matchAll(reBracketsAll)
  for (const match of matches) {
    const expression = match.groups?.expression ?? ''
    let value
    try {
      value = await evaluate(expression, context)
      if (value === undefined) throw new Error(`binding error: ${expression}`)
    } catch (error) {
      addError({ el, expression, message: match[0], error })
    }
    if (value !== undefined) {
      el.value = el.value.replace(match[0], String(value ?? ''))
    }
  }
}
