import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Network, Building2, ChevronRight, ChevronDown, MapPin, Users } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type TreeNode = {
  id: number;
  name: string;
  type: 'parent' | 'subsidiary' | 'branch' | 'affiliate';
  country?: string | null;
  employeeCount?: number | null;
  children?: TreeNode[];
};

function TreeNodeComponent({ node, level = 0 }: { node: TreeNode; level?: number }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  
  const typeColors: Record<string, string> = {
    parent: "bg-primary text-primary-foreground",
    subsidiary: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    branch: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    affiliate: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  };

  return (
    <div className="relative">
      {/* Connector line */}
      {level > 0 && (
        <div className="absolute left-0 top-0 w-6 h-6 border-l-2 border-b-2 border-border rounded-bl-lg" style={{ marginLeft: -24 }} />
      )}
      
      <div 
        className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-all cursor-pointer ${level === 0 ? 'border-primary/30' : ''}`}
        onClick={() => hasChildren && setExpanded(!expanded)}
      >
        {hasChildren ? (
          <button className="h-6 w-6 rounded flex items-center justify-center hover:bg-muted">
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : (
          <div className="w-6" />
        )}
        
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          {level === 0 ? (
            <Building2 className="h-5 w-5 text-primary" />
          ) : (
            <Network className="h-5 w-5 text-primary" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.name}</span>
            <Badge className={typeColors[node.type]} variant="secondary">
              {node.type === 'parent' ? 'Parent Company' : node.type.charAt(0).toUpperCase() + node.type.slice(1)}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            {node.country && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {node.country}
              </span>
            )}
            {node.employeeCount && (
              <span className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {node.employeeCount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && expanded && (
        <div className="ml-12 mt-2 space-y-2 relative">
          {node.children!.map((child, index) => (
            <TreeNodeComponent key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CorporateTree() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  
  const { data: customers, isLoading: customersLoading } = trpc.customer.list.useQuery({ limit: 50 });
  const { data: customer } = trpc.customer.get.useQuery(
    { id: parseInt(selectedCustomer) },
    { enabled: !!selectedCustomer }
  );
  const { data: subsidiaries } = trpc.subsidiary.listByCustomer.useQuery(
    { customerId: parseInt(selectedCustomer) },
    { enabled: !!selectedCustomer }
  );

  // Build tree structure
  const buildTree = (): TreeNode | null => {
    if (!customer) return null;
    
    const parentNode: TreeNode = {
      id: customer.id,
      name: customer.name,
      type: 'parent',
      country: customer.registrationCountry,
      employeeCount: customer.employeeCount,
      children: [],
    };
    
    if (subsidiaries) {
      // Group by parent subsidiary
      const topLevel = subsidiaries.filter(s => !s.parentSubsidiaryId);
      const getChildren = (parentId: number): TreeNode[] => {
        return subsidiaries
          .filter(s => s.parentSubsidiaryId === parentId)
          .map(s => ({
            id: s.id,
            name: s.name,
            type: (s.entityType || 'subsidiary') as TreeNode['type'],
            country: s.country,
            employeeCount: s.employeeCount,
            children: getChildren(s.id),
          }));
      };
      
      parentNode.children = topLevel.map(s => ({
        id: s.id,
        name: s.name,
        type: (s.entityType || 'subsidiary') as TreeNode['type'],
        country: s.country,
        employeeCount: s.employeeCount,
        children: getChildren(s.id),
      }));
    }
    
    return parentNode;
  };

  const tree = buildTree();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Corporate Family Tree</h1>
        <p className="text-muted-foreground">Visualize corporate structure and subsidiaries</p>
      </div>

      {/* Customer Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Company</CardTitle>
          <CardDescription>Choose a parent company to view its corporate structure</CardDescription>
        </CardHeader>
        <CardContent>
          {customersLoading ? (
            <Skeleton className="h-10 w-full max-w-md" />
          ) : customers && customers.length > 0 ? (
            <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="Choose a company..." />
              </SelectTrigger>
              <SelectContent>
                {customers.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <p className="text-muted-foreground">No customers available. Add customers first.</p>
          )}
        </CardContent>
      </Card>

      {/* Tree Visualization */}
      {selectedCustomer && tree ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5 text-primary" />
              {customer?.name} - Corporate Structure
            </CardTitle>
            <CardDescription>
              {subsidiaries?.length || 0} subsidiaries and branches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4">
              <TreeNodeComponent node={tree} />
            </div>
            
            {(!subsidiaries || subsidiaries.length === 0) && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg text-center text-muted-foreground">
                <p>No subsidiaries added yet for this company.</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => alert("Feature coming soon")}>
                  Add Subsidiary
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ) : selectedCustomer ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Skeleton className="h-32 w-full max-w-lg mx-auto" />
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">Select a company to view its structure</p>
              <p className="text-sm mt-1">The corporate family tree will display parent company, subsidiaries, and branches</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Entity Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary text-primary-foreground">Parent Company</Badge>
              <span className="text-sm text-muted-foreground">Main corporate entity</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Subsidiary</Badge>
              <span className="text-sm text-muted-foreground">Owned entity</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Branch</Badge>
              <span className="text-sm text-muted-foreground">Regional office</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-100 text-purple-800">Affiliate</Badge>
              <span className="text-sm text-muted-foreground">Related entity</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
