const {expect} = require("chai")
const normalizeFiles = require("../src/normalize-files")

const FILE_CONTENTS = "file contents"

describe("normalize files", () => {
  let normalized
  const htmlFilename = "file1.html"
  const nonHtmlFilename = "file2.nonhtml"
  const missingContentsFilename = "file3.html"

  before(() => {
    const files = {
      [htmlFilename]: {contents: new Buffer(FILE_CONTENTS)},
      [nonHtmlFilename]: {contents: new Buffer(FILE_CONTENTS)},
      [missingContentsFilename]: {},
    }

    normalized = normalizeFiles(files)
  })

  it("should include html files", () => {
    expect(normalized).to.have.property(htmlFilename)
  })

  it("should ignore non-html files", () => {
    expect(normalized).to.not.have.property(nonHtmlFilename)
  })

  it("should parse the contents of a file", () => {
    expect(normalized).to.have.property(htmlFilename, FILE_CONTENTS)
  })

  it("should default to an empty string when no contents is found", () => {
    expect(normalized).to.have.property(missingContentsFilename, "")
  })
})
