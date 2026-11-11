import { cx } from "@/lib/cx";

/** Simple text page (help, placeholders): big title, readable column. */
export function InfoPage({
  title,
  lead,
  children,
  className,
}: {
  title: string;
  lead?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <main
      className={cx(
        "mx-auto flex w-full max-w-content flex-col gap-6 px-4 py-10 lg:py-16",
        className,
      )}
    >
      <div className="flex max-w-prose flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight text-fg lg:text-5xl">{title}</h1>
        {lead && <p className="text-lg text-fg-muted">{lead}</p>}
      </div>
      {children && (
        <div className="flex max-w-prose flex-col gap-4 text-base text-fg">{children}</div>
      )}
    </main>
  );
}
