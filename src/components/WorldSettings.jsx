// admin/src/components/WorldSettings.jsx
import { useEffect, useState } from "react";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

const emptyItem = { title: "", source: "", imageUrl: "", href: "" };

export default function WorldSettings() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [ok, setOk] = useState(null);

  useEffect(() => {
    (async () => {
      setBusy(true); setErr(null);
      try {
        const res = await fetch(`${API_BASE}/api/settings/world`, {
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setItems(Array.isArray(json?.items) ? json.items : []);
      } catch (e) { setErr(e.message); }
      finally { setBusy(false); }
    })();
  }, []);

  const up = (idx, key, val) =>
    setItems((s) => s.map((it, i) => (i === idx ? { ...it, [key]: val } : it)));

  const add = () => setItems((s) => [...s, { ...emptyItem }]);
  const del = (idx) => setItems((s) => s.filter((_, i) => i !== idx));

  const save = async () => {
    setBusy(true); setErr(null); setOk(null);
    try {
      const payload = { items: items.map((it) => ({
        title: it.title || "",
        source: it.source || "",
        // accept either key; the site page reads image OR imageUrl
        image: it.image || undefined,
        imageUrl: it.imageUrl || it.image || "",
        href: it.href || "",
      })) };
      const res = await fetch(`${API_BASE}/api/settings/world`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setOk("Saved!");
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); setTimeout(()=>setOk(null), 2000); }
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <h2 style={{ margin: 0 }}>Settings — World News</h2>
      <p style={{ color: "var(--tv-text-muted)" }}>
        Simple list: <b>title</b>, <b>image</b> and <b>source</b> (optional link).
      </p>

      {err && <div style={{ color: "tomato" }}>{err}</div>}
      {ok && <div className="tv-badge" style={{ background: "#E6F7ED", color: "#114B2E" }}>{ok}</div>}

      <div style={{ display: "grid", gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12, display: "grid", gap: 8 }}>
            <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
              <label>Title
                <input value={it.title || ""} onChange={(e)=>up(i, "title", e.target.value)} />
              </label>
              <label>Source
                <input value={it.source || ""} onChange={(e)=>up(i, "source", e.target.value)} placeholder="e.g. Reuters" />
              </label>
            </div>

            <label>Image URL
              <input value={it.imageUrl || it.image || ""} onChange={(e)=>up(i, "imageUrl", e.target.value)} placeholder="https://…" />
            </label>

            <label>Link (optional)
              <input value={it.href || ""} onChange={(e)=>up(i, "href", e.target.value)} placeholder="https://original-article…" />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="tv-btn" onClick={() => del(i)} style={{ color: "tomato" }}>
                Delete
              </button>
            </div>
          </div>
        ))}
        {!items.length && <div style={{ opacity: 0.7 }}>No items yet.</div>}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" className="tv-btn" onClick={add}>+ Add item</button>
        <button type="button" className="tv-btn primary" onClick={save} disabled={busy}>
          {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
