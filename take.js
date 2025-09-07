const fs = require("fs");
const path = require("path");
const { downloadMediaMessage } = require("@whiskeysockets/baileys");
const webp = require("node-webpmux");
const crypto = require("crypto");

async function takeCommand(sock, chatId, message, args) {
  try {
    // Check if message is a reply to a sticker
    const quotedMessage =
      message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!quotedMessage?.stickerMessage) {
      await sock.sendMessage(chatId, {
        text: "👑 *Decree:*\n\nYou must reply to a sticker with `.take <packname>` to claim it for the Queen Marvel Collection!",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "0029VbB7Tsa6WaKgDuGsnO1u@newsletter",
            newsletterName: "Queen Marvel MD",
            serverMessageId: -1,
          },
        },
      });
      return;
    }

    // Get the packname from args or use default royal name
    const packname = args.join(" ") || "Queen Marvel Collection";

    try {
      // Announce royal acquisition
      await sock.sendMessage(chatId, {
        text: "🖼️ *Official Announcement:*\n\nThis sticker has been claimed for the Queen Marvel Collection!",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "0029VbB7Tsa6WaKgDuGsnO1u@newsletter",
            newsletterName: "Queen Marvel MD",
            serverMessageId: -1,
          },
        },
      });

      // Download the sticker
      const stickerBuffer = await downloadMediaMessage(
        {
          key: message.message.extendedTextMessage.contextInfo.stanzaId,
          message: quotedMessage,
          messageType: "stickerMessage",
        },
        "buffer",
        {},
        {
          logger: console,
          reuploadRequest: sock.updateMediaMessage,
        }
      );

      if (!stickerBuffer) {
        await sock.sendMessage(chatId, {
          text: "💢 *Official Mishap:*\n\nThe scribes failed to copy the sticker!",
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "0029VbB7Tsa6WaKgDuGsnO1u@newsletter",
              newsletterName: "Queen Marvel MD",
              serverMessageId: -1,
            },
          },
        });
        return;
      }

      // Add royal metadata using webpmux
      const img = new webp.Image();
      await img.load(stickerBuffer);

      // Create royal seal metadata
      const royalSeal = {
        "sticker-pack-id": crypto.randomBytes(32).toString("hex"),
        "sticker-pack-name": packname,
        "sticker-pack-publisher": "Queen Marvel MD",
        emojis: ["👑", "⚜️", "🎨"],
      };

      // Craft royal exif
      const exifAttr = Buffer.from([
        0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
        0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00,
      ]);
      const jsonBuffer = Buffer.from(JSON.stringify(royalSeal), "utf8");
      const exif = Buffer.concat([exifAttr, jsonBuffer]);
      exif.writeUIntLE(jsonBuffer.length, 14, 4);

      // Apply the royal seal
      img.exif = exif;

      // Get the final buffer with royal metadata
      const finalBuffer = await img.save(null);

      // Present the royal sticker
      await sock.sendMessage(
        chatId,
        {
          sticker: finalBuffer,
          contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
              newsletterJid: "0029VbB7Tsa6WaKgDuGsnO1u@newsletter",
              newsletterName: "Queen Marvel MD",
              serverMessageId: -1,
            },
          },
        },
        {
          quoted: message,
        }
      );

      // Announce successful claim
      await sock.sendMessage(chatId, {
        text: `🎉 *Official Proclamation:*\n\nThe sticker has been successfully claimed for "${packname}"!\n\n*Queen Marvel!* 👑`,
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "0029VbB7Tsa6WaKgDuGsnO1u@newsletter",
            newsletterName: "Queen Marvel MD",
            serverMessageId: -1,
          },
        },
      });
    } catch (error) {
      console.error("Official Sticker Processing Error:", error);
      await sock.sendMessage(chatId, {
        text: "💢 *Official Disaster:*\n\nThe official artisans failed to process the sticker!",
        contextInfo: {
          forwardingScore: 999,
          isForwarded: true,
          forwardedNewsletterMessageInfo: {
            newsletterJid: "0029VbB7Tsa6WaKgDuGsnO1u@newsletter",
            newsletterName: "Queen Marvel MD",
            serverMessageId: -1,
          },
        },
      });
    }
  } catch (error) {
    console.error("Official Command Error:", error);
    await sock.sendMessage(chatId, {
      text: "⚔️ *Official Emergency:*\n\nCommand could not be processed!",
      contextInfo: {
        forwardingScore: 999,
        isForwarded: true,
        forwardedNewsletterMessageInfo: {
          newsletterJid: "0029VbB7Tsa6WaKgDuGsnO1u@newsletter",
          newsletterName: "Queen Marvel MD",
          serverMessageId: -1,
        },
      },
    });
  }
}

module.exports = takeCommand;
