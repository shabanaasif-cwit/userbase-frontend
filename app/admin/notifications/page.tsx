"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getNotifications,
  addNotification,
  updateNotification,
  deleteNotification,
  getTargetSummary,
  type StoredNotification,
  type NotificationTargetType,
} from "@/lib/notifications-store";
import { getManagedUsers } from "@/lib/auth-context";
import { ROLES } from "@/lib/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TARGET_OPTIONS: { value: NotificationTargetType; label: string }[] = [
  { value: "all", label: "All users" },
  { value: "role", label: "By role" },
  { value: "users", label: "Specific users" },
];

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [managedUsers, setManagedUsers] = useState<{ email: string; name: string }[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [formTargetType, setFormTargetType] = useState<NotificationTargetType>("all");
  const [formTargetRole, setFormTargetRole] = useState<string>(ROLES.USER);
  const [formTargetUserIds, setFormTargetUserIds] = useState<string[]>([]);

  const load = useCallback(() => {
    setNotifications(getNotifications());
    setManagedUsers(
      getManagedUsers().map((u) => ({ email: u.email, name: u.name || u.email }))
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = useCallback(() => {
    setFormTitle("");
    setFormMessage("");
    setFormTargetType("all");
    setFormTargetRole(ROLES.USER);
    setFormTargetUserIds([]);
    setEditingId(null);
  }, []);

  const openCreate = () => {
    resetForm();
    setCreateOpen(true);
  };

  const openEdit = (n: StoredNotification) => {
    setFormTitle(n.title);
    setFormMessage(n.message);
    setFormTargetType(n.targetType);
    setFormTargetRole(n.targetRole ?? ROLES.USER);
    setFormTargetUserIds(n.targetUserIds ?? []);
    setEditingId(n.id);
    setEditOpen(true);
  };

  const openDelete = (id: string) => {
    setDeletingId(id);
    setDeleteOpen(true);
  };

  const handleCreate = () => {
    if (!formTitle.trim()) return;
    const payload = {
      title: formTitle.trim(),
      message: formMessage.trim(),
      targetType: formTargetType,
      ...(formTargetType === "role" && { targetRole: formTargetRole }),
      ...(formTargetType === "users" && { targetUserIds: formTargetUserIds }),
    };
    addNotification(payload);
    load();
    setCreateOpen(false);
    resetForm();
  };

  const handleUpdate = () => {
    if (!editingId || !formTitle.trim()) return;
    const payload = {
      title: formTitle.trim(),
      message: formMessage.trim(),
      targetType: formTargetType,
      ...(formTargetType === "role" && { targetRole: formTargetRole }),
      ...(formTargetType === "users" && { targetUserIds: formTargetUserIds }),
    };
    updateNotification(editingId, payload);
    load();
    setEditOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteNotification(deletingId);
      load();
      setDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const toggleUserInForm = (email: string) => {
    setFormTargetUserIds((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const deletingNotification = notifications.find((n) => n.id === deletingId);

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="rounded-2xl border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-6 py-10 sm:px-8 sm:py-12">
          <div className="flex items-center gap-2 text-zinc-400">
            <Bell className="h-4 w-4" />
            <span className="text-xs font-medium uppercase tracking-widest">
              Admin
            </span>
          </div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Manage Notifications
          </h1>
          <p className="mt-2 max-w-lg text-zinc-400">
            Create, edit, and delete notifications. Target all users, by role, or
            specific users (frontend-only; data stored in localStorage until
            backend is available).
          </p>
        </section>

        <Card className="mt-10 border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-white">Notifications</CardTitle>
              <CardDescription className="text-zinc-400">
                {notifications.length} notification(s)
              </CardDescription>
            </div>
            <Button
              onClick={openCreate}
              className="bg-sky-600 text-white hover:bg-sky-500"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create notification
            </Button>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-white/5 py-8 text-center text-zinc-400">
                No notifications yet. Create one to get started.
              </p>
            ) : (
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-white/5">
                      <TableHead className="text-zinc-300">Title</TableHead>
                      <TableHead className="text-zinc-300 max-w-[200px]">Message</TableHead>
                      <TableHead className="text-zinc-300">Target</TableHead>
                      <TableHead className="text-zinc-300">Created</TableHead>
                      <TableHead className="text-zinc-300 text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((n) => (
                      <TableRow
                        key={n.id}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="font-medium text-white">
                          {n.title}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate text-zinc-400">
                          {n.message || "—"}
                        </TableCell>
                        <TableCell className="text-zinc-400">
                          {getTargetSummary(n)}
                        </TableCell>
                        <TableCell className="text-zinc-500 text-sm">
                          {formatDate(n.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-zinc-300 hover:text-white hover:bg-white/10"
                              onClick={() => openEdit(n)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                              onClick={() => openDelete(n.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-sm text-zinc-500">
          <Link
            href="/admin/dashboard"
            className="text-sky-400 hover:underline"
          >
            ← Back to Admin Dashboard
          </Link>
        </p>
      </main>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="border-white/10 bg-zinc-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create notification</DialogTitle>
          </DialogHeader>
          <NotificationForm
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formMessage={formMessage}
            setFormMessage={setFormMessage}
            formTargetType={formTargetType}
            setFormTargetType={setFormTargetType}
            formTargetRole={formTargetRole}
            setFormTargetRole={setFormTargetRole}
            formTargetUserIds={formTargetUserIds}
            toggleUserInForm={toggleUserInForm}
            managedUsers={managedUsers}
          />
          <DialogFooter showCloseButton className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-white/20 text-zinc-300"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-500 text-white"
              onClick={handleCreate}
              disabled={!formTitle.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-white/10 bg-zinc-900 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit notification</DialogTitle>
          </DialogHeader>
          <NotificationForm
            formTitle={formTitle}
            setFormTitle={setFormTitle}
            formMessage={formMessage}
            setFormMessage={setFormMessage}
            formTargetType={formTargetType}
            setFormTargetType={setFormTargetType}
            formTargetRole={formTargetRole}
            setFormTargetRole={setFormTargetRole}
            formTargetUserIds={formTargetUserIds}
            toggleUserInForm={toggleUserInForm}
            managedUsers={managedUsers}
          />
          <DialogFooter showCloseButton className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-white/20 text-zinc-300"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-500 text-white"
              onClick={handleUpdate}
              disabled={!formTitle.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="border-white/10 bg-zinc-900 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete notification</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-400">
            Are you sure you want to delete
            {deletingNotification ? (
              <span className="font-medium text-white"> “{deletingNotification.title}”</span>
            ) : (
              " this notification"
            )}{" "}
? This cannot be undone.
          </p>
          <DialogFooter showCloseButton className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-white/20 text-zinc-300"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-500 text-white"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NotificationForm({
  formTitle,
  setFormTitle,
  formMessage,
  setFormMessage,
  formTargetType,
  setFormTargetType,
  formTargetRole,
  setFormTargetRole,
  formTargetUserIds,
  toggleUserInForm,
  managedUsers,
}: {
  formTitle: string;
  setFormTitle: (v: string) => void;
  formMessage: string;
  setFormMessage: (v: string) => void;
  formTargetType: NotificationTargetType;
  setFormTargetType: (v: NotificationTargetType) => void;
  formTargetRole: string;
  setFormTargetRole: (v: string) => void;
  formTargetUserIds: string[];
  toggleUserInForm: (email: string) => void;
  managedUsers: { email: string; name: string }[];
}) {
  return (
    <div className="grid gap-4 py-2">
      <div className="grid gap-2">
        <Label htmlFor="notif-title" className="text-zinc-300">
          Title <span className="text-red-400" aria-hidden="true">*</span>
        </Label>
        <Input
          id="notif-title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Notification title"
          required
          aria-required="true"
          className="h-9 border-white/20 bg-zinc-800 text-white placeholder:text-zinc-500"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notif-message" className="text-zinc-300">
          Message
        </Label>
        <Textarea
          id="notif-message"
          value={formMessage}
          onChange={(e) => setFormMessage(e.target.value)}
          placeholder="Notification message"
          rows={3}
          className="border-white/20 bg-zinc-800 text-white placeholder:text-zinc-500"
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-zinc-300">Target</Label>
        <div className="flex flex-wrap gap-3">
          {TARGET_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors",
                formTargetType === opt.value
                  ? "border-sky-500/50 bg-sky-500/10 text-sky-200"
                  : "border-white/20 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800"
              )}
            >
              <input
                type="radio"
                name="targetType"
                value={opt.value}
                checked={formTargetType === opt.value}
                onChange={() => setFormTargetType(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>
      {formTargetType === "role" && (
        <div className="grid gap-2">
          <Label htmlFor="notif-role" className="text-zinc-300">
            Role
          </Label>
          <select
            id="notif-role"
            value={formTargetRole}
            onChange={(e) => setFormTargetRole(e.target.value)}
            className="h-9 w-full rounded-lg border border-white/20 bg-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value={ROLES.USER}>{ROLES.USER}</option>
            <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
          </select>
        </div>
      )}
      {formTargetType === "users" && (
        <div className="grid gap-2">
          <Label className="text-zinc-300">Select users</Label>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-white/20 bg-zinc-800/50 p-2 space-y-2">
            {managedUsers.length === 0 ? (
              <p className="text-sm text-zinc-500">No users in system yet.</p>
            ) : (
              managedUsers.map((u) => (
                <label
                  key={u.email}
                  className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm text-zinc-300 hover:bg-white/5"
                >
                  <Checkbox
                    checked={formTargetUserIds.includes(u.email)}
                    onCheckedChange={() => toggleUserInForm(u.email)}
                  />
                  <span className="truncate">{u.name}</span>
                  <span className="text-zinc-500 truncate">({u.email})</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
