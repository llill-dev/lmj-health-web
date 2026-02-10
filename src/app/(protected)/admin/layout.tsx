import type { ReactNode } from "react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto w-full max-w-screen-2xl p-6">
      {children}
    </section>
  );
}
