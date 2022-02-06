# *tagel* template engine

Creates html pages using patrials (import) and applies a _context_ (binding).

## Elements and attributes

### import
imports content of template at RELATIVE_PATH and rewrites paths
```html
<link rel="import" href="RELATIVE_PATH">
```


### lang
reads lang from ```html``` tag and removes all elements with a lang attribute that doesn't match
```html
<html lang="en">
...
  <div lang="fr">...</div> <!-- will be removed -->

```

### tg-env
removes elements having tg-env attribute that doesn's match process.env.NODE_ENV
```html
<div tg-env="development"></div>
```

### tg-if
if tg-if attribute value is falsy, it removes the element
```html
<div tg-if="something_falsy">
  ...
</div>
```

### tg-for
attribute value must be an array. It repeats the element (and subtree) and binds values based on array item
```html
<div tg-for="this.items">
  <div tg-bind="this.property1"></div>
</div>
```

### tg-text 
set the element's content to the evaluated value (textContent)
```html
<div tg-text="this.textProperty"></div>
```

### tg-html 
set the element's inner html tree to the evaluated value (innerHTML)
```html
<div tg-html="this.htmlProperty"></div>
```

### tg-bind 
replaces element with the evaluated value
```html
<div tg-bind="this.property"></div>
```

### Attribute Binding
to bind a value to an attribute, prefix attribute name with ``` tg: ```
```html
<a tg:href="this.imageUrl">...</a>
```
