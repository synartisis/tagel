import path from 'path'
import { readFile, stat } from 'fs/promises'
import * as parse5 from './parse5.js'
import { applyTagel } from './tagel-parser.js'


export function tagelExpress(root, {} = {}) {
  return async (req, res, next) => {
    const { filename, content } = await readFileContent(root, req.url)
    if (content !== undefined) {
      const doc = parse5.parseHtml(content)
      await applyTagel(doc, filename, {}, req.weboContext)
      return res.send(parse5.serialize(doc))
    }
    return next()
  }
}



async function readFileContent(root, url) {
  const fileUrl = url.split('?')[0]
  const filename = path.join(root, fileUrl)
  const fileext = filename.split('/').pop().split('.').pop()
  if (fileext === '') {
    const filestat = await stat(filename)
    if (filestat.isDirectory()) return readFileContent(root, path.join(url, 'index.html'))
  }
  if (fileext === 'html') {
    return { filename, content: await readFile(filename, 'utf-8') }
  }
  return {}
}
