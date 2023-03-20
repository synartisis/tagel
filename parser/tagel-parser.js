import * as htmlParser from '../html-parser.js'
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
 * applies tagel engine to a parse5 dom
 * @param {tagel.Node} root the root element
 * @param {string} filename the filename
 * @param {object} context tagel context
 */
export async function applyTagel(root, filename, context = {}) {

  const lang = applyLang(root, context)

  root.$context = context

  let loops = 0
  let changes
  do {
    loops += 1
    changes = 0

    changes += await tgEnv(root, env)
    changes += await tgImport(root, filename)
    changes += await tgLang(root, lang)
    changes += await tgFor(root)
    changes += await tgIf(root)
    changes += await tgBind(root)
    
    // console.debug({changes})
  } while (changes > 0 && loops < LOOP_THRESHOLD)
  // console.debug({ loops })

  handleErrors(root)
}


function handleErrors(/** @type {tagel.Node} */doc) {
  const errorRefs = htmlParser.qsa(doc, el => !!el.$tagelError)
  if (!errorRefs.length) return 
  const errors = errorRefs.map(ref => ref.$tagelError || '')
  if (errors && env === 'development') showErrors(doc, errors)
  errors.forEach(err => console.error('[tagel error]', err))
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
