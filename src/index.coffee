path = require 'path'
cheerio = require 'cheerio'

class Link
  constructor: (@$link) ->
    @text = @$link.text()
    @href = @$link.attr('href')

  isBroken: (filename, files) ->
    regex = /^(\/?)([a-zA-Z0-9\/.~_-]+?)(\/?)$/

    [match, rootRelative, linkPath, isDir] = regex.exec(@href)

    if match is '/'
      linkPath = '/index.html'
    else if isDir
      # Note, this does not accept links to dirs without a trailing slash
      linkPath += '/index.html'

    unless rootRelative
      linkPath = path.join(path.dirname(filename), linkPath)

    filePath = path.normalize(linkPath)

    console.log filePath
    filePath not of files


    

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
