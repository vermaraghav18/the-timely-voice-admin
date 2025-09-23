import { useEffect, useState } from "react";
import api from "../shared/api/index.js";
const { settings, articles } = api;
import { Link } from "react-router-dom";

const emptyItem = () => ({
  id: crypto?.randomUUID?.() ?? String(Math.random()).slice(2),
  mode: "article",   // "article" | "custom"
  slug: "",          // when mode === "article"
  title: "",         // when mode === "custom"
  image: "",         // when mode === "custom"
  href: "#",         // when mode === "custom"
});

export default function BreakingSettings() {
  const [form, setForm] = useState({ title: "Breaking", items: [] });
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setBusy(true); setErr(null);
      try {
        const cfg = await settings.get("breaking"); // GET /api/settings/breaking
        if (!mounted) return;
        const safe = {
          title: cfg?.title || "Breaking",
          items: Array.isArray(cfg?.items) ? cfg.items.map(x => ({
            id: x.id || (crypto?.randomUUID?.() ?? String(Math.random()).slice(2)),
            mode: x.mode === "custom" ? "custom" : "article",
            slug: x.slug || "",
            title: x.title || "",
            image: x.image || "",
            href: x.href || (x.slug ? `/article/${x.slug}` : "#"),
          })) : [],
        };
        setForm(safe);
      } catch (e) {
        setErr(e?.message || "Failed to load settings");
      } finally {
        if (mounted) setBusy(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const up = (patch) => setForm(s => ({ ...s, ...patch }));
  const upItem = (id, patch) =>
    setForm(s => ({ ...s, items: s.items.map(it => it.id === id ? { ...it, ...patch } : it) }));
  const addItem = () => setForm(s => ({ ...s, items: [...s.items, emptyItem()] }));
  const delItem = (id) => setForm(s => ({ ...s, items: s.items.filter(it => it.id !== id) }));
  const move = (id, dir) => setForm(s => {
    const arr = [...s.items];
    const i = arr.findIndex(x => x.id === id);
    if (i < 0) return s;
    const j = dir < 0 ? Math.max(0, i - 1) : Math.min(arr.length - 1, i + 1);
    const [row] = arr.splice(i, 1);
    arr.splice(j, 0, row);
    return { ...s, items: arr };
  });

  const save = async () => {
    setSaving(true); setErr(null);
    try {
      // Persist exactly what the frontend BreakingContainer expects
      const payload = {
        title: form.title || "Breaking",
        items: form.items.map(x => ({
          id: x.id,
          mode: x.mode,
          slug: x.mode === "article" ? (x.slug || "") : "",
          title: x.mode === "custom" ? (x.title || "") : "",
          image: x.mode === "custom" ? (x.image || "") : "",
          href:  x.mode === "custom" ? (x.href  || "#") : "",
        })),
      };
      await settings.put("breaking", payload); // PUT /api/settings/breaking
    } catch (e) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const previewArticle = async (slug) => {
    setPreview(null);
    if (!slug) return;
    try {
      const a = await articles.get(slug);
      setPreview({
        title: a?.title || slug,
        thumb: a?.thumbnailUrl || a?.heroImageUrl || "",
        slug: a?.slug || slug,
      });
    } catch (e) {
      setPreview({ error: e?.message || "Failed to load article" });
    }
  };

  if (busy) return <div>Loading…</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>Breaking — Settings</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="tv-btn" onClick={addItem}>Add item</button>
          <button className="tv-btn primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <Link className="tv-btn" to="/">Back</Link>
        </div>
      </div>

      {err && <div style={{ color: "tomato" }}>{err}</div>}

      <label>Section Title
        <input value={form.title} onChange={e => up({ title: e.target.value })} placeholder="Breaking" />
      </label>

      <div style={{ display: "grid", gap: 12 }}>
        {form.items.map((it, idx) => (
          <fieldset key={it.id} style={{ border: "1px solid var(--tv-border)", borderRadius: 12 }}>
            <legend style={{ padding: "0 8px" }}>Item #{idx + 1}</legend>

            <div style={{ display: "flex", gap: 8, alignItems: "center", padding: 8 }}>
              <button className="tv-btn" disabled={idx === 0} onClick={() => move(it.id, -1)}>↑</button>
              <button className="tv-btn" disabled={idx === form.items.length - 1} onClick={() => move(it.id, +1)}>↓</button>
              <span className="tv-badge">order: {idx + 1}</span>
              <div style={{ marginLeft: "auto" }}>
                <button className="tv-btn" style={{ color: "tomato" }} onClick={() => delItem(it.id)}>Delete</button>
              </div>
            </div>

            <div style={{ display: "flex", gap: 16, padding: 12 }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name={`mode-${it.id}`}
                  checked={it.mode === "article"}
                  onChange={() => upItem(it.id, { mode: "article" })}
                />
                Use Article (slug)
              </label>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name={`mode-${it.id}`}
                  checked={it.mode === "custom"}
                  onChange={() => upItem(it.id, { mode: "custom" })}
                />
                Use Custom (title/image/href)
              </label>
            </div>

            {it.mode === "article" ? (
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "2fr auto", padding: 12 }}>
                <label>Article Slug
                  <input value={it.slug} onChange={e => upItem(it.id, { slug: e.target.value })} placeholder="e.g. delhi-rains-today" />
                </label>
                <button type="button" className="tv-btn" onClick={() => previewArticle(it.slug)} disabled={!it.slug}>Preview</button>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr", padding: 12 }}>
                <label>Title
                  <input value={it.title} onChange={e => upItem(it.id, { title: e.target.value })} />
                </label>
                <label>Image URL
                  <input value={it.image} onChange={e => upItem(it.id, { image: e.target.value })} placeholder="https://…" />
                </label>
                <label>Link (href)
                  <input value={it.href} onChange={e => upItem(it.id, { href: e.target.value })} placeholder="/article/slug-or-external" />
                </label>
              </div>
            )}
          </fieldset>
        ))}
        {!form.items.length && (
          <div style={{ opacity: 0.7, padding: 8 }}>
            No items yet. Click <b>Add item</b> to create your first Breaking tile.
          </div>
        )}
      </div>

      {preview && (
        <div style={{ padding: 12, border: "1px solid var(--tv-border)", borderRadius: 12 }}>
          <h4 style={{ marginTop: 0 }}>Article preview</h4>
          {"error" in preview ? (
            <div style={{ color: "tomato" }}>{preview.error}</div>
          ) : (
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {preview.thumb && (
                <img
                  src={preview.thumb}
                  alt={preview.title}
                  style={{ width: 180, height: 101, objectFit: "cover", borderRadius: 8 }}
                />
              )}
              <div>
                <div><b>{preview.title}</b></div>
                <div style={{ fontSize: 12, opacity: 0.8 }}>/article/{preview.slug}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
