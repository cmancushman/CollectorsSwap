async function main() {
    const CollectorsSwap = await ethers.getContractFactory("CollectorsSwap")

    // Start deployment, returning a promise that resolves to a contract object
    const collectorsSwapInstance = await CollectorsSwap.deploy()
    await collectorsSwapInstance.deployed()
    console.log("Contract deployed to address:", collectorsSwapInstance.address)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
