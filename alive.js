const path = require("path");
const fs = require("fs");

async function aliveCommand(sock, chatId, message) {
  try {
    // Uptime calculation
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);
    const uptimeText = `⏳ Uptime: ${hours}h ${minutes}m ${seconds}s`;

    // Channel JID (replace with your actual newsletter/channel JID)
    const channelJid = "0029VbB7Tsa6WaKgDuGsnO1u@newsletter";
    const channelName = "Tife cybercrate™";

    // Message text with view channel button
    const messageText =
      `👑 *𝐐𝐔𝐄𝐄𝐍 𝐌𝐀𝐑𝐕𝐄𝐋 𝐌𝐃 *\n\n` +
      `✨ *Version:* 2.0\n` +
      `🟢 *Status:* Online\n` +
      `📜 *Commands:* .menu\n\n` +
      `${uptimeText}\n\n` +
      `🔹 Group Tools\n` +
      `🔹 Link Blocker\n` +
      `🔹 Fun & More\n\n`;

    // Import local image
    const royalPortraitPath = path.join(__dirname, "../assets/alive.png");
    const imageBuffer = fs.readFileSync(royalPortraitPath);

    await sock.sendMessage(
      chatId,
      {
        image: imageBuffer,
        caption: messageText,
        templateButtons: [
          {
            urlButton: {
              displayText: "📡 View Channel",
              url: `https://whatsapp.com/channel/${channelJid.split("@")[0]}`,
            },
          },
          {
            quickReplyButton: {
              displayText: "🔄 Refresh Status",
              id: "!alive",
            },
          },
        ],
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: channelJid,
            newsletterName: channelName,
            serverMessageId: -1,
          },
        },
      },
      { quoted: message }
    );
  } catch (error) {
    console.error("error:", error);
    await sock.sendMessage(
      chatId,
      {
        text: "The bot is momentarily indisposed. Try again shortly.",
      },
      { quoted: message }
    );
  }
}

module.exports = aliveCommand;
