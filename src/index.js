const isLinkBroken = require("./is-link-broken")
const extractLinks = require("./extract-links")
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

module.exports = (options) => {

  if (options == null) { options = {} }
  if (options === true) { options = {} } // Allow CLI to specify true
  if (options.warn == null) { options.warn = false }
  if (options.checkLinks == null) { options.checkLinks = true }
  if (options.checkImages == null) { options.checkImages = true }
  if (options.allowRegex == null) { options.allowRegex = null }
  if (options.allowAnchors == null) { options.allowAnchors = true }
  if (options.baseURL == null) { options.baseURL = null }

  return (files) => {
    const allFilenames = Object.keys(files)
    const htmlFilenames = allFilenames.filter(isHTML)

    const allLinks = htmlFilenames.reduce((acc, filename) => {
      const html = files[filename].contents.toString()
      const linksInFile = extractLinks({html, filename, options})
      return acc.concat(linksInFile)
    }, [])

    allLinks.forEach((link) => {
      const broken = isLinkBroken({
        files,
        fileExists,
        link,
        options,
      })

      if (broken) {
        if (options.warn) {
          console.log(`Warning: Link is broken: ${link.description}, in file: ${link.filename}`)
        } else {
          throw new Error(`Link is broken: ${link.description}, in file: ${link.filename}`)
        }
      }
    })
  }
}
