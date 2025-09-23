// admin/src/components/FeatureEssaySettings.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000";

// Try multiple API path shapes (camel, kebab, snake) for both GET and PUT
async function fetchJSONWithFallback(base, method = "GET", body) {
  const paths = [
    "/api/settings/featureEssay",   // camel
    "/api/settings/feature-essay",  // kebab
    "/api/settings/feature_essay",  // snake
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
      // For PUT routes that may not return a body, swallow JSON error and return {}
      return await res.json().catch(() => ({}));
    } catch (e) {
      lastErr = e;
      // try the next path
    }
  }
  throw lastErr || new Error("All endpoints failed");
}

const PRESETS = ["Sky", "Mint", "Sand", "Rose", "Slate", "Custom"];

const DEFAULTS = {
  kicker: "REPORTER’S NOTEBOOK",
  headline:
    "In war-ravaged\nnorthern Israel, farmers\nreplant apple trees\nhoping for sweeter\nyears ahead",
  byline: "BY DIANA BLETTER",
  dek:
    "With some 99,000 acres of farmland in the north destroyed during the Hezbollah conflict, growers face a bittersweet return as they judge whether to save orchards or start from scratch",
  secondaryLinkText:
    "IDF investigating after strike on Hezbollah operative also kills 4 Lebanese civilians",
  secondaryLinkHref: "#",
  contributor: "BY EMANUEL FABIAN AND AGENCIES",
  image: {
    imageUrl:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop",
    imageAlt: "Farmer standing by apple trees in northern Israel",
    imageCredit: "Photo: Unsplash",
    imageAspect: "16:9",
    imagePosition: "right",
    imageFit: "cover",
    imageFocalPoint: { x: 50, y: 50 },
  },
  layout: {
    containerMaxWidth: 1160,
    columnRatio: 0.6,
    gap: 28,
    padding: { top: 28, right: 20, bottom: 28, left: 20 },
    showFrame: true,
  },
  typography: {
    headlineFontFamily: "Playfair Display, Georgia, serif",
    headlineSize: "XL",
    headlineWeight: 700,
    bodyFontFamily:
      "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    kickerTransform: "uppercase",
    kickerTracking: 0.06,
  },
  themePreset: "Sky",
  colors: null,
};

