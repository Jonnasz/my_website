const express = require('express');
  const nodemailer = require('nodemailer');
  const dotenv = require('dotenv');
  const cors = require('cors');
  const sanitizeHtml = require('sanitize-html');

  dotenv.config();

  const app = express();
  // Ustaw CORS dla konkretnej domeny frontendu
  app.use(cors({
      origin: 'https://serwer2528804.home.pl',
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type']
  }));
  app.use(express.json());

  // Konfiguracja transportera Nodemailer
  const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVER,
      port: parseInt(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
          user: process.env.EMAIL_ADDRESS,
          pass: process.env.EMAIL_PASSWORD,
      },
      tls: {
          rejectUnauthorized: true
      }
  });

  // Sprawdzenie konfiguracji SMTP
  transporter.verify((error, success) => {
      if (error) {
          console.error('Błąd konfiguracji SMTP:', error);
      } else {
          console.log('SMTP gotowe do wysyłania e-maili');
      }
  });

  // Testowy endpoint
  app.get('/health', (req, res) => {
      res.status(200).json({ status: 'Serwer działa' });
  });

  // Endpoint do wysyłania e-maili
  app.post('/send-email', async (req, res) => {
      console.log('Otrzymano żądanie POST na /send-email:', req.body);
      try {
          const { name, email, phone, subject, message } = req.body;

          if (!name || !email || !subject || !message) {
              console.log('Brak wymaganych pól:', { name, email, subject, message });
              return res.status(400).json({ error: 'Wypełnij wszystkie wymagane pola' });
          }

          const sanitizedName = sanitizeHtml(name);
          const sanitizedEmail = sanitizeHtml(email);
          const sanitizedPhone = phone ? sanitizeHtml(phone) : '';
          const sanitizedSubject = sanitizeHtml(subject);
          const sanitizedMessage = sanitizeHtml(message);

          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(sanitizedEmail)) {
              console.log('Nieprawidłowy e-mail:', sanitizedEmail);
              return res.status(400).json({ error: 'Nieprawidłowy adres e-mail' });
          }

          const mailOptions = {
              from: process.env.EMAIL_ADDRESS,
              to: process.env.RECIPIENT_EMAIL,
              subject: `Nowe zapytanie: ${sanitizedSubject}`,
              text: `
                  Imię i Nazwisko: ${sanitizedName}
                  E-mail: ${sanitizedEmail}
                  Telefon: ${sanitizedPhone || 'Nie podano'}
                  Temat: ${sanitizedSubject}
                  Wiadomość: ${sanitizedMessage}
              `,
              html: `
                  <h2>Nowe zapytanie kontaktowe</h2>
                  <p><strong>Imię i Nazwisko:</strong> ${sanitizedName}</p>
                  <p><strong>E-mail:</strong> ${sanitizedEmail}</p>
                  <p><strong>Telefon:</strong> ${sanitizedPhone || 'Nie podano'}</p>
                  <p><strong>Temat:</strong> ${sanitizedSubject}</p>
                  <p><strong>Wiadomość:</strong> ${sanitizedMessage}</p>
              `
          };

          console.log('Próba wysyłania e-maila z danymi:', mailOptions);
          const info = await transporter.sendMail(mailOptions);
          console.log('E-mail wysłany:', info.response);
          res.status(200).json({ message: 'Wiadomość wysłana pomyślnie!' });
      } catch (error) {
          console.error('Błąd podczas wysyłania e-maila:', error.message || error);
          res.status(500).json({ error: 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.' });
      }
  });

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
      console.log(`Serwer działa na porcie ${PORT}`);
  });