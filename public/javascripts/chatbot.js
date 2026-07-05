let chatbotOpen = false;

function toggleChatbot() {
    chatbotOpen = !chatbotOpen;
    const panel = document.getElementById('chatbot-panel');
    const btn = document.getElementById('chatbot-btn');
    if (chatbotOpen) {
        panel.style.display = 'flex';
        btn.style.transform = 'scale(0.9)';
        document.getElementById('chatbot-input').focus();
    } else {
        panel.style.display = 'none';
        btn.style.transform = 'scale(1)';
    }
}

function appendMessage(role, text) {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');

    if (role === 'user') {
        div.style.cssText = 'display:flex;justify-content:flex-end;';
        div.innerHTML = '<div class="chatbot-bubble-user">' + GVS.escapeHTML(text) + '</div>';
    } else {
        const formatted = formatAIResponse(text);
        div.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
        div.innerHTML = '<div class="chatbot-avatar"><i class="fa fa-robot"></i></div>'
            + '<div class="chatbot-bubble-ai">' + formatted + '</div>';
    }

    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function formatAIResponse(text) {
    let safe = GVS.escapeHTML(text);
    safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    safe = safe.replace(/^[-•]\s+(.+)/gm, '<div style="padding-left:8px;">• $1</div>');
    safe = safe.replace(/^(\d+)\.\s+(.+)/gm, '<div style="padding-left:8px;">$1. $2</div>');
    safe = safe.replace(/\n/g, '<br>');
    return safe;
}

function showTypingIndicator() {
    const container = document.getElementById('chatbot-messages');
    const div = document.createElement('div');
    div.id = 'chatbot-typing';
    div.style.cssText = 'display:flex;gap:8px;align-items:flex-start;';
    div.innerHTML = '<div class="chatbot-avatar"><i class="fa fa-robot"></i></div>'
        + '<div class="chatbot-bubble-ai">'
        + '<div class="chatbot-typing-dots"><span></span><span></span><span></span></div></div>';
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
    const el = document.getElementById('chatbot-typing');
    if (el) el.remove();
}

function sendChatMessage() {
    const input = document.getElementById('chatbot-input');
    const msg = input.value.trim();
    if (!msg) return;

    input.value = '';
    appendMessage('user', msg);
    showTypingIndicator();

    input.disabled = true;
    document.getElementById('chatbot-send-btn').disabled = true;

    $.ajax(GVS.setting(GVS.ChatbotMessage, 'POST', { message: msg }))
        .done(function (res) {
            removeTypingIndicator();
            if (res.success === 1 && res.metadata && res.metadata.reply) {
                appendMessage('ai', res.metadata.reply);
            } else {
                appendMessage('ai', res.message || 'Đã xảy ra lỗi. Vui lòng thử lại.');
            }
        })
        .fail(function (xhr) {
            removeTypingIndicator();
            let errMsg = 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.';
            if (xhr.responseJSON && xhr.responseJSON.message) {
                errMsg = xhr.responseJSON.message;
            }
            appendMessage('ai', errMsg);
        })
        .always(function () {
            input.disabled = false;
            document.getElementById('chatbot-send-btn').disabled = false;
            input.focus();
        });
}

function clearChatHistory() {
    $.ajax(GVS.setting(GVS.ChatbotClear, 'POST'))
        .done(function (res) {
            const container = document.getElementById('chatbot-messages');
            while (container.children.length > 1) {
                container.removeChild(container.lastChild);
            }
        })
        .fail(function () {
            // Silent fail
        });
}
