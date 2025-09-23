import { NavLink, Link, useLocation } from "react-router-dom";
import "../styles/site-header.css";

function formatToday() {
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date());
  } catch {
    // very old browsers fallback
    const d = new Date();
    return d.toDateString();
  }
}

export default function SiteLikeHeader({ user, onLogout, config }) {
  const loc = useLocation();

  const cfg = config || {
    siteName: "THE TIMELY VOICE",
    languages: ["ENGLISH","हिंदी","বাংলা","मराठी","తెలుగు","தமிழ்"],
    nav: [
      { key: "top", label: "TOP NEWS", to: "/articles" },
      { key: "india", label: "INDIA", to: "/articles?section=india" },
      { key: "world", label: "WORLD", to: "/articles?section=world" },
      { key: "finance", label: "FINANCE", to: "/articles?section=finance" },
      { key: "health", label: "HEALTH & LIFESTYLE", to: "/articles?section=health" },
      { key: "tech", label: "TECH", to: "/articles?section=tech" },
      { key: "entertainment", label: "ENTERTAINMENT", to: "/articles?section=entertainment" },
      { key: "business", label: "BUSINESS", to: "/articles?section=business" },
      { key: "sports", label: "SPORTS", to: "/articles?section=sports" },
      { key: "women", label: "WOMEN MAGAZINE", to: "/articles?section=women" },
    ],
    ctas: [
      { label: "GET THE DAILY UPDATES", kind: "outline", href: "#" },
      { label: "LOGOUT", kind: "green", onClick: onLogout },
    ],
    liveText: "LIVE",
    liveTicker: "Weather: Heavy rain alert for Mumbai, Pune",
  };

  const isActivePath = (to) => {
    const path = to.split("?")[0];
    return loc.pathname === path;
  };

  return (
    <>
      {/* top bar (date, follow icons, languages) */}
      <div className="tv-topbar">
        <div className="wrap">
          <div className="left">
            <span className="tv-chip-date">{formatToday()}</span>
            <span>Follow us:</span>
            <span>𝕏</span><span>📸</span><span>📣</span><span>▶️</span>
            <span style={{ marginLeft: 8, opacity: .85 }}>BTC $59,200 ▲1.3%</span>
            <span>ETH $2,000</span>
          </div>
          <div className="right" style={{ gap: 16 }}>
            <div style={{ display: "flex", gap: 8 }}>
              {cfg.languages.map(l => <span key={l} style={{ opacity: .9 }}>{l}</span>)}
            </div>
          </div>
        </div>
      </div>

      {/* main header with centered title & CTAs */}
      <div className="tv-mainbar">
        <div className="wrap">
          <div />
          <div className="tv-title">{cfg.siteName}</div>
          <div className="tv-cta">
            {cfg.ctas.map((b, i) => (
              b.onClick ? (
                <button key={i} className="tv-btn-green" onClick={b.onClick}>{b.label}</button>
              ) : (
                <a key={i} className={b.kind === "outline" ? "tv-btn-outline" : "tv-btn-green"} href={b.href} target="_blank" rel="noreferrer">{b.label}</a>
              )
            ))}
          </div>
        </div>
      </div>

      {/* pill nav */}
      <div className="tv-pillnav">
        <div className="wrap">
          {cfg.nav.map(item => (
            <NavLink
              key={item.key}
              to={item.to}
              className={({ isActive }) => (isActive || isActivePath(item.to)) ? "active" : undefined}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </div>

      {/* live ticker */}
      <div className="tv-live">
        <div className="wrap">
          <span className="badge">{cfg.liveText}</span>
          <span>{cfg.liveTicker}</span>
        </div>
      </div>
    </>
  );
}
