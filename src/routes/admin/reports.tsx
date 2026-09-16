import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { adminListReports, adminResolveReport } from "@/lib/server/admin";
import { getMyProfile } from "@/lib/server/profile";
import { canModerate } from "@/lib/authz";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { REPORT_REASONS } from "@/lib/constants";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — GharRent admin" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminReports,
});

function AdminReports() {
  const { user, isPending } = useCurrentUserState();
  const [denied, setDenied] = useState(false);
  const [rows, setRows] = useState<Awaited<ReturnType<typeof adminListReports>>>([]);

  useEffect(() => {
    if (!user) return;
    void getMyProfile()
      .then((p) => {
        if (!canModerate({ userId: p.userId, role: p.role, status: p.status })) setDenied(true);
        else return adminListReports().then(setRows);
      })
      .catch(() => setDenied(true));
  }, [user]);

  if (isPending) return <div className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>;
  if (!user) return <Navigate to="/login" search={{ next: "/admin/reports" }} />;
  if (denied) return <p className="py-20 text-center">Admin access required.</p>;

  return (
    <main className="mx-auto w-[min(1120px,calc(100%-32px))] py-10">
      <h1 className="font-display text-3xl">Reports</h1>
      <div className="mt-6 grid gap-3">
        {rows.map((r) => (
          <article key={r.id} className="rounded-xl border border-line p-4">
            <p className="text-xs uppercase text-muted">
              {r.status} · {formatDate(r.created_at)} ·{" "}
              {REPORT_REASONS.find((x) => x.id === r.reason)?.label || r.reason}
            </p>
            <h2 className="mt-1 font-semibold">{r.property_title}</h2>
            {r.details && <p className="mt-1 text-sm text-muted">{r.details}</p>}
            <div className="mt-3 flex flex-wrap gap-2">
              {r.property_slug && (
                <Button asChild size="sm" variant="outline">
                  <Link to="/property/$slug" params={{ slug: r.property_slug }}>
                    Review property
                  </Link>
                </Button>
              )}
              {r.status === "OPEN" && (
                <>
                  <Button
                    size="sm"
                    onClick={() => void adminResolveReport({ data: { reportId: r.id, status: "RESOLVED" } }).then(() => adminListReports().then(setRows))}
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void adminResolveReport({ data: { reportId: r.id, status: "DISMISSED" } }).then(() => adminListReports().then(setRows))}
                  >
                    Dismiss
                  </Button>
                </>
              )}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
