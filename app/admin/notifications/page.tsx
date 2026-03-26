"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  getNotifications,
  addNotification,
  updateNotification,
  deleteNotification,
  sendReminder,
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
  BellRing,
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

  const handleReminder = (id: string) => {
    sendReminder(id);
    load();
  };

  const toggleUserInForm = (email: string) => {
    setFormTargetUserIds((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  const deletingNotification = notifications.find((n) => n.id === deletingId);

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-950/98 to-zinc-900" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(56,189,248,0.06),transparent)]" />

      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="relative flex items-start gap-5 px-6 py-10 sm:px-8 sm:py-12">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/25 to-sky-600/15 text-sky-400 shadow-lg shadow-sky-500/10 ring-1 ring-sky-500/20">
              <Bell className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-400">
                Admin
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Manage Notifications
              </h1>
              <p className="mt-2 max-w-lg text-sm text-zinc-400">
                Create, edit, and delete notifications. Target all users, by role, or
                specific users (frontend-only; data stored in localStorage until
                backend is available).
              </p>
            </div>
          </div>
        </section>

        <Card className="mt-10 overflow-hidden border-white/[0.08] bg-zinc-900/60 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 via-sky-400 to-indigo-400" />
          <CardHeader className="flex flex-col gap-4 border-b border-white/[0.06] bg-white/[0.02] px-4 pb-4 pt-5 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 sm:px-8">
            <div>
              <CardTitle className="text-lg font-semibold text-white">
                Notifications
              </CardTitle>
              <CardDescription className="text-sm text-zinc-500">
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </CardDescription>
            </div>
            <Button
              onClick={openCreate}
              className="w-full shrink-0 cursor-pointer sm:w-auto bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-lg shadow-sky-500/25 hover:from-sky-500 hover:to-sky-400"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create notification
            </Button>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {notifications.length === 0 ? (
              <div className="rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
                <p className="text-sm font-medium text-zinc-400">
                  No notifications yet. Create one to get started.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
                <Table className="min-w-[640px]">
                  <TableHeader>
                    <TableRow className="border-white/[0.06] bg-sky-500/10 hover:bg-sky-500/10">
                      <TableHead className="font-semibold text-zinc-200">Title</TableHead>
                      <TableHead className="max-w-[200px] font-semibold text-zinc-200">Message</TableHead>
                      <TableHead className="font-semibold text-zinc-200">Target</TableHead>
                      <TableHead className="font-semibold text-zinc-200">Created</TableHead>
                      <TableHead className="text-right font-semibold text-zinc-200">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications.map((n) => (
                      <TableRow
                        key={n.id}
                        className="border-white/[0.06] transition-colors hover:bg-sky-500/5"
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
                        <TableCell className="text-sm text-zinc-500">
                          {formatDate(n.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer text-sky-400 hover:bg-sky-500/15 hover:text-sky-300"
                              onClick={() => openEdit(n)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer text-amber-400 hover:bg-amber-500/15 hover:text-amber-300"
                              onClick={() => handleReminder(n.id)}
                            >
                              <BellRing className="h-4 w-4" />
                              <span className="sr-only">Send reminder</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer text-red-400 hover:bg-red-500/15 hover:text-red-300"
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

        <p className="mt-10 flex justify-center">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-zinc-400 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            ← Back to Admin Dashboard
          </Link>
        </p>
      </main>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="overflow-hidden border-sky-500/30 bg-zinc-900 text-white shadow-2xl shadow-sky-500/10 sm:max-w-md">
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-sky-400" />
          <DialogHeader>
            <DialogTitle className="text-white">Create notification</DialogTitle>
          </DialogHeader>image.png i want 
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
              className="border-white/20 text-zinc-300 hover:bg-white/10"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:from-sky-500 hover:to-sky-400"
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
        <DialogContent className="overflow-hidden border-sky-500/30 bg-zinc-900 text-white shadow-2xl shadow-sky-500/10 sm:max-w-md">
          <div className="h-1 w-full bg-gradient-to-r from-sky-500 to-sky-400" />
          <DialogHeader>
            <DialogTitle className="text-white">Edit notification</DialogTitle>
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
              className="border-white/20 text-zinc-300 hover:bg-white/10"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-sky-600 to-sky-500 text-white hover:from-sky-500 hover:to-sky-400"
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
        <DialogContent className="overflow-hidden border-red-500/30 bg-zinc-900 text-white shadow-2xl shadow-red-500/10 sm:max-w-sm">
          <div className="h-1 w-full bg-gradient-to-r from-red-500 to-red-400" />
          <DialogHeader>
            <DialogTitle className="text-white">Delete notification</DialogTitle>
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
              className="border-white/20 text-zinc-300 hover:bg-white/10"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400"
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
        <Label htmlFor="notif-title" className="text-zinc-200">
          Title <span className="text-red-400" aria-hidden="true">*</span>
        </Label>
        <Input
          id="notif-title"
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
          placeholder="Notification title"
          required
          aria-required="true"
          className="h-9 border-white/20 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-sky-400"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="notif-message" className="text-zinc-200">
          Message
        </Label>
        <Textarea
          id="notif-message"
          value={formMessage}
          onChange={(e) => setFormMessage(e.target.value)}
          placeholder="Notification message"
          rows={3}
          className="border-white/20 bg-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-sky-400"
        />
      </div>
      <div className="grid gap-2">
        <Label className="text-zinc-200">Target</Label>
        <div className="flex flex-wrap gap-3">
          {TARGET_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all",
                formTargetType === opt.value
                  ? "border-sky-400/60 bg-sky-500/20 text-sky-100 shadow-inner ring-1 ring-sky-400/30"
                  : "border-white/15 bg-zinc-800/80 text-zinc-400 hover:border-white/25 hover:bg-zinc-800 hover:text-zinc-300"
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
          <Label htmlFor="notif-role" className="text-zinc-200">
            Role
          </Label>
          <select
            id="notif-role"
            value={formTargetRole}
            onChange={(e) => setFormTargetRole(e.target.value)}
            className="h-9 w-full rounded-lg border border-white/20 bg-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            <option value={ROLES.USER}>{ROLES.USER}</option>
            <option value={ROLES.ADMIN}>{ROLES.ADMIN}</option>
          </select>
        </div>
      )}
      {formTargetType === "users" && (
        <div className="grid gap-2">
          <Label className="text-zinc-200">Select users</Label>
          <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-white/20 bg-zinc-800/50 p-2">
            {managedUsers.length === 0 ? (
              <p className="py-2 text-sm text-zinc-500">No users in system yet.</p>
            ) : (
              managedUsers.map((u) => (
                <label
                  key={u.email}
                  className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-sky-500/10 hover:text-zinc-100"
                >
                  <Checkbox
                    checked={formTargetUserIds.includes(u.email)}
                    onCheckedChange={() => toggleUserInForm(u.email)}
                  />
                  <span className="truncate">{u.name}</span>
                  <span className="truncate text-zinc-500">({u.email})</span>
                </label>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
