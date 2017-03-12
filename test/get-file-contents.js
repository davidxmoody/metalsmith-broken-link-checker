const {expect} = require("chai")
const getFileContents = require("../src/get-file-contents")

describe("getFileContents", () => {
  it("should return the stringified contents property", () => {
    const content = "my content"
    const file = {contents: new Buffer(content)}
    expect(getFileContents(file)).to.eql(content)
  })

  it("should default to an empty string", () => {
    const file = {}
    expect(getFileContents(file)).to.eql("")
  })
})
