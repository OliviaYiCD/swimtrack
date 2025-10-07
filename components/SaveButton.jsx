"use client";

import { useState, useTransition } from "react";

export default function SaveButton({ swimmerId, initiallySaved = false }) {
  const [saved, setSaved] = useState(initiallySaved);
  const [isPending, startTransition] = useTransition();

  const save = () =>
    startTransition(async () => {
      const res = await fetch("/api/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ swimmerId }),
      });

      if (res.ok) setSaved(true);
      else console.error("Save failed");
    });

  const remove = () =>
    startTransition(async () => {
      const res = await fetch(`/api/saved/${swimmerId}`, {
        method: "DELETE",
      });

      if (res.ok) setSaved(false);
      else console.error("Remove failed");
    });

  if (saved)
    return (
      <button
        onClick={remove}
        disabled={isPending}
        className="text-red-400 hover:underline disabled:opacity-50"
      >
        {isPending ? "Removing…" : "Remove"}
      </button>
    );

  return (
    <button
      onClick={save}
      disabled={isPending}
      className="text-blue-400 hover:underline disabled:opacity-50"
    >
      {isPending ? "Saving…" : "Save"}
    </button>
  );
}