import React from 'react';
import ReactDOM from 'react-dom/client';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router} from 'react-router-dom';
import App from './App';
import API_URL from './Config.js';
import Swal from 'sweetalert2';

//  Swal.fire({
//         title: 'Success!',
//         text: 'Cast and crew uploaded successfully.',
//         icon: 'success',
//         confirmButtonText: 'OK',
//       });
let alertShown = false;

function handleError(message) {
  if (!alertShown) {
    alertShown = true; // Set the flag to indicate an alert is being shown
    console.error(message); // Log the error message

    // Show an alert with the error message
    // alert(message);
    Swal.fire({
      icon: "error",
      title: "Some Error Occurred",
      text: message,
      showCancelButton: true, // Shows the Cancel button
      cancelButtonText: "Cancel", // Text for the cancel button
      confirmButtonText: "Send Mail", // Text for the confirm button
    }).then((result) => {
      if (result.isConfirmed) {
        // Logic to send mail       `${baseUrl}/get/displayName`
        const sendMail = async () => {
          try {
            const response = await fetch(`${API_URL}/api/v2/log/time/10`, {
              method: "GET", // Use GET method
            });
      
            if (response.ok) { // .ok is true if status is in the range 200-299
              const data = await response.json(); 
              
              // Assuming the body contains the message "Mail Sent"
              if (data.statusCodeValue === 200) {
                // MySwal.fire("Mail Sent", data.body, "success");
              } else {
                Swal.fire("Error", "Failed to send mail."+data.errorMessage , "error");
              }
            } else {
              console.error("Error sending mail:", response.status);
              Swal.fire("Error", "Failed to send mail.", "error");
            }
          } catch (error) {
            console.error("Error sending mail:", error);
            Swal.fire("Error", "Failed to send mail.", message);
          }
        };
      
        sendMail();
      //  sole.log("Sending mail...");
      } else if (result.isDismissed) {
        // Logic if the user cancels
        // console.log("Action cancelled.");
      }
    });
    // Reset the flag after the alert is dismissed
    setTimeout(() => {
      alertShown = false;
    }, 100); // Adjust the timeout as necessary
  }
}


// Global error handler for synchronous errors
window.onerror = function (message, source, lineno, colno, error) {
  handleError('An error occurred: ' + message);
};

// Global handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  handleError('An unhandled promise rejection occurred: ' + event.reason);
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
     <Router>
      <App />
    </Router>
   
);

