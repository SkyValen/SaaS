const express = require('express');
const path = require("path");
const PocketBase = require('pocketbase').PocketBase;

const app = express();
const NIMI = process.env.TEAM_NAME || "Unknown Team";
const PORT = process.env.PORT || 3000;

// ✅ Проверяем, что DATABASE задана
if (!process.env.DATABASE) {
    console.error('❌ FATAL: DATABASE environment variable is not set!');
    process.exit(1);
}

console.log('🔌 Connecting to PocketBase:', process.env.DATABASE);
const pb = new PocketBase(process.env.DATABASE);

// ✅ Тестовый эндпоинт для проверки подключения
app.get("/health", (req, res) => {
    res.json({ status: "ok", team: NIMI });
});

app.get("/test-db", async (req, res) => {
    try {
        const records = await pb.collection('grades').getFirstListItem("id != ''");
        res.json({ success: true, sample: records });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

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
        console.error('❌ Viga andmete pärimisel:', error.message);
        res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"><title>Viga</title></head>
            <body>
                <h1>🔴 Viga</h1>
                <p>Andmebaasiga ühenduse loomisel tekkis viga.</p>
                <p><a href="/test-db">Проверить подключение к БД</a></p>
                <p><small>${error.message}</small></p>
            </body>
            </html>
        `);
    }
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "loggedin.html"));
});

// ✅ Приложение слушает ВСЕ интерфейсы
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Server started on port ${PORT}`);
    console.log(`✅ Health check: http://localhost:${PORT}/health`);
    console.log(`✅ DB test: http://localhost:${PORT}/test-db`);
});

// ✅ Обработка незапланированных ошибок (чтобы не падало)
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
});
process.on('unhandledRejection', (reason) => {
    console.error('❌ Unhandled Rejection:', reason);
});