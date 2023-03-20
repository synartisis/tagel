import * as htmlParser from './html-parser.js'


/** @type {(source: string, context: object) => any} */
export function evaluate(source, context) {
  const f = new Function('return ' + source)
  const value = f.call(context)
  return value
}


/** @type {(el: tagel.Node) => object} */
export function getContext(el) {
  if (el.$context) return el.$context
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
  let tagelErrorEl = htmlParser.qs(doc, el => el.attribs?.id === 'tagel-error')
  if (!tagelErrorEl) {
    tagelErrorEl = htmlParser.createElement('code', { id: 'tagel-error', style: styles.error })
    const body = htmlParser.documentBody(doc)
    if (body) htmlParser.append(body, tagelErrorEl)
  }
  const errorEl = htmlParser.createElement('div')
  htmlParser.append(errorEl, htmlParser.createTextNode(message))
  htmlParser.append(tagelErrorEl, errorEl)
}


/** @type {(doc: tagel.Node, errors: string[]) => void} */
export function showErrors(doc, errors) {
  if (!errors.length) return
  let tagelErrorEl = htmlParser.qs(doc, el => el.attribs?.id === 'tagel-error')
  if (!tagelErrorEl) {
    tagelErrorEl = htmlParser.createElement('code', { id: 'tagel-error', style: styles.error })
    const body = htmlParser.documentBody(doc)
    if (body) htmlParser.append(body, tagelErrorEl)
  }
  errors.forEach(error => {
    const errorEl = htmlParser.createElement('div')
    htmlParser.append(errorEl, htmlParser.createTextNode(error))
    if (tagelErrorEl) htmlParser.append(tagelErrorEl, errorEl)
  })
}


const styles = {
  error: 'position: fixed; top: 0; width: 100vw; height: 100vh; color: #ccc; padding: 1rem; background: #000c; z-index: 99999999;'
}

