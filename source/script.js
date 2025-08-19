function toBase64(str) {
    return btoa(unescape(encodeURIComponent(str)));
}
function fromBase64(str) {
    try {
        return decodeURIComponent(escape(atob(str)));
    } catch(e) {
        return null;
    }
}

// Generátor
function generateLink() {
    const rawUrl = document.getElementById("linkInput").value.trim();
    if (!rawUrl) {
        alert("Please enter a valid URL.");
        return;
    }
    const url = toBase64(rawUrl);
    const openNewTab = document.getElementById("newTabCheckbox").checked ? 1 : 0;

    const redirectLink = `${location.origin}${location.pathname}?link=${url}&newtab=${openNewTab}`;
    const output = document.getElementById("output");
    output.style.display = "block";
    output.innerHTML = `Generated Link: <br><a href="${redirectLink}" target="_blank">${redirectLink}</a>`;
}

// Redirect ellenőrzés
async function checkAndRedirect() {
    const params = new URLSearchParams(window.location.search);
    const link = params.get("link");
    const newtab = params.get("newtab") === "1";

    if (!link) return; // nincs paraméter, marad a UI

    const decodedLink = fromBase64(link);
    if (!decodedLink) {
        document.body.innerHTML = "<pre>Invalid or corrupted link.</pre>";
        return;
    }

    const urlObj = new URL(decodedLink);
    const domain = urlObj.hostname;

    // Load trusted domains
    const response = await fetch('source/trusted.txt');
    const trustedDomains = (await response.text()).split('\n').map(d => d.trim()).filter(Boolean);

    if (trustedDomains.includes(domain)) {
        // Trusted domain: azonnali redirect
        if (newtab) window.open(decodedLink, "_blank");
        else window.location.href = decodedLink;
    } else {
        // Nem trusted: megerősítés
        document.body.innerHTML = `
            <div class="glass">
                <h1>Warning!</h1>
                <p>You are about to visit an untrusted site: <b>${domain}</b></p>
                <button onclick="window.location.href='${decodedLink}'">Proceed Anyway</button>
                <button onclick="window.history.back()">Cancel</button>
            </div>
        `;
    }
}

// Auto-check on load
window.addEventListener('DOMContentLoaded', checkAndRedirect);
