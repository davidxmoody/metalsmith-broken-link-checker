const {assoc, filter, mapObjIndexed, map, values, flatten, pipe} = require("ramda")
const addFilenameToLinks = require("./add-filename-to-links")
const getFileContents = require("./get-file-contents")
const pickHtmlFiles = require("./pick-html-files")
const shouldCheckLink = require("./should-check-link")
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
    // const normalized = normalizeFiles(files)
    const normalized = files

    pipe(
      pickHtmlFiles,
      map(getFileContents),
      map(extractLinks),
      mapObjIndexed(addFilenameToLinks),
      values,
      flatten,
      filter(shouldCheckLink(options)),
      map(addBrokenStatus(files, fileExists, options)),
      handleLinks(options)
    )(normalized)
  }
}

function addBrokenStatus(files, fileExists, options) {
  return (link) => {
    const broken = isLinkBroken({
      files,
      fileExists,
      link,
      options,
    })

    return assoc("broken", broken, link)
  }
}

function handleLinks(options) {
  return (links) => {
    links.forEach((link) => {
      if (link.broken) {
        if (options.warn) {
          console.log(`Warning: Link is broken: ${link.description}, in file: ${link.filename}`)
        } else {
          throw new Error(`Link is broken: ${link.description}, in file: ${link.filename}`)
        }
      }
    })
  }
}
