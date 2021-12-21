import * as parse5 from '../parse5.js'
import { tgEnv } from './tg-env.js'
import { tgIf } from './tg-if.js'
import { tgImport } from './tg-import.js'
import { tgFor } from './tg-for.js'
import { tgLang } from './tg-lang.js'
import { tgBind } from './tg-bind.js'
import { showErrors } from '../utils.js'

const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const LOOP_THRESHOLD = 30


/**
 * applies tagel engine to a parse5 dom
 * @param {tagel.Element} root the root element
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
    changes += await tgIf(root)
    changes += await tgImport(root, filename)
    changes += await tgFor(root)
    changes += await tgLang(root, lang)
    changes += await tgBind(root)
    
    console.log({changes})
  } while (changes > 0 && loops < LOOP_THRESHOLD)
  console.log({loops, lang})


  handleErrors(root)
}


function handleErrors(doc) {
  const errorRefs = parse5.qsa(doc, el => !!el.$tagelError)
  if (errorRefs.length) {
    const errors = errorRefs.map(ref => ref.$tagelError)
    if (env === 'development') showErrors(doc, errors)
    errors.forEach(err => console.error('[tagel template error]', err))
  }
}


function applyLang(doc, context) {
  let { lang } = context
  const htmlTag = parse5.qs(doc, el => el.name === 'html')
  if (htmlTag) {
    if (lang) {
      htmlTag.attribs['lang'] = lang
    } else {
      lang = htmlTag.attribs['lang']
    }
  }
  return lang
}




// export async function applyTagelToElement(el, tgContext, { recursive = false } = {}) {
//   if (el.$context) tgContext = el.$context
//   if (el.name === 'link' && el.attribs?.['rel'] === 'import') await tgImport(el, tgContext);
//   if (tgContext.$tagel.lang && el.attribs?.['lang']) await tgLang(el, tgContext.$tagel.lang)
//   if (el.attribs?.['tg-env']) await tgEnv(el, env)
//   if (el.attribs?.['tg-if']) await tgIf(el, tgContext)
//   if (el.attribs?.['tg-for']) await tgFor(el, tgContext)
//   if (recursive && !el.$remove) {
//     if (el.children) {
//       for await (const child of el.children) {
//         await applyTagelToElement(child, tgContext, { recursive })
//       }
//     }
//   }
//   if (el.$remove) parse5.remove(el)
// }
