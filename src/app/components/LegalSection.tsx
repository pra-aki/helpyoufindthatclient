import type { ReactNode } from "react";

// Shared section heading + body used by the Privacy Policy and Terms of
// Service pages, so both stay visually consistent without duplicating the
// same utility-class soup in each file.
export function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <h2 className="text-xl font-semibold text-foreground mb-3">{title}</h2>
      <div className="space-y-3 text-muted-foreground leading-relaxed">{children}</div>
    </section>
  );
}

export function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-base font-semibold text-foreground mt-4 mb-1.5">{children}</h3>;
}
