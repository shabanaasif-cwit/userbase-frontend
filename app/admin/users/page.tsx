"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  getManagedUsers,
  setUserStatus,
  updateUserRole,
  type ManagedUser,
  ROLES,
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
import { Pencil, UserMinus, UserCheck, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ROWS_PER_PAGE_OPTIONS = [5, 10, 25, 50];
const ROLE_OPTIONS = [ROLES.USER, ROLES.ADMIN];
const STATUS_OPTIONS = ["active", "deactivated"] as const;

function refreshUsers(): ManagedUser[] {
  if (typeof window === "undefined") return [];
  return getManagedUsers();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editOpen, setEditOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "deactivated">("active");

  const loadUsers = useCallback(() => setUsers(refreshUsers()), []);

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
  };

  const handleSaveEdit = () => {
    if (!editingUser) return;
    if (editRole !== editingUser.role) {
      updateUserRole(editingUser.email, editRole);
    }
    if (editStatus !== editingUser.status) {
      setUserStatus(editingUser.email, editStatus);
    }
    loadUsers();
    closeEdit();
  };

  const handleToggleStatus = (user: ManagedUser) => {
    const next = user.status === "active" ? "deactivated" : "active";
    setUserStatus(user.email, next);
    loadUsers();
  };

  return (
    <div className="min-h-full bg-zinc-950 font-sans text-white">
      <main className="mx-auto w-full max-w-6xl px-6 py-20">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900 to-zinc-950 px-8 py-14">
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">
            Admin
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight">
            User management
          </h1>
          <p className="mt-4 text-lg text-zinc-300">
            View and manage user accounts: search, filter, edit roles and status.
          </p>
        </section>

        <Card className="mt-10 border-white/10 bg-white/5 text-white">
          <CardHeader>
            <CardTitle>Users</CardTitle>
            <CardDescription className="text-slate-300">
              {filtered.length} user(s) · Search and filter below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-8 bg-white/5 border-white/20 text-white placeholder:text-zinc-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setPage(1);
                }}
                className="h-8 rounded-lg border border-white/20 bg-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                className="h-8 rounded-lg border border-white/20 bg-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>

            <div className="rounded-lg border border-white/10 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-zinc-300">Username</TableHead>
                    <TableHead className="text-zinc-300">Email</TableHead>
                    <TableHead className="text-zinc-300">Role</TableHead>
                    <TableHead className="text-zinc-300">Status</TableHead>
                    <TableHead className="text-zinc-300 text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.length === 0 ? (
                    <TableRow className="border-white/10">
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-zinc-400"
                      >
                        No users match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginated.map((user) => (
                      <TableRow
                        key={user.email}
                        className="border-white/10 hover:bg-white/5"
                      >
                        <TableCell className="text-white font-medium">
                          {user.name || user.email}
                        </TableCell>
                        <TableCell className="text-zinc-300">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              user.role === ROLES.ADMIN
                                ? "bg-sky-500/20 text-sky-300"
                                : "bg-zinc-600/50 text-zinc-300"
                            )}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 text-xs font-medium",
                              user.status === "active"
                                ? "bg-emerald-500/20 text-emerald-300"
                                : "bg-red-500/20 text-red-300"
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
                              className="text-zinc-300 hover:text-white hover:bg-white/10"
                              onClick={() => openEdit(user)}
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className={cn(
                                user.status === "active"
                                  ? "text-amber-400 hover:text-amber-300 hover:bg-amber-500/10"
                                  : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                              )}
                              onClick={() => handleToggleStatus(user)}
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
                  className="h-8 rounded border border-white/20 bg-zinc-800 px-2 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  className="border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white"
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
                  className="border-white/20 text-zinc-300 hover:bg-white/10 hover:text-white"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="mt-10 text-center text-sm text-slate-500">
          <Link
            href="/admin/dashboard"
            className="text-sky-400 hover:underline"
          >
            ← Back to Admin Dashboard
          </Link>
        </p>
      </main>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="border-white/10 bg-zinc-900 text-white sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-2">
              <p className="text-sm text-zinc-400">
                {editingUser.name || editingUser.email} · {editingUser.email}
              </p>
              <div className="grid gap-2">
                <Label htmlFor="edit-role" className="text-zinc-300">
                  Role
                </Label>
                <select
                  id="edit-role"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="h-9 w-full rounded-lg border border-white/20 bg-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status" className="text-zinc-300">
                  Account status
                </Label>
                <select
                  id="edit-status"
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as "active" | "deactivated")
                  }
                  className="h-9 w-full rounded-lg border border-white/20 bg-zinc-800 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="border-white/20 text-zinc-300"
              onClick={closeEdit}
            >
              Cancel
            </Button>
            <Button
              className="bg-sky-600 hover:bg-sky-500 text-white"
              onClick={handleSaveEdit}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
