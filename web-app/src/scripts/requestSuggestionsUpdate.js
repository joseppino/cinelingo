export default async function(mediaType, userId, locale) {
  fetch("https://rec-update-suggestions-ic5gbb3a2q-nw.a.run.app", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      media_type: mediaType,
      user_id: userId,
      locale: locale
    })
  });
}