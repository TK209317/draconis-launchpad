// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.22;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract CustomToken is ERC20, Ownable {
    constructor(
        string memory name_,        // 代币名称参数
        string memory symbol_,      // 代币符号参数
        address owner_,             // 所有者地址参数
        uint256 initialSupply       // 初始铸造数量参数（单位：代币基本单位）
    )
        ERC20(name_, symbol_)
        Ownable(owner_)
    {
        // 将基本单位转换为实际代币数量（考虑小数位）
        uint256 mintAmount = initialSupply * 10 ** decimals();
        _mint(owner_, mintAmount);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}