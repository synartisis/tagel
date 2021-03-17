import path from 'path'
import { readFile } from 'fs/promises'
import * as parse5 from '../parse5.js'
import { showError } from '../utils.js'


export async function tgImport(doc, filename, root) {
    const refs = parse5.qsa(doc, el => el.name === 'link' && el.attribs['rel'] === 'import')
    await Promise.all(
      refs.map(async el => {
        const { href } = el.attribs
        const partialPath = path.join(path.dirname(filename), href)
        let partialContent
        try {
          partialContent = await readFile(partialPath, 'utf-8')
        } catch (error) {
          if (error.code === 'ENOENT') {
            const errorMessage = `cannot found ${path.relative(root, partialPath)} referenced by ${path.relative(root, filename)} (${href})`
            console.error(errorMessage)
            showError(doc, errorMessage)
            parse5.remove(el)
            return
          } else {
            throw error
          }
        }
        if (!partialContent) return
        const partialDoc = parse5.parseFragment(partialContent)
        const partialDir = path.dirname(href)
        await rewritePartials(partialDoc, partialDir)
        partialDoc.children.forEach(child => parse5.insertBefore(child, el))
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
        if (ref.startsWith('http://') || ref.startsWith('https://') || ref.startsWith('/')) return
        const refNew = path.join(relPath, ref)
        el.attribs[attr] = refNew
      })
    )    
  }
  