"use client";

import React from 'react';
import { getBlockExplorerUrl } from '../services/utils';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/SuccessModal.css';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractAddress: string;
  transactionHash: string;
  chainId: number;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  contractAddress,
  transactionHash,
  chainId
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // 可以添加一个简单的提示，但为了简洁我们暂时跳过
    } catch (err) {
      // 如果clipboard API不可用，回退到旧方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{t('deployment.successful')}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="success-info">
            <div className="info-item">
              <strong>{t('deployment.contract.address')}:</strong>
              <div 
                className="address-value" 
                onClick={() => copyToClipboard(contractAddress)}
                title="点击复制地址"
              >
                {contractAddress}
              </div>
            </div>
            
            <div className="info-item">
              <strong>{t('deployment.transaction.hash')}:</strong>
              <div 
                className="hash-value"
                onClick={() => copyToClipboard(transactionHash)}
                title="点击复制交易哈希"
              >
                {transactionHash}
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <a
              href={getBlockExplorerUrl(chainId, contractAddress)}
              target="_blank"
              rel="noopener noreferrer"
              className="view-contract-btn"
            >
              {t('deployment.view.contract')}
            </a>
            <button className="close-btn" onClick={onClose}>
              {t('common.close.text')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 