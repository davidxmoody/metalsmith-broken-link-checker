const {expect} = require("chai")
const pickHtmlFiles = require("../src/pick-html-files")

const htmlPath = "dir/file.html"
const notHtmlPath = "dir/file.nothtml"
const notHtmlPath2 = "html.svg"

describe("pickHtmlFiles", () => {
  let result
  before(() => {
    result = pickHtmlFiles({
      [htmlPath]: "contents",
      [notHtmlPath]: "foo",
      [notHtmlPath2]: "bar",
    })
  })

  it("should keep html files", () => {
    expect(result).to.have.property(htmlPath, "contents")
  })

  it("should omit non-html files", () => {
    expect(result).to.not.have.property(notHtmlPath)
    expect(result).to.not.have.property(notHtmlPath2)
  })
})
