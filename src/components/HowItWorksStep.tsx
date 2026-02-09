"use client";

import { useLanguage } from "../contexts/LanguageContext";

interface HowItWorksStepProps {
  stepNumber: number;
  titleKey: string;
  descriptionKey: string;
  showConnector?: boolean;
}

function ConnectingDots() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="17"
      height="79"
      viewBox="0 0 17 79"
      fill="none"
    >
      <g opacity="0.5">
        <circle
          cx="8.5"
          cy="8.5"
          r="8.5"
          fill="url(#paint0_linear_2529_4392)"
        />
        <circle
          cx="8.5"
          cy="39.5"
          r="8.5"
          fill="url(#paint1_linear_2529_4392)"
        />
        <circle
          cx="8.5"
          cy="70.5"
          r="8.5"
          fill="url(#paint2_linear_2529_4392)"
        />
      </g>
      <defs>
        <linearGradient
          id="paint0_linear_2529_4392"
          x1="8.5"
          y1="0"
          x2="8.5"
          y2="17"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.00961538" stopColor="white" />
          <stop offset="1" stopColor="#1A366D" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_2529_4392"
          x1="8.5"
          y1="31"
          x2="8.5"
          y2="48"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.00961538" stopColor="white" />
          <stop offset="1" stopColor="#1A366D" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_2529_4392"
          x1="8.5"
          y1="62"
          x2="8.5"
          y2="79"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.00961538" stopColor="white" />
          <stop offset="1" stopColor="#1A366D" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export const HowItWorksStep = ({
  stepNumber,
  titleKey,
  descriptionKey,
  showConnector = false,
}: HowItWorksStepProps) => {
  const { t } = useLanguage();

  return (
    <div
      className="relative w-full gap-10"
      style={{
        paddingTop: "10px",
        paddingBottom: "10px",
      }}
    >
      {/* Step Number */}
      <div
        className="flex flex-col items-start flex-shrink-0"
        style={{
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
      >
        <p className="font-heading font-bold text-xl text-white/60">step</p>
        <div className="flex flex-row gap-5 items-center">
          <p className="font-heading font-bold text-[40px] leading-tight text-white">
            {String(stepNumber).padStart(2, "0")}
          </p>

          <div className="">
            {/* Step Title */}
            <h3 className="font-heading font-bold text-2xl text-white mb-6">
              {t(titleKey)}
            </h3>
          </div>
        </div>
      </div>

      {/* Connector Dots */}
      {showConnector && (
        <div className="flex flex-row gap-5 items-center">
          <div className="flex flex-col items-center gap-2 ml-[40px] my-8">
            <ConnectingDots />
          </div>

          <p className="font-heading font-light text-xl text-white/90 leading-relaxed max-w-lg">
            {t(descriptionKey)}
          </p>
        </div>
      )}
    </div>
  );
};
