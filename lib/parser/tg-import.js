import path from 'node:path'
import fs from 'node:fs/promises'
import * as html from '@synartisis/htmlparser'
import { addError } from '../errors.js'


/**
 * imports html partials
 * @type {(root: html.domhandler.Document | html.domhandler.Element, filename: string) => Promise<number>}
 */
export async function tgImport(root, filename) {
  const refs = html.qsa(root, el => el.name === 'link' && el.attribs['rel'] === 'import' && !!el.attribs['href'])
  const partials = await Promise.all(refs.map(ref => loadPartials(ref, filename)))
  for (const partial of partials) {
    if (!partial.content) continue
    let refParent = partial.ref.parent
    const partialDoc = html.parseFragment(partial.content, refParent)
    const partialDir = path.dirname(partial.href)
    rewritePartials(partialDoc, partialDir)
    partialDoc.children.forEach(child => {
      html.insertBefore(child, partial.ref)
    })
    html.detachNode(partial.ref)
  }
  return refs.length
}


/** @type {(ref: html.domhandler.Element, filename: string) => Promise<{ref: html.domhandler.Element, href: string, content: string | undefined}>} */
async function loadPartials(ref, filename) {
  const dirname = path.dirname(filename)
  const href = ref.attribs['href']
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


/** @type {(doc: html.domhandler.Document | html.domhandler.Element, relPath: string) => void} */
function rewritePartials(doc, relPath) {
  const partialRefs = html.qsa(doc, el => ['script', 'link', 'img', 'a'].includes(el.name))
  partialRefs.map(async el => {
    if (el.name === 'script' && !el.attribs['src']) return
    if (el.name === 'link' && el.attribs['rel'] !== 'stylesheet' && el.attribs['rel'] !== 'import' && !el.attribs['rel'].includes('icon')) return
    if (el.name === 'img' && !el.attribs['src']) return
    if (el.name === 'a' && !el.attribs['href']) return
    const attr = 'src' in el.attribs ? 'src' : 'href'
    const uri = el.attribs[attr]
    const [ref, query] = uri && uri.split('?')
    if (ref === '' || ref.startsWith('/') || ref.split('/')[0].includes(':')) return  // if its an absolute url or only query, leave it alone
    let refNew = path.join(relPath, ref)
    if (query) refNew += '?' + query
    el.attribs[attr] = refNew
  })
}
