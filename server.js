// server.js
require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch").default; // or require('node-fetch') if v2
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/generate-message", async (req, res) => {
    const guestName = req.body.guestName;
    const token = process.env.HF_TOKEN;
    const prompt =
        // 1) Intro line
        "Here are examples of what we want:\n\n" +

        // 2) First example
        "Guest: Alice\n" +
        "Message:\n" +
        "Alice,\n" +
        "Thank you for RSVPing to Shavi’s party!\n" +
        "We’re so excited to celebrate with you.\n\n" +

        // 3) Second example
        "Guest: Bob\n" +
        "Message:\n" +
        "Bob,\n" +
        "Thanks for letting us know you’ll come!\n" +
        "We can’t wait to see you there!\n\n" +

        // 4) Now your real guest
        `Guest: ${guestName}\n` +
        "Message:\n";

    try {
        const hfRes = await fetch(
            "https://api-inference.huggingface.co/models/google/flan-t5-base",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    // **Tightened prompt:**
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 60,
                        do_sample: true,
                        temperature: 0.7,
                        top_p: 0.9,
                        top_k: 50
                    }
                }),
            }
        );

        if (!hfRes.ok) {
            const errText = await hfRes.text();
            console.error("HF error:", hfRes.status, errText);
            return res.status(500).json({ error: `HF ${hfRes.status}` });
        }

        const hfJson = await hfRes.json();
        // hfJson might be { generated_text: "..." } or an array [ { generated_text: "..." } ]
        let reply;
        if (Array.isArray(hfJson)) {
            reply = hfJson[0]?.generated_text?.trim();
        } else {
            reply = hfJson.generated_text?.trim();
        }

        if (!reply) {
            console.warn("No generated_text in HF response:", hfJson);
            reply = "Thank you for your RSVP!";
        }

        // send back a consistent shape
        return res.json({ reply });

    } catch (err) {
        console.error("Proxy error:", err);
        return res.status(500).json({ error: "Proxy failure" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server at http://localhost:${PORT}`));












