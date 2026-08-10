// lib/features/administration/screens/profile_overview_screen.dart  (MODIFIED)
// Replaces AdminMockData.profile with real ProfileService.getProfile() / saveProfile().

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/constants.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/profile_service.dart';

class ProfileOverviewScreen extends StatefulWidget {
  const ProfileOverviewScreen({super.key});

  @override
  State<ProfileOverviewScreen> createState() => _ProfileOverviewScreenState();
}

class _ProfileOverviewScreenState extends State<ProfileOverviewScreen> {
  final _nameCtrl = TextEditingController();
  final _urlCtrl  = TextEditingController();
  bool _isActive  = true;
  bool _loading   = true;
  bool _saving    = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _urlCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final profile = await ProfileService.instance.getProfile();
      if (!mounted) return;
      if (profile != null) {
        _nameCtrl.text = profile.name;
        _urlCtrl.text  = profile.url;
        _isActive      = profile.status;
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _save() async {
    final name = _nameCtrl.text.trim();
    final url  = _urlCtrl.text.trim();
    if (name.isEmpty) {
      FloatingToast.show(context, message: 'Profile name is required');
      return;
    }
    setState(() => _saving = true);
    try {
      await ProfileService.instance.saveProfile(name: name, status: _isActive, url: url);
      if (!mounted) return;
      AppConstants.propertyName = name; // update app bar everywhere
      FloatingToast.show(context, message: 'Profile saved successfully');
    } catch (e) {
      if (!mounted) return;
      FloatingToast.show(context, message: 'Save failed: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: _buildAppBar(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Profile Overview', style: AppTextStyles.heading2),
                  const SizedBox(height: 20),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: AppColors.scaffoldBg,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.divider),
                      boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const _FieldLabel(label: 'PROFILE NAME'),
                        const SizedBox(height: 8),
                        AppTextField(controller: _nameCtrl, label: '', hintText: 'Profile name'),
                        const SizedBox(height: 20),
                        const _FieldLabel(label: 'STATUS'),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                          decoration: BoxDecoration(
                            border: Border.all(color: AppColors.divider),
                            borderRadius: BorderRadius.circular(10),
                            color: AppColors.scaffoldBg,
                          ),
                          child: Row(children: [
                            Expanded(child: Text(_isActive ? 'Active' : 'Inactive', style: AppTextStyles.bodyLarge)),
                            Switch.adaptive(value: _isActive, onChanged: (v) => setState(() => _isActive = v), activeColor: AppColors.primary),
                          ]),
                        ),
                        const SizedBox(height: 20),
                        const _FieldLabel(label: 'PROFILE URL'),
                        const SizedBox(height: 8),
                        AppTextField(controller: _urlCtrl, label: '', hintText: 'https://yourwebsite.com', keyboardType: TextInputType.url),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),
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
                        onPressed: _saving ? null : _save,
                        style: ElevatedButton.styleFrom(minimumSize: const Size(90, 44)),
                        child: _saving
                            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                            : const Text('Save'),
                      ),
                    ],
                  ),
                ],
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
          title: const Text('Administration'),
          leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20), onPressed: () => Navigator.pop(context)),
          bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
        )),
    );
  }
}

class _FieldLabel extends StatelessWidget {
  final String label;
  const _FieldLabel({required this.label});
  @override
  Widget build(BuildContext context) {
    return Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.textSecondary, letterSpacing: 0.6));
  }
}
