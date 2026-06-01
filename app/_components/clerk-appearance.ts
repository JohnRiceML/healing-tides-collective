// Shared brand styling for Clerk widgets (<SignUp>, <SignIn>) so they sit inside
// our Card rather than rendering their own card chrome + header. Imported by
// /join and /sign-in. If Clerk ships new element keys, tune them here once.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#2f2f2f", // charcoal — matches our primary button
    colorText: "#2f2f2f",
    colorTextSecondary: "#8a8580", // ink-muted
    colorBackground: "#ffffff",
    borderRadius: "0.85rem",
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "w-full",
    // strip Clerk's own card chrome — we're already inside our <Card>
    cardBox: "w-full shadow-none border-0",
    card: "w-full bg-transparent p-0 shadow-none border-0",
    // hide Clerk's header (we supply our own) — belt-and-suspenders across versions
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer: "bg-transparent",
  },
};
