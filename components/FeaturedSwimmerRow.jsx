// components/FeaturedSwimmerRow.jsx
import Link from "next/link";
import AvatarInitial from "./AvatarInitial";
import SaveButton from "./SaveButton";

export default function FeaturedSwimmerRow({ swimmer, isSaved, isAuthed }) {
  const g = String(swimmer.gender || "").trim().toLowerCase();
  const gender =
    g === "f" || g === "female" ? "Female" :
    g === "m" || g === "male"   ? "Male"    : null;

  const hasAge =
    swimmer.age_years !== null &&
    swimmer.age_years !== undefined &&
    String(swimmer.age_years) !== "";

  // 🔵 Club support (common column names: club or club_name)
  const club = (swimmer.club ?? swimmer.club_name ?? "").trim();
  const hasClub = club.length > 0;

  return (
    <li className="rounded-2xl border border-white/10 bg-surface p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left: avatar + text */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="h-10 w-10 shrink-0 rounded-full bg-white/5 grid place-items-center">
            <AvatarInitial name={swimmer.full_name} />
          </div>
          <div className="min-w-0">
            <div className="text-white font-medium truncate">{swimmer.full_name}</div>

            {/* Meta line: gender • age • club */}
            <div className="text-white/60 text-[13px] mt-0.5 flex items-center gap-2 min-w-0">
              {gender ? (
                <span className="inline-flex items-center gap-1 shrink-0">
                  <span aria-hidden>{gender === "Female" ? "♀" : "♂"}</span>
                  <span>{gender}</span>
                </span>
              ) : null}

              {hasAge && (
                <>
                  {gender ? <span className="shrink-0">•</span> : null}
                  <span className="shrink-0">Age {Number(swimmer.age_years)}</span>
                </>
              )}

              {hasClub && (
                <>
                  {(gender || hasAge) ? <span className="shrink-0">•</span> : null}
                  <span className="truncate" title={club}>
                    {club}
                  </span>
                </>
              )}

              {!gender && !hasAge && !hasClub ? <span>—</span> : null}
            </div>
          </div>
        </div>

        {/* Right: actions */}
        <div className="w-full sm:w-auto sm:flex-shrink-0 sm:flex-grow-0">
          <div className="grid grid-cols-2 gap-2 w-full sm:grid-cols-1 sm:flex sm:items-center sm:gap-2 sm:w-auto mt-2 sm:mt-0">
            <Link
              href={`/swimmers/${swimmer.id}`}
              className="rounded-full bg-white/10 hover:bg-white/20 px-4 py-2 text-sm text-white transition-colors w-full sm:w-auto text-center"
            >
              View
            </Link>

            {isAuthed ? (
              <SaveButton
                swimmerId={swimmer.id}
                initiallySaved={isSaved}
                variant="pill"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 text-sm"
              />
            ) : (
              <Link
                href="/sign-in"
                className="rounded-full bg-[#0baa95] hover:bg-[#089783] active:bg-[#078373]
                           px-4 py-2 text-sm text-white w-full sm:w-auto
                           flex justify-center items-center gap-1 text-center
                           transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#11b5a1]/60"
              >
                + Save
              </Link>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}