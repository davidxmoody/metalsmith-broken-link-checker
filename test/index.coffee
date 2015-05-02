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
