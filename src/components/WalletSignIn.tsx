import { useAppKitAccount } from "@reown/appkit/react";

export const WalletSignIn = () => {
  const { isConnected } = useAppKitAccount();
  return (
    <>
      <div className="hidden md:flex">
        {isConnected && <appkit-network-button />}
        <appkit-button balance="hide" size="md" />
      </div>
      <div className="md:hidden flex flex-row gap-1">
        {isConnected && <appkit-network-button />}
        <appkit-button balance="hide" size="sm" />
      </div>
    </>
  );
};
