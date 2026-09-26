/** AdSense publisher id, e.g. "ca-pub-1234567890123456". Ads are disabled when empty. */
export const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";

export const AD_SLOTS = {
  /** Responsive horizontal unit used on the landing page and mobile lobby. */
  banner: process.env.NEXT_PUBLIC_ADSENSE_SLOT_BANNER ?? "",
  /** Tall unit in the desktop chat sidebar. */
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR ?? "",
};
