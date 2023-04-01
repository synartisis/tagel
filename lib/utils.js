import * as html from '@synartisis/htmlparser'


const scopes = new WeakMap


/** @type {(source: string, context: object) => any} */
export function evaluate(source, context) {
  const f = new Function('return ' + source)
  const value = f.call(context)
  return value
}

/** @type {(el: html.domhandler.Element | html.domhandler.Document, context: any) => void} */
export function setContext(el, context) {
  scopes.set(el, context)
}


/** @type {(el: html.domhandler.Element | html.domhandler.Document) => any} */
export function getContext(el) {
  const context = scopes.get(el)
  if (context) return context
  if (el.parent?.type !== 'tag' && el.parent?.type !== 'root') return {}
  return getContext(el.parent)
}


/** @type {(el: html.domhandler.Element, predicate: (node: html.domhandler.Element) => boolean) => html.domhandler.Element | null} */
export function findMatchingParent(el, predicate) {
  if (el.parent?.type !== 'tag') return null
  if (predicate(el.parent)) return el.parent
  return findMatchingParent(el.parent, predicate)
}


/** @type {(doc: html.domhandler.Document, errors: string[]) => void} */
export function showErrors(doc, errors) {
  if (!errors.length) return
  const tagelErrorEl = html.createElement('code', { id: 'tagel-error', style: styles.error })
  const body = html.documentBody(doc)
  if (body) {
    html.appendChild(body, tagelErrorEl)
    const errorStyles = html.parseFragment(/*html*/`
      <style id="tagel-error-styles">
        .tagel-error { background-color: white; color: darkred; }
        .tagel-error > em { font-style: normal; padding: 0 4px; background-color: darkred; color: white; }
      </style>
    `)
    const style = html.qs(errorStyles, el => el.name === 'style')
    if (style) html.appendChild(body, style)
  }
  errors.forEach(error => {
    const errorEl = html.createElement('div')
    html.insertText(errorEl, error)
    if (tagelErrorEl) html.appendChild(tagelErrorEl, errorEl)
  })
}


/** 
 * @param {RegExpMatchArray} match
 * @param {string} expression 
 * */
export function highlightError(match, expression) {
  if (isInBody(match)) {
    return `<span class="tagel-error"><em>ERROR:</em> cannot find: ${expression}</span>`
  } else {
    return ''
  }
}


/** @param {RegExpMatchArray} match */
function isInBody(match) {
  return match.input?.substring(0, match.index).includes('</head>')
}

const styles = {
  error: 'position: fixed; bottom: 0; color: #e78d4d; padding: 1rem; background: #000c; z-index: 99999999;'
}

