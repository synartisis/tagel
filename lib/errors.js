import * as html from '@synartisis/htmlparser'

/**
 * @typedef ErrorEntry
 * @prop {html.domhandler.Element | html.domhandler.Text} el
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


/** @type {(el: html.domhandler.Element | html.domhandler.Text, expression: string, error?: any, message?: string, userEntry?: string, inBody?: boolean) => void} */
export function addError(el, expression, error, message, userEntry, inBody = true) {
  if (el.type !== 'text') el.attribs.tagel = 'error'
  errors.add({ el, expression, error, message, userEntry, inBody })
}


/** @param {html.domhandler.Document} doc */
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
  const tagelErrors = html.qs(tagelErrorsElement, o => o.attribs.id === 'tagel-errors-output')
  if (!tagelErrors) throw Error('error in insertAdjacentHTML with element with id="tagel-error"')
  for (const error of errors) {
    console.log('[binding error]', error.expression, error.message ?? '')
    html.insertAdjacentHTML(tagelErrors, 'beforeend', /*html*/`
      ${error.expression} ${error.message ?? ''}
    `.trim() + '\n')
    if (error.el.type === 'text') {
      if (error.userEntry) {
        const [before, after] = error.el.data.split(error.userEntry)
        if (error.inBody) {
          const textErrorEl = html.createElement('span')
          html.innerHTML(textErrorEl, highlightError(error.expression))
          html.insertBefore(textErrorEl, error.el)
          html.insertTextBefore(textErrorEl, before)
          html.insertTextBefore(error.el, after)
          html.detachNode(error.el)
        } else {
          error.el.data = before + after
        }
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
