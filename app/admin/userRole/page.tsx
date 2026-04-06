import { redirect } from "next/navigation";

/** Alias route: user management lives at `/admin/users`. */
export default function AdminUserRoleRedirectPage() {
  redirect("/admin/users");
}
