// lib/features/chat_features/widgets/transfer_sheet.dart
// Bottom sheet for transferring a chat session to another agent.

import 'package:flutter/material.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/chat_avatar.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/chat_features_service.dart';

class TransferSheet extends StatefulWidget {
  final String   sessionId;
  final String   visitorName;
  final VoidCallback? onTransferred;

  const TransferSheet({
    super.key,
    required this.sessionId,
    required this.visitorName,
    this.onTransferred,
  });

  @override
  State<TransferSheet> createState() => _TransferSheetState();
}

class _TransferSheetState extends State<TransferSheet> {
  List<AgentInfo> _agents   = [];
  bool _loading    = true;
  String? _selected;
  bool _transferring = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final agents = await ChatFeaturesService.instance.getOnlineAgents();
      final myEmail = AuthStore.instance.userEmail ?? '';
      if (mounted) setState(() {
        // Exclude current agent from list
        _agents  = agents.where((a) => a.email != myEmail).toList();
        _loading = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _transfer() async {
    if (_selected == null) return;
    setState(() => _transferring = true);
    try {
      await ChatFeaturesService.instance.transferChat(
        sessionId:    widget.sessionId,
        toAgentEmail: _selected!,
      );
      if (!mounted) return;
      Navigator.pop(context);
      FloatingToast.show(context,
          message: 'Chat transferred successfully');
      widget.onTransferred?.call();
    } catch (e) {
      if (!mounted) return;
      setState(() => _transferring = false);
      FloatingToast.show(context, message: 'Transfer failed: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.65,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Center(
            child: Container(
              width: 36, height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 12),
              decoration: BoxDecoration(
                  color: AppColors.divider, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  const Icon(Icons.swap_horiz_rounded,
                      color: AppColors.primary, size: 22),
                  const SizedBox(width: 8),
                  Text('Transfer Chat', style: AppTextStyles.heading3),
                ]),
                const SizedBox(height: 4),
                Text(
                  'Transfer "${widget.visitorName}" to another online agent.',
                  style: AppTextStyles.bodySmall
                      .copyWith(color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          Flexible(
            child: _loading
                ? const Center(child: Padding(
                    padding: EdgeInsets.all(32),
                    child: CircularProgressIndicator()))
                : _agents.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.person_off_outlined,
                                size: 40, color: AppColors.divider),
                            const SizedBox(height: 10),
                            Text(
                              'No other agents are online right now.\nAsk an agent to come online first.',
                              textAlign: TextAlign.center,
                              style: AppTextStyles.bodySmall
                                  .copyWith(color: AppColors.textSecondary),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        shrinkWrap: true,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        itemCount: _agents.length,
                        separatorBuilder: (_, __) => const Divider(height: 1, indent: 16),
                        itemBuilder: (_, i) {
                          final a = _agents[i];
                          final sel = _selected == a.email;
                          return InkWell(
                            onTap: () => setState(() => _selected = a.email),
                            child: Padding(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 12),
                              child: Row(
                                children: [
                                  ChatAvatar(label: a.displayName, radius: 20),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(a.displayName,
                                            style: AppTextStyles.bodyLarge
                                                .copyWith(fontWeight: FontWeight.w600)),
                                        Text(a.email, style: AppTextStyles.bodySmall),
                                      ],
                                    ),
                                  ),
                                  // Online indicator
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF22C55E).withOpacity(0.12),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Text('Online',
                                        style: TextStyle(fontSize: 11,
                                            fontWeight: FontWeight.w700,
                                            color: Color(0xFF22C55E))),
                                  ),
                                  const SizedBox(width: 10),
                                  // Radio
                                  AnimatedContainer(
                                    duration: const Duration(milliseconds: 150),
                                    width: 22, height: 22,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: sel ? AppColors.primary : AppColors.divider,
                                        width: sel ? 6 : 2,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),

          // Transfer button
          Padding(
            padding: EdgeInsets.fromLTRB(
                16, 12, 16, 12 + MediaQuery.of(context).padding.bottom),
            child: SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: (_selected == null || _transferring) ? null : _transfer,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: AppColors.divider,
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                ),
                child: _transferring
                    ? const SizedBox(width: 20, height: 20,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2.5))
                    : Text(
                        _selected == null ? 'Select an agent' : 'Transfer Now',
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
