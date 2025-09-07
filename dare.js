const fs = require("fs");
const path = require("path");

async function dareCommand(sock, chatId, message) {
  try {
    const shizokeys = "knightbot";
    const res = await fetch(
      `https://api.shizo.top/api/quote/dare?apikey=${shizokeys}`
    );

    if (!res.ok) {
      throw await res.text();
    }

    const json = await res.json();
    const dareMessage = json.result;

    // Path to local dare image in assets folder
    const imagePath = path.join(__dirname, "../assets/truth.png"); // 👈 Update filename as needed

    // Verify image exists
    if (!fs.existsSync(imagePath)) {
      throw new Error("Dare image missing from the treasury!");
    }

    const formattedText = `
⚔️ *Dare Decree* ⚔️

👑 *Issued By:* QUEEN MARVEL MD

🔥 *Dare:* ${dareMessage}

⚠️ *Warning:* Complete this challenge or face mockery!
`.trim();

    // Read and send the local image
    const imageFile = fs.readFileSync(imagePath);

    await sock.sendMessage(
      chatId,
      {
        image: imageFile,
        caption: formattedText,
        mimetype: "image/png", // 👈 Update for PNG/GIF
      },
      { quoted: message }
    );
  } catch (error) {
    console.error("Dare Error:", error);
    await sock.sendMessage(
      chatId,
      {
        text: "👑 *The Queen Announces:* The dare scrolls are lost! Try again later.",
      },
      { quoted: message }
    );
  }
}

module.exports = { dareCommand };
