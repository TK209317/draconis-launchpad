"use client";

import { useState, useEffect, useRef } from "react";
import type { ContractInfo } from "../actions/contracts";
import { verifyContract } from "../actions/contracts";
import {
  getBlockExplorerUrl,
  getNetworkName,
} from "../services/utils";
import "../styles/MyContracts.css";
import { NFTMinter } from "./NFTMinter";
import { useLanguage } from "../contexts/LanguageContext";
import { getSession } from "../actions/auth";

interface MyContractsClientProps {
  ownerAddress: string;
  initialContracts: ContractInfo[];
}

export const MyContractsClient = ({
  ownerAddress,
  initialContracts,
}: MyContractsClientProps) => {
  const { t } = useLanguage();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [contracts, setContracts] = useState<ContractInfo[]>(initialContracts);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "DRC20" | "DRC721" | "DRC1155" | "RWA"
  >("all");
  const [selectedContract, setSelectedContract] = useState<ContractInfo | null>(
    null
  );
  const [showNFTMinter, setShowNFTMinter] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<{
    [address: string]: "idle" | "verifying" | "success" | "fail" | "timeout";
  }>({});
  const [verifyModalData, setVerifyModalData] = useState<{
    title: string;
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Update contracts when initialContracts change
  useEffect(() => {
    setContracts(initialContracts);

    // Initialize verify status from database
    const initialStatus: { [address: string]: "idle" | "verifying" | "success" | "fail" | "timeout" } = {};
    initialContracts.forEach((contract) => {
      if (contract.isVerified === "true") {
        initialStatus[contract.address] = "success";
      } else if (contract.isVerified === "verifying") {
        initialStatus[contract.address] = "verifying";
      } else if (contract.isVerified === "failed") {
        initialStatus[contract.address] = "fail";
      } else {
        initialStatus[contract.address] = "idle";
      }
    });
    setVerifyStatus(initialStatus);
  }, [initialContracts]);

  const filteredContracts = contracts
    .filter((contract) => {
      if (activeFilter === "all") return true;
      if (activeFilter === "DRC20")
        return contract.type === "DRC20" || contract.type === "ERC20";
      if (activeFilter === "DRC721")
        return contract.type === "DRC721" || contract.type === "ERC721";
      if (activeFilter === "DRC1155")
        return contract.type === "DRC1155" || contract.type === "ERC1155";
      if (activeFilter === "RWA") return contract.type === "RWA";
      return contract.type === activeFilter;
    })
    .sort((a, b) => b.createdAt - a.createdAt);

  const totalContracts = filteredContracts.length;
  const totalPages = Math.ceil(totalContracts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentContracts = filteredContracts.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilter]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  const getContractTypeLabel = (type: string) => {
    return t(`contract.type.${type.toLowerCase()}`);
  };

  const handleMintClick = (contract: ContractInfo) => {
    setSelectedContract(contract);
    setShowNFTMinter(true);
  };

  const handleCloseMinter = () => {
    setShowNFTMinter(false);
    setSelectedContract(null);
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 8)}...${address.substring(
      address.length - 6
    )}`;
  };

  const copyAddress = async (address: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(address);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = address;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (!successful) {
          throw new Error("复制失败");
        }
      }

      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (error) {
      console.error("复制地址失败:", error);
      const userConfirmed = window.confirm(
        `复制失败，是否手动复制地址？\n地址: ${address}`
      );
      if (userConfirmed) {
        const textArea = document.createElement("textarea");
        textArea.value = address;
        textArea.style.position = "fixed";
        textArea.style.top = "50%";
        textArea.style.left = "50%";
        textArea.style.transform = "translate(-50%, -50%)";
        textArea.style.zIndex = "9999";
        textArea.style.padding = "10px";
        textArea.style.border = "2px solid #007bff";
        textArea.style.borderRadius = "4px";
        textArea.style.fontSize = "14px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        setTimeout(() => {
          if (textArea.parentNode) {
            document.body.removeChild(textArea);
          }
        }, 3000);
      }
    }
  };

  const handleVerifyContract = async (contract: ContractInfo) => {
    // Check if user is signed in first
    const session = await getSession();
    if (!session) {
      setVerifyModalData({
        title: t("contracts.verify.fail"),
        message: "Please sign in first to verify your contract.",
        type: "error",
      });
      return;
    }

    setVerifyStatus((prev) => ({ ...prev, [contract.address]: "verifying" }));

    try {
      const result = await verifyContract(contract.address);

      if (result.success) {
        setVerifyStatus((prev) => ({
          ...prev,
          [contract.address]: "success",
        }));
        setVerifyModalData({
          title: t("contracts.verify.success"),
          message: `${contract.contractName} ${t(
            "contracts.verify.success.message"
          )}`,
          type: "success",
        });

        // Update the contract in the local state
        setContracts((prev) =>
          prev.map((c) =>
            c.address === contract.address
              ? { ...c, isVerified: "true" }
              : c
          )
        );
      } else {
        // Check if it's a timeout/processing status
        if (result.status === "verifying") {
          setVerifyStatus((prev) => ({
            ...prev,
            [contract.address]: "timeout",
          }));
          setVerifyModalData({
            title: t("contracts.verify.timeout"),
            message: result.error || t("contracts.verify.timeout.message"),
            type: "warning",
          });
        } else {
          setVerifyStatus((prev) => ({ ...prev, [contract.address]: "fail" }));
          setVerifyModalData({
            title: t("contracts.verify.fail"),
            message: result.error || t("contracts.verify.fail.message"),
            type: "error",
          });
        }
      }
    } catch (err: unknown) {
      setVerifyStatus((prev) => ({ ...prev, [contract.address]: "fail" }));
      const message =
        err instanceof Error ? err.message : t("contracts.verify.fail.message");
      setVerifyModalData({
        title: t("contracts.verify.fail"),
        message: message,
        type: "error",
      });
    }
  };

  const closeVerifyModal = () => {
    dialogRef.current?.close();
    setVerifyModalData(null);
  };

  useEffect(() => {
    if (verifyModalData && dialogRef.current) {
      dialogRef.current.showModal();
    }
  }, [verifyModalData]);

  return (
    <div className="my-contracts">
      <div className="filters">
        <button
          className={activeFilter === "all" ? "active" : ""}
          onClick={() => setActiveFilter("all")}
        >
          {t("contracts.filter.all")}
        </button>
        <button
          className={activeFilter === "DRC20" ? "active" : ""}
          onClick={() => setActiveFilter("DRC20")}
        >
          DRC20
        </button>
        <button
          className={activeFilter === "RWA" ? "active" : ""}
          onClick={() => setActiveFilter("RWA")}
        >
          RWA
        </button>
        <button
          className={activeFilter === "DRC721" ? "active" : ""}
          onClick={() => setActiveFilter("DRC721")}
        >
          DRC721
        </button>
        <button
          className={activeFilter === "DRC1155" ? "active" : ""}
          onClick={() => setActiveFilter("DRC1155")}
        >
          DRC1155
        </button>
      </div>

      {filteredContracts.length === 0 ? (
        <div className="no-contracts">
          <p>
            {activeFilter === "all"
              ? t("contracts.no.contracts")
              : t("contracts.no.filter.contracts").replace(
                  "{type}",
                  activeFilter
                )}
          </p>
        </div>
      ) : (
        <>
          <div className="contracts-list">
            {currentContracts.map((contract, index) => {
              const status = verifyStatus[contract.address] || "idle";
              let btnText = t("contracts.verify.button");
              let btnDisabled = false;
              let btnClassName = "verify-button";

              if (status === "verifying") {
                btnText = t("contracts.verify.verifying");
                btnDisabled = true;
              } else if (status === "success") {
                btnText = t("contracts.verify.button.verified");
                btnDisabled = true;
                btnClassName = "verify-button success";
              } else if (status === "fail" || status === "timeout") {
                btnText = t("contracts.verify.button");
                btnDisabled = false;
              }

              return (
                <div className="contract-card" key={index}>
                  <h3>{contract.contractName}</h3>
                  <div className="contract-details">
                    <p>
                      <strong>{t("contracts.type")}:</strong>{" "}
                      {getContractTypeLabel(contract.type)}
                    </p>
                    <p>
                      <strong>{t("contracts.address")}:</strong>
                      <span className="address-display">
                        {formatAddress(contract.address)}
                        <button
                          className="copy-button"
                          onClick={() => copyAddress(contract.address)}
                          title={t("contracts.copy")}
                        >
                          {copiedAddress === contract.address
                            ? t("contracts.copied")
                            : t("contracts.copy")}
                        </button>
                      </span>
                    </p>
                    <p>
                      <strong>{t("contracts.network")}:</strong>{" "}
                      {getNetworkName(contract.network.chainId)}
                    </p>
                    <p>
                      <strong>{t("contracts.deploy.time")}:</strong>{" "}
                      {formatDate(contract.createdAt)}
                    </p>
                  </div>
                  <div className="contract-actions">
                    <a
                      href={getBlockExplorerUrl(
                        contract.network.chainId,
                        contract.address
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("contracts.view.explorer")}
                    </a>
                    {(contract.type === "DRC721" ||
                      contract.type === "DRC1155") && (
                      <button
                        className="mint-button"
                        onClick={() => handleMintClick(contract)}
                      >
                        {t("contracts.mint.nft")}
                      </button>
                    )}
                    {(contract.type === "DRC20" ||
                      contract.type === "ERC20" ||
                      contract.type === "DRC721" ||
                      contract.type === "ERC721" ||
                      contract.type === "DRC1155" ||
                      contract.type === "ERC1155" ||
                      contract.type === "RWA") && (
                      <button
                        className={`${btnClassName} text-white`}
                        onClick={() => handleVerifyContract(contract)}
                        disabled={btnDisabled}
                      >
                        {btnText}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              >
                {t("contracts.pagination.previous")}
              </button>

              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const isVisible =
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 2 && page <= currentPage + 2);

                    if (!isVisible) {
                      if (
                        page === currentPage - 3 ||
                        page === currentPage + 3
                      ) {
                        return (
                          <span key={page} className="pagination-ellipsis">
                            ...
                          </span>
                        );
                      }
                      return null;
                    }

                    return (
                      <button
                        key={page}
                        className={`pagination-number ${
                          page === currentPage ? "active" : ""
                        }`}
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    );
                  }
                )}
              </div>

              <button
                className="pagination-btn"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                {t("contracts.pagination.next")}
              </button>
            </div>
          )}
        </>
      )}

      {showNFTMinter && selectedContract && (
        <NFTMinter
          contractAddress={selectedContract.address}
          contractType={selectedContract.type as "DRC721" | "DRC1155"}
          onClose={handleCloseMinter}
        />
      )}

      <dialog
        ref={dialogRef}
        className="verify-modal top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            closeVerifyModal();
          }
        }}
      >
        {verifyModalData && (
          <div className="verify-modal-content">
            <div className={`verify-modal-icon ${verifyModalData.type}`}>
              {verifyModalData.type === "success" && "✓"}
              {verifyModalData.type === "error" && "✕"}
              {verifyModalData.type === "warning" && "⚠"}
            </div>
            <h3 className="verify-modal-title">{verifyModalData.title}</h3>
            <p className="verify-modal-message">{verifyModalData.message}</p>
            <button className="verify-modal-close" onClick={closeVerifyModal}>
              {t("common.close")}
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
};
