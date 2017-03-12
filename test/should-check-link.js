const {expect} = require("chai")
const shouldCheckLink = require("../src/should-check-link")

describe("shouldCheckLink", () => {
  describe("for a regular link", () => {
    it("should return true when checkLinks is true", () => {
      const link = {type: "link"}
      const options = {checkLinks: true}
      expect(shouldCheckLink(options)(link)).to.be.true
    })

    it("should return false when checkLinks is false", () => {
      const link = {type: "link"}
      const options = {checkLinks: false}
      expect(shouldCheckLink(options)(link)).to.be.false
    })
  })

  describe("for an anchor", () => {
    it("should return true when allowAnchors is false", () => {
      const link = {type: "anchor"}
      const options = {allowAnchors: false}
      expect(shouldCheckLink(options)(link)).to.be.true
    })

    it("should return false when allowAnchors is true", () => {
      const link = {type: "anchor"}
      const options = {allowAnchors: true}
      expect(shouldCheckLink(options)(link)).to.be.false
    })
  })

  describe("for an image link", () => {
    it("should return true when checkImages is true", () => {
      const link = {type: "image"}
      const options = {checkImages: true}
      expect(shouldCheckLink(options)(link)).to.be.true
    })

    it("should return false when checkImages is false", () => {
      const link = {type: "image"}
      const options = {checkImages: false}
      expect(shouldCheckLink(options)(link)).to.be.false
    })
  })

  describe("for an unknown type of link", () => {
    it("should always return false", () => {
      const link = {type: "blah"}
      const options = {}
      expect(shouldCheckLink(options)(link)).to.be.false
    })
  })
})
