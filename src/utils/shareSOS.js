export async function shareSOS(request) {
  const text = `🩸 قطرة Qatra — ${request.bloodType} مطلوب في ${request.hospital} (${request.wilaya}). استجب الآن!`;
  const url = window.location.origin;

  if (navigator.share) {
    try {
      await navigator.share({ title: "قطرة Qatra", text, url });
      return true;
    } catch {
      /* cancelled */
    }
  }

  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return "copied";
  } catch {
    return false;
  }
}
