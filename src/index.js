const URI = require("urijs")
const cheerio = require("cheerio")
const path = require("path")

const isHTML = filename => /\.html$/.exec(filename)

function fileExists(files, filename) {
  // Remove leading slash before checking to match the Metalsmith files format
  if (filename.charAt(0) === "/") {
    filename = filename.slice(1)
  }

  // True if it exists in the files object
  if (filename in files) {
    return true
  }

  // Fallback for Windows paths
  const winPath = filename.split("/").join(path.sep)
  return winPath in files
}

class Link {
  constructor($link) {
    if ($link.is("a")) {
      this.text = $link.text()
      this.href = $link.attr("href")
      this.isAnchor = ($link.attr("name") || $link.attr("id")) && (this.href == null)

    } else if ($link.is("img")) {
      this.text = $link.attr("alt")
      this.href = $link.attr("src")
    }
  }

  isBroken(filename, files, options) {
    // Allow anchors before checking for a missing href
    if (options.allowAnchors && this.isAnchor) {
      return false
    }

    // Missing href is always broken
    if ((this.href == null)) {
      return true
    }

    const uri = URI(this.href)

    // Allow anything matching the options.allowRegex regex
    if ((options.allowRegex != null) && options.allowRegex.exec(this.href)) {
      return false
    }

    // Empty link is always broken
    if (this.href === "") {
      return true
    }

    // Allow link to '#'
    if (this.href === "#") {
      return false
    }

    // Automatically accept all external links (could change later)
    if (uri.hostname()) {
      return false
    }

    // Ignore mailto and other non-http/https links
    if (uri.protocol() && !["http", "https"].includes(uri.protocol)) {
      return false
    }

    // Allow links to elements on the same page
    if (uri.fragment() && !uri.path()) {
      return false
    }

    // Add baseURL in here so that the linkPath resolves to it in the case of
    // a relative link
    if (options.baseURL) {
      filename = path.join(options.baseURL, filename)
    }

    // Need to transform uri.path() into something Metalsmith can recognise
    const unixFilename = filename.replace(/\\/g, "/")
    let linkPath = uri.absoluteTo(unixFilename).path()

    // If baseURL then all internal links should be prefixed by it.
    if (options.baseURL) {

      // If the linkPath does not start with the baseURL then it is broken
      if (linkPath.indexOf(options.baseURL) !== 0) {
        return true
      }

      // Strip the baseURL out for checking whether the file exists in metalsmith
      linkPath = linkPath.replace(options.baseURL, "")

      // Fix bug where you were linking directly to the linkPath
      if (linkPath === "") {
        linkPath = "/"
      }
    }

    // Special case for link to root
    if (linkPath === "/") {
      return !fileExists(files, "index.html")
    }

    // Allow links to directories with a trailing slash
    if (linkPath.slice(-1) === "/") {
      linkPath += "index.html"
    }

    // Allow links to directories without a trailing slash with allowRedirects option
    if (options.allowRedirects && fileExists(files, linkPath + "/index.html")) {
      return false
    }

    return !fileExists(files, linkPath)
  }

  toString() {
    return `href: "${this.href}", text: "${this.text}"`
  }
}


module.exports = (options) => {

  let selector
  if (options == null) { options = {} }
  if (options === true) { options = {} } // Allow CLI to specify true
  if (options.warn == null) { options.warn = false }
  if (options.checkLinks == null) { options.checkLinks = true }
  if (options.checkImages == null) { options.checkImages = true }
  if (options.allowRegex == null) { options.allowRegex = null }
  if (options.allowAnchors == null) { options.allowAnchors = true }
  if (options.baseURL == null) { options.baseURL = null }

  if (options.checkLinks && options.checkImages) {
    selector = "a, img"
  } else if (options.checkLinks) {
    selector = "a"
  } else if (options.checkImages) {
    selector = "img"
  } else {
    // Check nothing so just return nop function
    return () => null
  }

  return (files) => {
    const result = []
    for (const filename in files) {

      const file = files[filename]
      if (!isHTML(filename)) { continue }

      const contents = file.contents.toString()
      const $ = cheerio.load(contents)

      result.push($(selector).each(function() {
        const link = new Link($(this))
        if (link.isBroken(filename, files, options)) {
          if (options.warn) {
            console.log(`Warning: Link is broken: ${link.toString()}, in file: ${filename}`)
          } else {
            throw new Error(`Link is broken: ${link.toString()}, in file: ${filename}`)
          }
        }
      }))
    }
    return result
  }
}
