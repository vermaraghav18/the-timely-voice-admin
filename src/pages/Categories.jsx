import { useEffect, useState } from "react";
import { listCategories } from "../api";

export default function Categories() {
  const [items, setItems] = useState([]);     // safe default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listCategories()
      .then((data) => {
        if (!alive) return;
        // backend returns { items: [...] } – handle both just in case
        const arr = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        setItems(arr);
        setLoading(false);
      })
      .catch((e) => {
        if (!alive) return;
        setError(e?.message || "Failed to load categories");
        setLoading(false);
      });
    return () => { alive = false; };
  }, []);

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (error)   return <div style={{ padding: 16, color: "crimson" }}>Error: {error}</div>;

  return (
    <div style={{ padding: 16 }}>
      <h2>Categories</h2>
      {!items.length ? (
        <div>No categories yet.</div>
      ) : (
        <table border="1" cellPadding="8" cellSpacing="0">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Slug</th>
              <th>Sort</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.slug}</td>
                <td>{c.sortIndex}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
