"use client";

import React from "react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useLanguage } from "../contexts/LanguageContext";
import { ChevronDown } from "lucide-react";
import "../styles/LanguageSwitcher.css";

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const selectLanguage = (lang: "zh" | "en") => {
    setLanguage(lang);
  };

  return (
    <Menu as="div" className="relative flex flex-row items-center gap-2">
      <MenuButton className="flex flex-row items-center gap-2 text-white my-auto focus:outline-none">
        <ChevronDown />
        {language === "zh" ? "中文" : "English"}
      </MenuButton>

      <MenuItems className="language-dropdown-menu focus:outline-none">
        <div className="dropdown-header">
          <span>{t("lang.select")}</span>
        </div>
        <MenuItem>
          {({ active }) => (
            <button
              className={`language-option ${
                language === "zh" ? "active" : ""
              } ${active ? "hover" : ""}`}
              onClick={() => selectLanguage("zh")}
            >
              <span className="lang-flag">🇨🇳</span>
              <span className="lang-name">{t("lang.chinese")}</span>
              {language === "zh" && <span className="check-mark">✓</span>}
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ active }) => (
            <button
              className={`language-option ${
                language === "en" ? "active" : ""
              } ${active ? "hover" : ""}`}
              onClick={() => selectLanguage("en")}
            >
              <span className="lang-flag">🇺🇸</span>
              <span className="lang-name">{t("lang.english")}</span>
              {language === "en" && <span className="check-mark">✓</span>}
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
};
