import * as html from '@synartisis/htmlparser'
import { tgImportElement } from './tg-import.js'
import { tgLangElement } from './tg-lang.js'
import { tgIfElement } from './tg-if.js'
import { tgForElement } from './tg-for.js'
import { tgBindElement } from './tg-bind.js'



// /** @type {(doc: html.domhandler.Document) => Promise<number>} */
// export async function applyTgElements(doc) {
//   const nodes = html.findAll(doc, node => node.type === 'tag' || node.type === 'script' || node.type === 'style' || node.type === 'text')
//   for await (const node of nodes) {
//     if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {

//     }
//   }
  
// }
let cnt=0
const pendingElements = []
let filenameCached = ''

/** @type {(treeRoot: html.domhandler.Document | html.domhandler.Element, filename?: string) => Promise<void>} */
export async function tgElementTree(treeRoot, filename) {
if (treeRoot?.type === 'root') cnt=0
  if (filename) {
    filenameCached = filename
  } else {
    filename = filenameCached
  }
  const nodes = html.findAll(treeRoot, node => node.type === 'tag' || node.type === 'script' || node.type === 'style' || node.type === 'text')
  // const nodes = html.findAll(treeRoot, node => true)
  for await (const node of nodes) {
    cnt++
    if (node.type === 'tag' || node.type === 'script' || node.type === 'style') {
      await tgElement(node, filename)
    }
    if (node.type === 'text') {
      await tgText(node)
    }
  }
  console.log(cnt, pendingElements.length)
}


/** @type {(el: html.domhandler.Element, filename: string) => Promise<void>} */
async function tgElement(el, filename) {
  await tgImportElement(el, filename)
  await tgLangElement(el)
  await tgIfElement(el)
  await tgForElement(el)
  await tgBindElement(el)
}


/** @type {(el: html.domhandler.Text) => Promise<void>} */
async function tgText(el) {

}