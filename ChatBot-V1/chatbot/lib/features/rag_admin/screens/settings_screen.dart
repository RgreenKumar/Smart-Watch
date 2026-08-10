// lib/features/rag_admin/screens/settings_screen.dart  (MODIFIED)
// ─────────────────────────────────────────────────────────────────────────────
// Changes vs original:
//   1. initState() loads current settings from GET /api/admin/settings
//   2. _saveSettings() POSTs to /api/admin/settings with backend/key/model
//   3. _showResetDialog() → onConfirm calls DELETE /api/reset?confirm=true
//   4. _selectedBackend driven by API response (not hardcoded)
//   5. All UI structure, BackendOptionCard, AlertBanner UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────

import 'package:flutter/material.dart';
import '../models/rag_models.dart';
import '../services/rag_service.dart';
import '../widgets/alert_banner.dart';
import '../widgets/backend_option_card.dart';
import '../widgets/rag_card.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  LlmBackend _selectedBackend = LlmBackend.openrouter;
  final _apiKeyCtrl = TextEditingController();
  final _modelCtrl  = TextEditingController();
  bool _obscureKey  = true;
  bool _loading     = true;
  bool _saving      = false;
  AlertData? _settingsAlert;

  @override
  void initState() {
    super.initState();
    _loadSettings();
  }

  // ── CHANGED: load current settings from Python RAG ────────────────────────
  Future<void> _loadSettings() async {
    setState(() => _loading = true);
    try {
      final s = await RagService.instance.getSettings();
      if (!mounted) return;
      setState(() {
        _selectedBackend = _parseBackend(s.backend);
        _modelCtrl.text  = s.model;
        _loading         = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() { _loading = false; });
    }
  }

  LlmBackend _parseBackend(String b) {
    switch (b) {
      case 'local':      return LlmBackend.local;
      case 'auto':       return LlmBackend.auto;
      default:           return LlmBackend.openrouter;
    }
  }

  String _backendString(LlmBackend b) {
    switch (b) {
      case LlmBackend.local:       return 'local';
      case LlmBackend.auto:        return 'auto';
      case LlmBackend.openrouter:  return 'openrouter';
    }
  }

  // ── CHANGED: real save API call ───────────────────────────────────────────
  Future<void> _saveSettings() async {
    setState(() { _saving = true; _settingsAlert = null; });
    try {
      await RagService.instance.saveSettings(
        backend: _backendString(_selectedBackend),
        apiKey:  _apiKeyCtrl.text.trim().isNotEmpty ? _apiKeyCtrl.text.trim() : null,
        model:   _modelCtrl.text.trim().isNotEmpty  ? _modelCtrl.text.trim()  : null,
      );
      if (!mounted) return;
      setState(() {
        _saving = false;
        _settingsAlert = const AlertData(
          message: 'Settings saved and applied',
          type: AlertType.success,
        );
        if (_apiKeyCtrl.text.isNotEmpty) _apiKeyCtrl.clear();
      });
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _settingsAlert = null);
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _saving = false;
        _settingsAlert = AlertData(message: 'Save failed: $e', type: AlertType.error);
      });
    }
  }

  void _showResetDialog() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _ResetConfirmSheet(
        // ── CHANGED: real reset API call ─────────────────────────────────
        onConfirm: () async {
          Navigator.pop(context);
          try {
            await RagService.instance.resetVectorStore();
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Vector store wiped. All chunks deleted.'),
                  backgroundColor: RagAppColors.red,
                ),
              );
            }
          } catch (e) {
            if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(content: Text('Reset failed: $e')),
              );
            }
          }
        },
        onCancel: () => Navigator.pop(context),
      ),
    );
  }

  @override
  void dispose() {
    _apiKeyCtrl.dispose();
    _modelCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 100),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SectionHeader(
            title: 'Settings',
            subtitle: 'Admin controls for model credentials and vector store management',
          ),
          const SizedBox(height: 16),
          RagCard(
            label: 'LLM Backend',
            children: [
              BackendOptionCard(
                title: 'Local LLM',
                badgeLabel: 'LOCAL',
                isSafe: true,
                description: 'Uses the local GGUF model configured in `.env`.',
                isSelected: _selectedBackend == LlmBackend.local,
                onTap: () => setState(() => _selectedBackend = LlmBackend.local),
              ),
              const SizedBox(height: 10),
              BackendOptionCard(
                title: 'Online LLM',
                badgeLabel: 'CLOUD',
                isSafe: false,
                description: 'Uses OpenRouter with the API key and model stored in `.env`.',
                isSelected: _selectedBackend == LlmBackend.openrouter,
                onTap: () => setState(() => _selectedBackend = LlmBackend.openrouter),
              ),
              const SizedBox(height: 10),
              BackendOptionCard(
                title: 'Auto Switch',
                badgeLabel: 'AUTO',
                isSafe: true,
                description: 'Tries local first, then falls back to online if unavailable.',
                isSelected: _selectedBackend == LlmBackend.auto,
                onTap: () => setState(() => _selectedBackend = LlmBackend.auto),
              ),
              const SizedBox(height: 14),
              _SettingField(
                label: 'API KEY',
                child: TextField(
                  controller: _apiKeyCtrl,
                  obscureText: _obscureKey,
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 13, color: Colors.black),
                  decoration: InputDecoration(
                    hintText: 'sk-... (leave blank to keep current)',
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscureKey ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                        size: 18, color: RagAppColors.muted,
                      ),
                      onPressed: () => setState(() => _obscureKey = !_obscureKey),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              _SettingField(
                label: 'MODEL',
                child: TextField(
                  controller: _modelCtrl,
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 13, color: Colors.black),
                  decoration: const InputDecoration(
                    hintText: 'mistralai/mixtral-8x7b-instruct',
                  ),
                ),
              ),
              const SizedBox(height: 14),
              if (_settingsAlert != null) ...[
                AlertBanner(alert: _settingsAlert),
                const SizedBox(height: 14),
              ],
              _PrimaryButton(
                label: _saving ? 'Saving...' : 'Save Admin Settings',
                onTap: _saving ? null : _saveSettings,
              ),
              const SizedBox(height: 10),
              const Text(
                'Saving updates LLM_BACKEND, OPENROUTER_API_KEY, and OPENROUTER_MODEL in .env.',
                style: TextStyle(fontSize: 11, color: RagAppColors.muted, fontFamily: 'monospace', height: 1.6),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF5F5),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: RagAppColors.red.withOpacity(0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: const [
                    Icon(Icons.warning_amber_outlined, size: 16, color: RagAppColors.red),
                    SizedBox(width: 8),
                    Text('Danger Zone', style: RagAppTextStyles.dangerTitle),
                  ],
                ),
                const SizedBox(height: 8),
                const Text(
                  'Resetting permanently deletes all indexed chunks from ChromaDB. The chatbot will have no knowledge until you re-ingest documents. This cannot be undone.',
                  style: RagAppTextStyles.dangerDesc,
                ),
                const SizedBox(height: 16),
                _DangerButton(label: 'Reset Vector Store', onTap: _showResetDialog),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Sub-widgets (identical to original) ──────────────────────────────────────

class _SettingField extends StatelessWidget {
  final String label;
  final Widget child;
  const _SettingField({required this.label, required this.child});
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [Text(label, style: RagAppTextStyles.settingLabel), const SizedBox(height: 8), child],
    );
  }
}

