import * as html from 'syn-html-parser'

/**
 * @typedef ErrorEntry
 * @prop {html.Element | html.TextNode} el
 * @prop {string} expression
 * @prop {any} error
 * @prop {string | undefined} message
 * @prop {string | undefined} userEntry
 * @prop {boolean} inBody
 */


/** @type {Set<ErrorEntry>} */
const errors = new Set

export function clearErrors() {
  errors.clear()
}


/** @type {(el: html.Element | html.TextNode, expression: string, error?: any, message?: string, userEntry?: string, inBody?: boolean) => void} */
export function addError(el, expression, error, message, userEntry, inBody = true) {
  if (html.adapter.isElementNode(el)) el.attrs.push({ name: 'tagel', value: 'error' })
  errors.add({ el, expression, error, message, userEntry, inBody })
}


/** @param {html.Document} doc */
export function showErrors(doc) {
  if (errors.size === 0) return
  const head = html.documentHead(doc)
  const body = html.documentHead(doc)
  if (!head || !body) return
  html.insertAdjacentHTML(head, 'beforeend', /*html*/`
    <style id="tagel-error-styles">
      #tagel-error { position: fixed; bottom: 0; color: #e7714d; background: #000c; border: solid 2px; z-index: 1; padding: 1rem .3rem 0; }
      #tagel-error > #tagel-error-close { position: absolute; top: -14px; right: -6px; background: inherit; border-radius: 50%; cursor: pointer; padding: 2px 8px; border: solid 1px; }
      .tagel-error { background-color: white; color: darkred; outline: 1px solid; }
      .tagel-error > em { font-style: normal; padding: 0 8px; background-color: darkred; color: white; }
      #tagel-error #tagel-errors-output { max-height: 20rem; overflow-y: auto; margin: 10px; }
    </style>
  `)
  const { 'tagel-error': tagelErrorsElement } = html.insertAdjacentHTML(body, 'beforeend', /*html*/`
    <div id="tagel-error">
      <a id="tagel-error-close">x</a>
      <strong style="display: block; text-decoration: underline; padding-bottom: 4px;">binding errors found!</strong>
      <pre id="tagel-errors-output"></pre>
    </div>
    <script>
      document.querySelector('#tagel-error-close').addEventListener('click', evt => document.querySelector('#tagel-error').style.display = 'none')
    </script>
  `)
  const tagelErrors = html.qs(tagelErrorsElement, o => html.getAttributes(o).id === 'tagel-errors-output')
  if (!tagelErrors) throw Error('error in insertAdjacentHTML with element with id="tagel-error"')
  const errorMessageCounter = new Set
  for (const error of errors) {
    if (!errorMessageCounter.has(error.expression + error.message ?? '')) {
      errorMessageCounter.add(error.expression + error.message ?? '')
      console.log('[binding error]', error.expression, error.message ?? '')
      html.insertAdjacentHTML(tagelErrors, 'beforeend', /*html*/`
        ${error.expression} ${error.message ?? ''}
      `.trim() + '\n')
    }
    if (html.adapter.isTextNode(error.el)) {
      if (error.userEntry) {
        const [before, after] = error.el.value.split(error.userEntry)
        if (error.inBody) {
          const textErrorEl = html.createElement('span')
          html.innerHTML(textErrorEl, highlightError(error.expression))
          html.insertBefore(textErrorEl, error.el)
          html.insertTextBefore(textErrorEl, before)
          html.insertTextBefore(error.el, after)
          html.detachNode(error.el)
        } else {
          error.el.value = before + after
        }
      }
    } else {
      if (html.adapter.isElementNode(error.el)) {
        html.innerHTML(error.el, highlightError(error.expression))
      }
    }
  }
}


/** @param {string} expression */
export function highlightError(expression) {
  return `<span class="tagel-error"><em>ERROR</em> missing: ${expression}</span>`
}
