

    // NEW: a more detailed, humor-focused prompt
    const fetch = require("node-fetch");

    exports.handler = async (event) => {
        const { guestName } = JSON.parse(event.body);
        const token = process.env.HF_TOKEN;

        // 1) Tell the model *exactly* to start with the name
        const prompt = `
Write a short, funny thank-you message that:
- Starts with "${guestName},"
- Uses a playful tone and at least one emoji
- Feels like you’re hosting a four-year-old’s birthday

Example:
Guest: Alice
Message: Alice, you just RSVP’d and we’re already doing cartwheels 🤸‍♂️—can’t wait to party with you!

Now:
Guest: ${guestName}
Message:`;
        console.log("PROMPT ▶️", prompt);
        // 2) Use max_new_tokens (not max_length) and strip the prompt
        const hfRes = await fetch(
            "https://api-inference.huggingface.co/models/google/flan-t5-base",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: prompt,
                    parameters: {
                        max_new_tokens: 50,
                        temperature: 0.8,
                        top_p: 0.9,
                        return_full_text: false
                    }
                })
            }
        );
        console.log("hfRes▶️", JSON.stringify(hfRes));
        const hfJson = await hfRes.json();
        const raw = Array.isArray(hfJson)
            ? hfJson[0]?.generated_text
            : hfJson.generated_text;
        let reply = raw?.trim() || "Thanks for not RSVPing!";

        // 3) Safety net: if the model still didn’t include the name, prepend it
        if (!reply.startsWith(guestName)) {
            reply = `${guestName}, ${reply}`;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };
    };



    

  