import * as html from '@synartisis/htmlparser'


const scopes = new Map


/** @type {(source: string, context: object) => any} */
export function evaluate(source, context) {
  const f = new Function('return ' + source)
  const value = f.call(context)
  return value
}

/** @type {(el: html.Element | html.Document, context: any) => void} */
export function setContext(el, context) {
  scopes.set(el, context)
}


/** @type {(el: html.Element | html.Document) => any} */
export function getContext(el) {
  const context = scopes.get(el)
  if (context) return context
  if (el.parent?.type !== 'tag' && el.parent?.type !== 'root') return {}
  return getContext(el.parent)
}


/** @type {(el: html.Element, predicate: (node: html.Node) => boolean) => html.Node | null} */
export function findMatchingParent(el, predicate) {
  if (el.parent?.type !== 'tag') return null
  if (predicate(el.parent)) return el.parent
  return findMatchingParent(el.parent, predicate)
}


// /** @type {(doc: tagel.Node, message: string) => void} */
// export function showError(doc, message) {
//   let tagelErrorEl = html.qs(doc, el => el.attribs?.id === 'tagel-error')
//   if (!tagelErrorEl) {
//     tagelErrorEl = html.createElement('code', { id: 'tagel-error', style: styles.error })
//     const body = html.documentBody(doc)
//     if (body) {
//       html.append(body, tagelErrorEl)
//     }
//   }
//   const errorEl = html.createElement('div')
//   html.append(errorEl, html.createTextNode(message))
//   html.append(tagelErrorEl, errorEl)
// }


/** @type {(doc: html.Document, errors: string[]) => void} */
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
    const style = html.qs(errorStyles, el => el.type === 'tag' && el.name === 'style')
    if (style) html.appendChild(body, style)
  }
  errors.forEach(error => {
    const errorEl = html.createElement('div')
    html.insertText(errorEl, error)
    if (tagelErrorEl) html.appendChild(tagelErrorEl, errorEl)
  })
}


const styles = {
  error: 'position: fixed; bottom: 0; color: #e78d4d; padding: 1rem; background: #000c; z-index: 99999999;'
}

