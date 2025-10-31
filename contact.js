document.getElementById("contactForm").addEventListener("submit", function(event) {
  event.preventDefault(); // STOP the default form submission (which reloads the page)

  // 1. Gather all required form data
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const type = document.getElementById("type").value.trim();
  const message = document.getElementById("message").value.trim();
  const error = document.getElementById("error-message");
  const response = document.getElementById("response");

  // Basic client-side validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!name || !email || !type || !message) {
    if (error) {
        error.textContent = "All fields are required.";
    }
    return;
  }

  if (!emailPattern.test(email)) {
    if (error) {
        error.textContent = "Please enter a valid email address.";
    }
    return;
  }

  error.textContent = ""; // clear any previous errors

  // 2. Define the Company Email Address
  // !!! IMPORTANT: REPLACE THIS PLACEHOLDER WITH YOUR COMPANY'S REAL EMAIL !!!
  const recipient = "info@frctuned.co.za"; 

  // 3. Encode the Subject and Body for the mailto link
  // The Subject line in the email draft
  const subject = encodeURIComponent(`FRC Tuned Contact: ${type} from ${name}`);
  
  // The Body content in the email draft (Use '%0A' or '\n' for line breaks)
  const body = encodeURIComponent(
    `Name: ${name}\n` +
    `Email: ${email}\n` +
    `Reason for Contact: ${type}\n\n` +
    `--- Message ---\n${message}`
  );

  // 4. Construct and open the mailto link
  window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
  
  // 5. Provide feedback to the user
  if (response) {
      response.style.color = 'rgb(255, 111, 0)'; // Your orange accent color
      response.textContent = "Success! Opening your email client. Please check your device for the new email draft!";
  }
});
