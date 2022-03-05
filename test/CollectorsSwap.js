const { expect } = require("chai");
const { BigNumber } = require("ethers");

describe("CollectorsSwap", function () {

    let collectorsSwapInstance;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    before(async () => {
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        const CollectorsSwap = await ethers.getContractFactory("CollectorsSwap");
        collectorsSwapInstance = await CollectorsSwap.deploy();
    });

    it("Should get owner", async function () {
        expect(await collectorsSwapInstance.owner()).to.equal(owner.address);
    });

    it("Should fill watch verification", async function () {
        await collectorsSwapInstance.connect(addr1).requestWatchAuthenticityVerification(
            BigNumber.from(123),
            'watchUri',
            { value: 500 }
        );

        await collectorsSwapInstance.verifyWatchAuthenticity(true);

        expect(await collectorsSwapInstance.getWatch(BigNumber.from(123))).to.eql([
            BigNumber.from(123),
            'watchUri',
            addr1.address
        ]);
    });

    it("Should transfer watch", async function () {
        await collectorsSwapInstance.connect(addr1).transferOwnershipOfWatch(
            BigNumber.from(123),
            addr2.address
        );

        expect(await collectorsSwapInstance.getWatch(BigNumber.from(123))).to.eql([
            BigNumber.from(123),
            'watchUri',
            addr2.address
        ]);
    });

    it("Should change metadataUri of watch", async function () {
        await collectorsSwapInstance.connect(addr2).updateMetadataUriOfWatch(
            BigNumber.from(123),
            'newMetadataUri'
        );

        expect(await collectorsSwapInstance.getWatch(BigNumber.from(123))).to.eql([
            BigNumber.from(123),
            'newMetadataUri',
            addr2.address
        ]);
    });

    it("Should not fill watch verification", async function () {
        await collectorsSwapInstance.connect(addr1).requestWatchAuthenticityVerification(
            BigNumber.from(124),
            'watchUri2',
            { value: 500 }
        );

        await collectorsSwapInstance.verifyWatchAuthenticity(false);

        expect(await collectorsSwapInstance.getWatch(BigNumber.from(124))).to.eql([
            BigNumber.from(0),
            '',
            '0x0000000000000000000000000000000000000000'
        ]);
    });

    it("Should not fill verification request for insufficient funds", async function () {
        try {
            await collectorsSwapInstance.connect(addr1).requestWatchAuthenticityVerification(
                BigNumber.from(124),
                'watchUri2',
            );
        } catch (e) {
            expect(e.code).to.eql("INSUFFICIENT_FUNDS");
        }
    });

    it("Should not fill verify for not contract owner", async function () {
        try {
            await collectorsSwapInstance.connect(addr1).verifyWatchAuthenticity(true);
        } catch (e) {
            expect(e.message).to.eql("VM Exception while processing transaction: reverted with reason string 'Ownable: caller is not the owner'");
        }
    });

    it("Should not transfer watch when not owner of watch", async function () {
        try {
            await collectorsSwapInstance.transferOwnershipOfWatch(
                BigNumber.from(123),
                addr2.address
            );
        } catch (e) {
            expect(e.message).to.eql("VM Exception while processing transaction: reverted with reason string 'Only the owner of the watch is allowed to do this.'");
        }
    });

    it("Should not change metadataUri of watch when not owner of the watch", async function () {
        try {
            await collectorsSwapInstance.updateMetadataUriOfWatch(
                BigNumber.from(123),
                'newMetadataUri'
            );
        } catch (e) {
            expect(e.message).to.eql("VM Exception while processing transaction: reverted with reason string 'Only the owner of the watch is allowed to do this.'");
        }
    });
});