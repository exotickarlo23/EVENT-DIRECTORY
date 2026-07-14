/**
 * Seed logika — puni bazu. Koristi je `scripts/seed.ts` (npm run db:seed)
 * te automatsko seedanje na serverless okruženju (client.ts, kada je baza
 * prazna).
 *
 * Oglasi su STVARNA poslovanja (isDemo = false) iz `real-listings.ts`
 * (generirano iz scrapanog CSV-a). Taksonomija (kategorije, prigode,
 * lokacije) i blog/cjenik ostaju definirani ovdje.
 *
 * Fotografije se NE unose seedom — dodaju se kroz admin galeriju ili CSV
 * import (stupci cover_image / gallery). Do tada se prikazuje brendirani
 * placeholder.
 */
import type { Db } from "./client";
import {
  categories,
  occasions,
  locations,
  listings,
  listingCategories,
  listingOccasions,
  blogCategories,
  blogPosts,
  pricingPlans,
} from "./schema";
import { slugify, nowIso } from "../utils";
import { sql } from "drizzle-orm";
import { REAL_LISTINGS } from "./real-listings";

// ---------------------------------------------------------------- kategorije
interface CatSeed {
  name: string;
  icon: string;
  description: string;
  children?: string[];
}

const CATEGORIES: CatSeed[] = [
  {
    name: "Napuhanci i atrakcije",
    icon: "castle",
    description: "Dvorci na napuhavanje, tobogani, poligoni i atrakcije za dječje proslave i evente.",
    children: ["Dvorci na napuhavanje", "Tobogani", "Poligoni", "Vodeni napuhanci", "Sportske atrakcije"],
  },
  {
    name: "Animatori i maskote",
    icon: "smile",
    description: "Profesionalni animatori, maskote i programi zabave za djecu svih uzrasta.",
    children: ["Dječji animatori", "Maskote", "Face painting", "Baloni i modeliranje"],
  },
  {
    name: "Rođendaonice i igraonice",
    icon: "party-popper",
    description: "Prostori specijalizirani za dječje rođendane s opremom i programom.",
  },
  {
    name: "Mađioničari i izvođači",
    icon: "wand-2",
    description: "Mađioničari, klaunovi, žongleri i drugi izvođači za nezaboravan program.",
  },
  {
    name: "Photobooth i 360° video",
    icon: "camera",
    description: "Photo kabine, mirror booth i 360° video atrakcije za svadbe i evente.",
    children: ["Klasični photobooth", "Mirror booth", "Open-air booth", "360° video booth", "Magazine box", "Audio guestbook"],
  },
  {
    name: "Glazba, bendovi i DJ-evi",
    icon: "music",
    description: "Bendovi, DJ-evi i glazbenici za vjenčanja, proslave i korporativne evente.",
    children: ["DJ", "Bendovi", "Solo izvođači", "Tamburaši"],
  },
  {
    name: "Fotografija i video",
    icon: "aperture",
    description: "Fotografi i snimatelji za vjenčanja, krštenja, rođendane i poslovne događaje.",
  },
  {
    name: "Dekoracije i baloni",
    icon: "sparkles",
    description: "Balon dekoracije, lukovi, pozadine za fotografiranje i tematski setovi.",
  },
  {
    name: "Catering i hrana",
    icon: "utensils",
    description: "Catering usluge, finger food, street food i tematski meniji za sve prigode.",
  },
  {
    name: "Torte, kolači i slastice",
    icon: "cake",
    description: "Torte po narudžbi, slatki stolovi, kolači i personalizirane slastice.",
  },
  {
    name: "Prostori za proslave",
    icon: "building-2",
    description: "Dvorane, sale, terase i prostori za privatne i poslovne proslave.",
  },
  {
    name: "Najam event-opreme",
    icon: "package",
    description: "Najam opreme za događaje — od posuđa do profesionalne tehnike.",
  },
  {
    name: "Šatori, stolovi i stolice",
    icon: "tent",
    description: "Najam šatora, stolova, stolica i pratećeg mobilijara za proslave na otvorenom.",
  },
  {
    name: "Rasvjeta, razglas i pozornice",
    icon: "lightbulb",
    description: "Profesionalna rasvjeta, ozvučenje i pozornice za evente svih veličina.",
  },
  {
    name: "Organizacija događaja",
    icon: "clipboard-list",
    description: "Event agencije i organizatori koji vode događaj od ideje do izvedbe.",
  },
  {
    name: "Pokloni i personalizirani proizvodi",
    icon: "gift",
    description: "Personalizirani pokloni, zahvalnice i suveniri za goste.",
  },
  {
    name: "Cvijeće i cvjetne dekoracije",
    icon: "flower-2",
    description: "Buketi, cvjetni aranžmani i dekoracije za vjenčanja i svečanosti.",
  },
  {
    name: "Prijevoz i posebna vozila",
    icon: "car",
    description: "Oldtimeri, limuzine, autobusi i posebna vozila za posebne prilike.",
  },
];

