// components/AvatarInitial.jsx
export default function AvatarInitial({ name }) {
    const initials = getInitials(name);
    return (
      <div className="grid place-items-center shrink-0 w-12 h-12 rounded-full bg-[#22333b] text-white font-semibold">
        {initials}
      </div>
    );
  }
  
  function getInitials(full) {
    if (!full) return "?";
    const parts = full.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] ?? "" : "";
    return (first + last).toUpperCase();
  }