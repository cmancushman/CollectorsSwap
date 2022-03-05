// SPDX-License-Identifier: MIT
pragma solidity ^0.8.1;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * Allows watch collectors to request watch authenticity verification from a trusted provider, and then transfer ownership of
 * such verified watches. Watches are verified on a first-in-first-out basis.
 */
contract CollectorsSwap is Ownable {
    struct Watch {
        uint256 serialNumber; // serial number of the watch
        string metadataUri; // image link to a picture of the watch
        address owner; // owning address of the watch
    }

    uint256 private WATCH_MINTING_FEE = 500; // gas fee paid to watch appraiser

    mapping(uint256 => Watch) private watches; // a mapping of each serial number to its respective watch

    Watch[] private watchRequests; // the waiting list of watches to be appraised
    uint256 private lastMintedWatchIndex; // the index of the last minted watch

    /**
     * @dev Verifies that the caller of a function owns the watch associated with a serial number.
     * @param serialNumber the serial number of the watch.
     */
    modifier isOwnerOfWatch(uint256 serialNumber) {
        require(
            watches[serialNumber].owner == msg.sender,
            "Only the owner of the watch is allowed to do this."
        );
        _;
    }

    /**
     * @dev Verifies that the required minting fee has been given.
     */
    modifier sufficientFunds() {
        require(msg.value >= WATCH_MINTING_FEE, "Insufficient funds.");
        _;
    }

    /**
     * @dev Gets a watch for a given serial number.
     * @return watch the watch associated with a serial number
     */
    function getWatch(uint256 serialNumber) public view returns (Watch memory) {
        Watch memory watch = watches[serialNumber];
        return watch;
    }

    /**
     * @dev Transfers ownership of a watch to a new address.
     */
    function transferOwnershipOfWatch(uint256 serialNumber, address newOwner)
        public
        isOwnerOfWatch(serialNumber)
    {
        Watch storage watch = watches[serialNumber];
        watch.owner = newOwner;
    }

    /**
     * @dev Updates the current metadataUri of the watch.
     */
    function updateMetadataUriOfWatch(uint256 serialNumber, string calldata newMetadataUri)
        public
        isOwnerOfWatch(serialNumber)
    {
        Watch storage watch = watches[serialNumber];
        watch.metadataUri = newMetadataUri;
    }

    /**
     * @dev Adds a new request for a watch's authenticity to be verified.
     * @param serialNumber the serial number of the watch.
     * @param metadataUri an image of the watch.
     */
    function requestWatchAuthenticityVerification(
        uint256 serialNumber,
        string calldata metadataUri
    ) public payable sufficientFunds {
        Watch memory watch = Watch(serialNumber, metadataUri, msg.sender);
        watchRequests.push(watch);
    }

    /**
     * @dev Updates watch mappings based on authenticity of most recent watch.
     * @param isAuthentic true if the watch is authentic, false otherwise
     */
    function verifyWatchAuthenticity(bool isAuthentic) public onlyOwner {
        lastMintedWatchIndex++;
        if (!isAuthentic) {
            return;
        }

        Watch storage watch = watchRequests[lastMintedWatchIndex - 1];
        watches[watch.serialNumber] = watch;

        (bool sent, ) = payable(owner()).call{value: WATCH_MINTING_FEE}("");
        require(sent, "Failed to send Ether.");
    }
}
