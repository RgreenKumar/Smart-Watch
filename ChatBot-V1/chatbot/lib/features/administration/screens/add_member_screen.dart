// lib/features/administration/screens/add_member_screen.dart  (MODIFIED)
// Sends email invitation via POST /chatbot/invite.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/admin_service.dart';

class AddMemberScreen extends StatefulWidget {
  final VoidCallback onSaved;

  const AddMemberScreen({super.key, required this.onSaved});

  @override
  State<AddMemberScreen> createState() => _AddMemberScreenState();
}

class _AddMemberScreenState extends State<AddMemberScreen> {
  final _formKey   = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  String _selectedRole = 'AGENT';
  bool   _saving       = false;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      await AdminService.instance.inviteAgent(
        email: _emailCtrl.text.trim(),
        role:  _selectedRole,
      );
      if (!mounted) return;
      widget.onSaved();
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      FloatingToast.show(context, message: 'Invite failed: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: _buildAppBar(),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Invite Member', style: AppTextStyles.heading2),
              const SizedBox(height: 8),
              Text(
                'An email invitation will be sent to the address below.',
                style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 24),
              AppTextField(
                controller: _emailCtrl,
                label: 'Email Address',
                hintText: 'agent@yourcompany.com',
                keyboardType: TextInputType.emailAddress,
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return 'Email is required';
                  if (!RegExp(r'\S+@\S+\.\S+').hasMatch(v)) return 'Enter a valid email';
                  return null;
                },
              ),
              const SizedBox(height: 20),
              Text('Role', style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              ...['AGENT', 'ADMIN'].map((role) {
                return RadioListTile<String>(
                  value: role,
                  groupValue: _selectedRole,
                  onChanged: (v) => setState(() => _selectedRole = v!),
                  title: Text(role, style: AppTextStyles.bodyLarge),
                  subtitle: Text(
                    role == 'ADMIN'
                        ? 'Full access: manage departments, triggers, and members'
                        : 'Can view and respond to assigned chat sessions',
                    style: AppTextStyles.bodySmall,
                  ),
                  activeColor: AppColors.primary,
                  contentPadding: EdgeInsets.zero,
                );
              }),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(minimumSize: const Size(90, 44)),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: _saving ? null : _send,
                    style: ElevatedButton.styleFrom(minimumSize: const Size(90, 44)),
                    child: _saving
                        ? const SizedBox(width: 18, height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                        : const Text('Send Invite'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(72),
      child: Material(elevation: 3, shadowColor: Colors.black12, color: AppColors.scaffoldBg,
        child: AppBar(
          backgroundColor: AppColors.scaffoldBg, elevation: 0, centerTitle: true,
          title: const Text('Add Member'),
          leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20), onPressed: () => Navigator.pop(context)),
          bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
        )),
    );
  }
}
