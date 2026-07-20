"use client";

import { useState } from "react";

/**
 * A small "Copy link" button for the practitioner's public page URL. Mirrors the
 * admin InviteCreator copy pattern — writes to the clipboard and flips to a brief
 * "Copied ✓" confirmation, then quietly resets. No toast, no dependency.
 */
export function CopyLinkButton({
  url,
  label = "Copy link",
  className = "",
}: {
  url: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        void navigator.clipboard?.writeText(url);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }}
      className={`inline-flex items-center justify-center rounded-full border border-rule px-4 py-2 text-[13.5px] font-medium text-charcoal transition-colors hover:bg-sand/60 ${className}`}
    >
      {copied ? "Copied ✓" : label}
    </button>
  );
}
