import * as html from 'syn-html-parser'
import { notTgForDescendant } from '../utils.js'


/**
 * removes elements with lang different than the current language
 * @param {html.Document | html.Element} root 
 * @param {string} lang 
 * @returns {Promise<number>}
 */
export async function tgLang(root, lang) {
  if (!root || !lang) return 0
  const refs = html.qsa(root, el => el.tagName !== 'html' && !!el.attrs.find(o => o.name === 'lang') && notTgForDescendant(el))
  for (const el of refs) {
    const attr = el.attrs.find(o => o.name === 'tg-lang')
    if (!attr) continue
    if (attr.value !== lang) {
      html.detachNode(el)
    } else {
      el.attrs.splice(el.attrs.indexOf(attr), 1)
    }
  }
  return refs.length
}



/** @type {(el: html.Element, attrs: any, state: tagel.State) => Promise<void>} */
export async function tgLangElement(el, attrs, state) {
  if (state.toDetach.includes(el)) return
  if (el.tagName === 'html' || !attrs['lang']) return
  if (attrs['lang'] !== state.lang) {
    state.toDetach.push(el)
    // html.detachNode(el)
  }
  html.removeAttribute(el, 'lang')
}