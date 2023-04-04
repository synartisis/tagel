import * as html from '@synartisis/htmlparser'
import { tgImport } from './tg-import.js'
import { tgLang } from './tg-lang.js'
import { tgFor } from './tg-for.js'
import { tgIf } from './tg-if.js'
import { tgBind } from './tg-bind.js'
import { bracketsBind } from './bracket-binding.js'
import { setContext } from '../context.js'
import { showErrors, clearErrors } from '../errors.js'

import { tgElementTree, tgElementTree1 } from './tg-element.js'
const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
const LOOP_THRESHOLD = 30

/**
 * applies tagel engine to source
 * @type {(source: string, filename: string, context: any) => Promise<string>}
 */
export async function applyTagel(source, filename, context = {}) {
global.passes=0
const d1=Date.now()
  clearErrors()
  const doc = html.parseHtml(source)

  const lang = applyLang(doc, context)
  context.env = env
  setContext(doc, context)


//   await tgElementTree1(doc, filename, lang)
//   console.log('*', global.passes, Date.now()-d1)
//   showErrors(doc)
//   return html.serialize(doc)
  


  await tgElementTree(doc, filename, lang)
console.log('*', global.passes, Date.now()-d1)
showErrors(doc)
return html.serialize(doc)



  let loops = 0
  let changes = 0
  changes += await tgLang(doc, lang)
  changes += await tgIf(doc)

  do {
    loops += 1
    changes = 0

    changes += await tgImport(doc, filename)
    changes += await tgFor(doc)
    
    console.debug({changes})
  } while (changes > 0 && loops < LOOP_THRESHOLD)
  do {
    loops += 1
    changes = 0

    changes += await tgLang(doc, lang)
    changes += await tgIf(doc)
      
    console.debug({changes})
  } while (changes > 0 && loops < LOOP_THRESHOLD)
  console.debug({ loops })
  
  changes += await tgBind(doc)
  bracketsBind(doc)
console.log('*', global.passes, Date.now()-d1)
  if (env === 'development') showErrors(doc)

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
