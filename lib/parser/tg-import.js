import path from 'node:path'
import fs from 'node:fs/promises'
import * as html from 'syn-html-parser'
import { addError } from '../errors.js'


/**
 * imports html partials
 * @type {(root: html.Document | html.Element, filename: string) => Promise<number>}
 */
export async function tgImport(root, filename) {
  const refs = html.qsa(root, el => {
    const attrs = html.getAttributes(el)
    return el.tagName === 'link' && attrs['rel'] === 'import' && !!attrs['href'] && !attrs['tagel']
  })
  const partials = await Promise.all(refs.map(ref => loadPartial(ref, filename)))
  for (const partial of partials) {
    if (!partial.content) continue
    let refParent = partial.ref.parentNode
    const partialDoc = html.parseFragment(partial.content, refParent)
    const partialDir = path.dirname(partial.href)
    rewritePartials(partialDoc, partialDir)
    partialDoc.childNodes.forEach(child => {
      html.insertBefore(child, partial.ref)
    })
    html.detachNode(partial.ref)
  }
  return refs.length
}


/** @type {(el: html.Element, attrs: any, state: tagel.State) => Promise<void>} */
export async function tgImportElement(el, attrs, state) {
  if (state.toDetach.includes(el)) return
  if (!(el.tagName === 'link' && attrs['rel'] === 'import' && !!attrs['href'] && !attrs['tagel'])) return
  const partial = await loadPartial(el, state.filename)
  if (!partial.content) return
  let refParent = partial.ref.parentNode
  const partialDoc = html.parseFragment(partial.content, refParent)
  const partialDir = path.dirname(partial.href)
  rewritePartials(partialDoc, partialDir)
  /** @type {html.ChildNode} */
  let lastNode = partial.ref
  partialDoc.childNodes.forEach(child => {
    html.insertAfter(child, lastNode)
    lastNode = child
  })
  state.toDetach.push(partial.ref)
  // html.detachNode(partial.ref)
}


/** @type {(ref: html.Element, filename: string) => Promise<{ref: html.Element, href: string, content: string | undefined}>} */
async function loadPartial(ref, filename) {
  const dirname = path.dirname(filename)
  const href = ref.attrs.find(o => o.name === 'href')?.value ?? ''
  let content
  if (href) {
    const partialPath = path.join(dirname, href)
    try {
      content = await fs.readFile(partialPath, 'utf-8')
    } catch (/**@type {any}*/error) {
      if (error?.code === 'ENOENT') {
        addError(ref, href, error, `cannot find ${path.relative('.', partialPath)} referenced by ${path.relative('.', filename)} (${href})`)
      } else {
        throw error
      }
    }
  }
  return { ref, href, content }
}


/** @type {(doc: html.Document | html.Element | html.DocumentFragment, relPath: string) => void} */
function rewritePartials(doc, relPath) {
  const partialRefs = html.qsa(doc, el => ['script', 'link', 'img', 'a'].includes(el.tagName))
  partialRefs.map(async el => {
    const attrs = html.getAttributes(el)
    if (el.tagName === 'script' && !attrs['src']) return
    if (el.tagName === 'link' && attrs['rel'] !== 'stylesheet' && attrs['rel'] !== 'import' && !attrs['rel']?.includes('icon')) return
    if (el.tagName === 'img' && !attrs['src']) return
    if (el.tagName === 'a' && !attrs['href']) return
    const attrName = 'src' in attrs ? 'src' : 'href'
    const uri = attrs[attrName]
    if (!uri) return
    const [ref, query] = uri && uri.split('?')
    if (ref === '' || ref.startsWith('/') || ref.split('/')[0].includes(':')) return  // if its an absolute url or only query, leave it alone
    let refNew = path.join(relPath, ref)
    if (query) refNew += '?' + query
    const attr = el.attrs.find(o => o.name === attrName)
    if (attr) {
      attr.value = refNew
    }
  })
}
