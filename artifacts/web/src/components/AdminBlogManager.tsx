import { useCallback, useEffect, useState } from "react";
import { Bot, CheckCircle2, Clock3, FileText, PauseCircle, PlayCircle, RefreshCw, XCircle } from "lucide-react";

type Article = { id: number; title: string; topic: string; status: string; createdAt: string; publishedAt: string | null };
type Log = { id: number; status: string; topic: string; errorMessage: string | null; createdAt: string };
type BlogAdminData = {
  articles: Article[];
  settings: { autoPublish: boolean };
  nextTopic: string;
  logs: Log[];
};

function adminHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function AdminBlogManager({ token }: { token: string }) {
  const [data, setData] = useState<BlogAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/blog", { headers: adminHeaders(token) });
      if (!response.ok) throw new Error();
      setData(await response.json() as BlogAdminData);
    } catch {
      setMessage("Unable to load blog controls.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  async function perform(url: string, method = "POST", body?: object) {
    setWorking(true);
    setMessage("");
    try {
      const response = await fetch(url, { method, headers: adminHeaders(token), body: body ? JSON.stringify(body) : undefined });
      if (!response.ok) {
        const result = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(result?.error ?? "The action did not complete.");
      }
      await load();
      setMessage("Saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "The action did not complete.");
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <div className="rounded-2xl bg-white border border-border p-8 text-sm text-muted-foreground">Loading blog controls…</div>;
  if (!data) return <div className="rounded-2xl bg-red-50 border border-red-200 p-6 text-red-800">Unable to load the content controls.</div>;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-[1fr_auto] gap-5 rounded-2xl border border-border bg-white p-6">
        <div>
          <div className="flex items-center gap-2 text-primary"><Bot className="w-5 h-5" /><span className="font-bold">Daily health article automation</span></div>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Next approved topic: <strong className="text-foreground">{data.nextTopic}</strong></p>
          <p className="mt-1 text-xs text-muted-foreground">Articles publish automatically only while automation is enabled. Failed runs are recorded below and will retry on the next check.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button disabled={working} onClick={() => perform("/api/admin/blog/settings", "PUT", { autoPublish: !data.settings.autoPublish })} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60 ${data.settings.autoPublish ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-muted text-foreground hover:bg-muted/70"}`}>
            {data.settings.autoPublish ? <><PauseCircle className="w-4 h-4" /> Pause automation</> : <><PlayCircle className="w-4 h-4" /> Resume automation</>}
          </button>
          <button disabled={working} onClick={() => perform("/api/admin/blog/generate")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60">
            <RefreshCw className={`w-4 h-4 ${working ? "animate-spin" : ""}`} /> Generate today’s draft
          </button>
        </div>
      </div>

      {message && <p className={`rounded-xl px-4 py-3 text-sm ${message === "Saved." ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>{message}</p>}
      <div className="grid lg:grid-cols-[1fr_0.7fr] gap-6">
        <section className="rounded-2xl border border-border bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between"><h2 className="font-bold text-foreground">Published & upcoming articles</h2><span className="text-xs text-muted-foreground">{data.articles.length} saved</span></div>
          <div className="divide-y divide-border">
            {data.articles.length === 0 && <div className="p-6 text-sm text-muted-foreground">No articles have been generated yet.</div>}
            {data.articles.map((article) => (
              <div key={article.id} className="p-5 flex gap-3 justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs"><span className={`rounded-full px-2 py-0.5 font-semibold ${article.status === "published" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>{article.status}</span><span className="text-muted-foreground">{article.topic}</span></div>
                  <h3 className="mt-2 font-semibold text-sm text-foreground">{article.title}</h3>
                </div>
                <button disabled={working} onClick={() => perform(`/api/admin/blog/${article.id}/${article.status === "published" ? "unpublish" : "publish"}`)} className="shrink-0 text-xs font-semibold text-primary hover:underline disabled:opacity-50">
                  {article.status === "published" ? "Unpublish" : "Publish"}
                </button>
              </div>
            ))}
          </div>
        </section>
        <aside className="rounded-2xl border border-border bg-white p-6">
          <h2 className="font-bold text-foreground">Generation activity</h2>
          <div className="mt-4 space-y-4">
            {data.logs.length === 0 && <p className="text-sm text-muted-foreground">No generation attempts yet.</p>}
            {data.logs.map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                {log.status === "success" ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />}
                <div><p className="font-medium text-foreground">{log.status === "success" ? "Article generated" : "Generation needs retry"}</p><p className="text-xs text-muted-foreground mt-0.5">{log.topic}</p>{log.errorMessage && <p className="text-xs text-red-700 mt-1">{log.errorMessage}</p>}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground"><Clock3 className="w-4 h-4" /> Checks run hourly and publish at most one article per India calendar day.</div>
        </aside>
      </div>
    </div>
  );
}