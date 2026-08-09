import "server-only";

import { listPendingCommentSummaries } from "@/lib/comments";
import { sendMail } from "@/lib/mailer";
import { listPendingPhotoSummaries } from "@/lib/photos";
import { listModerationRecipients } from "@/lib/users";

const MAX_ITEMS_PER_SECTION = 30;

type PendingItem = {
  poiName: string | null;
  objectRef: string;
  mapProfileId: string;
};

export async function getPendingModerationSummary(): Promise<{
  comments: PendingItem[];
  photos: PendingItem[];
}> {
  const [comments, photos] = await Promise.all([
    listPendingCommentSummaries(),
    listPendingPhotoSummaries(),
  ]);
  return { comments, photos };
}

function renderSection(title: string, items: PendingItem[]): string {
  if (items.length === 0) {
    return "";
  }

  const shown = items.slice(0, MAX_ITEMS_PER_SECTION);
  const rows = shown
    .map(
      (item) =>
        `<li>${item.poiName ?? item.objectRef} <small>(${item.mapProfileId})</small></li>`,
    )
    .join("");
  const remaining = items.length - shown.length;
  const remainingNote = remaining > 0 ? `<p>... ir dar ${remaining}</p>` : "";

  return `<h3>${title} (${items.length})</h3><ul>${rows}</ul>${remainingNote}`;
}

function buildDigestEmail({
  comments,
  photos,
  baseUrl,
}: {
  comments: PendingItem[];
  photos: PendingItem[];
  baseUrl: string;
}): { subject: string; html: string } {
  const parts: string[] = [];
  const subjectParts: string[] = [];

  if (comments.length > 0) {
    parts.push(
      renderSection("Komentarai", comments),
      `<p><a href="${baseUrl}/paskyra/komentarai/tvirtinimas">Peržiūrėti komentarus</a></p>`,
    );
    subjectParts.push(`${comments.length} komentarų`);
  }

  if (photos.length > 0) {
    parts.push(
      renderSection("Nuotraukos", photos),
      `<p><a href="${baseUrl}/paskyra/nuotraukos/tvirtinimas">Peržiūrėti nuotraukas</a></p>`,
    );
    subjectParts.push(`${photos.length} nuotraukų`);
  }

  return {
    subject: `openmap.lt: ${subjectParts.join(" ir ")} laukia patvirtinimo`,
    html: `<p>Laukiama patvirtinimo:</p>${parts.join("")}`,
  };
}

export async function sendModerationDigest(): Promise<void> {
  const { comments, photos } = await getPendingModerationSummary();
  if (comments.length === 0 && photos.length === 0) {
    return;
  }

  const recipients = await listModerationRecipients();
  const baseUrl = process.env.BASE_URL || "https://openmap.lt";

  // Each moderator sees only the section(s) they can actually act on — a
  // photos-only moderator shouldn't be told about pending comments, and vice
  // versa. Admins (and moderators granted both permissions) see everything
  // in a single combined email rather than two separate ones.
  const emailsForCommentsOnly = recipients
    .filter((r) => r.canModerateComments && !r.canModeratePhotos)
    .map((r) => r.email);
  const emailsForPhotosOnly = recipients
    .filter((r) => !r.canModerateComments && r.canModeratePhotos)
    .map((r) => r.email);
  const emailsForBoth = recipients
    .filter((r) => r.canModerateComments && r.canModeratePhotos)
    .map((r) => r.email);

  if (comments.length > 0 && emailsForCommentsOnly.length > 0) {
    await sendMail({
      to: emailsForCommentsOnly,
      ...buildDigestEmail({ comments, photos: [], baseUrl }),
    });
  }

  if (photos.length > 0 && emailsForPhotosOnly.length > 0) {
    await sendMail({
      to: emailsForPhotosOnly,
      ...buildDigestEmail({ comments: [], photos, baseUrl }),
    });
  }

  if (emailsForBoth.length > 0) {
    await sendMail({
      to: emailsForBoth,
      ...buildDigestEmail({ comments, photos, baseUrl }),
    });
  }
}

let lastSentDate: string | null = null;

async function checkAndSendDigest(): Promise<void> {
  const digestHour = Number(process.env.MODERATION_DIGEST_HOUR ?? 8);
  const now = new Date();
  const today = now.toISOString().slice(0, 10);

  if (now.getHours() !== digestHour || lastSentDate === today) {
    return;
  }

  lastSentDate = today;
  try {
    await sendModerationDigest();
  } catch (error) {
    console.error("Klaida siunčiant moderavimo suvestinę:", error);
  }
}

export function scheduleModerationDigest(): void {
  setInterval(checkAndSendDigest, 60 * 60 * 1000);
}
