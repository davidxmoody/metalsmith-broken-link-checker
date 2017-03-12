const normalizeFiles = require("./normalize-files")
const isLinkBroken = require("./is-link-broken")
const extractLinks = require("./extract-links")
const path = require("path")

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
    const normalized = normalizeFiles(files)

    const allLinks = Object.keys(normalized).reduce((acc, filename) => {
      const html = normalized[filename]
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
