// Plain data, no "server-only" — used both by server code (lib/photos.ts,
// actions/photos.ts validation) and client components (license picker,
// gallery attribution caption).

export const PHOTO_LICENSES = {
  CC_BY: "CC-BY-4.0",
  CC0: "CC0-1.0",
  CC_BY_SA: "CC-BY-SA-4.0",
  CC_BY_NC: "CC-BY-NC-4.0",
} as const;

export type PhotoLicense = (typeof PHOTO_LICENSES)[keyof typeof PHOTO_LICENSES];

export const PHOTO_LICENSE_INFO: Record<
  PhotoLicense,
  { label: string; description: string; url: string }
> = {
  [PHOTO_LICENSES.CC_BY]: {
    label: "CC BY 4.0",
    description: "Paminėti autorių",
    url: "https://creativecommons.org/licenses/by/4.0/deed.lt",
  },
  [PHOTO_LICENSES.CC0]: {
    label: "CC0 1.0",
    description: "Laisva vieša prieiga",
    url: "https://creativecommons.org/publicdomain/zero/1.0/deed.lt",
  },
  [PHOTO_LICENSES.CC_BY_SA]: {
    label: "CC BY-SA 4.0",
    description: "Atviras išvestinis naudojimas",
    url: "https://creativecommons.org/licenses/by-sa/4.0/deed.lt",
  },
  [PHOTO_LICENSES.CC_BY_NC]: {
    label: "CC BY-NC 4.0",
    description: "Neleidžiamas komercinis naudojimas",
    url: "https://creativecommons.org/licenses/by-nc/4.0/deed.lt",
  },
};

// Order matters — this is the order the license Select's options render in,
// and CC_BY is the default selection (see issue #61).
export const PHOTO_LICENSE_ORDER: PhotoLicense[] = [
  PHOTO_LICENSES.CC_BY,
  PHOTO_LICENSES.CC0,
  PHOTO_LICENSES.CC_BY_SA,
  PHOTO_LICENSES.CC_BY_NC,
];
