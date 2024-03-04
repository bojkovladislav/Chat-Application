export async function copyToClipBoard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    throw new Error("Unable to copy the text");
  }
}