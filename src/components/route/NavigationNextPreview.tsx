"use client";

import { useActiveInstruction } from "@/hooks/use-active-instruction";
import {
  useNavigationProgress,
  useRouteResult,
} from "@/providers/RouteProvider";
import { getIconComponentForSign } from "./RouteStepItem";

/** Small "then" preview of the maneuver after the current one - kept as its
 * own compact block instead of packed into the main instruction banner, so
 * it stays glanceable while driving. */
export function NavigationNextPreview() {
  const { arrived } = useNavigationProgress();
  const { routeLine, instructions } = useRouteResult();
  const { nextInstruction } = useActiveInstruction(instructions, routeLine);

  if (arrived || !nextInstruction) return null;

  const NextIcon = getIconComponentForSign(nextInstruction.sign);

  return (
    <div className="self-start max-w-[85%] flex items-center gap-2 bg-blue-700 text-white rounded-xl shadow-lg pl-2.5 pr-3 py-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wide text-white/70 shrink-0">
        Tada
      </span>
      <NextIcon className="w-4 h-4 text-white shrink-0" />
      <span className="text-xs font-medium truncate">
        {nextInstruction.street_name || nextInstruction.text}
      </span>
    </div>
  );
}
