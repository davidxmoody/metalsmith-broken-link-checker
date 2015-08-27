URI = require 'URIjs'
cheerio = require 'cheerio'
path = require 'path'


isHTML = (filename) ->
  /\.html$/.exec(filename)

class Link
  constructor: ($link) ->
    if $link.is('a')
      @text = $link.text()
      @href = $link.attr('href')
      @isAnchor = $link.attr('name')?.length > 0 and not @href?

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

    # Need to transform uri.path() into something Metalsmith can recognise
    unixFilename = filename.replace(/\\/g, '/')
    linkPath = uri.absoluteTo(unixFilename).path()

    if linkPath.slice(-1) is '/'
      linkPath += 'index.html'

    if linkPath.charAt(0) is '/'
      linkPath = linkPath.slice(1)

    # Check the linked file actually exists
    if linkPath of files
      return false

    # Fallback for Windows paths
    else
      winPath = linkPath.split('/').join(path.sep)
      return winPath not of files
    
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
