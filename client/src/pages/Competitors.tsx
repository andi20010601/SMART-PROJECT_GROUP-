import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Building2,
  Globe,
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  ExternalLink,
  Users,
  DollarSign,
  MapPin,
  Newspaper,
  Package,
  Filter,
  Swords,
  Handshake,
  Target,
  AlertTriangle,
  Lightbulb,
  Brain,
  ArrowRight,
  Calendar,
  Briefcase,
  ChevronRight,
  Zap,
  Shield,
  TrendingUp as Trend,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Enhanced competitor data with international versions
const telecomCompetitors = [
  {
    id: 1,
    name: "China Telecom Global",
    nameCn: "中国电信国际",
    shortName: "CTG",
    country: "China",
    headquarters: "Hong Kong",
    website: "https://www.chinatelecomglobal.com",
    stockSymbol: "0728.HK",
    description: "International arm of China Telecom, providing global connectivity, data center, and cloud services across 50+ countries.",
    revenue: 28000000000,
    revenueCurrency: "CNY",
    revenueYear: "2023",
    employees: 8500,
    marketPosition: "challenger",
    brandColor: "#0066CC",
    strengths: ["Strong Asia-Europe connectivity", "Competitive pricing", "Government backing", "Growing data center footprint"],
    weaknesses: ["Geopolitical challenges", "Limited brand recognition in West", "Regulatory scrutiny"],
    // Enhanced: Detailed project tracking
    projects: [
      {
        id: "p1",
        name: "Asia-Africa-Europe 1 (AAE-1) Submarine Cable",
        status: "operational",
        type: "infrastructure",
        investment: 500000000,
        currency: "USD",
        startDate: "2017-01",
        endDate: "2017-07",
        regions: ["Asia", "Middle East", "Africa", "Europe"],
        description: "25,000km submarine cable connecting Hong Kong to France via 19 landing points",
        partners: ["China Unicom Global", "Ooredoo", "PCCW"],
        ourOpportunity: "potential_partner",
      },
      {
        id: "p2",
        name: "Middle East Data Center Expansion",
        status: "in_progress",
        type: "data_center",
        investment: 200000000,
        currency: "USD",
        startDate: "2024-03",
        endDate: "2025-12",
        regions: ["Middle East", "UAE", "Saudi Arabia"],
        description: "Building 3 new data centers in Dubai, Riyadh, and Doha",
        partners: ["Local telcos"],
        ourOpportunity: "direct_competition",
      },
      {
        id: "p3",
        name: "Southeast Asia Cloud Platform",
        status: "planning",
        type: "cloud",
        investment: 150000000,
        currency: "USD",
        startDate: "2025-Q1",
        endDate: "2026-Q4",
        regions: ["Southeast Asia", "Singapore", "Thailand", "Indonesia"],
        description: "Launching cloud services targeting Chinese enterprises expanding to SEA",
        partners: [],
        ourOpportunity: "cooperation",
      },
    ],
    recentNews: [
      { title: "CTG wins major connectivity contract in Middle East", date: "2024-12-01", type: "financial", impact: "high" },
      { title: "New PoP launched in Frankfurt for European expansion", date: "2024-11-15", type: "expansion", impact: "medium" },
      { title: "Partnership with local telco in Saudi Arabia announced", date: "2024-11-05", type: "partnership", impact: "high" },
    ],
    // Enhanced: Relationship analysis with us
    relationshipAnalysis: {
      overallRelation: "mixed", // competition, cooperation, mixed
      competitionScore: 75, // 0-100
      cooperationScore: 40,
      threatLevel: "high",
      conflictAreas: ["Middle East data centers", "SEA enterprise connectivity", "China-Europe routes"],
      cooperationAreas: ["Submarine cable sharing", "Peering agreements", "Joint enterprise solutions"],
      opportunities: [
        "Partner on AAE-1 capacity sales",
        "Joint bid for government projects",
        "Cross-sell complementary services",
      ],
      aiInsights: [
        "CTG is aggressively expanding in Middle East - recommend accelerating our Dubai DC plans",
        "Their SEA cloud platform targets same customer segment - consider differentiation strategy",
        "Potential partnership opportunity in submarine cable maintenance services",
      ],
    },
  },
  {
    id: 2,
    name: "China Unicom Global",
    nameCn: "中国联通国际",
    shortName: "CUG",
    country: "China",
    headquarters: "Hong Kong",
    website: "https://www.chinaunicomglobal.com",
    stockSymbol: "0762.HK",
    description: "International subsidiary of China Unicom, offering global network, ICT, and cloud services to enterprises.",
    revenue: 18000000000,
    revenueCurrency: "CNY",
    revenueYear: "2023",
    employees: 5200,
    marketPosition: "challenger",
    brandColor: "#E60012",
    strengths: ["Strong enterprise focus", "Flexible partnerships", "Growing international network"],
    weaknesses: ["Smaller scale than CTG", "Limited brand awareness", "Resource constraints"],
    projects: [
      {
        id: "p1",
        name: "Europe Enterprise Cloud Gateway",
        status: "operational",
        type: "cloud",
        investment: 80000000,
        currency: "USD",
        startDate: "2023-06",
        endDate: "2024-03",
        regions: ["Europe", "UK", "Germany", "France"],
        description: "Cloud gateway services for Chinese enterprises operating in Europe",
        partners: ["AWS", "Azure"],
        ourOpportunity: "cooperation",
      },
      {
        id: "p2",
        name: "Africa Network Expansion",
        status: "in_progress",
        type: "network",
        investment: 120000000,
        currency: "USD",
        startDate: "2024-01",
        endDate: "2025-06",
        regions: ["Africa", "Kenya", "Nigeria", "South Africa"],
        description: "Expanding network PoPs and partnerships across key African markets",
        partners: ["MTN", "Safaricom"],
        ourOpportunity: "potential_partner",
      },
    ],
    recentNews: [
      { title: "CUG launches SD-WAN service for multinational enterprises", date: "2024-11-28", type: "product_launch", impact: "medium" },
      { title: "New partnership with African telecom operators", date: "2024-11-10", type: "partnership", impact: "high" },
    ],
    relationshipAnalysis: {
      overallRelation: "cooperation",
      competitionScore: 55,
      cooperationScore: 65,
      threatLevel: "medium",
      conflictAreas: ["Enterprise connectivity in Europe", "SD-WAN services"],
      cooperationAreas: ["Africa market entry", "Joint submarine cable investments", "Reseller partnerships"],
      opportunities: [
        "Reseller agreement for Africa services",
        "Joint marketing to Chinese enterprises",
        "Technology partnership on SD-WAN",
      ],
      aiInsights: [
        "CUG is more open to partnerships than CTG - prioritize relationship building",
        "Their Africa expansion aligns with our strategy - explore joint venture",
        "SD-WAN overlap is manageable through market segmentation",
      ],
    },
  },
  {
    id: 3,
    name: "Singtel",
    nameCn: "新加坡电信",
    shortName: "Singtel",
    country: "Singapore",
    headquarters: "Singapore",
    website: "https://www.singtel.com",
    stockSymbol: "Z74.SI",
    description: "Asia's leading communications technology group with presence across Asia, Australia, and Africa.",
    revenue: 15200000000,
    revenueCurrency: "SGD",
    revenueYear: "2023",
    employees: 23000,
    marketPosition: "leader",
    brandColor: "#FF0000",
    strengths: ["Regional leadership", "Strong enterprise solutions", "Digital transformation expertise", "NCS subsidiary"],
    weaknesses: ["Mature home market", "Regulatory challenges in some markets", "Competition from hyperscalers"],
    projects: [
      {
        id: "p1",
        name: "Regional Data Center Network",
        status: "operational",
        type: "data_center",
        investment: 500000000,
        currency: "SGD",
        startDate: "2022-01",
        endDate: "2024-06",
        regions: ["Singapore", "Thailand", "Indonesia", "Philippines"],
        description: "Network of interconnected data centers across ASEAN",
        partners: ["Keppel DC", "ST Telemedia"],
        ourOpportunity: "direct_competition",
      },
      {
        id: "p2",
        name: "5G Enterprise Solutions",
        status: "in_progress",
        type: "5g",
        investment: 300000000,
        currency: "SGD",
        startDate: "2024-01",
        endDate: "2026-12",
        regions: ["Singapore", "Australia"],
        description: "Private 5G networks and edge computing for enterprises",
        partners: ["Ericsson", "Nokia"],
        ourOpportunity: "cooperation",
      },
    ],
    recentNews: [
      { title: "Singtel acquires cybersecurity firm in Australia", date: "2024-12-05", type: "acquisition", impact: "high" },
      { title: "NCS wins major government digital transformation contract", date: "2024-11-20", type: "financial", impact: "high" },
    ],
    relationshipAnalysis: {
      overallRelation: "competition",
      competitionScore: 80,
      cooperationScore: 30,
      threatLevel: "high",
      conflictAreas: ["ASEAN data centers", "Enterprise connectivity", "Managed services"],
      cooperationAreas: ["Peering in Singapore", "Submarine cable consortium"],
      opportunities: [
        "Niche market segments they don't serve",
        "China connectivity where we have advantage",
        "Partnership on specific verticals",
      ],
      aiInsights: [
        "Singtel is our primary competitor in ASEAN - focus on differentiation",
        "Their NCS acquisition strengthens enterprise position - monitor closely",
        "Opportunity in China-ASEAN corridor where we have stronger presence",
      ],
    },
  },
  {
    id: 4,
    name: "NTT",
    nameCn: "日本电信电话",
    shortName: "NTT",
    country: "Japan",
    headquarters: "Tokyo, Japan",
    website: "https://www.ntt.co.jp",
    stockSymbol: "9432.T",
    description: "Japan's largest telecommunications company with global IT services and data center operations.",
    revenue: 13100000000000,
    revenueCurrency: "JPY",
    revenueYear: "2023",
    employees: 330000,
    marketPosition: "leader",
    brandColor: "#0068B7",
    strengths: ["Global IT services", "Strong R&D", "Extensive data center network", "Enterprise relationships"],
    weaknesses: ["Complex organizational structure", "Slow decision making", "Premium pricing"],
    projects: [
      {
        id: "p1",
        name: "Global Data Center Expansion",
        status: "in_progress",
        type: "data_center",
        investment: 7000000000,
        currency: "USD",
        startDate: "2023-01",
        endDate: "2027-12",
        regions: ["Global", "Americas", "Europe", "Asia"],
        description: "Expanding data center capacity by 20% globally over 5 years",
        partners: [],
        ourOpportunity: "direct_competition",
      },
      {
        id: "p2",
        name: "IOWN Initiative",
        status: "in_progress",
        type: "technology",
        investment: 4000000000,
        currency: "USD",
        startDate: "2020-01",
        endDate: "2030-12",
        regions: ["Global"],
        description: "Next-generation optical network technology development",
        partners: ["Intel", "Sony"],
        ourOpportunity: "watch",
      },
    ],
    recentNews: [
      { title: "NTT expands data center presence in Southeast Asia", date: "2024-12-03", type: "expansion", impact: "high" },
      { title: "New AI-powered network management platform launched", date: "2024-11-25", type: "technology", impact: "medium" },
    ],
    relationshipAnalysis: {
      overallRelation: "competition",
      competitionScore: 70,
      cooperationScore: 35,
      threatLevel: "high",
      conflictAreas: ["Global data centers", "Enterprise managed services", "Cloud connectivity"],
      cooperationAreas: ["Japan market access", "Technology licensing", "Joint R&D"],
      opportunities: [
        "Partner for Japan market entry",
        "IOWN technology collaboration",
        "Complementary geographic coverage",
      ],
      aiInsights: [
        "NTT's massive DC investment poses long-term competitive threat",
        "IOWN technology could disrupt market - recommend monitoring",
        "Japan market partnership could be mutually beneficial",
      ],
    },
  },
  {
    id: 5,
    name: "Deutsche Telekom",
    nameCn: "德国电信",
    shortName: "DT",
    country: "Germany",
    headquarters: "Bonn, Germany",
    website: "https://www.telekom.com",
    stockSymbol: "DTE.DE",
    description: "Europe's largest telecommunications company with significant US presence through T-Mobile.",
    revenue: 112000000000,
    revenueCurrency: "EUR",
    revenueYear: "2023",
    employees: 206000,
    marketPosition: "leader",
    brandColor: "#E20074",
    strengths: ["T-Mobile US success", "Strong European position", "5G leadership", "Brand recognition"],
    weaknesses: ["European market saturation", "Regulatory pressure", "Legacy infrastructure costs"],
    projects: [
      {
        id: "p1",
        name: "European Fiber Network",
        status: "in_progress",
        type: "infrastructure",
        investment: 30000000000,
        currency: "EUR",
        startDate: "2021-01",
        endDate: "2030-12",
        regions: ["Germany", "Europe"],
        description: "Massive fiber rollout across Germany and Europe",
        partners: [],
        ourOpportunity: "watch",
      },
      {
        id: "p2",
        name: "T-Systems Cloud Transformation",
        status: "in_progress",
        type: "cloud",
        investment: 2000000000,
        currency: "EUR",
        startDate: "2023-01",
        endDate: "2026-12",
        regions: ["Europe", "Global"],
        description: "Repositioning T-Systems as cloud and digital transformation leader",
        partners: ["Google Cloud", "SAP"],
        ourOpportunity: "cooperation",
      },
    ],
    recentNews: [
      { title: "T-Mobile US continues 5G network expansion", date: "2024-12-02", type: "expansion", impact: "medium" },
      { title: "Deutsche Telekom invests in European fiber network", date: "2024-11-18", type: "strategy", impact: "high" },
    ],
    relationshipAnalysis: {
      overallRelation: "mixed",
      competitionScore: 50,
      cooperationScore: 55,
      threatLevel: "medium",
      conflictAreas: ["European enterprise market", "Global connectivity"],
      cooperationAreas: ["China-Europe connectivity", "Wholesale services", "Technology partnerships"],
      opportunities: [
        "China-Europe connectivity partnership",
        "Reseller agreement for German market",
        "Joint enterprise solutions",
      ],
      aiInsights: [
        "DT's focus on Europe/US leaves Asia opportunity for us",
        "T-Systems partnership could accelerate European expansion",
        "Their cloud transformation aligns with our capabilities",
      ],
    },
  },
];

