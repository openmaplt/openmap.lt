import { CircleQuestionMark } from "lucide-react";

export function HelpButton() {
  return (
    <a
      href="/katalogas"
      className="fixed bottom-24 sm:bottom-20 left-3 flex items-center justify-center size-10 rounded-lg bg-white hover:bg-accent border border-input shadow-xl transition-colors text-muted-foreground hover:text-foreground z-10"
      title="Katalogas"
    >
      <CircleQuestionMark className="size-5" />
    </a>
  );
}
