import Link from "next/link";
import { TokenCard } from "./TokenCard";

export const TokenCardsSection = () => {
  return (
    <section
      id="token-creators"
      className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 mb-20"
    >
      <div className="max-w-7xl w-full flex flex-col items-center">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          <Link href="/create/drc20">
            <TokenCard
              type="drc20"
              titleKey="card.drc20.title"
              subtitleKey="card.drc20.subtitle"
              order={1}
            />
          </Link>
          <Link href="/create/drc721">
            <TokenCard
              type="nft"
              titleKey="card.nft.title"
              subtitleKey="card.nft.subtitle"
              order={2}
            />
          </Link>
          <Link href="/create/rwa">
            <TokenCard
              type="rwa"
              titleKey="card.rwa.title"
              subtitleKey="card.rwa.subtitle"
              order={3}
            />
          </Link>
          <Link href="/create/drc1155">
            <TokenCard
              type="multi"
              titleKey="card.multi.title"
              subtitleKey="card.multi.subtitle"
              order={4}
            />
          </Link>
        </div>
      </div>
    </section>
  );
};