const integratorCompetitors = [
  {
    id: 6,
    name: "China Comservice",
    nameCn: "中通服",
    shortName: "CCS",
    country: "China",
    headquarters: "Beijing, China",
    website: "https://www.chinaccs.com.hk",
    stockSymbol: "0552.HK",
    description: "Leading telecommunications infrastructure services provider in China with growing international presence.",
    revenue: 156000000000,
    revenueCurrency: "CNY",
    revenueYear: "2023",
    employees: 180000,
    marketPosition: "leader",
    brandColor: "#003399",
    strengths: ["Telecom expertise", "Large workforce", "Government relationships", "Full-service capability"],
    weaknesses: ["Margin pressure", "Labor intensive", "Limited international brand"],
    projects: [
      {
        id: "p1",
        name: "Belt and Road Infrastructure Projects",
        status: "in_progress",
        type: "infrastructure",
        investment: 500000000,
        currency: "USD",
        startDate: "2020-01",
        endDate: "2025-12",
        regions: ["Southeast Asia", "Central Asia", "Africa"],
        description: "Telecom infrastructure construction along Belt and Road countries",
        partners: ["Huawei", "ZTE"],
        ourOpportunity: "potential_partner",
      },
      {
        id: "p2",
        name: "Smart City Solutions",
        status: "in_progress",
        type: "smart_city",
        investment: 200000000,
        currency: "CNY",
        startDate: "2024-01",
        endDate: "2026-12",
        regions: ["China", "Southeast Asia"],
        description: "Integrated smart city solutions including IoT, surveillance, and connectivity",
        partners: [],
        ourOpportunity: "cooperation",
      },
    ],
    recentNews: [
      { title: "China Comservice wins major 5G infrastructure contract", date: "2024-11-30", type: "financial", impact: "high" },
      { title: "Expansion into smart city projects in Southeast Asia", date: "2024-11-12", type: "expansion", impact: "medium" },
    ],
    relationshipAnalysis: {
      overallRelation: "cooperation",
      competitionScore: 40,
      cooperationScore: 70,
      threatLevel: "low",
      conflictAreas: ["Infrastructure services in some markets"],
      cooperationAreas: ["Subcontracting", "Joint project delivery", "Technology integration"],
      opportunities: [
        "Subcontract infrastructure work",
        "Partner on Belt and Road projects",
        "Joint smart city bids",
      ],
      aiInsights: [
        "CCS is more partner than competitor - strengthen relationship",
        "Their Belt and Road projects create connectivity demand for us",
        "Smart city collaboration could open new revenue streams",
      ],
    },
  },
  {
    id: 7,
    name: "Equinix",
    nameCn: "Equinix",
    shortName: "EQIX",
    country: "USA",
    headquarters: "Redwood City, California, USA",
    website: "https://www.equinix.com",
    stockSymbol: "EQIX",
    description: "World's largest data center and colocation infrastructure provider with global footprint.",
    revenue: 8100000000,
    revenueCurrency: "USD",
    revenueYear: "2023",
    employees: 13000,
    marketPosition: "leader",
    brandColor: "#ED1C24",
    strengths: ["Global footprint", "Premium positioning", "Ecosystem connections", "Financial strength"],
    weaknesses: ["High pricing", "Capacity constraints in key markets", "Competition from hyperscalers"],
    projects: [
      {
        id: "p1",
        name: "Asia Pacific Expansion",
        status: "in_progress",
        type: "data_center",
        investment: 1500000000,
        currency: "USD",
        startDate: "2023-01",
        endDate: "2026-12",
        regions: ["Singapore", "Hong Kong", "Tokyo", "Sydney"],
        description: "Adding 500MW of capacity across Asia Pacific markets",
        partners: [],
        ourOpportunity: "direct_competition",
      },
      {
        id: "p2",
        name: "Equinix Fabric Expansion",
        status: "operational",
        type: "network",
        investment: 300000000,
        currency: "USD",
        startDate: "2022-01",
        endDate: "2024-12",
        regions: ["Global"],
        description: "Expanding software-defined interconnection platform globally",
        partners: ["Major cloud providers"],
        ourOpportunity: "cooperation",
      },
    ],
    recentNews: [
      { title: "Equinix opens new data center in Singapore", date: "2024-12-04", type: "expansion", impact: "high" },
      { title: "Partnership with major cloud providers for hybrid cloud", date: "2024-11-22", type: "partnership", impact: "medium" },
    ],
    relationshipAnalysis: {
      overallRelation: "mixed",
      competitionScore: 65,
      cooperationScore: 50,
      threatLevel: "medium",
      conflictAreas: ["Data center colocation", "Interconnection services"],
      cooperationAreas: ["Cross-connect partnerships", "Ecosystem participation", "Joint customer solutions"],
      opportunities: [
        "Become anchor tenant in new facilities",
        "Equinix Fabric integration",
        "Joint enterprise solutions",
      ],
      aiInsights: [
        "Equinix's premium pricing leaves room for competitive positioning",
        "Their ecosystem approach means partnership is viable",
        "Focus on markets where they have capacity constraints",
      ],
    },
  },
  {
    id: 8,
    name: "Alibaba Cloud",
    nameCn: "阿里云",
    shortName: "Aliyun",
    country: "China",
    headquarters: "Hangzhou, China",
    website: "https://www.alibabacloud.com",
    stockSymbol: "BABA",
    description: "Asia Pacific's leading cloud computing platform with growing global presence.",
    revenue: 106000000000,
    revenueCurrency: "CNY",
    revenueYear: "2023",
    employees: 25000,
    marketPosition: "leader",
    brandColor: "#FF6A00",
    strengths: ["APAC cloud leader", "AI capabilities", "E-commerce integration", "Competitive pricing"],
    weaknesses: ["US market challenges", "Regulatory concerns", "Profitability pressure"],
    projects: [
      {
        id: "p1",
        name: "International Cloud Expansion",
        status: "in_progress",
        type: "cloud",
        investment: 2000000000,
        currency: "USD",
        startDate: "2023-01",
        endDate: "2026-12",
        regions: ["Southeast Asia", "Middle East", "Europe"],
        description: "Expanding cloud infrastructure and services outside China",
        partners: [],
        ourOpportunity: "direct_competition",
      },
      {
        id: "p2",
        name: "Qwen AI Platform",
        status: "operational",
        type: "ai",
        investment: 500000000,
        currency: "USD",
        startDate: "2023-01",
        endDate: "ongoing",
        regions: ["Global"],
        description: "Large language model and AI services platform",
        partners: [],
        ourOpportunity: "cooperation",
      },
    ],
    recentNews: [
      { title: "Alibaba Cloud launches Qwen 2.5 AI model", date: "2024-12-01", type: "technology", impact: "high" },
      { title: "New data centers announced for Middle East expansion", date: "2024-11-16", type: "expansion", impact: "high" },
    ],
    relationshipAnalysis: {
      overallRelation: "competition",
      competitionScore: 75,
      cooperationScore: 35,
      threatLevel: "high",
      conflictAreas: ["Cloud services", "Enterprise solutions", "AI services"],
      cooperationAreas: ["Connectivity to Alibaba Cloud", "Hybrid cloud solutions"],
      opportunities: [
        "Connectivity partnership for cloud access",
        "Hybrid cloud integration services",
        "AI API integration",
      ],
      aiInsights: [
        "Alibaba Cloud is aggressive in international expansion - key competitor",
        "Their AI capabilities (Qwen) could be leveraged through partnership",
        "Focus on connectivity layer where we have advantage",
      ],
    },
  },
];

