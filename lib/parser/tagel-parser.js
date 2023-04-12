import * as html from 'syn-html-parser'
import { tgImport } from './tg-import.js'
import { tgLang } from './tg-lang.js'
import { tgFor } from './tg-for.js'
import { tgIf } from './tg-if.js'
import { tgBind } from './tg-bind.js'
import { bracketsBind } from './bracket-binding.js'
import { setContext } from '../context.js'
import { showErrors, clearErrors } from '../errors.js'
import { tgElementsHandler } from './tg-element.js'

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const LOOP_THRESHOLD = 30

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


/**
 * applies tagel engine to source
 * @type {(source: string, filename: string, context: any) => Promise<string>}
 */
export async function applyTagel_Loop(source, filename, context = {}) {

  clearErrors()
  const doc = html.parseHtml(source)
  const lang = applyLang(doc, context)
  context.env = env

  setContext(doc, context)
  let loops = 0
  let changes
  do {
    loops += 1
    changes = 0

    changes += await tgIf(doc)
    changes += await tgImport(doc, filename)
    changes += await tgLang(doc, lang)
    changes += await tgFor(doc)
    changes += await tgBind(doc)
    
    // console.debug({changes})
  } while (changes > 0 && loops < LOOP_THRESHOLD)
  // console.debug({ loops })

  bracketsBind(doc)

  if (env === 'development') showErrors(doc)

  return html.serialize(doc)

}



/** @type {(doc: html.Document, context: any) => string} */
function applyLang(doc, context) {
  const htmlTag = html.qs(doc, el => el.tagName === 'html')
  if (htmlTag) {
    if (context.lang) {
      const langAttr = htmlTag.attrs.find(o => o.name === 'lang')
      if (langAttr) {
        langAttr.value = context.lang
      } else {
        htmlTag.attrs.push({ name: 'lang', value: context.lang })
      }
    } else {
      context.lang = html.getAttributes(htmlTag)['lang']
    }
  }
  return context.lang
}
