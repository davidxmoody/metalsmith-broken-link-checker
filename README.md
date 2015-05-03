# metalsmith-broken-link-checker

Metalsmith plugin to check for internal broken links

## About

The purpose of this plugin is to help catch broken links before you deploy your site.

It checks for *relative* and *root-relative* broken links which reference other files in the Metalsmith pipeline. It (currently) ignores all absolute links regardless of hostname.

Any broken links will cause an `Error` to be thrown (or a warning to be printed if `options.warn` is set). 

It also checks for broken image links in 

TODO reference cheerio

TODO example section?

## Installation

```
$ npm install --save metalsmith-broken-link-checker
```

## CLI Usage

TODO?

## JavaScript Usage

```javascript
var Metalsmith = require('metalsmith')
var blc = require('metalsmith-broken-link-checker')

Metalsmith(__dirname)

  // Build your full site here...

  .use(blc())

  .build()
```

### Options

#### `allowRegex` (optional)

( default: *null* )

- Optional regex gets matched against every found URL
- Use it if you want to allow some specific URLs which would otherwise get recognised as broken

#### `checkImages` (optional)

( default: *true* )

- Specifies whether or not to check `src` attributes of `<img>` tags

#### `checkLinks` (optional)

( default: *true* )

- Specifies whether or not to check `href` attributes of `<a>` tags

#### `warn` (optional)

( default: *false* )

- If *false* then throw an `Error` when encountering the first broken link
- If *true* then print warnings to stderr for every broken link
- Useful for debugging

## History

- 0.1.0
    - First release
