export function StickyMobileBar() {
  return (
    <div
      className="md:hidden fixed bottom-0 inset-x-0 z-30 flex"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <a
        href="tel:+40750405908"
        className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-white no-underline"
        style={{ background: "#e8622c" }}
      >
        📞 Sună Acum
      </a>
      <a
        href="https://wa.me/40750405908"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-3.5 font-bold text-white no-underline"
        style={{ background: "#25D366" }}
      >
        💬 WhatsApp
      </a>
    </div>
  );
}
