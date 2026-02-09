"use client";

import { useState, useEffect } from "react";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import { ethers } from "ethers";
import { saveContract } from "../actions/contracts";
import { getNetworkName } from "../services/utils";
import { fetchWithRetry } from "../services/retryUtils";
import "../styles/NFTCreator.css";
import { useLanguage } from "../contexts/LanguageContext";
import { SuccessModal } from "./SuccessModal";
import { getSupportedChainIds } from "../config";

interface NFTCreatorProps {
  type: "DRC721" | "DRC1155";
  onFormChange?: (data: {
    name: string;
    symbol: string;
    totalSupply: string;
  }) => void;
}

// ERC721 代币参数接口
interface ERC721TokenParams {
  name: string;
  symbol: string;
  baseUri: string;
  burnable: boolean;
  mintable: boolean;
  incremental: boolean;
  pausable: boolean;
  votes: boolean;
  enumerable: boolean;
  uriStorage: boolean;
  accessControl: "ownable" | "roles";
}

// ERC1155 代币参数接口
interface ERC1155TokenParams {
  name: string;
  burnable: boolean;
  mintable: boolean;
  pausable: boolean;
  supply: boolean;
  accessControl: "ownable" | "roles";
}

// 日志类型定义

export const NFTCreator = ({ type, onFormChange }: NFTCreatorProps) => {
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155"); // 获取钱包提供者
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deploymentResult, setDeploymentResult] = useState<{
    address: string;
    transactionHash: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [initOwnerAddress, setInitOwnerAddress] = useState(""); // 初始所有者地址

  // 预编译合约数据
  const [contractData, setContractData] = useState<{
    abi: ethers.ContractInterface;
    bytecode: string;
  } | null>(null);

  // ERC721表单数据
  const [erc721FormData, setERC721FormData] = useState<ERC721TokenParams>({
    name: "",
    symbol: "",
    baseUri: "",
    burnable: false,
    mintable: true,
    incremental: false,
    pausable: false,
    votes: false,
    enumerable: false,
    uriStorage: true,
    accessControl: "ownable",
  });

  // ERC1155表单数据
  const [erc1155FormData, setERC1155FormData] = useState<ERC1155TokenParams>({
    name: "",
    burnable: false,
    mintable: true,
    pausable: false,
    supply: true,
    accessControl: "ownable",
  });

  // 加载预编译合约
  useEffect(() => {
    const loadPrecompiledContract = async () => {
      try {
        // 获取预编译合约的ABI和字节码
        // 根据合约类型选择相应的路径，使用JSON格式避免服务器无法识别.abi和.bin文件的问题
        const contractFolder = type.toLowerCase();
        const contractPath = `/contracts/${contractFolder}/contract.json`;

        const contractResponse = await fetchWithRetry(contractPath);

        const contractData = await contractResponse.json();

        // 确保字节码格式正确
        const formattedBytecode = contractData.bytecode.startsWith("0x")
          ? contractData.bytecode
          : `0x${contractData.bytecode}`;

        setContractData({
          abi: contractData.abi,
          bytecode: formattedBytecode,
        });
      } catch (error) {
        console.error("加载预编译合约失败:", error);
        setErrorMessage("加载预编译合约失败，请检查控制台获取详细错误信息");
      }
    };

    loadPrecompiledContract();
  }, [type]);

  // 设置默认的初始所有者为当前连接地址
  useEffect(() => {
    if (address) {
      setInitOwnerAddress(address);
    }
  }, [address]);

  const handleERC721InputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    const newFormData = {
      ...erc721FormData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    };

    setERC721FormData(newFormData);

    // Update preview card
    if (onFormChange) {
      onFormChange({
        name: newFormData.name,
        symbol: newFormData.symbol,
        totalSupply: "0", // NFTs don't have total supply at creation
      });
    }

    // 清除错误信息
    setErrorMessage(null);
  };

  const handleERC1155InputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    const newFormData = {
      ...erc1155FormData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    };

    setERC1155FormData(newFormData);

    // Update preview card
    if (onFormChange) {
      onFormChange({
        name: newFormData.name,
        symbol: "", // DRC1155 doesn't have symbol
        totalSupply: "0", // NFTs don't have total supply at creation
      });
    }

    // 清除错误信息
    setErrorMessage(null);
  };

  // 处理弹窗关闭并清空表单
  const handleModalClose = () => {
    setShowSuccessModal(false);
    setDeploymentResult(null);

    // 清空表单数据
    setERC721FormData({
      name: "",
      symbol: "",
      baseUri: "",
      burnable: false,
      mintable: true,
      incremental: false,
      pausable: false,
      votes: false,
      enumerable: false,
      uriStorage: true,
      accessControl: "ownable",
    });

    setERC1155FormData({
      name: "",
      burnable: false,
      mintable: true,
      pausable: false,
      supply: true,
      accessControl: "ownable",
    });

    // 重置所有者地址为当前连接地址
    if (address) {
      setInitOwnerAddress(address);
    }

    // 清除错误信息
    setErrorMessage(null);
  };

  const handleDeploy = async () => {
    if (!contractData || !address || !chainId || !walletProvider) {
      setErrorMessage(t("error.contract.not.loaded"));
      return;
    }

    // 检查必填字段
    if (type === "DRC721" && (!erc721FormData.name || !erc721FormData.symbol)) {
      setErrorMessage(t("error.fill.nft.name.symbol"));
      return;
    } else if (type === "DRC1155" && !erc1155FormData.name) {
      setErrorMessage(t("error.fill.nft.collection.name"));
      return;
    }

    // 检查初始所有者地址是否有效
    if (!initOwnerAddress || !ethers.utils.isAddress(initOwnerAddress)) {
      setErrorMessage(t("error.invalid.owner.address"));
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 检查网络连接
      if (!chainId) {
        throw new Error("未连接到任何网络，请在钱包中选择一个网络");
      }

      // 获取钱包提供的signer
      const provider = new ethers.providers.Web3Provider(walletProvider);
      const signer = provider.getSigner();

      // 检查网络是否支持
      const network = await provider.getNetwork();

      // 检查是否为支持的网络
      const supportedNetworks = getSupportedChainIds();
      if (!supportedNetworks.includes(network.chainId)) {
        throw new Error(
          `当前网络(ID: ${network.chainId})不受支持。请切换到支持的网络。`
        );
      }

      // 准备构造函数参数
      let constructorParams = [];

      if (type === "DRC721") {
        // ERC721构造函数参数：name_, symbol_, owner_
        constructorParams = [
          erc721FormData.name, // NFT名称
          erc721FormData.symbol, // NFT符号
          initOwnerAddress, // 初始所有者地址
        ];
      } else {
        // ERC1155构造函数参数：name_, initialOwner_ (symbol会被自动设置为与name相同)
        constructorParams = [
          erc1155FormData.name, // 集合名称
          initOwnerAddress, // 初始所有者地址
        ];
      }

      // 创建合约工厂
      const factory = new ethers.ContractFactory(
        contractData.abi,
        contractData.bytecode,
        signer
      );

      // 部署合约
      const contract = await factory.deploy(...constructorParams);

      // 等待部署完成
      await contract.deployed();

      // 保存合约信息到数据库 - 传入钱包地址
      const saveResult = await saveContract({
        address: contract.address,
        transactionHash: contract.deployTransaction.hash,
        chainId: Number(chainId),
        networkName: getNetworkName(Number(chainId)),
        contractName:
          type === "DRC721" ? erc721FormData.name : erc1155FormData.name,
        type: type,
      }, address); // Pass wallet address for non-authenticated saving

      if (!saveResult.success) {
        console.warn(`合约保存失败: ${saveResult.error || "未知错误"}`);
        // 不抛出错误，因为合约已经成功部署
      }

      // 部署后检查合约所有者
      try {
        const deployedContract = new ethers.Contract(
          contract.address,
          contractData.abi,
          signer
        );

        if (
          Object.prototype.hasOwnProperty.call(
            deployedContract.functions,
            "owner"
          )
        ) {
          const owner = await deployedContract.owner();

          if (owner.toLowerCase() !== initOwnerAddress.toLowerCase()) {
            // 合约所有者与设置的地址不匹配
          }
        }
      } catch (error: any) {
        // 检查合约所有者失败，继续执行
        console.error("检查合约所有者失败:", error);
      }

      setDeploymentResult({
        address: contract.address,
        transactionHash: contract.deployTransaction.hash,
      });

      // 显示成功弹窗
      setShowSuccessModal(true);
    } catch (error: unknown) {
      console.error("部署合约失败:", error);

      // 提供更具体的错误信息
      if (error instanceof Error && error.message) {
        if (error.message.includes("insufficient funds")) {
          setErrorMessage("账户余额不足，无法支付交易费用");
        } else if (error.message.includes("user rejected")) {
          setErrorMessage("您拒绝了交易签名");
        } else if (error.message.includes("network")) {
          setErrorMessage("网络连接错误，请检查您的网络连接");
        } else {
          setErrorMessage(`部署失败: ${error.message}`);
        }
      } else {
        setErrorMessage("部署合约失败，请检查网络连接和钱包状态");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 验证必填字段
  const validateRequiredFields = (): boolean => {
    if (type === "DRC721") {
      return !!(
        erc721FormData.name.trim() &&
        erc721FormData.symbol.trim() &&
        initOwnerAddress.trim() &&
        ethers.utils.isAddress(initOwnerAddress)
      );
    } else {
      return !!(
        erc1155FormData.name.trim() &&
        initOwnerAddress.trim() &&
        ethers.utils.isAddress(initOwnerAddress)
      );
    }
  };

  // 渲染ERC721表单
  const renderERC721Form = () => (
    <>
      <div className="form-group">
        <label>
          {t("nft.create.name")} <span className="required">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={erc721FormData.name}
          onChange={handleERC721InputChange}
          placeholder={t("nft.create.name.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
      </div>

      <div className="form-group">
        <label>
          {t("nft.create.symbol")} <span className="required">*</span>
        </label>
        <input
          type="text"
          name="symbol"
          value={erc721FormData.symbol}
          onChange={handleERC721InputChange}
          placeholder={t("nft.create.symbol.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
      </div>

      <div className="form-group">
        <label>
          {t("nft.create.owner")} <span className="required">*</span>
        </label>
        <input
          type="text"
          value={initOwnerAddress}
          onChange={(e) => setInitOwnerAddress(e.target.value)}
          placeholder={t("nft.create.owner.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
        <small>{t("nft.create.owner.description")}</small>
      </div>
    </>
  );

  // 渲染ERC1155表单
  const renderERC1155Form = () => (
    <>
      <div className="form-group">
        <label>
          {t("nft.create.collection.name")} <span className="required">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={erc1155FormData.name}
          onChange={handleERC1155InputChange}
          placeholder={t("nft.create.collection.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
      </div>

      <div className="form-group">
        <label>
          {t("nft.create.owner")} <span className="required">*</span>
        </label>
        <input
          type="text"
          value={initOwnerAddress}
          onChange={(e) => setInitOwnerAddress(e.target.value)}
          placeholder={t("nft.create.owner.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
        <small>{t("nft.create.owner.description")}</small>
      </div>
    </>
  );

  return (
    <div className="nft-creator">
      <h2>
        {type === "DRC721"
          ? t("nft.create.title.721")
          : t("nft.create.title.1155")}
      </h2>

      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}
      {type === "DRC721" ? renderERC721Form() : renderERC1155Form()}

      <div className="actions">
        <button
          onClick={handleDeploy}
          disabled={!contractData || isLoading || !validateRequiredFields()}
        >
          {isLoading
            ? t("nft.create.button.deploying")
            : t("nft.create.button.deploy")}
        </button>
      </div>

      {/* 成功弹窗 */}
      {deploymentResult && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleModalClose}
          contractAddress={deploymentResult.address}
          transactionHash={deploymentResult.transactionHash}
          chainId={Number(chainId)}
        />
      )}
    </div>
  );
};
