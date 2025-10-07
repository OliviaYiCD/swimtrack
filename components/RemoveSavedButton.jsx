"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RemoveSavedButton({ swimmerId }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onRemove = async () => {
    try {
      setBusy(true);
      const res = await fetch(`/api/saved/${swimmerId}`, { method: "DELETE" });
      // if the API returned JSON ok:true, navigate / refresh
      if (res.ok) {
        // either refresh the page or explicitly push back to /saved
        router.refresh(); // keeps you on /saved and refreshes data
        // router.push("/saved"); // alternative: hard navigate
      } else {
        console.error(await res.json());
        setBusy(false);
      }
    } catch (e) {
      console.error(e);
      setBusy(false);
    }
  };

  return (
    <button
      onClick={onRemove}
      disabled={busy}
      className="rounded-md bg-red-600 hover:bg-red-500 disabled:opacity-50 px-3 py-2 text-sm font-medium"
    >
      {busy ? "Removing..." : "Remove"}
    </button>
  );
}