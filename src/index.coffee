URI = require 'URIjs'
cheerio = require 'cheerio'

class Link
  constructor: ($link) ->
    if $link.is('a')
      @text = $link.text()
      @href = $link.attr('href')

    else if $link.is('img')
      @text = $link.attr('alt')
      @href = $link.attr('src')

  isBroken: (filename, files) ->
    uri = URI(@href).absoluteTo(filename)

    if @href is ''
      true

    if uri.hostname()
      # Could check external links here
      false

    else
      linkPath = uri.path()
      if linkPath.slice(-1) is '/'
        linkPath += 'index.html'
      if linkPath.charAt(0) is '/'
        linkPath = linkPath.slice(1)

      linkPath not of files
    
  toString: ->
    "href: \"#{@href}\", text: \"#{@text}\""



module.exports = (options) ->

  options ?= {}
  options.warn ?= false
  options.checkLinks ?= true
  options.checkImages ?= true

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

      contents = file.contents.toString()
      $ = cheerio.load(contents)

      $(selector).each ->
        link = new Link $(this)
        if link.isBroken(filename, files)
          if options.warn
            console.log "Warning: Link is broken: #{link.toString()}, in file: #{filename}"
          else
            throw new Error "Link is broken: #{link.toString()}, in file: #{filename}"
