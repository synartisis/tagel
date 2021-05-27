import * as parse5 from '../parse5.js'
import { tgImport } from './tg-import.js'
import { tgLang } from './tg-lang.js'
import { tgEnv } from './tg-env.js'
import { tgIf } from './tg-if.js'
import { tgFor } from './tg-for.js'
import { tgBindTree } from './tg-bind.js'
import { showErrors } from '../utils.js'


export async function applyTagel(doc, filename, tgContext = {}) {
  const env = process.env.NODE_ENV === 'production' ? 'production' : 'development'
  const errors = []
  const toRemove = []
  Object.assign(tgContext, { $tagel: { env, lang: null, filename, errors, toRemove } })

  applyLang(doc, tgContext)
  // console.debug(JSON.stringify(tgContext,null,2))

  await parse5.walk(doc, el => applyTagelToElement(el, tgContext))
  await tgBindTree(doc, tgContext)

  tgContext.$tagel.toRemove.forEach(el => parse5.remove(el))
  if (errors.length) {
    if (env === 'development') showErrors(doc, errors)
    errors.forEach(err => console.error('[template error]', err))
  }

}

export async function applyTagelToElement(el, tgContext, { recursive = false } = {}) {
  if (el.name === 'link' && el.attribs?.['rel'] === 'import') { await tgImport(el, tgContext); tgContext.$tagel.toRemove.push(el) }
  if (tgContext.$tagel.lang && el.attribs?.['lang']) await tgLang(el, tgContext.$tagel.lang)
  if (el.attribs?.['tg-env']) await tgEnv(el, tgContext.$tagel.env)
  if (el.attribs?.['tg-if']) await tgIf(el, tgContext)
  if (el.attribs?.['tg-for']) await tgFor(el, tgContext)
  if (recursive && el.children) {
    for await (const child of el.children) {
      await applyTagelToElement(child, tgContext, { recursive })
    }
  }
  // await tgBind(el, tgContext)
}



function applyLang(doc, tgContext) {
  let { lang } = tgContext
  const htmlTag = parse5.qs(doc, el => el.name === 'html')
  if (htmlTag) {
    if (lang) {
      htmlTag.attribs['lang'] = lang
    } else {
      lang = htmlTag.attribs['lang']
    }
  }
  tgContext.$tagel.lang = lang
}