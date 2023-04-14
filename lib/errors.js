import * as html from 'syn-html-parser'

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'

/** @type {tagel.ErrorEntry[]} */
const errors = []

export function clearErrors() {
  errors.length = 0
}

/** @param {{ el: html.Element | html.TextNode , expression: string, message?: string, error?: any }} errorEntry */
export function addError({ el, expression, message, error }) {
  if (env !== 'development') return
  const errorId = `error${Math.round(Math.random() * 10000)}`
  const existing = errors.find(o => o.expression === expression && o.message === message)
  const content = html.serializeOuter(el).split('\n')[0]
  if (!existing) {
    errors.push({ instances: [{ element: el, errorId, content }], expression, message, error  })
  } else {
    existing.instances.push({ element: el, errorId, content })
  }
}

/** @param {html.Document} doc */
export function showErrors(doc) {
  if (errors.length === 0) return
  const head = html.documentHead(doc)
  const body = html.documentHead(doc)
  if (!head || !body) return
  html.insertAdjacentHTML(head, 'beforeend', /*html*/`
    <style id="tagel-errors-styles">
      #tagel-errors-viewer * { all: unset; transition: all .2s; }
      #tagel-errors-viewer :is(header, div, a) { display: block; }
      #tagel-errors-viewer { position: fixed; bottom: 0; color: #b70012; background: #efd0d3cc; border: solid 1px; z-index: 1; }
      #tagel-errors-viewer header { background: #b70012; color: white; padding: .2rem 1rem; }
      #tagel-errors-viewer > #tagel-errors-viewer-close { position: absolute; top: -10px; right: -10px; border-radius: 50%; 
        cursor: pointer; width: 24px; height: 24px; text-align: center; border: solid 1px; background: #b70012; color: white; }
      #tagel-errors-viewer > #tagel-errors-viewer-close:hover { color: #b70012; background: white; }
      #tagel-errors-viewer > #tagel-errors-viewer-output { padding: .5rem 0;  }
      #tagel-errors-viewer > #tagel-errors-viewer-output > a { padding: .3rem 1rem; cursor: pointer; margin-bottom: 6px; user-select: text; }
      #tagel-errors-viewer > #tagel-errors-viewer-output > a:hover { background: #fdabb3cc; }
      #tagel-errors-viewer > #tagel-errors-viewer-output > a > div { margin-bottom: 4px; }
      #tagel-errors-viewer > #tagel-errors-viewer-output b { font-size: small; font-weight: 600; color: #333; }
      #tagel-errors-viewer > #tagel-errors-viewer-output small { font-size: small; }
      #tagel-errors-viewer > #tagel-errors-viewer-output .tagel-errors-content { font-family: Consolas; font-size: small; background: #333; color: #ddd; padding: 4px 6px; }
      *:has(+ .tagel-error) { outline: #b70012 2px dashed; outline-offset: 2px; }
      .tagel-error { position: absolute; color: #b70012; border: 1px solid; background: white; padding: 3px 4px; margin-left: 6px; margin-top: -4px; }
      .tagel-error:target { background: yellow; scroll-margin-top: 40vh; }
    </style>
  `)
  const { 'tagel-errors-viewer': tagelErrorsViewer } = html.insertAdjacentHTML(body, 'beforeend', /*html*/`
    <div id="tagel-errors-viewer">
      <a id="tagel-errors-viewer-close">x</a>
      <header>binding errors</header>
      <div id="tagel-errors-viewer-output"></div>
    </div>
    <script>
      document.querySelector('#tagel-errors-viewer-close').addEventListener('click', evt => document.querySelector('#tagel-errors-viewer').style.display = 'none')
    </script>
  `)
  const tagelErrorsOutput = html.qs(tagelErrorsViewer, o => html.getAttributes(o).id === 'tagel-errors-viewer-output')
  if (!tagelErrorsOutput) throw Error('error in insertAdjacentHTML with element with id="tagel-errors-viewer"')

  for (const error of errors) {
    const { 'tagel-error-entry': entryEl } = html.insertAdjacentHTML(tagelErrorsOutput, 'beforeend', /*html*/`
      <a id="tagel-error-entry" href="#${error.instances[0].errorId}">
        <div>
          "${error.expression}" ${error.message ? `<b>${error.message}</b>` : ''} <small>${error.instances.length && '(' + error.instances.length + ')'}</small>
        </div>
        <div class="tagel-errors-content"></div>
      </a>
    `.trim() + '\n')
    if (entryEl) html.insertText(html.qs(entryEl, el => html.getAttribute(el, 'class') === 'tagel-errors-content') || entryEl, error.instances[0].content)
    for (const instance of error.instances) {
      if (isInBody(instance.element)) {
        if (html.adapter.isTextNode(instance.element)) {
          const [before, after] = instance.element.value.split(error.expression)
          if (instance.element.parentNode) {
            html.insertAdjacentHTML(instance.element.parentNode, 'afterend', highlightError(error.expression, instance.errorId))
          } else {
            instance.element.value = before + after
          }
        } else {
          if (html.adapter.isElementNode(instance.element)) {
            html.insertAdjacentHTML(instance.element, 'afterend', highlightError(error.expression, instance.errorId))
          }
        }
      }
    }
  }
  clearErrors()
}


/** @type {(expression: string, errorId: string) => string} */
export function highlightError(expression, errorId) {
  return /*html*/`<span class="tagel-error" id="${errorId}">${expression}</span>`
}


/** @type {(el: html.ChildNode) => boolean} el */
export function isInBody(el) {
  if (html.adapter.isElementNode(el) && el.tagName === 'body') return true
  if (!el.parentNode || !html.adapter.isElementNode(el.parentNode)) return false
  return isInBody(el.parentNode)
}
