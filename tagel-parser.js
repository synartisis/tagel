import path from 'path'
import { readFile } from 'fs/promises'
import * as parse5 from './parse5.js'


export async function applyTagel(doc, filename, partials, weboContext) {
  await weboInclude(doc, filename, partials)
  await weboEnv(doc, process.env.NODE_ENV === 'production' ? 'production' : 'development')
  await weboBind(doc, weboContext)
  await weboIf(doc, weboContext)
  await weboFor(doc, weboContext)
  await weboLang(doc, weboContext)
}



async function weboInclude(doc, filename, partials) {
  const refs = parse5.qsa(doc, el => el.name === 'link' && el.attribs['rel'] === 'webo-include')
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

async function weboEnv(doc, currentEnv) {
  const els = parse5.qsa(doc, el => el.attribs && 'webo-env' in el.attribs)
  await Promise.all(
    els.map(el => {
      if (el.attribs['webo-env'] !== currentEnv) {
        parse5.remove(el)
      } else {
        delete el.attribs['webo-env']
      }
    })
  )
}

async function weboBind(doc, weboContext) {
  // console.log({weboContext})
  if (!weboContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'webo-bind' in el.attribs)
  await Promise.all(
    els.map(el => {
      const varName = el.attribs['webo-bind']
      const value = weboContext[varName]
      // delete el.attribs['webo-bind']
      if (value != null) {
        const content = parse5.createTextNode(value)
        parse5.append(el, content)
      }
    })
  )
}

async function weboIf(doc, weboContext) {
  if (!weboContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'webo-if' in el.attribs)
  await Promise.all(
    els.map(el => {
      const property = el.attribs['webo-if']
      if (property in weboContext) {
        const value = weboContext[property]
        if (!value) el.attribs['hidden'] = ''
        // delete el.attribs['webo-if']
        // if (!value) parse5.remove(el)
      } else {
        console.error(`[webo-if] value for property "${property}" not found`)
      }
    })
  )
}

async function weboFor(doc, weboContext) {
  if (!weboContext) return
  const els = parse5.qsa(doc, el => el.attribs && 'webo-for' in el.attribs)
  await Promise.all(
    els.map(async el => {
      const property = el.attribs['webo-for']
      if (property in weboContext) {
        const value = weboContext[property]
        if (!Array.isArray(value)) {
          console.error(`[webo-for] value for property "${property}" is not array`)
          return
        }
        let lastEl = el
        for (const [$index, $item] of value.entries()) {
          // console.log({$item, $index})
          const itemTemplate = parse5.clone(el)
          itemTemplate.attribs['check'] = String($index)
          await weboBind(itemTemplate, $item)
          parse5.insertAfter(itemTemplate, lastEl)
          lastEl = itemTemplate
        }
        parse5.remove(el)
      } else {
        console.error(`[webo-for] value for property "${property}" not found`)
      }
    })
  )
}

async function weboLang(doc, weboContext) {
  const htmlTag = parse5.qs(doc, el => el.name === 'html')
  if (!htmlTag) return
  if (weboContext.lang) {
    htmlTag.attribs['lang'] = weboContext.lang
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
      if (!ref) console.log(el)
      console.log(el.name, {uri,ref})
      if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/')) return
      const refNew = path.join(relPath, ref)
      console.log('--', refNew, relPath)
      el.attribs[attr] = refNew
    })
  )    
}