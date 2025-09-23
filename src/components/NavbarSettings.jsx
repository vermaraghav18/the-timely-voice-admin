// admin/src/components/NavbarSettings.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
// We still use settings.get for loading (your shared API has this):
import { settings } from "../../../shared/api/index.js";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

const emptyCfg = {
  siteName: "THE TIMELY VOICE",
  languages: ["ENGLISH"],
  nav: [{ key: "top", label: "TOP NEWS", to: "/articles" }],
  ctas: [{ label: "SUBSCRIBE NOW", href: "#", kind: "outline" }],
  liveText: "LIVE",
  liveTicker: "",
  // NEW: default header gradient colors (match client App.css defaults)
  colors: {
    blue1: "#5186B6",
    blue2: "#1D63A2",
    blue3: "#0E4F87",
  },
};

export default function NavbarSettings() {
  const [cfg, setCfg] = useState(emptyCfg);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      try {
        const current = await settings.get("navbar"); // GET /api/settings/navbar
        if (alive) {
          // merge with defaults so colors always exist
          const merged = {
            ...emptyCfg,
            ...current,
            colors: { ...emptyCfg.colors, ...(current?.colors || {}) },
          };
          setCfg(merged);
        }
      } catch (e) {
        if (alive) setErr(e.message || "Failed to load settings");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const up = (k, v) => setCfg(s => ({ ...s, [k]: v }));

  const langsText = useMemo(
    () => (cfg.languages || []).join(", "),
    [cfg.languages]
  );
  const setLangsText = (text) =>
    up("languages", text.split(",").map(s => s.trim()).filter(Boolean));

  const addNav = () =>
    up("nav", [...(cfg.nav || []), { key: "", label: "", to: "" }]);
  const rmNav = (i) =>
    up("nav", (cfg.nav || []).filter((_, idx) => idx !== i));
  const editNav = (i, k, v) =>
    up("nav", (cfg.nav || []).map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));

  const addCta = () =>
    up("ctas", [...(cfg.ctas || []), { label: "", href: "#", kind: "outline" }]);
  const rmCta = (i) =>
    up("ctas", (cfg.ctas || []).filter((_, idx) => idx !== i));
  const editCta = (i, k, v) =>
    up("ctas", (cfg.ctas || []).map((it, idx) => (idx === i ? { ...it, [k]: v } : it)));

  const editColor = (k, v) =>
    up("colors", { ...(cfg.colors || {}), [k]: v });

  // SAVE using direct fetch (PUT /api/settings/navbar)
  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true); setErr("");
    try {
      const res = await fetch(`${API_BASE}/api/settings/navbar`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cfg),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${text}`);
      }
      alert("Navbar saved!");
    } catch (e2) {
      setErr(e2.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading navbar settings…</div>;

  const c = cfg.colors || {};
  const mastGradient = `linear-gradient(180deg, ${c.blue1}, ${c.blue2})`;

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Navbar Settings</h2>
        <Link to="/articles" className="tv-btn" style={{ marginLeft: "auto" }}>Back to Articles</Link>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {err && <div style={{ color: "tomato" }}>{err}</div>}

      {/* ---- NEW: Live preview (admin-side) ---- */}
      <div style={{ border: "1px solid var(--tv-border)", borderRadius: 12, overflow: "hidden" }}>
        <div style={{
          height: 56,
          background: mastGradient,
          borderBottom: "1px solid rgba(0,0,0,0.2)",
        }} />
        <div style={{
          height: 36,
          background: c.blue3,
          borderTop: "1px solid rgba(0,0,0,0.2)",
        }} />
      </div>

      {/* ---- NEW: Header colors (three tokens for the gradient) ---- */}
      <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
        <legend style={{ padding: "0 8px" }}>Header Colors (Gradient)</legend>

        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Blue 1 (top)</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color"
                value={c.blue1 || "#5186B6"}
                onChange={e => editColor("blue1", e.target.value)}
                style={{ width: 44, height: 32, padding: 0, border: "1px solid #ddd", borderRadius: 6, background: "#fff" }}
              />
              <input
                value={c.blue1 || ""}
                onChange={e => editColor("blue1", e.target.value)}
                placeholder="#5186B6"
              />
            </div>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Blue 2 (middle)</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color"
                value={c.blue2 || "#1D63A2"}
                onChange={e => editColor("blue2", e.target.value)}
                style={{ width: 44, height: 32, padding: 0, border: "1px solid #ddd", borderRadius: 6, background: "#fff" }}
              />
              <input
                value={c.blue2 || ""}
                onChange={e => editColor("blue2", e.target.value)}
                placeholder="#1D63A2"
              />
            </div>
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Blue 3 (tabs bar)</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                type="color"
                value={c.blue3 || "#0E4F87"}
                onChange={e => editColor("blue3", e.target.value)}
                style={{ width: 44, height: 32, padding: 0, border: "1px solid #ddd", borderRadius: 6, background: "#fff" }}
              />
              <input
                value={c.blue3 || ""}
                onChange={e => editColor("blue3", e.target.value)}
                placeholder="#0E4F87"
              />
            </div>
          </label>
        </div>
      </fieldset>

      <label>
        Site Name
        <input value={cfg.siteName || ""} onChange={e=>up("siteName", e.target.value)} />
      </label>

      <label>
        Languages (comma separated)
        <input
          value={langsText}
          onChange={e=>setLangsText(e.target.value)}
          placeholder="ENGLISH, हिंदी, বাংলা, …"
        />
      </label>

      <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
        <legend style={{ padding: "0 8px" }}>Main Navigation</legend>
        {(cfg.nav || []).map((item, i) => (
          <div key={i} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 2fr auto", alignItems: "center", marginBottom: 8 }}>
            <input placeholder="key (e.g. tech)" value={item.key || ""} onChange={e=>editNav(i, "key", e.target.value)} />
            <input placeholder="label (e.g. TECH)" value={item.label || ""} onChange={e=>editNav(i, "label", e.target.value)} />
            <input placeholder="to (e.g. /articles?section=tech)" value={item.to || ""} onChange={e=>editNav(i, "to", e.target.value)} />
            <button type="button" className="tv-btn" onClick={() => rmNav(i)} style={{ color: "tomato" }}>Remove</button>
          </div>
        ))}
        <button type="button" className="tv-btn" onClick={addNav}>+ Add nav item</button>
      </fieldset>

      <fieldset style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
        <legend style={{ padding: "0 8px" }}>CTA Buttons</legend>
        {(cfg.ctas || []).map((item, i) => (
          <div key={i} style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 2fr 1fr auto", alignItems: "center", marginBottom: 8 }}>
            <input placeholder="label" value={item.label || ""} onChange={e=>editCta(i, "label", e.target.value)} />
            <input placeholder="href" value={item.href || ""} onChange={e=>editCta(i, "href", e.target.value)} />
            <select value={item.kind || "outline"} onChange={e=>editCta(i, "kind", e.target.value)}>
              <option value="outline">outline</option>
              <option value="solid">solid</option>
            </select>
            <button type="button" className="tv-btn" onClick={() => rmCta(i)} style={{ color: "tomato" }}>Remove</button>
          </div>
        ))}
        <button type="button" className="tv-btn" onClick={addCta}>+ Add CTA</button>
      </fieldset>

      <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 3fr" }}>
        <label>
          Live Tag (e.g. LIVE)
          <input value={cfg.liveText || ""} onChange={e=>up("liveText", e.target.value)} />
        </label>
        <label>
          Live Ticker (red strip)
          <input value={cfg.liveTicker || ""} onChange={e=>up("liveTicker", e.target.value)} />
        </label>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}