export default function FeatureEssaySettings() {
  const [form, setForm] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr("");
      try {
        const data = await fetchJSONWithFallback(API_BASE, "GET");
        if (alive) setForm({ ...DEFAULTS, ...data });
      } catch (e) {
        // If not created yet or endpoint differs, keep defaults but surface a console hint
        console.warn("FeatureEssay load failed:", e?.message || e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const up = (k, v) => setForm((s) => ({ ...s, [k]: v }));
  const upImage = (k, v) =>
    setForm((s) => ({ ...s, image: { ...(s.image || {}), [k]: v } }));
  const upLayout = (k, v) =>
    setForm((s) => ({ ...s, layout: { ...(s.layout || {}), [k]: v } }));
  const upLayoutPad = (k, v) =>
    setForm((s) => ({
      ...s,
      layout: {
        ...(s.layout || {}),
        padding: { ...(s.layout?.padding || {}), [k]: v },
      },
    }));
  const upTypo = (k, v) =>
    setForm((s) => ({ ...s, typography: { ...(s.typography || {}), [k]: v } }));
  const upColor = (k, v) =>
    setForm((s) => ({ ...s, colors: { ...(s.colors || {}), [k]: v } }));

  const save = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setErr("");
    try {
      if (!form.headline?.trim()) throw new Error("Headline is required");
      if (!form.image?.imageUrl?.trim())
        throw new Error("Image URL is required");

      await fetchJSONWithFallback(API_BASE, "PUT", form);
      alert("Feature Essay saved!");
    } catch (e2) {
      setErr(e2?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading Feature Essay…</div>;

  return (
    <form onSubmit={save} style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0 }}>Feature Essay — Settings</h2>
        <Link to="/articles" className="tv-btn" style={{ marginLeft: "auto" }}>
          Back to Articles
        </Link>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      {err && <div style={{ color: "tomato" }}>{err}</div>}

      {/* Content */}
      <fieldset style={fs}>
        <legend style={lg}>Content</legend>

        <Label text="Kicker">
          <input
            value={form.kicker || ""}
            onChange={(e) => up("kicker", e.target.value)}
            placeholder="REPORTER’S NOTEBOOK"
          />
        </Label>

        <Label text="Headline (use line breaks for stacked lines)">
          <textarea
            rows={5}
            value={form.headline || ""}
            onChange={(e) => up("headline", e.target.value)}
            placeholder="Main headline…"
          />
        </Label>

        <Label text="Byline">
          <input
            value={form.byline || ""}
            onChange={(e) => up("byline", e.target.value)}
            placeholder="BY SOMEONE"
          />
        </Label>

        <Label text="Dek (short paragraph)">
          <textarea
            rows={3}
            value={form.dek || ""}
            onChange={(e) => up("dek", e.target.value)}
            placeholder="Short paragraph…"
          />
        </Label>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <Label text="Secondary link text">
            <input
              value={form.secondaryLinkText || ""}
              onChange={(e) => up("secondaryLinkText", e.target.value)}
              placeholder="Story link text"
            />
          </Label>
          <Label text="Secondary link href">
            <input
              value={form.secondaryLinkHref || ""}
              onChange={(e) => up("secondaryLinkHref", e.target.value)}
              placeholder="https://…"
            />
          </Label>
        </div>

        <Label text="Contributor">
          <input
            value={form.contributor || ""}
            onChange={(e) => up("contributor", e.target.value)}
            placeholder="BY SOMEONE ELSE"
          />
        </Label>
      </fieldset>

      {/* Image */}
      <fieldset style={fs}>
        <legend style={lg}>Image</legend>

        <Label text="Image URL">
          <input
            value={form.image?.imageUrl || ""}
            onChange={(e) => upImage("imageUrl", e.target.value)}
            placeholder="https://example.com/hero.jpg"
          />
        </Label>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <Label text="Alt text">
            <input
              value={form.image?.imageAlt || ""}
              onChange={(e) => upImage("imageAlt", e.target.value)}
              placeholder="Image alt"
            />
          </Label>
          <Label text="Credit">
            <input
              value={form.image?.imageCredit || ""}
              onChange={(e) => upImage("imageCredit", e.target.value)}
              placeholder="Photo: …"
            />
          </Label>
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Label text="Aspect">
            <select
              value={form.image?.imageAspect || "16:9"}
              onChange={(e) => upImage("imageAspect", e.target.value)}
            >
              <option>16:9</option>
              <option>4:3</option>
              <option>3:2</option>
              <option>1:1</option>
            </select>
          </Label>

          <Label text="Position">
            <select
              value={form.image?.imagePosition || "right"}
              onChange={(e) => upImage("imagePosition", e.target.value)}
            >
              <option>right</option>
              <option>left</option>
            </select>
          </Label>

          <Label text="Object fit">
            <select
              value={form.image?.imageFit || "cover"}
              onChange={(e) => upImage("imageFit", e.target.value)}
            >
              <option>cover</option>
              <option>contain</option>
            </select>
          </Label>
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
          <Label text="Focal X (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={form.image?.imageFocalPoint?.x ?? 50}
              onChange={(e) =>
                upImage("imageFocalPoint", {
                  ...(form.image?.imageFocalPoint || { x: 50, y: 50 }),
                  x: Number(e.target.value),
                })
              }
            />
          </Label>
          <Label text="Focal Y (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={form.image?.imageFocalPoint?.y ?? 50}
              onChange={(e) =>
                upImage("imageFocalPoint", {
                  ...(form.image?.imageFocalPoint || { x: 50, y: 50 }),
                  y: Number(e.target.value),
                })
              }
            />
          </Label>
        </div>
      </fieldset>

      {/* Layout */}
      <fieldset style={fs}>
        <legend style={lg}>Layout</legend>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Label text="Max width (px)">
            <input
              type="number"
              value={form.layout?.containerMaxWidth ?? 1160}
              onChange={(e) => upLayout("containerMaxWidth", Number(e.target.value))}
            />
          </Label>
          <Label text="Column ratio (text)">
            <input
              type="number"
              step="0.05"
              min="0.3"
              max="0.8"
              value={form.layout?.columnRatio ?? 0.6}
              onChange={(e) => upLayout("columnRatio", Number(e.target.value))}
            />
          </Label>
          <Label text="Gap (px)">
            <input
              type="number"
              value={form.layout?.gap ?? 28}
              onChange={(e) => upLayout("gap", Number(e.target.value))}
            />
          </Label>
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(4, 1fr)" }}>
          <Label text="Pad top">
            <input
              type="number"
              value={form.layout?.padding?.top ?? 28}
              onChange={(e) => upLayoutPad("top", Number(e.target.value))}
            />
          </Label>
          <Label text="Pad right">
            <input
              type="number"
              value={form.layout?.padding?.right ?? 20}
              onChange={(e) => upLayoutPad("right", Number(e.target.value))}
            />
          </Label>
          <Label text="Pad bottom">
            <input
              type="number"
              value={form.layout?.padding?.bottom ?? 28}
              onChange={(e) => upLayoutPad("bottom", Number(e.target.value))}
            />
          </Label>
          <Label text="Pad left">
            <input
              type="number"
              value={form.layout?.padding?.left ?? 20}
              onChange={(e) => upLayoutPad("left", Number(e.target.value))}
            />
          </Label>
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
          <input
            type="checkbox"
            checked={!!form.layout?.showFrame}
            onChange={(e) => upLayout("showFrame", e.target.checked)}
          />
          Show image frame
        </label>
      </fieldset>

      {/* Typography */}
      <fieldset style={fs}>
        <legend style={lg}>Typography</legend>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1.5fr 1fr 1fr" }}>
          <Label text="Headline font family">
            <input
              value={form.typography?.headlineFontFamily || ""}
              onChange={(e) => upTypo("headlineFontFamily", e.target.value)}
            />
          </Label>
          <Label text="Headline size">
            <select
              value={form.typography?.headlineSize || "XL"}
              onChange={(e) => upTypo("headlineSize", e.target.value)}
            >
              <option>L</option>
              <option>XL</option>
              <option>XXL</option>
            </select>
          </Label>
          <Label text="Headline weight">
            <input
              type="number"
              value={form.typography?.headlineWeight ?? 700}
              onChange={(e) => upTypo("headlineWeight", Number(e.target.value))}
            />
          </Label>
        </div>

        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1.5fr 1fr 1fr" }}>
          <Label text="Body font family">
            <input
              value={form.typography?.bodyFontFamily || ""}
              onChange={(e) => upTypo("bodyFontFamily", e.target.value)}
            />
          </Label>
          <Label text="Kicker transform">
            <select
              value={form.typography?.kickerTransform || "uppercase"}
              onChange={(e) => upTypo("kickerTransform", e.target.value)}
            >
              <option>uppercase</option>
              <option>capitalize</option>
              <option>none</option>
            </select>
          </Label>
          <Label text="Kicker tracking (em)">
            <input
              type="number"
              step="0.01"
              value={form.typography?.kickerTracking ?? 0.06}
              onChange={(e) => upTypo("kickerTracking", Number(e.target.value))}
            />
          </Label>
        </div>
      </fieldset>

      {/* Theme / Colors */}
      <fieldset style={fs}>
        <legend style={lg}>Theme</legend>

        <Label text="Preset">
          <select
            value={form.themePreset || "Sky"}
            onChange={(e) => up("themePreset", e.target.value)}
          >
            {PRESETS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </Label>

        {form.themePreset === "Custom" ? (
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(3, 1fr)" }}>
            <Label text="Background">
              <input
                type="color"
                value={form.colors?.bg || "#ffffff"}
                onChange={(e) => upColor("bg", e.target.value)}
              />
            </Label>
            <Label text="Text">
              <input
                type="color"
                value={form.colors?.text || "#111111"}
                onChange={(e) => upColor("text", e.target.value)}
              />
            </Label>
            <Label text="Headline">
              <input
                type="color"
                value={form.colors?.headline || "#111111"}
                onChange={(e) => upColor("headline", e.target.value)}
              />
            </Label>
            <Label text="Accent">
              <input
                type="color"
                value={form.colors?.accent || "#0E7C86"}
                onChange={(e) => upColor("accent", e.target.value)}
              />
            </Label>
            <Label text="Frame bg">
              <input
                type="color"
                value={form.colors?.frameBg || "#F5F7F9"}
                onChange={(e) => upColor("frameBg", e.target.value)}
              />
            </Label>
            <Label text="Frame border">
              <input
                type="color"
                value={form.colors?.frameBorder || "#D8E2EB"}
                onChange={(e) => upColor("frameBorder", e.target.value)}
              />
            </Label>
          </div>
        ) : null}
      </fieldset>

      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button className="tv-btn primary" disabled={saving} type="submit">
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </form>
  );
}

/* --- small helpers --- */
function Label({ text, children }) {
  return (
    <label style={{ display: "grid", gap: 6 }}>
      <span style={{ fontSize: 12, opacity: 0.8 }}>{text}</span>
      {children}
    </label>
  );
}

const fs = { border: "1px solid var(--tv-border)", borderRadius: 12, padding: 12 };
const lg = { padding: "0 8px" };
