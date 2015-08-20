# metalsmith-broken-link-checker

Metalsmith plugin to check for internal broken links

## About

Small typos can often result in *unexpected* broken links. This plugin aims to catch them as early as possible.

It checks for *relative* and *root-relative* links which do not have a corresponding file in the Metalsmith pipeline. It (currently) ignores all *absolute* links.

Any broken links will cause an `Error` to be thrown (or a warning to be printed if `options.warn` is set). 

By default, all `href` attributes of `<a>` tags and all `src` attributes of `<img>` tags are checked. 

This plugin uses [cheerio](https://www.npmjs.com/package/cheerio) to find link and image tags and [URIjs](https://www.npmjs.com/package/URIjs) to manipulate URLs. 

I also wrote a [blog post about what I learned developing this plugin](https://davidxmoody.com/publishing-my-first-npm-package/).

## Example

In your Metalsmith source dir, you have the following file (`dir1/test-file.html`):

```html
<!DOCTYPE html>
<html>
<body>

  <a href="/a.html">(Root-relative link) Error if 'a.html' not in files</a>

  <a href="a.html">(Relative link) Error if 'dir1/a.html' not in files</a>
  <a href="./a.html">(Relative link) Error if 'dir1/a.html' not in files</a>
  <a href="../a.html">(Relative link) Error if 'a.html' not in files</a>

  <a href="/">(Root-relative link to dir) Error if 'index.html' not in files</a>
  <a href="dir2/">(Relative link to dir) Error if 'dir1/dir2/index.html' not in files</a>

  <a href="#fragment">(Hash fragment link) Always valid</a>
  <a href="/dir2/#fragment">(Hash fragment link) Error if 'dir2/index.html' not in files</a>

  <a>Missing href attribute, always broken</a>

  <img src="testimg.jpg" alt="(Relative link) Error if 'dir1/testimg.jpg' not in files">
  <img src="/testimg.jpg" alt="(Root-relative link) Error if 'testimg.jpg' not in files">

</body>
</html>
```

Note that links to directories are allowed if they have a trailing slash (the `index.html` file will be looked for). However links to directories without a trailing slash are not allowed (even if they may redirect to the correct URL). 

## Installation

```
$ npm install --save metalsmith-broken-link-checker
```

## CLI Usage

In `metalsmith.json`:

```javascript
{
  "source": "src",
  "destination": "build",
  "plugins": {
    "metalsmith-broken-link-checker": true
  }
}
```

## JavaScript Usage

```javascript
var Metalsmith = require('metalsmith')
var blc = require('metalsmith-broken-link-checker')

Metalsmith(__dirname)

  // Build your full site here...

  .use(blc(options))

  .build()
```

### Options

#### `allowRegex` (optional)

( default: *null* )

- Optional regex gets matched against every found URL
- Use it if you want to allow some specific URLs which would otherwise get recognised as broken

#### `allowAnchors` (optional)

( default: *true* )

- An anchor is an `<a>` tag with a `name` attribute but no `href` attribute (used for jumping to elements on a page with hash fragments)
- For example, with `allowAnchors` set to `true`, the following would be allowed: `<a name="anchor">Anchor text</a>`

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

## History

- 0.1.5
    - Add allowAnchors option
- 0.1.4
    - Normalize file paths for Windows
- 0.1.3
    - Fail in the correct way for missing href attribute
- 0.1.2
    - Updated README
- 0.1.1
    - Updated README
- 0.1.0
    - First release
