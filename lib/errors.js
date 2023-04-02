import * as html from '@synartisis/htmlparser'

/**
 * @typedef ErrorEntries
 * @prop {html.domhandler.Element | html.domhandler.Text} el
 * @prop {string} expression
 * @prop {any} error
 * @prop {string | undefined} message
 * @prop {string | undefined} userEntry
 */


/** @type {Set<ErrorEntries>} */
const errors = new Set

export function clearErrors() {
  errors.clear()
}


/** @type {(el: html.domhandler.Element | html.domhandler.Text, expression: string, error?: any, message?: string, userEntry?: string) => void} */
export function addError(el, expression, error, message, userEntry) {
  errors.add({ el, expression, error, message, userEntry })
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
  const tagelErrorsElement = html.insertAdjacentHTML(body, 'beforeend', /*html*/`
    <code id="tagel-error" style="position: fixed; bottom: 0; color: #e78d4d; padding: 1rem; background: #000c; z-index: 99999999;"></code>
  `)
  if (!tagelErrorsElement) throw Error('error in insertAdjacentHTML with element with id="tagel-error"')
  for (const error of errors) {
    console.log('[binding error]', error.expression, error.message ?? '')
    html.insertAdjacentHTML(tagelErrorsElement, 'beforeend', /*html*/`
      <div>${error.expression}</div>
    `)
    if (error.el.type === 'text') {
      if (error.userEntry) {
        const [before, after] = error.el.data.split(error.userEntry)
        const textErrorEl = html.createElement('span')
        html.innerHTML(textErrorEl, highlightError(error.expression))
        html.insertBefore(textErrorEl, error.el)
        html.insertTextBefore(textErrorEl, before)
        html.insertTextBefore(error.el, after)
        html.detachNode(error.el)
      }
    } else {
      html.innerHTML(error.el, highlightError(error.expression))
    }
  }
}


/** @param {string} expression */
export function highlightError(expression) {
  return `<span class="tagel-error"><em>ERROR</em> missing: ${expression}</span>`
}
