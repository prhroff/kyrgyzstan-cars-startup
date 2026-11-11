"use client";

export function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 border-t border-line py-8">
      <h2 id={id} className="text-xl font-semibold text-fg">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Caption + item; `demo` forces a visual state (hover / focus / pressed) for screenshots. */
export function State({
  label,
  demo,
  children,
  className,
}: {
  label: string;
  demo?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? "flex min-w-0 flex-col gap-2"}>
      <span className="text-xs text-fg-subtle">{label}</span>
      <div data-demo={demo} className="min-w-0">
        {children}
      </div>
    </div>
  );
}
