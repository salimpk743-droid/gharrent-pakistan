/**
 * Public contact details for Apna Ghar — the single place to change them.
 * The owner may correct the email spelling later; edit only this file.
 */
export const CONTACT_EMAIL = "gahrrentpakistan@gmail.com";

/** WhatsApp number in international format without "+" (for wa.me links). */
export const WHATSAPP_NUMBER = "923469462944";
export const WHATSAPP_DISPLAY = "+92 346 9462944";

export const WHATSAPP_GENERAL_MESSAGE = "Assalamualaikum Apna Ghar, I have a question about the website.";

export const WHATSAPP_POST_FOR_ME_MESSAGE = [
  "Assalamualaikum Apna Ghar, please post my property free.",
  "For rent or sale:",
  "City and area:",
  "Property type (house / flat / portion / room / plot / shop):",
  "Rent or price (Rs.):",
  "Size and bedrooms:",
  "Contact number for the ad:",
  "(I will send photos in this chat.)",
].join("\n");

export function whatsappChatUrl(message: string = WHATSAPP_GENERAL_MESSAGE): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export function mailtoUrl(subject?: string): string {
  return `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
