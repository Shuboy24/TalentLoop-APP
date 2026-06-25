"use client";

import { useState, useEffect, useCallback } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Edit2, Ban, CheckCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Skill = {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: {
    userSkills: number;
    senderProposals: number;
    receiverProposals: number;
  };
};

export default function AdminSkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({ name: "", category: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/skills?search=${encodeURIComponent(search)}`);
      const json = await res.json();
      if (json.success) {
        setSkills(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSkills();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchSkills]);

  const handleStatusToggle = async (skill: Skill) => {
    if (!confirm(`Are you sure you want to ${skill.isActive ? "deactivate" : "reactivate"} this skill?`)) return;

    try {
      const res = await fetch(`/api/admin/skills`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: skill.id, isActive: !skill.isActive, name: skill.name, category: skill.category })
      });
      const json = await res.json();
      if (json.success) {
        fetchSkills();
      } else {
        alert(json.error || "Failed to update");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async () => {
    if (!formData.name || !formData.category) return alert("Name and Category required");
    
    setIsSubmitting(true);
    try {
      const method = editingSkill ? "PATCH" : "POST";
      const body = editingSkill ? { id: editingSkill.id, ...formData } : formData;
      
      const res = await fetch(`/api/admin/skills`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      const json = await res.json();
      if (json.success) {
        setIsFormOpen(false);
        setEditingSkill(null);
        setFormData({ name: "", category: "", description: "" });
        fetchSkills();
      } else {
        alert(json.error || "Failed to save skill");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (skill: Skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      category: skill.category,
      description: skill.description || ""
    });
    setIsFormOpen(true);
  };

  const openNew = () => {
    setEditingSkill(null);
    setFormData({ name: "", category: "", description: "" });
    setIsFormOpen(true);
  };

  const columns = [
    {
      key: "name",
      header: "Skill Name",
      cell: (item: Skill) => <span className="font-medium text-neutral-on">{item.name}</span>
    },
    {
      key: "category",
      header: "Category",
      cell: (item: Skill) => <Badge variant="outline">{item.category}</Badge>
    },
    {
      key: "usage",
      header: "Users",
      cell: (item: Skill) => item._count?.userSkills || 0
    },
    {
      key: "status",
      header: "Status",
      cell: (item: Skill) => (
        item.isActive ? (
          <Badge className="bg-success text-success-on hover:bg-success/90">Active</Badge>
        ) : (
          <Badge variant="outline" className="text-neutral-variant-on">Inactive</Badge>
        )
      )
    },
    {
      key: "actions",
      header: "Actions",
      cell: (item: Skill) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
            <Edit2 className="w-4 h-4 text-primary" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleStatusToggle(item)}
            className={item.isActive ? "text-error" : "text-success"}
          >
            {item.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-display-sm font-bold text-neutral-on">Skills Directory</h1>
          <p className="text-body-md text-neutral-variant-on">Manage the platform's standard skills.</p>
        </div>
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-variant-on" />
            <Input 
              placeholder="Search skills..." 
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={openNew} className="bg-primary text-primary-on">
            <Plus className="w-4 h-4 mr-2" />
            New Skill
          </Button>
        </div>
      </div>

      {isLoading && skills.length === 0 ? (
        <div className="p-12 text-center text-neutral-variant-on">Loading skills...</div>
      ) : (
        <DataTable data={skills} columns={columns} keyExtractor={(s) => s.id} />
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSkill ? "Edit Skill" : "New Skill"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-label-sm font-medium">Skill Name</label>
              <Input 
                value={formData.name}
                onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                placeholder="e.g. React.js"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-sm font-medium">Category</label>
              <Input 
                value={formData.category}
                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                placeholder="e.g. Web Development"
              />
            </div>
            <div className="space-y-2">
              <label className="text-label-sm font-medium">Description</label>
              <Input 
                value={formData.description}
                onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))}
                placeholder="Short description..."
              />
            </div>
            <Button 
              className="w-full bg-primary text-primary-on" 
              onClick={handleFormSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Skill"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
