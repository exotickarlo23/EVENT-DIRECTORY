import { JsonLd } from "@/components/json-ld";

export interface FaqItem {
  q: string;
  a: string;
}

/** FAQ blok s FAQPage structured datom — schema se emitira samo za stvarno prikazana pitanja. */
export function Faq({ items, title = "Česta pitanja" }: { items: FaqItem[]; title?: string }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="faq-naslov" className="mt-12">
      <h2 id="faq-naslov" className="mb-5 font-display text-2xl font-semibold text-plum">
        {title}
      </h2>
      <div className="space-y-3">
        {items.map((item, i) => (
          <details
            key={i}
            className="group rounded-card border border-line bg-white px-5 py-4 shadow-card"
          >
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 font-bold text-plum [&::-webkit-details-marker]:hidden">
              {item.q}
              <span
                aria-hidden="true"
                className="text-xl text-coral transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.a}</p>
          </details>
        ))}
      </div>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.q,
            acceptedAnswer: { "@type": "Answer", text: item.a },
          })),
        }}
      />
    </section>
  );
}
