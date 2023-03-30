import * as htmlParser from '../html-parser.js'
import { bracketBind } from './bracket-binding.js'
import { tgEnv } from './tg-env.js'
import { tgImport } from './tg-import.js'
import { tgLang } from './tg-lang.js'
import { tgFor } from './tg-for.js'
import { tgIf } from './tg-if.js'
import { tgBind } from './tg-bind.js'
import { showErrors } from '../utils.js'

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const LOOP_THRESHOLD = 30


/**
 * applies tagel engine to source
 * @type {(source: string, filename: string, context: any) => Promise<string>}
 */
export async function applyTagel(source, filename, context = {}) {

  /** @type {string[]} */
  const errors = []
  const doc = htmlParser.parseHtml(source)
  const lang = applyLang(doc, context)

  doc.$context = context
  let loops = 0
  let changes
  do {
    loops += 1
    changes = 0

    changes += await tgEnv(doc, env)
    changes += await tgImport(doc, filename, errors)
    changes += await tgLang(doc, lang)
    changes += await tgFor(doc, errors)
    changes += await tgIf(doc, errors)
    changes += await tgBind(doc, errors)
    
    // console.debug({changes})
  } while (changes > 0 && loops < LOOP_THRESHOLD)
  // console.debug({ loops })

  const contentAfterTagelTags = htmlParser.serialize(doc)
  const content = await bracketBind(contentAfterTagelTags, context, errors)

  if (errors.length > 0) {
    const contentWithErrors = handleErrors(content, errors)
    return contentWithErrors
  }

  return content
}


/** @type {(content: string, errors: string[]) => string} */
function handleErrors(content, errors) {
  const doc = htmlParser.parseHtml(content)
  if (env === 'development') showErrors(doc, errors)
  errors.forEach(err => console.error('[tagel error]', err))
  return htmlParser.serialize(doc)
}


/** @type {(doc: tagel.Node, context: any) => string} */
function applyLang(doc, context) {
  let { lang } = context
  const htmlTag = htmlParser.qs(doc, el => el.name === 'html')
  if (htmlTag && htmlTag.attribs) {
    if (lang) {
      htmlTag.attribs['lang'] = lang
    } else {
      lang = htmlTag.attribs['lang']
    }
  }
  return lang
}
