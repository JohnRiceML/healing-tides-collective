"use client";

// The shared UI library was promoted out of the prototype to `app/_components/ui.tsx`
// so every surface (landing, /join, /practitioner, directory, admin) uses the same
// components. This shim re-exports it so the prototype's existing imports keep working.
// NEW code should import from "@/app/_components/ui" directly.
export * from "@/app/_components/ui";
