URI = require 'URIjs'
cheerio = require 'cheerio'

class Link
  constructor: ($link) ->
    @text = $link.text()
    @href = $link.attr('href')

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

  (files, metalsmith) ->
    for filename, file of files

      contents = file.contents.toString()
      $ = cheerio.load(contents)

      $('a').each ->
        link = new Link $(this)
        if link.isBroken(filename, files)
          throw new Error "Link is broken: #{link.toString()}"
