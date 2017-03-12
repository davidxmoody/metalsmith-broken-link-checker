const {expect} = require("chai")
const extractLinks = require("../src/extract-links")

describe("extractLinks", () => {
  let links
  before(() => {
    links = extractLinks(`
      <a href="/my-href/">Link text</a>
      <a name="link-to-me">Anchor text</a>
      <img src="/my-src/" alt="Alt text">
    `)
  })

  it("should extract three links from the given html", () => {
    expect(links).to.have.length(3)
  })

  describe("'a' tags (not anchors)", () => {
    it("should extract the target", () => {
      expect(links[0]).to.have.property("target", "/my-href/")
    })

    it("should extract the type", () => {
      expect(links[0]).to.have.property("type", "link")
    })

    it("should extract a description", () => {
      expect(links[0]).to.have.property("description")
      expect(links[0].description).to.contain("/my-href/")
      expect(links[0].description).to.contain("Link text")
    })
  })

  describe("anchor tags ('a' with a name/id attribute)", () => {
    it("should not extract a target", () => {
      expect(links[1]).to.not.have.property("target")
    })

    it("should extract the type", () => {
      expect(links[1]).to.have.property("type", "anchor")
    })

    it("should extract a description", () => {
      expect(links[1]).to.have.property("description")
      expect(links[1].description).to.contain("link-to-me")
      expect(links[1].description).to.contain("Anchor text")
    })
  })

  describe("'img' tags", () => {
    it("should extract the target", () => {
      expect(links[2]).to.have.property("target", "/my-src/")
    })

    it("should extract the type", () => {
      expect(links[2]).to.have.property("type", "image")
    })

    it("should extract a description", () => {
      expect(links[2]).to.have.property("description")
      expect(links[2].description).to.contain("/my-src/")
      expect(links[2].description).to.contain("Alt text")
    })
  })
})
