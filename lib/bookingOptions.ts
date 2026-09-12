// Preset choices for the booking form. Kept outside the "use server" action
// file because those may only export async functions.
export const BUDGET_OPTIONS = [
  "Under ₹50k",
  "₹50k – ₹1.5L",
  "₹1.5L – ₹5L",
  "₹5L+",
  "Not sure yet",
];

export const TIMELINE_OPTIONS = [
  "ASAP (within 2 weeks)",
  "2 – 4 weeks",
  "1 – 3 months",
  "Flexible",
];

export type BookingState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<"name" | "email" | "message", string>>;
};
