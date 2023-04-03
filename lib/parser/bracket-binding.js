import * as html from '@synartisis/htmlparser'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/
const reBracketsAll = new RegExp(reBrackets, 'g')

/** @param {html.domhandler.Document} doc */
export async function bracketsBind(doc) {
  const refs = html.findAll(doc, node => node.type === 'text' && reBrackets.test(node.data))
  for (const ref of refs) {
    if (ref.type !== 'text' || (ref.parent?.type !== 'tag' && ref.parent?.type !== 'script' && ref.parent?.type !== 'style')) {
      // binding error: brackets must have a parent element
      continue
    }
    const context = getContext(ref.parent)
    const matches = ref.data.matchAll(reBracketsAll)
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
        ref.data = ref.data.replace(match[0], String(value ?? ''))
      }
    }
  }
}


/** @type {(el: html.domhandler.AnyNode) => boolean} el */
function isInBody(el) {
  if (el.type === 'root') return false
  if (el.type === 'tag' && el.name === 'body') return true
  if (!el.parent) return false
  return isInBody(el.parent)
}
