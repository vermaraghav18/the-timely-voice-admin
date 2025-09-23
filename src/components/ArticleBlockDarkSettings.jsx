// admin/src/components/ArticleBlockDarkSettings.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

/**
 * Stored shape at /api/settings/articleBlockDark:
 * {
 *   item: { title, byline, summary, imageUrl, imageAlt, href },
 *   related: [ { tag, title, thumb, href }, ... ]
 * }
 */
const DEFAULTS = {
  item: { title: "", byline: "", summary: "", imageUrl: "", imageAlt: "", href: "" },
  related: [],
};

export default function ArticleBlockDarkSettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/api/settings/articleBlockDark`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        let data = res.ok ? await res.json() : {};
        const next = {
          item: {
            title: data?.item?.title || "",
            byline: data?.item?.byline || "",
            summary: data?.item?.summary || "",
            imageUrl: data?.item?.imageUrl || "",
            imageAlt: data?.item?.imageAlt || "",
            href: data?.item?.href || "",
          },
          related: Array.isArray(data?.related) ? data.related : [],
        };
        if (alive) setForm(next);
      } catch (e) {
        if (alive) setErr(e?.message || "Failed to load settings");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const upItem = (k, v) =>
    setForm((s) => ({ ...s, item: { ...s.item, [k]: v } }));

  const addRel = () =>
    setForm((s) => ({
      ...s,
      related: [...(s.related || []), { tag: "", title: "", thumb: "", href: "" }],
    }));

  const rmRel = (i) =>
    setForm((s) => ({ ...s, related: s.related.filter((_, idx) => idx !== i) }));

  const editRel = (i, k, v) =>
    setForm((s) => ({
      ...s,
      related: s.related.map((it, idx) => (idx === i ? { ...it, [k]: v } : it)),
    }));

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setErr("");
    try {
      if (!form.item.title.trim()) throw new Error("Main title is required.");
      if (!form.item.imageUrl.trim()) throw new Error("Main image URL is required.");

      const payload = {
        item: {
          title: form.item.title.trim(),
          byline: (form.item.byline || "").trim(),
          summary: (form.item.summary || "").trim(),
          imageUrl: form.item.imageUrl.trim(),
          imageAlt: (form.item.imageAlt || "").trim(),
          href: (form.item.href || "").trim(),
        },
        related: (form.related || []).map((r) => ({
          tag: (r.tag || "").trim(),
          title: (r.title || "").trim(),
          thumb: (r.thumb || "").trim(),
          href: (r.href || "").trim(),
        })),
      };

      const res = await fetch(`${API_BASE}/api/settings/articleBlockDark`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t}`);
      }
      alert("Article Block Dark saved!");
    } catch (e2) {
      setErr(e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading Article Block Dark…</div>;

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Article Block Dark — Settings</h2>
        <Link to="/articles" className="tv-btn" style={{ marginLeft: "auto" }}>
          Back to Articles
        </Link>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {err && <div style={{ color: "tomato" }}>{err}</div>}

      {/* MAIN ITEM */}
      <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
        <legend style={{ padding: "0 8px" }}>Main Story</legend>

        <label style={{ display: "grid", gap: 6 }}>
          Title
          <input
            value={form.item.title}
            onChange={(e) => upItem("title", e.target.value)}
            placeholder="Overlay headline"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Byline
          <input
            value={form.item.byline}
            onChange={(e) => upItem("byline", e.target.value)}
            placeholder="BY AGENCIES, …"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Summary
          <textarea
            rows={3}
            value={form.item.summary}
            onChange={(e) => upItem("summary", e.target.value)}
            placeholder="Short text (if you ever need it)"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Image URL
          <input
            value={form.item.imageUrl}
            onChange={(e) => upItem("imageUrl", e.target.value)}
            placeholder="https://example.com/main.jpg"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Image Alt
          <input
            value={form.item.imageAlt}
            onChange={(e) => upItem("imageAlt", e.target.value)}
            placeholder="Alt text"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Link (href)
          <input
            value={form.item.href}
            onChange={(e) => upItem("href", e.target.value)}
            placeholder="# or /article/slug"
          />
        </label>
      </fieldset>

      {/* RELATED LIST */}
      <ListEditor
        title="Related (right red cards) — up to 4"
        columns={[
          { key: "tag", placeholder: "Tag (Live, Opinion, Analysis…)" },
          { key: "title", placeholder: "Title" },
          { key: "thumb", placeholder: "Thumb Image URL" },
          { key: "href", placeholder: "Link (href)" },
        ]}
        items={form.related}
        onAdd={addRel}
        onRemove={rmRel}
        onEdit={editRel}
      />

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

function ListEditor({ title, columns, items, onAdd, onRemove, onEdit }) {
  return (
    <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
      <legend style={{ padding: "0 8px" }}>{title}</legend>

      {(items || []).map((it, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${columns.length}, 1fr) auto`,
            gap: 8,
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          {columns.map((c) => (
            <input
              key={c.key}
              placeholder={c.placeholder}
              value={it[c.key] || ""}
              onChange={(e) => onEdit(i, c.key, e.target.value)}
            />
          ))}
          <button
            type="button"
            className="tv-btn"
            onClick={() => onRemove(i)}
            style={{ color: "tomato" }}
          >
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
