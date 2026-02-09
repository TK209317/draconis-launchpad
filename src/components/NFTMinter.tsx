"use client";

import { useState, useEffect, useRef } from "react";
import {
  useAppKitAccount,
  useAppKitNetwork,
  useAppKitProvider,
} from "@reown/appkit/react";
import { ethers } from "ethers";
import { X } from "lucide-react";
import "../styles/NFTMinter.css";
import { ExternalProvider } from "@ethersproject/providers";
import { getBlockExplorerUrl } from "../services/utils";
import { useLanguage } from "../contexts/LanguageContext";
import {
  generatePresignedUrls,
  getS3UploadCredentials,
} from "../actions/storage";

interface NFTMinterProps {
  contractAddress: string;
  contractType: "DRC721" | "DRC1155" | "ERC721" | "ERC1155";
  onClose: () => void;
}

export const NFTMinter = ({
  contractAddress,
  contractType,
  onClose,
}: NFTMinterProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { address } = useAppKitAccount();
  const { chainId } = useAppKitNetwork();
  const { walletProvider } = useAppKitProvider("eip155");
  const { t } = useLanguage();

  // 简单的字符串替换函数
  const formatString = (template: string, params: Record<string, string>) => {
    return template.replace(/{(\w+)}/g, (match, key) => params[key] || match);
  };

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  // 使用简化界面的标志
  const [useSimpleUI, setUseSimpleUI] = useState(true);

  // 简单模式状态
  const [nftName, setNftName] = useState("");
  const [nftDescription, setNftDescription] = useState("");
  const [nftMedia, setNftMedia] = useState<File | null>(null);
  const [nftMediaName, setNftMediaName] = useState("");
  const [metadataStatus, setMetadataStatus] = useState("");

  // DRC721/ERC721铸造参数
  const [nftRecipient, setNftRecipient] = useState<string>("");
  const [nftTokenURI, setNftTokenURI] = useState<string>("");

  // DRC1155铸造参数
  const [erc1155Amount, setErc1155Amount] = useState<string>("1");

  useEffect(() => {
    // 默认将接收者设置为当前连接的钱包地址
    if (address) {
      setNftRecipient(address);
    }
  }, [address]);

  // Open dialog on mount
  useEffect(() => {
    dialogRef.current?.showModal();
  }, []);

  // Handle close with native dialog
  const handleClose = () => {
    dialogRef.current?.close();
    onClose();
  };

  // 处理媒体文件选择
  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setNftMedia(file);
      setNftMediaName(file.name);
    }
  };

  // 处理一键上传并铸造操作
  const handleOneClickMint = async () => {
    if (!nftName) {
      setErrorMessage(t("error.fill.nft.name"));
      return;
    }

    if (!nftMedia) {
      setErrorMessage(t("error.upload.media"));
      return;
    }

    if (!nftRecipient || !ethers.utils.isAddress(nftRecipient)) {
      setErrorMessage(t("error.invalid.recipient.address"));
      return;
    }

    if (!walletProvider) {
      setErrorMessage(t("error.connect.wallet"));
      return;
    }

    // 开始上传和铸造流程
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    setMetadataStatus(t("nft.mint.status.preparing"));

    try {
      // Step 1: Generate pre-signed URLs from server
      setMetadataStatus(
        formatString(t("nft.mint.status.uploading"), {
          serviceName: "Amazon S3",
        })
      );

      const urlsResponse = await generatePresignedUrls({
        fileName: nftMedia.name,
        fileType: nftMedia.type,
      });

      if (!urlsResponse.success || !urlsResponse.data) {
        setErrorMessage(urlsResponse.error || "Failed to generate upload URLs");
        setIsLoading(false);
        return;
      }

      // Step 2: Get upload credentials
      const credentialsResponse = await getS3UploadCredentials();
      if (!credentialsResponse.success || !credentialsResponse.apiKey) {
        setErrorMessage(
          credentialsResponse.error || "Failed to get upload credentials"
        );
        setIsLoading(false);
        return;
      }

      const { data: urls } = urlsResponse;
      const { apiKey } = credentialsResponse;

      // Step 3: Upload image file to S3
      const imageUploadResponse = await fetch(urls.imageUploadUrl, {
        method: "PUT",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": nftMedia.type || "application/octet-stream",
        },
        body: nftMedia,
      });

      if (!imageUploadResponse.ok) {
        throw new Error(
          `Image upload failed: ${imageUploadResponse.statusText}`
        );
      }

      // Step 4: Create and upload metadata JSON
      const metadataJson = {
        name: nftName,
        description: nftDescription || "",
        image: urls.imagePublicUrl,
      };

      const metadataUploadResponse = await fetch(urls.metadataUploadUrl, {
        method: "PUT",
        headers: {
          "X-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(metadataJson, null, 2),
      });

      if (!metadataUploadResponse.ok) {
        throw new Error(
          `Metadata upload failed: ${metadataUploadResponse.statusText}`
        );
      }

      // Step 5: Set URI and status
      const metadataUri = urls.metadataPublicUrl;
      setNftTokenURI(metadataUri);
      setMetadataStatus(
        formatString(t("nft.mint.status.upload.success"), { uri: metadataUri })
      );

      // Step 6: Mint NFT
      await handleMintNFT(metadataUri);
    } catch (error: unknown) {
      console.error("上传或铸造NFT失败:", error);

      // 提供错误信息
      if (error instanceof Error) {
        if (error.message.includes("execution reverted")) {
          const revertReason =
            (error as { data?: { message?: string } }).data?.message ||
            error.message;
          setErrorMessage(`合约执行被回滚: ${revertReason}`);
        } else if (error.message.includes("user rejected")) {
          setErrorMessage("用户拒绝了交易");
        } else if (error.message.includes("insufficient funds")) {
          setErrorMessage("账户余额不足，无法支付交易费用");
        } else {
          setErrorMessage(`操作失败: ${error.message}`);
        }
      } else {
        setErrorMessage("操作失败: 未知错误");
      }
      setMetadataStatus("");
      setIsLoading(false);
    }
  };

  // 处理NFT铸造
  const handleMintNFT = async (tokenUri?: string) => {
    if (!walletProvider || !address) {
      setErrorMessage("请先连接钱包");
      return;
    }

    // 如果没有提供tokenUri，则使用已保存的uri
    const uriToUse = tokenUri || nftTokenURI;

    if (!uriToUse) {
      setErrorMessage("请先创建或输入元数据URI");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const provider = new ethers.providers.Web3Provider(
        walletProvider as ExternalProvider
      );
      const signer = provider.getSigner();

      // 获取合约ABI并创建合约实例
      const contractABI = await getContractABI();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );

      // 检查接收地址是否有效
      if (!ethers.utils.isAddress(nftRecipient)) {
        throw new Error("无效的接收地址");
      }

      console.log("铸造NFT:", {
        recipient: nftRecipient,
        tokenURI: uriToUse,
      });

      // 调用合约的铸造方法，支持多种可能的函数名
      let tx;

      // 检查合约所有者
      try {
        if (Object.prototype.hasOwnProperty.call(contract.functions, "owner")) {
          const owner = await contract.owner();

          if (owner.toLowerCase() !== address.toLowerCase()) {
            // 用户不是合约所有者，可能没有铸造权限
          }
        }
      } catch (error) {
        // 获取合约所有者失败，继续执行
      }

      // NFT类型决定调用的函数
      if (contractType === "DRC721" || contractType === "ERC721") {
        // 尝试不同的铸造函数
        if (
          Object.prototype.hasOwnProperty.call(contract.functions, "safeMint")
        ) {
          try {
            tx = await contract.safeMint(nftRecipient, uriToUse);
          } catch (e: unknown) {
            try {
              tx = await contract.safeMint(nftRecipient);
            } catch (e2: unknown) {
              const errorMessage2 =
                e2 instanceof Error ? e2.message : "未知错误";
              throw new Error(`调用safeMint函数失败: ${errorMessage2}`);
            }
          }
        } else if (
          Object.prototype.hasOwnProperty.call(contract.functions, "mint")
        ) {
          try {
            tx = await contract.mint(nftRecipient, uriToUse);
          } catch (e: unknown) {
            try {
              tx = await contract.mint(nftRecipient);
            } catch (e2: unknown) {
              const errorMessage2 =
                e2 instanceof Error ? e2.message : "未知错误";
              throw new Error(`调用mint函数失败: ${errorMessage2}`);
            }
          }
        } else {
          // 尝试查找任何包含mint的函数
          const mintFunctions = Object.keys(contract.functions).filter(
            (fn) =>
              fn.toLowerCase().includes("mint") &&
              typeof contract.functions[fn] === "function"
          );

          if (mintFunctions.length > 0) {
            let mintSuccess = false;

            for (const mintFn of mintFunctions) {
              // 尝试不同的参数组合
              try {
                tx = await contract[mintFn](nftRecipient, uriToUse);
                mintSuccess = true;
                break;
              } catch (e1: unknown) {
                try {
                  tx = await contract[mintFn](nftRecipient);
                  mintSuccess = true;
                  break;
                } catch (e2: unknown) {
                  // 继续尝试下一个函数
                }
              }
            }

            if (!mintSuccess) {
              throw new Error("尝试所有铸造函数都失败，请检查合约函数和参数");
            }
          } else {
            throw new Error("合约不支持铸造功能，未找到任何mint相关函数");
          }
        }
      } else if (contractType === "DRC1155" || contractType === "ERC1155") {
        // DRC1155铸造逻辑 - 使用合约的mint函数
        if (Object.prototype.hasOwnProperty.call(contract.functions, "mint")) {
          try {
            // DRC1155 mint函数参数: mint(address to, uint256 amount, string memory tokenURI, bytes memory data)
            const amount = erc1155Amount || "1"; // 默认铸造1个
            const data = "0x"; // 空字节数据

            tx = await contract.mint(nftRecipient, amount, uriToUse, data);
          } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : "未知错误";
            throw new Error(`DRC1155铸造失败: ${errorMessage}`);
          }
        } else {
          throw new Error("合约不支持mint功能，未找到mint函数");
        }
      }

      await tx.wait();
      setTransactionHash(tx.hash);
      setSuccessMessage(`NFT铸造成功！`);
      setMetadataStatus("");
    } catch (error: unknown) {
      console.error("铸造NFT失败:", error);

      // 提供更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes("execution reverted")) {
          const revertReason =
            (error as { data?: { message?: string } }).data?.message ||
            error.message;
          setErrorMessage(`合约执行被回滚: ${revertReason}`);
        } else if (error.message.includes("user rejected")) {
          setErrorMessage("用户拒绝了交易");
        } else if (error.message.includes("insufficient funds")) {
          setErrorMessage("账户余额不足，无法支付交易费用");
        } else {
          setErrorMessage(`铸造失败: ${error.message}`);
        }
      } else {
        setErrorMessage("铸造失败: 未知错误");
      }
      setMetadataStatus("");
    } finally {
      setIsLoading(false);
    }
  };

  // 获取合约ABI的函数
  const getContractABI = async () => {
    try {
      if (contractType === "DRC721" || contractType === "ERC721") {
        const response = await fetch("/contracts/drc721/contract.json");
        const contractData = await response.json();
        return contractData.abi;
      } else if (contractType === "DRC1155" || contractType === "ERC1155") {
        const response = await fetch("/contracts/drc1155/contract.json");
        const contractData = await response.json();
        return contractData.abi;
      }
    } catch (error) {
      console.error("加载合约ABI失败:", error);
      throw new Error("无法加载合约ABI");
    }
  };

  // 渲染简单模式UI
  const renderSimpleUI = () => {
    return (
      <div className="nft-minter-content simple-ui">
        <div className="mint-form">
          <div className="form-group">
            <label htmlFor="nft-name">
              {t("nft.mint.name")}{" "}
              <span className="required">{t("common.required")}</span>
            </label>
            <input
              id="nft-name"
              type="text"
              value={nftName}
              onChange={(e) => setNftName(e.target.value)}
              placeholder={t("nft.mint.name.placeholder")}
            />
          </div>

          <div className="form-group">
            <label htmlFor="media-upload">{t("nft.mint.media")}</label>
            <div className="media-upload-container">
              {nftMedia ? (
                <div className="media-preview">
                  {nftMedia.type.startsWith("image/") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={URL.createObjectURL(nftMedia)}
                      alt="预览"
                      className="media-preview-image"
                    />
                  ) : (
                    <div className="media-file-name">{nftMediaName}</div>
                  )}
                  <button
                    className="remove-media-btn"
                    onClick={() => {
                      setNftMedia(null);
                      setNftMediaName("");
                    }}
                  >
                    &times;
                  </button>
                </div>
              ) : (
                <div className="upload-box">
                  <input
                    type="file"
                    id="media-upload"
                    onChange={handleMediaChange}
                    hidden
                  />
                  <label htmlFor="media-upload" className="upload-label">
                    <div className="upload-icon">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 16V8M12 8L9 11M12 8L15 11"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M3 15V16C3 17.6569 4.34315 19 6 19H18C19.6569 19 21 17.6569 21 16V15"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <span>{t("nft.mint.upload.image")}</span>
                  </label>
                </div>
              )}
            </div>
            <div className="media-description">
              {t("nft.mint.upload.description")}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="nft-description">{t("nft.mint.description")}</label>
            <textarea
              id="nft-description"
              value={nftDescription}
              onChange={(e) => setNftDescription(e.target.value)}
              placeholder={t("nft.mint.description.placeholder")}
              rows={6}
            />
          </div>

          {metadataStatus && (
            <div className="metadata-status">
              <p>{metadataStatus}</p>
            </div>
          )}

          <div className="form-group recipient-group">
            <label htmlFor="recipient">{t("nft.mint.recipient")}</label>
            <input
              id="recipient"
              type="text"
              value={nftRecipient}
              onChange={(e) => setNftRecipient(e.target.value)}
              placeholder={t("nft.mint.recipient.placeholder")}
            />
          </div>

          {/* 为DRC1155添加数量输入 */}
          {(contractType === "DRC1155" || contractType === "ERC1155") && (
            <div className="form-group">
              <label htmlFor="totalSupply-advanced">
                {t("nft.mint.totalSupply")}
              </label>
              <input
                id="totalSupply-advanced"
                type="number"
                value={erc1155Amount}
                onChange={(e) => setErc1155Amount(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
          )}

          <div className="form-actions">
            <button
              onClick={handleOneClickMint}
              disabled={isLoading || !nftName || !nftRecipient || !nftMedia}
            >
              {isLoading ? t("nft.mint.processing") : t("nft.mint.button")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染高级模式UI
  const renderAdvancedUI = () => {
    return (
      <div className="nft-minter-content">
        <div className="mint-form">
          <h3>{t("nft.mint.advanced.title")}</h3>

          <div className="form-group">
            <label>{t("nft.mint.recipient")}</label>
            <input
              type="text"
              value={nftRecipient}
              onChange={(e) => setNftRecipient(e.target.value)}
              placeholder={t("nft.mint.recipient.placeholder")}
            />
          </div>

          <div className="form-group">
            <label>{t("nft.mint.token.uri")}</label>
            <input
              type="text"
              value={nftTokenURI}
              onChange={(e) => setNftTokenURI(e.target.value)}
              placeholder={t("nft.mint.token.uri.placeholder")}
            />
          </div>

          {/* 为DRC1155添加数量输入 */}
          {(contractType === "DRC1155" || contractType === "ERC1155") && (
            <div className="form-group">
              <label htmlFor="totalSupply">{t("nft.mint.totalSupply")}</label>
              <input
                id="totalSupply"
                type="number"
                value={erc1155Amount}
                onChange={(e) => setErc1155Amount(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
          )}

          <div className="form-actions">
            <button
              onClick={() => handleMintNFT()}
              disabled={isLoading || !nftRecipient || !nftTokenURI}
            >
              {isLoading
                ? t("nft.mint.button.minting")
                : t("nft.mint.button.mint")}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <dialog
      ref={dialogRef}
      className="nft-minter-modal top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      onClick={(e) => {
        // Close dialog when clicking on backdrop
        if (e.target === dialogRef.current) {
          handleClose();
        }
      }}
    >
      <div className="nft-minter-content-wrapper">
        <div className="nft-minter-header">
          <h2>{t("nft.mint.title")}</h2>
          <div className="header-controls">
            <button className="close-button" onClick={handleClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
          </div>
        )}

        {/* 渲染当前选中的UI模式 */}
        {useSimpleUI ? renderSimpleUI() : renderAdvancedUI()}

        {/* 切换UI样式的按钮 */}
        <div className="ui-toggle">
          <button
            className="ui-toggle-btn"
            onClick={() => setUseSimpleUI(!useSimpleUI)}
          >
            {useSimpleUI
              ? t("nft.mint.switch.advanced")
              : t("nft.mint.switch.simple")}
          </button>
        </div>

        {successMessage && (
          <div className="success-message">
            <p>{t("nft.mint.success")}</p>
            {transactionHash && (
              <p>
                <a
                  href={getBlockExplorerUrl(
                    Number(chainId),
                    transactionHash,
                    "tx"
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("nft.mint.view.transaction")}
                </a>
              </p>
            )}
          </div>
        )}
      </div>
    </dialog>
  );
};
