// SPDX-License-Identifier: MIT
// 兼容 OpenZeppelin Contracts ^4.9.0
pragma solidity ^0.8.17;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract RwaToken is ERC20, Ownable {
    address private _owner;
    string private _tokenURI;

    constructor(
        string memory name_,
        string memory symbol_,
        address owner_,
        uint256 initialSupply,
        string memory tokenURI_
    )
        ERC20(name_, symbol_)
    {
        _owner = owner_;
        _tokenURI = tokenURI_;

        uint256 mintAmount = initialSupply * 10 ** decimals();
        _mint(owner_, mintAmount);
    }

    // Metadata functions
    function setTokenURI(string memory newTokenURI) public onlyOwner {
        _tokenURI = newTokenURI;
    }

    function tokenURI() public view returns (string memory) {
        return _tokenURI;
    }

    function owner() public view override returns (address) {
        return _owner;
    }
    
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _owner = newOwner;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}