// Relationship type colors and labels
const relationshipConfig = {
  direct_competition: { color: "#EF4444", label: "Direct Competition", labelCn: "直接竞争", icon: Swords },
  cooperation: { color: "#22C55E", label: "Cooperation Opportunity", labelCn: "合作机会", icon: Handshake },
  potential_partner: { color: "#3B82F6", label: "Potential Partner", labelCn: "潜在合作", icon: Users },
  watch: { color: "#F59E0B", label: "Monitor", labelCn: "持续关注", icon: Target },
};

const threatColors = {
  high: "#EF4444",
  medium: "#F59E0B",
  low: "#22C55E",
};

export default function Competitors() {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState("telecom");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompetitor, setSelectedCompetitor] = useState<typeof telecomCompetitors[0] | null>(null);
  const [detailTab, setDetailTab] = useState("overview");

  const allCompetitors = activeTab === "telecom" ? telecomCompetitors : integratorCompetitors;

  const filteredCompetitors = allCompetitors.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.nameCn.includes(searchTerm) ||
    c.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatRevenue = (revenue: number, currency: string) => {
    if (currency === "CNY" || currency === "JPY") {
      if (revenue >= 1000000000000) {
        return `${(revenue / 1000000000000).toFixed(1)}T ${currency}`;
      }
      return `${(revenue / 1000000000).toFixed(0)}B ${currency}`;
    }
    return `${(revenue / 1000000000).toFixed(1)}B ${currency}`;
  };

  const formatInvestment = (amount: number, currency: string) => {
    if (amount >= 1000000000) {
      return `${(amount / 1000000000).toFixed(1)}B ${currency}`;
    }
    return `${(amount / 1000000).toFixed(0)}M ${currency}`;
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; label: string }> = {
      operational: { color: "bg-green-100 text-green-800", label: "Operational" },
      in_progress: { color: "bg-blue-100 text-blue-800", label: "In Progress" },
      planning: { color: "bg-yellow-100 text-yellow-800", label: "Planning" },
    };
    return config[status] || config.planning;
  };

  const getOpportunityConfig = (opp: string) => {
    return relationshipConfig[opp as keyof typeof relationshipConfig] || relationshipConfig.watch;
  };

  // Radar chart data for selected competitor
  const getRadarData = (competitor: typeof telecomCompetitors[0]) => {
    const rel = competitor.relationshipAnalysis;
    return [
      { dimension: "Competition", value: rel.competitionScore, fullMark: 100 },
      { dimension: "Cooperation", value: rel.cooperationScore, fullMark: 100 },
      { dimension: "Market Overlap", value: rel.competitionScore * 0.8, fullMark: 100 },
      { dimension: "Tech Synergy", value: rel.cooperationScore * 1.1 > 100 ? 100 : rel.cooperationScore * 1.1, fullMark: 100 },
      { dimension: "Strategic Fit", value: (100 - rel.competitionScore + rel.cooperationScore) / 2, fullMark: 100 },
    ];
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {language === "en" ? "Competitor Dynamics" : language === "zh-CN" ? "竞争对手动态" : "競爭對手動態"}
          </h1>
          <p className="text-gray-500 mt-1">
            {language === "en"
              ? "Track competitor activities, projects, and identify opportunities"
              : language === "zh-CN"
              ? "追踪竞争对手活动、项目，识别商机与合作机会"
              : "追蹤競爭對手活動、項目，識別商機與合作機會"}
          </p>
        </div>
        {/* ✅ 已删除 Refresh Data 按钮 */}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="telecom" className="gap-2">
              <Globe className="h-4 w-4" />
              {language === "en" ? "Telecom Operators" : language === "zh-CN" ? "电信运营商" : "電信運營商"}
            </TabsTrigger>
            <TabsTrigger value="integrator" className="gap-2">
              <Building2 className="h-4 w-4" />
              {language === "en" ? "Integrators & Cloud" : language === "zh-CN" ? "集成商/云商" : "集成商/雲商"}
            </TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={language === "en" ? "Search competitors..." : "搜索竞争对手..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Competitor List */}
          <div className="lg:col-span-1 space-y-4">
            <ScrollArea className="h-[calc(100vh-280px)]">
              <div className="space-y-3 pr-4">
                {filteredCompetitors.map((competitor) => {
                  const rel = competitor.relationshipAnalysis;
                  return (
                    <Card
                      key={competitor.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedCompetitor?.id === competitor.id ? "ring-2 ring-blue-500" : ""
                      }`}
                      onClick={() => {
                        setSelectedCompetitor(competitor);
                        setDetailTab("overview");
                      }}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                              style={{ backgroundColor: competitor.brandColor }}
                            >
                              {competitor.shortName.substring(0, 2)}
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{competitor.name}</h3>
                              <p className="text-sm text-gray-500">{competitor.nameCn}</p>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: threatColors[rel.threatLevel as keyof typeof threatColors],
                              color: threatColors[rel.threatLevel as keyof typeof threatColors],
                            }}
                          >
                            {rel.threatLevel.toUpperCase()}
                          </Badge>
                        </div>

                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {competitor.country}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatRevenue(competitor.revenue, competitor.revenueCurrency)}
                          </span>
                        </div>

                        {/* Relationship indicator */}
                        <div className="mt-3 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-red-500"
                              style={{ width: `${rel.competitionScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-20">
                            {language === "en" ? "Competition" : "竞争"}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-green-500"
                              style={{ width: `${rel.cooperationScore}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 w-20">
                            {language === "en" ? "Cooperation" : "合作"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Competitor Detail */}
          <div className="lg:col-span-2">
            {selectedCompetitor ? (
              <Card className="h-[calc(100vh-280px)] overflow-hidden">
                <CardHeader className="pb-2" style={{ borderBottom: `3px solid ${selectedCompetitor.brandColor}` }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                        style={{ backgroundColor: selectedCompetitor.brandColor }}
                      >
                        {selectedCompetitor.shortName}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{selectedCompetitor.name}</CardTitle>
                        <CardDescription className="text-base">{selectedCompetitor.nameCn}</CardDescription>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2" asChild>
                      <a href={selectedCompetitor.website} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        {language === "en" ? "Website" : "官网"}
                      </a>
                    </Button>
                  </div>
                </CardHeader>

                <Tabs value={detailTab} onValueChange={setDetailTab} className="h-full">
                  <div className="px-6 pt-2">
                    <TabsList className="grid grid-cols-4 w-full">
                      <TabsTrigger value="overview">
                        {language === "en" ? "Overview" : "概览"}
                      </TabsTrigger>
                      <TabsTrigger value="projects">
                        {language === "en" ? "Projects" : "项目"}
                      </TabsTrigger>
                      <TabsTrigger value="analysis">
                        {language === "en" ? "AI Analysis" : "AI分析"}
                      </TabsTrigger>
                      <TabsTrigger value="relationship">
                        {language === "en" ? "Relationship" : "关系"}
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="h-[calc(100%-120px)] px-6 py-4">
                    <TabsContent value="overview" className="mt-0 space-y-4">
                      <p className="text-gray-600">{selectedCompetitor.description}</p>

                      <div className="grid grid-cols-3 gap-4">
                        <Card className="p-4">
                          <div className="text-sm text-gray-500">{language === "en" ? "Revenue" : "营收"}</div>
                          <div className="text-xl font-bold text-gray-900">
                            {formatRevenue(selectedCompetitor.revenue, selectedCompetitor.revenueCurrency)}
                          </div>
                          <div className="text-xs text-gray-400">{selectedCompetitor.revenueYear}</div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-sm text-gray-500">{language === "en" ? "Employees" : "员工"}</div>
                          <div className="text-xl font-bold text-gray-900">
                            {(selectedCompetitor.employees / 1000).toFixed(0)}K
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="text-sm text-gray-500">{language === "en" ? "HQ" : "总部"}</div>
                          <div className="text-xl font-bold text-gray-900 truncate">
                            {selectedCompetitor.headquarters.split(",")[0]}
                          </div>
                        </Card>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                          <h4 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            {language === "en" ? "Strengths" : "优势"}
                          </h4>
                          <ul className="space-y-1">
                            {selectedCompetitor.strengths.map((s, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-green-500 mt-1">•</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </Card>
                        <Card className="p-4">
                          <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                            <TrendingDown className="h-4 w-4" />
                            {language === "en" ? "Weaknesses" : "劣势"}
                          </h4>
                          <ul className="space-y-1">
                            {selectedCompetitor.weaknesses.map((w, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-red-500 mt-1">•</span>
                                {w}
                              </li>
                            ))}
                          </ul>
                        </Card>
                      </div>

                      <Card className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Newspaper className="h-4 w-4" />
                          {language === "en" ? "Recent News" : "最新动态"}
                        </h4>
                        <div className="space-y-3">
                          {selectedCompetitor.recentNews.map((news, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
                              <Badge
                                variant="outline"
                                className={news.impact === "high" ? "border-red-300 text-red-700" : "border-gray-300"}
                              >
                                {news.impact === "high" ? "HIGH" : "MED"}
                              </Badge>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">{news.title}</p>
                                <p className="text-xs text-gray-500">{news.date}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="projects" className="mt-0 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">
                          {language === "en" ? "Active Projects" : "活跃项目"}
                        </h4>
                        <Badge variant="outline">{selectedCompetitor.projects.length} {language === "en" ? "projects" : "个项目"}</Badge>
                      </div>

                      {selectedCompetitor.projects.map((project) => {
                        const oppConfig = getOpportunityConfig(project.ourOpportunity);
                        const OppIcon = oppConfig.icon;
                        return (
                          <Card key={project.id} className="p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h5 className="font-semibold text-gray-900">{project.name}</h5>
                                <p className="text-sm text-gray-500 mt-1">{project.description}</p>
                              </div>
                              <Badge className={getStatusBadge(project.status).color}>
                                {getStatusBadge(project.status).label}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-500">{language === "en" ? "Investment" : "投资"}</span>
                                <p className="font-semibold">{formatInvestment(project.investment, project.currency)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">{language === "en" ? "Type" : "类型"}</span>
                                <p className="font-semibold capitalize">{project.type.replace("_", " ")}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">{language === "en" ? "Timeline" : "时间"}</span>
                                <p className="font-semibold">{project.startDate} - {project.endDate}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">{language === "en" ? "Regions" : "区域"}</span>
                                <p className="font-semibold">{project.regions.slice(0, 2).join(", ")}</p>
                              </div>
                            </div>

                            {project.partners.length > 0 && (
                              <div className="mb-3">
                                <span className="text-sm text-gray-500">{language === "en" ? "Partners: " : "合作方: "}</span>
                                <span className="text-sm font-medium">{project.partners.join(", ")}</span>
                              </div>
                            )}

                            <div
                              className="flex items-center gap-2 p-2 rounded-lg"
                              style={{ backgroundColor: `${oppConfig.color}15` }}
                            >
                              <OppIcon className="h-4 w-4" style={{ color: oppConfig.color }} />
                              <span className="text-sm font-medium" style={{ color: oppConfig.color }}>
                                {language === "en" ? oppConfig.label : oppConfig.labelCn}
                              </span>
                              <ChevronRight className="h-4 w-4 ml-auto" style={{ color: oppConfig.color }} />
                            </div>
                          </Card>
                        );
                      })}
                    </TabsContent>

                    <TabsContent value="analysis" className="mt-0 space-y-4">
                      <Card className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                        <div className="flex items-center gap-2 mb-3">
                          <Brain className="h-5 w-5 text-purple-600" />
                          <h4 className="font-semibold text-purple-900">
                            {language === "en" ? "AI Strategic Insights" : "AI战略洞察"}
                          </h4>
                        </div>
                        <div className="space-y-3">
                          {selectedCompetitor.relationshipAnalysis.aiInsights.map((insight, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                              <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{insight}</p>
                            </div>
                          ))}
                        </div>
                      </Card>

                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                            {language === "en" ? "Conflict Areas" : "冲突领域"}
                          </h4>
                          <ul className="space-y-2">
                            {selectedCompetitor.relationshipAnalysis.conflictAreas.map((area, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <Swords className="h-4 w-4 text-red-400" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </Card>
                        <Card className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Handshake className="h-4 w-4 text-green-500" />
                            {language === "en" ? "Cooperation Areas" : "合作领域"}
                          </h4>
                          <ul className="space-y-2">
                            {selectedCompetitor.relationshipAnalysis.cooperationAreas.map((area, i) => (
                              <li key={i} className="flex items-center gap-2 text-sm">
                                <Handshake className="h-4 w-4 text-green-400" />
                                {area}
                              </li>
                            ))}
                          </ul>
                        </Card>
                      </div>

                      <Card className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          {language === "en" ? "Our Opportunities" : "我们的机会"}
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {selectedCompetitor.relationshipAnalysis.opportunities.map((opp, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                              <Zap className="h-5 w-5 text-blue-500" />
                              <span className="text-sm text-gray-700">{opp}</span>
                              <ArrowRight className="h-4 w-4 text-blue-400 ml-auto" />
                            </div>
                          ))}
                        </div>
                      </Card>
                    </TabsContent>

                    <TabsContent value="relationship" className="mt-0 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Card className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            {language === "en" ? "Relationship Score" : "关系评分"}
                          </h4>
                          <div className="space-y-4">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                  <Swords className="h-4 w-4 text-red-500" />
                                  {language === "en" ? "Competition" : "竞争强度"}
                                </span>
                                <span className="text-sm font-semibold">{selectedCompetitor.relationshipAnalysis.competitionScore}%</span>
                              </div>
                              <Progress value={selectedCompetitor.relationshipAnalysis.competitionScore} className="h-2" />
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600 flex items-center gap-2">
                                  <Handshake className="h-4 w-4 text-green-500" />
                                  {language === "en" ? "Cooperation" : "合作潜力"}
                                </span>
                                <span className="text-sm font-semibold">{selectedCompetitor.relationshipAnalysis.cooperationScore}%</span>
                              </div>
                              <Progress value={selectedCompetitor.relationshipAnalysis.cooperationScore} className="h-2" />
                            </div>
                            <div className="pt-2 border-t">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{language === "en" ? "Threat Level" : "威胁等级"}</span>
                                <Badge
                                  style={{
                                    backgroundColor: threatColors[selectedCompetitor.relationshipAnalysis.threatLevel as keyof typeof threatColors],
                                    color: "white",
                                  }}
                                >
                                  {selectedCompetitor.relationshipAnalysis.threatLevel.toUpperCase()}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </Card>

                        <Card className="p-4">
                          <h4 className="font-semibold text-gray-900 mb-4">
                            {language === "en" ? "Competitive Position" : "竞争态势"}
                          </h4>
                          <ResponsiveContainer width="100%" height={200}>
                            <RadarChart data={getRadarData(selectedCompetitor)}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                              <Radar
                                name="Score"
                                dataKey="value"
                                stroke="#3B82F6"
                                fill="#3B82F6"
                                fillOpacity={0.5}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
                        </Card>
                      </div>

                      <Card className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-4">
                          {language === "en" ? "Recommended Actions" : "建议行动"}
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Shield className="h-5 w-5 text-red-600" />
                              <span className="font-semibold text-red-800">
                                {language === "en" ? "Defend" : "防守"}
                              </span>
                            </div>
                            <p className="text-sm text-red-700">
                              {language === "en"
                                ? "Protect existing customers in overlapping markets"
                                : "保护重叠市场中的现有客户"}
                            </p>
                          </div>
                          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="h-5 w-5 text-yellow-600" />
                              <span className="font-semibold text-yellow-800">
                                {language === "en" ? "Monitor" : "监控"}
                              </span>
                            </div>
                            <p className="text-sm text-yellow-700">
                              {language === "en"
                                ? "Track their project progress and market moves"
                                : "追踪其项目进展和市场动作"}
                            </p>
                          </div>
                          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <Handshake className="h-5 w-5 text-green-600" />
                              <span className="font-semibold text-green-800">
                                {language === "en" ? "Engage" : "接触"}
                              </span>
                            </div>
                            <p className="text-sm text-green-700">
                              {language === "en"
                                ? "Explore partnership opportunities in complementary areas"
                                : "探索互补领域的合作机会"}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </Card>
            ) : (
              <Card className="h-[calc(100vh-280px)] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>{language === "en" ? "Select a competitor to view details" : "选择一个竞争对手查看详情"}</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
}