const OCCASIONS = [
  "Dječji rođendan",
  "Rođendan za odrasle",
  "Vjenčanje",
  "Krštenje",
  "Pričest",
  "Krizma",
  "Zaruke",
  "Godišnjica",
  "Baby shower",
  "Poslovni event",
  "Team building",
  "Promocija proizvoda",
  "Otvorenje",
  "Festival",
  "Maturalna večer",
  "Privatna zabava",
  "Koncert",
];

const LOCATIONS: { name: string; county: string }[] = [
  { name: "Zagreb", county: "Grad Zagreb" },
  { name: "Split", county: "Splitsko-dalmatinska županija" },
  { name: "Rijeka", county: "Primorsko-goranska županija" },
  { name: "Osijek", county: "Osječko-baranjska županija" },
  { name: "Zadar", county: "Zadarska županija" },
  { name: "Varaždin", county: "Varaždinska županija" },
  { name: "Pula", county: "Istarska županija" },
  { name: "Karlovac", county: "Karlovačka županija" },
  { name: "Velika Gorica", county: "Zagrebačka županija" },
  { name: "Samobor", county: "Zagrebačka županija" },
  { name: "Dubrovnik", county: "Dubrovačko-neretvanska županija" },
  { name: "Slavonski Brod", county: "Brodsko-posavska županija" },
  { name: "Bjelovar", county: "Bjelovarsko-bilogorska županija" },
  { name: "Hvar", county: "Splitsko-dalmatinska županija" },
  { name: "Biograd", county: "Zadarska županija" },
];

