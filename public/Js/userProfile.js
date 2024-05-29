// async function changeUsername() {
//     const newUsername = document.getElementById('Nieuwe Gebruikersnaam').value;

//     if (newUsername.trim() === "") {
//         alert("De nieuwe gebruikersnaam mag niet leeg zijn.");
//         return;
//     }

//     try {
//         const response = await fetch('/update-username', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//             },
//             body: JSON.stringify({ username: newUsername }),
//         });

//         const result = await response.json();
//         if (result.success) {
//             alert("Gebruikersnaam succesvol bijgewerkt.");
//             location.reload(); 
//         } else {
//             alert("Fout bij het bijwerken van de gebruikersnaam.");
//         }
//     } catch (error) {
//         console.error("Error:", error);
//         alert("Er is een fout opgetreden bij het bijwerken van de gebruikersnaam.");
//     }
// }
