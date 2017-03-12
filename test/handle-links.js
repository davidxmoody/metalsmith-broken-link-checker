const {expect} = require("chai")
const handleLinks = require("../src/handle-links")

describe("handleLinks", () => {
  describe("when the warn option is set", () => {
    const links = [
      {broken: true, description: "brokenLink1"},
      {broken: false, description: "workingLink2"},
      {broken: true, description: "brokenLink3"},
    ]

    let logResults = ""
    before(() => {
      function log(...args) {
        logResults += args.join()
      }
      handleLinks({warn: true}, log)(links)
    })

    it("should log the description of every broken link", () => {
      expect(logResults).to.contain("brokenLink1")
      expect(logResults).to.contain("brokenLink3")
    })

    it("should not log the descriptions of any non broken links", () => {
      expect(logResults).to.not.contain("workingLink2")
    })
  })

  describe("when the warn option is not set", () => {
    describe("when there are no broken links", () => {
      const links = [
        {broken: false},
      ]

      function check() {
        handleLinks({warn: false})(links)
      }

      it("should not throw an error", () => {
        expect(check).to.not.throw(Error)
      })
    })

    describe("when there are broken links", () => {
      const links = [
        {broken: true, description: "brokenLink1"},
      ]

      function check() {
        handleLinks({warn: false})(links)
      }

      it("should throw an error", () => {
        expect(check).to.throw(Error)
      })

      it("should put the link descriptions in the error message", () => {
        expect(check).to.throw(/brokenLink1/)
      })
    })
  })
})
