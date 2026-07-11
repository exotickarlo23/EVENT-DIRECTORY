import Link from "next/link";
import { getAllPosts } from "@/lib/admin-queries";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function AdminClanciPage() {
  const posts = getAllPosts();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-2 font-display text-2xl font-bold text-plum md:text-3xl">Članci / vodiči</h1>
      <p className="mb-6 text-sm text-muted">
        Pregled članaka (uređivanje kroz sučelje stiže u fazi 2 — sadržaj se za sada dodaje kroz
        seed ili izravno u bazi, tablica blog_posts).
      </p>
      <div className="rounded-card border border-line bg-white shadow-card">
        <ul className="divide-y divide-line">
          {posts.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
              <div>
                <Link href={`/vodici/${p.slug}`} target="_blank" className="font-bold text-plum hover:text-coral">
                  {p.title}
                </Link>
                <p className="text-sm text-muted">
                  /vodici/{p.slug} · {formatDate(p.updatedAt)}
                </p>
              </div>
              <Badge variant={p.status === "published" ? "success" : "neutral"}>
                {p.status === "published" ? "Objavljeno" : "Draft"}
              </Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
