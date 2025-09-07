const isAdmin = require("../lib/isAdmin");

async function demoteCommand(sock, chatId, mentionedJids, message) {
  try {
    if (!chatId.endsWith("@g.us")) {
      await sock.sendMessage(chatId, {
        text: "👑 QUEEN MARVEL MD says: This command only works in group chats.",
      });
      return;
    }

    try {
      const adminStatus = await isAdmin(
        sock,
        chatId,
        message.key.participant || message.key.remoteJid
      );

      if (!adminStatus.isBotAdmin) {
        await sock.sendMessage(chatId, {
          text: "⚠️ QUEEN MARVEL MD needs admin privileges to demote this person!",
        });
        return;
      }

      if (!adminStatus.isSenderAdmin) {
        await sock.sendMessage(chatId, {
          text: "🚫 Only group admins may issue a demotion under QUEEN MARVEL MD’s authority.",
        });
        return;
      }
    } catch (adminError) {
      console.error("Error checking admin status:", adminError);
      await sock.sendMessage(chatId, {
        text: "⚠️ Make sure QUEEN MARVEL MD is promoted as admin before issuing this command.",
      });
      return;
    }

    let userToDemote = [];

    if (mentionedJids && mentionedJids.length > 0) {
      userToDemote = mentionedJids;
    } else if (message.message?.extendedTextMessage?.contextInfo?.participant) {
      userToDemote = [
        message.message.extendedTextMessage.contextInfo.participant,
      ];
    }

    if (userToDemote.length === 0) {
      await sock.sendMessage(chatId, {
        text: "👑 Please mention or reply to the person you wish to demote under this command.",
      });
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    await sock.groupParticipantsUpdate(chatId, userToDemote, "demote");

    const usernames = await Promise.all(
      userToDemote.map(async (jid) => {
        return `@${jid.split("@")[0]}`;
      })
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const demotionMessage =
      `*💔『 QUEEN MARVEL MD - DEMOTION NOTICE 』💔*\n\n` +
      `👤 *Demoted Person${userToDemote.length > 1 ? "s" : ""}:*\n` +
      `${usernames.map((name) => `• ${name}`).join("\n")}\n\n` +
      `👑 *Executed By:* @${
        message.key.participant
          ? message.key.participant.split("@")[0]
          : message.key.remoteJid.split("@")[0]
      }\n\n` +
      `📅 *Executed Date:* ${new Date().toLocaleString()}`;

    await sock.sendMessage(chatId, {
      text: demotionMessage,
      mentions: [
        ...userToDemote,
        message.key.participant || message.key.remoteJid,
      ],
    });
  } catch (error) {
    console.error("Error in demote command:", error);
    if (error.data === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await sock.sendMessage(chatId, {
        text: "🔁 Slow down! The QUEEN MARVEL MD system has reached its limit. Please try again shortly.",
      });
    } else {
      await sock.sendMessage(chatId, {
        text: "❌ Unable to perform demotion. Ensure QUEEN MARVEL MD is an admin and has authority!",
      });
    }
  }
}

async function handleDemotionEvent(sock, groupId, participants, author) {
  try {
    if (!groupId || !participants) {
      console.log("Invalid groupId or participants:", {
        groupId,
        participants,
      });
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const demotedUsernames = await Promise.all(
      participants.map(async (jid) => {
        return `@${jid.split("@")[0]}`;
      })
    );

    let demotedBy;
    let mentionList = [...participants];

    if (author && author.length > 0) {
      const authorJid = author;
      demotedBy = `@${authorJid.split("@")[0]}`;
      mentionList.push(authorJid);
    } else {
      demotedBy = "🛡️ System";
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const demotionMessage =
      `*💔『 QUEEN MARVEL MD - AUTOMATIC DEMOTION 』💔*\n\n` +
      `👤 *Demoted Person${participants.length > 1 ? "s" : ""}:*\n` +
      `${demotedUsernames.map((name) => `• ${name}`).join("\n")}\n\n` +
      `👑 *Executed By:* ${demotedBy}\n\n` +
      `📅 *Executed Date:* ${new Date().toLocaleString()}`;

    await sock.sendMessage(groupId, {
      text: demotionMessage,
      mentions: mentionList,
    });
  } catch (error) {
    console.error("Error handling demotion event:", error);
    if (error.data === 429) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

module.exports = { demoteCommand, handleDemotionEvent };
