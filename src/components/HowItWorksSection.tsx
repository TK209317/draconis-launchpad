"use client";

import { useLanguage } from "../contexts/LanguageContext";
import { HowItWorksStep } from "./HowItWorksStep";

export const HowItWorksSection = () => {
  const { t } = useLanguage();

  return (
    <section
      id="how-it-works"
      className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 mb-20"
    >
      <div className="max-w-4xl w-full flex flex-col items-center">
        {/* Section Header */}
        <div className="text-center">
          <p
            className="font-heading font-bold text-xl text-white/60"
            style={{
              marginBottom: "10px",
            }}
          >
            {t("howitworks.subtitle")}
          </p>
          <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-6">
            {t("howitworks.title")}
          </h2>
          <div className="w-60 h-[2px] bg-white mx-auto"></div>
        </div>

        {/* Steps */}
        <div className="flex flex-col w-full">
          <HowItWorksStep
            stepNumber={1}
            titleKey="howitworks.step1.title"
            descriptionKey="howitworks.step1.description"
            showConnector={true}
            
          />
          <HowItWorksStep
            stepNumber={2}
            titleKey="howitworks.step2.title"
            descriptionKey="howitworks.step2.description"
            showConnector={true}
          />
          <HowItWorksStep
            stepNumber={3}
            titleKey="howitworks.step3.title"
            descriptionKey="howitworks.step3.description"
            showConnector={false}
          />
        </div>
      </div>
    </section>
  );
};
