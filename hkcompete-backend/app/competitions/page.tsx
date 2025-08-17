import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic"; // ensure it re-renders and doesn't get statically baked

async function getData() {
  const file = await fs.readFile(
    path.join(process.cwd(), "public", "competitions.json"),
    "utf8"
  );
  return JSON.parse(file);
}

export default async function Page() {
  const items = await getData();

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
      <h1>Competitions</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {items.map((it: any, i: number) => (
          <li
            key={i}
            style={{
              margin: "16px 0",
              padding: "12px 16px",
              border: "1px solid #eee",
              borderRadius: 8,
            }}
          >
            <a href={it.link} target="_blank" rel="noreferrer">
              <strong>{it.title}</strong>
            </a>
            <div>
              {it.category}
              {it.deadline ? ` • Deadline: ${it.deadline}` : ""}
            </div>
            {it.description && <p style={{ margin: "8px 0 0" }}>{it.description}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
