URI = require 'urijs'
cheerio = require 'cheerio'
path = require 'path'


isHTML = (filename) ->
  /\.html$/.exec(filename)

fileExists = (files, filename) ->
  # Remove leading slash before checking to match the Metalsmith files format
  if filename.charAt(0) is '/'
    filename = filename.slice(1)

  # True if it exists in the files object
  if filename of files
    return true

  # Fallback for Windows paths
  else
    winPath = filename.split('/').join(path.sep)
    return winPath of files


class Link
  constructor: ($link) ->
    if $link.is('a')
      @text = $link.text()
      @href = $link.attr('href')
      @isAnchor = ($link.attr('name')?.length > 0 || $link.attr('id')?.length > 0) and not @href?

    else if $link.is('img')
      @text = $link.attr('alt')
      @href = $link.attr('src')

  isBroken: (filename, files, options) ->
    # Allow anchors before checking for a missing href
    if options.allowAnchors and @isAnchor
      return false

    # Missing href is always broken
    if not @href?
      return true

    uri = URI(@href)

    # Allow anything matching the options.allowRegex regex
    if options.allowRegex? and options.allowRegex.exec(@href)
      return false

    # Empty link is always broken
    if @href is ''
      return true

    # Allow link to '#'
    if @href is '#'
      return false

    # Automatically accept all external links (could change later)
    if uri.hostname()
      return false

    # Ignore mailto and other non-http/https links
    if uri.protocol() and uri.protocol not in ['http', 'https']
      return false

    # Allow links to elements on the same page
    if uri.fragment() and not uri.path()
      return false

    # Add baseURL in here so that the linkPath resolves to it in the case of
    # a relative link
    if options.baseURL
      filename = path.join(options.baseURL, filename)

    # Need to transform uri.path() into something Metalsmith can recognise
    unixFilename = filename.replace(/\\/g, '/')
    linkPath = uri.absoluteTo(unixFilename).path()

    # If baseURL then all internal links should be prefixed by it.
    if options.baseURL

      # If the linkPath does not start with the baseURL then it is broken
      if linkPath.indexOf(options.baseURL) isnt 0
        return true

      # Strip the baseURL out for checking whether the file exists in metalsmith
      linkPath = linkPath.replace(options.baseURL, '')

      # Fix bug where you were linking directly to the linkPath
      if linkPath is ''
        linkPath = '/'

    # Special case for link to root
    if linkPath is '/'
      return !fileExists(files, 'index.html')

    # Allow links to directories with a trailing slash
    if linkPath.slice(-1) is '/'
      linkPath += 'index.html'

    # Allow links to directories without a trailing slash with allowRedirects option
    if options.allowRedirects and fileExists(files, linkPath + '/index.html')
      return false

    return !fileExists(files, linkPath)

  toString: ->
    "href: \"#{@href}\", text: \"#{@text}\""


module.exports = (options) ->

  options ?= {}
  if options is true then options = {} # Allow CLI to specify true
  options.warn ?= false
  options.checkLinks ?= true
  options.checkImages ?= true
  options.allowRegex ?= null
  options.allowAnchors ?= true
  options.allowAnchors ?= false
  options.baseURL ?= null

  if options.checkLinks and options.checkImages
    selector = 'a, img'
  else if options.checkLinks
    selector = 'a'
  else if options.checkImages
    selector = 'img'
  else
    # Check nothing so just return nop function
    return ->

  (files, metalsmith) ->
    for filename, file of files

      continue unless isHTML(filename)

      contents = file.contents.toString()
      $ = cheerio.load(contents)

      $(selector).each ->
        link = new Link $(this)
        if link.isBroken(filename, files, options)
          if options.warn
            console.log "Warning: Link is broken: #{link.toString()}, in file: #{filename}"
          else
            throw new Error "Link is broken: #{link.toString()}, in file: #{filename}"
