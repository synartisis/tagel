import * as html from 'syn-html-parser'
import { evaluate, getContext } from '../context.js'
import { notTgForDescendant, isInBody } from '../utils.js'
import { addError } from '../errors.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/
const reBracketsAll = new RegExp(reBrackets, 'g')

/** @param {html.Document} doc */
export async function bracketsBind(doc) {
  const refs = html.findAll(doc, node => html.adapter.isTextNode(node) && reBrackets.test(node.value) && notTgForDescendant(node))
  for (const ref of refs) {
    if (!html.adapter.isTextNode(ref) || !ref.parentNode || !html.adapter.isElementNode(ref.parentNode)) {
      // binding error: brackets must have a parent element
      continue
    }
    const context = getContext(ref.parentNode)
    const matches = ref.value.matchAll(reBracketsAll)
    for (const match of matches) {
      const expression = match.groups?.expression ?? ''
      let value
      try {
        value = evaluate(expression, context)
        if (value === undefined) throw new Error(`binding error: ${expression}`)
      } catch (error) {
        addError(ref, expression, error, undefined, match[0], isInBody(ref))
      }
      if (value !== undefined) {
        ref.value = ref.value.replace(match[0], String(value ?? ''))
      }
    }
  }
}


/** @type {(el: html.TextNode, state: tagel.State) => Promise<void>} */
export async function brackets(el, state) {
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