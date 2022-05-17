const { contracts_build_directory } = require("../truffle-config")

const Land  = artifacts.require("./Land")

require('chai')
    .use(require('chai-as-promised'))
    .should()
    
const EVM_REVERT = 'VM Exception while processing transaction: revert'

contract("Land", ([owner1, owner2]) => {
    const NAME = "Ceylon Metaverse City";
    const SYMBOL = "CMC";
    const COST = web3.utils.toWei('1', 'ether');

    let land, result

    beforeEach(async () => {
        land = await Land.new(NAME, SYMBOL, COST)
    })

    describe("Deployment", () => {
        it("returns the contract name", async () => {
            result = await land.name()
            result.should.equal(NAME)
        })
        it("returns the symbol", async () => {
            result = await land.symbol()
            result.should.equal(SYMBOL)
        })
        it("returns the cost to mint", async () => {
            result = await land.cost()
            result.toString().should.equal(COST)
        })
        it("returns the max sypply", async () => {
            result = await land.maxSupply()
            result.toString().should.equal('5')
        })
        it("returns the buildings available", async () => {
            result = await land.getBuildings()
            result.length.should.equal(5)
        })
    })

    describe("Minting", () => {
        describe("Success", () => {

            beforeEach(async () => {
                result = await land.mint(1, {from: owner1, value: COST})
            })
            
            it("Owner address updated", async () => {
                result = await land.ownerOf(1)
                result.should.equal(owner1)
            })
            it("Building details updates", async () => {
                result = await land.getBuilding(1)
                result.owner.should.equal(owner1)
            })
        })
    })

    describe('Failure', () => {
        it("prevents mint with 0 Eth ", async () => {
            await land.mint(1, {from: owner1, value: 0}).should.be.rejectedWith(EVM_REVERT)
        })
        it("prevents mint with invalid id ", async () => {
            await land.mint(100, {from: owner1, value: COST}).should.be.rejectedWith(EVM_REVERT)
        })
        it("prevents mint if already minted ", async () => {
            await land.mint(1, {from: owner1, value: COST})
            await land.mint(1, {from: owner2, value: COST}).should.be.rejectedWith(EVM_REVERT)
        })
    })

    describe('Success', () => {
        beforeEach(async () => {
            await land.mint(1, {from: owner1, value:COST})
            await land.approve(owner2, 1, {from: owner1})
            await land.transferFrom(owner1, owner2, 1, {from: owner2})
        })
    it('Updated owner address', async () => {
        result = await land.ownerOf(1)
        result.should.equal(owner2)
    })

    it('updates building details', async () => {
        result = await land.getBuilding(1)
        result.owner.should.equal(owner2)
    })

    })

    describe('Failure', () => {
        it("prevents transfer without ownership ", async () => {
            await land.transferFrom(owner1, owner2, 1, {from: owner2}).should.be.rejectedWith(EVM_REVERT)
        })
        it("prevents transfer withour approve ", async () => {
            await land.mint(1, {from: owner1, value:COST})
            await land.transferFrom(owner1, owner2, 1, {from: owner2}).should.be.rejectedWith(EVM_REVERT)
        })
    })

})