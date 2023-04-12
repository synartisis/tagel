import * as html from 'syn-html-parser'
import { setContext } from '../context.js'
import { showErrors, clearErrors } from '../errors.js'
import { tgElementsHandler } from './tg-element.js'

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'


/**
 * applies tagel engine to source
 * @type {(source: string, filename: string, context: any) => Promise<string>}
 */
export async function applyTagel(source, filename, context = {}) {
  clearErrors()
  const doc = html.parseHtml(source)
  const lang = applyLang(doc, context)
  context.env = env

  setContext(doc, context)
  await tgElementsHandler(doc, { filename, lang, toDetach: [] })

  if (env === 'development') showErrors(doc)
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
