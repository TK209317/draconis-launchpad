"use client";

import { useLanguage } from "../contexts/LanguageContext";
import { FAQItem } from "./FAQItem";
import { faqs } from "../data/faqs";

export const FAQSection = () => {
  const { t } = useLanguage();

  return (
    <section
      id="help"
      className="w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 mb-20"
    >
      <div className="max-w-4xl w-full flex flex-col items-center">
        <h2 className="font-heading font-bold text-4xl sm:text-5xl text-white mb-16 text-center">
          {t("faq.title")}
          <hr className="w-32 h-0.5 bg-white mx-auto mt-2 border-0 rounded" />
        </h2>
        <div className="flex flex-col w-full">
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              questionKey={faq.questionKey}
              answerKey={faq.answerKey}
              number={faq.id}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