class _PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onTap;
  const _PrimaryButton({required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedOpacity(
        duration: const Duration(milliseconds: 200),
        opacity: onTap != null ? 1.0 : 0.5,
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(vertical: 13),
          decoration: BoxDecoration(color: Colors.black, borderRadius: BorderRadius.circular(12)),
          child: Text(label, textAlign: TextAlign.center,
              style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white)),
        ),
      ),
    );
  }
}

class _DangerButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _DangerButton({required this.label, required this.onTap});
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 13),
        decoration: BoxDecoration(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: RagAppColors.red.withOpacity(0.6)),
        ),
        child: Text(label, textAlign: TextAlign.center,
            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: RagAppColors.red)),
      ),
    );
  }
}

class _ResetConfirmSheet extends StatelessWidget {
  final VoidCallback onConfirm;
  final VoidCallback onCancel;
  const _ResetConfirmSheet({required this.onConfirm, required this.onCancel});
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(color: RagAppColors.border),
          left: BorderSide(color: RagAppColors.border),
          right: BorderSide(color: RagAppColors.border),
        ),
      ),
      padding: EdgeInsets.fromLTRB(24, 24, 24, 24 + MediaQuery.of(context).padding.bottom),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(color: RagAppColors.border2, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          Row(children: const [
            Icon(Icons.warning_amber_outlined, size: 20, color: RagAppColors.red),
            SizedBox(width: 10),
            Text('Confirm Reset', style: RagAppTextStyles.dialogTitle),
          ]),
          const SizedBox(height: 12),
          RichText(
            text: const TextSpan(
              style: RagAppTextStyles.dialogBody,
              children: [
                TextSpan(text: 'This will permanently delete '),
                TextSpan(text: 'ALL indexed chunks',
                    style: TextStyle(color: Colors.black, fontWeight: FontWeight.w600)),
                TextSpan(text: ' from the vector store.\n\nAre you absolutely sure?'),
              ],
            ),
          ),
          const SizedBox(height: 24),
          GestureDetector(
            onTap: onConfirm,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 13),
              decoration: BoxDecoration(
                color: Colors.transparent,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: RagAppColors.red.withOpacity(0.6)),
              ),
              child: const Text('Yes, Reset Everything', textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: RagAppColors.red)),
            ),
          ),
          const SizedBox(height: 10),
          GestureDetector(
            onTap: onCancel,
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 13),
              decoration: BoxDecoration(
                color: RagAppColors.surface2,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: RagAppColors.border2),
              ),
              child: const Text('Cancel', textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black)),
            ),
          ),
        ],
      ),
    );
  }
}
