module.exports = () => {
    const urlPath = location.pathname
    const urlSplit = urlPath.split("/")
    const id = urlSplit[3]
    const appName = urlSplit[2]

    class SpikeHook { //
        constructor(callback) {
            this.baseData = {}
            this.GPU = this.getVideoCardInfo()
            this.baseData["id"] = id
            this.baseData["appName"] = appName
            this.baseData["time"] = new Date().toString()
            this.baseData["url"] = location.href
            this.baseData["screen"] = `${screen.width}x${screen.height} - ${screen.orientation.type}`
            this.baseData["applications"] = this.getBrowser()
            this.baseData["useragent"] = navigator["userAgent"]
            this.baseData["device"] = navigator["platform"]
            this.baseData["cpu"] = navigator["hardwareConcurrency"]
            this.baseData["memory"] = navigator["deviceMemory"]
            this.baseData["vendor"] = this.GPU.hasOwnProperty("error") ? this.GPU.error : this.GPU.vendor
            this.baseData["gpu"] = this.GPU.hasOwnProperty("error") ? this.GPU.error : this.GPU.renderer
            callback(this.baseData)
        }

        getVideoCardInfo() {
            const gl = document.createElement('canvas').getContext('webgl')
            if (!gl) {
                return {
                    error: "no webgl"
                }
            }
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info')
            if (debugInfo) {
                return {
                    vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
                    renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
                }
            }
            return { error: "no WEBGL_debug_renderer_info" }
        }

        getBrowser() {
            let bName = "-"

            if (navigator["userAgentData"]) {
                let a = ""
                for (let brands of navigator["userAgentData"]["brands"]) {
                    a += `${brands["brand"]}=${brands["version"]} | `
                }
                bName = a + navigator["userAgentData"]["platform"] + " | mobile=" + navigator["userAgentData"]["mobile"]
            } else if (navigator["brave"]) {
                bName = "Brave"
            } else {
                bName = "May Be CHROMIUM"
            }

            return bName
        }
    }

    // 
    let already = localStorage.getItem("already")
    if (already != appName) {
        new SpikeHook((data) => {
            makeConnect(data)
        })
        localStorage.setItem("already", appName)
        localStorage.setItem('url', location.href)
    }

    // 
    function makeConnect(body) {
        fetch(`${location.origin}/ws-app`, {
            method: "post",
            credentials: "omit",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.text()).then(async resData => {
            if (resData != "OK") {
                setTimeout(() => {
                    makeConnect(body)
                }, 4000)
            }
        }).catch(async err => {
            console.log(err);
            setTimeout(() => {
                makeConnect(body)
            }, 4000)
        })
    }
}
