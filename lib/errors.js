import * as html from '@synartisis/htmlparser'

/**
 * @typedef ErrorEntries
 * @prop {html.domhandler.Element | undefined} el
 * @prop {string | undefined} expression
 * @prop {any} error
 * @prop {string | undefined} message
 */


/** @type {Set<ErrorEntries>} */
const errors = new Set

export function clearErrors() {
  errors.clear()
}


/** @type {(el?: html.domhandler.Element, expression?: string, error?: any, message?: string) => void} */
export function addError(el, expression, error, message) {
  errors.add({ el, expression, error, message })
}


/** @param {html.domhandler.Document} doc */
export function showErrors(doc) {
  if (errors.size === 0) return
  const head = html.documentHead(doc)
  const body = html.documentHead(doc)
  if (!head || !body) return
  html.insertAdjacentHTML(head, 'beforeend', /*html*/`
    <style id="tagel-error-styles">
      .tagel-error { background-color: white; color: darkred; }
      .tagel-error > em { font-style: normal; padding: 0 4px; background-color: darkred; color: white; }
    </style>
  `)
  const tagelErrorEl = html.insertAdjacentHTML(body, 'beforeend', /*html*/`
    <code id="tagel-error" style="position: fixed; bottom: 0; color: #e78d4d; padding: 1rem; background: #000c; z-index: 99999999;"></code>
  `)
  if (!tagelErrorEl) throw Error('error in insertAdjacentHTML with element with id="tagel-error"')
  for (const error of errors) {
    html.insertAdjacentHTML(tagelErrorEl, 'beforeend', /*html*/`
      <div>${error.expression}</div>
      `)
      if (error.el && error.expression) html.innerHTML(error.el, highlightError(error.expression))
      console.log('-', error.expression, error.message)
  }
}


/** @param {string} expression */
export function highlightError(expression) {
  return `<span class="tagel-error"><em>ERROR</em> missing: ${expression}</span>`
}
