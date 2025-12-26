import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "zh-CN" | "zh-TW";

export const languageNames: Record<Language, string> = {
  en: "English",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
};

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 📝 翻译字典
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav / Sidebar
    "nav.appName": "CMI Dashboard",
    "nav.dashboard": "Dashboard",
    "nav.customers": "Customers",
    "nav.corporateTree": "Subsidiary Tree", // ✅ 已修改：Corporate Tree -> Subsidiary Tree
    "nav.geographic": "Geographic Map",
    "nav.aiAnalysis": "AI Analysis",
    "nav.push": "Push Notifications",
    "nav.news": "News Intelligence",
    "nav.opportunities": "Opportunities",
    "nav.pipeline": "Pipeline View",
    "nav.deals": "Deals",
    "nav.dataImport": "Data Import",
    "nav.competitors": "Competitors",
    "nav.mlAnalysis": "ML Analysis",

    // Common
    "common.signIn": "Sign In",
    "common.signOut": "Sign Out",
    "common.language": "Language",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.search": "Search...",
    "common.filter": "Filter",
    "common.export": "Export",

    // Dashboard
    "dashboard.stats": "Statistics",
    "dashboard.recentDeals": "Recent Deals",
    "dashboard.activeOpportunities": "Active Opportunities",
    "dashboard.totalRevenue": "Total Revenue",

    // ML Analysis Page
    "ml.title": "Global Strategy Dashboard",
    "ml.subtitle": "AI-Powered investment insights and project recommendations based on BHI data",
    "ml.totalProjects": "Total Projects",
    "ml.totalInvestment": "Total Investment",
    "ml.aiMatches": "AI High Matches",
    "ml.searchPlaceholder": "Search projects, countries or products...",
    "ml.sectorChart": "Investment by Sector",
    "ml.sectorPie": "Sector Distribution",
  },
  "zh-CN": {
    // 导航栏
    "nav.appName": "CMI 战略仪表盘",
    "nav.dashboard": "总览仪表盘",
    "nav.customers": "客户管理",
    "nav.corporateTree": "子公司树状图", // ✅ 已修改：股权穿透图 -> 子公司树状图
    "nav.geographic": "地理分布图",
    "nav.aiAnalysis": "AI 智能分析",
    "nav.push": "消息推送",
    "nav.news": "新闻情报",
    "nav.opportunities": "商机管理",
    "nav.pipeline": "销售漏斗",
    "nav.deals": "成交订单",
    "nav.dataImport": "数据导入",
    "nav.competitors": "竞争对手",
    "nav.mlAnalysis": "机器学习分析",

    // 通用
    "common.signIn": "登录",
    "common.signOut": "退出登录",
    "common.language": "语言",
    "common.loading": "加载中...",
    "common.error": "发生错误",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "删除",
    "common.edit": "编辑",
    "common.view": "查看",
    "common.search": "搜索...",
    "common.filter": "筛选",
    "common.export": "导出",

    // Dashboard
    "dashboard.stats": "核心指标",
    "dashboard.recentDeals": "最近成交",
    "dashboard.activeOpportunities": "活跃商机",
    "dashboard.totalRevenue": "总营收",

    // ML Analysis Page
    "ml.title": "全球战略仪表盘",
    "ml.subtitle": "基于 BHI 项目库与 AI 混合推荐模型的商机分析系统",
    "ml.totalProjects": "项目总数",
    "ml.totalInvestment": "涉及投资总额",
    "ml.aiMatches": "AI 高匹配商机",
    "ml.searchPlaceholder": "搜索项目、国家或推荐产品...",
    "ml.sectorChart": "行业投资热度 (Top 8)",
    "ml.sectorPie": "行业分布占比",
  },
  "zh-TW": {
    "nav.appName": "CMI 戰略儀表板",
    "nav.dashboard": "總覽儀表板",
    "nav.customers": "客戶管理",
    "nav.corporateTree": "子公司樹狀圖", // ✅ 已修改：股權穿透圖 -> 子公司樹狀圖
    "nav.geographic": "地理分佈圖",
    "nav.aiAnalysis": "AI 智能分析",
    "nav.push": "消息推送",
    "nav.news": "新聞情報",
    "nav.opportunities": "商機管理",
    "nav.pipeline": "銷售漏斗",
    "nav.deals": "成交訂單",
    "nav.dataImport": "數據導入",
    "nav.competitors": "競爭對手",
    "nav.mlAnalysis": "機器學習分析",

    "common.signIn": "登入",
    "common.signOut": "登出",
    "common.language": "語言",
    "common.loading": "加載中...",
    "common.error": "發生錯誤",
    "common.save": "保存",
    "common.cancel": "取消",
    "common.delete": "刪除",
    "common.edit": "編輯",
    "common.view": "查看",
    "common.search": "搜尋...",
    "common.filter": "篩選",
    "common.export": "導出",

    "dashboard.stats": "核心指標",
    "dashboard.recentDeals": "最近成交",
    "dashboard.activeOpportunities": "活躍商機",
    "dashboard.totalRevenue": "總營收",

    "ml.title": "全球戰略儀表板",
    "ml.subtitle": "基於 BHI 項目庫與 AI 混合推薦模型的商機分析系統",
    "ml.totalProjects": "項目總數",
    "ml.totalInvestment": "涉及投資總額",
    "ml.aiMatches": "AI 高匹配商機",
    "ml.searchPlaceholder": "搜尋項目、國家或推薦產品...",
    "ml.sectorChart": "行業投資熱度 (Top 8)",
    "ml.sectorPie": "行業分佈佔比",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    // Try to get from localStorage, fallback to browser preference, then 'en'
    const saved = localStorage.getItem("language") as Language;
    if (saved && (saved === "en" || saved === "zh-CN" || saved === "zh-TW")) return saved;

    if (typeof navigator !== "undefined") {
      if (navigator.language.startsWith("zh")) {
        return navigator.language.includes("TW") || navigator.language.includes("HK") ? "zh-TW" : "zh-CN";
      }
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  const t = (key: string): string => {
    const translation = translations[language][key];
    if (!translation) {
      // Fallback to English if missing in current language
      const fallback = translations["en"][key];
      // console.warn(`Missing translation for key: ${key} in language: ${language}`);
      return fallback || key;
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}