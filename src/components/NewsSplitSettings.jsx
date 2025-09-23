// admin/src/components/NewsSplitSettings.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
// path: components → src → admin → project root → shared
import api from "../shared/api/index.js";
const { settings, articles } = api;

const defaultCustom = {
  leftImage: "",
  rightImage: "",
  title: "",
  description: "",
  byline: "",
  href: "",
  publishedAt: "",
};

const defaultPlan = {
  mode: "article",           // 'article' | 'custom'
  articleSlug: "",
  item: { ...defaultCustom } // used only when mode === 'custom'
};

export default function NewsSplitSettings() {
  const [plan, setPlan] = useState(defaultPlan);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState(null);
  const [preview, setPreview] = useState(null);
  const [previewErr, setPreviewErr] = useState(null);

  // Load setting
  useEffect(() => {
    let mounted = true;
    (async () => {
      setBusy(true); setErr(null);
      try {
        const cfg = await settings.get("news-split");
        if (mounted) {
          // tolerate old shapes {items:[...]} by picking first
          const normalized =
            cfg && "mode" in cfg
              ? cfg
              : (cfg?.items?.length
                  ? { mode: "article", articleSlug: cfg.items[0].articleSlug || "", item: cfg.items[0].item || { ...defaultCustom } }
                  : defaultPlan);
          setPlan({
            mode: normalized.mode === "custom" ? "custom" : "article",
            articleSlug: normalized.articleSlug || "",
            item: { ...defaultCustom, ...(normalized.item || {}) }
          });
        }
      } catch (e) {
        const msg = String(e?.message || "");
        // swallow 404; start from defaults
        if (msg.startsWith("HTTP 404")) {
          if (mounted) setPlan(defaultPlan);
        } else {
          if (mounted) setErr(msg);
        }
      } finally {
        if (mounted) setBusy(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const up = (patch) => setPlan((s) => ({ ...s, ...patch }));
  const upItem = (patch) => setPlan((s) => ({ ...s, item: { ...s.item, ...patch } }));

  const save = async () => {
    setSaving(true); setErr(null); setOk(false);
    try {
      await settings.put("news-split", {
        mode: plan.mode,
        articleSlug: plan.articleSlug?.trim() || "",
        item: plan.mode === "custom" ? plan.item : { ...defaultCustom },
      });
      setOk(true);
    } catch (e) {
      setErr(e?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const loadArticlePreview = async () => {
    setPreview(null); setPreviewErr(null);
    const slug = plan.articleSlug?.trim();
    if (!slug) return;
    try {
      const a = await articles.get(slug);
      setPreview({
        heroImageUrl: a.heroImageUrl || "",
        thumbnailUrl: a.thumbnailUrl || "",
        title: a.title || "",
        summary: a.summary || "",
        body: a.body || "",
        author: a.author || "",
        source: a.source || "",
        slug: a.slug || slug,
        publishedAt: a.publishedAt || a.updatedAt || a.createdAt,
      });
    } catch (e) {
      setPreviewErr(e?.message || "Failed to load article");
    }
  };

  if (busy) return <div>Loading…</div>;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h3 style={{ margin: 0 }}>News Split — Settings</h3>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="tv-btn primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <Link className="tv-btn" to="/settings/featured">Back</Link>
        </div>
      </div>

      {ok && <div className="tv-badge" style={{ background:'#E6F7ED', color:'#114B2E', width:'fit-content' }}>Saved!</div>}
      {err && <div style={{ color: "tomato" }}>{err}</div>}

      {/* Mode */}
      <div style={{ padding: 12, border: "1px solid var(--tv-border)", borderRadius: 12 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 12 }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="radio"
              name="mode"
              checked={plan.mode === "article"}
              onChange={() => up({ mode: "article" })}
            />
            Article by slug
          </label>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="radio"
              name="mode"
              checked={plan.mode === "custom"}
              onChange={() => up({ mode: "custom" })}
            />
            Custom
          </label>
        </div>

        {plan.mode === "article" ? (
          <>
            <label style={{ display: "grid", gap: 6, gridTemplateColumns: "1fr auto" }}>
              <span>Article Slug</span><span />
              <input
                value={plan.articleSlug}
                onChange={(e) => up({ articleSlug: e.target.value })}
                placeholder="e.g. rahul-gandhi-vote-theft"
                style={{ gridColumn: "1 / -1" }}
              />
            </label>
            <div style={{ marginTop: 8 }}>
              <button className="tv-btn" onClick={loadArticlePreview} disabled={!plan.articleSlug.trim()}>
                Preview
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
            <label>Title
              <input value={plan.item.title} onChange={(e) => upItem({ title: e.target.value })} />
            </label>
            <label>Byline
              <input value={plan.item.byline} onChange={(e) => upItem({ byline: e.target.value })} />
            </label>
            <label style={{ gridColumn: "1 / -1" }}>Description
              <textarea rows="3" value={plan.item.description} onChange={(e) => upItem({ description: e.target.value })} />
            </label>
            <label>Left Image (9:16)
              <input value={plan.item.leftImage} onChange={(e) => upItem({ leftImage: e.target.value })} placeholder="https://…/portrait-9x16.jpg" />
            </label>
            <label>Right Image (16:9)
              <input value={plan.item.rightImage} onChange={(e) => upItem({ rightImage: e.target.value })} placeholder="https://…/landscape-16x9.jpg" />
            </label>
            <label>Link Href
              <input value={plan.item.href} onChange={(e) => upItem({ href: e.target.value })} placeholder="/article/slug-or-external" />
            </label>
            <label>Published At
              <input
                type="datetime-local"
                value={toLocalDT(plan.item.publishedAt)}
                onChange={(e) => upItem({ publishedAt: fromLocalDT(e.target.value) })}
              />
            </label>
          </div>
        )}
      </div>

      {/* Preview block (only for article mode) */}
      {plan.mode === "article" && (preview || previewErr) && (
        <div style={{ padding: 12, border: "1px solid var(--tv-border)", borderRadius: 12 }}>
          <h4 style={{ marginTop: 0 }}>Article preview</h4>
          {previewErr && <div style={{ color: "tomato" }}>{previewErr}</div>}
          {preview && (
            <div style={{ display: "grid", gap: 8 }}>
              <div><b>{preview.title}</b></div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {preview.author || (preview.source ? `Source: ${preview.source}` : "")}
                {preview.publishedAt ? ` • ${new Date(preview.publishedAt).toLocaleString()}` : ""}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 12 }}>
                {preview.heroImageUrl && <img src={preview.heroImageUrl} alt="left" style={{ width: 240, height: 426, objectFit: 'cover', borderRadius: 8 }} />}
                {preview.thumbnailUrl && <img src={preview.thumbnailUrl} alt="right" style={{ width: 320, height: 180, objectFit: 'cover', borderRadius: 8 }} />}
              </div>
              <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{preview.summary || preview.body?.slice(0,240)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function toLocalDT(v){
  if(!v) return "";
  const d = new Date(v);
  const pad = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function fromLocalDT(v){
  return v ? new Date(v).toISOString() : "";
}
