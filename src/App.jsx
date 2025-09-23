// src/App.jsx
import { Routes, Route, Navigate, Link, useNavigate, useParams, useLocation, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "./useAuth";

// ✅ use the local vendored API client
import api from "./shared/api/index.js";
const { articles, categories, settings } = api;

// styles (site-like theming + header)
import "./styles/admin-theme.css";
import "./styles/header.css";
import "./styles/site-header.css";

import SiteLikeHeader from "./components/SiteLikeHeader.jsx";
import NavbarSettings from "./components/NavbarSettings.jsx";
import FeaturedSettings from "./components/FeaturedSettings.jsx";
import ArticleBlockLightSettings from "./components/ArticleBlockLightSettings.jsx";
import WorldSettings from "./components/WorldSettings.jsx";
import ArticleBlockDarkSettings from "./components/ArticleBlockDarkSettings.jsx";
import FeatureEssaySettings from "./components/FeatureEssaySettings.jsx";
import SectionTriColumnSettings from "./components/SectionTriColumnSettings.jsx";
import NewsSplitSettings from "./components/NewsSplitSettings.jsx";
import BreakingSettings from "./components/BreakingSettings.jsx";

/* ---------------- Guards ---------------- */
function Protected({ user, children }) {
  if (user === undefined) return null; // loading
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <div style={{ padding: 24 }}>Forbidden</div>;
  return children;
}

/* ---------------- Auth: Login ---------------- */
function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@local");
  const [password, setPassword] = useState("changeme");
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(email, password);
      nav("/");
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "80px auto" }}>
      <h1>Admin Login</h1>
      <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" />
        {err && <div style={{ color: "tomato" }}>{err}</div>}
        <button disabled={busy}>{busy ? "…" : "Login"}</button>
      </form>
    </div>
  );
}

/* ---------------- App Shell w/ Site-like Header ---------------- */
function Shell({ children, onLogout, user }) {
  const [config, setConfig] = useState(null);
  const [loadingCfg, setLoadingCfg] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // tries to fetch setting; falls back to defaults if missing
        const cfg = await settings.get("navbar"); // GET /api/settings/navbar
        if (mounted) setConfig(cfg);
      } catch {
        if (mounted) {
          setConfig({
            siteName: "THE TIMELY VOICE",
            nav: [
              { key: "top", label: "TOP NEWS", to: "/articles" },
              { key: "india", label: "INDIA", to: "/articles?section=india" },
              { key: "world", label: "WORLD", to: "/articles?section=world" },
              { key: "finance", label: "FINANCE", to: "/articles?section=finance" },
            ],
            languages: ["ENGLISH"],
            ctas: [],
            liveText: "LIVE",
            liveTicker: "",
          });
        }
      } finally {
        if (mounted) setLoadingCfg(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--tv-bg)" }}>
      <SiteLikeHeader user={user} onLogout={onLogout} config={config} loading={loadingCfg} />
      <main className="tv-container" style={{ padding: "20px 0 40px" }}>
        {children}
      </main>
      <footer
        className="tv-container"
        style={{ padding: "16px 0", borderTop: "1px solid var(--tv-border)", color: "var(--tv-text-muted)", fontSize: 12 }}
      >
        © {new Date().getFullYear()} The Timely Voice — Admin
      </footer>
    </div>
  );
}

/* ---------------- Articles: List ---------------- */
function ArticlesList() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState(null);

  const [params] = useSearchParams();
  const loc = useLocation();

  const raw = useMemo(() => {
    const q = params.get("q")?.trim() || "";
    const section = params.get("section")?.trim() || "";
    const status = params.get("status")?.trim() || "";
    const lang = params.get("lang")?.trim() || "";
    const tag = params.get("tag")?.trim() || "";
    return { q, section, status, lang, tag };
  }, [params]);

  const listParams = useMemo(() => {
    const out = { limit: 50, offset: 0 };
    const mergedQ = [raw.q, raw.tag].filter(Boolean).join(" ").trim();
    if (mergedQ) out.q = mergedQ;
    if (raw.section) out.category = raw.section;
    if (raw.status) out.status = raw.status;
    if (raw.lang) out.lang = raw.lang;
    return out;
  }, [raw]);

  useEffect(() => {
    (async () => {
      setBusy(true);
      setErr(null);
      try {
        const res = await articles.list(listParams);
        setRows(res.items || []);
      } catch (e) {
        setErr(e.message);
      } finally {
        setBusy(false);
      }
    })();
  }, [listParams, loc.key]);

  const hasAnyFilter = !!(listParams.q || listParams.category || listParams.status || listParams.lang);

  if (busy) return <div>Loading…</div>;
  if (err) return <div style={{ color: "tomato" }}>{err}</div>;

  return (
    <div style={{ background: "var(--tv-bg)", border: "1px solid var(--tv-border)", borderRadius: 12, overflow: "hidden" }}>
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid var(--tv-border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ margin: 0 }}>Articles</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {hasAnyFilter && (
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {listParams.category && <span className="tv-badge">section: {listParams.category}</span>}
              {listParams.status && <span className="tv-badge">status: {listParams.status}</span>}
              {listParams.lang && <span className="tv-badge">lang: {listParams.lang}</span>}
              {listParams.q && <span className="tv-badge">q: {listParams.q}</span>}
            </div>
          )}
          <Link to="/articles/new" className="tv-btn primary">
            New Article
          </Link>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--tv-border)", background: "var(--tv-bg-soft)" }}>
              <th align="left">Title</th>
              <th align="left">Slug</th>
              <th align="left">Status</th>
              <th align="left">Category</th>
              <th align="left">Updated</th>
              <th align="left"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} style={{ borderBottom: "1px solid var(--tv-border)" }}>
                <td>{r.title}</td>
                <td>{r.slug}</td>
                <td>
                  <span
                    className="tv-badge"
                    style={{
                      background: r.status === "published" ? "#E6F7ED" : "#FFF4E5",
                      color: r.status === "published" ? "#114B2E" : "#6A3B00",
                    }}
                  >
                    {r.status}
                  </span>
                </td>
                <td>{r.category?.name || "—"}</td>
                <td>{r.updatedAt ? new Date(r.updatedAt).toLocaleString() : "—"}</td>
                <td>
                  <Link to={`/articles/${encodeURIComponent(r.slug)}`} className="tv-btn">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan="6" style={{ opacity: 0.7, padding: 16 }}>
                  No articles
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- Articles: Editor ---------------- */
const empty = {
  title: "",
  slug: "",
  status: "draft",
  summary: "",
  body: "",
  categoryId: null,
  heroImageUrl: "",
  thumbnailUrl: "",
  tagsCsv: "",
  language: "en",
  source: "The Timely Voice",
  author: "Staff",
};

