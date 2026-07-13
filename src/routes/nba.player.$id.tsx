import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNbaAthlete } from "@/lib/nba.functions";
import { athlete, breadcrumbList, ldScript } from "@/lib/seo/jsonld";

export const Route = createFileRoute("/nba/player/$id")({
  loader: async ({ context, params }) => {
    return await context.queryClient
      .ensureQueryData({
        queryKey: ["nba", "athlete", params.id],
        queryFn: () => getNbaAthlete({ data: { id: params.id } }),
        staleTime: 60 * 60_000,
      })
      .catch(() => null);
  },
  head: ({ params, loaderData }) => {
    const url = `https://www.playsports.online/nba/player/${params.id}`;
    const a = (loaderData as { athlete?: { name?: string; headshot?: string | null; team?: { name?: string } | null; position?: string | null } } | null)?.athlete ?? null;
    const name = a?.name ?? `NBA Player ${params.id}`;
    const teamPart = a?.team?.name ? ` — ${a.team.name}` : "";
    const title = a ? `${name}${teamPart} — NBA Career Stats & Bio` : `NBA Player ${params.id} — Bio & Career Stats`;
    const desc = a
      ? `${name}${a.position ? ` (${a.position})` : ""}${teamPart} — biography and full career averages on PlaySports.`
      : "Player biography and full career averages.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:url", content: url },
        ...(a?.headshot ? [{ property: "og:image", content: a.headshot }] : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        ldScript(athlete({ name, path: `/nba/player/${params.id}`, sport: "Basketball", image: a?.headshot ?? undefined, team: a?.team?.name ?? undefined })),
        ldScript(breadcrumbList([
          { name: "Home", path: "/" }, { name: "NBA", path: "/nba" }, { name: "Players", path: "/nba/leaders" }, { name, path: `/nba/player/${params.id}` },
        ])),
      ],
    };
  },
  component: NbaPlayer,
});

function NbaPlayer() {
  const { id } = Route.useParams();
  const fn = useServerFn(getNbaAthlete);
  const q = useQuery({ queryKey: ["nba", "athlete", id], queryFn: () => fn({ data: { id } }), staleTime: 60 * 60_000 });

  if (q.isLoading) return <div className="h-64 rounded-2xl ring-1 ring-border bg-card animate-pulse" />;
  const a = q.data?.athlete;
  if (!a) return <div className="text-sm text-muted-foreground">Player not found.</div>;
  const career = q.data?.career ?? { headers: [], rows: [] };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl ring-1 ring-border bg-card overflow-hidden p-5 sm:p-7 relative bg-gradient-to-br from-[#17408b]/30 via-transparent to-[#f58426]/20">
        <div className="flex items-center gap-4">
          {a.headshot && <img src={a.headshot} alt="" className="size-24 sm:size-32 rounded-2xl object-cover bg-muted"  decoding="async" loading="lazy" />}
          <div className="min-w-0 flex-1">
            <div className="text-[10px] uppercase tracking-[0.22em] text-orange-300 font-bold">{a.team?.name ?? "NBA Player"}</div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white truncate">{a.name}</h1>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
              {a.jersey && <span>#{a.jersey}</span>}
              {a.position && <span>{a.position}</span>}
              {a.height && <span>{a.height}</span>}
              {a.weight && <span>{a.weight}</span>}
              {a.age != null && <span>Age {a.age}</span>}
              {a.experience && <span>{a.experience}</span>}
              {a.college && <span>{a.college}</span>}
              {a.birthplace && <span>{a.birthplace}</span>}
            </div>
            {a.team && (
              <Link to="/nba/team/$id" params={{ id: a.team.id }} className="inline-flex items-center gap-2 mt-2 text-xs text-orange-300 hover:text-orange-200">
                {a.team.logo && <img src={a.team.logo} alt="" className="size-4 object-contain"  decoding="async" loading="lazy" />}
                View team →
              </Link>
            )}
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-extrabold text-white">Career stats</h2>
        {career.rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground bg-card/40">No career stats available.</div>
        ) : (
          <div className="rounded-2xl ring-1 ring-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b border-border">
                  <tr>
                    <th className="text-left py-2 pl-3 sticky left-0 bg-card z-10 min-w-[6rem]">Season</th>
                    <th className="text-left">Team</th>
                    {career.headers.map((h) => <th key={h} className="text-right px-2">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {career.rows.map((r, i) => (
                    <tr key={i} className="border-b border-border/40 hover:bg-white/[0.03]">
                      <td className="py-2 pl-3 sticky left-0 bg-card z-10 font-bold text-white">{r.season}</td>
                      <td className="text-muted-foreground">{r.team}</td>
                      {career.headers.map((h) => (
                        <td key={h} className="text-right px-2 tabular-nums text-gray-200">{r.stats[h] ?? "—"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
