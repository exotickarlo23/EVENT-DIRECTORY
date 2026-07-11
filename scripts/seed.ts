/**
 * Seed skripta — puni bazu demo podacima za razvoj i pregled.
 * Pokretanje: npm run db:seed  (ili db:reset za čistu bazu)
 *
 * Sva demo poslovanja su IZMIŠLJENA (isDemo = true). Prije produkcije
 * ukloniti demo oglase ili pokrenuti čistu bazu bez seeda oglasa.
 */
import { db } from "../src/lib/db/client";
import {
  categories,
  occasions,
  locations,
  listings,
  listingCategories,
  listingOccasions,
  serviceAreas,
  packages,
  blogCategories,
  blogPosts,
  pricingPlans,
  providers,
} from "../src/lib/db/schema";
import { slugify, nowIso } from "../src/lib/utils";
import { sql } from "drizzle-orm";

const now = nowIso();

function daysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

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
];

async function main() {
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

  // ------------------------------------------------------------- oglasi
  interface ListingSeed {
    name: string;
    category: string;
    subcategories?: string[];
    location: string;
    serviceAreas?: string[];
    occasions: string[];
    short: string;
    description: string;
    priceModel: "from" | "range" | "fixed" | "on_request";
    priceFrom?: number;
    priceTo?: number;
    tier?: "featured";
    featuredWeight?: number;
    featuredUntil?: string;
    claimed?: boolean;
    atClientLocation?: boolean;
    packages?: { name: string; priceFrom: number; includes: string[] }[];
    phone?: boolean;
    whatsapp?: boolean;
  }

  const LISTINGS: ListingSeed[] = [
    {
      name: "Skočko napuhanci",
      category: "Napuhanci i atrakcije",
      subcategories: ["Dvorci na napuhavanje", "Tobogani"],
      location: "Zagreb",
      serviceAreas: ["Velika Gorica", "Samobor", "Karlovac"],
      occasions: ["Dječji rođendan", "Privatna zabava", "Festival"],
      short: "Najam dvoraca na napuhavanje i tobogana s dostavom i postavljanjem po Zagrebu i okolici.",
      description:
        "Skočko napuhanci nude najam certificiranih dvoraca na napuhavanje, tobogana i poligona za dječje rođendane, proslave i javne evente. U cijenu je uključena dostava, postavljanje i preuzimanje unutar Zagreba. Svi napuhanci se redovito čiste i dezinficiraju, a uz svaki najam dobivate upute za sigurno korištenje. Dostupni smo i za višednevne najmove za festivale i općinske manifestacije.",
      priceModel: "from",
      priceFrom: 120,
      tier: "featured",
      featuredWeight: 10,
      featuredUntil: daysFromNow(60),
      claimed: true,
      atClientLocation: true,
      phone: true,
      whatsapp: true,
      packages: [
        { name: "Mali dvorac (do 3 h)", priceFrom: 120, includes: ["Dostava u Zagrebu", "Postavljanje", "Podloga"] },
        { name: "Veliki dvorac s toboganom (cijeli dan)", priceFrom: 220, includes: ["Dostava u Zagrebu", "Postavljanje", "Dežurna osoba po dogovoru"] },
      ],
    },
    {
      name: "Balonijada dekoracije",
      category: "Dekoracije i baloni",
      location: "Zagreb",
      serviceAreas: ["Samobor", "Velika Gorica"],
      occasions: ["Dječji rođendan", "Rođendan za odrasle", "Krštenje", "Baby shower", "Otvorenje"],
      short: "Balon lukovi, tematske pozadine i personalizirane dekoracije za sve prigode.",
      description:
        "Izrađujemo balon dekoracije po mjeri: lukove, girlande, brojke, tematske kutke za fotografiranje i personalizirane natpise. Radimo s kvalitetnim balonima dužeg trajanja, a dekoraciju postavljamo na lokaciji ili je pripremamo za preuzimanje. Za veće evente nudimo i kombinacije s cvjetnim aranžmanima i pozadinama.",
      priceModel: "from",
      priceFrom: 80,
      tier: "featured",
      featuredWeight: 8,
      featuredUntil: daysFromNow(45),
      claimed: true,
      atClientLocation: true,
      phone: true,
      whatsapp: true,
    },
    {
      name: "Čarobni Leo — mađioničar",
      category: "Mađioničari i izvođači",
      location: "Zagreb",
      serviceAreas: ["Varaždin", "Karlovac", "Rijeka"],
      occasions: ["Dječji rođendan", "Poslovni event", "Privatna zabava", "Vjenčanje"],
      short: "Mađioničarski show za djecu i odrasle — od rođendana do korporativnih evenata.",
      description:
        "Interaktivni mađioničarski show prilagođen publici: dječji program s puno sudjelovanja, obiteljski show ili elegantna close-up magija za vjenčanja i poslovne evente. Nastupam po cijeloj sjeverozapadnoj Hrvatskoj, a termin je najbolje rezervirati nekoliko tjedana unaprijed.",
      priceModel: "range",
      priceFrom: 150,
      priceTo: 350,
      claimed: true,
      atClientLocation: true,
      phone: true,
    },
    {
      name: "Zvjezdice animacije",
      category: "Animatori i maskote",
      subcategories: ["Dječji animatori", "Face painting"],
      location: "Zagreb",
      serviceAreas: ["Velika Gorica", "Samobor"],
      occasions: ["Dječji rođendan", "Krštenje", "Pričest", "Privatna zabava"],
      short: "Tim animatorica s programima igara, face paintinga i modeliranja balona.",
      description:
        "Zvjezdice animacije vode dječji program na rođendanima i obiteljskim proslavama: timske igre, ples, face painting, modeliranje balona i mini disco. Program prilagođavamo dobi djece i prostoru — od stana do dvorane. Dolazimo s vlastitim rekvizitima i glazbom.",
      priceModel: "from",
      priceFrom: 90,
      tier: "featured",
      featuredWeight: 7,
      featuredUntil: daysFromNow(30),
      claimed: true,
      atClientLocation: true,
      phone: true,
      whatsapp: true,
      packages: [
        { name: "Osnovna animacija (2 h)", priceFrom: 90, includes: ["1 animatorica", "Igre i ples", "Modeliranje balona"] },
        { name: "Veliki paket (3 h)", priceFrom: 150, includes: ["2 animatorice", "Face painting", "Mini disco", "Pokloni za djecu"] },
      ],
    },
    {
      name: "Flash Kabina photobooth",
      category: "Photobooth i 360° video",
      subcategories: ["Klasični photobooth", "360° video booth"],
      location: "Split",
      serviceAreas: ["Zadar", "Dubrovnik"],
      occasions: ["Vjenčanje", "Rođendan za odrasle", "Poslovni event", "Maturalna večer"],
      short: "Photobooth i 360° video booth s neograničenim ispisima i online galerijom.",
      description:
        "Flash Kabina donosi zabavu na tvoj event: klasični photobooth s rekvizitima i neograničenim ispisima ili atraktivni 360° video booth. Sve fotografije i snimke dostupne su u online galeriji nakon događaja. Pokrivamo Dalmaciju, a za termine izvan Splita dostava se dogovara posebno.",
      priceModel: "range",
      priceFrom: 250,
      priceTo: 500,
      tier: "featured",
      featuredWeight: 9,
      featuredUntil: daysFromNow(90),
      claimed: true,
      phone: true,
      whatsapp: true,
      packages: [
        { name: "Photobooth (3 h)", priceFrom: 250, includes: ["Neograničeni ispisi", "Rekviziti", "Online galerija", "Osoblje"] },
        { name: "360° booth (3 h)", priceFrom: 350, includes: ["360° video", "LED rasvjeta", "Online galerija", "Osoblje"] },
      ],
    },
    {
      name: "DJ Ritam Mora",
      category: "Glazba, bendovi i DJ-evi",
      subcategories: ["DJ"],
      location: "Split",
      serviceAreas: ["Zadar", "Dubrovnik"],
      occasions: ["Vjenčanje", "Rođendan za odrasle", "Poslovni event", "Privatna zabava"],
      short: "DJ za vjenčanja i proslave s vlastitim razglasom i rasvjetom.",
      description:
        "Profesionalni DJ s više od deset godina iskustva na vjenčanjima i privatnim proslavama po Dalmaciji. Glazbu biramo zajedno unaprijed, a čitanje publike i prilagodba atmosferi su dio posla. U cijenu ulazi razglas i osnovna rasvjeta plesnog podija.",
      priceModel: "from",
      priceFrom: 400,
      claimed: true,
      phone: true,
    },
    {
      name: "Studio Trenutak fotografija",
      category: "Fotografija i video",
      location: "Rijeka",
      serviceAreas: ["Pula", "Zagreb"],
      occasions: ["Vjenčanje", "Krštenje", "Pričest", "Krizma", "Poslovni event"],
      short: "Fotografiranje vjenčanja, krštenja i obiteljskih proslava — prirodan, reportažni stil.",
      description:
        "Studio Trenutak specijaliziran je za reportažnu fotografiju događaja: vjenčanja, krštenja, pričesti i obiteljske proslave. Fokus je na spontanim trenucima i emociji, bez ukočenih poza. Isporuka obrađenih fotografija u online galeriji unutar tri tjedna.",
      priceModel: "from",
      priceFrom: 300,
      claimed: false,
      phone: true,
    },
    {
      name: "Slatka Bajka torte",
      category: "Torte, kolači i slastice",
      location: "Zagreb",
      occasions: ["Dječji rođendan", "Rođendan za odrasle", "Vjenčanje", "Krštenje", "Pričest"],
      short: "Torte po narudžbi i slatki stolovi — od dječjih tematskih do elegantnih svadbenih.",
      description:
        "Izrađujemo torte po narudžbi za sve prigode: dječje tematske torte, svadbene katove i slatke stolove s kolačićima, cake popsovima i mini desertima. Narudžbe primamo najkasnije tjedan dana unaprijed, a za svadbene torte preporučujemo degustaciju.",
      priceModel: "from",
      priceFrom: 45,
      claimed: false,
      phone: true,
      whatsapp: true,
    },
    {
      name: "Dvorana Panorama",
      category: "Prostori za proslave",
      location: "Zagreb",
      occasions: ["Vjenčanje", "Rođendan za odrasle", "Poslovni event", "Krizma", "Maturalna večer"],
      short: "Klimatizirana dvorana za 120 gostiju s terasom i parkingom.",
      description:
        "Dvorana Panorama prima do 120 gostiju, a uz glavnu salu na raspolaganju su terasa s pogledom na grad, garderoba i besplatan parking. Prostor se iznajmljuje s osnovnim inventarom (stolovi, stolice, stolnjaci), uz mogućnost preporuke provjerenih catering partnera. Obilazak prostora moguć je uz najavu.",
      priceModel: "on_request",
      claimed: false,
      phone: true,
    },
    {
      name: "Gusto Catering",
      category: "Catering i hrana",
      location: "Zagreb",
      serviceAreas: ["Velika Gorica", "Samobor", "Karlovac"],
      occasions: ["Vjenčanje", "Poslovni event", "Rođendan za odrasle", "Krštenje", "Otvorenje"],
      short: "Catering za proslave od 20 do 300 gostiju — klasični meniji, finger food i live cooking.",
      description:
        "Gusto Catering priprema menije po mjeri: klasične tople menije, finger food, buffet stolove i live cooking stanice. U ponudi su i vegetarijanske, veganske i bezglutenske opcije. Uz hranu osiguravamo posuđe, osoblje i postavu, a za veće evente radimo degustaciju menija.",
      priceModel: "from",
      priceFrom: 18,
      tier: "featured",
      featuredWeight: 6,
      featuredUntil: daysFromNow(75),
      claimed: true,
      atClientLocation: true,
      phone: true,
      whatsapp: true,
      packages: [
        { name: "Finger food (po osobi)", priceFrom: 18, includes: ["8 zalogaja po osobi", "Posuđe", "Postava"] },
        { name: "Topli buffet (po osobi)", priceFrom: 28, includes: ["Juha ili predjelo", "2 glavna jela", "Prilozi i salate", "Osoblje"] },
      ],
    },
    {
      name: "Igraonica Oblačić",
      category: "Rođendaonice i igraonice",
      location: "Rijeka",
      occasions: ["Dječji rođendan"],
      short: "Rođendaonica s velikim poligonom, disco kuglom i prostorom za 30 djece.",
      description:
        "Igraonica Oblačić organizira dječje rođendane u potpunosti: dvosatni termin s animatoricom, veliki mekani poligon, trampolin i disco rasvjeta. Hranu i tortu možete donijeti svoju ili odabrati naš meni. Termini vikendom se brzo popune, preporučujemo rezervaciju mjesec dana unaprijed.",
      priceModel: "range",
      priceFrom: 140,
      priceTo: 260,
      claimed: false,
      phone: true,
    },
    {
      name: "Šator Party najam",
      category: "Šatori, stolovi i stolice",
      location: "Osijek",
      serviceAreas: ["Slavonski Brod"],
      occasions: ["Vjenčanje", "Privatna zabava", "Godišnjica", "Festival"],
      short: "Najam šatora od 25 do 300 m², stolova, stolica i podnica za proslave na otvorenom.",
      description:
        "Iznajmljujemo šatore raznih dimenzija s montažom i demontažom, podnice, stolove, klupe i stolice. Pokrivamo Slavoniju, a za veće udaljenosti prijevoz se obračunava po kilometru. Uz šatore nudimo i rasvjetu te bočne stranice za slučaj lošeg vremena.",
      priceModel: "from",
      priceFrom: 200,
      claimed: false,
      atClientLocation: true,
      phone: true,
    },
    {
      name: "LumenTeh rasvjeta i razglas",
      category: "Rasvjeta, razglas i pozornice",
      location: "Zagreb",
      serviceAreas: ["Varaždin", "Rijeka", "Karlovac"],
      occasions: ["Vjenčanje", "Poslovni event", "Promocija proizvoda", "Festival", "Maturalna večer"],
      short: "Profesionalno ozvučenje, dekorativna rasvjeta i pozornice s tehničarem.",
      description:
        "LumenTeh oprema evente svih veličina: razglas s tehničarem, dekorativna ambijentalna rasvjeta, LED zidovi i modularne pozornice. Radimo tehničku pripremu s organizatorom, dolazimo na uviđaj prostora i osiguravamo dežurstvo tijekom događaja.",
      priceModel: "on_request",
      claimed: true,
      phone: true,
    },
    {
      name: "Agencija Prvi Ples",
      category: "Organizacija događaja",
      location: "Split",
      serviceAreas: ["Zadar", "Dubrovnik", "Zagreb"],
      occasions: ["Vjenčanje", "Poslovni event", "Team building", "Promocija proizvoda", "Otvorenje"],
      short: "Organizacija vjenčanja i poslovnih evenata od koncepta do izvedbe.",
      description:
        "Agencija Prvi Ples vodi događaje od prve ideje do zadnjeg gosta: koncept, budžet, koordinacija dobavljača, scenografija i vođenje samog dana. Specijalizirani smo za vjenčanja u Dalmaciji i korporativne evente, a radimo i destination vjenčanja za parove iz inozemstva.",
      priceModel: "on_request",
      tier: "featured",
      featuredWeight: 5,
      featuredUntil: daysFromNow(120),
      claimed: true,
      phone: true,
      whatsapp: true,
    },
    {
      name: "Cvjetni kutak Iris",
      category: "Cvijeće i cvjetne dekoracije",
      location: "Varaždin",
      serviceAreas: ["Zagreb"],
      occasions: ["Vjenčanje", "Krštenje", "Godišnjica", "Zaruke"],
      short: "Svadbeni buketi, cvjetni aranžmani i dekoracija prostora svježim cvijećem.",
      description:
        "Cvjetni kutak Iris izrađuje svadbene bukete, korsaže, aranžmane za stolove i cvjetne lukove. Radimo sa svježim sezonskim cvijećem i dogovaramo termin konzultacija za svaku svadbu. Dekoraciju postavljamo na lokaciji.",
      priceModel: "from",
      priceFrom: 60,
      claimed: false,
      atClientLocation: true,
      phone: true,
    },
    {
      name: "Oldtimer Kabriolet najam",
      category: "Prijevoz i posebna vozila",
      location: "Zagreb",
      serviceAreas: ["Samobor", "Velika Gorica", "Karlovac"],
      occasions: ["Vjenčanje", "Zaruke", "Godišnjica", "Maturalna večer"],
      short: "Najam oldtimera s vozačem za vjenčanja i posebne prilike.",
      description:
        "Elegantan oldtimer kabriolet s vozačem za dolazak na vjenčanje, zaruke ili fotografiranje. U cijenu su uključeni gorivo i dekoracija vozila po želji. Rezervacije primamo najkasnije dva tjedna unaprijed, a termin vrijedi do četiri sata najma.",
      priceModel: "range",
      priceFrom: 180,
      priceTo: 320,
      claimed: false,
      phone: true,
    },
    {
      name: "Poklon Atelier Mašna",
      category: "Pokloni i personalizirani proizvodi",
      location: "Rijeka",
      occasions: ["Vjenčanje", "Krštenje", "Pričest", "Baby shower", "Poslovni event"],
      short: "Personalizirane zahvalnice, pokloni za goste i brendirani poslovni pokloni.",
      description:
        "Izrađujemo personalizirane poklone za goste: zahvalnice, magnetiće, svijeće, mirisne sapune i brendirane poslovne poklone. Dizajn radimo prema temi događaja, a narudžbe šaljemo poštom po cijeloj Hrvatskoj. Za narudžbe iznad 50 komada odobravamo količinski popust.",
      priceModel: "from",
      priceFrom: 3,
      claimed: false,
      whatsapp: true,
    },
    {
      name: "Zvuk Slavonije bend",
      category: "Glazba, bendovi i DJ-evi",
      subcategories: ["Bendovi", "Tamburaši"],
      location: "Osijek",
      serviceAreas: ["Slavonski Brod", "Zagreb"],
      occasions: ["Vjenčanje", "Godišnjica", "Privatna zabava", "Festival"],
      short: "Tamburaški sastav za svadbe i proslave — od starogradskih do modernih hitova.",
      description:
        "Petočlani tamburaški sastav s repertoarom od starogradskih pjesama do modernih hitova. Sviramo svadbe, godišnjice, rođendane i manifestacije po Slavoniji i šire. Vlastito ozvučenje za prostore do 200 gostiju uključeno je u cijenu.",
      priceModel: "from",
      priceFrom: 600,
      claimed: false,
      phone: true,
    },
    {
      name: "Mega Oprema najam",
      category: "Najam event-opreme",
      location: "Zagreb",
      serviceAreas: ["Velika Gorica", "Samobor", "Karlovac", "Varaždin"],
      occasions: ["Vjenčanje", "Poslovni event", "Privatna zabava", "Otvorenje", "Promocija proizvoda"],
      short: "Najam posuđa, čaša, stolnjaka, barskih stolova i rashladne opreme.",
      description:
        "Mega Oprema iznajmljuje sve što event treba: posuđe i pribor, čaše za sve vrste pića, stolnjake, barske stolove, grijalice za terase i rashladne vitrine. Dostava i preuzimanje na lokaciji, a prljavo posuđe preuzimamo bez pranja.",
      priceModel: "on_request",
      claimed: true,
      atClientLocation: true,
      phone: true,
      whatsapp: true,
    },
    {
      name: "Maskota Show Zeko i Lola",
      category: "Animatori i maskote",
      subcategories: ["Maskote"],
      location: "Zadar",
      serviceAreas: ["Split"],
      occasions: ["Dječji rođendan", "Otvorenje", "Festival"],
      short: "Dolazak maskota s plesnim programom i fotografiranjem za dječje proslave.",
      description:
        "Maskote Zeko i Lola dolaze na dječje rođendane, otvorenja i manifestacije s kratkim plesnim programom, igrama i fotografiranjem. Nastup traje 45–60 minuta, a maskote biraju roditelji prema želji slavljenika iz naše ponude kostima.",
      priceModel: "fixed",
      priceFrom: 110,
      claimed: false,
      atClientLocation: true,
      whatsapp: true,
    },
    {
      name: "Vodeni Svijet napuhanci",
      category: "Napuhanci i atrakcije",
      subcategories: ["Vodeni napuhanci", "Sportske atrakcije"],
      location: "Split",
      serviceAreas: ["Zadar"],
      occasions: ["Dječji rođendan", "Festival", "Team building"],
      short: "Vodeni napuhanci i sportske atrakcije za ljetne proslave i evente uz more.",
      description:
        "Vodeni tobogani, aqua poligoni i sportske napuhane atrakcije za ljetne evente, plaže i team buildinge. Uz svaku atrakciju osiguravamo dežurnu osobu i osiguranje od odgovornosti. Sezona traje od svibnja do rujna, termini se brzo popune.",
      priceModel: "from",
      priceFrom: 250,
      claimed: false,
      phone: true,
    },
    {
      name: "Foto Iskra events",
      category: "Fotografija i video",
      location: "Osijek",
      serviceAreas: ["Slavonski Brod", "Zagreb"],
      occasions: ["Vjenčanje", "Krizma", "Poslovni event", "Maturalna večer"],
      short: "Foto i video praćenje događaja s dronom — vjenčanja, krizme i poslovni eventi.",
      description:
        "Dvočlani tim za foto i video praćenje događaja: fotograf i snimatelj s dronom. Isporučujemo obrađene fotografije i highlight video do pet minuta. Za vjenčanja nudimo i predsvadbeno fotografiranje u prirodi.",
      priceModel: "range",
      priceFrom: 450,
      priceTo: 900,
      claimed: false,
      phone: true,
    },
  ];

  const providerIns = db
    .insert(providers)
    .values({ name: "Demo ponuđači (seed)", note: "Zajednički demo provider za seed oglase", createdAt: now })
    .returning({ id: providers.id })
    .get();

  LISTINGS.forEach((item, i) => {
    const catId = catIds.get(item.category);
    const locId = locIds.get(item.location);
    if (!catId || !locId) throw new Error(`Nepoznata kategorija/lokacija za ${item.name}`);
    const publishedAt = new Date(Date.now() - (i + 3) * 86_400_000).toISOString();
    const listing = db
      .insert(listings)
      .values({
        slug: slugify(item.name),
        name: item.name,
        businessName: `${item.name} d.o.o. (demo)`,
        status: "published",
        tier: item.tier ?? "free",
        claimStatus: item.claimed ? "claimed" : "unclaimed",
        providerId: providerIns.id,
        shortDescription: item.short,
        description: item.description,
        primaryCategoryId: catId,
        baseLocationId: locId,
        priceFrom: item.priceFrom ?? null,
        priceTo: item.priceTo ?? null,
        priceModel: item.priceModel,
        phone: item.phone ? "+385 91 000 0000" : null,
        whatsapp: item.whatsapp ? "+385 91 000 0000" : null,
        email: `demo-${slugify(item.name)}@example.com`,
        website: null,
        instagram: null,
        servesAtClientLocation: item.atClientLocation ?? false,
        featuredWeight: item.featuredWeight ?? 0,
        featuredUntil: item.featuredUntil ?? null,
        publishedAt,
        dataSource: "Seed demo podaci",
        isDemo: true,
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: listings.id })
      .get();

    db.insert(listingCategories).values({ listingId: listing.id, categoryId: catId }).run();
    for (const sub of item.subcategories ?? []) {
      const subId = catIds.get(sub);
      if (subId) db.insert(listingCategories).values({ listingId: listing.id, categoryId: subId }).run();
    }
    for (const occ of item.occasions) {
      const occId = occIds.get(occ);
      if (occId) db.insert(listingOccasions).values({ listingId: listing.id, occasionId: occId }).run();
    }
    for (const area of item.serviceAreas ?? []) {
      const areaId = locIds.get(area);
      if (areaId) db.insert(serviceAreas).values({ listingId: listing.id, locationId: areaId }).run();
    }
    (item.packages ?? []).forEach((pkg, j) => {
      db.insert(packages)
        .values({
          listingId: listing.id,
          name: pkg.name,
          priceFrom: pkg.priceFrom,
          includes: JSON.stringify(pkg.includes),
          sortOrder: j,
        })
        .run();
    });
  });

  // Jedan draft primjer za admin pregled
  db.insert(listings)
    .values({
      slug: "primjer-draft-oglasa",
      name: "Primjer draft oglasa",
      status: "draft",
      shortDescription: "Ovaj oglas je u statusu draft i nije vidljiv javno.",
      primaryCategoryId: catIds.get("Catering i hrana"),
      baseLocationId: locIds.get("Zagreb"),
      isDemo: true,
      dataSource: "Seed demo podaci",
      createdAt: now,
      updatedAt: now,
    })
    .run();

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
        seoTitle: `${post.title} | Feštko vodiči`,
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
        price: null, // cijena se definira u adminu / dogovoru — ne izmišljamo iznos
        period: "mjesečno",
        description: "Nadogradnja za ponuđače koji žele maksimalnu vidljivost.",
        featuresJson: JSON.stringify([
          "Prioritetna pozicija u rezultatima",
          "Značka „Istaknuto”",
          "Veća galerija fotografija i video",
          "Paketi i detaljne cijene",
          "Izravni CTA gumbi (telefon, WhatsApp, e-mail)",
          "Pojavljivanje na naslovnici",
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

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
