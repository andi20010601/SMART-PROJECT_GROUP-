import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Building2, Newspaper, TrendingUp, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Streamdown } from "streamdown";

export default function AIAnalysis() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [analysisType, setAnalysisType] = useState<string>("summary");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  
  const { data: customers, isLoading: customersLoading } = trpc.customer.list.useQuery({ limit: 50 });
  
  const analyzeMutation = trpc.ai.analyzeCustomer.useMutation({
    onSuccess: (data) => {
      setAnalysisResult(data.analysis);
    },
    onError: (error) => {
      setAnalysisResult(`Error: ${error.message}`);
    },
  });

  const handleAnalyze = () => {
    if (!selectedCustomer) return;
    setAnalysisResult("");
    analyzeMutation.mutate({
      customerId: parseInt(selectedCustomer),
      analysisType: analysisType as "summary" | "product_match" | "talking_points" | "risk_assessment",
    });
  };

  const analysisTypes = [
    { value: "summary", label: "Executive Summary", icon: Building2, description: "Comprehensive overview for sales meetings" },
    { value: "product_match", label: "Product Matching", icon: TrendingUp, description: "Recommend relevant products and services" },
    { value: "talking_points", label: "Talking Points", icon: MessageSquare, description: "Generate conversation starters and strategies" },
    { value: "risk_assessment", label: "Risk Assessment", icon: Sparkles, description: "Evaluate business relationship risks" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Analysis</h1>
        <p className="text-muted-foreground">Generate AI-powered insights for your customers</p>
      </div>

      {/* Analysis Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Generate Analysis
          </CardTitle>
          <CardDescription>Select a customer and analysis type to generate insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Customer</label>
              {customersLoading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a customer..." />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Analysis Type</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            onClick={handleAnalyze} 
            disabled={!selectedCustomer || analyzeMutation.isPending}
            className="w-full md:w-auto"
          >
            {analyzeMutation.isPending ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Analysis
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Analysis Types */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analysisTypes.map(t => (
          <Card 
            key={t.value} 
            className={`cursor-pointer transition-all ${analysisType === t.value ? 'ring-2 ring-primary' : 'hover:shadow-md'}`}
            onClick={() => setAnalysisType(t.value)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <t.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{t.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analysis Result */}
      {(analysisResult || analyzeMutation.isPending) && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
            <CardDescription>
              {analysisTypes.find(t => t.value === analysisType)?.label} for selected customer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analyzeMutation.isPending ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <Streamdown>{analysisResult}</Streamdown>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {!analysisResult && !analyzeMutation.isPending && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No analysis generated yet</p>
              <p className="text-sm mt-1">Select a customer and click "Generate Analysis" to get started</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
