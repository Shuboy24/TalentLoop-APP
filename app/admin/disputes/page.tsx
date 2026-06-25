"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DisputeResolutionForm } from "@/components/admin/DisputeResolutionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Dispute = {
  id: string;
  tradeId: string;
  reason: string;
  status: string;
  createdAt: string;
  complainant: { name: string; email: string };
  trade: {
    userA: { name: string };
    userB: { name: string };
  };
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDisputeId, setSelectedDisputeId] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    setIsLoading(true);
    try {
      // Create a quick API endpoint for fetching disputes
      const res = await fetch(`/api/admin/disputes`);
      const json = await res.json();
      if (json.success) {
        setDisputes(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const columns = [
    {
      key: "id",
      header: "Dispute ID",
      cell: (item: Dispute) => <span className="font-mono text-label-sm">{item.id.split("-")[0]}...</span>
    },
    {
      key: "complainant",
      header: "Raised By",
      cell: (item: Dispute) => (
        <div>
          <div className="font-medium text-neutral-on">{item.complainant.name}</div>
          <div className="text-label-sm text-neutral-variant-on">{item.complainant.email}</div>
        </div>
      )
    },
    {
      key: "trade",
      header: "Trade",
      cell: (item: Dispute) => `${item.trade.userA.name} ⇄ ${item.trade.userB.name}`
    },
    {
      key: "reason",
      header: "Reason",
      cell: (item: Dispute) => item.reason
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Dispute) => (
        item.status === "Open" ? (
          <Badge className="bg-error text-error-on-error hover:bg-error/90">Open</Badge>
        ) : (
          <Badge variant="outline" className="border-success text-success">Resolved</Badge>
        )
      )
    },
    {
      key: "date",
      header: "Date",
      cell: (item: Dispute) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: "action",
      header: "Action",
      cell: (item: Dispute) => (
        <Button variant="outline" size="sm" onClick={() => setSelectedDisputeId(item.id)}>
          {item.status === "Open" ? "Resolve" : "View Details"}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-display-sm font-bold text-neutral-on">Disputes</h1>
        <p className="text-body-md text-neutral-variant-on">Manage and resolve user disputes.</p>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-neutral-variant-on">Loading disputes...</div>
      ) : (
        <DataTable data={disputes} columns={columns} keyExtractor={(d) => d.id} />
      )}

      {selectedDisputeId && (
        <Dialog open={true} onOpenChange={(open) => { if (!open) setSelectedDisputeId(null) }}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dispute Details</DialogTitle>
            </DialogHeader>
            <DisputeResolutionForm 
              disputeId={selectedDisputeId} 
              onResolved={() => {
                setSelectedDisputeId(null);
                fetchDisputes();
              }} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