function ArticleEdit() {
  const { slug } = useParams();
  const isNew = slug === "new";
  const [form, setForm] = useState(empty);
  const [cats, setCats] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

  useEffect(() => {
    categories.list().then((r) => setCats(r.items || []));
  }, []);

  useEffect(() => {
    if (isNew) return;
    (async () => {
      try {
        const r = await articles.get(slug);
        setForm({ ...empty, ...r, categoryId: r.categoryId ?? r.category?.id ?? null });
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [slug, isNew]);

  const up = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      if (isNew) {
        await articles.create(form);
        history.back();
      } else {
        await articles.update(form.id, form);
        history.back();
      }
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!confirm("Delete this article?")) return;
    setBusy(true);
    try {
      await articles.remove(form.id);
      history.back();
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 12, maxWidth: 960 }}>
      <h3>{isNew ? "New Article" : `Edit ${form.title || `#${slug}`}`}</h3>
      {err && <div style={{ color: "tomato" }}>{err}</div>}

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <label>
          Title <input value={form.title} onChange={(e) => up("title", e.target.value)} required />
        </label>
        <label>
          Slug <input value={form.slug} onChange={(e) => up("slug", e.target.value)} required />
        </label>
      </div>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
        <label>
          Status
          <select value={form.status} onChange={(e) => up("status", e.target.value)}>
            <option>draft</option>
            <option>published</option>
          </select>
        </label>

        <label>
          Category
          <select
            value={form.categoryId ?? ""}
            onChange={(e) => up("categoryId", e.target.value ? Number(e.target.value) : null)}
          >
            <option value="">—</option>
            {cats.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Language
          <input value={form.language} onChange={(e) => up("language", e.target.value)} />
        </label>
      </div>

      <label>
        Hero Image URL <input value={form.heroImageUrl} onChange={(e) => up("heroImageUrl", e.target.value)} />
      </label>
      <label>
        Thumbnail URL <input value={form.thumbnailUrl} onChange={(e) => up("thumbnailUrl", e.target.value)} />
      </label>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <label>
          Tags (CSV) <input value={form.tagsCsv} onChange={(e) => up("tagsCsv", e.target.value)} />
        </label>
        <label>
          Source <input value={form.source} onChange={(e) => up("source", e.target.value)} />
        </label>
      </div>

      <label>
        Author <input value={form.author} onChange={(e) => up("author", e.target.value)} />
      </label>

      <label>
        Summary <textarea rows="3" value={form.summary} onChange={(e) => up("summary", e.target.value)} />
      </label>
      <label>
        Body <textarea rows="10" value={form.body} onChange={(e) => up("body", e.target.value)} />
      </label>

      <div style={{ display: "flex", gap: 12 }}>
        <button type="submit" className="tv-btn primary" disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
        {!isNew && (
          <button type="button" className="tv-btn" onClick={remove} disabled={busy} style={{ color: "tomato" }}>
            Delete
          </button>
        )}
        <Link to="/articles" className="tv-btn" style={{ marginLeft: "auto" }}>
          Back to list
        </Link>
      </div>
    </form>
  );
}

/* ---------------- Router ---------------- */
export default function App() {
  const { user, logout } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <ArticlesList />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/articles"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <ArticlesList />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/articles/:slug"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <ArticleEdit />
            </Shell>
          </Protected>
        }
      />

      {/* Settings routes */}
      <Route
        path="/settings/navbar"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <NavbarSettings />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/settings/breaking"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <BreakingSettings />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/settings/article-block-dark"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <ArticleBlockDarkSettings />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/settings/featured"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <FeaturedSettings />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/settings/article-block-light"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <ArticleBlockLightSettings />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/settings/section-tri-column"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <SectionTriColumnSettings />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/settings/feature-essay"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <FeatureEssaySettings />
            </Shell>
          </Protected>
        }
      />

      <Route
        path="/settings/news-split"
        element={
          <Protected user={user}>
            <Shell user={user} onLogout={logout}>
              <NewsSplitSettings />
            </Shell>
          </Protected>
        }
      />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