export function seedDatabase(db: Db): void {
  const now = nowIso();
  const existing = db.get<{ c: number }>(sql`SELECT COUNT(*) c FROM categories`);
  if (existing && existing.c > 0) {
    console.log("Baza već sadrži podatke — brišem i punim ponovno (seed je idempotentan).");
    for (const table of [
      "listing_categories", "listing_occasions", "service_areas", "media", "packages",
      "listing_features", "features", "reviews", "listings", "providers", "categories",
      "occasions", "locations", "blog_posts", "blog_categories", "pricing_plans",
    ]) {
      db.run(sql.raw(`DELETE FROM ${table}`));
    }
  }

  // Kategorije + podkategorije
  const catIds = new Map<string, number>();
  CATEGORIES.forEach((cat, i) => {
    const inserted = db
      .insert(categories)
      .values({ slug: slugify(cat.name), name: cat.name, icon: cat.icon, description: cat.description, sortOrder: i })
      .returning({ id: categories.id })
      .get();
    catIds.set(cat.name, inserted.id);
    (cat.children ?? []).forEach((child, j) => {
      const ins = db
        .insert(categories)
        .values({ slug: slugify(child), name: child, parentId: inserted.id, sortOrder: j })
        .returning({ id: categories.id })
        .get();
      catIds.set(child, ins.id);
    });
  });

  const occIds = new Map<string, number>();
  OCCASIONS.forEach((name, i) => {
    const ins = db
      .insert(occasions)
      .values({ slug: slugify(name), name, sortOrder: i })
      .returning({ id: occasions.id })
      .get();
    occIds.set(name, ins.id);
  });

  const locIds = new Map<string, number>();
  LOCATIONS.forEach((loc, i) => {
    const ins = db
      .insert(locations)
      .values({ slug: slugify(loc.name), name: loc.name, county: loc.county, sortOrder: i })
      .returning({ id: locations.id })
      .get();
    locIds.set(loc.name, ins.id);
  });

  // ------------------------------------------------------------- oglasi (stvarni podaci)
  // Slug-indeksirane mape taksonomije za mapiranje iz CSV-a.
  const catBySlug = new Map<string, number>();
  for (const [name, id] of catIds) catBySlug.set(slugify(name), id);
  const occBySlug = new Map<string, number>();
  for (const [name, id] of occIds) occBySlug.set(slugify(name), id);
  const locBySlug = new Map<string, number>();
  for (const [name, id] of locIds) locBySlug.set(slugify(name), id);

  // CSV vokabular prigoda → postojeće prigode (bez stvaranja duplikata).
  const OCCASION_REMAP: Record<string, string> = {
    "korporativni-event": "poslovni-event",
    krstitke: "krstenje",
    party: "privatna-zabava",
    "djeciji-rodendan": "djecji-rodendan",
    obljetnica: "godisnjica",
    maturalna: "maturalna-vecer",
    rodendan: "rodendan-za-odrasle",
    "prva-pricest": "pricest",
  };

  const usedSlugs = new Set<string>();
  let seededListings = 0;
  REAL_LISTINGS.forEach((item, i) => {
    const catId = catBySlug.get(item.categorySlug);
    const locId = locBySlug.get(item.locationSlug);
    if (!catId || !locId) {
      console.warn(
        `[seed] preskačem "${item.name}" — nepoznata kategorija/lokacija (${item.categorySlug} / ${item.locationSlug})`
      );
      return;
    }
    let slug = slugify(item.name);
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${slugify(item.name)}-${n++}`;
    usedSlugs.add(slug);

    const priceFrom = item.priceFrom ?? null;
    const priceModel =
      item.priceModel === "from" ||
      item.priceModel === "range" ||
      item.priceModel === "fixed" ||
      item.priceModel === "on_request"
        ? item.priceModel
        : priceFrom != null
          ? "from"
          : "on_request";
    // Deterministički razmaknuti publishedAt za stabilan poredak.
    const publishedAt = new Date(Date.now() - (i + 1) * 3_600_000).toISOString();

    const listing = db
      .insert(listings)
      .values({
        slug,
        name: item.name,
        businessName: item.businessName || item.name,
        status: "published",
        tier: "free",
        claimStatus: "unclaimed",
        shortDescription: item.short.slice(0, 300),
        description: item.description,
        primaryCategoryId: catId,
        baseLocationId: locId,
        address: item.address || null,
        priceFrom,
        priceTo: item.priceTo ?? null,
        priceModel,
        phone: item.phone || null,
        whatsapp: item.whatsapp || null,
        email: item.email || null,
        website: item.website || null,
        instagram: item.instagram || null,
        facebook: item.facebook || null,
        servesAtClientLocation: true,
        publishedAt,
        dataSource: item.dataSource || "web",
        isDemo: false,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: listings.id })
      .get();

    db.insert(listingCategories).values({ listingId: listing.id, categoryId: catId }).run();
    const seenOcc = new Set<string>();
    for (const rawOcc of item.occasions) {
      const occSlug = OCCASION_REMAP[rawOcc] ?? rawOcc;
      if (seenOcc.has(occSlug)) continue;
      seenOcc.add(occSlug);
      const occId = occBySlug.get(occSlug);
      if (occId) db.insert(listingOccasions).values({ listingId: listing.id, occasionId: occId }).run();
    }
    seededListings++;
  });
  console.log(`[seed] uneseno stvarnih oglasa: ${seededListings}`);

  // ------------------------------------------------------------- blog
  const BLOG_CATS = [
    "Organizacija događaja",
    "Dječji rođendani",
    "Vjenčanja",
    "Cijene",
    "Ideje i inspiracija",
    "Prostori",
    "Hrana i catering",
    "Zabava",
    "Event-oprema",
  ];
  const blogCatIds = new Map<string, number>();
  BLOG_CATS.forEach((name, i) => {
    const ins = db
      .insert(blogCategories)
      .values({ slug: slugify(name), name, sortOrder: i })
      .returning({ id: blogCategories.id })
      .get();
    blogCatIds.set(name, ins.id);
  });

  const POSTS = [
    {
      title: "Koliko košta dječji rođendan u Hrvatskoj?",
      category: "Cijene",
      excerpt:
        "Realan pregled troškova dječjeg rođendana: rođendaonica, animator, napuhanac, torta i dekoracije — s okvirnim rasponima cijena i savjetima gdje uštedjeti.",
      related: ["rodendaonice-i-igraonice", "animatori-i-maskote", "napuhanci-i-atrakcije"],
      content: `## Od čega se sastoji trošak rođendana

Trošak dječjeg rođendana najviše ovisi o tri odluke: **gdje se slavi**, **koliko djece dolazi** i **koliko programa želiš**. U nastavku su okvirni rasponi na koje se možeš osloniti u planiranju. Važno: sve navedene brojke su **procjene** temeljene na javno dostupnim cjenicima i ponudama — stvarne cijene provjeri izravno kod ponuđača.

## Rođendaonica ili proslava kod kuće

- **Rođendaonica / igraonica**: najčešće se plaća termin od 2 sata. Okvirno 130–280 € ovisno o gradu, broju djece i uključenom programu.
- **Proslava kod kuće ili u dvorištu**: prostor je besplatan, ali računaj na animatora, hranu i eventualno najam napuhanca.

## Animator

Dvosatna animacija s igrama i modeliranjem balona okvirno stoji **80–150 €**, a veći paketi s face paintingom i dvije animatorice **150–250 €**. Cijena raste ako je lokacija izvan grada animatora.

## Napuhanac

Najam manjeg dvorca za pola dana okvirno je **100–180 €**, veće kombinacije s toboganom **200–350 €**. U cijenu obično ulazi dostava i postavljanje unutar grada.

## Torta i hrana

- Torta po narudžbi: okvirno **40–80 €** za manju tematsku tortu.
- Grickalice i sokovi za 15-ero djece: **30–60 €**.
- Pizza ili sendviči: **3–6 € po djetetu**.

## Ukupno — tri tipična scenarija

1. **Skromno kod kuće** (torta, grickalice, vlastiti program): 80–150 €
2. **Kod kuće s animatorom ili napuhancem**: 200–400 €
3. **Rođendaonica s programom + torta**: 250–450 €

## Kako uštedjeti

- Rezerviraj termin radnim danom ili u ranijem terminu — neki prostori tada daju nižu cijenu.
- Kombiniraj: animator na 2 sata umjesto 3 često je dovoljan.
- Pitaj za pakete — ponuđači često nude kombinacije (napuhanac + maskota) povoljnije od pojedinačnog najma.`,
      faq: [
        { q: "Koliko unaprijed rezervirati rođendaonicu?", a: "Za termine vikendom preporučujemo 3–5 tjedana unaprijed, posebno u proljeće i jesen." },
        { q: "Je li jeftinije slaviti kod kuće?", a: "Najčešće da, ali računaj na vlastiti trud oko pripreme i čišćenja. S animatorom i napuhancem razlika se smanjuje." },
        { q: "Što je najveći pojedinačni trošak?", a: "Obično termin u rođendaonici ili veći napuhanac; kod proslava kod kuće to je animator." },
      ],
    },
    {
      title: "Checklist za organizaciju događaja: od ideje do zadnjeg gosta",
      category: "Organizacija događaja",
      excerpt:
        "Praktičan popis koraka za organizaciju bilo koje proslave — s vremenskim okvirom što rezervirati prvo i što možeš ostaviti za zadnji tjedan.",
      related: ["organizacija-dogadaja", "prostori-za-proslave", "catering-i-hrana"],
      content: `## 6–8 tjedana prije

- Odredi **datum, broj gostiju i okvirni budžet** — sve ostale odluke ovise o ovome.
- Rezerviraj **prostor** ako ne slaviš kod kuće. Dobri termini vikendom odlaze prvi.
- Za vjenčanja i veće evente: rezerviraj **fotografa i glazbu** — najtraženiji ponuđači pune kalendar mjesecima unaprijed.

## 4–6 tjedana prije

- Dogovori **catering ili meni** i provjeri opcije za goste s posebnom prehranom.
- Rezerviraj **zabavni sadržaj**: animatora, photobooth, mađioničara ili DJ-a.
- Naruči **tortu** — kvalitetne slastičarnice traže narudžbu najmanje tjedan dana unaprijed, a za svadbene torte i više.

## 2–3 tjedna prije

- Pošalji **pozivnice** i traži potvrde dolaska.
- Dogovori **dekoracije** — balon dekorateri i cvjećari trebaju točnu temu i boje.
- Provjeri treba li ti **najam opreme**: stolovi, stolice, posuđe, grijalice za terasu.

## Zadnji tjedan

- Potvrdi termine sa svim ponuđačima — kratka poruka s adresom i satnicom.
- Napravi **satnicu dana**: kad što stiže, tko postavlja, tko preuzima.
- Pripremi **plan B za loše vrijeme** ako je događaj na otvorenom.

## Na dan događaja

- Odredi jednu osobu (koja nije slavljenik!) za koordinaciju s ponuđačima.
- Drži kontakte svih ponuđača na jednom mjestu.
- Uživaj — za sve ostalo si već pobrinuo/la ranije.`,
      faq: [
        { q: "Što rezervirati prvo?", a: "Prostor, fotografa i glazbu — to su usluge s najduže popunjenim kalendarima." },
        { q: "Trebam li organizatora događaja?", a: "Za veća vjenčanja i poslovne evente organizator štedi vrijeme i živce; za manje proslave dovoljan je dobar checklist." },
      ],
    },
    {
      title: "Napuhanac ili animator: što odabrati prema dobi djeteta?",
      category: "Dječji rođendani",
      excerpt:
        "Napuhanac i animator rješavaju različite stvari. Vodič po dobi djeteta: što djeca stvarno koriste, gdje se isplati kombinacija i na što paziti kod sigurnosti.",
      related: ["napuhanci-i-atrakcije", "animatori-i-maskote"],
      content: `## Kratki odgovor

- **2–4 godine**: animator (kraći program) ili manji napuhanac uz stalni nadzor. Maskota može biti hit ili suze — ovisi o djetetu.
- **4–7 godina**: zlatna dob za **kombinaciju** — napuhanac drži energiju, animator drži strukturu.
- **7–10 godina**: napuhanac s toboganom ili sportske atrakcije; animacija radi samo ako je natjecateljska.
- **10+**: umjesto klasične animacije razmisli o photoboothu, turniru u igrama ili tematskoj radionici.

## Što napuhanac rješava, a što ne

Napuhanac je **magnet za energiju**: djeca se sama zabavljaju, a odrasli imaju mira. Ali nema strukturu — bez usmjeravanja starija djeca znaju preuzeti prostor, a mlađa se povući. Za mješovite dobne skupine dogovori s ponuđačem **termine korištenja po grupama**.

### Sigurnost — pitanja za ponuđača

- Je li napuhanac certificiran i osiguran?
- Tko je odgovoran za nadzor — dolazi li dežurna osoba?
- Što se događa kod jakog vjetra ili kiše?

## Što animator rješava

Animator daje **strukturu**: uvodne igre, zajedničke aktivnosti, smirivanje pred tortu. Dobar animator čita grupu i mijenja program u hodu. Pitaj unaprijed koliko djece program podnosi — za više od 15-ero djece tražite dvije animatorice.

## Kombinacija — kada se isplati

Ako je proslava duža od 3 sata ili ima više od 12-ero djece, kombinacija napuhanca i animatora obično daje najmirniju proslavu: animator vodi program u blokovima, a napuhanac popunjava slobodnu igru. Mnogi ponuđači nude kombinirane pakete — pitaj za cijenu paketa umjesto zbrajanja pojedinačnih usluga.`,
      faq: [
        { q: "Koliko traje tipičan program animacije?", a: "Najčešće 2 sata; za mlađu djecu (2–4 godine) dovoljan je i sat i pol." },
        { q: "Može li napuhanac stati u stan?", a: "Ne — napuhanci traže dvorište, terasu ili dvoranu. Za stan biraj animatora ili manju radionicu." },
        { q: "Što ako je najavljena kiša?", a: "Dogovori unaprijed pravila otkazivanja; većina ponuđača nudi promjenu termina bez naknade uz ranu najavu." },
      ],
    },
  ];

  POSTS.forEach((post, i) => {
    const publishedAt = new Date(Date.now() - (i + 5) * 86_400_000).toISOString();
    db.insert(blogPosts)
      .values({
        slug: slugify(post.title),
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        categoryId: blogCatIds.get(post.category) ?? null,
        seoTitle: `${post.title} | slavimo.hr vodiči`,
        seoDescription: post.excerpt,
        faq: JSON.stringify(post.faq),
        relatedCategorySlugs: JSON.stringify(post.related),
        status: "published",
        publishedAt,
        updatedAt: publishedAt,
      })
      .run();
  });

  // ------------------------------------------------------------- cjenik
  db.insert(pricingPlans)
    .values([
      {
        slug: "osnovni",
        name: "Osnovni profil",
        price: 0,
        period: "zauvijek",
        description: "Besplatan profil za svako event-poslovanje.",
        featuresJson: JSON.stringify([
          "Naziv i osnovni opis",
          "Jedna naslovna fotografija",
          "Kategorija i lokacija",
          "Osnovni kontaktni podaci",
          "Pojavljivanje u rezultatima pretrage",
        ]),
        ctaLabel: "Dodaj besplatni profil",
        sortOrder: 1,
      },
      {
        slug: "istaknuti",
        name: "Istaknuti profil",
        price: 60,
        period: "godišnje",
        description: "Nadogradnja za ponuđače koji žele maksimalnu vidljivost.",
        featuresJson: JSON.stringify([
          "Prioritetna pozicija u rezultatima",
          "Značka „Istaknuto”",
          "Veća galerija fotografija i video",
          "Paketi i detaljne cijene",
          "Izravni CTA gumbi (telefon, WhatsApp, e-mail)",
          "Pojavljivanje na naslovnici",
          "Objava (post) i story na našem Instagramu",
          "Mjesečna statistika pregleda i kontakata",
        ]),
        ctaLabel: "Zatraži istaknuti profil",
        highlighted: true,
        sortOrder: 2,
      },
    ])
    .run();

  const counts = {
    kategorije: db.get<{ c: number }>(sql`SELECT COUNT(*) c FROM categories`)?.c,
    lokacije: db.get<{ c: number }>(sql`SELECT COUNT(*) c FROM locations`)?.c,
    prigode: db.get<{ c: number }>(sql`SELECT COUNT(*) c FROM occasions`)?.c,
    oglasi: db.get<{ c: number }>(sql`SELECT COUNT(*) c FROM listings`)?.c,
    clanci: db.get<{ c: number }>(sql`SELECT COUNT(*) c FROM blog_posts`)?.c,
  };
  console.log("Seed dovršen:", counts);
}
