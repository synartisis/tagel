import { evaluate } from '../utils.js'

const reBrackets = /\[\[\s*(?<expression>.+?)\s*\]\]/g

/** @type {(source: string, context: any) => Promise<{ content: string, errors: string[] }>}>} */
export async function bracketBind(source, context) {
  let content = source
  const errors = []

  const matches = source.matchAll(reBrackets)
  for (const match of matches) {
    const expression = match.groups?.expression
    if (!expression || !match.index) continue
    // console.debug({expression},evaluate(expression, context))
    if (expression) {
      let value = null
      try {
        value = evaluate(expression, context)
      } catch (/**@type {any}*/ error) {
        // console.error(error)
        errors.push(`[bracket-binding: ${expression}] ${error.message}`)
        continue
      }
      if (value != null) {
        const result = String(value)
        content = content.replace(match[0], result)
      }
    }
  }

  return { content, errors }
}