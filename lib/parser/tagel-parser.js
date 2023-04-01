import * as html from '@synartisis/htmlparser'
import { tgImport } from './tg-import.js'
import { tgLang } from './tg-lang.js'
import { tgFor } from './tg-for.js'
import { tgIf } from './tg-if.js'
import { tgBind } from './tg-bind.js'
import { bracketBind } from './bracket-binding.js'
import { setContext } from '../context.js'
import { showErrors } from '../errors.js'

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const LOOP_THRESHOLD = 30

/**
 * applies tagel engine to source
 * @type {(source: string, filename: string, context: any) => Promise<string>}
 */
export async function applyTagel(source, filename, context = {}) {

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
  const contentAfterTagelTags = html.serialize(doc)
  const content = await bracketBind(contentAfterTagelTags, context)

  const contentWithErrors = handleErrors(content)
  return contentWithErrors

  return content
}


/** @type {(content: string) => string} */
function handleErrors(content) {
  const doc = html.parseHtml(content)
  if (env === 'development') showErrors(doc)
  // if (env === 'development') showErrors(doc, errors)
  // errors.forEach(err => console.error('[tagel error]', err))
  return html.serialize(doc)
}



/** @type {(doc: html.domhandler.Document, context: any) => string} */
function applyLang(doc, context) {
  const htmlTag = html.qs(doc, el => el.name === 'html')
  if (htmlTag) {
    if (context.lang) {
      htmlTag.attribs['lang'] = context.lang
    } else {
      context.lang = htmlTag.attribs['lang']
    }
  }
  return context.lang
}
