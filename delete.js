const isAdmin = require("../lib/isAdmin");

async function deleteCommand(sock, chatId, message, senderId) {
  try {
    const { isSenderAdmin, isBotAdmin } = await isAdmin(sock, chatId, senderId);

    if (!isBotAdmin) {
      await sock.sendMessage(chatId, {
        text: "👑 QUEEN MARVEL MD says: I must be an admin to execut deletions.",
      });
      return;
    }

    if (!isSenderAdmin) {
      await sock.sendMessage(chatId, {
        text: "🚫 Only group admins may use the *.delete* command under the QUEEN MARVEL MD commands.",
      });
      return;
    }

    const quotedMessage =
      message.message?.extendedTextMessage?.contextInfo?.stanzaId;
    const quotedParticipant =
      message.message?.extendedTextMessage?.contextInfo?.participant;

    if (quotedMessage) {
      // Delete the quoted message first
      await sock.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: false,
          id: quotedMessage,
          participant: quotedParticipant,
        },
      });

      // Wait a moment before deleting the command message
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Delete the command message itself
      await sock.sendMessage(chatId, {
        delete: {
          remoteJid: chatId,
          fromMe: true,
          id: message.key.id,
        },
      });
    } else {
      const response = await sock.sendMessage(chatId, {
        text: "🗑️ Please reply to the message you want QUEEN MARVEL MD to delete.",
      });

      // Delete the error message after 5 seconds
      setTimeout(async () => {
        try {
          await sock.sendMessage(chatId, {
            delete: {
              remoteJid: chatId,
              fromMe: true,
              id: response.key.id,
            },
          });
        } catch (error) {
          console.error("Error deleting error message:", error);
        }
      }, 5000);
    }
  } catch (error) {
    console.error("Deletion Error:", error);
    await sock.sendMessage(chatId, {
      text: "👑 QUEEN MARVEL MD encountered an error while attempting to delete messages.",
    });
  }
}

module.exports = deleteCommand;
