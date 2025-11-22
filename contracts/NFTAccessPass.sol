// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Note: Counters is deprecated in newer OZ versions, I'll check if I can use it or just a simple uint256
// OpenZeppelin 5.x removed Counters. I'll use a simple uint256 private _nextTokenId;

contract NFTAccessPass is ERC721 {
    uint256 private _nextTokenId;

    constructor() ERC721("NFTAccessPass", "NAP") {}

    function mintNFT(address recipient) public returns (uint256) {
        require(balanceOf(recipient) == 0, "Access Pass already owned");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(recipient, tokenId);
        
        return tokenId;
    }
}

