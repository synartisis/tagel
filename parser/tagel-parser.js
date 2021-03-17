import * as parse5 from '../parse5.js'
import { tgImport } from './tg-import.js'


export async function applyTagel(doc, filename, root, tgContext) {
  await tgImport(doc, filename, root)
  
  await tgEnv(doc, process.env.NODE_ENV === 'production' ? 'production' : 'development')
  await tgBind(doc, tgContext)
  await tgIf(doc, tgContext)
  await tgFor(doc, tgContext)
  await tgLang(doc, tgContext)
}






async function tgEnv(doc, currentEnv) {
  const els = parse5.qsa(doc, el => el.attribs && 'tg-env' in el.attribs)
  await Promise.all(
    els.map(el => {
      if (el.attribs['tg-env'] !== currentEnv) {
        parse5.remove(el)
      } else {
        delete el.attribs['tg-env']
      }
    })
  )
}

async function tgBind(doc, tgContext) {
  // console.log({tgContext})
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-bind' in el.attribs)
  await Promise.all(
    els.map(el => {
      const varName = el.attribs['tg-bind']
      const value = tgContext[varName]
      // delete el.attribs['tg-bind']
      if (value != null) {
        const content = parse5.createTextNode(value)
        parse5.append(el, content)
      }
    })
  )
}

async function tgIf(doc, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-if' in el.attribs)
  await Promise.all(
    els.map(el => {
      const property = el.attribs['tg-if']
      if (property in tgContext) {
        const value = tgContext[property]
        if (!value) el.attribs['hidden'] = ''
        // delete el.attribs['tg-if']
        // if (!value) parse5.remove(el)
      } else {
        console.error(`[tg-if] value for property "${property}" not found`)
      }
    })
  )
}

async function tgFor(doc, tgContext) {
  if (!tgContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'tg-for' in el.attribs)
  await Promise.all(
    els.map(async el => {
      const property = el.attribs['tg-for']
      if (property in tgContext) {
        const value = tgContext[property]
        if (!Array.isArray(value)) {
          console.error(`[tg-for] value for property "${property}" is not array`)
          return
        }
        let lastEl = el
        for (const [$index, $item] of value.entries()) {
          // console.log({$item, $index})
          const itemTemplate = parse5.clone(el)
          itemTemplate.attribs['check'] = String($index)
          await tgBind(itemTemplate, $item)
          parse5.insertAfter(itemTemplate, lastEl)
          lastEl = itemTemplate
        }
        parse5.remove(el)
      } else {
        console.error(`[tg-for] value for property "${property}" not found`)
      }
    })
  )
}

async function tgLang(doc, tgContext) {
  const htmlTag = parse5.qs(doc, el => el.name === 'html')
  if (!htmlTag) return
  if (tgContext.lang) {
    htmlTag.attribs['lang'] = tgContext.lang
  }
  const lang = htmlTag.attribs['lang']
  const els = parse5.qsa(doc, el => el.attribs && 'lang' in el.attribs && el.attribs['lang'] !== lang)
  await Promise.all(
    els.map(el => {
      parse5.remove(el)
    })
  )
}

