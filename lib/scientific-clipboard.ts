import type React from "react";

const SUPERSCRIPT_MAP: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  n: "ⁿ",
  i: "ⁱ",
};

const SUBSCRIPT_MAP: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

const BLOCK_TAGS = new Set(["DIV", "P", "LI", "TR", "TABLE"]);

const mapScientificCharacters = (
  value: string,
  mapping: Record<string, string>,
) =>
  Array.from(value)
    .map((character) => {
      const lower = character.toLowerCase();
      return mapping[lower] ?? character;
    })
    .join("");

const normalizeClipboardText = (value: string) =>
  value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const serializeClipboardNode = (node: Node): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? "";
  }

  if (!(node instanceof HTMLElement)) {
    return "";
  }

  if (node.tagName === "BR") {
    return "\n";
  }

  const content = Array.from(node.childNodes)
    .map((child) => serializeClipboardNode(child))
    .join("");

  const verticalAlign = node.style.verticalAlign?.toLowerCase();
  const isSup = node.tagName === "SUP" || verticalAlign === "super";
  const isSub = node.tagName === "SUB" || verticalAlign === "sub";

  const scientificContent = isSup
    ? mapScientificCharacters(content, SUPERSCRIPT_MAP)
    : isSub
      ? mapScientificCharacters(content, SUBSCRIPT_MAP)
      : content;

  if (BLOCK_TAGS.has(node.tagName) && scientificContent.trim().length > 0) {
    return `${scientificContent}\n`;
  }

  return scientificContent;
};

export const transformScientificClipboardText = (
  plainText: string,
  htmlText?: string,
) => {
  if (!htmlText || typeof DOMParser === "undefined") {
    return normalizeClipboardText(plainText);
  }

  try {
    const parser = new DOMParser();
    const document = parser.parseFromString(htmlText, "text/html");
    const serialized = Array.from(document.body.childNodes)
      .map((node) => serializeClipboardNode(node))
      .join("");

    return normalizeClipboardText(serialized || plainText);
  } catch {
    return normalizeClipboardText(plainText);
  }
};

export const handleScientificPaste = (
  event: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  onValueChange: (value: string) => void,
) => {
  const plainText = event.clipboardData.getData("text/plain");
  if (!plainText) {
    return;
  }

  const htmlText = event.clipboardData.getData("text/html");
  const transformedText = transformScientificClipboardText(plainText, htmlText);
  const target = event.currentTarget;
  const selectionStart = target.selectionStart ?? target.value.length;
  const selectionEnd = target.selectionEnd ?? selectionStart;

  event.preventDefault();

  const nextValue =
    target.value.slice(0, selectionStart) +
    transformedText +
    target.value.slice(selectionEnd);

  onValueChange(nextValue);

  const nextCursorPosition = selectionStart + transformedText.length;
  requestAnimationFrame(() => {
    target.focus();
    target.setSelectionRange(nextCursorPosition, nextCursorPosition);
  });
};
