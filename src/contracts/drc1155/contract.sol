// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract DynamicERC1155 is ERC1155URIStorage, Ownable {
    string public name;
    string public symbol;
    uint256 private _nextId;
    mapping(uint256 => uint256) private _totalSupply;
    mapping(uint256 => address) public creators; // 记录代币创建者

    constructor(
        string memory name_,
        address initialOwner_
    ) ERC1155("") Ownable(initialOwner_) {
        name = name_;
        symbol = name_;
    }

    // 简化版铸造函数
    function mint(
        address to,
        uint256 amount,
        string memory tokenURI, // 保留独立URI
        bytes memory data
    ) public onlyOwner {
        require(to != address(0), "Mint to zero address");
        require(amount > 0, "Amount must be positive");
        
        uint256 id = _nextId++;
        creators[id] = msg.sender;
        
        _setURI(id, tokenURI); // 设置代币元数据
        _mint(to, id, amount, data);
        _totalSupply[id] = amount;
        
        emit URI(tokenURI, id); // 触发元数据事件[1](@ref)
    }

    // 批量铸造
    function mintBatch(
        address to,
        uint256[] memory amounts,
        string[] memory uris, // 保留独立URI数组
        bytes memory data
    ) public onlyOwner {
        require(to != address(0), "Mint to zero address");
        require(amounts.length == uris.length, "Array length mismatch");
        
        uint256[] memory ids = new uint256[](amounts.length);
        for (uint256 i = 0; i < amounts.length; i++) {
            ids[i] = _nextId++;
            creators[ids[i]] = msg.sender;
            _setURI(ids[i], uris[i]);
            emit URI(uris[i], ids[i]);
            _totalSupply[ids[i]] = amounts[i];
        }
        _mintBatch(to, ids, amounts, data);
    }

    // 销毁函数（带供应量更新）
    function burn(
        address account,
        uint256 id,
        uint256 amount
    ) public {
        require(
            account == _msgSender() || isApprovedForAll(account, _msgSender()),
            "Caller is not owner nor approved"
        );
        _burn(account, id, amount);
        _totalSupply[id] -= amount;
    }

    function setBaseURI(string memory baseURI) public onlyOwner {
        _setBaseURI(baseURI);
    }

    function totalSupply(uint256 id) public view returns (uint256) {
        return _totalSupply[id];
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
        require(creators[tokenId] != address(0), "Token does not exist");
        _setURI(tokenId, tokenURI);
        emit URI(tokenURI, tokenId); // 更新时触发事件[1](@ref)
    }

}