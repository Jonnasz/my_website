document.addEventListener('DOMContentLoaded', function() {
    // Dodanie favicon do sekcji <head>
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = "image/svg+xml";
    favicon.href = "/img/logo5.svg";
    document.head.appendChild(favicon);

    // Ładowanie nagłówka
    fetch('components/header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} from ${response.url}`);
            }
            return response.text();
        })
        .then(data => {
            document.querySelector('#header-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Błąd podczas ładowania nagłówka:', error));

    // Ładowanie stopki
    fetch('components/footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status} from ${response.url}`);
            }
            return response.text();
        })
        .then(data => {
            document.querySelector('#footer-placeholder').innerHTML = data;
        })
        .catch(error => console.error('Błąd podczas ładowania stopki:', error));

    // Obsługa formularza kontaktowego
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
            event.preventDefault(); // Zapobiegaj domyślnemu wysyłaniu formularza

            const formData = new FormData(contactForm);
            const data = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                subject: formData.get('subject'),
                message: formData.get('message')
            };

            // Prosta walidacja po stronie klienta
            if (!data.name || !data.email || !data.subject || !data.message) {
                alert('Proszę wypełnić wszystkie wymagane pola.');
                return;
            }

            try {
                // Zmień na poprawny adres Twojego serwera produkcyjnego
                const response = await fetch('https://druk3dgdansk.pl/send-email', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (response.ok) {
                    alert(result.message);
                    contactForm.reset(); // Wyczyść formularz po sukcesie
                } else {
                    alert(result.error || 'Wystąpił błąd podczas wysyłania wiadomości.');
                }
            } catch (error) {
                console.error('Błąd:', error);
                alert('Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.');
            }
        });
    }
});