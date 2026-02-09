"use client";

import { useState } from "react";
import { useLanguage } from "../contexts/LanguageContext";

interface FAQItemProps {
  questionKey: string;
  answerKey: string;
  number: number;
}

export const FAQItem = ({ questionKey, answerKey, number }: FAQItemProps) => {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      className="w-full text-left bg-transparent border-b border-white/10 hover:bg-white/5 transition-colors"
      onClick={() => setIsOpen(!isOpen)}
      aria-expanded={isOpen}
    >
      <div className="flex flex-col w-full">
        {/* Question Header */}
        <div className="flex justify-between items-center min-h-[66px] p-4 w-full">
          <div className="flex-1 font-heading font-normal text-xl text-white">
            <span className="leading-normal">
              {number}. {t(questionKey)}
            </span>
          </div>
          <div className="flex items-center justify-center ml-4 flex-shrink-0">
            <div
              className={`transition-transform duration-300 ${
                isOpen ? "" : "rotate-180 scale-y-[-1]"
              }`}
            >
              <svg
                className="w-[33px] h-[34px]"
                viewBox="0 0 33 34"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.5 8.5L16.5 25.5M16.5 25.5L8.5 17.5M16.5 25.5L24.5 17.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Answer - Collapsible */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <pre className="font-text font-normal text-xl leading-normal px-4 pb-4 text-white/80">
            {t(answerKey)}
          </pre>
        </div>
      </div>
    </button>
  );
};
