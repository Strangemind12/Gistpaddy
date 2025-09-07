const fs = require("fs");
const path = require("path");
const os = require("os");

const channelInfo = {
  contextInfo: {
    forwardingScore: 999,
    isForwarded: true,
    forwardedNewsletterMessageInfo: {
      newsletterJid: "0029VbB7Tsa6WaKgDuGsnO1u@newsletter",
      newsletterName: "QUEEN MARVEL MD",
      serverMessageId: -1,
    },
  },
};

async function clearSessionCommand(sock, chatId, msg) {
  try {
    // Check if sender is owner
    if (!msg.key.fromMe) {
      await sock.sendMessage(chatId, {
        text: "🚫 Only the owner may issue this command!",
        ...channelInfo,
      });
      return;
    }

    // Define session directory
    const sessionDir = path.join(__dirname, "../session");

    if (!fs.existsSync(sessionDir)) {
      await sock.sendMessage(chatId, {
        text: "📁 No session data found to optimize.",
        ...channelInfo,
      });
      return;
    }

    let filesCleared = 0;
    let errors = 0;
    let errorDetails = [];

    // Send initial status
    await sock.sendMessage(chatId, {
      text: `👑 QUEEN MARVEL MD is gracefully purging unnecessary session clutter...`,
      ...channelInfo,
    });

    const files = fs.readdirSync(sessionDir);

    // Count files by type for optimization
    let appStateSyncCount = 0;
    let preKeyCount = 0;

    for (const file of files) {
      if (file.startsWith("app-state-sync-")) appStateSyncCount++;
      if (file.startsWith("pre-key-")) preKeyCount++;
    }

    // Delete files
    for (const file of files) {
      if (file === "creds.json") {
        // Skip creds.json file
        continue;
      }
      try {
        const filePath = path.join(sessionDir, file);
        fs.unlinkSync(filePath);
        filesCleared++;
      } catch (error) {
        errors++;
        errorDetails.push(`Failed to delete ${file}: ${error.message}`);
      }
    }

    // Send completion message
    const message =
      `✨ Session cleanup complete, Your Majesty!\n\n` +
      `📊 Stats:\n` +
      `• Files cleared: ${filesCleared}\n` +
      `• App state syncs: ${appStateSyncCount}\n` +
      `• Pre-key items: ${preKeyCount}\n` +
      (errors > 0
        ? `\n⚠️ A few royal hiccups occurred: ${errors}\n${errorDetails.join(
            "\n"
          )}`
        : "");

    await sock.sendMessage(chatId, {
      text: message,
      ...channelInfo,
    });
  } catch (error) {
    console.error("Error in clearsession command:", error);
    await sock.sendMessage(chatId, {
      text: "⚠️ Alas! The vaults could not be cleared!",
      ...channelInfo,
    });
  }
}

module.exports = clearSessionCommand;
