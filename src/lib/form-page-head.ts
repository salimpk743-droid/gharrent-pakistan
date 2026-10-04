/**
 * Extra <head> links for the sign-in and post-ad pages only (the homepage head is left exactly as it is).
 *
 * The site font CSS comes from Google Fonts, and the browser only discovers the font files after that CSS
 * has loaded: two round trips before the main text can paint with its font. Preloading the two files these
 * pages use (DM Sans latin, Playfair Display latin) starts both downloads in parallel with the CSS.
 * If Google ever renames the files, the preload simply goes unused; nothing breaks.
 */
export const FORM_PAGE_FONT_PRELOADS = [
  {
    rel: "preload",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
    href: "https://fonts.gstatic.com/s/dmsans/v17/rP2Hp2ywxg089UriCZOIHTWEBlw.woff2",
  },
  {
    rel: "preload",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
    href: "https://fonts.gstatic.com/s/playfairdisplay/v40/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM86xQ.woff2",
  },
];
