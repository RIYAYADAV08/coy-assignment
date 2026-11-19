// Offline placeholder photo: gradient + silhouette + initial. No external images needed.
export function photoSvg(profile) {
  let h = 0;
  for (const ch of profile.id) h = (h * 37 + ch.charCodeAt(0)) % 360;
  const h2 = (h + 55) % 360;
  const initial = profile.name[0].toUpperCase();
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 560">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0" stop-color="hsl(${h} 70% 70%)"/><stop offset="1" stop-color="hsl(${h2} 62% 46%)"/>
</linearGradient></defs>
<rect width="400" height="560" fill="url(#g)"/>
<circle cx="200" cy="200" r="78" fill="rgba(255,255,255,.32)"/>
<path d="M50 560c0-120 66-200 150-200s150 80 150 200z" fill="rgba(255,255,255,.32)"/>
<text x="200" y="228" text-anchor="middle" font-family="Georgia,serif" font-size="84" font-weight="700" fill="rgba(255,255,255,.92)">${initial}</text>
</svg>`;
}
