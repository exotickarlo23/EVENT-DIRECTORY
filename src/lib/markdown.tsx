import type { ReactNode } from "react";
import { slugify } from "@/lib/utils";

/**
 * Minimalni markdown renderer za sadržaj vodiča (admin-kontrolirani unos).
 * Podržava: ##/### naslove (s anchor id-jevima), **bold**, liste, numerirane
 * liste i paragrafe. Tekst se renderira kao React čvorovi — bez innerHTML.
 */

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={`${keyPrefix}-${i}`}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

export function extractHeadings(markdown: string): { id: string; text: string }[] {
  return markdown
    .split("\n")
    .filter((l) => l.startsWith("## "))
    .map((l) => {
      const text = l.slice(3).trim();
      return { id: slugify(text), text };
    });
}

export function Markdown({ content }: { content: string }) {
  const blocks = content.split(/\n\n+/);
  return (
    <div className="prose-festko">
      {blocks.map((block, bi) => {
        const trimmedBlock = block.trim();
        if (!trimmedBlock) return null;
        if (trimmedBlock.startsWith("### ")) {
          const text = trimmedBlock.slice(4).trim();
          return (
            <h3 key={bi} id={slugify(text)}>
              {renderInline(text, `h3-${bi}`)}
            </h3>
          );
        }
        if (trimmedBlock.startsWith("## ")) {
          const text = trimmedBlock.slice(3).trim();
          return (
            <h2 key={bi} id={slugify(text)}>
              {renderInline(text, `h2-${bi}`)}
            </h2>
          );
        }
        const lines = trimmedBlock.split("\n");
        if (lines.every((l) => l.trim().startsWith("- "))) {
          return (
            <ul key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.trim().slice(2), `li-${bi}-${li}`)}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\d+\.\s/.test(l.trim()))) {
          return (
            <ol key={bi}>
              {lines.map((l, li) => (
                <li key={li}>{renderInline(l.trim().replace(/^\d+\.\s/, ""), `oli-${bi}-${li}`)}</li>
              ))}
            </ol>
          );
        }
        return <p key={bi}>{renderInline(trimmedBlock.replace(/\n/g, " "), `p-${bi}`)}</p>;
      })}
    </div>
  );
}
