import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Newspaper, Upload, ExternalLink, Sparkles, Loader2, RefreshCw, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function News() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");

  // 1. 获取数据
  const { data: news, isLoading, refetch } = trpc.news.list.useQuery({ limit: 50 });
  // ❌ [已删除] 不需要再查询未读数量了
  // const { data: unreadCount } = trpc.news.unreadCount.useQuery();

  const { data: customers } = trpc.customer.list.useQuery({ limit: 100 });

  // 2. AI 动作
  const generateMutation = trpc.news.searchNews.useMutation();
  const [, setLocation] = useLocation();

  const handleGenerate = async () => {
    if (!selectedCustomerId) {
      toast.error("请先选择一家公司");
      return;
    }

    const customerList = Array.isArray(customers) ? customers : (customers as any)?.customers || [];
    const customer = customerList.find((c: any) => c.id === parseInt(selectedCustomerId));

    try {
      toast.info(`正在搜索 [${customer?.name}] 的相关新闻...`, { duration: 5000 });

      const result = await generateMutation.mutateAsync({
        customerId: parseInt(selectedCustomerId)
      });

      if (result.success) {
        toast.success(`搜索完成，找到 ${result.count} 条相关新闻！`);
        refetch();
        setSelectedCustomerId("");
      }
    } catch (error) {
      toast.error("搜索失败，请稍后重试");
      console.error(error);
    }
  };

  const getSafeCustomerList = () => {
    if (!customers) return [];
    if (Array.isArray(customers)) return customers;
    return (customers as any).customers || [];
  };

  const getNewsLink = (item: any) => {
    if (item.sourceUrl && item.sourceUrl.startsWith('http')) {
      return item.sourceUrl;
    }
    const customerName = item.customerName || "";
    const query = encodeURIComponent(`${item.title} ${customerName}`);
    return `https://www.google.com/search?q=${query}&tbm=nws`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">News & Insights</h1>
          <p className="text-muted-foreground">
            Customer-related news with AI analysis
            {/* ❌ [已删除] 这里原本会显示 "• 20 unread"，现在删掉了 */}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setLocation("/import")}>
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
        </div>
      </div>

      {/* 搜索框区域 */}
      <Card className="border-indigo-100 bg-indigo-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-700">
            <Search className="h-5 w-5" />
            News Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-2 flex-1 w-full">
              <label className="text-sm font-medium">Target Customer</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
              >
                <option value="" disabled>Select a company...</option>
                {getSafeCustomerList().map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!selectedCustomerId || generateMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search News
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 新闻列表 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Latest News</CardTitle>
            <CardDescription>News articles related to your customers</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={() => refetch()}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
            </div>
          ) : news && news.length > 0 ? (
            <div className="space-y-4">
              {news.map(item => {
                const link = getNewsLink(item);
                return (
                  <div key={item.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors bg-white group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                          item.sentiment === 'positive' ? 'bg-green-100' :
                          item.sentiment === 'negative' ? 'bg-red-100' : 'bg-blue-100'
                        }`}>
                          <Newspaper className={`h-5 w-5 ${
                            item.sentiment === 'positive' ? 'text-green-600' :
                            item.sentiment === 'negative' ? 'text-red-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-base text-blue-700 hover:underline flex items-center gap-2"
                            title="Click to search this news on Google"
                          >
                            {item.title}
                            <ExternalLink className="h-3 w-3 opacity-50" />
                          </a>

                          {item.summary && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.summary}</p>
                          )}

                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <span className="font-medium text-gray-700">{item.sourceName || "Web Source"}</span>
                            <span>•</span>
                            <span>{item.publishedDate ? new Date(item.publishedDate).toLocaleDateString() : "Just now"}</span>
                            <span className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              <Sparkles className="h-3 w-3" />
                              AI Analysis
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button variant="outline" size="sm" asChild className="hidden sm:flex h-8 text-xs">
                          <a href={link} target="_blank" rel="noopener noreferrer">
                            <Search className="h-3 w-3 mr-1" />
                            Verify Source
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 text-indigo-300" />
              <p>No news found</p>
              <p className="text-sm mt-1">
                Select a customer above and click "Search News" to start!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}