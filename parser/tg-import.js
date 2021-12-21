import path from 'node:path'
import { readFile } from 'node:fs/promises'
import * as parse5 from '../parse5.js'


/**
 * imports html partials
 * @param {tagel.Element} root 
 * @param {string} filename
 * @returns {Promise<number>}
 */
export async function tgImport(root, filename) {
  const refs = parse5.qsa(root, el => el.name === 'link' && el.attribs['rel'] === 'import')
  if (!refs.length) return 0
  const dirname = path.dirname(filename)
  const partials = await Promise.all(refs.map(
    async ref => {
      const href = ref.attribs['href']
      const partialPath = path.join(dirname, href)
      let content
      try {
        content = await readFile(partialPath, 'utf-8')
      } catch (error) {
        if (error.code === 'ENOENT') {
          const errorMessage = `cannot found ${path.relative('.', partialPath)} referenced by ${path.relative('.', filename)} (${href})`
          ref.$tagelError = errorMessage
        } else {
          throw error
        }
      }
      return { ref, href, content }
    }
  ))
  for (const partial of partials) {
    if (!partial.content) continue
    const partialDoc = parse5.parseFragment(partial.content)
    const partialDir = path.dirname(partial.href)
    rewritePartials(partialDoc, partialDir)
    let insertAfterEl = partial.ref
    partialDoc.children.forEach(child => {
      parse5.insertAfter(child, insertAfterEl)
      insertAfterEl = child
    })
    parse5.remove(partial.ref)
  }
  return refs.length
}

  

/** @type {(doc: tagel.Element, relPath: string) => void} */
function rewritePartials(doc, relPath) {
  const partialRefs = parse5.qsa(doc, el => [ 'script', 'link', 'img', 'a' ].includes(el.name))
  partialRefs.map(async el => {
    if (el.name === 'script' && !el.attribs['src']) return
    if (el.name === 'link' && el.attribs['rel'] !== 'stylesheet' && !el.attribs['rel'].includes('icon')) return
    if (el.name === 'img' && !el.attribs['src']) return
    if (el.name === 'a' && !el.attribs['href']) return
    const attr = 'src' in el.attribs ? 'src' : 'href'
    const uri = el.attribs[attr]
    const ref = uri && uri.split('?')[0]
    if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/')) return
    const refNew = path.join(relPath, ref)
    el.attribs[attr] = refNew
  })
}
