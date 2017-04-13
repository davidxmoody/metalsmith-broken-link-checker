const {expect} = require("chai")
const extractAnchorsTargets = require("../src/extract-anchor-targets")

describe("extractAnchorsTargets", () => {
  let links
  before(() => {
    targets = extractAnchorsTargets(`
      <div name="some">Div with some name</div>
      <a href="a.html#some" id="item">Anchor with item id</a>
      <div name="item2"></div>
      <div><div id="item3"></div></div>
    `)
  })

  it("should extract four targets from the given html", () => {
    expect(targets).to.have.length(4)
  })

  describe("first 'div' tag", () => {
    it("should be identified by", () => {
      expect(targets[0]).to.equals("some")
    })
  })

  describe("first 'a' tag", () => {
    it("should be identified by", () => {
      expect(targets[1]).to.equals("item")
    })
  })

  describe("second 'div' tag", () => {
    it("should be identified by", () => {
      expect(targets[2]).to.equals("item2")
    })
  })

  describe("inner 'div' tag", () => {
    it("should be identified by", () => {
      expect(targets[3]).to.equals("item3")
    })
  })
})
