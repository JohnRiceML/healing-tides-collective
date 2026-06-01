// Shared brand styling for Clerk widgets (<SignUp>, <SignIn>). We let Clerk render
// its OWN native, self-contained, centered card and only brand it via `variables`
// (colors / font / radius). Imported by /join and /sign-in.
//
// Why variables-only:
//  - `variables` are emitted by Clerk as inline CSS custom properties on the widget
//    root, so they reliably style the whole widget — the card, the inputs, the
//    social button, the charcoal "Continue" button, and links. Tune brand here.
//  - We deliberately do NOT use the `elements` className map to resize or flatten
//    the card. Clerk's own stylesheet wins on specificity, and forcing `w-full` /
//    flattening the chrome fought its layout — the form ended up narrow and lost
//    inside an oversized box. The only structural override we keep is hiding the
//    built-in header (`.cl-header` in app/globals.css), since the page supplies it.
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
};
