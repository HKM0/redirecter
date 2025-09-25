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

// link generalo
function generateLink() {
    const linkInput = document.getElementById("linkInput");
    const rawUrl = linkInput ? linkInput.value.trim() : "";
    
    if (!rawUrl) {
        showNotification("Please enter a valid URL.", "error");
        return;
    }

    let normalized = rawUrl;
    
    // nincs protokoll, https:// hozzaad
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawUrl)) {
        normalized = 'https://' + rawUrl;
    }
    
    // normalizalt url www. del
    normalized = normalized.replace(/^(https?:\/\/)www\./, '$1');
    
    // url check logic
    try {
        const urlObj = new URL(normalized);
        //check url
        if (!urlObj.hostname || urlObj.hostname.length < 1) {
            throw new Error("Invalid hostname");
        }
        // domain extension check
        if (!urlObj.hostname.includes('.') && !['localhost', 'store', 'launch'].includes(urlObj.hostname)) {
            throw new Error("Invalid domain");
        }
    } catch (e) {
        showNotification("Please enter a valid URL format. Example: pelda.com or https://pelda.com", "error");
        return;
    }

    const url = toBase64(normalized);
    const openNewTab = document.getElementById("newTabCheckbox").checked ? 1 : 0;

    const redirectLink = `${location.origin}${location.pathname}?link=${encodeURIComponent(url)}&newtab=${openNewTab}`;
    
    // ui update
    const output = document.getElementById("output");
    const generatedLink = document.getElementById("generatedLink");
    const copyButton = document.getElementById("copyButton");
    const testButton = document.getElementById("testButton");
    
    generatedLink.textContent = redirectLink;
    output.style.display = "block";
    
    // masolas gomb
    copyButton.setAttribute('data-copy', redirectLink);
    copyButton.onclick = async () => {
        try {
            await navigator.clipboard.writeText(redirectLink);
            copyButton.textContent = "✓ Copied!";
            copyButton.style.background = "var(--success-color)";
            setTimeout(() => { copyButton.textContent = "📋 Copy Link"; copyButton.style.background = ''; }, 2000);
        } catch (err) {
            showNotification("Failed to copy link.", "error");
        }
    };
    
    // teszt gomb
    testButton.onclick = () => {
        window.open(redirectLink, '_blank');
    };
    
    showNotification("Redirect link generated successfully!", "success");
}

// urlap kuldes kezeles
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('redirectForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            generateLink();
        });
    }
});

