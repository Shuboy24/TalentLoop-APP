"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Ban, CheckCircle, Shield } from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  trustScore: number;
  reputationLevel: string;
  isSuspended: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setUsers(json.data.users);
        setTotalPages(json.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    // Debounce search slightly
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleStatusToggle = async (userId: string, currentlySuspended: boolean) => {
    if (!confirm(`Are you sure you want to ${currentlySuspended ? "unsuspend" : "suspend"} this user?`)) return;

    try {
      const res = await fetch(`/api/admin/users`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          action: currentlySuspended ? "unsuspend" : "suspend"
        })
      });
      const json = await res.json();
      if (json.success) {
        setUsers(users.map(u => u.id === userId ? { ...u, isSuspended: !currentlySuspended } : u));
      } else {
        alert(json.error || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      alert("Network error");
    }
  };

  const columns = [
    {
      key: "user",
      header: "User",
      cell: (item: User) => (
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarImage src={item.avatarUrl || ""} />
            <AvatarFallback>{item.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-neutral-on">{item.name}</div>
            <div className="text-label-sm text-neutral-variant-on">{item.email}</div>
          </div>
        </div>
      )
    },
    {
      key: "reputation",
      header: "Reputation",
      cell: (item: User) => (
        <div>
          <Badge variant="outline" className="mb-1">{item.reputationLevel}</Badge>
          <div className="text-label-sm text-neutral-variant-on">Score: {item.trustScore}</div>
        </div>
      )
    },
    {
      key: "status",
      header: "Status",
      cell: (item: User) => (
        item.isSuspended ? (
          <Badge className="bg-error text-error-on-error hover:bg-error/90">Suspended</Badge>
        ) : (
          <Badge className="bg-success text-success-on hover:bg-success/90">Active</Badge>
        )
      )
    },
    {
      key: "joined",
      header: "Joined",
      cell: (item: User) => new Date(item.createdAt).toLocaleDateString()
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item: User) => (
        <Button 
          variant={item.isSuspended ? "outline" : "ghost"}
          size="sm"
          className={item.isSuspended ? "border-success text-success" : "text-error hover:bg-error-container"}
          onClick={(e) => {
            e.stopPropagation();
            handleStatusToggle(item.id, item.isSuspended);
          }}
        >
          {item.isSuspended ? <CheckCircle className="w-4 h-4 mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
          {item.isSuspended ? "Unsuspend" : "Suspend"}
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-neutral-on">Users</h1>
          <p className="text-body-md text-neutral-variant-on">Manage platform users and moderation.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-variant-on" />
          <Input 
            placeholder="Search users..." 
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // reset to first page on search
            }}
          />
        </div>
      </div>

      {isLoading && users.length === 0 ? (
        <div className="p-12 text-center text-neutral-variant-on">Loading users...</div>
      ) : (
        <>
          <DataTable 
            data={users} 
            columns={columns} 
            keyExtractor={(u) => u.id} 
          />
          
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <Button 
                variant="outline" 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="text-label-sm text-neutral-variant-on">
                Page {page} of {totalPages}
              </span>
              <Button 
                variant="outline" 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
