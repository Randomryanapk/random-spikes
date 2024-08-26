const { getAppUrl, checkSpikeModule } = require("./ApplicationConfig")
const { BrowserWindow, session, screen } = require("electron")
const { cout } = require("../utils/server-helpers")
const browserManager = require("./browserManager")
const spikesHookJS = require("./spikes-hook")
const puppeteer = require("puppeteer-core")
const cheerio = require("cheerio")
const path = require("path")
const fs = require("fs")


class Application {
    constructor(configuration) {
        this.appName = configuration.appName
        this.email = configuration.email
        this.id = configuration.id
        this.device = configuration.device
        this.response = configuration.response
        this.useragent = configuration.useragent
        this.url = getAppUrl(this.appName, this.device)
        this.appConfig = checkSpikeModule(this.appName)
    }

    async openTab() {
        let isTabExist = browserManager.tabs[this.id]

        if (isTabExist == undefined) {
            const presistedSession = session.fromPartition(`persist:tab-${this.id}`, { cache: false })

            const newtab = new BrowserWindow({
                width: 920,
                height: screen.getPrimaryDisplay().size.height,
                show: !process.argv.includes('--headless'),
                webPreferences: {
                    webSecurity: false,
                    allowRunningInsecureContent: true,
                    session: presistedSession
                }
            })

            await newtab.loadFile(path.join(process.__dirname, "public", `browser-wait.html`))
            await newtab.webContents.executeJavaScript(`window.WHITESPIKESID = "${this.id}"`)
            browserManager.tabs[this.id] = newtab

            newtab.on("close", () => { // listen for closing tab
                delete browserManager.tabs[this.id]
            })
        } else {
            await browserManager.tabs[this.id].webContents.executeJavaScript(`window.WHITESPIKESID = "${this.id}"`)
        }
    }

    async connectBrowser() {
        await this.openTab() // opening the tab if not opened

        const browser = await puppeteer.connect({
            browserURL: `http://127.0.0.1:6450`,
            defaultViewport: null
        })

        const pages = await browser.pages()
        for (const page of pages) {
            const getWhitespikesId = await page.evaluate(`window.WHITESPIKESID`)
            if (getWhitespikesId == this.id) return page
        }
    }

    async closeTab() {
        let tabIfExist = browserManager.tabs[this.id]
        if (tabIfExist != undefined) {
            browserManager.tabs[this.id].close()
            delete browserManager.tabs[this.id]
        }

        if (browserManager.intervals[this.id]) {
            this.unRegisterInterval(browserManager.intervals[this.id])
        }
    }

    async getRequest() {
        try {
            const page = await this.connectBrowser()

            try {
                let ua = this.useragent
                if (this.appConfig.ua) {
                    ua = this.appConfig.ua
                }

                await page.setExtraHTTPHeaders({
                    "User-Agent": ua
                })

                await page.goto(this.url, { waitUntil: "networkidle0" })
                await this.runBeforeResponse(page)
            } catch (error) {
                if (error.message.includes("net::ERR_TOO_MANY_REDIRECTS")) {
                    await new Promise(re => setTimeout(re, 2000))
                }
            }


            let html = ""
            if (this.appConfig.grabCSS) {
                html = await this.grabCSS(page)
            } else {
                html = this.alterHTML(await page.content())
            }

            if (this.saveBeforeResponse(html)) return await this.saveCookies()
            return html
        } catch (error) {
            cout.err(error.message)
            cout.err("get request error.")
        }
    }

