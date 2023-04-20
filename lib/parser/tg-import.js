import * as path from 'node:path'
import * as fs from 'node:fs/promises'
import * as html from 'syn-html-parser'
import { addError } from '../errors.js'


/** 
 * imports html partials
 * @type {(el: html.Element, state: tagel.State) => Promise<void>}
 * */
export async function tgImportElement(el, state) {
  if (state.toDetach.includes(el)) return
  if (!(el.tagName === 'link' && html.getAttribute(el, 'rel') === 'import' && !!html.getAttribute(el, 'href'))) return
  const partial = await loadPartial(el, state.filename)
  if (!partial.href || !partial.content) return
  const fragment = html.parseFragment(partial.content, el.parentNode ?? undefined)
  const partialDir = path.dirname(partial.href)
  rewritePartial(fragment, partialDir)
  /** @type {html.ChildNode} */
  let lastNode = el
  fragment.childNodes.forEach(child => {
    html.insertAfter(child, lastNode)
    lastNode = child
  })
  state.toDetach.push(el)
}


/** @type {(el: html.Element, filename: string) => Promise<{href: string | undefined, content: string | undefined}>} */
async function loadPartial(el, filename) {
  const dirname = path.dirname(filename)
  const href = html.getAttribute(el, 'href')
  let content
  if (href) {
    const partialPath = path.join(dirname, href)
    try {
      content = await fs.readFile(partialPath, 'utf-8')
    } catch (/**@type {any}*/error) {
      if (error?.code === 'ENOENT') {
        addError({ el, expression: href, message: `cannot find ${path.relative('.', partialPath)} referenced by ${path.relative('.', filename)} (${href})`, error })
      } else {
        throw error
      }
    }
  }
  return { href, content }
}


/** @type {(fragment: html.Document | html.Element | html.DocumentFragment, relPath: string) => void} */
function rewritePartial(fragment, relPath) {
  const refs = html.qsa(fragment, el => ['script', 'link', 'img', 'a'].includes(el.tagName))
  for (const el of refs) {
    const attrs = html.getAttributes(el)
    if (el.tagName === 'script' && !attrs['src']) continue
    if (el.tagName === 'link' && attrs['rel'] !== 'stylesheet' && attrs['rel'] !== 'import' && !attrs['rel']?.includes('icon')) continue
    if (el.tagName === 'img' && !attrs['src']) continue
    if (el.tagName === 'a' && !attrs['href']) continue
    const attrName = 'src' in attrs ? 'src' : 'href'
    const uri = attrs[attrName]
    if (!uri) continue
    const [ref, query] = uri.split('?')
    if (ref === '' || ref.startsWith('/') || ref.startsWith('#') || ref.includes('//')) continue  // if its an absolute url or only query or only hash, leave it alone
    let refNew = path.join(relPath, ref)
    if (query) refNew += '?' + query
    html.setAttribute(el, attrName, refNew)
  }
}
