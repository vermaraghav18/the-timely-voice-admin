import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

/* ---------- API base + smart fallback for path styles ---------- */
const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

async function fetchJSONWithFallback(base, method = "GET", body) {
  const paths = [
    "/api/settings/sectionTriColumn",   // camel
    "/api/settings/section-tri-column", // kebab
    "/api/settings/section_tri_column", // snake
  ];
  let lastErr;
  for (const p of paths) {
    try {
      const res = await fetch(base + p, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${p}`);
      // GET returns JSON; PUT may return empty; handle both
      return await res.json().catch(() => ({}));
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr || new Error("All endpoints failed");
}

/* ---------- Default shape for this settings object ---------- */
const DEFAULT_ITEM = { title: "", img: "", href: "#", summary: "" };

const DEFAULTS = {
  leftTitle: "Popular",
  rightTitle: "Full Coverage — Donald Trump",
  techTitle: "TECH NEWS",
  bizTitle: "BUSINESS NEWS",

  feature: { overline: "", title: "", img: "", href: "#" },
  hero: { overline: "", title: "", img: "", href: "#" },

  popular: Array.from({ length: 5 }, () => ({ ...DEFAULT_ITEM })),
  coverage: Array.from({ length: 4 }, () => ({ ...DEFAULT_ITEM })),
  techItems: Array.from({ length: 3 }, () => ({ ...DEFAULT_ITEM })),
  bizItems: Array.from({ length: 3 }, () => ({ ...DEFAULT_ITEM })),

  leftPromo: { img: "", href: "#", caption: "Special Report" },
  rightPromo: { img: "", href: "#", caption: "" },
};

export default function SectionTriColumnSettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  // Load existing config (if any)
  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      try {
        const data = await fetchJSONWithFallback(API_BASE, "GET");
        if (alive) setForm({ ...DEFAULTS, ...data });
      } catch (e) {
        // keep defaults if not created yet
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const up = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const upObj = (k, sub, v) =>
    setForm((s) => ({ ...s, [k]: { ...(s[k] || {}), [sub]: v } }));

  const upList = (listKey, idx, subKey, val) =>
    setForm((s) => {
      const list = Array.isArray(s[listKey]) ? [...s[listKey]] : [];
      list[idx] = { ...(list[idx] || { ...DEFAULT_ITEM }), [subKey]: val };
      return { ...s, [listKey]: list };
    });

  const addRow = (listKey, max) =>
    setForm((s) => {
      const list = Array.isArray(s[listKey]) ? [...s[listKey]] : [];
      if (max && list.length >= max) return s;
      list.push({ ...DEFAULT_ITEM });
      return { ...s, [listKey]: list };
    });

  const removeRow = (listKey, idx) =>
    setForm((s) => {
      const list = Array.isArray(s[listKey]) ? [...s[listKey]] : [];
      list.splice(idx, 1);
      return { ...s, [listKey]: list };
    });

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setErr("");
    try {
      const payload = { ...form };
      await fetchJSONWithFallback(API_BASE, "PUT", payload);
      alert("Section Tri Column saved!");
    } catch (e2) {
      setErr(e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading Section Tri Column…</div>;

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Section Tri Column — Settings</h2>
        <Link to="/articles" className="tv-btn" style={{ marginLeft: "auto" }}>
          Back to Articles
        </Link>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {err && <div style={{ color: "tomato" }}>{err}</div>}

      {/* Titles */}
      <fieldset style={fs}>
        <legend style={lg}>Section Titles</legend>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <Label text="Left rail title (Popular)">
            <input
              value={form.leftTitle || ""}
              onChange={(e) => up("leftTitle", e.target.value)}
              placeholder="Popular"
            />
          </Label>
          <Label text="Right rail title (Coverage)">
            <input
              value={form.rightTitle || ""}
              onChange={(e) => up("rightTitle", e.target.value)}
              placeholder="Full Coverage — …"
            />
          </Label>
        </div>
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <Label text="Tech block title">
            <input
              value={form.techTitle || ""}
              onChange={(e) => up("techTitle", e.target.value)}
              placeholder="TECH NEWS"
            />
          </Label>
          <Label text="Business block title">
            <input
              value={form.bizTitle || ""}
              onChange={(e) => up("bizTitle", e.target.value)}
              placeholder="BUSINESS NEWS"
            />
          </Label>
        </div>
      </fieldset>

      {/* Center cards */}
      <fieldset style={fs}>
        <legend style={lg}>Center Cards</legend>
        <TwoCol>
          <CardEditor
            label="Feature Card"
            value={form.feature}
            onChange={(k, v) => upObj("feature", k, v)}
          />
          <CardEditor
            label="Hero Card"
            value={form.hero}
            onChange={(k, v) => upObj("hero", k, v)}
          />
        </TwoCol>
      </fieldset>

      {/* Lists */}
      <fieldset style={fs}>
        <legend style={lg}>Left Rail — Popular (suggested 5)</legend>
        <ListEditor
          listKey="popular"
          items={form.popular}
          upList={upList}
          addRow={addRow}
          removeRow={removeRow}
          max={8}
        />
      </fieldset>

      <fieldset style={fs}>
        <legend style={lg}>Right Rail — Coverage (suggested 4)</legend>
        <ListEditor
          listKey="coverage"
          items={form.coverage}
          upList={upList}
          addRow={addRow}
          removeRow={removeRow}
          max={8}
        />
      </fieldset>

      <fieldset style={fs}>
        <legend style={lg}>Right Rail — Tech (suggested 3)</legend>
        <ListEditor
          listKey="techItems"
          items={form.techItems}
          upList={upList}
          addRow={addRow}
          removeRow={removeRow}
          max={6}
        />
      </fieldset>

      <fieldset style={fs}>
        <legend style={lg}>Left Rail — Business (suggested 3)</legend>
        <ListEditor
          listKey="bizItems"
          items={form.bizItems}
          upList={upList}
          addRow={addRow}
          removeRow={removeRow}
          max={6}
        />
      </fieldset>

      {/* Promos */}
      <fieldset style={fs}>
        <legend style={lg}>Promos</legend>
        <TwoCol>
          <PromoEditor
            label="Left Rail Promo"
            value={form.leftPromo}
            onChange={(k, v) => upObj("leftPromo", k, v)}
          />
          <PromoEditor
            label="Right Rail Promo"
            value={form.rightPromo}
            onChange={(k, v) => upObj("rightPromo", k, v)}
          />
        </TwoCol>
      </fieldset>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Small UI helpers ---------- */

function Label({ text, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{text}</span>
      {children}
    </label>
  );
}

function TwoCol({ children }) {
  return (
    <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
      {children}
    </div>
  );
}

function CardEditor({ label, value = {}, onChange }) {
  return (
    <div style={{ display: "grid", gap: 8, border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <Label text="Overline">
        <input
          value={value.overline || ""}
          onChange={(e) => onChange("overline", e.target.value)}
          placeholder="WORLD / INDIA / …"
        />
      </Label>
      <Label text="Title">
        <input
          value={value.title || ""}
          onChange={(e) => onChange("title", e.target.value)}
          placeholder="Card title"
        />
      </Label>
      <Label text="Image URL">
        <input
          value={value.img || ""}
          onChange={(e) => onChange("img", e.target.value)}
          placeholder="https://…"
        />
      </Label>
      <Label text="Href">
        <input
          value={value.href || ""}
          onChange={(e) => onChange("href", e.target.value)}
          placeholder="/article/slug or https://…"
        />
      </Label>
    </div>
  );
}

function PromoEditor({ label, value = {}, onChange }) {
  return (
    <div style={{ display: "grid", gap: 8, border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 600 }}>{label}</div>
      <Label text="Image URL">
        <input
          value={value.img || ""}
          onChange={(e) => onChange("img", e.target.value)}
          placeholder="https://…"
        />
      </Label>
      <Label text="Href">
        <input
          value={value.href || ""}
          onChange={(e) => onChange("href", e.target.value)}
          placeholder="https://…"
        />
      </Label>
      <Label text="Caption">
        <input
          value={value.caption || ""}
          onChange={(e) => onChange("caption", e.target.value)}
          placeholder="Special Report"
        />
      </Label>
    </div>
  );
}

function ListEditor({ listKey, items = [], upList, addRow, removeRow, max = 10 }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12, display: "grid", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <strong style={{ fontSize: 12, opacity: 0.7 }}>Item #{i + 1}</strong>
            <button type="button" className="tv-btn" style={{ marginLeft: "auto" }} onClick={() => removeRow(listKey, i)}>
              Remove
            </button>
          </div>
          <Label text="Title">
            <input
              value={it.title || ""}
              onChange={(e) => upList(listKey, i, "title", e.target.value)}
              placeholder="Title"
            />
          </Label>
          <Label text="Image URL">
            <input
              value={it.img || ""}
              onChange={(e) => upList(listKey, i, "img", e.target.value)}
              placeholder="https://…"
            />
          </Label>
          <Label text="Href">
            <input
              value={it.href || ""}
              onChange={(e) => upList(listKey, i, "href", e.target.value)}
              placeholder="/article/slug or https://…"
            />
          </Label>
          <Label text="Summary (optional)">
            <textarea
              rows={2}
              value={it.summary || ""}
              onChange={(e) => upList(listKey, i, "summary", e.target.value)}
              placeholder="Short summary…"
            />
          </Label>
        </div>
      ))}

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          type="button"
          className="tv-btn"
          onClick={() => addRow(listKey, max)}
          disabled={items.length >= max}
          title={items.length >= max ? "Reached max items" : "Add item"}
        >
          Add item
        </button>
      </div>
    </div>
  );
}

/* --- styles for fieldsets --- */
const fs = { border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 };
const lg = { padding: "0 8px" };
