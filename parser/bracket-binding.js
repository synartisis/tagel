import { evaluate, highlightError } from '../utils.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/g

/** @type {(source: string, context: any, errors: string[]) => Promise<string>}>} */
export async function bracketBind(source, context, errors) {
  let content = source

  const matches = source.matchAll(reBrackets)
  for (const match of matches) {
    const expression = match.groups?.expression
    if (!expression || !match.index) continue
    let value
    try {
      value = evaluate(expression, context)
      if (value === undefined) {
        value = highlightError(match, expression)
        errors.push(`[bracket-binding: ${expression}]`)
      }
    } catch (/**@type {any}*/ error) {
      value = highlightError(match, expression)
      errors.push(`[bracket-binding: ${expression}] ${error.message}`)
    }
    content = content.replace(match[0], String(value))
  }

  return content
}
