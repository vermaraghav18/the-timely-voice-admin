import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import "./../styles/header.css";

const primaryNav = [
  { key: "top", label: "Top Stories", to: "/articles" },
  { key: "india", label: "India", to: "/articles?section=india" },
  { key: "world", label: "World", to: "/articles?section=world" },
  { key: "business", label: "Business", to: "/articles?section=business" },
  { key: "tech", label: "Tech", to: "/articles?section=tech" },
  { key: "finance", label: "Finance", to: "/articles?section=finance" },
  { key: "sports", label: "Sports", to: "/articles?section=sports" },
  { key: "entertainment", label: "Entertainment", to: "/articles?section=entertainment" },
];

const subNav = [
  { key: "breaking", label: "Breaking" },
  { key: "featured", label: "Featured" },
  { key: "editorial", label: "Editorial" },
  { key: "trending", label: "Trending" },
  { key: "mostread", label: "Most Read" },
  { key: "politics", label: "Politics" },
  { key: "science", label: "Science" },
  { key: "health", label: "Health" },
  { key: "travel", label: "Travel" },
];

export default function AdminHeader({ user, onLogout }) {
  const nav = useNavigate();
  const loc = useLocation();

  const goSearch = (e) => {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q")?.trim();
    if (!q) return;
    nav(`/articles?q=${encodeURIComponent(q)}`);
  };

  return (
    <>
      {/* (optional) top ribbon to match site vibe */}
      <div className="tv-ribbon">
        <div className="tv-container">
          <span className="tv-badge" style={{ marginRight: 8 }}>Admin</span>
          <span>Configure homepage & sections exactly as they appear on The Timely Voice</span>
        </div>
      </div>

      <header className="tv-header">
        <div className="tv-container tv-header-inner">
          {/* Logo */}
          <Link to="/" className="tv-logo" aria-label="The Timely Voice Admin Home">
            <span className="tv-logo-badge">TV</span>
            <span>The Timely Voice</span>
          </Link>

          {/* Primary nav (mirrors site sections) */}
          <nav className="tv-nav" aria-label="Primary">
            {primaryNav.map(item => (
              <NavLink
                key={item.key}
                to={item.to}
                className={({ isActive }) => isActive || loc.pathname === "/" && item.key === "top" ? "active" : undefined}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Tools: search + preview + user */}
          <div className="tv-tools">
            <form className="tv-search" onSubmit={goSearch} role="search" aria-label="Search articles">
              <span className="icon">🔎</span>
              <input name="q" placeholder="Search articles…" defaultValue={new URLSearchParams(loc.search).get("q") || ""} />
            </form>
            <a className="tv-btn" href="http://localhost:5173" target="_blank" rel="noreferrer">Preview Site</a>
            <button className="tv-btn primary" onClick={onLogout}>Logout</button>
          </div>
        </div>

        {/* Section underline bar (secondary nav like the site) */}
        <div className="tv-underline">
          <div className="tv-container bar">
            {subNav.map(s => (
              <Link key={s.key} to={`/articles?tag=${s.key}`}>{s.label}</Link>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}
