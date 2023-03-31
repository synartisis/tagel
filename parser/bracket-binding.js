import { evaluate } from '../utils.js'

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
        // console.log(isInBody(match), match.groups?.expression)
        // console.log(match.input)
        // console.log(match.input.substring(0, match.index))
        value = `<span class="tagel-error"><em>ERROR:</em> cannot find: ${expression}</span>`
        errors.push(`[bracket-binding: ${expression}]`)
      }
      content = content.replace(match[0], String(value))
    } catch (/**@type {any}*/ error) {
      errors.push(`[bracket-binding: ${expression}] ${error.message}`)
      continue
    }
  }

  return content
}


function isInBody(match) {
  return match.input.substring(0, match.index).includes('</head>')
}