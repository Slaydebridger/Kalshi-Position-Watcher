// monitorKalshiIdeas.js
// Test version: sends a Discord embed to make sure webhook + Actions work.

async function sendWebhookEmbed() {
  const webhookUrl = process.env.WEBHOOK_URL;

  if (!webhookUrl) {
    console.error("WEBHOOK_URL is not set. Make sure to add it as a GitHub secret later.");
    return;
  }

  const payload = {
    embeds: [
      {
        title: "Test Kalshi Position (Setup Check)",
        url: "https://kalshi.com/ideas/profiles/PredMTrader",
        color: 5814783,
        fields: [
          { name: "👤 Trader", value: "PredMTrader", inline: true },
          { name: "📊 Side", value: "YES", inline: true },
          { name: "📦 Size", value: "123 contracts", inline: true },
          {
            name: "📈 Market",
            value: "This is just a test embed to confirm the bot is working."
          },
          { name: "🔗 Profile", value: "https://kalshi.com/ideas/profiles/PredMTrader" }
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
    console.error("Discord webhook error:", res.status, await res.text());
  } else {
    console.log("Test embed sent to Discord successfully.");
  }
}

async function main() {
  console.log("Running monitorKalshiIdeas.js (test mode)...");
  await sendWebhookEmbed();
}

main().catch((err) => {
  console.error("Error in script:", err);
  process.exit(1);
});
