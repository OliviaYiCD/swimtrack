// components/AvatarInitial.jsx

// Exact palette from your screenshot
const COLORS = ["#3C6EE6", "#168873", "#6C4BD1", "#B65A26"];

export default function AvatarInitial({ name }) {
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  // Consistent color per name
  const hash = Array.from(name ?? "").reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  );
  const color = COLORS[hash % COLORS.length];

  return (
    <div
      className="flex items-center justify-center rounded-full text-white font-semibold"
      style={{
        backgroundColor: color,
        width: 40,
        height: 40,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}