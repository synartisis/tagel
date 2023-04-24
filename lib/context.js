import * as html from 'syn-html-parser'


const scopes = new WeakMap
/** @type {string} */
let lang


/** @type {(el: html.ParentNode, context: any) => void} */
export function setContext(el, context) {
  scopes.set(el, context)
}


/** @type {(el: html.ParentNode) => any} */
export function getContext(el) {
  const context = scopes.get(el)
  if (context != null && typeof context === 'object') context.lang = lang
  if (context) return context
  if (html.adapter.isElementNode(el) && el.parentNode) return getContext(el.parentNode)
  return {}
}


/** @type {(expression: string, context: object) => Promise<any>} */
export async function evaluate(expression, context) {
  return new Promise((resolve, reject) => {
    try {
      const f = new Function(`
        'use strict'
        Object.getPrototypeOf({}).toString = function() {
          if ('${lang}' && Object.keys(this).includes('${lang}')) {
            return this['${lang}']
          } else {
            return JSON.stringify(this)
          }
        }
        return ${expression}
      `)
      let value = f.call(context)
      resolve(value)
    } catch (error) {
      reject(error)
    }
  })
}


/** @type {(language: string) => void} */
export function setLang(language) {
  lang = language
}