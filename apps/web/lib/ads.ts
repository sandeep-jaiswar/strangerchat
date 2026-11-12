/** AdSense publisher id, e.g. "ca-pub-1234567890123456". */
export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT || "ca-pub-3834685478743012";

export const AD_SLOTS = {
  /** Responsive horizontal unit used on the landing page and mobile lobby. */
  banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? "",
  /** Tall unit in the desktop chat sidebar. */
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
};
