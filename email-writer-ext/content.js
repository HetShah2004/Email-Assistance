console.log("Email Writer Extension Loaded");

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-Ji aoO v7 T-I-atl L3';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    button.style.marginRight = '0'; // Adjusted for new layout
    return button;
}

function getEmailContent() {
    const selectors = [
        '.h7',
        '.a3s.aiL',
        '.gmail_quote',
        '[role="presentation"]'
    ];
    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return null;
}

function findComposeToolbar() {
    const selectors = [
        '.btC',
        '.aDh',
        '[role="toolbar"]',
        '.gU.Up'
    ];
    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingContainer = document.querySelector('.ai-reply-container');
    if (existingContainer) existingContainer.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Toolbar not found");
        return;
    }

    // Create container for tone selector + button
    const container = document.createElement('div');
    container.className = 'ai-reply-container';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.gap = '8px';
    container.style.marginRight = '8px';

    // Tone selector dropdown
    const toneSelector = document.createElement('select');
    toneSelector.className = 'ai-tone-selector';
    toneSelector.style.cssText = `
        padding: 6px 8px;
        border-radius: 4px;
        border: 1px solid #dadce0;
        background-color: white;
        font-size: 13px;
        height: 32px;
    `;

    const tones = {
        professional: "Professional",
        friendly: "Friendly",
        casual: "Casual",
        enthusiastic: "Enthusiastic"
    };

    Object.entries(tones).forEach(([value, label]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = label;
        toneSelector.appendChild(option);
    });

    // AI Button
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener("click", async () => {
        try {
            button.innerHTML = "Generating...";
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8080/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: toneSelector.value // Get selected tone
                })
            });

            if (!response.ok) {
                throw new Error('API Request Failed');
            }
            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][g_editable="true"]');
            
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('ComposeBox was not found');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to generate reply');
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    // Add elements to container
    container.appendChild(toneSelector);
    container.appendChild(button);
    toolbar.insertBefore(container, toolbar.firstChild);
}

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('[role="dialog"], .aDh, .btC') ||
             node.querySelector('[role="dialog"], .aDh, .btC'))
        );

        if (hasComposeElements) {
            setTimeout(injectButton, 300);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Quick retry mechanism (remove after testing)
setTimeout(injectButton, 1000);