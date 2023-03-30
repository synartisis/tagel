import * as html from '@synartisis/htmlparser'


const scopes = new Map


/** @type {(source: string, context: object) => any} */
export function evaluate(source, context) {
  const f = new Function('return ' + source)
  const value = f.call(context)
  return value
}

export function setContext(el, context) {
  scopes.set(el, context)
}


/** @type {(el: tagel.Node) => object} */
export function getContext(el) {
  const context = scopes.get(el)
  if (context) return context
  if (!el.parent) return {}
  return getContext(el.parent)
}


/** @type {(el: tagel.Node, predicate: tagel.Predicate) => tagel.Node | null} */
export function findParent(el, predicate) {
  if (!el.parent) return null
  if (predicate(el.parent)) return el.parent
  return findParent(el.parent, predicate)
}


/** @type {(doc: tagel.Node, message: string) => void} */
export function showError(doc, message) {
  // let tagelErrorEl = html.qs(doc, el => el.attribs?.id === 'tagel-error')
  // if (!tagelErrorEl) {
  //   tagelErrorEl = html.createElement('code', { id: 'tagel-error', style: styles.error })
  //   const body = html.documentBody(doc)
  //   if (body) {
  //     html.append(body, tagelErrorEl)
  //   }
  // }
  // const errorEl = html.createElement('div')
  // html.append(errorEl, html.createTextNode(message))
  // html.append(tagelErrorEl, errorEl)
}


/** @type {(doc: tagel.Node, errors: string[]) => void} */
export function showErrors(doc, errors) {
  // if (!errors.length) return
  // let tagelErrorEl = html.qs(doc, el => el.attribs?.id === 'tagel-error')
  // if (!tagelErrorEl) {
  //   tagelErrorEl = html.createElement('code', { id: 'tagel-error', style: styles.error })
  //   const body = html.documentBody(doc)
  //   if (body) {
  //     html.append(body, tagelErrorEl)
  //     const errorStyles = html.parseFragment(/*html*/`
  //       <style id="tagel-error-styles">
  //         .tagel-error { background-color: white; color: darkred; }
  //         .tagel-error > em { font-style: normal; padding: 0 4px; background-color: darkred; color: white; }
  //       </style>
  //     `)
  //     html.append(body, errorStyles)
  //   }
  // }
  // errors.forEach(error => {
  //   const errorEl = html.createElement('div')
  //   html.append(errorEl, html.createTextNode(error))
  //   if (tagelErrorEl) html.append(tagelErrorEl, errorEl)
  // })
}


const styles = {
  error: 'position: fixed; bottom: 0; color: #e78d4d; padding: 1rem; background: #000c; z-index: 99999999;'
}

