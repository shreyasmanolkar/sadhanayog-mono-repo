import type { ReactNode } from "react";

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="shell">
      <a className="skip" href="#main">
        Skip to content
      </a>
      <header className="masthead">
        <p className="brand">
          <span>Sadhana Yog</span>
          Command Center
        </p>
      </header>
      <main id="main">{children}</main>
      <footer className="colophon">Foundation scaffold. No product features yet.</footer>
    </div>
  );
}
