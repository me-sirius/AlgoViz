export const COMMAND_PALETTE_OPEN_EVENT = "algoviz:open-command-palette";

export const openCommandPalette = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(COMMAND_PALETTE_OPEN_EVENT));
};
