import { evaluate } from '../context.js'
import { addError } from '../errors.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/g

/** @type {(source: string, context: any) => Promise<string>}>} */
export async function bracketBind(source, context) {
  let content = source

  const matches = source.matchAll(reBrackets)
  for (const match of matches) {
    const expression = match.groups?.expression
    if (!expression || !match.index) continue
    let value
    try {
      value = evaluate(expression, context)
      if (value === undefined) {
        if (isInBody(match)) {
          // value = highlightError(expression)
        } else {
          value = ''
        }
        addError(null, expression, null)
      }
    } catch (/**@type {any}*/ error) {
      // value = highlightError(expression)
      addError(null, expression, error)
    }
    content = content.replace(match[0], String(value ?? ''))
  }

  return content
}


/** @param {RegExpMatchArray} match */
function isInBody(match) {
  return match.input?.substring(0, match.index).includes('</head>')
}
