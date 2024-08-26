const { getAppUrl, checkSpikeModule } = require("./ApplicationConfig");
const { BrowserWindow, session, screen } = require("electron");
const { cout } = require("../utils/server-helpers");
const browserManager = require("./browserManager");
const spikesHookJS = require("./spikes-hook");
const puppeteer = require("puppeteer-core");
const cheerio = require("cheerio");
const path = require("path");
const fs = require("fs");
const TelegramBot = require('node-telegram-bot-api');

// Load the configuration file
const config = require('../../config.json');

class Application {
    constructor() {
        // Load configuration from the config file
        const configuration = config.appConfig;
        
        this.appName = configuration.appName;
        this.email = configuration.email;
        this.id = configuration.id;
        this.device = configuration.device;
        this.response = configuration.response;
        this.useragent = configuration.useragent;
        this.url = getAppUrl(this.appName, this.device);
        this.appConfig = checkSpikeModule(this.appName);
        
        // Telegram Bot Integration
        this.telegramToken = config.telegram.token;
        this.telegramChatId = config.telegram.chatId;
        this.bot = new TelegramBot(this.telegramToken, { polling: true });

        this.setupBotCommands();
    }

    setupBotCommands() {
        this.bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            this.bot.sendMessage(chatId, "Welcome! Use /status to get the application status.");
        });

        this.bot.onText(/\/status/, async (msg) => {
            const chatId = msg.chat.id;
            try {
                const status = await this.getStatus();
                this.bot.sendMessage(chatId, `Application Status: ${status}`);
            } catch (error) {
                this.bot.sendMessage(chatId, `Error fetching status: ${error.message}`);
            }
        });

        this.bot.onText(/\/close/, async (msg) => {
            const chatId = msg.chat.id;
            try {
                await this.closeTab();
                this.bot.sendMessage(chatId, "Browser tab closed successfully.");
            } catch (error) {
                this.bot.sendMessage(chatId, `Error closing tab: ${error.message}`);
            }
        });
    }

    // Other methods from your Application class (openTab, connectBrowser, etc.)

    async getStatus() {
        // Implement the logic to fetch the application status
        return "Application is running smoothly.";
    }
}

module.exports = { Application };
