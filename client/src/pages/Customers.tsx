import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Building2,
  Search,
  Plus,
  MapPin,
  Users,
  Globe,
  ChevronRight,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";

function formatCurrency(value: number | null): string {
  if (!value) return "N/A";
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function CustomerCardSkeleton() {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-5 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-4" />
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Customers() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    industry: "",
    registrationCountry: "",
    website: "",
    employeeCount: "",
    annualRevenue: "",
  });

  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();

  const { data: customers, isLoading } = trpc.customer.list.useQuery({
    search: search || undefined,
    limit: 50,
  });

  const createMutation = trpc.customer.create.useMutation({
    onSuccess: () => {
      toast.success("Customer created successfully");
      setIsAddOpen(false);
      setNewCustomer({ name: "", industry: "", registrationCountry: "", website: "", employeeCount: "", annualRevenue: "" });
      utils.customer.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create customer");
    },
  });

  const handleCreate = () => {
    if (!newCustomer.name.trim()) {
      toast.error("Customer name is required");
      return;
    }
    createMutation.mutate({
      name: newCustomer.name,
      industry: newCustomer.industry || undefined,
      registrationCountry: newCustomer.registrationCountry || undefined,
      website: newCustomer.website || undefined,
      employeeCount: newCustomer.employeeCount ? parseInt(newCustomer.employeeCount) : undefined,
      annualRevenue: newCustomer.annualRevenue ? parseInt(newCustomer.annualRevenue) * 100 : undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage enterprise accounts and corporate profiles
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button disabled={!isAuthenticated}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Create a new customer profile. You can add more details later.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Acme Corporation"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Technology"
                    value={newCustomer.industry}
                    onChange={(e) => setNewCustomer({ ...newCustomer, industry: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    placeholder="e.g., United States"
                    value={newCustomer.registrationCountry}
                    onChange={(e) => setNewCustomer({ ...newCustomer, registrationCountry: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="e.g., https://example.com"
                  value={newCustomer.website}
                  onChange={(e) => setNewCustomer({ ...newCustomer, website: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="employees">Employees</Label>
                  <Input
                    id="employees"
                    type="number"
                    placeholder="e.g., 5000"
                    value={newCustomer.employeeCount}
                    onChange={(e) => setNewCustomer({ ...newCustomer, employeeCount: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="revenue">Annual Revenue ($)</Label>
                  <Input
                    id="revenue"
                    type="number"
                    placeholder="e.g., 10000000"
                    value={newCustomer.annualRevenue}
                    onChange={(e) => setNewCustomer({ ...newCustomer, annualRevenue: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Customer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Customer List */}
      {isLoading ? (
        <div className="grid gap-4">
          <CustomerCardSkeleton />
          <CustomerCardSkeleton />
          <CustomerCardSkeleton />
        </div>
      ) : customers && customers.length > 0 ? (
        <div className="grid gap-4">
          {customers.map((customer) => (
            <Link key={customer.id} href={`/customers/${customer.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Building2 className="h-7 w-7 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                            {customer.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {customer.industry && (
                              <span>{customer.industry}</span>
                            )}
                            {customer.registrationCountry && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {customer.registrationCountry}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {customer.riskLevel && customer.riskLevel !== 'unknown' && (
                            <Badge variant={
                              customer.riskLevel === 'low' ? 'default' :
                              customer.riskLevel === 'medium' ? 'secondary' : 'destructive'
                            }>
                              {customer.riskLevel} risk
                            </Badge>
                          )}
                          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Employees</p>
                          <p className="font-medium flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {customer.employeeCount?.toLocaleString() || "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Revenue</p>
                          <p className="font-medium">
                            {formatCurrency(customer.annualRevenue ? customer.annualRevenue / 100 : null)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="font-medium capitalize">
                            {customer.operatingStatus || "Active"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Website</p>
                          {customer.website ? (
                            <a
                              // ✅✅✅ 修复逻辑：自动补全 https://
                              href={customer.website.startsWith('http') ? customer.website : `https://${customer.website}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-primary hover:underline flex items-center gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Globe className="h-3 w-3" />
                              Visit
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <p className="font-medium text-muted-foreground">N/A</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Building2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No customers found</h3>
              <p className="text-muted-foreground mb-6">
                {search ? "Try adjusting your search terms" : "Get started by adding your first customer"}
              </p>
              {!search && (
                <Button onClick={() => setIsAddOpen(true)} disabled={!isAuthenticated}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}