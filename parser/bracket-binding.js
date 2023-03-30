import { evaluate } from '../utils.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/g

/** @type {(source: string, context: any, errors: string[]) => Promise<string>}>} */
export async function bracketBind(source, context, errors) {
  let content = source

  const matches = source.matchAll(reBrackets)
  for (const match of matches) {
    const expression = match.groups?.expression
    if (!expression || !match.index) continue
    // console.debug({expression},evaluate(expression, context))
    if (expression) {
      let value
      try {
        value = evaluate(expression, context)
      } catch (/**@type {any}*/ error) {
        // console.error(error)
        errors.push(`[bracket-binding: ${expression}] ${error.message}`)
        continue
      }
      if (value !== undefined) {
        content = content.replace(match[0], String(value))
      }
    }
  }

  return content
}