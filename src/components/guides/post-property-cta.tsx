/** Shown on guides: owners can post free. */
export function PostPropertyCta({ city }: { city?: string }) {
  return (
    <section className="mt-10 rounded-xl border border-line bg-cream p-5">
      <h2 className="mt-0! text-xl!">Have a property to rent out or sell{city ? ` in ${city}` : ""}?</h2>
      <p>
        <a href="/post">Post your property free</a> — no account needed until you publish.
      </p>
    </section>
  );
}
