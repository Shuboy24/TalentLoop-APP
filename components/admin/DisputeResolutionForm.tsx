"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export function DisputeResolutionForm({ disputeId, onResolved }: { disputeId: string; onResolved: () => void }) {
  const [dispute, setDispute] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [resolution, setResolution] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchDispute() {
      try {
        const res = await fetch(`/api/disputes/${disputeId}`);
        const json = await res.json();
        if (json.success) {
          setDispute(json.data);
          if (json.data.status === "Resolved") {
            setResolution(json.data.resolution || "");
            setAdminNotes(json.data.adminNotes || "");
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDispute();
  }, [disputeId]);

  const handleSubmit = async () => {
    if (!resolution) return alert("Please select a resolution");
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/disputes/${disputeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution, adminNotes })
      });
      const json = await res.json();
      if (json.success) {
        onResolved();
      } else {
        alert(json.error || "Failed to resolve dispute");
      }
    } catch (e) {
      console.error(e);
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-4 text-center">Loading...</div>;
  if (!dispute) return <div className="p-4 text-center text-error">Dispute not found</div>;

  const isResolved = dispute.status === "Resolved";

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral/30 p-4 rounded-lg">
        <div>
          <p className="text-label-sm text-neutral-variant-on">Reason</p>
          <p className="font-medium">{dispute.reason}</p>
        </div>
        <div>
          <p className="text-label-sm text-neutral-variant-on">Trade Status</p>
          <Badge variant="outline">{dispute.trade.status}</Badge>
        </div>
        <div className="col-span-1 md:col-span-2">
          <p className="text-label-sm text-neutral-variant-on">Details</p>
          <p className="text-body-sm bg-white p-3 rounded-md border border-neutral-variant mt-1">
            {dispute.reasonDetail || "No details provided."}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-title-sm font-semibold">Admin Resolution</h3>
        
        <div className="space-y-2">
          <label className="text-label-sm font-medium">Outcome</label>
          <Select 
            value={resolution} 
            onValueChange={(val) => setResolution(val || "")} 
            disabled={isResolved || isSubmitting}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Complete Trade">Complete Trade</SelectItem>
              <SelectItem value="Dismissed">Dismissed (Resume Trade)</SelectItem>
              <SelectItem value="Suspend">Suspend Offending User & Cancel Trade</SelectItem>
              <SelectItem value="Warn">Issue Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-label-sm font-medium">Admin Notes (Internal)</label>
          <Textarea 
            value={adminNotes} 
            onChange={(e) => setAdminNotes(e.target.value)}
            disabled={isResolved || isSubmitting}
            placeholder="Explain the decision..."
            className="min-h-[100px]"
          />
        </div>

        {!isResolved && (
          <Button 
            className="w-full bg-primary text-primary-on" 
            onClick={handleSubmit}
            disabled={isSubmitting || !resolution}
          >
            {isSubmitting ? "Resolving..." : "Resolve Dispute"}
          </Button>
        )}
      </div>
    </div>
  );
}
