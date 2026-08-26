"use client";

import { useState } from "react";

export type FaqItem = {
  question: string;
  answer: string;
};

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-line/60 border-y border-line/60">
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question} className="py-1">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-6 py-5 text-left"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : index)}
            >
              <span className="display text-xl text-cream sm:text-2xl">{item.question}</span>
              <span className="mt-1 shrink-0 text-gold" aria-hidden>
                {isOpen ? "−" : "+"}
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-5 pr-8 text-mist leading-relaxed">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
