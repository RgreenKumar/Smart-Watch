package com.VsmartEngine.Chatbot.ScriptGenerate;

import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.VsmartEngine.Chatbot.TokenGeneration.JwtUtil;
import com.VsmartEngine.Chatbot.Trigger.SetDepartment;
import com.VsmartEngine.Chatbot.Trigger.Trigger;
import com.VsmartEngine.Chatbot.Trigger.TriggerRepository;
import com.VsmartEngine.Chatbot.UserInfo.UserInfo;
import com.VsmartEngine.Chatbot.UserInfo.UserInfoRepository;

import jakarta.transaction.Transactional;

@CrossOrigin()
@RequestMapping("/chatbot")
@RestController
public class ScriptGenerateController {

    @Autowired
    private ScriptGeneratorRepository scriptgeneraterepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserInfoRepository userinforepository;

    @Autowired
    private TriggerRepository triggerRepository;

    // FIX: Use injected backendurl from application.properties / .env
    // Previously this was hardcoded as "http://localhost:8080" in handleUserSubmit()
    @Value("${BackendUrl}")
    private String backendurl;

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/widget/appearance — save widget appearance
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/widget/appearance")
    public ResponseEntity<?> saveWidgetAppearance(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "Language",     required = false) String language,
            @RequestParam(value = "logo",         required = false) MultipartFile logo,
            @RequestParam(value = "heading",      required = false) String heading,
            @RequestParam(value = "TextArea",     required = false) String textArea,
            @RequestParam(value = "logoAlign",    required = false) String logoAlign,
            @RequestParam(value = "headingAlign", required = false) String headingAlign,
            @RequestParam(value = "TextAlign",    required = false) String textAlign,
            @RequestParam(value = "appearence",   required = false) List<String> appearence
    ) {
        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only admin can set appearance.");
            }

            ScriptGenerate script = new ScriptGenerate();
            script.setLanguage(language);
            script.setHeading(heading);
            script.setTextArea(textArea);
            script.setLogoAlign(logoAlign);
            script.setHeadingAlign(headingAlign);
            script.setTextAlign(textAlign);
            script.setAppearence(appearence);

            if (logo != null && !logo.isEmpty()) {
                script.setLogo(logo.getBytes());
            }

            ScriptGenerate saved = scriptgeneraterepository.save(script);
            return ResponseEntity.ok(saved.getId());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving appearance: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PATCH /chatbot/widget/appearance/{id} — update existing appearance
    // ─────────────────────────────────────────────────────────────────────────
    @PatchMapping("/widget/appearance/{id}")
    public ResponseEntity<?> updateWidgetAppearance(
            @RequestHeader("Authorization") String token,
            @PathVariable UUID id,
            @RequestParam(value = "Language",     required = false) String language,
            @RequestParam(value = "logo",         required = false) MultipartFile logo,
            @RequestParam(value = "heading",      required = false) String heading,
            @RequestParam(value = "TextArea",     required = false) String textArea,
            @RequestParam(value = "logoAlign",    required = false) String logoAlign,
            @RequestParam(value = "headingAlign", required = false) String headingAlign,
            @RequestParam(value = "TextAlign",    required = false) String TextAlign,
            @RequestParam(value = "appearence",   required = false) List<String> appearence
    ) {
        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equalsIgnoreCase(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only admin can update appearance.");
            }

            Optional<ScriptGenerate> optionalScript = scriptgeneraterepository.findById(id);
            if (optionalScript.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Script not found.");
            }

            ScriptGenerate script = optionalScript.get();
            if (language   != null) script.setLanguage(language);
            if (heading    != null) script.setHeading(heading);
            if (textArea   != null) script.setTextArea(textArea);
            if (logoAlign  != null) script.setLogoAlign(logoAlign);
            if (headingAlign != null) script.setHeadingAlign(headingAlign);
            if (TextAlign  != null) script.setTextAlign(TextAlign);
            if (appearence != null) script.setAppearence(appearence);
            if (logo != null && !logo.isEmpty()) script.setLogo(logo.getBytes());

            scriptgeneraterepository.save(script);
            return ResponseEntity.ok("Appearance updated successfully.");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error updating appearance: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/GetAppearance — fetch appearance for React admin panel
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping("/GetAppearance")
    @Transactional
    public ResponseEntity<AppearanceDto> getWidgetAppearance() {
        try {
            Optional<ScriptGenerate> scriptgenerateOpt =
                    scriptgeneraterepository.findFirstByOrderByIdAsc();

            if (scriptgenerateOpt.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            ScriptGenerate script = scriptgenerateOpt.get();
            AppearanceDto dto = new AppearanceDto();
            dto.setId(script.getId());
            dto.setPropertyName(script.getPropertyName());
            dto.setWebsiteURL(script.getWebsiteURL());
            dto.setWidgetScript(script.getWidgetScript());
            dto.setButtonColor(script.getButtonColor());
            dto.setLanguage(script.getLanguage());
            dto.setHeading(script.getHeading());
            dto.setTextArea(script.getTextArea());
            dto.setLogoAlign(script.getLogoAlign());
            dto.setHeadingAlign(script.getHeadingAlign());
            dto.setTextAlign(script.getTextAlign());
            dto.setAppearence(script.getAppearence());

            if (script.getLogo() != null && script.getLogo().length > 0) {
                dto.setLogoBase64(Base64.getEncoder().encodeToString(script.getLogo()));
            } else {
                dto.setLogoBase64(null);
            }
            return new ResponseEntity<>(dto, HttpStatus.OK);
        } catch (Exception e) {
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/property/generate — preview script (no DB save)
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/property/generate")
    public ResponseEntity<?> generatePropertyScript(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "scriptId", required = false) UUID scriptId,
            @RequestParam("propertyName")  String propertyName,
            @RequestParam("websiteURL")    String websiteURL,
            @RequestParam("buttonColor")   String buttonColor) {
        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only admin can generate widget.");
            }
            if (scriptId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("scriptId is required. Please create appearance first.");
            }
            Optional<ScriptGenerate> optionalScript = scriptgeneraterepository.findById(scriptId);
            if (optionalScript.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid scriptId.");
            }
            ScriptGenerate script = optionalScript.get();
            boolean isAppearanceSet =
                    (script.getHeading() != null && !script.getHeading().isBlank()) ||
                    (script.getTextArea() != null && !script.getTextArea().isBlank()) ||
                    (script.getLogo() != null && script.getLogo().length > 0);

            if (!isAppearanceSet) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("Appearance not set. Please set appearance before generating script.");
            }

            String widgetScript = generateWidgetScript(scriptId);
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(widgetScript);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error generating widget script: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/property/save — save property info and widget script
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping("/property/save")
    public ResponseEntity<?> savePropertyInfo(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "scriptId", required = false) UUID scriptId,
            @RequestParam("propertyName")  String propertyName,
            @RequestParam("websiteURL")    String websiteURL,
            @RequestParam("buttonColor")   String buttonColor,
            @RequestParam("widgetScript")  String widgetScript) {
        try {
            String role = jwtUtil.getRoleFromToken(token);
            if (!"ADMIN".equals(role)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body("Only admin can update property info.");
            }
            if (scriptId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body("scriptId is required.");
            }
            Optional<ScriptGenerate> optionalScript = scriptgeneraterepository.findById(scriptId);
            if (optionalScript.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid scriptId.");
            }
            ScriptGenerate script = optionalScript.get();
            script.setPropertyName(propertyName);
            script.setWebsiteURL(websiteURL);
            script.setButtonColor(buttonColor);
            script.setWidgetScript(widgetScript);
            scriptgeneraterepository.save(script);

            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(widgetScript);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error saving property info: " + e.getMessage());
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GET /chatbot/widget/{id} — serve embeddable JS (the login form widget)
    // Visitor website embeds: <script src=".../chatbot/widget/{id}"></script>
    // ─────────────────────────────────────────────────────────────────────────
    @GetMapping(value = "/widget/{id}", produces = "application/javascript")
    public ResponseEntity<String> serveWidgetScript(@PathVariable UUID id) {
        ScriptGenerate script = scriptgeneraterepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Widget not found"));

        String logoImg = (script.getLogo() != null)
                ? "<div style='text-align:" + script.getLogoAlign() + ";'>" +
                  "<img src='data:image/png;base64," +
                  Base64.getEncoder().encodeToString(script.getLogo()) +
                  "' class='chatbot-logo'></div>"
                : "";

        List<String> appearanceOrder = script.getAppearence();
        StringBuilder headerContent = new StringBuilder();
        if (appearanceOrder != null) {
            for (String item : appearanceOrder) {
                switch (item) {
                    case "Logo"     -> headerContent.append(logoImg);
                    case "Heading"  -> headerContent
                            .append("<div class='chatbot-heading' style='text-align:")
                            .append(script.getHeadingAlign()).append(";'>")
                            .append(script.getHeading()).append("</div>");
                    case "TextArea" -> headerContent
                            .append("<div class='chatbot-text' style='text-align:")
                            .append(script.getTextAlign()).append(";'>")
                            .append(script.getTextArea()).append("</div>");
                }
            }
        }

        String widgetHtml = """
            <style>
                #chatbot-launcher {
                    position:fixed;bottom:20px;right:20px;
                    width:60px;height:60px;background-color:%s;
                    border-radius:50%%;display:flex;align-items:center;
                    justify-content:center;cursor:pointer;
                    box-shadow:0 4px 8px rgba(0,0,0,0.2);z-index:9999;
                }
                #chatbot-launcher img { width:30px;height:30px; }
                #chatbot-panel {
                    position:fixed;bottom:90px;right:20px;width:370px;
                    background:white;border-radius:10px;
                    box-shadow:0 4px 16px rgba(0,0,0,0.2);
                    display:none;z-index:9999;font-family:Arial,sans-serif;overflow:hidden;
                }
                .chatbot-header { background-color:%s;padding:10px;color:white;text-align:center; }
                .chatbot-logo   { max-width:60px;max-height:60px;margin-bottom:5px;display:inline-block; }
                .chatbot-heading { font-size:20px; }
                .chatbot-text   { font-size:14px;margin-bottom:0; }
                #chatbot-body   {
                    display:flex;flex-direction:column;height:380px;
                    padding:5px;color:#333;text-align:left;
                }
                #chatbot-messages { flex:1;overflow-y:auto;padding:3px;margin-bottom:2px;font-size:14px;word-break:break-word; }
                .chatbot-form-title { font-size:18px;font-weight:bold;margin-bottom:15px; }
                .chatbot-form { display:flex;flex-direction:column;gap:30px;align-items:center; }
                .chatbot-form input {
                    padding:10px;width:90%%;border:1px solid #ccc;
                    border-radius:5px;font-size:14px;
                }
                .chatbot-form button {
                    background-color:%s;color:white;padding:10px;
                    width:90%%;border:none;border-radius:5px;cursor:pointer;font-size:14px;
                }
                .chatbot-input-container { display:flex;gap:10px; }
                #chatbot-user-input {
                    flex:1;padding:10px;border:1px solid #ccc;border-radius:5px;
                }
                #chatbot-send-button {
                    background-color:%s;color:white;border:none;
                    padding:10px 15px;border-radius:5px;cursor:pointer;
                }
            </style>
            <div id="chatbot-launcher">
                <img src="https://cdn-icons-png.flaticon.com/512/4712/4712027.png" alt="Chat">
            </div>
            <div id="chatbot-panel">
                <div class="chatbot-header">%s</div>
                <div id="chatbot-body">
                    <div class="chatbot-form-title">Start Chat</div>
                    <form class="chatbot-form">
                        <input type="text"  name="username" placeholder="Your Name"  required>
                        <input type="email" name="email"    placeholder="Your Email" required>
                        <button type="submit">➤ Start Chat</button>
                    </form>
                </div>
            </div>
            """.formatted(
                script.getButtonColor(), script.getButtonColor(),
                script.getButtonColor(), script.getButtonColor(),
                headerContent.toString()
        );

        String escapedHtml = widgetHtml
                .replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("`", "\\`")
                .replace("\n", "")
                .replace("\r", "");

        String js = """
            (function() {
                var wrapper = document.createElement('div');
                wrapper.innerHTML = `%s`;
                document.body.appendChild(wrapper);

                var launcher = document.getElementById('chatbot-launcher');
                var panel    = document.getElementById('chatbot-panel');

                if (launcher && panel) {
                    launcher.addEventListener('click', function () {
                        panel.style.display = (panel.style.display === 'none' || panel.style.display === '')
                            ? 'block' : 'none';
                    });
                }

                var form = document.querySelector('.chatbot-form');
                if (form) {
                    form.addEventListener('submit', function(event) {
                        event.preventDefault();
                        var username = form.querySelector('input[name="username"]').value;
                        var email    = form.querySelector('input[name="email"]').value;
                        var params   = new URLSearchParams();
                        params.append('username', username);
                        params.append('email',    email);

                        fetch('%s/chatbot/widget/chat/%s', {
                            method:  'POST',
                            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                            body:    params.toString()
                        })
                        .then(function(response) { return response.text(); })
                        .then(function(jsCode)   { eval(jsCode); })
                        .catch(function(err)     { console.error('Login failed:', err); });
                    });
                }
            })();
            """.formatted(escapedHtml, backendurl, id.toString());

        return ResponseEntity.ok(js);
    }
    

    // ─────────────────────────────────────────────────────────────────────────
    // POST /chatbot/widget/chat/{id}
    //
    // Called after visitor submits the login form.
    // Creates/retrieves UserInfo, then returns JS that:
    //   1. Shows the chat panel with welcome trigger content
    //   2. On first message: calls /api/chat/message (RAG proxy)
    //      → If RAG answers    (mode=AI)      : show AI reply, no WebSocket needed
    //      → If RAG has no answer (mode=PENDING): connect WebSocket for live agent
    // ─────────────────────────────────────────────────────────────────────────
    @PostMapping(value = "/widget/chat/{id}", produces = "application/javascript")
    public ResponseEntity<String> handleUserSubmit(
            @PathVariable UUID id,
            @RequestParam String username,
            @RequestParam String email) {

        try {
            String role = "USER";
            UserInfo user = userinforepository.findByEmail(email)
                    .orElseGet(() -> userinforepository.save(
                            new UserInfo(username, email, role)));

            String senderEmail = user.getEmail();

            ScriptGenerate script = scriptgeneraterepository.findById(id).orElse(null);
            if (script == null) {
                return ResponseEntity.ok("alert('Widget configuration not found.');");
            }

            Trigger trigger = triggerRepository.findByStatusTrue().orElse(null);
            if (trigger == null) {
                return ResponseEntity.ok("alert('No active trigger configured. Please set a trigger in admin panel.');");
            }

            String buttonColor = script.getButtonColor() != null
                    ? script.getButtonColor() : "#007bff";

            // ── Build header HTML ────────────────────────────────────────────
            StringBuilder headerContent = new StringBuilder();
            if (script.getAppearence() != null) {
                for (String item : script.getAppearence()) {
                    switch (item) {
                        case "Logo" -> {
                            if (script.getLogo() != null) {
                                String b64 = Base64.getEncoder().encodeToString(script.getLogo());
                                headerContent
                                        .append("<div style='text-align:").append(script.getLogoAlign()).append(";'>")
                                        .append("<img src='data:image/png;base64,").append(b64)
                                        .append("' class='chatbot-logo'></div>");
                            }
                        }
                        case "Heading" -> headerContent
                                .append("<div class='chatbot-heading' style='text-align:")
                                .append(script.getHeadingAlign()).append(";'>")
                                .append(escapeHtml(script.getHeading())).append("</div>");
                        case "TextArea" -> headerContent
                                .append("<div class='chatbot-text' style='text-align:")
                                .append(script.getTextAlign()).append(";'>")
                                .append(escapeHtml(script.getTextArea())).append("</div>");
                    }
                }
            }

            // ── Build welcome messages (trigger content) ─────────────────────
            StringBuilder welcomeMessages = new StringBuilder();
            if (trigger.getFirstTrigger() != null) {
                for (String item : trigger.getFirstTrigger()) {
                    switch (item) {
                        case "Text Area" -> {
                            if (trigger.getTextOption() != null) {
                                String textMsg = escapeHtml(trigger.getTextOption().getText());
                                welcomeMessages
                                        .append("<div style=\"background-color:").append(buttonColor)
                                        .append(";color:white;max-width:85%;font-size:14px;")
                                        .append("padding:10px;border-radius:5px;margin-bottom:5px;\">")
                                        .append(textMsg).append("</div>");
                            }
                        }
                        case "Department" -> {
                            if (!trigger.getDepartments().isEmpty()) {
                                welcomeMessages.append("<p style='font-weight:bold;'>Choose a department:</p>");
                                for (SetDepartment dept : trigger.getDepartments()) {
                                    welcomeMessages
                                            .append("<p class='chatbot-department' data-dept-id='")
                                            .append(dept.getDepId())
                                            .append("' style=\"background-color:").append(buttonColor)
                                            .append(";color:white;padding:10px;max-width:85%;font-size:14px;")
                                            .append("border-radius:5px;margin-bottom:3px;display:block;cursor:pointer;\">")
                                            .append(escapeHtml(dept.getName())).append("</p>");
                                }
                            }
                        }
                    }
                }
            }

            // FIX: use injected backendurl instead of hardcoded "http://localhost:8080"
            String baseUrl = backendurl;

            // ── Generate the chat panel JavaScript ───────────────────────────
            // FIXED FLOW:
            //   1. Visitor sees welcome message + department buttons
            //   2. Visitor clicks a department → chat input is ENABLED
            //   3. Visitor types a message → AI (RAG) handles it
            //   4. If AI cannot answer (mode=PENDING) → WebSocket escalation to live agent
            //   5. Agent sees the chat in their dashboard and can join/reply
            String chatPanelJs = String.format("""
                    (function() {
                        function loadScript(src, callback) {
                            var s = document.createElement('script');
                            s.src = src;
                            s.onload = callback;
                            document.head.appendChild(s);
                        }

                        loadScript("https://cdn.jsdelivr.net/npm/sockjs-client@1/dist/sockjs.min.js", function () {
                            loadScript("https://cdn.jsdelivr.net/npm/stompjs@2.3.3/lib/stomp.min.js", function () {

                                var senderEmail    = '%s';
                                var stompClient    = null;
                                var sessionId      = null;
                                var selectedDeptId = null;  // set when visitor picks a department
                                var mode           = 'WAITING_DEPT';  // WAITING_DEPT | RAG | PENDING | RESOLVED
                                var buttonColor    = '%s';

                                var panel = document.getElementById('chatbot-panel');
                                panel.innerHTML = `
                                    <div class="chatbot-header" style="background-color:${buttonColor};color:white;padding:10px;">
                                        %s
                                    </div>
                                    <div id="chatbot-messages" style="height:320px;overflow-y:auto;padding:10px;background:#f8f8f8;word-break:break-word;"></div>
                                    <div id="chatbot-typing-indicator" style="min-height:20px;padding:0 14px 4px;font-size:12px;color:#888;font-style:italic;display:none;"> Typing... </div>
                                    <div id="chatbot-file-preview" style="display:none;padding:6px 10px;border-top:1px solid #eee;background:#f8f9fa;font-size:12px;flex-direction:row;align-items:center;gap:8px;"></div>
                                    <div class="chatbot-input-container" style="padding:10px;display:flex;gap:8px;align-items:center;">
                                        <input type="file" id="chatbot-file-input" style="display:none;"
                                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx,.zip"/>
                                        <button id="chatbot-attach-button" title="Attach a file"
                                            disabled="true"
                                            style="background:#fff;border:1px solid #ccc;border-radius:6px;width:34px;height:34px;cursor:not-allowed;opacity:0.45;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">📎</button>
                                        <input type="text" id="chatbot-user-input"
                                            placeholder="Please select a department first..."
                                            disabled="true"
                                            style="flex:1;padding:8px;border:1px solid #ccc;border-radius:5px;background:#f0f0f0;"/>
                                        <button id="chatbot-send-button"
                                            disabled="true"
                                            style="background-color:#aaa;color:white;border:none;
                                                   padding:8px 14px;border-radius:5px;cursor:not-allowed;opacity:0.6;">Send</button>
                                    </div>
                                `;

                                var messagesEl = document.getElementById('chatbot-messages');
                                messagesEl.innerHTML = `%s`;

                                // ── File upload state ──────────────────────────────────────
                                var pendingFile = null;

                                // ── Helper: enable chat input after department is selected ──
                                function enableChatInput() {
                                    var inputEl    = document.getElementById('chatbot-user-input');
                                    var sendBtn    = document.getElementById('chatbot-send-button');
                                    var attachBtn  = document.getElementById('chatbot-attach-button');
                                    if (inputEl) {
                                        inputEl.disabled = false;
                                        inputEl.placeholder = 'Type your message...';
                                        inputEl.style.background = '';
                                        inputEl.focus();
                                    }
                                    if (sendBtn) {
                                        sendBtn.disabled = false;
                                        sendBtn.style.backgroundColor = buttonColor;
                                        sendBtn.style.cursor = 'pointer';
                                        sendBtn.style.opacity = '1';
                                    }
                                    if (attachBtn) {
                                        attachBtn.disabled = false;
                                        attachBtn.style.cursor = 'pointer';
                                        attachBtn.style.opacity = '1';
                                    }
                                }

                                // ── Helper: show file preview bar ─────────────────────────
                                function showFilePreview(file) {
                                    var bar = document.getElementById('chatbot-file-preview');
                                    if (!bar) return;
                                    bar.style.display = 'flex';
                                    var sizeStr = file.size < 1024 ? file.size + ' B'
                                                : file.size < 1048576 ? (file.size/1024).toFixed(1) + ' KB'
                                                : (file.size/1048576).toFixed(1) + ' MB';
                                    bar.innerHTML = '<span style="font-size:20px;">' + getFileIcon(file.type) + '</span>'
                                        + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escapeHtmlWidget(file.name) + ' <span style="color:#888;">(' + sizeStr + ')</span></span>'
                                        + '<button id="chatbot-remove-file" style="background:none;border:none;cursor:pointer;font-size:16px;color:#888;padding:0 4px;">✕</button>';
                                    var removeBtn = document.getElementById('chatbot-remove-file');
                                    if (removeBtn) removeBtn.onclick = function() { clearPendingFile(); };
                                }

                                function clearPendingFile() {
                                    pendingFile = null;
                                    var bar = document.getElementById('chatbot-file-preview');
                                    if (bar) { bar.style.display = 'none'; bar.innerHTML = ''; }
                                    var fi = document.getElementById('chatbot-file-input');
                                    if (fi) fi.value = '';
                                    // Restore send button text
                                    var sendBtn = document.getElementById('chatbot-send-button');
                                    if (sendBtn) sendBtn.textContent = 'Send';
                                }

                                function getFileIcon(type) {
                                    if (!type) return '📄';
                                    if (type.startsWith('image/')) return '🖼️';
                                    if (type.includes('pdf'))   return '📕';
                                    if (type.includes('word'))  return '📘';
                                    if (type.includes('excel') || type.includes('spreadsheet')) return '📗';
                                    if (type.includes('zip'))   return '🗜️';
                                    if (type.includes('text'))  return '📝';
                                    return '📄';
                                }

                                function escapeHtmlWidget(str) {
                                    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                                }

                                // ── Helper: append an ATTACHMENT bubble ───────────────────
                                function appendAttachment(msg) {
                                    var isUser = msg.role === 'USER';
                                    var outer = document.createElement('div');
                                    outer.style.display    = 'flex';
                                    outer.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
                                    outer.style.marginBottom = '8px';
                                    outer.style.clear = 'both';

                                    var bubble = document.createElement('div');
                                    bubble.style.maxWidth     = '75%%';
                                    bubble.style.borderRadius = '12px';
                                    bubble.style.overflow     = 'hidden';
                                    bubble.style.border       = isUser ? 'none' : '1px solid #dee2e6';
                                    bubble.style.background   = isUser ? buttonColor : '#fff';
                                    bubble.style.color        = isUser ? '#fff' : '#212529';

                                    if (msg.fileType && msg.fileType.startsWith('image/')) {
                                        bubble.innerHTML = '<a href="' + msg.fileUrl + '" target="_blank" style="display:block;">'
                                            + '<img src="' + msg.fileUrl + '" alt="' + escapeHtmlWidget(msg.fileName) + '" style="max-width:100%%;max-height:180px;display:block;border-radius:12px;"/>'
                                            + '</a>'
                                            + '<div style="padding:3px 8px;font-size:11px;opacity:0.75;">' + escapeHtmlWidget(msg.fileName) + '</div>';
                                    } else {
                                        bubble.style.padding = '10px 14px';
                                        bubble.style.display = 'flex';
                                        bubble.style.alignItems = 'center';
                                        bubble.style.gap = '10px';
                                        var sizeStr = msg.fileSize < 1048576
                                            ? (msg.fileSize/1024).toFixed(1) + ' KB'
                                            : (msg.fileSize/1048576).toFixed(1) + ' MB';
                                        bubble.innerHTML = '<span style="font-size:22px;">' + getFileIcon(msg.fileType) + '</span>'
                                            + '<div style="flex:1;min-width:0;">'
                                            + '<div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + escapeHtmlWidget(msg.fileName) + '</div>'
                                            + '<div style="font-size:11px;opacity:0.75;">' + sizeStr + '</div>'
                                            + '</div>'
                                            + '<a href="' + msg.fileUrl + '" target="_blank" download="' + escapeHtmlWidget(msg.fileName) + '" style="font-size:18px;text-decoration:none;color:' + (isUser ? '#fff' : buttonColor) + ';" title="Download">⬇</a>';
                                    }

                                    outer.appendChild(bubble);
                                    messagesEl.appendChild(outer);
                                    messagesEl.scrollTop = messagesEl.scrollHeight;
                                }

                                // ── Wire up file input ─────────────────────────────────────
                                var fileInputEl = document.getElementById('chatbot-file-input');
                                var attachBtnEl = document.getElementById('chatbot-attach-button');
                                if (attachBtnEl) {
                                    attachBtnEl.onclick = function() {
                                        if (fileInputEl && !attachBtnEl.disabled) fileInputEl.click();
                                    };
                                }
                                if (fileInputEl) {
                                    fileInputEl.onchange = function(e) {
                                        var file = e.target.files && e.target.files[0];
                                        if (!file) return;
                                        // Validate
                                        var maxSize = 10 * 1024 * 1024;
                                        var blocked = ['.exe','.bat','.sh','.cmd','.msi','.ps1','.vbs','.jar','.com','.pif','.scr','.reg','.dll'];
                                        var lname = file.name.toLowerCase();
                                        for (var bi = 0; bi < blocked.length; bi++) {
                                            if (lname.endsWith(blocked[bi])) {
                                                appendMessage('File type "' + blocked[bi] + '" is not allowed.', 'BOT');
                                                fileInputEl.value = '';
                                                return;
                                            }
                                        }
                                        if (file.size > maxSize) {
                                            appendMessage('File exceeds the 10 MB size limit.', 'BOT');
                                            fileInputEl.value = '';
                                            return;
                                        }
                                        pendingFile = file;
                                        showFilePreview(file);
                                        var sendBtn2 = document.getElementById('chatbot-send-button');
                                        if (sendBtn2) sendBtn2.textContent = '⬆ Send';
                                    };
                                }

                                // ── Helper: append a message bubble ───────────────────────
                                function appendMessage(text, role) {
                                    var d = document.createElement('div');
                                    // Use innerHTML with escaped text so newlines render as <br>
                                    // and long answers are fully displayed without truncation.
                                    var safeText = String(text || '')
                                        .replace(/&/g,'&amp;')
                                        .replace(/</g,'&lt;')
                                        .replace(/>/g,'&gt;')
                                        .replace(/"/g,'&quot;')
                                        .replace(/\\n/g,'<br>');
                                    d.innerHTML = safeText;
                                    d.style.marginBottom  = '8px';
                                    d.style.padding       = '8px 12px';
                                    d.style.borderRadius  = '10px';
                                    d.style.maxWidth      = '85%%';
                                    d.style.display       = 'inline-block';
                                    d.style.clear         = 'both';
                                    d.style.wordBreak     = 'break-word';
                                    d.style.whiteSpace    = 'normal';
                                    d.style.lineHeight    = '1.5';
                                    if (role === 'USER') {
                                        d.style.backgroundColor = buttonColor;
                                        d.style.color = 'white';
                                        d.style.float = 'right';
                                    } else if (role === 'SYSTEM') {
                                        d.style.color    = '#888';
                                        d.style.fontSize = '12px';
                                        d.style.textAlign = 'center';
                                        d.style.width    = '100%%';
                                        d.style.float    = 'none';
                                    } else {
                                        d.style.backgroundColor = '#e0e0e0';
                                        d.style.color  = 'black';
                                        d.style.float  = 'left';
                                    }
                                    messagesEl.appendChild(d);
                                    var br = document.createElement('div');
                                    br.style.clear = 'both';
                                    messagesEl.appendChild(br);
                                    messagesEl.scrollTop = messagesEl.scrollHeight;
                                }

                                // ── WebSocket connect (only after RAG returns PENDING) ─────
                                function connectWebSocket(sid) {
                                    var socket = new SockJS('%s/chat');
                                    stompClient = Stomp.over(socket);
                                    stompClient.debug = null;
									stompClient.connect({}, function () {
									    // ── Subscribe to chat messages ─────────────────────────────────────────
									    stompClient.subscribe('/topic/messages/' + sid, function (msg) {
									        var message = JSON.parse(msg.body);
									        if (message.role !== 'USER') {
									            // Hide agent typing indicator when a real message arrives
									            hideTypingIndicator();
									            // ── Render attachment bubble if this is a file message ──
									            if (message.messageType === 'ATTACHMENT' || message.fileName) {
									                appendAttachment(message);
									            } else {
									                appendMessage(message.content, message.role || 'BOT');
									            }
									            var isResolved = message.role === 'SYSTEM' &&
									                message.content &&
									                (message.content.toLowerCase().indexOf('resolved') !== -1 ||
									                 message.content.toLowerCase().indexOf('further assistance') !== -1);
									            if (isResolved) {
									                var inputEl = document.getElementById('chatbot-user-input');
									                var sendBtn = document.getElementById('chatbot-send-button');
									                if (inputEl) {
									                    inputEl.disabled = true;
									                    inputEl.placeholder = 'Chat resolved. Start a new chat for more help.';
									                    inputEl.style.backgroundColor = '#f5f5f5';
									                }
									                if (sendBtn) { sendBtn.disabled = true; sendBtn.style.opacity = '0.4'; }
									                mode = 'RESOLVED';
									            }
									        }
									    });
									 
									    // ── Subscribe to typing events ────────────────────────────────────────
									    stompClient.subscribe('/topic/typing/' + sid, function (msg) {
									        var payload = JSON.parse(msg.body);
									        // Only show the indicator when the AGENT is typing (not ourselves)
									        if (payload.role === 'AGENT') {
									            if (payload.typing) {
									                showTypingIndicator();
									            } else {
									                hideTypingIndicator();
									            }
									        }
									    });
									});
                                }

                                // ── Send a message via STOMP (live agent mode) ─────────────
                                function sendViaStomp(text) {
                                    if (!stompClient || !stompClient.connected) {
                                        appendMessage('Connection lost. Please refresh the page.', 'BOT');
                                        return;
                                    }
                                    stompClient.send('/app/send', {}, JSON.stringify({
                                        sessionId: sessionId,
                                        sender:    senderEmail,
                                        content:   text,
                                        role:      'USER'
                                    }));
                                }

                                // ── Send a message via RAG proxy (AI mode) ────────────────
                                function sendViaRag(text) {
                                    var inputEl = document.getElementById('chatbot-user-input');
                                    var btn     = document.getElementById('chatbot-send-button');
                                    if (inputEl) inputEl.disabled = true;
                                    if (btn)     btn.disabled     = true;

                                    var body = { sender: senderEmail, message: text };
                                    if (sessionId)      body.sessionId    = sessionId;
                                    if (selectedDeptId) body.departmentId = parseInt(selectedDeptId);

                                    fetch('%s/api/chat/message', {
                                        method:  'POST',     
                                        headers: { 'Content-Type': 'application/json' },
                                        body:    JSON.stringify(body)
                                    })
                                    .then(function(r) { return r.json(); })
                                    .then(function(data) {
                                        sessionId = data.sessionId || sessionId;

                                        if (data.mode === 'PENDING') {
                                            mode = 'PENDING';
                                            // Show the full escalation message from server
                                            var pendingMsg = data.response || 'Connecting you to a live agent, please wait...';
                                            appendMessage(pendingMsg, 'BOT');
                                            connectWebSocket(sessionId);
                                        } else {
                                            // Show the full AI answer — no length limit, no truncation.
                                            // Prefer data.response, fall back to data.answer (both are set by Python routes.py).
                                            // Only show a generic error if BOTH are missing/empty (true network/server failure).
                                            var answer = (data.response && data.response.trim())
                                                      || (data.answer  && data.answer.trim())
                                                      || '';
                                            if (answer) {
                                                appendMessage(answer, 'BOT');
                                            } else {
                                                appendMessage('Sorry, something went wrong. Please try again.', 'BOT');
                                            }
                                        }
                                    })
                                    .catch(function(err) {
                                        appendMessage('Connection error. Please try again.', 'BOT');
                                        console.error('[ChatWidget] RAG error:', err);
                                    })
                                    .finally(function() {
                                        if (inputEl) inputEl.disabled = false;
                                        if (btn)     btn.disabled     = false;
                                        if (inputEl) inputEl.focus();
                                    });
                                }

								// ── Typing indicator helpers ──────────────────────────────────────────────────
								function showTypingIndicator() {
								    var el = document.getElementById('chatbot-typing-indicator');
								    if (el) el.style.display = 'block';
								    // Auto-scroll so indicator is visible
								    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
								}
								 
								function hideTypingIndicator() {
								    var el = document.getElementById('chatbot-typing-indicator');
								    if (el) el.style.display = 'none';
								}
								 
								// ── Publish USER typing state to STOMP ────────────────────────────────────────
								var typingTimer = null;
								var isTyping    = false;
								 
								function publishTyping(state) {
								    if (!stompClient || !stompClient.connected || !sessionId) return;
								    stompClient.send('/app/typing', {}, JSON.stringify({
								        sessionId: sessionId,
								        sender:    senderEmail,
								        role:      'USER',
								        typing:    state
								    }));
								}
								 
								function onUserInputKeyup() {
								    if (!sessionId || mode !== 'PENDING') return;   // only when live session is active
								    if (!isTyping) {
								        isTyping = true;
								        publishTyping(true);
								    }
								    clearTimeout(typingTimer);
								    // Stop-typing after 2 s of inactivity
								    typingTimer = setTimeout(function() {
								        isTyping = false;
								        publishTyping(false);
								    }, 2000);
								}

                                // ── Main send handler ─────────────────────────────────────
								function doSend() {
								    if (mode === 'RESOLVED' || mode === 'WAITING_DEPT') { return; }
								    // Stop any pending typing notification
								    clearTimeout(typingTimer);
								    if (isTyping) { isTyping = false; publishTyping(false); }

								    // ── If a file is staged, upload it ────────────────────────
								    if (pendingFile) {
								        if (!sessionId) {
								            appendMessage('Please send a text message first to start the session.', 'BOT');
								            return;
								        }
								        var fileToSend = pendingFile;
								        clearPendingFile();
								        var fd = new FormData();
								        fd.append('file',       fileToSend);
								        fd.append('sessionId',  sessionId);
								        fd.append('uploadedBy', senderEmail);
								        fd.append('role',       'USER');
								        // Show a local pending bubble
								        appendAttachment({
								            role: 'USER',
								            fileName: fileToSend.name,
								            fileType: fileToSend.type,
								            fileSize: fileToSend.size,
								            fileUrl: '#'
								        });
								        fetch('%s/chat/upload-file', {
								            method: 'POST',
								            body: fd
								        })
								        .then(function(r) {
								            if (!r.ok) return r.text().then(function(t) { throw new Error(t); });
								            // Server broadcasts via WS — the real bubble will appear
								        })
								        .catch(function(err) {
								            appendMessage('File upload failed: ' + (err.message || err), 'BOT');
								        });
								        return;
								    }

                                    var inputEl = document.getElementById('chatbot-user-input');
                                    if (!inputEl) return;
                                    var text = inputEl.value.trim();
                                    if (!text) return;
                                    inputEl.value = '';

                                    appendMessage(text, 'USER');

                                    if (mode === 'PENDING') {
                                        sendViaStomp(text);
                                    } else {
                                        // RAG / AI mode — call proxy (carries deptId automatically)
                                        sendViaRag(text);
                                    }
                                }

                                // ── Department button click ────────────────────────────────
                                // FIXED: clicking a dept stores it and ENABLES the chat input.
                                // No message is required before clicking a department.
                                // The department is attached to all subsequent RAG messages.
                                document.addEventListener('click', function(e) {
                                    if (e.target && e.target.matches('.chatbot-department')) {
                                        if (mode !== 'WAITING_DEPT') { return; }

                                        selectedDeptId = e.target.getAttribute('data-dept-id');
                                        var deptName   = e.target.textContent.trim();

                                        // Visually mark selected department
                                        document.querySelectorAll('.chatbot-department').forEach(function(btn) {
                                            btn.style.opacity = '0.5';
                                            btn.style.cursor  = 'default';
                                        });
                                        e.target.style.opacity   = '1';
                                        e.target.style.outline   = '2px solid white';
                                        e.target.style.boxShadow = '0 0 0 2px ' + buttonColor;

                                        appendMessage('You selected: ' + deptName, 'SYSTEM');
                                        appendMessage('Hi! How can I help you today?', 'BOT');

                                        mode = 'RAG';
                                        enableChatInput();
                                    }
                                });

                                // ── Wire up Send button and Enter key ─────────────────────
                                var sendBtn = document.getElementById('chatbot-send-button');
                                var inputEl = document.getElementById('chatbot-user-input');
                                if (sendBtn) sendBtn.onclick = doSend;
								if (inputEl) {
								    inputEl.onkeydown = function(e) {
								        if (e.key === 'Enter') {
								            // Stop typing indicator immediately on send
								            clearTimeout(typingTimer);
								            isTyping = false;
								            publishTyping(false);
								            doSend();
								        }
								    };
								    inputEl.addEventListener('input', onUserInputKeyup);
								}
                            }); // end loadScript stomp
                        });     // end loadScript sockjs
                    })();
                    """,
                    escapeJs(senderEmail),
                    escapeJs(buttonColor),
                    escapeJsForTemplateLiteral(headerContent.toString()),
                    escapeJsForTemplateLiteral(welcomeMessages.toString()),
                    baseUrl,   // WebSocket URL for connectWebSocket()
                    baseUrl,   // RAG proxy URL for sendViaRag()
                    baseUrl    // file upload URL for doSend()
            );

            return ResponseEntity.ok(chatPanelJs);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok("alert('Server error: " + escapeJs(e.getMessage()) + "');");
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private String generateWidgetScript(UUID id) {
        return "<script async defer src='" + backendurl + "/chatbot/widget/" + id + "'></script>";
    }

    private String escapeJs(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("'", "\\'")
                    .replace("\n", "\\n")
                    .replace("\r", "");
    }

    private String escapeJsForTemplateLiteral(String input) {
        if (input == null) return "";
        return input.replace("\\", "\\\\")
                    .replace("`", "\\`")
                    .replace("${", "\\${")
                    .replace("\r", "")
                    .replace("\n", "\\n");
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&#x27;");
    }
}