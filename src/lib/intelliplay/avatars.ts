import fox from "@/assets/char-fox.png";
import monkey from "@/assets/char-monkey.png";
import cat from "@/assets/char-cat.png";
import bread from "@/assets/char-bread.png";

export const CHARACTERS = [
  { id: "fox", label: "Fox", src: fox },
  { id: "monkey", label: "Monkey", src: monkey },
  { id: "cat", label: "Cat", src: cat },
  { id: "bread", label: "Bread", src: bread },
] as const;

export const DEFAULT_AVATAR = CHARACTERS[0].src;

/** Resolve a stored avatar value (character id or uploaded data URL) to a src. */
export function avatarSrc(avatar?: string | null) {
  if (!avatar) return DEFAULT_AVATAR;
  const found = CHARACTERS.find((c) => c.id === avatar);
  return found ? found.src : avatar;
}
