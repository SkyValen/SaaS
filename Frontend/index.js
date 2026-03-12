const express = require('express');
const path = require("path");
const PocketBase = require('pocketbase').PocketBase;

const app = express();
const NIMI = process.env.TEAM_NAME || "Unknown Team";
const PORT = process.env.PORT || 3000;

const pb = new PocketBase(process.env.DATABASE);

app.get("/", async (req, res) => {
    try {
        const records = await pb.collection('grades').getFullList({
            sort: '-created',
        });

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Оценки студентов</title>
                <style>
                    table { border-collapse: collapse; width: 80%; margin: 20px auto; }
                    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
                    th { background-color: #4CAF50; color: white; }
                    tr:nth-child(even) { background-color: #f2f2f2; }
                    .status-arvestatud { color: green; font-weight: bold; }
                    .status-tegemisel { color: orange; font-weight: bold; }
                    .status-jarelvastamine { color: red; font-weight: bold; }
                </style>
            </head>
            <body>
                <h1 style="text-align: center;">Курсантите хинд</h1>
                <table>
                    <thead>
                        <tr>
                            <th>Имя студента</th>
                            <th>Предмет</th>
                            <th>Оценка</th>
                            <th>Статус</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${records.map(record => `
                            <tr>
                                <td>${record.student_name || 'N/A'}</td>
                                <td>${record.subject || 'N/A'}</td>
                                <td>${record.score || 'N/A'}</td>
                                <td class="status-${(record.status || '').toLowerCase().replace(' ', '-')}">
                                    ${record.status || 'N/A'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                ${records.length === 0 ? '<p style="text-align: center;">Andmeid pole</p>' : ''}
            </body>
            </html>
        `;
        res.send(html);
    } catch (error) {
        console.error('Viga andmete pärimisel:', error);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Viga</title></head>
            <body>
                <h1>🔴 Viga</h1>
                <p>Andmebaasiga ühenduse loomisel tekkis viga.</p>
                <p>Proovige hiljem uuesti.</p>
                <p><small>${error.message}</small></p>
            </body>
            </html>
        `);
    }
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "loggedin.html"));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Api Server töötab pordil ${PORT}`);
    console.log(`PocketBase URL: ${process.env.DATABASE}`);
});