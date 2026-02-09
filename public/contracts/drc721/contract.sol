// SPDX-License-Identifier: MIT
// 兼容 OpenZeppelin Contracts ^4.9.0
pragma solidity ^0.8.17;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Burnable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {ERC721Pausable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC721, ERC721Enumerable, ERC721URIStorage, ERC721Pausable, Ownable, ERC721Burnable {
    uint256 private _nextTokenId;
    
    address private _owner;

    constructor(
        string memory name_,   // NFT名称参数
        string memory symbol_, // NFT符号参数
        address owner_         // 所有者地址参数
    )
        ERC721(name_, symbol_)
    {
        // 在4.x版本中，Ownable构造函数不再接受owner参数
        _owner = owner_;
    }

    // 覆盖Ownable的owner函数
    function owner() public view override(Ownable) returns (address) {
        return _owner;
    }

    // 覆盖Ownable的transferOwnership函数
    function transferOwnership(address newOwner) public override(Ownable) onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _owner = newOwner;
    }

    function unpause() public onlyOwner {
        _unpause();
    }
    
    // 添加pause函数以完整实现暂停功能
    function pause() public onlyOwner {
        _pause();
    }

    function safeMint(address to, string memory uri)
        public
        onlyOwner
    {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    // 以下函数需要覆盖以实现功能整合

    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable, ERC721Pausable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}