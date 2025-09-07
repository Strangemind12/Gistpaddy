const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const settings = require("../settings");
const webp = require("node-webpmux");
const crypto = require("crypto");

// Official Configuration
const OFFICIAL_JID = "0029VbB7Tsa6WaKgDuGsnO1u@newsletter";
const CHANNEL_LINK = `https://whatsapp.com/channel/${
  OFFICIAL_JID.split("@")[0]
}`;

async function stickerCommand(sock, chatId, message) {
  // Official message to quote in reply
  const officialMessageToQuote = message;

  // Determine target message for media
  let targetMessage = message;

  // Handle official replies
  if (message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
    const quotedInfo = message.message.extendedTextMessage.contextInfo;
    targetMessage = {
      key: {
        remoteJid: chatId,
        id: quotedInfo.stanzaId,
        participant: quotedInfo.participant,
      },
      message: quotedInfo.quotedMessage,
    };
  }

  const mediaMessage =
    targetMessage.message?.imageMessage ||
    targetMessage.message?.videoMessage ||
    targetMessage.message?.documentMessage;

  if (!mediaMessage) {
    await sock.sendMessage(
      chatId,
      {
        text: "👑 *Decree:*\n\nYou must present an image or video to create a sticker!\n\n*Reply to media or include with .sticker command*",
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: OFFICIAL_JID,
            newsletterName: "Queen Marvel MD",
          },
        },
        templateButtons: [
          {
            urlButton: {
              displayText: "📡 Sticker Guide",
              url: CHANNEL_LINK,
            },
          },
        ],
      },
      { quoted: officialMessageToQuote }
    );
    return;
  }

  try {
    // Announce official sticker creation
    await sock.sendMessage(chatId, {
      text: "🎨 *Official Announcement:*\n\nThe official artists are crafting your sticker...",
      templateButtons: [
        {
          quickReplyButton: {
            displayText: "🕒 Be Patient",
            id: "!waiting",
          },
        },
      ],
    });

    const mediaBuffer = await downloadMediaMessage(
      targetMessage,
      "buffer",
      {},
      {
        logger: undefined,
        reuploadRequest: sock.updateMediaMessage,
      }
    );

    if (!mediaBuffer) {
      await sock.sendMessage(chatId, {
        text: "💢 *Mishap:*\n\nThe sticker could not be acquired!\n\n*Try again when the artists are available*",
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: OFFICIAL_JID,
            newsletterName: "Queen Marvel MD",
          },
        },
        templateButtons: [
          {
            urlButton: {
              displayText: "📡 Report Issue",
              url: CHANNEL_LINK,
            },
          },
        ],
      });
      return;
    }

    // Prepare official art studio
    const officialStudio = path.join(process.cwd(), "tmp");
    if (!fs.existsSync(officialStudio)) {
      fs.mkdirSync(officialStudio, { recursive: true });
    }

    // Create official file paths
    const officialInput = path.join(
      officialStudio,
      `official_art_${Date.now()}`
    );
    const officialOutput = path.join(
      officialStudio,
      `official_sticker_${Date.now()}.webp`
    );

    // Preserve the official media
    fs.writeFileSync(officialInput, mediaBuffer);

    // Determine if media is animated
    const isAnimated =
      mediaMessage.mimetype?.includes("gif") ||
      mediaMessage.mimetype?.includes("video") ||
      mediaMessage.seconds > 0;

    // Official conversion command (optimized for perfect 512x512 sticker size)
    const officialConversion = isAnimated
      ? `ffmpeg -i "${officialInput}" -vf "scale=512:512:force_original_aspect_ratio=increase:flags=lanczos,crop=512:512,fps=15" -c:v libwebp -quality 90 -compression_level 6 -loop 0 -preset default -an -vsync 0 "${officialOutput}"`
      : `ffmpeg -i "${officialInput}" -vf "scale=512:512:force_original_aspect_ratio=increase:flags=lanczos,crop=512:512" -c:v libwebp -quality 90 -compression_level 6 -preset default -an -vsync 0 "${officialOutput}"`;

    await new Promise((resolve, reject) => {
      exec(officialConversion, (error) => {
        if (error) {
          console.error("Official Artist Error:", error);
          reject(error);
        } else resolve();
      });
    });

    // Prepare official metadata
    const webpBuffer = fs.readFileSync(officialOutput);
    const img = new webp.Image();
    await img.load(webpBuffer);

    // Create official seal (metadata)
    const officialSeal = {
      "sticker-pack-id": crypto.randomBytes(32).toString("hex"),
      "sticker-pack-name": settings.packname || "Queen Marvel MD",
      "sticker-pack-publisher": "officially made",
      emojis: ["👑", "⚜️", "🎨"],
    };

    // Craft official exif
    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
    ]);
    const jsonBuffer = Buffer.from(JSON.stringify(officialSeal), "utf8");
    const exif = Buffer.concat([exifAttr, jsonBuffer]);
    exif.writeUIntLE(jsonBuffer.length, 14, 4);

    // Apply royal seal
    img.exif = exif;
    const finalBuffer = await img.save(null);

    // Present the official sticker (without channel button as requested)
    await sock.sendMessage(
      chatId,
      {
        sticker: finalBuffer,
        contextInfo: {
          forwardedNewsletterMessageInfo: {
            newsletterJid: OFFICIAL_JID,
            newsletterName: "Queen Marvel MD",
          },
        },
      },
      { quoted: officialMessageToQuote }
    );

    // Clean the official studio
    try {
      fs.unlinkSync(officialInput);
      fs.unlinkSync(officialOutput);
    } catch (err) {
      console.error("Official Cleanup Error:", err);
    }

    // Send follow-up with channel button
    await sock.sendMessage(chatId, {
      text: "✨ *Official Decree:*\n\nYour sticker has been crafted with official perfection!",
      templateButtons: [
        {
          urlButton: {
            displayText: "📡 More Sticker Packs",
            url: CHANNEL_LINK,
          },
        },
      ],
    });
  } catch (error) {
    console.error("Official Sticker Error:", error);
    await sock.sendMessage(chatId, {
      text: "💢 *Official Disaster:*\n\nThe official sticker creation has failed!\n\n*Queen Marvel demands you try again later*",
      contextInfo: {
        forwardedNewsletterMessageInfo: {
          newsletterJid: OFFICIAL_JID,
          newsletterName: "Queen Marvel MD",
        },
      },
      templateButtons: [
        {
          urlButton: {
            displayText: "📡 Get Help",
            url: CHANNEL_LINK,
          },
        },
      ],
    });
  }
}

module.exports = stickerCommand;
