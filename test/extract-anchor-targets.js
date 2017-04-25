const {expect} = require("chai")
const extractAnchorTargets = require("../src/extract-anchor-targets")

describe("extractAnchorTargets", () => {
  let targets
  before(() => {
    targets = extractAnchorTargets(`
      <a name="target1"></a>
      <div id="target2"></div>
    `)
  })

  it("should extract a 'name' attribute", () => {
    expect(targets[0]).to.equals("target1")
  })

  it("should extract an 'id' attribute", () => {
    expect(targets[1]).to.equals("target2")
  })
})
