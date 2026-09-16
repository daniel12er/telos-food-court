import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
  console.warn(
    "Telegram environment variables are not configured."
  );
}

app.post("/api/orders", async (req, res) => {
  try {
    const {
      customerName,
      tableNumber,
      items,
      total,
    } = req.body;

    // Basic validation
    if (
      !customerName ||
      !tableNumber ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        message: "Invalid order information.",
      });
    }

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return res.status(500).json({
        message: "Order service is not configured.",
      });
    }

    const itemLines = items
      .map(
        (item) =>
          `• ${item.name} × ${item.quantity} — ${
            item.price * item.quantity
          } ETB`
      )
      .join("\n");

    const message = `
🍽️ NEW TELOS FOOD COURT ORDER

👤 Customer: ${customerName}
🪑 Table: ${tableNumber}

ORDER
${itemLines}

━━━━━━━━━━━━━━
💰 TOTAL: ${total} ETB
━━━━━━━━━━━━━━

Please prepare this order.
`;

    const telegramUrl =
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    const telegramResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
    });

    const telegramData = await telegramResponse.json();

    if (!telegramResponse.ok || !telegramData.ok) {
      console.error("Telegram error:", telegramData);

      return res.status(502).json({
        message: "Could not send order to Telegram.",
      });
    }

    return res.json({
      success: true,
      message: "Order successfully sent.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong while processing the order.",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Telos server running on port ${PORT}`);
});
