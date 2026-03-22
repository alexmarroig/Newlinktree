"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { Block, FaqItem, Profile, Settings } from "@/types";
import { trackFAQExpand } from "@/lib/analytics/events";

interface FAQBlockProps {
  block: Block;
  profile: Profile;
  settings: Settings;
  faqItems: FaqItem[];
}

export function FAQBlock({ block, faqItems }: FAQBlockProps) {
  if (faqItems.length === 0) return null;

  function handleExpand(item: FaqItem) {
    trackFAQExpand({
      faqId: item.id,
      questionPreview: item.question,
    });
  }

  return (
    <section
      className="px-6 py-4"
      id="faq"
      aria-label="Perguntas frequentes"
    >
      <div className="mb-5">
        <p className="public-section-title">
          {block.title ?? "Perguntas frequentes"}
        </p>
        {block.subtitle && (
          <p className="text-xs text-muted-foreground">{block.subtitle}</p>
        )}
      </div>

      <div className="card-elevated overflow-hidden px-2">
        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item) => (
            <AccordionItem key={item.id} value={item.id}>
              <AccordionTrigger
                onClick={() => handleExpand(item)}
                className="px-2 text-sm"
              >
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="px-2">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="divider-elegant mt-6" />
    </section>
  );
}
