import * as html from '@synartisis/htmlparser'
import { notTgForDescendant } from '../utils.js'
import { getContext } from '../context.js'


/**
 * removes elements with lang different than the current language
 * @param {html.domhandler.Document | html.domhandler.Element} root 
 * @param {string} lang 
 * @returns {Promise<number>}
 */
export async function tgLang(root, lang) {
  if (!root || !lang) return 0
  const refs = html.qsa(root, el => el.name !== 'html' && !!el.attribs['lang']).filter(notTgForDescendant)
  for (const el of refs) {
    await tgLangElement(el, lang)
  }
  return refs.length
}


/** @type {(el: html.domhandler.Element, lang: string) => Promise<void>} */
export async function tgLangElement(el, lang) {
  if (el.name === 'html' || !el.attribs['lang']) return
  const context = getContext(el)
  // console.log(context.lang, el.attribs['lang'])
  if (el.attribs['lang'] !== lang) {
    html.detachNode(el)
  } else {
    delete el.attribs['lang']
  }
}