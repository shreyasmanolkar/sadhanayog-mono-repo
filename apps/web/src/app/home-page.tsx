export function HomePage() {
  return (
    <section className="stage">
      <h2>The desk is empty on purpose.</h2>
      <p>
        This shell exists so the Worker, contracts, and clients can boot together. Attendance,
        invoices, and the Teaching Archive arrive as later vertical slices.
      </p>
      <p className="pulse">
        <i aria-hidden="true" />
        API health is wired at <code>/health/live</code>
      </p>
    </section>
  );
}
