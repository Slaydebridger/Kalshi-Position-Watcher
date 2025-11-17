// monitorKalshiIdeas.js
// Multi-trader test: sends one Discord embed for each trader
// so you can see different colors/emojis and confirm styling.
// NEXT step after this will be wiring in real Kalshi data.

const PROFILES = [
  {
    name: "PredMTrader",
    profileUrl: "https://kalshi.com/ideas/profiles/PredMTrader"
  },
  {
    name: "TheGrandeTop10",
    profileUrl: "https://kalshi.com/ideas/profiles/TheGrandeTop10"
  }
];

// Per-trader style (colors are in hex)
const TRADER_STYLES = {
  PredMTrader: {
    color: 0x00ff7f, // light green
    emoji: "🧠"
  },
  TheGrandeTop10: {
    color: 0x1e90ff, // blue
    emoji: "🏆"
  }
};

async function sendWebhookEmbedForTrader(traderProfile) {
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("WEBHOOK_URL is not set. Make sure to add it as a GitHub secret.");
    return;
  }

  const style = TRADER_STYLES[traderProfile.name] || {};
  const emoji = style.emoji || "📊";
  const color = style.color ?? 0x58a6ff; // default blue-ish

  // Fake "position" data for now – just to test styling & multiple embeds
  const fakePosition = {
    market: "FAKE POSITION – next step will use real Kalshi data.",
    marketUrl: traderProfile.profileUrl,
    side: traderProfile.name === "PredMTrader" ? "YES" : "NO",
    size: traderProfile.name === "PredMTrader" ? "250 contracts" : "150 contracts",
    time: "just now (test)"
  };

  const payload = {
    embeds: [
      {
        title: `${emoji} New Kalshi Position (TEST) – ${traderProfile.name}`,
        url: fakePosition.marketUrl,
        color,
        fields: [
          { name: "👤 Trader", value: traderProfile.name, inline: true },
          { name: "📊 Side", value: fakePosition.side, inline: true },
          { name: "📦 Size", value: fakePosition.size, inline: true },
          { name: "📈 Market", value: fakePosition.market },
          { name: "🔗 Profile", value: traderProfile.profileUrl },
          { name: "⏱ Detected", value: fakePosition.time }
        ]
      }
    ]
  };

  const res = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    console.error(
      `Discord webhook error for ${traderProfile.name}:`,
      res.status,
      await res.text()
    );
  } else {
    console.log(`Test embed sent for ${traderProfile.name}.`);
  }
}

async function main() {
  console.log("Running multi-trader test…");

  for (const profile of PROFILES) {
    await sendWebhookEmbedForTrader(profile);
  }

  console.log("Done sending test embeds.");
}

main().catch((err) => {
  console.error("Error in script:", err);
  process.exit(1);
});
