import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, FileText, CheckCircle, XCircle, Clock, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import * as XLSX from "xlsx";

// ✅ 1. 这里增加了 'project' (BHI项目) 和 'recommendation' (AI推荐)
type DataType = "customer" | "subsidiary" | "opportunity" | "deal" | "news" | "project" | "recommendation";

interface ParsedData {
  headers: string[];
  rows: Record<string, any>[];
  fileName: string;
}

export default function DataImport() {
  const { data: imports, isLoading, refetch } = trpc.import.history.useQuery();
  const { isAuthenticated } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);

  // 默认选中 'customer'，你可以随时切换
  const [dataType, setDataType] = useState<DataType>("customer");

  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const uploadExcelMutation = trpc.import.uploadExcel.useMutation();
  const utils = trpc.useUtils();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/)) {
      toast.error("不支持的文件格式，请上传 Excel (.xlsx, .xls) 或 CSV");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const rawBase64 = content.split(',')[1];
        setFileBase64(rawBase64);
      };
      reader.onerror = () => {
        toast.error("文件读取失败");
      };
      reader.readAsDataURL(file);

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];

      if (!sheetName) {
        toast.error("Excel 文件中找不到工作表");
        return;
      }

      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null });

      if (jsonData.length === 0) {
        toast.error("文件中没有数据");
        return;
      }

      const headers = Object.keys(jsonData[0]);

      setParsedData({
        headers,
        rows: jsonData,
        fileName: file.name,
      });

      toast.success(`解析成功：共 ${jsonData.length} 行数据`);

    } catch (error) {
      console.error(error);
      toast.error("文件解析发生错误: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleImport = async () => {
    if (!parsedData || !isAuthenticated || !fileBase64) {
      toast.error("数据不完整，请重新上传文件");
      return;
    }

    setIsProcessing(true);

    try {
      // @ts-ignore - 类型定义可能没更新，忽略 TS 检查强制传参
      const result = await uploadExcelMutation.mutateAsync({
        fileBase64: fileBase64,
        dataType: dataType
      });

      if (result.success) {
        toast.success(`导入完成! 成功: ${result.successCount}, 失败: ${result.failedCount}`);
        if (result.failedCount > 0) {
          console.warn("导入失败详情:", result.errors);
          toast.warning(`有 ${result.failedCount} 行数据格式错误，已跳过`);
        }
      }

      setParsedData(null);
      setFileBase64(null);

      refetch(); // 刷新历史列表

      // 刷新所有相关数据
      utils.customer.list.invalidate();
      utils.deal.list.invalidate();
      utils.opportunity.list.invalidate();
      utils.news.list.invalidate();
      utils.dashboard.stats.invalidate();
      // 刷新 ML 数据
      if (dataType === 'project' || dataType === 'recommendation') {
         // @ts-ignore
         utils.ml?.getData?.invalidate();
      }

    } catch (error) {
      console.error(error);
      toast.error("服务器导入失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setIsProcessing(false);
    }
  };

  const getFileIcon = (type: string | null) => {
    if (type === 'excel' || type === 'csv') return FileSpreadsheet;
    return FileText;
  };

  // ✅ 2. 这里的标签也加上了
  const dataTypeLabels: Record<DataType, string> = {
    customer: "Customers (客户)",
    deal: "Deals (订单)",
    opportunity: "Opportunities (商机)",
    subsidiary: "Subsidiaries (子公司)",
    news: "News (新闻)",
    project: "BHI Projects (BHI项目库)",         // 新增
    recommendation: "AI Recommendations (AI推荐结果)" // 新增
  };

  // ✅ 3. 这里的说明也加上了
  const dataTypeDescriptions: Record<DataType, string> = {
    customer: "导入企业基本档案 (必选: name)",
    deal: "导入成交订单 (必选: name, customerName, amount)",
    opportunity: "导入销售商机 (必选: name, customerName)",
    subsidiary: "导入子公司结构 (必选: name, parentName)",
    news: "导入新闻 (必选: title, customerName)",
    project: "导入 BHI 项目库数据 (必选: 项目ID, 项目名称, 投资总额)",
    recommendation: "导入 AI 分析结果 (必选: ProjectID, Product, Rank)"
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">数据导入 (Data Import)</h1>
          <p className="text-muted-foreground">支持批量导入客户、订单、商机、BHI项目库及AI推荐数据</p>
        </div>
      </div>

      {/* 上传卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>上传文件</CardTitle>
          <CardDescription>选择 Excel (.xlsx) 或 CSV 文件</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
            disabled={!isAuthenticated || isUploading}
          />

          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              isAuthenticated ? 'hover:border-primary/50 cursor-pointer' : 'opacity-50 cursor-not-allowed'
            }`}
            onClick={() => isAuthenticated && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-12 w-12 mx-auto mb-4 text-primary animate-spin" />
                <p className="font-medium">正在解析文件...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium">点击此处上传，或拖拽文件到这里</p>
                <p className="text-sm text-muted-foreground mt-2">
                  支持自动识别中英文表头
                </p>
                <Button className="mt-4" variant="outline" disabled={!isAuthenticated}>
                  选择文件
                </Button>
              </>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground text-center text-red-500">
              请先登录系统再进行操作
            </p>
          )}
        </CardContent>
      </Card>

      {/* 预览卡片 */}
      {parsedData && (
        <Card className="border-blue-200 bg-blue-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-green-600" />
              预览: {parsedData.fileName}
            </CardTitle>
            <CardDescription>
              检测到 {parsedData.rows.length} 行数据，请确认导入类型
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-white p-4 rounded-lg border">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-bold text-gray-700">你要导入什么数据？</label>
                <Select value={dataType} onValueChange={(v) => setDataType(v as DataType)}>
                  <SelectTrigger className="w-full sm:w-[300px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(dataTypeLabels).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-start gap-2 mt-2 text-xs text-blue-600 font-medium bg-blue-50 p-2 rounded">
                   <AlertCircle className="h-4 w-4 shrink-0" />
                   {dataTypeDescriptions[dataType]}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => {
                  setParsedData(null);
                  setFileBase64(null);
                }}>
                  取消
                </Button>
                <Button onClick={handleImport} disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700">
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      正在导入数据库...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      确认导入 {parsedData.rows.length} 条数据
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden bg-white">
              <div className="overflow-x-auto max-h-[300px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="w-12">#</TableHead>
                      {parsedData.headers.slice(0, 6).map((header) => (
                        <TableHead key={header} className="min-w-[120px] font-bold text-gray-700">{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.rows.slice(0, 5).map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                        {parsedData.headers.slice(0, 6).map((header) => (
                          <TableCell key={header} className="max-w-[200px] truncate">
                            {row[header] !== null ? String(row[header]) : "-"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="p-2 text-center text-xs text-muted-foreground border-t">
                (仅显示前 5 行预览)
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 历史记录卡片 */}
      <Card>
        <CardHeader>
          <CardTitle>导入历史 (History)</CardTitle>
          <CardDescription>最近的文件处理记录</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : imports && imports.length > 0 ? (
            <div className="space-y-3">
              {imports.map((imp: any) => {
                const FileIcon = getFileIcon(imp.fileType);
                const totalRows = (imp.successRows || 0) + (imp.failedRows || 0);

                return (
                  <div key={imp.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <FileIcon className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{imp.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {imp.createdAt ? new Date(imp.createdAt).toLocaleString() : "未知时间"}
                          {totalRows > 0 ? ` • 共 ${totalRows} 行` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right hidden sm:block">
                         {imp.status === 'completed' && (
                           <span className="text-xs text-green-600 font-medium">成功: {imp.successRows}</span>
                         )}
                         {imp.failedRows && imp.failedRows > 0 ? (
                           <span className="text-xs text-red-600 font-medium block">失败: {imp.failedRows}</span>
                         ) : null}
                      </div>
                      <Badge variant={imp.status === 'completed' ? 'default' : imp.status === 'failed' ? 'destructive' : 'secondary'}>
                        {imp.status === 'completed' ? '完成' : imp.status === 'failed' ? '失败' : imp.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground border-2 border-dashed rounded-lg">
              <Clock className="h-10 w-10 mx-auto mb-3 opacity-20" />
              <p>暂无导入记录</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}