// ertesitesi rendszer
function showNotification(message, type = 'info') {
    const existingNotifications = document.querySelectorAll('.notification-toast');
    existingNotifications.forEach(notification => notification.remove());
    
    const notification = document.createElement('div');
    notification.className = 'notification-toast';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-radius: var(--radius-lg);
        padding: var(--space-md) var(--space-lg);
        color: var(--text-primary);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        box-shadow: var(--glass-shadow);
    `;
    
    let icon = '';
    let borderColor = 'var(--glass-border)';
    
    switch (type) {
        case 'success':
            icon = '✓';
            borderColor = 'var(--success-color)';
            break;
        case 'error':
            icon = '✕';
            borderColor = 'var(--error-color)';
            break;
        case 'warning':
            icon = '⚠';
            borderColor = 'var(--warning-color)';
            break;
        default:
            icon = 'ℹ';
    }
    
    notification.style.borderLeftColor = borderColor;
    notification.style.borderLeftWidth = '3px';
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--space-sm);">
            <span style="font-size: var(--font-size-lg);">${icon}</span>
            <span style="font-size: var(--font-size-sm);">${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // beusztatas
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 10);
    
    // automatikus eltavolitas
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

// ellenorzes + atiranyitas query param alapjan
async function checkAndRedirect() {
    const params = new URLSearchParams(window.location.search);
    const link = params.get("link");
    const newtab = params.get("newtab") === "1";

    if (!link) return; 

    const decodedLink = fromBase64(link);
    if (!decodedLink) {
        // hibas link oldal
        document.body.innerHTML = `
            <div id="cursor"></div>
            <div id="cursorPt"></div>
            
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-lg);">
                <div class="card" style="max-width: 500px; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: var(--space-lg);">⚠️</div>
                    <h1 class="heading-2" style="color: var(--error-color); margin-bottom: var(--space-md);">Invalid Link</h1>
                    <p style="color: var(--text-secondary); margin-bottom: var(--space-xl);">
                        The redirect link appears to be corrupted or invalid. Please check the URL and try again.
                    </p>
                    <div style="display: flex; gap: var(--space-md); justify-content: center;">
                        <button onclick="window.history.back()" class="btn btn-glass">Go Back</button>
                        <a href="redirecter.html" class="btn btn-primary">Create New Link</a>
                    </div>
                </div>
            </div>
        `;
        if (window.mainScript && window.mainScript.initCursor) {
            window.mainScript.initCursor();
        }
        return;
    }

    if (params.get('edit') === '1') {
        const linkInput = document.getElementById('linkInput');
        const newTabCheckbox = document.getElementById('newTabCheckbox');
        if (linkInput) linkInput.value = decodedLink;
        if (newTabCheckbox) newTabCheckbox.checked = newtab;
        const output = document.getElementById('output');
        const generatedLink = document.getElementById('generatedLink');
        if (generatedLink) generatedLink.textContent = `${location.origin}${location.pathname}?link=${encodeURIComponent(link)}&newtab=${newtab ? '1' : '0'}`;
        if (output) output.style.display = 'block';
        return;
    }

    const urlObj = new URL(decodedLink);
    const domain = urlObj.hostname;

    try {
        const response = await fetch('source/trusted.txt');
        const trustedDomains = (await response.text()).split('\n').map(d => d.trim()).filter(Boolean);

        if (trustedDomains.includes(domain) || domain === "store" || domain === "launch") {
            if (newtab) {
                window.open(decodedLink, '_blank');
            } else {
                window.location.href = decodedLink;
            }
        } else {
            const encodedParam = encodeURIComponent(link);
            document.body.innerHTML = `
                <div id="cursor"></div>
                <div id="cursorPt"></div>

                <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-lg);">
                    <div class="card" style="max-width: 700px; text-align: center;">
                        <div style="font-size: 3.5rem; margin-bottom: var(--space-lg);">🔒</div>
                        <h1 class="heading-2" style="color: var(--accent-color); margin-bottom: var(--space-md);">External Link Confirmation</h1>
                        <p style="color: var(--text-secondary); margin-bottom: var(--space-lg); font-size: var(--font-size-sm);">
                            You are about to leave this site and open an external URL:
                        </p>
                        <div style="background: var(--glass-bg); border: 1px solid var(--glass-border); border-radius: var(--radius-md); padding: var(--space-md); margin-bottom: var(--space-md); word-break: break-all;">
                            <div style="color: var(--accent-color); font-family: 'Monaco', 'Menlo', monospace; font-size: var(--font-size-sm);">${decodedLink}</div>
                        </div>
                        <p style="color: var(--text-secondary); margin-bottom: var(--space-md);">Do you want to proceed?</p>
                        <div style="display: flex; gap: var(--space-md); justify-content: center;">
                            <button onclick="window.location.href='${location.origin}${location.pathname}?link=${encodedParam}&newtab=${newtab ? '1' : '0'}&edit=1'" class="btn btn-glass">Cancel</button>
                            <button onclick="${newtab ? `window.open('${decodedLink.replace(/'/g, "\\'")}', '_blank')` : `window.location.href='${decodedLink.replace(/'/g, "\\'")}'`}" class="btn btn-primary">Proceed</button>
                        </div>
                    </div>
                </div>
            `;

            if (window.mainScript && window.mainScript.initCursor) {
                window.mainScript.initCursor();
            }
        }
    } catch (error) {
        document.body.innerHTML = `
            <div id="cursor"></div>
            <div id="cursorPt"></div>
            
            <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: var(--space-lg);">
                <div class="card" style="max-width: 500px; text-align: center;">
                    <div style="font-size: 4rem; margin-bottom: var(--space-lg);">⚠️</div>
                    <h1 class="heading-2" style="color: var(--warning-color); margin-bottom: var(--space-md);">Security Check Failed</h1>
                    <p style="color: var(--text-secondary); margin-bottom: var(--space-lg);">
                        Unable to verify the security of this link. Proceed with caution.
                    </p>
                    <div style="display: flex; gap: var(--space-md); justify-content: center;">
                        <button onclick="window.location.href='${location.origin}${location.pathname}?link=${encodeURIComponent(link)}&newtab=${newtab ? '1' : '0'}&edit=1'" class="btn btn-glass">Go Back</button>
                        <button onclick="window.location.href='${decodedLink.replace(/'/g, "\\'")}'" class="btn btn-primary">Proceed Anyway</button>
                    </div>
                </div>
            </div>
        `;
        if (window.mainScript && window.mainScript.initCursor) { window.mainScript.initCursor(); }
    }
}

window.addEventListener('DOMContentLoaded', checkAndRedirect);
