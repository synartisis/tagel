support dynamic content
  new Function('ctx', s.includes(' return ') ? s : 'return ' + s)({ a:1, b: 2 })

