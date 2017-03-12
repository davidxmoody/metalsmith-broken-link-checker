const {expect} = require("chai")
const addFilenameToLinks = require("../src/add-filename-to-links")

const FILENAME = "dir/file.html"

describe("addFilenameToLinks", () => {
  const links = [
    {foo: "bar"},
    {bar: "baz"},
  ]

  let results
  before(() => {
    results = addFilenameToLinks(links, FILENAME)
  })

  it("should keep all properties of existing links", () => {
    expect(results).to.have.length(2)
    expect(results[0]).to.have.property("foo", "bar")
    expect(results[1]).to.have.property("bar", "baz")
  })

  it("should add on the filename property", () => {
    expect(results[0]).to.have.property("filename", FILENAME)
    expect(results[1]).to.have.property("filename", FILENAME)
  })
})
