import * as html from '@synartisis/htmlparser'
import { evaluate, getContext } from '../context.js'
import { addError } from '../errors.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/g

/** @param {html.domhandler.Document} doc */
export async function bracketsBind(doc) {
  const refs = html.findAll(doc, node => node.type === 'text' && reBrackets.test(node.data))
  console.log('+++', refs.length)
  for (const ref of refs) {
    if (ref.type !== 'text' || (ref.parent?.type !== 'tag' && ref.parent?.type !== 'script' && ref.parent?.type !== 'style')) {
      addError(undefined, undefined, undefined, `binding error: brackets must have a parent element`)
      continue
    }
    const context = getContext(ref.parent)
    const matches = ref.data.matchAll(reBrackets)
    for (const match of matches) {
      const expression = match.groups?.expression ?? ''
      console.log('---------', expression)
      let value
      try {
        value = evaluate(expression, context)
        if (value === undefined) throw new Error(`binding error: ${expression}`)
      } catch (error) {
        addError(undefined, expression, error)
      }
      if (value !== undefined) {
        ref.data = ref.data.replace(match[0], String(value ?? ''))
      }
    }
  }
}


// /** @param {RegExpMatchArray} match */
// function isInBody(match) {
//   return match.input?.substring(0, match.index).includes('</head>')
// }
