// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DynamicERC1155 is ERC1155, Ownable {
    string public name;
    string public symbol;
    uint256 private _nextId;
    mapping(uint256 => uint256) private _totalSupply;
    mapping(uint256 => address) public creators; // 记录代币创建者
    mapping(uint256 => string) private _tokenURIs; // 自定义的URI存储
    
    // 自定义owner地址存储
    address private _owner;

    constructor(
        string memory name_,
        address initialOwner_
    ) ERC1155("") {
        name = name_;
        symbol = name_;
        _owner = initialOwner_;
    }

    // 覆盖 Ownable 的 owner 函数
    function owner() public view override returns (address) {
        return _owner;
    }
    
    // 覆盖 Ownable 的 transferOwnership 函数
    function transferOwnership(address newOwner) public override onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _owner = newOwner;
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
        
        // 设置代币元数据（自定义实现）
        _tokenURIs[id] = tokenURI;
        _mint(to, id, amount, data);
        _totalSupply[id] = amount;
        
        emit URI(tokenURI, id); // 触发元数据事件
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
            uint256 id = _nextId++;
            ids[i] = id;
            creators[id] = msg.sender;
            _tokenURIs[id] = uris[i];
            emit URI(uris[i], id);
            _totalSupply[id] = amounts[i];
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

    // 获取代币URI（自定义实现）
    function uri(uint256 id) public view override returns (string memory) {
        return _tokenURIs[id];
    }

    function totalSupply(uint256 id) public view returns (uint256) {
        return _totalSupply[id];
    }

    // 更新代币的URI
    function setTokenURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
        require(creators[tokenId] != address(0), "Token does not exist");
        _tokenURIs[tokenId] = tokenURI;
        emit URI(tokenURI, tokenId); // 更新时触发事件
    }
}