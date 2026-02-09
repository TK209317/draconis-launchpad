"use client";

import { useLanguage } from "../contexts/LanguageContext";

export const HeroSection = () => {
  const { t } = useLanguage();

  const handleCreateToken = () => {
    const tokenSection = document.getElementById("token-creators");
    tokenSection?.scrollIntoView({ behavior: "smooth" });
  };

  const handleLearnMore = () => {
    const howItWorksSection = document.getElementById("how-it-works");
    howItWorksSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="w-full flex items-center justify-center mb-20 mt-20">
      <div className="max-w-4xl w-full flex flex-col items-center text-center">
        <h1
          className="font-bold text-5xl sm:text-6xl text-transparent bg-gradient-to-b from-[#d4c5a0] via-[#8b7355] to-[#4a3f35] bg-clip-text leading-[1.2] !p-0 !m-0"
          style={{
            fontFamily:
              "'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', 'Inter', sans-serif",
          }}
        >
          {t("hero.title")}
        </h1>
        <div className="font-light text-xl text-white mb-6 max-w-3xl">
          <p>{t("hero.subtitle.line1")}</p>
          <p>{t("hero.subtitle.line2")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <button
            onClick={handleCreateToken}
            className="px-8 py-4 rounded-button bg-gradient-to-r from-draconis-blue to-draconis-purple text-white font-heading font-bold text-lg hover:opacity-90 transition-opacity"
          >
            {t("hero.cta.create")}
          </button>
          <button
            onClick={handleLearnMore}
            className="px-8 py-4 rounded-button border-2 border-white/30 text-white font-heading font-bold text-lg hover:bg-white/10 transition-colors"
          >
            {t("hero.cta.learn")}
          </button>
        </div>
      </div>
    </section>
  );
};
