import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Machine, ProductionStat } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function ProductionStats() {
  const todayLocal = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const { data: machines = [], isLoading: isLoadingMachines } = useQuery<Machine[]>({
    queryKey: ["/api/machines"],
    staleTime: 60000,
  });

  const { data: productionStats = [], isLoading: isLoadingStats } = useQuery<ProductionStat[]>({
    queryKey: ["/api/production-stats"],
    staleTime: 0,
  });

  const [form, setForm] = useState({
    machineId: "",
    shift: "Day",
    date: todayLocal,
    unitsProduced: "",
    targetUnits: "",
    downtime: "0",
    efficiency: "",
  });

  const submitStatMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        machineId: form.machineId,
        shift: form.shift,
        date: form.date,
        unitsProduced: Number(form.unitsProduced || 0),
        targetUnits: Number(form.targetUnits || 0),
        downtime: Number(form.downtime || 0),
        efficiency: form.efficiency === "" ? null : Number(form.efficiency),
      } as const;
      await apiRequest("POST", "/api/production-stats", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/efficiency"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/machine-history"] });
      setForm((f) => ({ ...f, unitsProduced: "", targetUnits: "", downtime: "0", efficiency: "" }));
    },
  });

  const deleteStatMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/production-stats/${id}`);
      try { await res.json(); } catch {}
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/production-stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/efficiency"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/machine-history"] });
    },
  });

  if (isLoadingMachines || isLoadingStats) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-1">Production Stats</h1>
          <p className="text-muted-foreground text-sm">Loading data...</p>
        </div>
        <div className="flex-1 px-4 pb-4">
          <Skeleton className="h-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="flex-shrink-0 border-b p-4">
        <div>
          <h1 className="text-2xl font-bold">Production Stats</h1>
          <p className="text-muted-foreground text-sm mt-1">
            View and manage production statistics for machines
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Create Production Stat</CardTitle>
              <CardDescription className="text-xs">Add a new production entry</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label>Machine</Label>
                  <Select value={form.machineId} onValueChange={(v) => setForm((f) => ({ ...f, machineId: v }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select machine" />
                    </SelectTrigger>
                    <SelectContent>
                      {machines.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Shift</Label>
                  <Select value={form.shift} onValueChange={(v) => setForm((f) => ({ ...f, shift: v }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {['Day','Afternoon','Midnight'].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Date</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label>Units Produced</Label>
                  <Input type="number" inputMode="numeric" value={form.unitsProduced} onChange={(e) => setForm((f) => ({ ...f, unitsProduced: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Target Units</Label>
                  <Input type="number" inputMode="numeric" value={form.targetUnits} onChange={(e) => setForm((f) => ({ ...f, targetUnits: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Downtime (min)</Label>
                  <Input type="number" inputMode="numeric" value={form.downtime} onChange={(e) => setForm((f) => ({ ...f, downtime: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Efficiency % (optional)</Label>
                  <Input type="number" inputMode="decimal" step="0.1" value={form.efficiency} onChange={(e) => setForm((f) => ({ ...f, efficiency: e.target.value }))} />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={() => submitStatMutation.mutate()}
                  disabled={!form.machineId || !form.date || submitStatMutation.isPending}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Entry
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Production Stats</CardTitle>
              <CardDescription className="text-xs">Latest entries (most recent first)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[50vh] border rounded-md">
                <table className="w-full text-xs">
                  <thead className="border-b sticky top-0 bg-background">
                    <tr>
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Machine</th>
                      <th className="text-left py-2 px-2">Shift</th>
                      <th className="text-right py-2 px-2">Units</th>
                      <th className="text-right py-2 px-2">Target</th>
                      <th className="text-right py-2 px-2">Eff%</th>
                      <th className="text-right py-2 px-2">Downtime</th>
                      <th className="text-right py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...productionStats]
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .slice(0, 200)
                      .map((stat) => {
                        const machineName = machines.find((m) => m.id === stat.machineId)?.name || stat.machineId;
                        return (
                          <tr key={stat.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2 truncate">{stat.date}</td>
                            <td className="py-2 px-2 truncate">{machineName}</td>
                            <td className="py-2 px-2 truncate">{stat.shift}</td>
                            <td className="text-right py-2 px-2 tabular-nums">{stat.unitsProduced}</td>
                            <td className="text-right py-2 px-2 tabular-nums">{stat.targetUnits}</td>
                            <td className="text-right py-2 px-2 tabular-nums">{stat.efficiency != null ? `${stat.efficiency.toFixed(1)}%` : "--"}</td>
                            <td className="text-right py-2 px-2 tabular-nums">{stat.downtime ?? 0}m</td>
                            <td className="text-right py-2 px-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 px-2 gap-1"
                                onClick={() => deleteStatMutation.mutate(stat.id)}
                                disabled={deleteStatMutation.isPending}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
