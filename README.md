# JSD to MD

Made for profit opinionated JSDoc to Markdown converter.

## Usage

```js
var bemjsd = require('bem-jsd'),
  jsdtmd = require('jsdtmd');

jsdtmd(bemjsd(code));
```

## API

### jsdtmd Module

##### *function* ( jsdocTree ) → {String}

Converts JSDoc JSON received from [bem-jsd](http://github.com/bem/bem-jsd)
to Markdown string.

###### Parameters:

* jsdocTree {Object}<br/>
  Parsed JSDoc

###### Returns:

{String}

## Related projects:

- [bem-jsd](http://github.com/bem/bem-jsd) — wrapper for yet another JSDoc parser
- [bem-xjst](http://github.com/bem/bem-xjst) — XJST-based

## License

WTFPL

