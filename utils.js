import * as parse5 from './parse5.js'


export function showError(doc, message) {
  let tagelErrorEl = parse5.qs(doc, el => el.attribs?.id === 'tagel-error')
  if (!tagelErrorEl) {
    tagelErrorEl = parse5.createElement('code', { id: 'tagel-error', style: styles.error })
    parse5.append(parse5.documentBody(doc), tagelErrorEl)
  }
  const errorEl = parse5.createElement('div')
  parse5.append(errorEl, parse5.createTextNode(message))
  parse5.append(tagelErrorEl, errorEl)
}


export function showErrors(doc, errors) {
  let tagelErrorEl = parse5.qs(doc, el => el.attribs?.id === 'tagel-error')
  if (!tagelErrorEl) {
    tagelErrorEl = parse5.createElement('code', { id: 'tagel-error', style: styles.error })
    parse5.append(parse5.documentBody(doc), tagelErrorEl)
  }
  errors.forEach(error => {
    const errorEl = parse5.createElement('div')
    parse5.append(errorEl, parse5.createTextNode(error))
    parse5.append(tagelErrorEl, errorEl)
  })
}


const styles = {
  error: 'position: fixed; top: 0; width: 100vw; height: 100vh; color: #ccc; padding: 1rem; background: #000c;'
}

