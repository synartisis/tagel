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
<div tg-for="items">
  <div tg-bind="value1"></div>
</div>
```

### tg-bind 
set the element's content to the evaluated value
```html
<div ng-bind="a_property"></div>
```

### Attribute Binding
to bind a value to an attribute, prefix attribute name with ``` tg: ```
```html
<a tg:href="a_property"></a>
```
