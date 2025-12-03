import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Event as EventEntity, EventTask, EventMember, InsertEvent, InsertEventTask, InsertEventMember, Operator as TeamMember } from "@shared/schema";
import { Trash2, Pencil, Save, X } from "lucide-react";

export default function EventsPage() {
  const { toast } = useToast();
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const { data: events = [], isLoading: eventsLoading, error: eventsError } = useQuery<EventEntity[]>({
    queryKey: ["/api/events"],
  });

  // Debug logging
  if (eventsError) {
    console.error("Events fetch error:", eventsError);
  }
  if (events.length > 0) {
    console.log("Loaded events:", events);
  }

  const { data: teamMembers = [] } = useQuery<TeamMember[]>({
    queryKey: ["/api/operators"],
  });

  const createEventMutation = useMutation({
    mutationFn: (data: InsertEvent) => apiRequest("POST", "/api/events", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setCreating(false);
      setTitle(""); setStartDate(""); setEndDate(""); setDescription("");
    },
    onError: (err: any) => {
      toast({ title: "Failed to create event", description: String(err?.message || err), variant: "destructive" });
    }
  });

  const updateEventMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertEvent> }) => apiRequest("PATCH", `/api/events/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update event", description: String(err?.message || err), variant: "destructive" });
    }
  });

  const deleteEventMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/events/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to delete event", description: String(err?.message || err), variant: "destructive" });
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: InsertEventTask) => {
      console.log("Task mutation triggered:", data);
      return apiRequest("POST", "/api/event-tasks", data);
    },
    onSuccess: (_data, vars) => {
      console.log("Task created successfully:", _data);
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/" + vars.eventId + "/tasks"] });
    },
    onError: (err: any) => {
      console.error("Task creation error:", err);
      toast({ title: "Failed to create task", description: String(err?.message || err), variant: "destructive" });
    }
  });

  const addMemberMutation = useMutation({
    mutationFn: (data: InsertEventMember) => apiRequest("POST", "/api/event-members", data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/" + vars.eventId + "/members"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to add member", description: String(err?.message || err), variant: "destructive" });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: ({ eventId, memberId }: { eventId: string; memberId: string }) => apiRequest("DELETE", `/api/events/${eventId}/members/${memberId}`),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events/" + vars.eventId + "/members"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to remove member", description: String(err?.message || err), variant: "destructive" });
    }
  });

  const handleCreateEvent = () => {
    if (!title.trim()) return;
    createEventMutation.mutate({ title, description: description || undefined, startDate: startDate || undefined, endDate: endDate || undefined });
  };

  return (
    <div className="h-full overflow-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Events</h1>
        <Button onClick={() => setCreating((v) => !v)} variant={creating ? "secondary" : "default"}>
          {creating ? "Close" : "New Event"}
        </Button>
      </div>

      {creating && (
        <Card>
          <CardHeader>
            <CardTitle>Create Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input type="date" placeholder="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              <Input type="date" placeholder="End Date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            <div className="flex justify-end">
              <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending}>Create</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {eventsLoading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      )}

      {eventsError && (
        <div className="rounded-md bg-destructive/10 p-4 text-destructive">
          <p className="font-medium">Failed to load events</p>
          <p className="text-sm mt-1">{String(eventsError)}</p>
        </div>
      )}

      {!eventsLoading && !eventsError && events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No events yet. Create your first event above.</p>
        </div>
      )}

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {events.map((ev) => (
          <EditableEventCard
            key={ev.id}
            event={ev}
            teamMembers={teamMembers}
            onUpdate={(data) => updateEventMutation.mutate({ id: ev.id, data })}
            onDelete={() => deleteEventMutation.mutate(ev.id)}
            onCreateTask={(task) => createTaskMutation.mutate(task)}
            onAddMember={(member) => addMemberMutation.mutate(member)}
            onRemoveMember={(memberId) => removeMemberMutation.mutate({ eventId: ev.id, memberId })}
          />
        ))}
      </div>
    </div>
  );
}

function EditableEventCard({
  event,
  teamMembers,
  onUpdate,
  onDelete,
  onCreateTask,
  onAddMember,
  onRemoveMember,
}: {
  event: EventEntity;
  teamMembers: TeamMember[];
  onUpdate: (data: Partial<InsertEvent>) => void;
  onDelete: () => void;
  onCreateTask: (data: InsertEventTask) => void;
  onAddMember: (data: InsertEventMember) => void;
  onRemoveMember: (memberId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(event.title);
  const [startDate, setStartDate] = useState(event.startDate || "");
  const [endDate, setEndDate] = useState(event.endDate || "");
  const [description, setDescription] = useState(event.description || "");

  const handleSave = () => {
    onUpdate({ title, startDate: startDate || undefined, endDate: endDate || undefined, description: description || undefined });
    setEditing(false);
  };

  const handleDelete = () => {
    if (confirm("Delete this event? This will remove tasks and members.")) {
      onDelete();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {editing ? (
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          ) : (
            <span>{event.title}</span>
          )}
          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button size="icon" variant="ghost" onClick={handleSave} title="Save"><Save className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => { setEditing(false); setTitle(event.title); setStartDate(event.startDate || ""); setEndDate(event.endDate || ""); setDescription(event.description || ""); }} title="Cancel"><X className="h-4 w-4" /></Button>
              </>
            ) : (
              <>
                <Button size="icon" variant="ghost" onClick={() => setEditing(true)} title="Edit"><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={handleDelete} title="Delete"><Trash2 className="h-4 w-4" /></Button>
              </>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Dates</span>
          {editing ? (
            <div className="flex items-center gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-[150px]" />
              <span>→</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-[150px]" />
            </div>
          ) : (
            <span>{event.startDate || "--"} → {event.endDate || "--"}</span>
          )}
        </div>

        <div>
          {editing ? (
            <Textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          ) : (
            event.description && <p className="text-sm text-muted-foreground">{event.description}</p>
          )}
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Tasks</h3>
          <EventTasks 
            eventId={event.id} 
            teamMembers={teamMembers}
            onCreate={(task) => onCreateTask(task)} 
          />
        </div>

        {/* Members */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Members</h3>
          <EventMembers 
            eventId={event.id} 
            teamMembers={teamMembers} 
            onAdd={(member) => onAddMember(member)}
            onRemove={(memberId) => onRemoveMember(memberId)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function EventTasks({ eventId, teamMembers, onCreate }: { eventId: string; teamMembers: TeamMember[]; onCreate: (data: InsertEventTask) => void }) {
  const { toast } = useToast();
  const { data: tasks = [], isLoading, error } = useQuery<EventTask[]>({ queryKey: ["/api/events/" + eventId + "/tasks"] });
  const [title, setTitle] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined);

  // Debug logging
  console.log(`EventTasks for event ${eventId}:`, { tasks, isLoading, error });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertEventTask> }) => apiRequest("PATCH", `/api/event-tasks/${id}`, data),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/" + eventId + "/tasks"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to update task", description: String(err?.message || err), variant: "destructive" });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/event-tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events/" + eventId + "/tasks"] });
    },
    onError: (err: any) => {
      toast({ title: "Failed to delete task", description: String(err?.message || err), variant: "destructive" });
    }
  });

  const handleCreate = () => {
    if (!title.trim()) return;
    console.log("Creating task:", { eventId, title, assigneeId });
    onCreate({ eventId, title, assigneeId: assigneeId || undefined });
    setTitle(""); setAssigneeId(undefined);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        <Input 
          placeholder="New task title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="text-base"
        />
        <div className="flex gap-2">
          <Select value={assigneeId || ""} onValueChange={(v) => setAssigneeId(v || undefined)}>
            <SelectTrigger className="flex-1"><SelectValue placeholder="Assign to team member (optional)" /></SelectTrigger>
            <SelectContent>
              {teamMembers.map((member) => (
                <SelectItem key={member.id} value={member.id}>{member.name} ({member.initials})</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreate} className="w-24">Add Task</Button>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            teamMembers={teamMembers}
            onSave={(data) => updateTaskMutation.mutate({ id: t.id, data })}
            onDelete={() => { if (confirm('Delete task?')) deleteTaskMutation.mutate(t.id); }}
          />
        ))}
        {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks yet. Add one above.</p>}
      </div>
    </div>
  );
}

function TaskRow({ task, teamMembers, onSave, onDelete }: { task: EventTask; teamMembers: TeamMember[]; onSave: (data: Partial<InsertEventTask>) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [status, setStatus] = useState(task.status || "pending");
  const [assigneeId, setAssigneeId] = useState<string | undefined>(task.assigneeId || undefined);

  const handleCancel = () => {
    setEditing(false);
    setTitle(task.title);
    setStatus(task.status || "pending");
    setAssigneeId(task.assigneeId || undefined);
  };

  const handleSave = () => {
    onSave({ title, status, assigneeId });
    setEditing(false);
  };

  return (
    <div className="border rounded-lg p-3 bg-card">
      {!editing ? (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="font-medium text-base">{task.title}</div>
            <div className="text-xs text-muted-foreground">
              Status: {task.status || "pending"}
              {" • "}
              Assigned: {task.assigneeId
                ? (teamMembers.find(m => m.id === task.assigneeId)?.name || task.assigneeId)
                : "Unassigned"}
            </div>
          </div>
          <Button variant="outline" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant="ghost" size="icon" title="Delete" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Task title" />
          <div className="flex gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {['pending','in-progress','completed'].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={assigneeId || ""} onValueChange={(v) => setAssigneeId(v || undefined)}>
              <SelectTrigger className="flex-1"><SelectValue placeholder="Assign" /></SelectTrigger>
              <SelectContent>
                {teamMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>{member.name} ({member.initials})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 justify-end">
            <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function EventMembers({ eventId, teamMembers, onAdd, onRemove }: { eventId: string; teamMembers: TeamMember[]; onAdd: (data: InsertEventMember) => void; onRemove: (memberId: string) => void }) {
  const { data: members = [] } = useQuery<EventMember[]>({ queryKey: ["/api/events/" + eventId + "/members"] });
  const [memberId, setMemberId] = useState<string>("");

  const handleAdd = () => {
    if (!memberId) return;
    onAdd({ eventId, operatorId: memberId });
    setMemberId("");
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Select value={memberId} onValueChange={(v) => setMemberId(v)}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Select team member" /></SelectTrigger>
          <SelectContent>
            {teamMembers.map((member) => (
              <SelectItem key={member.id} value={member.id}>{member.name} ({member.initials})</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAdd}>Add</Button>
      </div>
      <ul className="space-y-1">
        {members.map((m) => {
          const member = teamMembers.find(tm => tm.id === m.operatorId);
          return (
            <li key={m.id} className="flex items-center justify-between text-sm">
              <span>{member ? `${member.name} (${member.initials})` : m.operatorId}</span>
              <Button size="icon" variant="ghost" onClick={() => onRemove(m.operatorId)} title="Remove"><Trash2 className="h-4 w-4" /></Button>
            </li>
          );
        })}
        {members.length === 0 && <li className="text-xs text-muted-foreground">No members yet.</li>}
      </ul>
    </div>
  );
}
