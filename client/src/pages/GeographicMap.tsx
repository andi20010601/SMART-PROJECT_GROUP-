import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import WorldMap, { MapMarker } from "@/components/WorldMap";
import { Globe, MapPin, Loader2, Building2, GitFork, Ban } from "lucide-react";

// ✅ 样式辅助函数
const getBadgeStyle = (type: string) => {
  if (!type) return "bg-gray-100 text-gray-800 border-gray-200";

  const t = type.toLowerCase();

  if (t === 'hq' || t.includes('headquarters')) {
    return "bg-red-100 text-red-700 hover:bg-red-200 border-red-200";
  }
  if (t === 'branch') {
    return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
  }
  if (t.includes('inactive') || t.includes('dissolved')) {
    return "bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200";
  }

  // 默认为 Subsidiary (绿色)
  return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200";
};

export default function GeographicMap() {
  const [selectedCustomer, setSelectedCustomer] = useState<string>("all");
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);

  const { data: customers } = trpc.customer.list.useQuery({});
  const { data: apiMarkers, isLoading } = trpc.geographic.getMarkers.useQuery({
    customerId: selectedCustomer !== "all" ? parseInt(selectedCustomer) : undefined,
  });

  const markers: MapMarker[] = apiMarkers?.map(m => ({
    id: m.id,
    name: m.name,
    country: m.country,
    city: m.city,
    latitude: m.latitude,
    longitude: m.longitude,
    type: m.type as MapMarker["type"],
  })) || [];

  // ✅ 统计逻辑
  const stats = {
    total: markers.length,
    hq: markers.filter(m => m.type === 'hq').length,
    subsidiary: markers.filter(m => m.type === 'subsidiary').length,
    branch: markers.filter(m => m.type === 'branch').length,
    inactive: markers.filter(m => m.type === 'inactive').length,
  };

  // Group by country
  const countryStats = markers.reduce((acc, marker) => {
    acc[marker.country] = (acc[marker.country] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCountries = Object.entries(countryStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6" />
            Geographic Distribution
          </h1>
          <p className="text-muted-foreground mt-1">
            Visualize subsidiary and branch locations worldwide
          </p>
        </div>

        <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by customer" />
          </SelectTrigger>

          {/* ✅✅✅ 重点修改：高度限制为 200px，并强制开启垂直滚动条 ✅✅✅ */}
          <SelectContent className="max-h-[200px] overflow-y-auto">
            <SelectItem value="all">All Customers</SelectItem>
            {customers?.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* 1. Total */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Locations</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </CardContent>
        </Card>

        {/* 2. Headquarters */}
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-red-500" />
              <span className="text-sm text-muted-foreground">Headquarters</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.hq}</p>
          </CardContent>
        </Card>

        {/* 3. Subsidiaries */}
        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-sm text-muted-foreground">Subsidiaries</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.subsidiary}</p>
          </CardContent>
        </Card>

        {/* 4. Branches */}
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <GitFork className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Branches</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.branch}</p>
          </CardContent>
        </Card>

        {/* 5. Inactive */}
        <Card className="border-l-4 border-l-slate-300">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Ban className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-muted-foreground">Inactive</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stats.inactive}</p>
          </CardContent>
        </Card>
      </div>

      {/* World Map */}
      <Card>
        <CardHeader>
          <CardTitle>Global Presence Map</CardTitle>
          <CardDescription>
            {isLoading ? "Loading locations..." : `Showing ${markers.length} locations.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-[450px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : markers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[450px] text-center">
              <Globe className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">No locations found</p>
            </div>
          ) : (
            <WorldMap
              markers={markers}
              onMarkerClick={setSelectedMarker}
              height={450}
            />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Country Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Top Countries</CardTitle>
            <CardDescription>Locations by country</CardDescription>
          </CardHeader>
          <CardContent>
            {sortedCountries.length === 0 ? (
              <p className="text-muted-foreground text-sm">No location data available</p>
            ) : (
              <div className="space-y-3">
                {sortedCountries.map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{country}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(count / stats.total) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground w-6 text-right">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Selected Location Details */}
        <Card>
          <CardHeader>
            <CardTitle>Location Details</CardTitle>
            <CardDescription>
              {selectedMarker ? selectedMarker.name : "Select a marker on the map"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedMarker ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <span className="text-xs text-muted-foreground block mb-1">Entity Name</span>
                    <p className="font-semibold text-lg">{selectedMarker.name}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Type</span>
                    <Badge variant="outline" className={`border-0 ${getBadgeStyle(selectedMarker.type)}`}>
                      {selectedMarker.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Country</span>
                    <p>{selectedMarker.country}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block mb-1">Coordinates</span>
                    <p className="font-mono text-sm text-muted-foreground">
                      {selectedMarker.latitude.toFixed(4)}, {selectedMarker.longitude.toFixed(4)}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground text-sm">
                  Click on a map marker to view details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Location List */}
      <Card>
        <CardHeader>
          <CardTitle>All Locations</CardTitle>
          <CardDescription>
            Complete list of geographic locations ({markers.length} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Coordinates</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {markers.map((marker) => (
                <TableRow
                  key={marker.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setSelectedMarker(marker)}
                >
                  <TableCell className="font-medium">{marker.name}</TableCell>
                  <TableCell>{marker.country}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`border-0 ${getBadgeStyle(marker.type)}`}>
                      {marker.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right text-muted-foreground">
                    {marker.latitude.toFixed(2)}, {marker.longitude.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}