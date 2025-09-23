import { NavLink, Link, useLocation } from "react-router-dom";
import "./site-header.css";

export default function SiteHeader({ config }) {
  const { pathname, search } = useLocation();
  const cfg = config || {};
  const siteName = cfg.siteName || "THE TIMELY VOICE";
  const languages = cfg.languages || ["ENGLISH"];
  const nav = cfg.nav || [
    { key: "top", label: "TOP NEWS", to: "/articles" },
    { key: "india", label: "INDIA", to: "/articles?section=india" },
    { key: "world", label: "WORLD", to: "/articles?section=world" },
  ];
  const ctas = cfg.ctas || [{ label: "SUBSCRIBE NOW", href: "#", kind: "outline" }];
  const liveText = cfg.liveText ?? "LIVE";
  const liveTicker = cfg.liveTicker ?? "";

  const isActive = (to) => {
    // simple match helper for highlighting current section
    const full = pathname + (search || "");
    return full.startsWith(to);
  };

  return (
    <header className="tv-site-header">
      <div className="tv-topstrip">
        <div className="tv-container tv-topstrip-inner">
          <div className="tv-topstrip-left">
            <span className="tv-date-pill">{new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
            <span className="tv-follow-us">Follow us:</span>
            <span className="tv-icons">𝕏 𝔽 ⓘ ▶</span>
            <span className="tv-tickers">BTC $59,200 ▲1.3% &nbsp; ETH $2,000</span>
          </div>
          <div className="tv-lang">
            {languages.map((l, i) => (
              <span key={i}>{l}{i < languages.length - 1 ? "  " : ""}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="tv-masthead">
        <div className="tv-container tv-masthead-inner">
          <h1 className="tv-sitename">{siteName}</h1>
          {ctas?.[0] && (
            <a className="tv-cta" href={ctas[0].href} target="_blank" rel="noreferrer">
              {ctas[0].label}
            </a>
          )}
        </div>
      </div>

      <nav className="tv-mainnav">
        <div className="tv-container tv-mainnav-inner">
          {nav.map((n) => (
            <NavLink
              key={n.key || n.to}
              to={n.to}
              className={({ isActive: r }) => `tv-pill ${r || isActive(n.to) ? "active" : ""}`}
            >
              {n.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {liveTicker && (
        <div className="tv-livebar">
          <div className="tv-container tv-livebar-inner">
            <span className="tv-live-tag">{liveText || "LIVE"}</span>
            <span className="tv-live-text">{liveTicker}</span>
          </div>
        </div>
      )}
    </header>
  );
}
