{expect} = require 'chai'
Metalsmith = require 'metalsmith'
blc = require '../lib'

describe 'Metalsmith plugin', ->

  it 'should not complain when there are no broken links', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use blc()
      .build (err) ->
        expect(err).to.not.exist
        done()

  it 'should throw an error when there are broken links', (done) ->
    Metalsmith(__dirname)
      .source './src-broken-links'
      .use blc()
      .build (err) ->
        expect(err).to.be.an.instanceof(Error)
        done()

  # Delete each file from the no-broken-links dir and expect an error
  deleteOneFile = (done) ->
    actualNumFiles = null
    fileIndexToDelete = this

    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        filenames = (filename for filename of files).sort()
        # Check that numTestFiles hasn't gotten out of sync with the actual
        # test files
        actualNumFiles = filenames.length
        delete files[filenames[fileIndexToDelete]]
      .use blc()
      .build (err) ->
        expect(actualNumFiles).to.equal(numTestFiles)
        expect(err).to.be.an.instanceof(Error)
        done()

  numTestFiles = 8
  for i in [0...numTestFiles]
    it 'should throw an error when there are broken links', deleteOneFile.bind(i)

  it 'should allow all absolute URLs', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        files['testfile.html'] =
          contents: new Buffer '<a href="https://davidxmoody.com/">Link to my blog</a>'
        files['testfile2.html'] =
          contents: new Buffer '<a href="http://www.google.com">Link to Google</a>'
      .use blc()
      .build (err) ->
        expect(err).to.not.exist
        done()

  it 'should not throw an error when options.warn is set', (done) ->
    Metalsmith(__dirname)
      .source './src-broken-links'
      .use blc({warn: true})
      .build (err) ->
        expect(err).to.not.exist
        done()

  it 'should ignore broken images when options.checkImages is false', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        delete files['testimg.jpg']
      .use blc({checkImages: false})
      .build (err) ->
        expect(err).to.not.exist
        done()

  it 'should ignore broken links when options.checkLinks is false', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        delete files['b.html']
      .use blc({checkLinks: false})
      .build (err) ->
        expect(err).to.not.exist
        done()

  it 'should allow links matching options.allowRegex', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        files['testfile.html'] =
          contents: new Buffer '<a href="/nth/specialregex-2/index.html">Regex link</a>'
      .use blc({allowRegex: /specialregex/})
      .build (err) ->
        expect(err).to.not.exist
        done()

  it 'should not allow broken links which do not match options.allowRegex', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        files['testfile.html'] =
          contents: new Buffer '<a href="/nth/specialregex-2/index.html">Regex link</a>'
      .use blc({allowRegex: /non-matching-regex/})
      .build (err) ->
        expect(err).to.be.an.instanceof(Error)
        done()

  it 'should allow anchors when allowAnchors is set', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        files['testfile.html'] =
          contents: new Buffer '<a name="anchorname">anchor</a>'
      .use blc({allowAnchors: true})
      .build (err) ->
        expect(err).to.not.exist
        done()

  it 'should not allow anchors when allowAnchors is not set', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        files['testfile.html'] =
          contents: new Buffer '<a name="anchorname">anchor</a>'
      .use blc({allowAnchors: false})
      .build (err) ->
        expect(err).to.exist
        done()

  it 'should not allow links with a name and href attribute if the href attribute is incorrect', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        files['testfile.html'] =
          contents: new Buffer '<a href="broken" name="anchorname">anchor</a>'
      .use blc({allowAnchors: true})
      .build (err) ->
        expect(err).to.exist
        done()

  it 'should throw an error for links to dirs when allowRedirects is not set', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        files['testfile.html'] =
          contents: new Buffer '<a href="/dir2">would redirect</a>'
      .use blc({allowRedirects: false})
      .build (err) ->
        expect(err).to.exist
        done()

  it 'should not throw an error for links to dirs when allowRedirects is set', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use (files, metalsmith) ->
        files['testfile.html'] =
          contents: new Buffer '<a href="/dir2">would redirect</a>'
      .use blc({allowRedirects: true})
      .build (err) ->
        expect(err).to.not.exist
        done()
