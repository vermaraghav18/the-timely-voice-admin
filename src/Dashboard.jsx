// admin/src/Dashboard.jsx
import { Link, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import CategoriesPage from "./pages/Categories";

function Home() {
  return <div style={{ padding: 16 }}>Welcome to the Admin Dashboard.</div>;
}
function Articles() {
  return <div style={{ padding: 16 }}>Articles — coming soon</div>;
}

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div style={{ minHeight: "100vh", display: "grid", gridTemplateRows: "auto 1fr" }}>
      {/* Top bar */}
      <header style={{ display: "flex", gap: 16, alignItems: "center", padding: "12px 16px", borderBottom: "1px solid #eee" }}>
        <strong>TV Admin</strong>
        <nav style={{ display: "flex", gap: 12 }}>
          <Link to="">Home</Link>
          <Link to="articles">Articles</Link>
          <Link to="categories">Categories</Link>
        </nav>
        <div style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
          <span>{user?.email}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      {/* Content */}
      <main>
        <Routes>
          <Route index element={<Home />} />
          <Route path="articles" element={<Articles />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Routes>
      </main>
    </div>
  );
}
