type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <main className="overflow-hidden bg-slate-50">
      <section className="mx-auto min-h-[62vh] max-w-7xl px-4 py-16 sm:px-5 md:py-20 lg:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-civic-700">{eyebrow}</p>
        <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-normal text-ink sm:text-4xl md:text-5xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{description}</p>
        <div className="mt-10 min-w-0">{children}</div>
      </section>
    </main>
  );
}