    alterHTML(html) {
        const $ = cheerio.load(html)

        if (this.appConfig.removeAllJs) { // removing all js tags
            $("script").remove()
        }

        // removing security tags
        [
            `[http-equiv="Content-Security-Policy"]`,
            `[as="script"]`,
            `[rel="dns-prefetch"]`,
            `[rel="manifest"]`,
            `base`
        ].forEach(tag => {
            if ($(tag).length > 0) {
                $(tag).remove()
            }
        })

        // adding baseURI
        if (this.appConfig.baseURI) {
            $("link").each((index, element) => {
                const href = $(element).attr('href')

                if (href && !href.startsWith('http') && !href.startsWith("data:")) {
                    $(element).attr('href', this.appConfig.baseURI + href)
                }
            })

            $("img").each((index, element) => {
                const src = $(element).attr('src')

                if (src && !src.startsWith('http') && !src.startsWith("data:")) {
                    $(element).attr('src', this.appConfig.baseURI + src).attr("srcset", this.appConfig.baseURI + src)
                }
            })
        }

        const webPublic = path.join(process.__dirname, "public", "web_public", this.appName)
        if (fs.existsSync(webPublic)) {
            const fileNames = fs.readdirSync(webPublic, { withFileTypes: true })

            for (const file of fileNames) {
                if (file.isDirectory()) continue
                const fileName = file.name

                if (path.extname(fileName) == ".css") {
                    const href = `/web_public/${this.appName}/${fileName}`
                    const linkTag = $('<link>').attr("href", href).attr("rel", "stylesheet")
                    $("head").append(linkTag)
                } else if (path.extname(fileName) == ".js") {
                    const src = `/web_public/${this.appName}/${fileName}`
                    const scriptTag = $('<script>').attr("src", src).attr("defer", true)
                    $("head").append(scriptTag)
                } else if (path.extname(fileName) == ".read") {
                    const fileData = fs.readFileSync(path.join(webPublic, fileName), { encoding: "utf-8" })
                    $("head").append(fileData)
                }
            }
        }

        html = $.html() // modified HTML content

        const alterJs = fs.readFileSync(path.join(__dirname, "spikesModules", this.appName, "alter.js"), { encoding: "utf-8" })
        html += `
<script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.7.4/socket.io.js" integrity="sha512-tE1z+95+lMCGwy+9PnKgUSIeHhvioC9lMlI7rLWU0Ps3XTdjRygLcy4mLuL0JAoK4TLdQEyP0yOl/9dMOqpH/Q==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
<script spikes-hook-tag>
try {
    (${spikesHookJS.toString()})()
} catch(err){
    console.log(err)
}
</script>
<script spikes-alterjs-tag>
try {
    ${alterJs}
} catch(err){
    console.log(err)
}
</script>
`
        return html
    }

    async saveCookies() {
        await browserManager.saveCookies(this.id, this.url)

        if (browserManager.intervals[this.id]) {
            this.unRegisterInterval(browserManager.intervals[this.id])
        }

        if (process.argv.includes('--headless')) {
            await this.closeTab()
        }

        return this.response
    }

    registerInterval(interval) {
        if (browserManager.intervals[this.id]) {
            clearInterval(browserManager.intervals[this.id])
            delete browserManager.intervals[this.id]
        }

        browserManager.intervals[this.id] = interval
    }

    unRegisterInterval() {
        if (browserManager.intervals[this.id]) {
            clearInterval(browserManager.intervals[this.id])
            delete browserManager.intervals[this.id]
        }
    }

    innerHTMLMatcher(html, ...pos) {
        for (let i of pos) {
            if (!html.includes(i)) return false
        }

        return true
    }

    /** return html */
    async grabCSS(page) {
        const allCSSRules = await page.evaluate(() => {
            const styleSheets = document.styleSheets
            const allRules = []
            for (const styleSheet of styleSheets) {
                try {
                    const rules = styleSheet.cssRules || styleSheet.rules
                    if (rules) {
                        for (const rule of rules) {
                            allRules.push(rule.cssText)
                        }
                    }
                } catch (error) {
                    console.error('Error accessing style sheet:', error.message)
                }
            }

            return allRules
        })

        const html = this.alterHTML(await page.content())
        const $ = cheerio.load(html)
        allCSSRules.forEach(style => {
            const styleTag = $('<style>').text(style)
            $("head").append(styleTag)
        })

        return $.html()
    }
}

module.exports = { Application }
