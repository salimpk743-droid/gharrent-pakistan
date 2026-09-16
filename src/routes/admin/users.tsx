import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminListUsers, adminSetUserStatus } from "@/lib/server/admin";
import { getMyProfile } from "@/lib/server/profile";
import { canModerate } from "@/lib/authz";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — GharRent admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const { user, isPending } = useCurrentUserState();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminListUsers>>>([]);

  useEffect(() => {
    if (!user) return;
    void getMyProfile()
      .then((p) => {
        if (!canModerate({ userId: p.userId, role: p.role, status: p.status })) setDenied(true);
        else return adminListUsers().then(setRows);
      })
      .catch(() => setDenied(true));
  }, [user]);

  if (isPending) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" search={{ next: "/admin/users" }} />;
  if (denied) return <p className="py-20 text-center">Admin access required.</p>;

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-10">
      <h1 className="font-display text-3xl">Users</h1>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase text-muted">
              <th className="py-2">Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Listings</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.user_id} className="border-b border-line">
                <td className="py-3">{r.display_name}</td>
                <td>{r.email}</td>
                <td>{r.role}</td>
                <td>{r.status}</td>
                <td>{r.listings}</td>
                <td>
                  {r.status === "ACTIVE" ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void adminSetUserStatus({ data: { userId: r.user_id, status: "SUSPENDED" } }).then((res) => {
                          if (!res.ok) toast.error(res.error);
                          else void adminListUsers().then(setRows);
                        })
                      }
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        void adminSetUserStatus({ data: { userId: r.user_id, status: "ACTIVE" } }).then(() =>
                          adminListUsers().then(setRows),
                        )
                      }
                    >
                      Restore
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
