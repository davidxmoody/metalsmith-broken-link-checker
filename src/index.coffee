URI = require 'URIjs'
cheerio = require 'cheerio'


isHTML = (filename) ->
  /\.html$/.exec(filename)

class Link
  constructor: ($link) ->
    if $link.is('a')
      @text = $link.text()
      @href = $link.attr('href')

    else if $link.is('img')
      @text = $link.attr('alt')
      @href = $link.attr('src')

  isBroken: (filename, files, options) ->
    # Missing href is always broken
    if not @href?
      return true

    uri = URI(@href)

    # Allow anything matching the options.allowRegex regex
    if options.allowRegex? and options.allowRegex.exec(@href)
      false

    # Empty link is always broken
    else if @href is ''
      true

    # Allow link to '#'
    else if @href is '#'
      false

    # Automatically accept all external links (could change later)
    else if uri.hostname()
      false

    # Ignore mailto and other non-http/https links
    else if uri.protocol() and uri.protocol not in ['http', 'https']
      false

    # Allow links to elements on the same page
    else if uri.fragment() and not uri.path()
      false

    # Need to transform uri.path() into something Metalsmith can recognise
    else
      linkPath = uri.absoluteTo(filename).path()
      if linkPath.slice(-1) is '/'
        linkPath += 'index.html'
      if linkPath.charAt(0) is '/'
        linkPath = linkPath.slice(1)

      # Check the linked file actually exists
      linkPath not of files
    
  toString: ->
    "href: \"#{@href}\", text: \"#{@text}\""


module.exports = (options) ->

  options ?= {}
  if options is true then options = {} # Allow CLI to specify true
  options.warn ?= false
  options.checkLinks ?= true
  options.checkImages ?= true
  options.allowRegex ?= null

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
