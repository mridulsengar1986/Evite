
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js"
import { getDatabase, ref, push} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js"

const firebaseConfig = {
    databaseURL: "https://shavi-birthday-rsvp-default-rtdb.firebaseio.com/"
  };

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
console.log(database);

const rsvpRef = ref(database, "RSVP");          
const nameInput = document.getElementById("name");

const guestNumber = document.getElementById("guests");
const submitBtn = document.getElementById("submitRSVP");



submitBtn.addEventListener("click", async() => {
    const messageBox = document.getElementById("rsvpMessage");
    const guestName = nameInput.value.trim();
    const guestsCount = guestNumber.value;
   if (!guestName) {
       alert( "Please enter your name!");
        return;
    }                      
    push(rsvpRef, {
        name: guestName,
        guests: guestsCount,
    }).then(async () => {
        console.log("🎉 RSVP Submitted Successfully!");

        // Call Hugging Face API
   
        
        const response = await fetch('/.netlify/functions/generate-message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestName })
        });


        const data = await response.json();
        console.log('AI response from server:',data);  // Always check what comes back
        const thankYouMessage = `🎉 ${data.reply || `Thank you, ${guestName}, for RSVP! Can't wait to celebrate with you!.`}`;
        messageBox.textContent = thankYouMessage;
        nameInput.value = "";
        guestNumber.value = "";

        setTimeout(() => {
            messageBox.textContent = "";
            document.getElementById('rsvpForm').style.display = 'none';
        }, 7000);

    })
    .catch((error) => {
        console.error("❌ Firebase Error:", error);
        // alert("There was an error saving your RSVP. Please try again.");
    });
});
 


  
