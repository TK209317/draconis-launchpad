"use client";

import React, { createContext, useContext, useState } from "react";
import { setLanguageCookie, type Language } from "@/src/actions/language";

// 语言上下文接口
interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// 创建语言上下文
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// 翻译字典类型
type TranslationDict = {
  [key: string]: string;
};

// 翻译字典
const translations: Record<Language, TranslationDict> = {
  zh: {
    // App
    "app.title": "DRACONIS",
    "app.footer": `© ${new Date().getFullYear()} Draconis 一键发射平台 | 基于DraConis的DRC20、DRC721、DRC1155代币创建工具`,

    // HomePage
    "home.welcome.title": "欢迎来到代币一键发射平台",
    "home.welcome.subtitle": "连接您的钱包以开始创建代币和NFT",
    "home.feature.drc20.title": "DRC20 代币",
    "home.feature.drc20.description": "创建您自己的加密货币代币",
    "home.feature.drc20.feature1": "可定制的代币名称和符号",
    "home.feature.drc20.feature2": "支持EIP-2612许可",
    "home.feature.rwa.title": "RWA 代币",
    "home.feature.rwa.description": "创建您自己的加密货币代币",
    "home.feature.rwa.feature1": "可定制的代币名称和符号",
    "home.feature.rwa.feature2": "支持EIP-2612许可",
    "home.feature.nft721.title": "DRC721 NFT",
    "home.feature.nft721.description": "创建独特的非同质化代币",
    "home.feature.nft721.feature1": "可定制的NFT名称和符号",
    "home.feature.nft721.feature2": "支持元数据URI",
    "home.feature.nft721.feature3": "支持铸造NFT功能",
    "home.feature.nft721.feature4": "支持枚举和URI存储",
    "home.feature.nft1155.title": "DRC1155 多代币",
    "home.feature.nft1155.description": "创建多代币标准NFT",
    "home.feature.nft1155.feature1": "单个合约支持多种代币类型",
    "home.feature.nft1155.feature2": "高效批量转账",
    "home.feature.nft1155.feature3": "支持铸造功能",

    // New Homepage Design
    "hero.title": "用 DRACONIS 打造您的专属社区",
    "hero.subtitle.line1": "轻松创建代币。",
    "hero.subtitle.line2": "几秒钟内铸造您的加密货币。",
    "hero.cta.create": "创建代币",
    "hero.cta.learn": "了解工作原理",

    // Token Cards
    "card.drc20.title": "DRC20 Token",
    "card.drc20.subtitle": "标准加密货币代币",
    "card.nft.title": "NFT",
    "card.nft.subtitle": "发行您自己的非同质化代币",
    "card.rwa.title": "RWA Token",
    "card.rwa.subtitle": "将现实世界资产代币化",
    "card.multi.title": "Multi Token",
    "card.multi.subtitle": "发行多代币标准 NFT",

    // How It Works
    "howitworks.title": "工作原理",
    "howitworks.subtitle": "发行代币从未如此简单",
    "howitworks.step1.title": "连接您的钱包",
    "howitworks.step1.description": "安全地连接您的钱包，即刻开始。",
    "howitworks.step2.title": "选择并自定义您的代币",
    "howitworks.step2.description":
      "选择代币类型（DRC20、NFT、RWA、Multi-Token）并设置名称、供应量和符号。",
    "howitworks.step3.title": "在 Draconis 区块链上发布",
    "howitworks.step3.description": "一键部署您的代币到 Draconis 区块链。",

    // FAQs
    "faq.title": "常见问题",
    "faq.q1": "什么是 Draconis Launchpad？",
    "faq.a1":
      "Draconis Launchpad 是一个简化的无代码平台，使创作者能够直接在 Draconis 区块链上铸造代币和 NFT（DRC20、RWA 代币、DRC721/1155）。享受快速部署、内置合规性和零前期费用。",
    "faq.q2": "如何在 Draconis 上创建代币？",
    "faq.a2": `1. 连接您的钱包
2. 选择您要铸造的代币类型（DRC20、NFT、RWA、Multi-token）
3. 自定义名称、符号、供应量和元数据
4. 审核并发布——您的代币即刻上线。`,
    "faq.q3": "发行需要多少费用？",
    "faq.a3":
      "没有上市或平台费用。您只需支付 Draconis 网络上的 Gas 费用，透明且经过优化，部署成本低廉。",
    "faq.q4": "安全性和审计如何？",
    "faq.a4":
      "智能合约基于经过测试的模板构建，并经过内部审计。Draconis 确保代币安全，并计划进行第三方审计以增强信任和透明度。",
    "faq.q5": "以后可以自定义代币参数吗？",
    "faq.a5":
      "不可以——您必须在创建时最终确定供应量和元数据等设置。这是为了保持合约的简洁性和安全性。如果需要更改，可根据需要部署新的代币变体。",
    "faq.q6": "在哪里可以看到我发行的代币？",
    "faq.a6":
      "发布后，您的代币立即在 Draconis 浏览器上可见，显示关键统计数据——总供应量、持有者、最近交易——并可进行交易。",
    "faq.q7": "使用 Draconis Launchpad 需要通过 KYC 吗？",
    "faq.a7":
      "无需 KYC——Draconis Launchpad 完全去中心化，全球可访问。只需连接您的钱包即可发布。",
    "faq.q8": "如果我需要帮助怎么办？",
    "faq.a8": `Draconis 提供：
- 应用内工具提示和"了解工作原理"部分的指导
- GitHub 文档和用户指南
- 通过 Discord 和 Telegram 的社区支持
- 全天候紧急问题反馈渠道`,

    // Tabs
    "tab.drc20": "DRC20",
    "tab.rwa": "RWA",
    "tab.drc721": "DRC721",
    "tab.drc1155": "DRC1155",
    "tab.mycontracts": "我的合约",

    // Token Creator
    "token.create.title.drc20": "创建 DRC20 代币",
    "token.create.title.rwa": "创建 RWA 代币",
    "token.create.name": "代币名称",
    "token.create.name.placeholder": "例如: Dragon Token",
    "token.create.symbol": "代币符号",
    "token.create.symbol.placeholder": "例如: DRA",
    "token.create.premint": "初始铸造数量",
    "token.create.premint.placeholder": "例如: 1000000",
    "token.create.owner": "合约所有者地址",
    "token.create.owner.placeholder": "例如: 0x...",
    "token.create.owner.description": "该地址将拥有代币管理权限",
    "token.create.button.deploy": "部署合约",
    "token.create.button.deploying": "部署中...",
    "token.create.not.connected": "未连接",

    // NFT Minter
    "nft.mint.title": "铸造 NFT",
    "nft.mint.name": "名称",
    "nft.mint.name.placeholder": "输入NFT名称",
    "nft.mint.media": "媒体文件",
    "nft.mint.upload.image": "上传图片",
    "nft.mint.upload.description": "在此处上传图片文件",
    "nft.mint.description": "描述",
    "nft.mint.description.placeholder": "输入NFT描述信息",
    "nft.mint.recipient": "接收地址",
    "nft.mint.recipient.placeholder": "0x...",
    "nft.mint.button": "一键铸造NFT",
    "nft.mint.processing": "处理中...",
    "nft.mint.success": "NFT铸造成功！",
    "nft.mint.view.transaction": "在区块浏览器中查看交易",
    "nft.mint.switch.advanced": "切换到高级模式",
    "nft.mint.switch.simple": "切换到简洁模式",
    "nft.mint.advanced.title": "铸造新的NFT",
    "nft.mint.token.uri": "Token URI",
    "nft.mint.token.uri.placeholder": "例如: ipfs://QmYourCID/1.json",
    "nft.mint.button.mint": "铸造NFT",
    "nft.mint.button.minting": "铸造中...",
    "nft.mint.totalSupply": "铸造数量",

    // NFT Mint Status Messages
    "nft.mint.status.preparing": "正在准备上传...",
    "nft.mint.status.uploading": "正在使用{serviceName}上传...",
    "nft.mint.status.upload.success":
      "元数据上传成功！URI: {uri}。开始铸造NFT...",

    // NFT Creator
    "nft.create.title.721": "创建 DRC721 NFT",
    "nft.create.title.1155": "创建 DRC1155 NFT",
    "nft.create.name": "NFT名称",
    "nft.create.name.placeholder": "例如: Dragon NFT Collection",
    "nft.create.symbol": "NFT符号",
    "nft.create.symbol.placeholder": "例如: DRANFT",
    "nft.create.owner": "合约所有者地址",
    "nft.create.owner.placeholder": "例如: 0x...",
    "nft.create.owner.description": "该地址将拥有NFT管理权限",
    "nft.create.collection.name": "NFT集合名称",
    "nft.create.collection.placeholder": "例如: Dragon Multi Token Collection",
    "nft.create.uri.template": "URI模板",
    "nft.create.uri.placeholder": "例如: ipfs://{id}",
    "nft.create.uri.description": "使用 {id} 作为代币ID的占位符",
    "nft.create.button.deploy": "部署合约",
    "nft.create.button.deploying": "部署中...",
    "nft.create.network": "网络",
    "nft.create.account": "账户",
    "nft.create.not.connected": "未连接",

    // My Contracts
    "contracts.title": "我的合约",
    "contracts.filter.all": "全部",
    "contracts.filter.token": "代币",
    "contracts.filter.nft": "NFT",
    "contracts.no.contracts": "您还没有部署任何合约",
    "contracts.no.filter.contracts": "您还没有部署任何{type}合约",
    "contracts.type": "类型",
    "contracts.address": "地址",
    "contracts.network": "网络",
    "contracts.deploy.time": "部署时间",
    "contracts.copy": "复制",
    "contracts.copied": "已复制",
    "contracts.view.explorer": "在区块浏览器中查看",
    "contracts.mint.nft": "铸造NFT",
    "contracts.pagination.previous": "‹ 上一页",
    "contracts.pagination.next": "下一页 ›",

    // Deployment Result
    "deployment.successful": "部署成功",
    "deployment.success.title": "部署成功!",
    "deployment.contract.address": "合约地址",
    "deployment.transaction.hash": "交易哈希",
    "deployment.view.contract": "在区块浏览器中查看合约",
    "deployment.view.transaction": "在区块浏览器中查看交易",
    "deployment.copied": "已复制",
    "deployment.expand.abi": "ABI 展开/收起",
    "deployment.expand.bytecode": "Bytecode 展开/收起",

    // Logs
    "logs.deployment": "部署日志",
    "logs.compiler": "编译器日志",

    // Error Messages
    "error.contract.not.loaded": "请确保预编译合约已加载并且钱包已连接",
    "error.fill.token.name.symbol": "请填写代币名称和符号",
    "error.fill.nft.name.symbol": "请填写NFT名称和符号",
    "error.fill.nft.collection.name.symbol": "请填写NFT集合名称和符号",
    "error.fill.nft.collection.name": "请填写NFT集合名称",
    "error.fill.nft.name": "请填写NFT名称",
    "error.invalid.owner.address": "请输入有效的初始所有者地址",
    "error.invalid.contract.owner.address": "请输入有效的合约所有者地址",
    "error.upload.media": "请上传媒体文件",
    "error.invalid.recipient.address": "请输入有效的接收地址",
    "error.connect.wallet": "请先连接钱包",
    "error.invalid.address": "无效的接收地址",
    "error.metadata.uri": "请先创建或输入元数据URI",

    // Common
    "common.required": "*",
    "common.optional": "(可选)",
    "common.close": "关闭",
    "common.close.text": "关闭",
    "common.processing": "处理中...",
    "common.success": "成功",
    "common.error": "错误",
    "common.cancel": "取消",
    "common.confirm": "确认",
    "common.loading": "加载中...",

    // Language
    "lang.switch": "中/EN",
    "lang.chinese": "中文",
    "lang.english": "English",
    "lang.select": "选择语言",

    // Common UI
    "common.help": "帮助",

    // Wallet
    "wallet.connect": "连接钱包",
    "wallet.connecting": "连接中...",
    "wallet.disconnect": "断开连接",
    "wallet.info.title": "钱包信息",
    "wallet.info.address": "钱包地址",
    "wallet.info.network": "网络",
    "wallet.info.copy": "复制地址",

    // Connect Wallet Component
    "connectWallet.title": "连接您的钱包",
    "connectWallet.description": "请连接您的钱包以开始创建代币和NFT",
    "connectWallet.hint": "点击上方按钮连接您的钱包",

    // Network
    "network.Draconis.testnet": "DraConis测试网",
    "network.Draconis.mainnet": "DraConis主网",
    "network.ethereum.mainnet": "Ethereum主网",
    "network.sepolia.testnet": "Sepolia测试网",
    "network.unknown": "未知网络",

    // Contract Types
    "contract.type.drc20": "DRC20 代币",
    "contract.type.drc721": "DRC721 NFT",
    "contract.type.drc1155": "DRC1155 多代币",
    "contract.type.erc20": "DRC20 代币",
    "contract.type.erc721": "DRC721 NFT",
    "contract.type.erc1155": "DRC1155 多代币",
    "contract.type.rwa": "RWA 代币",
    "contracts.verify.button": "验证合约",
    "contracts.verify.verifying": "验证中...",
    "contracts.verify.success": "验证通过",
    "contracts.verify.fail": "验证失败",
    "contracts.verify.timeout": "超时",
    "contracts.verify.button.verified": "合约已验证",
    "contracts.verify.success.message": "合约验证成功！",
    "contracts.verify.fail.message": "合约验证失败，请检查网络连接或稍后重试。",
    "contracts.verify.timeout.message": "验证超时，请稍后重试。",
    "contracts.verify.network.unsupported": "当前网络不支持合约验证。",
  },
  en: {
    // App
    "app.title": "Draconis Launchpad Platform",
    "app.footer": `© ${new Date().getFullYear()} Draconis Launchpad Platform | DRC20, DRC721, DRC1155 Token Creation Tool Based on Draconis`,

    // HomePage
    "home.welcome.title": "Welcome to Token Launchpad Platform",
    "home.welcome.subtitle":
      "Connect your wallet to start creating tokens and NFTs",
    "home.feature.drc20.title": "DRC20 Tokens",
    "home.feature.drc20.description": "Create your own cryptocurrency tokens",
    "home.feature.drc20.feature1": "Customizable token name and symbol",
    "home.feature.drc20.feature2": "Support for EIP-2612 permits",
    "home.feature.rwa.title": "RWA Tokens",
    "home.feature.rwa.description": "Create your own cryptocurrency tokens",
    "home.feature.rwa.feature1": "Customizable token name and symbol",
    "home.feature.rwa.feature2": "Support for EIP-2612 permits",
    "home.feature.nft721.title": "DRC721 NFTs",
    "home.feature.nft721.description": "Create unique non-fungible tokens",
    "home.feature.nft721.feature1": "Customizable NFT name and symbol",
    "home.feature.nft721.feature2": "Support for metadata URI",
    "home.feature.nft721.feature3": "Support for NFT minting functionality",
    "home.feature.nft721.feature4": "Support for enumeration and URI storage",
    "home.feature.nft1155.title": "DRC1155 Multi Tokens",
    "home.feature.nft1155.description": "Create multi-token standard NFTs",
    "home.feature.nft1155.feature1":
      "Single contract supports multiple token types",
    "home.feature.nft1155.feature2": "Efficient batch transfers",
    "home.feature.nft1155.feature3": "Support for minting functionality",

    // New Homepage Design
    "hero.title": "Build Your Own Community with DRACONIS",
    "hero.subtitle.line1": "Token creation made effortless.",
    "hero.subtitle.line2": "Mint your cryptocurrency in seconds.",
    "hero.cta.create": "Create a Token",
    "hero.cta.learn": "Learn How It Works",

    // Token Cards
    "card.drc20.title": "DRC20 Token",
    "card.drc20.subtitle": "A standard cryptocurrency token",
    "card.nft.title": "NFT",
    "card.nft.subtitle": "Launch your own non-fungible token",
    "card.rwa.title": "RWA Token",
    "card.rwa.subtitle": "Tokenize your real-world assets",
    "card.multi.title": "Multi Token",
    "card.multi.subtitle": "Launch multi-token standard NFTs",

    // How It Works
    "howitworks.title": "How It Works",
    "howitworks.subtitle": "Launching a Token Has Never Been Easier",
    "howitworks.step1.title": "Connect Your Wallet",
    "howitworks.step1.description":
      "Securely link your wallet to get started instantly.",
    "howitworks.step2.title": "Select & Customize Your Token",
    "howitworks.step2.description":
      "Choose token type (DRC20, NFT, RWA, Multi-Token) and set name, supply, and symbol.",
    "howitworks.step3.title": "Launch on Draconis Blockchain",
    "howitworks.step3.description":
      "Deploy your token to the Draconis blockchain with one click.",

    // FAQs
    "faq.title": "FAQs",
    "faq.q1": "What is Draconis Launchpad?",
    "faq.a1":
      "Draconis Launchpad is a streamlined, no‑code platform that enables creators to mint tokens and NFTs (DRC20, RWA tokens, DRC721/1155) directly on the Draconis blockchain. Benefit from fast deployment, built‑in compliance, and zero upfront fees.",
    "faq.q2": "How do I create a token on Draconis?",
    "faq.a2": `1. Connect your wallet
2. Select the token type you want to mint (DRC20, NFT, RWA, Multi‑token)
3. Customize the name, symbol, supply, and metadata
4. Review and launch—your token is live instantly.`,
    "faq.q3": "How much does it cost to launch?",
    "faq.a3":
      "There are no listing or platform fees. You only pay for gas on the Draconis network, which is transparent and optimized for cost-efficient deployment.",
    "faq.q4": "What about security and auditing?",
    "faq.a4":
      "Smart contracts are built on tested templates and undergo internal audits. Draconis ensures token safety and is planning third-party audits to enhance trust and transparency.",
    "faq.q5": "Can I customize token parameters later?",
    "faq.a5":
      "No—you must finalize settings like supply and metadata at creation. This is to maintain contract simplicity and security. If changes are required, deploy a new token variant as needed.",
    "faq.q6": "Where can I see my launched tokens?",
    "faq.a6":
      "Upon launch, your token is immediately visible on the Draconis Explorer with key stats—total supply, holders, recent transactions—and available for trading.",
    "faq.q7": "Do I need to pass KYC to use Draconis Launchpad?",
    "faq.a7":
      "NO KYC is required—Draconis Launchpad is fully decentralized and accessible globally. Simply connect your wallet and launch.",
    "faq.q8": "What if I need help?",
    "faq.a8": `Draconis provides:
- In-app tooltips and guidance in the “Learn How It Works” section
- GitHub documentation and user guides
- Community support via Discord and Telegram
- 24/7 feedback channels for urgent issues`,

    // Tabs
    "tab.drc20": "DRC20",
    "tab.rwa": "RWA",
    "tab.drc721": "DRC721",
    "tab.drc1155": "DRC1155",
    "tab.mycontracts": "My Contracts",

    // Token Creator
    "token.create.title.drc20": "Create DRC20 Token",
    "token.create.title.rwa": "Create RWA Token",
    "token.create.name": "Token Name",
    "token.create.name.placeholder": "e.g.: Dragon Token",
    "token.create.symbol": "Token Symbol",
    "token.create.symbol.placeholder": "e.g.: DRA",
    "token.create.premint": "Initial Mint Amount",
    "token.create.premint.placeholder": "e.g.: 1000000",
    "token.create.owner": "Contract Owner Address",
    "token.create.owner.placeholder": "e.g.: 0x...",
    "token.create.owner.description":
      "This address will have token management permissions",
    "token.create.button.deploy": "Deploy Contract",
    "token.create.button.deploying": "Deploying...",
    "token.create.not.connected": "Not Connected",

    // NFT Minter
    "nft.mint.title": "Mint NFT",
    "nft.mint.metadata": "Metadata",
    "nft.mint.name": "Name",
    "nft.mint.name.placeholder": "Enter NFT name",
    "nft.mint.media": "Media",
    "nft.mint.upload.image": "Upload image",
    "nft.mint.upload.description": "You can upload image files here.",
    "nft.mint.description": "Description",
    "nft.mint.description.placeholder": "Enter NFT description",
    "nft.mint.recipient": "Recipient Address",
    "nft.mint.recipient.placeholder": "0x...",
    "nft.mint.button": "Mint NFT",
    "nft.mint.processing": "Processing...",
    "nft.mint.success": "NFT minted successfully!",
    "nft.mint.view.transaction": "View transaction in block explorer",
    "nft.mint.switch.advanced": "Switch to Advanced Mode",
    "nft.mint.switch.simple": "Switch to Simple Mode",
    "nft.mint.advanced.title": "Mint New NFT",
    "nft.mint.token.uri": "Token URI",
    "nft.mint.token.uri.placeholder": "e.g.: ipfs://QmYourCID/1.json",
    "nft.mint.button.mint": "Mint NFT",
    "nft.mint.button.minting": "Minting...",
    "nft.mint.totalSupply": "Total Supply",

    // NFT Mint Status Messages
    "nft.mint.status.preparing": "Preparing upload...",
    "nft.mint.status.uploading": "Uploading using {serviceName}...",
    "nft.mint.status.upload.success":
      "Metadata uploaded successfully! URI: {uri}. Starting NFT minting...",

    // NFT Creator
    "nft.create.title.721": "Create DRC721 NFT",
    "nft.create.title.1155": "Create DRC1155 NFT",
    "nft.create.name": "NFT Name",
    "nft.create.name.placeholder": "e.g.: Dragon NFT Collection",
    "nft.create.symbol": "NFT Symbol",
    "nft.create.symbol.placeholder": "e.g.: DRANFT",
    "nft.create.owner": "Contract Owner Address",
    "nft.create.owner.placeholder": "e.g.: 0x...",
    "nft.create.owner.description":
      "This address will have NFT management permissions",
    "nft.create.collection.name": "NFT Collection Name",
    "nft.create.collection.placeholder": "e.g.: Dragon Multi Token Collection",
    "nft.create.uri.template": "URI Template",
    "nft.create.uri.placeholder": "e.g.: ipfs://{id}",
    "nft.create.uri.description": "Use {id} as placeholder for token ID",
    "nft.create.button.deploy": "Deploy Contract",
    "nft.create.button.deploying": "Deploying...",
    "nft.create.network": "Network",
    "nft.create.account": "Account",
    "nft.create.not.connected": "Not Connected",

    // My Contracts
    "contracts.title": "My Contracts",
    "contracts.filter.all": "All",
    "contracts.filter.token": "Token",
    "contracts.filter.nft": "NFT",
    "contracts.no.contracts": "You have not deployed any contracts yet",
    "contracts.no.filter.contracts":
      "You have not deployed any {type} contracts yet",
    "contracts.type": "Type",
    "contracts.address": "Address",
    "contracts.network": "Network",
    "contracts.deploy.time": "Deploy Time",
    "contracts.copy": "Copy",
    "contracts.copied": "Copied",
    "contracts.view.explorer": "View in Block Explorer",
    "contracts.mint.nft": "Mint NFT",
    "contracts.pagination.previous": "‹ Previous",
    "contracts.pagination.next": "Next ›",

    // Deployment Result
    "deployment.successful": "Deployment Successful",
    "deployment.success.title": "Deployment Successful!",
    "deployment.contract.address": "Contract Address",
    "deployment.transaction.hash": "Transaction Hash",
    "deployment.view.contract": "View Contract in Block Explorer",
    "deployment.view.transaction": "View Transaction in Block Explorer",
    "deployment.copied": "Copied",
    "deployment.expand.abi": "Expand/Collapse ABI",
    "deployment.expand.bytecode": "Expand/Collapse Bytecode",

    // Logs
    "logs.deployment": "Deployment Logs",
    "logs.compiler": "Compiler Logs",

    // Error Messages
    "error.contract.not.loaded":
      "Please ensure the precompiled contract is loaded and the wallet is connected",
    "error.fill.token.name.symbol": "Please fill in the token name and symbol",
    "error.fill.nft.name.symbol": "Please fill in the NFT name and symbol",
    "error.fill.nft.collection.name.symbol":
      "Please fill in the NFT collection name and symbol",
    "error.fill.nft.collection.name": "Please fill in the NFT collection name",
    "error.fill.nft.name": "Please fill in the NFT name",
    "error.invalid.owner.address": "Please enter a valid initial owner address",
    "error.invalid.contract.owner.address":
      "Please enter a valid contract owner address",
    "error.upload.media": "Please upload media file",
    "error.invalid.recipient.address": "Please enter a valid recipient address",
    "error.connect.wallet": "Please connect wallet first",
    "error.invalid.address": "Invalid recipient address",
    "error.metadata.uri": "Please create or enter metadata URI first",

    // Common
    "common.required": "*",
    "common.optional": "(Optional)",
    "common.close": "Close",
    "common.close.text": "Close",
    "common.processing": "Processing...",
    "common.success": "Success",
    "common.error": "Error",
    "common.cancel": "Cancel",
    "common.confirm": "Confirm",
    "common.loading": "Loading...",

    // Language
    "lang.switch": "ZH/En",
    "lang.chinese": "中文",
    "lang.english": "English",
    "lang.select": "Select Language",

    // Common UI
    "common.help": "Help",

    // Wallet
    "wallet.connect": "Connect Wallet",
    "wallet.connecting": "Connecting...",
    "wallet.disconnect": "Disconnect",
    "wallet.info.title": "Wallet Information",
    "wallet.info.address": "Wallet Address",
    "wallet.info.network": "Network",
    "wallet.info.copy": "Copy Address",

    // Connect Wallet Component
    "connectWallet.title": "Connect Your Wallet",
    "connectWallet.description":
      "Please connect your wallet to start creating tokens and NFTs",
    "connectWallet.hint": "Click the button above to connect your wallet",

    // Network
    "network.Draconis.testnet": "Draconis Testnet",
    "network.Draconis.mainnet": "Draconis Mainnet",
    "network.ethereum.mainnet": "Ethereum Mainnet",
    "network.sepolia.testnet": "Sepolia Testnet",
    "network.unknown": "Unknown Network",

    // Contract Types
    "contract.type.drc20": "DRC20 Token",
    "contract.type.drc721": "DRC721 NFT",
    "contract.type.drc1155": "DRC1155 Multi Token",
    "contract.type.erc20": "DRC20 Token",
    "contract.type.erc721": "DRC721 NFT",
    "contract.type.erc1155": "DRC1155 Multi Token",
    "contract.type.rwa": "RWA Token",
    "contracts.verify.button": "Verify Contract",
    "contracts.verify.verifying": "Verifying...",
    "contracts.verify.success": "Verified",
    "contracts.verify.fail": "Failed",
    "contracts.verify.timeout": "Timeout",
    "contracts.verify.button.verified": "Contract Verified",
    "contracts.verify.success.message": "contract verification successful!",
    "contracts.verify.fail.message":
      "Contract verification failed, please check network connection or try again later.",
    "contracts.verify.timeout.message":
      "Verification timeout, please try again later.",
    "contracts.verify.network.unsupported":
      "Current network does not support contract verification.",
  },
};

// 语言提供者组件
export const LanguageProvider: React.FC<{
  children: React.ReactNode;
  initialLanguage?: Language;
}> = ({ children, initialLanguage = "zh" }) => {
  // 使用从服务器传递的初始语言
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  // 切换语言并保存到 cookie (使用服务器操作)
  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    await setLanguageCookie(lang);
  };

  // 翻译函数
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// 使用语言上下文的钩子
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
