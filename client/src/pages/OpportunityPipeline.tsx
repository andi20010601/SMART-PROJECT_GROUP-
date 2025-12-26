import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line
} from "recharts";
import { TrendingUp, BarChart3 } from "lucide-react";

// ================= 定义数据接口 =================

// 基础储备数据接口
interface ReserveData {
  lastYear: number; // 上年 (亿)
  thisYear: number; // 今年 (亿)
  total: number;    // 总计 (亿)
}

// 结构分布的百分比配置接口
interface StructureConfig {
  low: number;
  medium: number;
  high: number;
}

// 用于图表渲染的结构项接口 (动态计算后)
interface CalculatedStructureItem {
  name: string;
  value: number;    // 计算后的金额 (万)
  percentage: number; // 百分比
  color: string;
}

// 产品数据接口
interface ProductItem {
  code: string;
  name: string;
  amount: number; // 金额 (万)
  color: string;
}

// 趋势数据接口
interface TrendItem {
  month: string;
  amount: number; // 金额 (亿)
  count: number;
}

// 年度汇总数据接口
interface YearData {
  reserve: ReserveData;
  structurePercentages: StructureConfig; // 存储百分比配置
  products: ProductItem[];
  trend: TrendItem[];
}

// ================= 静态配置模板 =================
// 用于定义结构图的图例和颜色
const STRUCTURE_TEMPLATE: { name: string; color: string; key: keyof StructureConfig }[] = [
  { name: "商机赢率<30%", color: "#3B82F6", key: "low" },
  { name: "30≤商机赢率<80%", color: "#10B981", key: "medium" },
  { name: "商机赢率≥80%", color: "#F59E0B", key: "high" },
];

const PRODUCT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

// ================= 年度数据源 =================
const dataByYear: Record<string, YearData> = {
  "202501-202512": {
    reserve: { lastYear: 11.48, thisYear: 9.34, total: 0.70 },
    structurePercentages: { low: 9.3, medium: 40.7, high: 50.0 }, // 2025年分布
    products: [
      { code: "IDC", name: "IDC", amount: 5.97, color: "#3B82F6" },
      { code: "IDC2", name: "IDC2.0", amount: 20520.28, color: "#10B981" },
      { code: "XCLL", name: "XCLL", amount: 174.44, color: "#F59E0B" },
      { code: "IPT", name: "IPT", amount: 1423.45, color: "#EF4444" },
      { code: "SMS", name: "SMS...", amount: 3883.72, color: "#8B5CF6" },
      { code: "IEPL", name: "IEPL", amount: 716.60, color: "#EC4899" },
      { code: "Clo", name: "Clo...", amount: 103.31, color: "#14B8A6" },
      { code: "ICTS", name: "ICTS", amount: 33746.43, color: "#F97316" },
    ],
    trend: [
      { month: "Jan", amount: 2.5, count: 12 }, { month: "Feb", amount: 3.2, count: 15 }, { month: "Mar", amount: 4.1, count: 18 }, { month: "Apr", amount: 3.8, count: 16 }, { month: "May", amount: 5.2, count: 22 }, { month: "Jun", amount: 4.5, count: 19 }, { month: "Jul", amount: 6.1, count: 25 }, { month: "Aug", amount: 5.8, count: 23 }, { month: "Sep", amount: 7.2, count: 28 }, { month: "Oct", amount: 6.5, count: 26 }, { month: "Nov", amount: 8.1, count: 32 }, { month: "Dec", amount: 9.34, count: 35 },
    ]
  },
  "202401-202412": {
    reserve: { lastYear: 9.82, thisYear: 11.48, total: 0.85 },
    // ✅ 修改数据以测试动态变化 (绿色部分占比 30%，位于左侧)
    structurePercentages: { low: 30.0, medium: 30.0, high: 40.0 },
    products: [
      { code: "IDC", name: "IDC", amount: 12.35, color: "#3B82F6" },
      { code: "IDC2", name: "IDC2.0", amount: 18562.56, color: "#10B981" },
      { code: "XCLL", name: "XCLL", amount: 256.78, color: "#F59E0B" },
      { code: "IPT", name: "IPT", amount: 1856.92, color: "#EF4444" },
      { code: "SMS", name: "SMS...", amount: 4521.38, color: "#8B5CF6" },
      { code: "IEPL", name: "IEPL", amount: 892.45, color: "#EC4899" },
      { code: "Clo", name: "Clo...", amount: 156.78, color: "#14B8A6" },
      { code: "ICTS", name: "ICTS", amount: 42568.92, color: "#F97316" },
    ],
    trend: [
      { month: "Jan", amount: 3.2, count: 14 }, { month: "Feb", amount: 3.8, count: 17 }, { month: "Mar", amount: 4.5, count: 20 }, { month: "Apr", amount: 5.1, count: 22 }, { month: "May", amount: 5.8, count: 25 }, { month: "Jun", amount: 6.2, count: 27 }, { month: "Jul", amount: 7.1, count: 30 }, { month: "Aug", amount: 7.8, count: 33 }, { month: "Sep", amount: 8.5, count: 36 }, { month: "Oct", amount: 9.2, count: 38 }, { month: "Nov", amount: 10.1, count: 42 }, { month: "Dec", amount: 11.48, count: 45 },
    ]
  },
  "202301-202312": {
    reserve: { lastYear: 7.56, thisYear: 9.82, total: 0.62 },
    structurePercentages: { low: 22.5, medium: 35.8, high: 41.7 }, // 2023年分布
    products: [
      { code: "IDC", name: "IDC", amount: 8.45, color: "#3B82F6" },
      { code: "IDC2", name: "IDC2.0", amount: 14256.92, color: "#10B981" },
      { code: "XCLL", name: "XCLL", amount: 128.56, color: "#F59E0B" },
      { code: "IPT", name: "IPT", amount: 1125.78, color: "#EF4444" },
      { code: "SMS", name: "SMS...", amount: 2856.45, color: "#8B5CF6" },
      { code: "IEPL", name: "IEPL", amount: 542.38, color: "#EC4899" },
      { code: "Clo", name: "Clo...", amount: 78.92, color: "#14B8A6" },
      { code: "ICTS", name: "ICTS", amount: 25892.56, color: "#F97316" },
    ],
    trend: [
      { month: "Jan", amount: 1.8, count: 8 }, { month: "Feb", amount: 2.2, count: 10 }, { month: "Mar", amount: 2.8, count: 12 }, { month: "Apr", amount: 3.2, count: 14 }, { month: "May", amount: 3.8, count: 16 }, { month: "Jun", amount: 4.2, count: 18 }, { month: "Jul", amount: 5.1, count: 21 }, { month: "Aug", amount: 5.8, count: 24 }, { month: "Sep", amount: 6.5, count: 27 }, { month: "Oct", amount: 7.2, count: 30 }, { month: "Nov", amount: 8.5, count: 34 }, { month: "Dec", amount: 9.82, count: 38 },
    ]
  }
};

