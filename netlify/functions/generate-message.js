
﻿

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
            "https://api-inference.huggingface.co/models/google/flan-t5-large",
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
                        do_sample: true,    // ← tell the model to sample instead of greedy
                        top_k: 50           // ← (optional) only sample from the top 50 tokens
                        
                    }
                })
            }
        );
       
        const hfJson = await hfRes.json();
        console.log("📬 hfResponseJson ▶️", hfJson);
        const raw = Array.isArray(hfJson)
            ? hfJson[0]?.generated_text
            : hfJson.generated_text;
        let reply = raw?.trim() || "Thanks for  RSVPing!";

        // 3) Safety net: if the model still didn’t include the name, prepend it
        if (!reply.startsWith(guestName)) {
            reply = `${guestName}, ${reply}`;
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ reply })
        };
    };



    

  

//     // NEW: a more detailed, humor-focused prompt
//     const fetch = require("node-fetch");

//     exports.handler = async (event) => {
//         // Right at the top of your handler, log it so you can see it in your deploy logs:
// console.log("HF_TOKEN is:", process.env.HF_TOKEN ? "✅ set" : "⛔️ MISSING");
//         const { guestName } = JSON.parse(event.body);
//         const token = process.env.HF_TOKEN;

//         // 1) Tell the model *exactly* to start with the name
//         const prompt = `
// Write a short, funny thank-you message that:
// - Starts with "${guestName},"
// - Uses a playful tone and at least one emoji
// - Feels like you’re hosting a four-year-old’s birthday

// Example:
// Guest: Alice
// Message: Alice, you just RSVP’d and we’re already doing cartwheels 🤸‍♂️—can’t wait to party with you!

// Now:
// Guest: ${guestName}
// Message:`;
//         console.log("PROMPT ▶️", prompt);
//         // 2) Use max_new_tokens (not max_length) and strip the prompt
//         const hfRes = await fetch(
//             "https://api-inference.huggingface.co/models/google/flan-t5-large",
//             {
//                 method: "POST",
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     inputs: prompt,
//                     parameters: {
//                         max_new_tokens: 50,
//                         temperature: 0.8,
//                         top_p: 0.9,
//                         return_full_text: false
//                     }
//                 })
//             }
//         );
        
//         const hfJson = await hfRes.json();
//         console.log("HF JSON ▶️", JSON.stringify(hfJson, null, 2));
//         const raw = Array.isArray(hfJson)
//             ? hfJson[0]?.generated_text
//             : hfJson.generated_text;
//         let reply = raw?.trim() || "Thanks for  RSVPing!";

//         // 3) Safety net: if the model still didn’t include the name, prepend it
//         if (!reply.startsWith(guestName)) {
//             reply = `${guestName}, ${reply}`;
//         }

//         return {
//             statusCode: 200,
//             body: JSON.stringify({ reply })
//         };
//     };



    

  
