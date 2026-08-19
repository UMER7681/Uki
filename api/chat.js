export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      error: "UKI AI key is not configured."
    });
  }

  const message =
    typeof req.body?.message === "string"
      ? req.body.message.trim()
      : "";

  if (!message) {
    return res.status(400).json({
      error: "Please send a message."
    });
  }

  try {
    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",
          input: [
            {
              role: "system",
              content:
                "You are UKI, Umer's personal AI assistant. Be helpful, natural, friendly and accurate. Match the user's casual tone when appropriate. Explain things clearly at a student-friendly level. Never claim to have access to private accounts, files, apps or devices unless they have actually been connected."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({
        error: "The AI service returned an error."
      });
    }

    return res.status(200).json({
      text: data.output_text || "I couldn't generate a response."
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "UKI couldn't reach the AI service."
    });
  }
}
