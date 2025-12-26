import { useState, useMemo, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  Brain,
  DollarSign,
  Target,
  MapPin,
  Calendar,
  Filter,
  Search,
  Briefcase,
  Loader2,
  PieChart as PieChartIcon, // 图标
  ChevronDown
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend // ✅ 恢复饼图组件
} from "recharts";

// 定义饼图颜色
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

export default function MLAnalysis() {
  const { t } = useLanguage();
  const { data: rawData, isLoading } = trpc.ml.getData.useQuery();

  // 状态：筛选器
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSector, setSelectedSector] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  // 状态：控制当前显示多少条数据 (默认20条)
  const [visibleCount, setVisibleCount] = useState(20);

  // 副作用：当筛选条件改变时，重置列表显示数量回 20
  useEffect(() => {
    setVisibleCount(20);
  }, [selectedYear, selectedSector, searchTerm]);

  // 1. 数据处理与筛选
  const processedData = useMemo(() => {
    if (!rawData) return [];

    return rawData.filter((item: any) => {
      const year = item.startDate ? new Date(item.startDate).getFullYear().toString() : "Unknown";
      if (selectedYear !== "All" && year !== selectedYear) return false;
      if (selectedSector !== "All" && item.sector !== selectedSector) return false;
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          item.projectName?.toLowerCase().includes(lowerSearch) ||
          item.country?.toLowerCase().includes(lowerSearch) ||
          item.recommendations?.some((r: any) => r.productName.toLowerCase().includes(lowerSearch))
        );
      }
      return true;
    });
  }, [rawData, selectedYear, selectedSector, searchTerm]);

  // 2. 提取筛选选项
  const sectors = useMemo(() => {
    if (!rawData) return [];
    const unique = new Set(rawData.map((i: any) => i.sector).filter(Boolean));
    return Array.from(unique);
  }, [rawData]);

  const years = useMemo(() => {
    if (!rawData) return [];
    const unique = new Set(rawData.map((i: any) => i.startDate ? new Date(i.startDate).getFullYear().toString() : "").filter(Boolean));
    return Array.from(unique).sort().reverse();
  }, [rawData]);

  // 3. 计算 KPI
  const totalProjects = processedData.length;
  const totalInvestment = processedData.reduce((acc: number, curr: any) => acc + (Number(curr.investment) || 0), 0);
  const highConfProjects = processedData.filter((i: any) =>
    i.recommendations?.some((r: any) => r.confidence === 'High')
  ).length;

  // 4. 图表数据 (Bar 和 Pie 共用)
  const sectorChartData = useMemo(() => {
    const map = new Map();
    processedData.forEach((item: any) => {
      const sec = item.sector || "Unknown";
      const val = Number(item.investment) || 0;
      map.set(sec, (map.get(sec) || 0) + val);
    });
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // 只取前8个
  }, [processedData]);

  // 辅助函数：加载更多
  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 20);
  };

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      {/* 标题 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Brain className="h-8 w-8 text-indigo-600" />
          {t("ml.title") || "Machine Learning Opportunity Analysis"}
        </h1>
        <p className="text-muted-foreground">
          基于 BHI 项目库与 AI 混合推荐模型的商机分析系统
        </p>
      </div>

      {/* 筛选栏 */}
      <Card className="bg-slate-50 border-indigo-100">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="搜索项目、国家或推荐产品..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-white"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">筛选:</span>
              </div>

              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="年份" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">所有年份</SelectItem>
                  {years.map(y => <SelectItem key={String(y)} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-[180px] bg-white">
                  <SelectValue placeholder="行业" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">所有行业</SelectItem>
                  {sectors.map((s: any) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>

              <Button variant="ghost" size="sm" onClick={() => {setSelectedYear("All"); setSelectedSector("All"); setSearchTerm("");}}>
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">项目总数</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
            <p className="text-xs text-muted-foreground">当前筛选条件下</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">涉及投资总额</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">¥ {(totalInvestment / 10000).toFixed(2)} 亿</div>
            <p className="text-xs text-muted-foreground">根据 BHI 投资概算</p>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-900">AI 高匹配商机</CardTitle>
            <Brain className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">{highConfProjects}</div>
            <p className="text-xs text-indigo-600/80">推荐置信度为 High 的项目</p>
          </CardContent>
        </Card>
      </div>

      {/* 图表区域 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>行业投资热度 (Top 8)</CardTitle>
            <CardDescription>按投资金额 (万元)</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorChartData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{fontSize: 12}} />
                <RechartsTooltip formatter={(val: number) => `¥${(val/10000).toFixed(1)}亿`} />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ 恢复饼图 (Pie Chart) */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-indigo-600" />
              行业分布占比
            </CardTitle>
            <CardDescription>按投资金额比例</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {sectorChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(val: number) => `¥${(val/10000).toFixed(1)}亿`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 详细列表 (带 AI 推荐) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-indigo-600" />
            商机详情与 AI 推荐
          </CardTitle>
          <CardDescription>
            左侧为项目基本信息，右侧为 AI 根据产品线生成的推荐结果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {processedData.slice(0, visibleCount).map((item: any) => (
              <div key={item.id} className="flex flex-col lg:flex-row gap-6 p-5 border rounded-xl hover:bg-slate-50 transition-all">
                {/* 左侧：项目详情 */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-2">{item.projectName}</h3>
                    <Badge variant="outline">{item.stage || "未知阶段"}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-600 mt-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3 w-3" /> {item.country}
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3 w-3" /> {item.sector}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-3 w-3" /> ¥{Number(item.investment).toLocaleString()}万
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3" /> {item.startDate ? new Date(item.startDate).toLocaleDateString() : "-"}
                    </div>
                  </div>

                  {item.contractor && (
                    <div className="text-xs text-muted-foreground mt-2 bg-gray-100 p-2 rounded">
                      <span className="font-semibold">中企单位:</span> {item.contractor}
                    </div>
                  )}
                </div>

                {/* 右侧：AI 推荐卡片 */}
                <div className="lg:w-[450px] flex gap-3 overflow-x-auto pb-2">
                  {item.recommendations && item.recommendations.length > 0 ? (
                    item.recommendations.sort((a: any, b: any) => a.rank - b.rank).map((rec: any, idx: number) => (
                      <div key={idx} className={`min-w-[140px] p-3 rounded-lg border-l-4 shadow-sm bg-white
                        ${rec.confidence === 'High' ? 'border-l-green-500' :
                          rec.confidence === 'Medium' ? 'border-l-orange-400' : 'border-l-gray-300'
                        }
                      `}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] text-gray-400 uppercase font-bold">Rank {rec.rank}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                             rec.confidence === 'High' ? 'bg-green-100 text-green-700' :
                             'bg-orange-50 text-orange-700'
                          }`}>
                            {rec.confidence}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1" title={rec.productName}>
                          {rec.productName}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-indigo-600 font-medium">
                          <Brain className="h-3 w-3" />
                          Score: {Number(rec.aiScore).toFixed(2)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center w-full text-sm text-gray-400 border rounded-lg border-dashed">
                      暂无 AI 推荐
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 加载更多按钮 */}
            {processedData.length > visibleCount ? (
              <div className="flex justify-center pt-4">
                <Button variant="outline" onClick={handleLoadMore} className="gap-2 w-full md:w-auto">
                  <ChevronDown className="h-4 w-4" />
                  加载更多 ({processedData.length - visibleCount} 条)
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                没有更多项目了
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}