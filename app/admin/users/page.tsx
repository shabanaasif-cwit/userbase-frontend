"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  fetchUsersFromAPI,
  updateUserRoleAPI,
  updateUserStatusAPI,
  type ManagedUser,
  ROLES,
  useAuth,
} from "@/lib/auth-context";
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, UserMinus, UserCheck, Search, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const ROLE_OPTIONS = [ROLES.USER, ROLES.ADMIN];
const STATUS_OPTIONS = ["active", "deactivated"] as const;

export default function AdminUsersPage() {
  const { accessToken } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [listError, setListError] = useState("");
  const [actionError, setActionError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "deactivated">("active");
  const [savingEdit, setSavingEdit] = useState(false);
  const [statusUpdatingEmail, setStatusUpdatingEmail] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setListError("");
    const res = await fetchUsersFromAPI(accessToken);
    if (res.success && res.data) {
      setUsers(res.data);
    } else {
      setUsers([]);
      setListError(res.error ?? "Failed to load users");
    }
  }, [accessToken]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = useMemo(() => {
    let list = [...users];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (u) =>
          u.email.toLowerCase().includes(q) ||
          (u.name && u.name.toLowerCase().includes(q))
      );
    }
    if (roleFilter !== "all") {
      list = list.filter((u) => u.role.toLowerCase() === roleFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter((u) => u.status === statusFilter);
    }
    return list;
  }, [users, search, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paginated = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page, rowsPerPage]);

  const openEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setEditRole(user.role);
    setEditStatus(user.status);
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditingUser(null);
    setEditRole("");
    setEditStatus("active");
    setSavingEdit(false);
  };

  const handleSaveEdit = async () => {
    if (!editingUser || savingEdit) return;
    const userIdentifier = editingUser.id || editingUser.email;
    setActionError("");
    setSavingEdit(true);
    try {
      if (editRole !== editingUser.role) {
        const r = await updateUserRoleAPI(
          accessToken,
          userIdentifier,
          editRole
        );
        if (!r.success) {
          setActionError(r.error ?? "Role update failed");
          return;
        }
      }

      if (editStatus !== editingUser.status) {
        const s = await updateUserStatusAPI(
          accessToken,
          userIdentifier,
          editStatus
        );
        if (!s.success) {
          setActionError(s.error ?? "Status update failed");
          return;
        }
      }
      await loadUsers();
      closeEdit();
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (u: ManagedUser) => {
    if (statusUpdatingEmail === u.email) return;
    const userIdentifier = u.id || u.email;
    setActionError("");
    const next = u.status === "active" ? "deactivated" : "active";
    setStatusUpdatingEmail(u.email);
    try {
      const s = await updateUserStatusAPI(accessToken, userIdentifier, next);
      if (!s.success) {
        setActionError(s.error ?? "Status update failed");
        return;
      }
      await loadUsers();
    } finally {
      setStatusUpdatingEmail(null);
    }
  };

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-zinc-950 via-zinc-950/98 to-zinc-900" />
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(16,185,129,0.06),transparent)]" />

      <main className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/80 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-sky-500/10 blur-3xl" />
          <div className="relative flex items-start gap-5 px-6 py-10 sm:px-8 sm:py-12">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 text-emerald-400 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20">
              <Users className="h-7 w-7" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Admin
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                User Management
              </h1>
              <p className="mt-2 max-w-lg text-sm text-zinc-400">
                View and manage user accounts: search, filter, edit roles and status.
              </p>
            </div>
          </div>
        </section>

        <Card className="mt-10 overflow-hidden border-white/[0.08] bg-zinc-900/60 shadow-xl shadow-black/20 backdrop-blur-sm">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-sky-400" />
          <CardHeader className="border-b border-white/[0.06] bg-white/[0.02] px-6 py-5 sm:px-8">
            <CardTitle className="text-lg font-semibold text-white">
              Users
            </CardTitle>
            <CardDescription className="text-sm text-zinc-500">
              {filtered.length} user{filtered.length !== 1 ? "s" : ""} · Search and filter below.
            </CardDescription>
            {(listError || actionError) && (
              <p className="text-sm text-red-400">
                {actionError || listError}
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4 p-4 sm:p-6">
            {/* Search and filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-0 flex-1 basis-full sm:basis-auto">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9 border-white/20 bg-zinc-800/80 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-400"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-white/20 bg-zinc-800/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                <option value="all">All roles</option>
                <option value={ROLES.USER}>User</option>
                <option value={ROLES.ADMIN}>Admin</option>
              </select>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 rounded-lg border border-white/20 bg-zinc-800/80 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            <div className="overflow-x-auto rounded-xl border border-white/[0.06]">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-white/[0.06] bg-emerald-500/10 hover:bg-emerald-500/10">
                    <TableHead className="font-semibold text-zinc-200">Username</TableHead>
                    <TableHead className="font-semibold text-zinc-200">Email</TableHead>
                    <TableHead className="font-semibold text-zinc-200">Role</TableHead>
                    <TableHead className="font-semibold text-zinc-200">Status</TableHead>
                    <TableHead className="text-right font-semibold text-zinc-200">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow className="border-white/[0.06]">
                      <TableCell
                        colSpan={5}
                        className="py-12 text-center text-zinc-500"
                      >
                        No users match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((user) => (
                      <TableRow
                        key={user.email}
                        className="border-white/[0.06] transition-colors hover:bg-emerald-500/5"
                      >
                        <TableCell className="font-medium text-white">
                          {user.name || user.email}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                              user.role === ROLES.ADMIN
                                ? "bg-sky-500/20 text-sky-300 ring-sky-500/30"
                                : "bg-zinc-600/50 text-zinc-300 ring-white/10"
                            )}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset",
                              user.status === "active"
                                ? "bg-emerald-500/20 text-emerald-300 ring-emerald-500/30"
                                : "bg-red-500/20 text-red-300 ring-red-500/30"
                            )}
                          >
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="cursor-pointer text-sky-400 hover:bg-sky-500/15 hover:text-sky-300"
                              onClick={() => openEdit(user)}
                              title={`Edit ${user.email}`}
                              aria-label={`Edit ${user.email}`}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={statusUpdatingEmail === user.email}
                              className={cn(
                                user.status === "active"
                                  ? "cursor-pointer text-amber-400 hover:bg-amber-500/15 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
                                  : "cursor-pointer text-emerald-400 hover:bg-emerald-500/15 hover:text-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
                              )}
                              onClick={() => handleToggleStatus(user)}
                              title={
                                user.status === "active"
                                  ? `Deactivate ${user.email}`
                                  : `Activate ${user.email}`
                              }
                              aria-label={
                                user.status === "active"
                                  ? `Deactivate ${user.email}`
                                  : `Activate ${user.email}`
                              }
                            >
                              {user.status === "active" ? (
                                <>
                                  <UserMinus className="h-4 w-4" />
                                  <span className="sr-only">Deactivate</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4" />
                                  <span className="sr-only">Activate</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span>Rows per page</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="h-9 rounded-lg border border-white/20 bg-zinc-800/80 px-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span>
                  {(page - 1) * rowsPerPage + 1}–
                  {Math.min(page * rowsPerPage, filtered.length)} of{" "}
                  {filtered.length}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-zinc-300 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-200"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-3 text-sm text-zinc-400">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-white/20 text-zinc-300 hover:bg-emerald-500/15 hover:border-emerald-500/40 hover:text-emerald-200"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
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

      {/* Edit dialog */}
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (open) {
            setEditOpen(true);
            return;
          }
          closeEdit();
        }}
      >
        <DialogContent className="overflow-hidden border-emerald-500/30 bg-zinc-900 text-white shadow-2xl shadow-emerald-500/10 sm:max-w-sm">
          <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-emerald-400" />
          <DialogHeader>
            <DialogTitle className="text-white">Edit user</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-2">
              <p className="text-sm text-zinc-400">
                {editingUser.name || editingUser.email} · {editingUser.email}
              </p>
              <div className="grid gap-2">
                <Label htmlFor="edit-role" className="text-zinc-200">
                  Role
                </Label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="h-9 w-full rounded-lg border border-white/20 bg-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status" className="text-zinc-200">
                  Account status
                </Label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as "active" | "deactivated")
                  }
                  className="h-9 w-full rounded-lg border border-white/20 bg-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-zinc-900"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          <DialogFooter showCloseButton className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="cursor-pointer border-white/20 text-zinc-300 hover:bg-white/10"
              onClick={closeEdit}
            >
              Cancel
            </Button>
            <Button
              className="cursor-pointer bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
              onClick={handleSaveEdit}
              disabled={savingEdit}
            >
              {savingEdit ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
