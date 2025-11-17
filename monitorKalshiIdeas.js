import crypto from "crypto";
import fs from "fs";

// Profiles to monitor
const PROFILES = [
  {
    name: "PredMTrader",
    url: "https://kalshi.com/ideas/profiles/PredMTrader",
    emoji: "💭",
    color: 0x00ff7f,
    stateKey: "pred",
  },
  {
    name: "TheGrandeTop10",
    url: "https://kalshi.com/ideas/profiles/TheGrandeTop10",
    emoji: "🎵",
    color: 0x1e90ff,
    stateKey: "grande",
  }
];

// Load previous state
function loadState() {
  try {
    return JSON.parse(fs.readFileSync("state.json", "utf-8"));
  } catch {
    return {};
  }
}

// Save state
function saveState(state) {
  fs.writeFileSync("state.json", JSON.stringify(state, null, 2));
}

// Send Discord embed
async function sendDiscordEmbed(profile) {
  const webhookUrl = process.env.WEBHOOK_URL;

  const payload = {
    embeds: [
      {
        title: `${profile.emoji} Change Detected for ${profile.name}`,
        url: profile.url,
        color: profile.color,
        fields: [
          { name: "Trader", value: profile.name, inline: true },
          { name: "Profile Link", value: profile.url },
          { name: "Detected At", value: new Date().toISOString() }
        ]
      }
    ]
  };

  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
}

// Extract relevant content from HTML
function extractContent(html) {
  // We focus on the main profile content area
  const start = html.indexOf("<main");
  const end = html.indexOf("</main>");
  if (start === -1 || end === -1) return html;
  return html.substring(start, end + 7);
}

// Compute hash
function computeHash(content) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

// Main logic
async function main() {
  const state = loadState();

  for (const profile of PROFILES) {
    console.log(`Checking: ${profile.name}`);

    const res = await fetch(profile.url);
    const html = await res.text();

    const content = extractContent(html);
    const hash = computeHash(content);

    const prevHash = state[profile.stateKey];

    if (!prevHash) {
      // First run, save baseline
      state[profile.stateKey] = hash;
      console.log(`Saved initial baseline for ${profile.name}`);
      continue;
    }

    if (prevHash !== hash) {
      console.log(`Change detected for ${profile.name}!`);
      await sendDiscordEmbed(profile);
      state[profile.stateKey] = hash;
    } else {
      console.log(`No change detected for ${profile.name}`);
    }
  }

  saveState(state);
}

main().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
