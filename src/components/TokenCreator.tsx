"use client";

import { useState, useEffect, useRef } from "react";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import { ERC20TokenParams } from "../services/contractGenerator";
import { saveContract } from "../actions/contracts";
import { getSession } from "../actions/auth";
import { type LogCallback } from "../services";
import { getNetworkName } from "../services/utils";
import { fetchWithRetry } from "../services/retryUtils";
import "../styles/TokenCreator.css";
import { ethers } from "ethers";
import { useLanguage } from "../contexts/LanguageContext";
import { SuccessModal } from "./SuccessModal";
import { getSupportedChainIds } from "../config";

interface TokenCreatorProps {
  type: "DRC20" | "RWA";
  onFormChange?: (data: {
    name: string;
    symbol: string;
    totalSupply: string;
  }) => void;
}

// 日志类型定义
interface LogEntry {
  level: "info" | "warn" | "error";
  message: string;
  timestamp: Date;
  details?: unknown;
}

export const TokenCreator = ({ type, onFormChange }: TokenCreatorProps) => {
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

  // 添加日志状态
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // 添加合约所有者地址状态
  const [ownerAddress, setOwnerAddress] = useState("");

  const [formData, setFormData] = useState<ERC20TokenParams>({
    name: "",
    symbol: "",
    premint: "0",
    mintable: false,
    burnable: false,
    pausable: false,
    permit: false,
    votes: false,
    flashMinting: false,
    snapshots: false,
    accessControl: "ownable",
  });

  // 预编译合约数据
  const [contractData, setContractData] = useState<{
    abi: ethers.ContractInterface;
    bytecode: string;
  } | null>(null);

  // 自动滚动到日志底部
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // 加载预编译合约
  useEffect(() => {
    const loadPrecompiledContract = async () => {
      try {
        // 获取预编译合约的ABI和字节码
        // 使用JSON格式避免服务器无法识别.abi和.bin文件的问题
        const contractResponse = await fetchWithRetry(
          "/contracts/drc20/contract.json"
        );

        const contractData = await contractResponse.json();

        setContractData({
          abi: contractData.abi,
          bytecode: contractData.bytecode,
        });

        handleLog("info", "预编译合约加载成功");
      } catch (error) {
        console.error("加载预编译合约失败:", error);
        handleLog(
          "error",
          `加载预编译合约失败: ${
            error instanceof Error ? error.message : String(error)
          }`
        );
        setErrorMessage("加载预编译合约失败，请刷新页面重试");
      }
    };

    loadPrecompiledContract();
  }, []);

  // 设置默认的初始所有者为当前连接地址
  useEffect(() => {
    if (address) {
      setOwnerAddress(address);
    }
  }, [address]);

  // 验证必填字段
  const validateRequiredFields = (): boolean => {
    return !!(
      formData.name.trim() &&
      formData.symbol.trim() &&
      ownerAddress.trim() &&
      ethers.utils.isAddress(ownerAddress)
    );
  };

  // 日志回调函数
  const handleLog: LogCallback = (level, message, details) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      {
        level,
        message,
        details,
        timestamp: new Date(),
      },
    ]);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    const newFormData = {
      ...formData,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    };

    setFormData(newFormData);

    // Update preview card
    if (onFormChange) {
      onFormChange({
        name: newFormData.name,
        symbol: newFormData.symbol,
        totalSupply: newFormData.premint || "0",
      });
    }

    // 清除之前的错误信息
    setErrorMessage(null);
  };

  // 处理弹窗关闭并清空表单
  const handleModalClose = () => {
    setShowSuccessModal(false);
    setDeploymentResult(null);

    // 清空表单数据
    setFormData({
      name: "",
      symbol: "",
      premint: "0",
      mintable: false,
      burnable: false,
      pausable: false,
      permit: false,
      votes: false,
      flashMinting: false,
      snapshots: false,
      accessControl: "ownable",
    });

    // 重置所有者地址为当前连接地址
    if (address) {
      setOwnerAddress(address);
    }

    // 清除错误信息
    setErrorMessage(null);
  };

  const handleDeploy = async () => {
    if (!contractData || !address || !chainId || !walletProvider) {
      setErrorMessage(t("error.contract.not.loaded"));
      return;
    }

    if (!formData.name || !formData.symbol) {
      setErrorMessage(t("error.fill.token.name.symbol"));
      return;
    }

    // 检查所有者地址是否有效
    if (!ownerAddress || !ethers.utils.isAddress(ownerAddress)) {
      setErrorMessage(t("error.invalid.contract.owner.address"));
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
      handleLog("info", `当前连接的网络: ${network.name} (${network.chainId})`);

      // 检查是否为支持的网络
      const supportedNetworks = getSupportedChainIds();
      if (!supportedNetworks.includes(network.chainId)) {
        throw new Error(
          `当前网络(ID: ${network.chainId})不受支持。请切换到支持的网络。`
        );
      }

      // 准备构造函数参数
      // 根据预编译合约的实际构造函数情况调整参数顺序
      const constructorParams = [
        formData.name, // 代币名称
        formData.symbol, // 代币符号
        ownerAddress, // 合约所有者地址
        ethers.BigNumber.from(formData.premint || "0"), // 初始供应量
        "", //  empty url
      ];

      handleLog(
        "info",
        `部署参数: 名称=${formData.name}, 符号=${formData.symbol}, 所有者=${ownerAddress}, 初始供应量=${formData.premint}`
      );

      // 创建合约工厂
      const factory = new ethers.ContractFactory(
        contractData.abi,
        contractData.bytecode,
        signer
      );

      // 部署合约
      handleLog("info", "开始部署合约...");
      const contract = await factory.deploy(...constructorParams);

      // 等待部署完成
      handleLog(
        "info",
        `交易已提交，等待确认: ${contract.deployTransaction.hash}`
      );
      await contract.deployed();

      handleLog("info", `合约已部署，地址: ${contract.address}`);

      // 保存合约信息到数据库 - 传入钱包地址
      const saveResult = await saveContract(
        {
          address: contract.address,
          transactionHash: contract.deployTransaction.hash,
          chainId: Number(chainId),
          networkName: getNetworkName(Number(chainId)),
          contractName: formData.name,
          type: type,
        },
        address
      ); // Pass wallet address for non-authenticated saving

      if (!saveResult.success) {
        handleLog("warn", `合约保存失败: ${saveResult.error || "未知错误"}`);
        // 不抛出错误，因为合约已经成功部署
      }

      setDeploymentResult({
        address: contract.address,
        transactionHash: contract.deployTransaction.hash,
      });

      // 显示成功弹窗
      setShowSuccessModal(true);

      handleLog("info", `合约部署成功，地址: ${contract.address}`);
    } catch (error: unknown) {
      console.error("部署合约失败:", error);
      const errorMessage = error instanceof Error ? error.message : "未知错误";
      handleLog("error", `部署合约失败: ${errorMessage}`, error);

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

  return (
    <div className="token-creator">
      <h2>
        {type === "DRC20"
          ? t("token.create.title.drc20")
          : t("token.create.title.rwa")}
      </h2>

      {errorMessage && (
        <div className="error-message">
          <p>{errorMessage}</p>
        </div>
      )}

      <div className="form-group">
        <label>
          {t("token.create.name")} <span className="required">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder={t("token.create.name.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
      </div>

      <div className="form-group">
        <label>
          {t("token.create.symbol")} <span className="required">*</span>
        </label>
        <input
          type="text"
          name="symbol"
          value={formData.symbol}
          onChange={handleInputChange}
          placeholder={t("token.create.symbol.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
      </div>

      <div className="form-group">
        <label>
          {t("token.create.premint")}{" "}
          <span className="optional">{t("common.optional")}</span>
        </label>
        <input
          type="text"
          name="premint"
          value={formData.premint}
          onChange={handleInputChange}
          placeholder={t("token.create.premint.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
      </div>

      <div className="form-group">
        <label>
          {t("token.create.owner")} <span className="required">*</span>
        </label>
        <input
          type="text"
          value={ownerAddress}
          onChange={(e) => setOwnerAddress(e.target.value)}
          placeholder={t("token.create.owner.placeholder")}
          className="!bg-[#D9D9D91A] !text-white"
        />
        <small>{t("token.create.owner.description")}</small>
      </div>

      <div className="actions">
        <button
          onClick={handleDeploy}
          disabled={!contractData || isLoading || !validateRequiredFields()}
        >
          {isLoading
            ? t("token.create.button.deploying")
            : t("token.create.button.deploy")}
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
