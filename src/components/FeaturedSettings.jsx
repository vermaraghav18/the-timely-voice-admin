// admin/src/components/FeaturedSettings.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { settings } from "../../../shared/api/index.js";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

// Stored shape:
// {
//   hero: { title, summary, imageUrl },
//   related: [{ title, href, image }],
//   topStories: [{ title, href, image }],
//   trendingStories: [{ title, href, image }]
// }
const DEFAULTS = {
  hero: { title: "", summary: "", imageUrl: "" },
  related: [],
  topStories: [],
  trendingStories: [],
};

export default function FeaturedSettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // ---- Load (supports legacy flat {title,summary,imageUrl}) ----
  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      try {
        const current = await settings.get("featured"); // GET /api/settings/featured
        let next = { ...DEFAULTS };

        if (current && typeof current === "object") {
          if (current.hero) {
            next.hero = {
              title: current.hero.title || "",
              summary: current.hero.summary || "",
              imageUrl: current.hero.imageUrl || "",
            };
          } else {
            // legacy flat
            next.hero = {
              title: current.title || "",
              summary: current.summary || "",
              imageUrl: current.imageUrl || "",
            };
          }
          next.related = Array.isArray(current.related) ? current.related : [];
          next.topStories = Array.isArray(current.topStories) ? current.topStories : [];
          next.trendingStories = Array.isArray(current.trendingStories) ? current.trendingStories : [];
        }

        if (alive) setForm(next);
      } catch (e) {
        if (alive) setErr(e?.message || "Failed to load Featured settings");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const upHero = (k, v) =>
    setForm((s) => ({ ...s, hero: { ...s.hero, [k]: v } }));

  const addItem = (listKey) =>
    setForm((s) => ({ ...s, [listKey]: [...s[listKey], { title: "", href: "", image: "" }] }));

  const rmItem = (listKey, i) =>
    setForm((s) => ({ ...s, [listKey]: s[listKey].filter((_, idx) => idx !== i) }));

  const editItem = (listKey, i, k, v) =>
    setForm((s) => ({
      ...s,
      [listKey]: s[listKey].map((it, idx) => (idx === i ? { ...it, [k]: v } : it)),
    }));

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true); setErr("");
    try {
      if (!form.hero.title.trim()) throw new Error("Title is required.");
      if (!form.hero.summary.trim()) throw new Error("Description is required.");
      if (!form.hero.imageUrl.trim()) throw new Error("Image URL is required.");

      const payload = {
        hero: {
          title: form.hero.title.trim(),
          summary: form.hero.summary.trim(),
          imageUrl: form.hero.imageUrl.trim(),
        },
        related: (form.related || []).map(n => ({
          title: (n.title || "").trim(),
          href: (n.href || "").trim(),
          image: (n.image || "").trim(),
        })),
        topStories: (form.topStories || []).map(n => ({
          title: (n.title || "").trim(),
          href: (n.href || "").trim(),
          image: (n.image || "").trim(),
        })),
        trendingStories: (form.trendingStories || []).map(n => ({
          title: (n.title || "").trim(),
          href: (n.href || "").trim(),
          image: (n.image || "").trim(),
        })),
      };

      const res = await fetch(`${API_BASE}/api/settings/featured`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t}`);
      }
      alert("Featured saved!");
    } catch (e2) {
      setErr(e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading Featured settings…</div>;

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Featured Article Settings</h2>
        <Link to="/articles" className="tv-btn" style={{ marginLeft: "auto" }}>
          Back to Articles
        </Link>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {err && <div style={{ color: "tomato" }}>{err}</div>}

      {/* ---------------- HERO ---------------- */}
      <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
        <legend style={{ padding: "0 8px" }}>Hero (big card)</legend>

        <label style={{ display: "grid", gap: 6 }}>
          Title
          <input
            value={form.hero.title}
            onChange={(e) => upHero("title", e.target.value)}
            placeholder="Featured headline shown in the big card"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Description (Summary)
          <textarea
            rows={4}
            value={form.hero.summary}
            onChange={(e) => upHero("summary", e.target.value)}
            placeholder="Short teaser shown under the title"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Image URL
          <input
            value={form.hero.imageUrl}
            onChange={(e) => upHero("imageUrl", e.target.value)}
            placeholder="https://example.com/hero.jpg"
          />
        </label>

        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "1fr 280px",
            gap: 12,
            alignItems: "start",
          }}
        >
          <div>
            <div style={{ fontWeight: 900, fontSize: 18, marginBottom: 6 }}>
              {form.hero.title || "—"}
            </div>
            <div style={{ color: "#cfd9e3", lineHeight: 1.35 }}>
              {form.hero.summary || "—"}
            </div>
          </div>
          <div
            style={{
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: 8,
              overflow: "hidden",
              background: "#111",
              aspectRatio: "4 / 3",
            }}
          >
            {form.hero.imageUrl ? (
              <img
                src={form.hero.imageUrl}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { e.currentTarget.style.opacity = 0.3; }}
              />
            ) : (
              <div style={{ display: "grid", placeItems: "center", height: "100%", opacity: 0.6 }}>
                No image
              </div>
            )}
          </div>
        </div>
      </fieldset>

      {/* ---------------- LIST MAKER ---------------- */}
      <ListEditor
        title="Related mini-cards (under the big card)"
        items={form.related}
        onAdd={() => addItem("related")}
        onRemove={(i) => rmItem("related", i)}
        onEdit={(i, k, v) => editItem("related", i, k, v)}
      />

      <ListEditor
        title="TOP STORIES (right column)"
        items={form.topStories}
        onAdd={() => addItem("topStories")}
        onRemove={(i) => rmItem("topStories", i)}
        onEdit={(i, k, v) => editItem("topStories", i, k, v)}
      />

      <ListEditor
        title="TRENDING STORIES (right column)"
        items={form.trendingStories}
        onAdd={() => addItem("trendingStories")}
        onRemove={(i) => rmItem("trendingStories", i)}
        onEdit={(i, k, v) => editItem("trendingStories", i, k, v)}
      />

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Small subcomponent for the 3 lists ---------- */
function ListEditor({ title, items, onAdd, onRemove, onEdit }) {
  return (
    <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
      <legend style={{ padding: "0 8px" }}>{title}</legend>

      {(items || []).map((it, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1.2fr 1fr auto",
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <input
            placeholder="Title"
            value={it.title || ""}
            onChange={(e) => onEdit(i, "title", e.target.value)}
          />
          <input
            placeholder="Link (href)"
            value={it.href || ""}
            onChange={(e) => onEdit(i, "href", e.target.value)}
          />
          <input
            placeholder="Image URL"
            value={it.image || ""}
            onChange={(e) => onEdit(i, "image", e.target.value)}
          />
          <button type="button" className="tv-btn" onClick={() => onRemove(i)} style={{ color: "tomato" }}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" className="tv-btn" onClick={onAdd}>
        + Add item
      </button>
    </fieldset>
  );
}