// ================= 主组件 =================
export default function OpportunityPipeline() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState("202501-202512");

  // 1. 获取当前选定年份的基础数据
  const currentData = useMemo(() => {
    return dataByYear[period] || dataByYear["202501-202512"];
  }, [period]);

  // 2. ✅ 核心修复：动态计算结构分布数据
  const structureData: CalculatedStructureItem[] = useMemo(() => {
    const totalAmountWan = currentData.reserve.total * 10000;
    return STRUCTURE_TEMPLATE.map(item => {
      const percentage = currentData.structurePercentages[item.key];
      const calculatedValue = Math.round(totalAmountWan * (percentage / 100));
      return {
        name: item.name,
        color: item.color,
        percentage: percentage,
        value: calculatedValue
      };
    });
  }, [currentData]);

  // 获取显示用的年份标签
  const getYearLabel = (periodValue: string) => {
    const yearMap: Record<string, string> = {
      "202501-202512": "2025", "202401-202412": "2024", "202301-202312": "2023"
    };
    return yearMap[periodValue] || "2025";
  };
  const getPreviousYearLabel = (periodValue: string) => {
    const yearMap: Record<string, string> = {
      "202501-202512": "2024", "202401-202412": "2023", "202301-202312": "2022"
    };
    return yearMap[periodValue] || "2024";
  };

  return (
    <div className="space-y-6">
      {/* Header (保持不变) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">商机储备情况 / Opportunity Pipeline</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze business opportunities across products and regions
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="202501-202512">2025.01-2025.12</SelectItem>
              <SelectItem value="202401-202412">2024.01-2024.12</SelectItem>
              <SelectItem value="202301-202312">2023.01-2023.12</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. 商机储备金额卡片 (保持不变) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              商机储备金额
              <Badge variant="outline">{period}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-blue-600">{currentData.reserve.total}</span>
              <span className="text-sm text-muted-foreground">亿港币</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              口径:创建时间在近6个月成单率&gt;30%且不含已归档取消的商机的港币金额总值
            </p>
            <div className="flex items-end gap-8 h-24">
              <div className="flex flex-col items-center">
                <div className="w-12 bg-blue-500 rounded-t" style={{ height: `${(currentData.reserve.lastYear / 12) * 80}px` }} />
                <span className="text-xs mt-1 font-medium text-blue-600">{currentData.reserve.lastYear}亿</span>
                <span className="text-xs text-muted-foreground">上年({getPreviousYearLabel(period)})</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 bg-green-500 rounded-t" style={{ height: `${(currentData.reserve.thisYear / 12) * 80}px` }} />
                <span className="text-xs mt-1 font-medium text-green-600">{currentData.reserve.thisYear}亿</span>
                <span className="text-xs text-muted-foreground">今年({getYearLabel(period)})</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 2. 商机结构分布卡片 (✅ 核心修复区域：完全自定义标签渲染) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              商机结构分布
              <Badge variant="outline">{period}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              {/* 保持足够的容器高度 */}
              <ResponsiveContainer width={240} height={200}>
                <PieChart>
                  <Pie
                    data={structureData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    // 为了安全起见，稍微减小一点半径，给标签留更多空间
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="percentage"
                    // ✅ 核心修复：禁用默认引导线
                    labelLine={false}
                    // ✅ 核心修复：完全自定义的标签渲染函数
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percentage, index }) => {
                      const RADIAN = Math.PI / 180;
                      // 计算标签中心点的位置，在饼图外部一定距离
                      const radius = outerRadius * 1.25;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);

                      // ✅ 智能对齐：
                      // 如果标签在圆心右侧 (x > cx)，则文本起点在左 (start)，向右书写。
                      // 如果标签在圆心左侧 (x < cx)，则文本起点在右 (end)，向左书写。
                      // 这样可以确保文本始终向图表中心靠拢，不会溢出边界。
                      const textAnchor = x > cx ? 'start' : 'end';

                      return (
                        <text
                          x={x}
                          y={y}
                          fill={structureData[index].color} // 使用对应切片的颜色
                          textAnchor={textAnchor}
                          dominantBaseline="central"
                          className="text-xs font-medium"
                        >
                          {`${percentage.toFixed(1)}%`}
                        </text>
                      );
                    }}
                  >
                    {structureData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  {/* Tooltip 保持不变 */}
                  <Tooltip
                    formatter={(value, name, props) => {
                      const amountVal = props.payload.value;
                      return [
                        `${amountVal.toLocaleString()}万 (${value}%)`,
                        name
                      ];
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* 图例 */}
            <div className="flex flex-wrap justify-center gap-3 mt-1">
              {STRUCTURE_TEMPLATE.map((item, index) => (
                <div key={index} className="flex items-center gap-1 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 3. 商机金额分布(按产品)卡片 (保持不变) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium flex items-center justify-between">
              商机金额分布<span className="text-xs text-muted-foreground">(按产品)</span>
              <Badge variant="outline">{period}</Badge>
            </CardTitle>
            <CardDescription className="text-xs">单位：万港币</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={180} height={160}>
                <PieChart>
                  <Pie
                    data={currentData.products}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="amount"
                    label={false}
                  >
                    {currentData.products.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString()}万`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1 ml-2 h-[160px] overflow-y-auto pr-2">
                {currentData.products.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: PRODUCT_COLORS[index % PRODUCT_COLORS.length] }} />
                    <span className="w-12 truncate" title={item.code}>{item.code}</span>
                    <span className="text-muted-foreground ml-auto">{item.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trend Chart & Product Breakdown (保持不变) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Opportunity Trend ({getYearLabel(period)})
          </CardTitle>
          <CardDescription>Track opportunity value and count over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={currentData.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#3B82F6" label={{ value: '金额 (亿)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10B981" label={{ value: '数量', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="amount" stroke="#3B82F6" strokeWidth={2} name="Amount (亿港币)" />
              <Line yAxisId="right" type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} name="Count" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Opportunity by Product ({getYearLabel(period)})
          </CardTitle>
          <CardDescription>Detailed breakdown of opportunities by product line</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={currentData.products} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" label={{ value: '万港币', position: 'insideBottom', offset: -5 }} />
              <YAxis dataKey="code" type="category" width={60} />
              <Tooltip formatter={(value) => [`${Number(value).toLocaleString()}万港币`, 'Amount']} />
              <Bar dataKey="amount" radius={[0, 4, 4, 0]}>
                {currentData.products.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PRODUCT_COLORS[index % PRODUCT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}