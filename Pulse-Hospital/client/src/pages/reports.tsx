import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth-provider";
import { hasPermission } from "@/lib/auth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TrendingUp, Search, Eye, Check, Printer, Zap, Snowflake } from "lucide-react";
import { Report } from "@shared/schema";

export default function ReportsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    systemType: "",
    status: "",
    date: "",
  });

  const { data: reports = [], isLoading } = useQuery<Report[]>({
    queryKey: ['/api/reports', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.systemType) params.set('systemType', filters.systemType);
      if (filters.status) params.set('status', filters.status);
      if (filters.date) params.set('date', filters.date);
      
      const response = await fetch(`/api/reports?${params}`);
      if (!response.ok) throw new Error('Failed to fetch reports');
      return response.json();
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: number; updates: Partial<Report> }) => {
      const response = await apiRequest("PATCH", `/api/reports/${id}`, updates);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reports'] });
      toast({
        title: "Success",
        description: "Report updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (reportId: number) => {
    updateReportMutation.mutate({
      id: reportId,
      updates: {
        status: "approved",
        approvedBy: user?.id,
      },
    });
  };

  const handleReview = (reportId: number) => {
    updateReportMutation.mutate({
      id: reportId,
      updates: {
        status: "reviewed",
        reviewedBy: user?.id,
      },
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending Review</Badge>;
      case "reviewed":
        return <Badge variant="outline">Reviewed</Badge>;
      case "approved":
        return <Badge className="bg-pulse-green text-white">Approved</Badge>;
      case "requires_attention":
        return <Badge variant="destructive">Requires Attention</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSystemBadge = (systemType: string) => {
    if (systemType === "electrical") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Zap className="w-3 h-3 mr-1" />
          Electrical
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          <Snowflake className="w-3 h-3 mr-1" />
          AC System
        </Badge>
      );
    }
  };

  const countIssues = (checklistData: any) => {
    if (!checklistData) return 0;
    
    let issueCount = 0;
    Object.keys(checklistData).forEach(key => {
      if (key.includes('_') && !key.includes('_remarks') && checklistData[key] === 'No') {
        issueCount++;
      }
    });
    
    return issueCount;
  };

  return (
    <Card className="bg-white rounded-lg shadow-sm">
      <CardHeader className="px-6 py-4 border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <TrendingUp className="text-pulse-blue mr-2" />
          Daily Reports & Review
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Review and manage daily maintenance reports</p>
      </CardHeader>
      
      <CardContent className="p-6">
        {/* Reports Filter */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">System</label>
              <Select value={filters.systemType} onValueChange={(value) => setFilters({ ...filters, systemType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Systems" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Systems</SelectItem>
                  <SelectItem value="electrical">Electrical</SelectItem>
                  <SelectItem value="ac">AC System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="requires_attention">Requires Attention</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full bg-pulse-blue hover:bg-blue-700">
                <Search className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </div>

        {/* Reports Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Operator</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Issues</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading reports...
                  </TableCell>
                </TableRow>
              ) : reports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No reports found. Adjust your filters or wait for new submissions.
                  </TableCell>
                </TableRow>
              ) : (
                reports.map((report) => {
                  const issueCount = countIssues(report.checklistData);
                  
                  return (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.date}</TableCell>
                      <TableCell>{getSystemBadge(report.systemType)}</TableCell>
                      <TableCell>{report.operatorName}</TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        {issueCount > 0 ? (
                          <span className="text-red-600 font-medium">
                            {issueCount} item{issueCount > 1 ? 's' : ''} require attention
                          </span>
                        ) : (
                          <span className="text-green-600">All systems normal</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="text-pulse-blue hover:text-blue-700">
                            <Eye className="w-4 h-4" />
                          </Button>
                          {hasPermission(user?.role || "", "supervisor") && report.status === "pending" && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-pulse-green hover:text-green-700"
                              onClick={() => handleReview(report.id)}
                              disabled={updateReportMutation.isPending}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          {hasPermission(user?.role || "", "manager") && report.status === "reviewed" && (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-pulse-green hover:text-green-700"
                              onClick={() => handleApprove(report.id)}
                              disabled={updateReportMutation.isPending}
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-gray-600 hover:text-gray-700">
                            <Printer className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
