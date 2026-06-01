// Shared brand styling for Clerk widgets (<SignUp>, <SignIn>) so they sit inside
// our <Card> rather than rendering their own card chrome + header. Imported by
// /join and /sign-in.
//
// NOTE on what works where:
//  - `variables` below are emitted by Clerk as inline CSS custom properties on
//    the widget root, so they reliably style the INNER controls (inputs, the
//    social button, the charcoal "Continue" button, links). Tune brand here.
//  - The structural CHROME (the inner card's bg / border / shadow / radius /
//    padding, the header, the footer) cannot be reliably overridden via the
//    `elements` className map — Clerk's own stylesheet wins on specificity. Those
//    live in app/globals.css under the `.cl-*` rules (with `!important`), the
//    same pattern as `.cl-header`. Keep chrome there, brand tokens here.
export const clerkAppearance = {
  variables: {
    colorPrimary: "#2f2f2f", // charcoal — matches our primary button
    colorText: "#2f2f2f", // charcoal
    colorTextSecondary: "#8a8580", // ink-muted
    colorBackground: "#ffffff", // white
    colorInputBackground: "#ffffff",
    colorInputText: "#2f2f2f",
    colorDanger: "#1f3a5f", // ocean — we never use bright/alarming red (brand rule)
    borderRadius: "1rem", // matches our rounded-2xl inputs
    fontFamily: "var(--font-sans)",
  },
  elements: {
    rootBox: "w-full",
    // Belt-and-suspenders only: the authoritative flatten lives in globals.css
    // (.cl-cardBox / .cl-card). These hint Clerk's renderer but don't rely on it.
    cardBox: "w-full",
    card: "w-full",
    // Header is hidden in globals.css (.cl-header); these are extra insurance.
    header: "hidden",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    footer: "bg-transparent",
  },
};
