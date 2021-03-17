import path from 'path'
import { readFile } from 'fs/promises'
import * as parse5 from './parse5.js'


export async function applyTagel(doc, filename, partials, tgContext) {
  await tgImport(doc, filename, partials)
  await tgEnv(doc, process.env.NODE_ENV === 'production' ? 'production' : 'development')
  await tgBind(doc, tgContext)
  await tgIf(doc, tgContext)
  await tgFor(doc, tgContext)
  await tgLang(doc, tgContext)
}



async function tgImport(doc, filename, partials) {
  const refs = parse5.qsa(doc, el => el.name === 'link' && el.attribs['rel'] === 'import')
  await Promise.all(
    refs.map(async el => {
      const { href } = el.attribs
      const partialPath = path.join(path.dirname(filename), href)
      partials[partialPath] = { type: 'dev-dep' }
      const partialContent = (await readFile(partialPath)).toString()
      const partialDoc = parse5.parseFragment(partialContent)
      const partialDir = path.dirname(href)
      await rewritePartials(partialDoc, partialDir)
      partialDoc.children.forEach(child => parse5.insertBefore(child, el))
      parse5.remove(el)
    })
  )
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



async function rewritePartials(doc, relPath) {
  const partialRefs = parse5.qsa(doc, el => [ 'script', 'link', 'img', 'a' ].includes(el.name))
  await Promise.all(
    partialRefs.map(async el => {
      if (el.name === 'script' && !el.attribs['src']) return
      if (el.name === 'link' && el.attribs['rel'] !== 'stylesheet' && !el.attribs['rel'].includes('icon')) return
      if (el.name === 'img' && !el.attribs['src']) return
      if (el.name === 'a' && !el.attribs['href']) return
      const attr = 'src' in el.attribs ? 'src' : 'href'
      const uri = el.attribs[attr]
      const ref = uri && uri.split('?')[0]
      // console.log(el.name, {uri,ref})
      if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/')) return
      const refNew = path.join(relPath, ref)
      // console.log('--', refNew, relPath)
      el.attribs[attr] = refNew
    })
  )    
}