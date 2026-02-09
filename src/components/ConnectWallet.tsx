"use client";

import { useAppKitAccount } from "@reown/appkit/react";
import { useLanguage } from "../contexts/LanguageContext";

export const ConnectWallet = () => {
  const { isConnected } = useAppKitAccount();
  const { t } = useLanguage();

  if (isConnected) return null;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-[400px] p-10"
      style={{
        background: 'rgba(11, 11, 35, 0.8)',
        borderRadius: '15px',
        boxShadow: '0px 0px 30px 0px rgba(26, 54, 109, 0.5), 0px 0px 50px 0px #3e43ae',
      }}
    >
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
            />
          </svg>
        </div>

        <div className="space-y-2">
          <h2
            className="text-2xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #e1d7b4, #7b7662)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            {t("connectWallet.title")}
          </h2>
          <p style={{ color: '#cfcfcf' }}>
            {t("connectWallet.description")}
          </p>
        </div>

        <div className="w-full flex justify-center">
          <appkit-button />
        </div>

        <p className="text-sm" style={{ color: '#cfcfcf' }}>
          {t("connectWallet.hint")}
        </p>
      </div>
    </div>
  );
};
