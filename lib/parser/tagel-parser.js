import * as html from 'syn-html-parser'
import { setContext } from '../context.js'
import { showErrors } from '../errors.js'
import { tgElementsHandler } from './tg-element.js'


/**
 * applies tagel engine to source
 * @type {(source: string, filename: string, context: any) => Promise<string>}
 */
export async function applyTagel(source, filename, context = {}) {
  const doc = html.parseHtml(source)
  const lang = applyLang(doc, context)

  const state = { filename, lang, toDetach: [] }
  setContext(doc, context)
  await tgElementsHandler(doc, state)

  showErrors(doc)
  state.toDetach.forEach(html.detachNode)
  return html.serialize(doc)
}



/** @type {(doc: html.Document, context: any) => string} */
function applyLang(doc, context) {
  const htmlTag = html.qs(doc, el => el.tagName === 'html')
  if (htmlTag) {
    if (context.lang) {
      html.setAttribute(htmlTag, 'lang', context.lang)
    } else {
      context.lang = html.getAttribute(htmlTag, 'lang')
    }
  }
  return context.lang
}
