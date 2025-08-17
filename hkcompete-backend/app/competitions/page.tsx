// app/competitions/page.tsx
export const revalidate = 0; // always fresh

async function getData() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/competitions.json`, { cache: 'no-store' });
  return res.json();
}

export default async function Page() {
  const items = await getData();
  return (
    <main style={{maxWidth:900, margin:"40px auto", padding:"0 16px"}}>
      <h1>Competitions</h1>
      <ul style={{listStyle:"none", padding:0}}>
        {items.map((it:any, i:number) => (
          <li key={i} style={{margin:"16px 0", padding:"12px 16px", border:"1px solid #eee", borderRadius:8}}>
            <a href={it.link} target="_blank" rel="noreferrer"><strong>{it.title}</strong></a>
            <div>{it.category}{it.deadline ? ` • Deadline: ${it.deadline}` : ""}</div>
            {it.description && <p style={{margin:"8px 0 0"}}>{it.description}</p>}
          </li>
        ))}
      </ul>
    </main>
  );
}
