// lib/features/chat_features/widgets/chat_note_sheet.dart
// Internal notes panel — visitor never sees these.

import 'package:flutter/material.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/chat_features_service.dart';

class ChatNoteSheet extends StatefulWidget {
  final String sessionId;
  const ChatNoteSheet({super.key, required this.sessionId});

  @override
  State<ChatNoteSheet> createState() => _ChatNoteSheetState();
}

class _ChatNoteSheetState extends State<ChatNoteSheet> {
  final _ctrl    = TextEditingController();
  List<ChatNote> _notes   = [];
  bool           _loading = true;
  bool           _saving  = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final notes = await ChatFeaturesService.instance.getNotes(widget.sessionId);
      if (mounted) setState(() { _notes = notes; _loading = false; });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    final text = _ctrl.text.trim();
    if (text.isEmpty) return;
    setState(() => _saving = true);
    try {
      await ChatFeaturesService.instance.addNote(
        sessionId: widget.sessionId,
        content:   text,
      );
      _ctrl.clear();
      await _load();
    } catch (e) {
      if (mounted) FloatingToast.show(context, message: 'Failed to save note');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _delete(ChatNote note) async {
    try {
      await ChatFeaturesService.instance.deleteNote(note.id);
      await _load();
    } catch (_) {}
  }

  String _formatTime(String ts) {
    try {
      final dt  = DateTime.parse(ts).toLocal();
      final h12 = dt.hour % 12 == 0 ? 12 : dt.hour % 12;
      final m   = dt.minute.toString().padLeft(2, '0');
      final p   = dt.hour < 12 ? 'am' : 'pm';
      return '$h12:$m$p  ${dt.day}/${dt.month}';
    } catch (_) { return ts; }
  }

  @override
  Widget build(BuildContext context) {
    final myEmail = AuthStore.instance.userEmail ?? '';
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFFFFFBEB), // warm yellow tint = note paper feel
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.7,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Center(
            child: Container(
              width: 36, height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              decoration: BoxDecoration(
                color: Colors.amber.shade300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 4),
            child: Row(
              children: [
                const Icon(Icons.sticky_note_2_outlined,
                    color: Colors.amber, size: 20),
                const SizedBox(width: 8),
                Text('Internal Notes', style: AppTextStyles.heading3),
                const SizedBox(width: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text('Private — visitor cannot see',
                      style: TextStyle(fontSize: 10, color: Colors.amber,
                          fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),

          const Divider(height: 1),

          // Existing notes list
          Flexible(
            child: _loading
                ? const Center(child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator()))
                : _notes.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.note_add_outlined,
                                size: 40, color: Colors.amber.shade200),
                            const SizedBox(height: 8),
                            Text('No notes yet. Add one below.',
                                style: AppTextStyles.bodySmall
                                    .copyWith(color: AppColors.textSecondary)),
                          ],
                        ),
                      )
                    : ListView.separated(
                        shrinkWrap: true,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        itemCount: _notes.length,
                        separatorBuilder: (_, __) => const Divider(height: 1),
                        itemBuilder: (_, i) {
                          final n = _notes[i];
                          final isMe = n.agentEmail == myEmail;
                          return Padding(
                            padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Icon(Icons.note_outlined,
                                    size: 16, color: Colors.amber),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        n.content,
                                        style: const TextStyle(
                                            fontSize: 14,
                                            color: Color(0xFF7B6012)),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${isMe ? 'You' : n.agentEmail}  •  ${_formatTime(n.timestamp)}',
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                if (isMe)
                                  IconButton(
                                    icon: const Icon(Icons.close,
                                        size: 16, color: AppColors.textSecondary),
                                    onPressed: () => _delete(n),
                                    padding: EdgeInsets.zero,
                                    constraints: const BoxConstraints(),
                                  ),
                              ],
                            ),
                          );
                        },
                      ),
          ),

          // Add note input
          Container(
            padding: EdgeInsets.fromLTRB(
                16, 10, 16, 10 + MediaQuery.of(context).padding.bottom),
            decoration: BoxDecoration(
              color: Colors.amber.shade50,
              border: Border(top: BorderSide(color: Colors.amber.shade200)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _ctrl,
                    maxLines: 3,
                    minLines: 1,
                    decoration: InputDecoration(
                      hintText: 'Add a private note…',
                      hintStyle: const TextStyle(color: AppColors.textHint),
                      filled: true,
                      fillColor: Colors.amber.shade100,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(10),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                          horizontal: 14, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                GestureDetector(
                  onTap: _saving ? null : _save,
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 200),
                    width: 42, height: 42,
                    decoration: BoxDecoration(
                      color: _saving ? Colors.amber.shade200 : Colors.amber.shade400,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: _saving
                        ? const Center(child: SizedBox(
                            width: 16, height: 16,
                            child: CircularProgressIndicator(
                                strokeWidth: 2, color: Colors.white)))
                        : const Icon(Icons.save_rounded,
                            color: Colors.white, size: 20),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
