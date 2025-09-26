// admin/src/components/WorldSettings.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

/**
 * Stored shape (same structure your World page expects):
 * {
 *   hero: { title, summary, imageUrl },
 *   featuredItems: [{ title, summary, time, image, href }],
 *   opinions: { heading, items: [{ title, time, image, href }] },
 *   spotlightItems: [{ brand, title, image, href }],
 *   latestGrid: [{ title, image, href, publishedAt }],
 *   moreWorld: [{ title, summary, image, href, publishedAt }]
 * }
 */
const DEFAULTS = {
  hero: { title: "", summary: "", imageUrl: "" },
  featuredItems: [],
  opinions: { heading: "Opinions", items: [] },
  spotlightItems: [],
  latestGrid: [],
  moreWorld: [],
};

export default function WorldSettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Load /api/settings/world (fallback to defaults if missing)
  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      try {
        const res = await fetch(`${API_BASE}/api/settings/world`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        const data = res.ok ? await res.json() : {};

        const next = {
          hero: {
            title: data?.hero?.title || "",
            summary: data?.hero?.summary || "",
            imageUrl: data?.hero?.imageUrl || data?.hero?.image || "",
          },
          featuredItems: Array.isArray(data?.featuredItems) ? data.featuredItems : [],
          opinions: {
            heading: data?.opinions?.heading || "Opinions",
            items: Array.isArray(data?.opinions?.items) ? data.opinions.items : [],
          },
          spotlightItems: Array.isArray(data?.spotlightItems) ? data.spotlightItems : [],
          latestGrid: Array.isArray(data?.latestGrid) ? data.latestGrid : [],
          moreWorld: Array.isArray(data?.moreWorld) ? data.moreWorld : [],
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

  const upHero = (k, v) => setForm((s) => ({ ...s, hero: { ...s.hero, [k]: v } }));

  const addTo = (key, blank) => setForm((s) => ({ ...s, [key]: [...(s[key] || []), blank] }));
  const rmFrom = (key, i) =>
    setForm((s) => ({ ...s, [key]: (s[key] || []).filter((_, idx) => idx !== i) }));
  const editIn = (key, i, k, v) =>
    setForm((s) => ({
      ...s,
      [key]: (s[key] || []).map((it, idx) => (idx === i ? { ...it, [k]: v } : it)),
    }));

  // Opinions-specific helpers
  const upOpinionsHead = (v) => setForm((s) => ({ ...s, opinions: { ...s.opinions, heading: v } }));
  const addOpinion = () =>
    setForm((s) => ({
      ...s,
      opinions: {
        ...s.opinions,
        items: [...(s.opinions.items || []), { title: "", time: "", image: "", href: "" }],
      },
    }));
  const rmOpinion = (i) =>
    setForm((s) => ({
      ...s,
      opinions: { ...s.opinions, items: (s.opinions.items || []).filter((_, idx) => idx !== i) },
    }));
  const editOpinion = (i, k, v) =>
    setForm((s) => ({
      ...s,
      opinions: {
        ...s.opinions,
        items: (s.opinions.items || []).map((it, idx) => (idx === i ? { ...it, [k]: v } : it)),
      },
    }));

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setErr("");
    try {
      if (!form.hero.title.trim()) throw new Error("Title is required.");
      if (!form.hero.summary.trim()) throw new Error("Summary is required.");
      if (!form.hero.imageUrl.trim()) throw new Error("Image URL is required.");

      const payload = {
        hero: {
          title: form.hero.title.trim(),
          summary: form.hero.summary.trim(),
          imageUrl: form.hero.imageUrl.trim(),
        },
        featuredItems: (form.featuredItems || []).map((n) => ({
          title: (n.title || "").trim(),
          summary: (n.summary || "").trim(),
          time: (n.time || "").trim(),
          image: (n.image || "").trim(),
          href: (n.href || "").trim(),
        })),
        opinions: {
          heading: (form.opinions?.heading || "Opinions").trim(),
          items: (form.opinions?.items || []).map((n) => ({
            title: (n.title || "").trim(),
            time: (n.time || "").trim(),
            image: (n.image || "").trim(),
            href: (n.href || "").trim(),
          })),
        },
        spotlightItems: (form.spotlightItems || []).map((n) => ({
          brand: (n.brand || "").trim(),
          title: (n.title || "").trim(),
          image: (n.image || "").trim(),
          href: (n.href || "").trim(),
        })),
        latestGrid: (form.latestGrid || []).map((n) => ({
          title: (n.title || "").trim(),
          image: (n.image || "").trim(),
          href: (n.href || "").trim(),
          publishedAt: (n.publishedAt || "").trim(),
        })),
        moreWorld: (form.moreWorld || []).map((n) => ({
          title: (n.title || "").trim(),
          summary: (n.summary || "").trim(),
          image: (n.image || "").trim(),
          href: (n.href || "").trim(),
          publishedAt: (n.publishedAt || "").trim(),
        })),
      };

      const res = await fetch(`${API_BASE}/api/settings/world`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${t}`);
      }

      // also mirror to legacy key used by the homepage
try {
  await fetch(`${API_BASE}/api/settings/articleBlockLight`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
} catch (_) {}

      alert("World settings saved!");
    } catch (e2) {
      setErr(e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading World settings…</div>;

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>World — Settings</h2>
        <Link to="/articles" className="tv-btn" style={{ marginLeft: "auto" }}>
          Back to Articles
        </Link>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {err && <div style={{ color: "tomato" }}>{err}</div>}

      {/* HERO */}
      <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
        <legend style={{ padding: "0 8px" }}>Center Hero (fallback)</legend>

        <label style={{ display: "grid", gap: 6 }}>
          Title
          <input
            value={form.hero.title}
            onChange={(e) => upHero("title", e.target.value)}
            placeholder="Headline shown in the big center slide"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Summary
          <textarea
            rows={3}
            value={form.hero.summary}
            onChange={(e) => upHero("summary", e.target.value)}
            placeholder="Short teaser under the headline"
          />
        </label>

        <label style={{ display: "grid", gap: 6, marginTop: 10 }}>
          Image URL
          <input
            value={form.hero.imageUrl}
            onChange={(e) => upHero("imageUrl", e.target.value)}
            placeholder="https://example.com/center.jpg"
          />
        </label>
      </fieldset>

      {/* Center Rotator */}
      <ListEditor
        title="Center Rotator Slides (featuredItems)"
        columns={[
          { key: "title", placeholder: "Title" },
          { key: "summary", placeholder: "Summary" },
          { key: "time", placeholder: "Time (e.g., 12 MIN AGO)" },
          { key: "image", placeholder: "Image URL" },
          { key: "href", placeholder: "Link (href)" },
        ]}
        items={form.featuredItems}
        onAdd={() =>
          addTo("featuredItems", { title: "", summary: "", time: "", image: "", href: "" })
        }
        onRemove={(i) => rmFrom("featuredItems", i)}
        onEdit={(i, k, v) => editIn("featuredItems", i, k, v)}
      />

      {/* Opinions */}
      <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
        <legend style={{ padding: "0 8px" }}>Opinions (left column)</legend>

        <label style={{ display: "grid", gap: 6 }}>
          Heading
          <input
            value={form.opinions.heading}
            onChange={(e) => upOpinionsHead(e.target.value)}
            placeholder="Opinions"
          />
        </label>

        <ListEditor
          title="Opinion items"
          columns={[
            { key: "title", placeholder: "Title" },
            { key: "time", placeholder: "Time (e.g., 1 HOUR AGO)" },
            { key: "image", placeholder: "Image URL" },
            { key: "href", placeholder: "Link (href)" },
          ]}
          items={form.opinions.items}
          onAdd={() => addOpinion()}
          onRemove={(i) => rmOpinion(i)}
          onEdit={(i, k, v) => editOpinion(i, k, v)}
        />
      </fieldset>

      {/* Spotlight */}
      <ListEditor
        title="Spotlight cards (right column)"
        columns={[
          { key: "brand", placeholder: "Brand (e.g., Reuters)" },
          { key: "title", placeholder: "Title" },
          { key: "image", placeholder: "Image URL (9:16 recommended)" },
          { key: "href", placeholder: "Link (href)" },
        ]}
        items={form.spotlightItems}
        onAdd={() => addTo("spotlightItems", { brand: "", title: "", image: "", href: "" })}
        onRemove={(i) => rmFrom("spotlightItems", i)}
        onEdit={(i, k, v) => editIn("spotlightItems", i, k, v)}
      />

      {/* Latest Grid (4×2) */}
      <ListEditor
        title="Latest Grid (4×2)"
        columns={[
          { key: "title", placeholder: "Title" },
          { key: "image", placeholder: "Image URL" },
          { key: "href", placeholder: "Link (href)" },
          { key: "publishedAt", placeholder: "Published At (ISO, optional)" },
        ]}
        items={form.latestGrid}
        onAdd={() => addTo("latestGrid", { title: "", image: "", href: "", publishedAt: "" })}
        onRemove={(i) => rmFrom("latestGrid", i)}
        onEdit={(i, k, v) => editIn("latestGrid", i, k, v)}
      />

      {/* More World (stacked landscape) */}
      <ListEditor
        title="More World (stacked landscape list)"
        columns={[
          { key: "title", placeholder: "Title" },
          { key: "summary", placeholder: "Summary" },
          { key: "image", placeholder: "Image URL" },
          { key: "href", placeholder: "Link (href)" },
          { key: "publishedAt", placeholder: "Published At (ISO, optional)" },
        ]}
        items={form.moreWorld}
        onAdd={() =>
          addTo("moreWorld", { title: "", summary: "", image: "", href: "", publishedAt: "" })
        }
        onRemove={(i) => rmFrom("moreWorld", i)}
        onEdit={(i, k, v) => editIn("moreWorld", i, k, v)}
      />

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/* -------- small inline list editor (shared inline) -------- */
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
          {columns.map((c) =>
            c.key === "summary" ? (
              <textarea
                key={c.key}
                rows={2}
                placeholder={c.placeholder}
                value={it[c.key] || ""}
                onChange={(e) => onEdit(i, c.key, e.target.value)}
              />
            ) : (
              <input
                key={c.key}
                placeholder={c.placeholder}
                value={it[c.key] || ""}
                onChange={(e) => onEdit(i, c.key, e.target.value)}
              />
            )
          )}
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
