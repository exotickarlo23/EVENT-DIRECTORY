import { getAllCategoriesFlat, getAllLocations, getAllOccasions } from "@/lib/admin-queries";
import { ListingForm } from "../listing-form";

export const dynamic = "force-dynamic";

export default async function NoviOglasPage() {
  const [categories, locations, occasions] = await Promise.all([
    getAllCategoriesFlat(),
    getAllLocations(),
    getAllOccasions(),
  ]);
  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-bold text-plum md:text-3xl">Novi oglas</h1>
      <ListingForm listing={null} categories={categories} locations={locations} occasions={occasions} />
    </div>
  );
}
