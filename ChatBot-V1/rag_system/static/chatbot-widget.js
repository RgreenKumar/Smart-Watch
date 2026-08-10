(function () {
    'use strict';

    const DEFAULT_CONFIG = {
        apiUrl: 'http://localhost:5000',   // ← points to your FastAPI RAG backend
        position: 'bottom-right',
        width: '400px',
        height: '600px',
        headerColor: '#16a34a',            // RGreenMart green
        brandName: 'RGreenMart Support'
    };

    const userConfig = window.ChatbotConfig || {};
    const config = Object.assign({}, DEFAULT_CONFIG, userConfig);

    const sessionId = 'session_' + Date.now();
    let isOpen = false;

    function createWidget() {
        // Animations
        if (!document.querySelector('[data-chat-anim]')) {
            const style = document.createElement('style');
            style.setAttribute('data-chat-anim', 'true');
            style.textContent = `
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                @keyframes typing {
                    0%,60%,100% { transform: translateY(0); opacity: 0.4; }
                    30%         { transform: translateY(-6px); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        // Container
        const container = document.createElement('div');
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            ${config.position.includes('right') ? 'right' : 'left'}: 20px;
            z-index: 9999;
            font-family: Arial, sans-serif;
        `;

        // Chat window
        const widget = document.createElement('div');
        widget.style.cssText = `
            display: none;
            width: ${config.width};
            height: ${config.height};
            background: white;
            border-radius: 14px;
            box-shadow: 0 8px 40px rgba(0,0,0,0.18);
            flex-direction: column;
            overflow: hidden;
        `;

        // Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: ${config.headerColor};
            color: white;
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px">
                <span style="font-size:22px">🛒</span>
                <div>
                    <div style="font-weight:bold;font-size:15px">${config.brandName}</div>
                    <div style="font-size:11px;opacity:0.85">● Online · 24/7 Support</div>
                </div>
            </div>
            <button id="chat-close" style="background:none;border:none;color:white;font-size:20px;cursor:pointer;line-height:1">✕</button>
        `;

        // Messages area
        const messages = document.createElement('div');
        messages.id = 'chat-messages';
        messages.style.cssText = `
            flex: 1;
            overflow-y: auto;
            padding: 14px;
            background: #f9fafb;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;

        // Welcome message
        addMessageToContainer(
            messages,
            `👋 Hello! Welcome to ${config.brandName}. How can I help you today?`,
            'bot',
            config.headerColor
        );

        // Input area
        const inputContainer = document.createElement('div');
        inputContainer.style.cssText = `
            display: flex;
            padding: 10px 12px;
            border-top: 1px solid #e5e7eb;
            background: white;
            gap: 8px;
        `;
        inputContainer.innerHTML = `
            <input id="chat-input" type="text"
                style="
                    flex:1;padding:9px 12px;
                    border:1px solid #d1d5db;
                    border-radius:8px;font-size:14px;
                    outline:none;
                "
                placeholder="Ask about our products..." />
            <button id="chat-send"
                style="
                    padding:9px 16px;
                    background:${config.headerColor};
                    color:white;border:none;
                    border-radius:8px;cursor:pointer;
                    font-size:14px;font-weight:bold;
                ">Send</button>
        `;

        // Floating button
        const floatingBtn = document.createElement('button');
        floatingBtn.innerHTML = '💬';
        floatingBtn.title = 'Chat with us';
        floatingBtn.style.cssText = `
            width: 60px; height: 60px;
            border-radius: 50%;
            background: ${config.headerColor};
            color: white; border: none;
            font-size: 26px; cursor: pointer;
            box-shadow: 0 4px 14px rgba(0,0,0,0.25);
            transition: transform 0.2s;
        `;
        floatingBtn.onmouseenter = () => floatingBtn.style.transform = 'scale(1.1)';
        floatingBtn.onmouseleave = () => floatingBtn.style.transform = 'scale(1)';

        // Assemble
        widget.appendChild(header);
        widget.appendChild(messages);
        widget.appendChild(inputContainer);
        container.appendChild(floatingBtn);
        container.appendChild(widget);
        document.body.appendChild(container);

        // Events
        floatingBtn.onclick = () => toggle(widget, floatingBtn);
        document.getElementById('chat-close').onclick = () => toggle(widget, floatingBtn);
        document.getElementById('chat-send').onclick = sendMessage;
        document.getElementById('chat-input').addEventListener('keypress', e => {
            if (e.key === 'Enter') sendMessage();
        });

        // ── Toggle open/close ───────────────────────────────────
        function toggle(widget, btn) {
            isOpen = !isOpen;
            widget.style.display = isOpen ? 'flex' : 'none';
            btn.style.display    = isOpen ? 'none' : 'block';
            if (isOpen) {
                setTimeout(() => document.getElementById('chat-input').focus(), 100);
            }
        }

        // ── Send message ────────────────────────────────────────
        async function sendMessage() {
            const input   = document.getElementById('chat-input');
            const message = input.value.trim();
            if (!message) return;

            addMessageToContainer(messages, message, 'user', config.headerColor);
            input.value = '';

            // Typing dots
            const typing = document.createElement('div');
            typing.style.cssText = `
                display:flex;gap:5px;padding:10px 14px;
                align-self:flex-start;
                background:white;border-radius:12px;
                box-shadow:0 1px 4px rgba(0,0,0,0.08);
            `;
            typing.innerHTML = '<span></span><span></span><span></span>';
            typing.querySelectorAll('span').forEach((dot, i) => {
                dot.style.cssText = `
                    width:7px;height:7px;
                    background:#9ca3af;border-radius:50%;
                    display:inline-block;
                    animation:typing 1.2s infinite;
                    animation-delay:${i * 0.2}s;
                `;
            });
            messages.appendChild(typing);
            messages.scrollTop = messages.scrollHeight;

            try {
                const response = await fetch(`${config.apiUrl}/chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message, session_id: sessionId })
                });

                const data = await response.json();
                typing.remove();
                addMessageToContainer(
                    messages,
                    data.response || "Sorry, I couldn't understand that.",
                    'bot',
                    config.headerColor
                );
            } catch (err) {
                typing.remove();
                addMessageToContainer(
                    messages,
                    "⚠️ Connection error. Please make sure the server is running.",
                    'bot',
                    config.headerColor
                );
            }
        }
    }

    // ── Helper: add message bubble ────────────────────────────────
    function addMessageToContainer(container, text, sender, headerColor) {
        const msg = document.createElement('div');
        msg.style.cssText = `
            align-self: ${sender === 'bot' ? 'flex-start' : 'flex-end'};
            background: ${sender === 'bot' ? '#ffffff' : headerColor};
            color: ${sender === 'bot' ? '#111827' : '#ffffff'};
            padding: 10px 14px;
            border-radius: ${sender === 'bot' ? '4px 14px 14px 14px' : '14px 4px 14px 14px'};
            max-width: 78%;
            font-size: 14px;
            line-height: 1.5;
            box-shadow: 0 1px 4px rgba(0,0,0,0.08);
            animation: slideIn 0.25s ease;
        `;
        msg.textContent = text;
        container.appendChild(msg);
        container.scrollTop = container.scrollHeight;
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createWidget);
    } else {
        createWidget();
    }
})();