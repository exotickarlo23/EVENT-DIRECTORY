import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAdminListingById,
  getAllCategoriesFlat,
  getAllLocations,
  getAllOccasions,
} from "@/lib/admin-queries";
import { db } from "@/lib/db/client";
import { leads } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ListingForm } from "../listing-form";
import { Badge } from "@/components/ui";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UrediOglasPage({ params }: Props) {
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isInteger(listingId)) notFound();
  const listing = await getAdminListingById(listingId);
  if (!listing) notFound();

  const [categories, locations, occasions] = await Promise.all([
    getAllCategoriesFlat(),
    getAllLocations(),
    getAllOccasions(),
  ]);

  const listingLeads = await db
    .select()
    .from(leads)
    .where(eq(leads.listingId, listingId))
    .orderBy(desc(leads.createdAt));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-plum md:text-3xl">{listing.name}</h1>
        {listing.status === "published" ? (
          <Link href={`/ponudaci/${listing.slug}`} target="_blank" className="text-sm font-bold text-teal underline">
            Pogledaj javno →
          </Link>
        ) : null}
        {listing.isDemo ? <Badge variant="demo">Demo</Badge> : null}
      </div>

      <ListingForm
        listing={listing}
        categories={categories}
        locations={locations}
        occasions={occasions}
        selected={{
          categoryIds: listing.categoryIds,
          occasionIds: listing.occasionIds,
          serviceAreaIds: listing.serviceAreaIds,
        }}
      />

      <section className="mt-10 max-w-4xl">
        <h2 className="mb-3 font-display text-xl font-semibold text-plum">
          Upiti za ovaj oglas ({listingLeads.length})
        </h2>
        {listingLeads.length > 0 ? (
          <div className="space-y-3">
            {listingLeads.map((lead) => (
              <div key={lead.id} className="rounded-card border border-line bg-white p-4 shadow-card">
                <p className="font-bold text-plum">
                  {lead.name} · <a href={`mailto:${lead.email}`} className="text-teal underline">{lead.email}</a>
                  {lead.phone ? ` · ${lead.phone}` : ""}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {[lead.eventType, lead.eventDate, lead.eventLocation].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-2 text-sm text-ink">{lead.message}</p>
                <p className="mt-2 text-xs text-muted">{formatDate(lead.createdAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">Još nema upita za ovaj oglas.</p>
        )}
      </section>
    </div>
  );
}
