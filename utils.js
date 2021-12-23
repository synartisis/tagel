import * as parse5 from './parse5.js'


/** @type {(source: string, context: object) => any} */
export function evaluate(source, context) {
  // const f = new Function(...Object.keys(context), 'return ' + source)
  try {
    const f = new Function('data', 'return ' + source)
    const value = f.call(context)
    return value
  } catch (error) {
    // context.$tagel.errors.push(`[tagel evaluate error] "${error}"`)
  }
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
  let tagelErrorEl = parse5.qs(doc, el => el.attribs?.id === 'tagel-error')
  if (!tagelErrorEl) {
    tagelErrorEl = parse5.createElement('code', { id: 'tagel-error', style: styles.error })
    const body = parse5.documentBody(doc)
    if (body) parse5.append(body, tagelErrorEl)
  }
  const errorEl = parse5.createElement('div')
  parse5.append(errorEl, parse5.createTextNode(message))
  parse5.append(tagelErrorEl, errorEl)
}


/** @type {(doc: tagel.Node, errors: string[]) => void} */
export function showErrors(doc, errors) {
  if (!errors.length) return
  let tagelErrorEl = parse5.qs(doc, el => el.attribs?.id === 'tagel-error')
  if (!tagelErrorEl) {
    tagelErrorEl = parse5.createElement('code', { id: 'tagel-error', style: styles.error })
    const body = parse5.documentBody(doc)
    if (body) parse5.append(body, tagelErrorEl)
  }
  errors.forEach(error => {
    const errorEl = parse5.createElement('div')
    parse5.append(errorEl, parse5.createTextNode(error))
    // @ts-ignore
    parse5.append(tagelErrorEl, errorEl)
  })
}


const styles = {
  error: 'position: fixed; top: 0; width: 100vw; height: 100vh; color: #ccc; padding: 1rem; background: #000c; z-index: 99999999;'
}

