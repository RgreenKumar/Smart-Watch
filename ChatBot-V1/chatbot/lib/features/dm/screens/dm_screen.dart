import 'package:flutter/material.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/services/api_client.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/floating_toast.dart';
import '../../users/models/user_model.dart';
import '../services/dm_service.dart';

class DMScreen extends StatefulWidget {
  const DMScreen({super.key});

  @override
  State<DMScreen> createState() => _DMScreenState();
}

class _DMScreenState extends State<DMScreen> {
  final _messageCtrl = TextEditingController();
  final _recipientSearchCtrl = TextEditingController();

  String? _senderEmail;
  DmRecipient? _selectedRecipient;
  List<DmRecipient> _recipients = [];
  bool _loadingRecipients = true;
  bool _sending = false;
  String? _error;
  String _query = '';

  @override
  void initState() {
    super.initState();
    _senderEmail = AuthStore.instance.userEmail ?? 'agent@gmail.com';
    _loadRecipients();
  }

  @override
  void dispose() {
    _messageCtrl.dispose();
    _recipientSearchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadRecipients({String query = ''}) async {
    setState(() {
      _loadingRecipients = true;
      _error = null;
      _query = query;
    });

    try {
      List<DmRecipient> list;
      try {
        list = await DmService.instance.fetchRecipients(query: query);
      } on ApiException {
        list = UserMockData.users
            .map((u) => DmRecipient(
                  id: int.tryParse(u.id.replaceAll(RegExp(r'\D'), '')) ?? 0,
                  name: u.name,
                  email: u.email,
                  role: 'USER',
                ))
            .toList();
      }

      final unique = <String, DmRecipient>{};
      for (final r in list) {
        if (r.email.trim().isEmpty) continue;
        unique[r.email.toLowerCase()] = r;
      }
      final recipients = unique.values.toList()
        ..sort((a, b) => a.email.toLowerCase().compareTo(b.email.toLowerCase()));

      if (!mounted) return;
      setState(() {
        _recipients = recipients;
        _loadingRecipients = false;
        if (_selectedRecipient != null) {
          final match = recipients.cast<DmRecipient?>().firstWhere(
                (r) => r?.email.toLowerCase() == _selectedRecipient!.email.toLowerCase(),
                orElse: () => null,
              );
          _selectedRecipient = match;
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loadingRecipients = false;
      });
    }
  }

  Future<void> _send() async {
    final recipient = _selectedRecipient;
    if (recipient == null) {
      FloatingToast.show(context,
          message: 'Please select a recipient', isError: true);
      return;
    }
    final message = _messageCtrl.text.trim();
    if (message.isEmpty) {
      FloatingToast.show(context,
          message: 'Please write a message', isError: true);
      return;
    }

    setState(() => _sending = true);
    try {
      await DmService.instance.sendDirectMessage(
        agentEmail: _senderEmail ?? 'agent@gmail.com',
        recipientEmail: recipient.email,
        recipientName: recipient.name,
        content: message,
        subject: 'Direct message',
      );
      if (!mounted) return;
      setState(() {
        _sending = false;
        _messageCtrl.clear();
      });
      FloatingToast.show(context,
          message: 'Message sent to ${recipient.email}');
    } catch (e) {
      if (!mounted) return;
      setState(() => _sending = false);
      FloatingToast.show(context,
          message: 'Failed to send message', isError: true);
    }
  }

  Future<void> _showRecipientPicker() async {
    _recipientSearchCtrl.text = _query;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => DraggableScrollableSheet(
        initialChildSize: 0.72,
        minChildSize: 0.45,
        maxChildSize: 0.95,
        expand: false,
        builder: (_, scrollCtrl) => Column(
          children: [
            Container(
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 4, 20, 12),
              child: Text('Select Recipient', style: AppTextStyles.heading3),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
              child: TextField(
                controller: _recipientSearchCtrl,
                textInputAction: TextInputAction.search,
                onSubmitted: (v) => _loadRecipients(query: v),
                onChanged: (v) => _loadRecipients(query: v),
                decoration: InputDecoration(
                  hintText: 'Search name or email',
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: AppColors.surfaceBg,
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),
            ),
            const Divider(height: 1),
            Expanded(
              child: _loadingRecipients
                  ? const Center(child: CircularProgressIndicator())
                  : _error != null
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(24),
                            child: Text(
                              _error!,
                              style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textSecondary),
                              textAlign: TextAlign.center,
                            ),
                          ),
                        )
                      : ListView.separated(
                          controller: scrollCtrl,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          itemCount: _recipients.length,
                          separatorBuilder: (_, __) =>
                              const Divider(height: 1, indent: 56),
                          itemBuilder: (_, i) {
                            final recipient = _recipients[i];
                            final isSelected = _selectedRecipient?.email.toLowerCase() ==
                                recipient.email.toLowerCase();
                            return ListTile(
                              leading: CircleAvatar(
                                backgroundColor: isSelected
                                    ? AppColors.primary
                                    : AppColors.surfaceBg,
                                child: Text(
                                  recipient.initials,
                                  style: TextStyle(
                                    color: isSelected
                                        ? Colors.white
                                        : AppColors.textSecondary,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              title: Text(recipient.email,
                                  style: AppTextStyles.bodyMedium),
                              subtitle: recipient.name != recipient.email
                                  ? Text(recipient.name,
                                      style: AppTextStyles.bodySmall)
                                  : null,
                              trailing: isSelected
                                  ? const Icon(Icons.check_circle_rounded,
                                      color: AppColors.primary)
                                  : null,
                              onTap: () {
                                setState(() => _selectedRecipient = recipient);
                                Navigator.pop(sheetContext);
                              },
                            );
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final sender = _senderEmail ?? 'agent@gmail.com';
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(72),
        child: Material(
          elevation: 3,
          shadowColor: Colors.black12,
          color: AppColors.scaffoldBg,
          child: AppBar(
            backgroundColor: AppColors.scaffoldBg,
            elevation: 0,
            centerTitle: true,
            title: const Text('Direct Message'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
              onPressed: () => Navigator.maybePop(context),
            ),
            bottom: const PreferredSize(
              preferredSize: Size.fromHeight(1),
              child: Divider(height: 1),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _EmailField(
              label: 'From :',
              value: sender,
              readOnly: true,
            ),
            const SizedBox(height: 16),
            GestureDetector(
              onTap: _showRecipientPicker,
              child: _EmailField(
                label: 'To :',
                value: _selectedRecipient?.email ?? 'Select recipient...',
                readOnly: true,
                isPlaceholder: _selectedRecipient == null,
                suffix: const Icon(
                  Icons.expand_more_rounded,
                  color: AppColors.textSecondary,
                  size: 20,
                ),
              ),
            ),
            const SizedBox(height: 16),
            Container(
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.divider),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TextField(
                controller: _messageCtrl,
                maxLines: 7,
                style: AppTextStyles.bodyLarge,
                decoration: const InputDecoration(
                  hintText:
                      'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
                  hintStyle: TextStyle(
                      color: AppColors.textHint, fontSize: 14),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.all(16),
                ),
              ),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton(
                onPressed: (_sending || _loadingRecipients) ? null : _send,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF28A745),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12)),
                  elevation: 0,
                ),
                child: _sending
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                            color: Colors.white, strokeWidth: 2.5),
                      )
                    : const Text(
                        'Send',
                        style: TextStyle(
                            color: Colors.white,
                            fontSize: 17,
                            fontWeight: FontWeight.w600),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmailField extends StatelessWidget {
  final String label;
  final String value;
  final bool readOnly;
  final bool isPlaceholder;
  final Widget? suffix;

  const _EmailField({
    required this.label,
    required this.value,
    this.readOnly = false,
    this.isPlaceholder = false,
    this.suffix,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        border: Border.all(color: AppColors.divider),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Text(
            label,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w500,
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              value,
              overflow: TextOverflow.ellipsis,
              style: AppTextStyles.bodyMedium.copyWith(
                color: isPlaceholder ? AppColors.textHint : AppColors.textPrimary,
              ),
            ),
          ),
          if (suffix != null) suffix!,
        ],
      ),
    );
  }
}
