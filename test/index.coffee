{expect} = require 'chai'
Metalsmith = require 'metalsmith'
blc = require '../lib'

describe 'Metalsmith plugin', ->

  it 'should not complain when there are no broken links', (done) ->
    Metalsmith(__dirname)
      .source './src-no-broken-links'
      .use blc()
      .build (err) ->
        throw err if err
        done()

  it 'should throw an error when there are broken links', (done) ->
    Metalsmith(__dirname)
      .source './src-broken-links'
      .use blc()
      .build (err) ->
        expect(err).to.be.an.instanceof(Error)
        done()

  # Delete each file from the no-broken-links dir and expect an error
  fn = (done) ->
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

  numTestFiles = 5
  for i in [0...numTestFiles]
    it 'should throw an error when there are broken links', fn.bind(i)
