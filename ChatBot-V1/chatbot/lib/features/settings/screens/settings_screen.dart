// lib/features/settings/screens/settings_screen.dart
// Added: Canned Responses under PRODUCTIVITY section.

import 'package:flutter/material.dart';
import '../../../core/services/auth_store.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/chat_avatar.dart';
import '../../../core/widgets/floating_toast.dart';
import '../../auth/screens/login_screen.dart';
import '../../auth/services/auth_service.dart';
import '../../administration/screens/administration_screen.dart';
import '../../chat_features/screens/canned_responses_screen.dart';
import 'account_settings_screen.dart';
import 'ban_list_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});
  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _doNotDisturb    = true;
  bool _notificationsOn = true;
  bool _soundOn         = true;
  bool _signingOut      = false;

  void _signOut() {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Sign Out', style: AppTextStyles.heading3),
        content: const Text('Are you sure you want to sign out?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel',
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              setState(() => _signingOut = true);
              try { await AuthService.instance.logout(); } catch (_) {}
              if (!mounted) return;
              Navigator.pushAndRemoveUntil(context,
                  MaterialPageRoute(builder: (_) => LoginScreen()), (_) => false);
            },
            child: const Text('Sign Out',
                style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final agent = AuthStore.instance;

    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(80),
        child: Material(
          elevation: 3, shadowColor: Colors.black12, color: AppColors.scaffoldBg,
          child: AppBar(
            backgroundColor: AppColors.scaffoldBg,
            elevation: 0,
            centerTitle: true,
            title: const Text('Settings'),
            bottom: const PreferredSize(
                preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
          ),
        ),
      ),
      body: _signingOut
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Profile card ──────────────────────────────────────────
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceBg,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: Row(children: [
                      ChatAvatar(label: agent.userName ?? 'A', radius: 28),
                      const SizedBox(width: 14),
                      Expanded(child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                        Text(agent.userName ?? '—',
                            style: AppTextStyles.bodyLarge
                                .copyWith(fontWeight: FontWeight.w700)),
                        Text(agent.userEmail ?? '—',
                            style: AppTextStyles.bodySmall),
                        const SizedBox(height: 4),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: AppColors.primary.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(agent.role ?? 'AGENT',
                              style: const TextStyle(
                                fontSize: 11, fontWeight: FontWeight.w700,
                                color: AppColors.primary)),
                        ),
                      ])),
                    ]),
                  ),

                  const SizedBox(height: 24),

                  // ── Preferences ───────────────────────────────────────────
                  _SectionLabel(label: 'PREFERENCES'),
                  const SizedBox(height: 10),
                  _SettingsTile(
                    icon: Icons.notifications_outlined,
                    title: 'Notifications',
                    trailing: Switch.adaptive(
                      value: _notificationsOn,
                      onChanged: (v) => setState(() => _notificationsOn = v),
                      activeColor: AppColors.primary,
                    ),
                  ),
                  _SettingsTile(
                    icon: Icons.volume_off_outlined,
                    title: 'Do Not Disturb',
                    trailing: Switch.adaptive(
                      value: _doNotDisturb,
                      onChanged: (v) => setState(() => _doNotDisturb = v),
                      activeColor: AppColors.primary,
                    ),
                  ),
                  _SettingsTile(
                    icon: Icons.music_note_outlined,
                    title: 'Sound',
                    trailing: Switch.adaptive(
                      value: _soundOn,
                      onChanged: (v) => setState(() => _soundOn = v),
                      activeColor: AppColors.primary,
                    ),
                  ),

                  const SizedBox(height: 24),

                  // ── PRODUCTIVITY (new section) ────────────────────────────
                  _SectionLabel(label: 'PRODUCTIVITY'),
                  const SizedBox(height: 10),
                  _SettingsTile(
                    icon: Icons.bolt_rounded,
                    title: 'Quick Replies',
                    subtitle: 'Create reusable message shortcuts',
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                        builder: (_) => CannedResponsesScreen())),
                  ),

                  const SizedBox(height: 24),

                  // ── Account ───────────────────────────────────────────────
                  _SectionLabel(label: 'ACCOUNT'),
                  const SizedBox(height: 10),
                  _SettingsTile(
                    icon: Icons.person_outline_rounded,
                    title: 'Account Settings',
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                        builder: (_) => AccountSettingsScreen())),
                  ),
                  _SettingsTile(
                    icon: Icons.block_rounded,
                    title: 'Ban List',
                    onTap: () => Navigator.push(context, MaterialPageRoute(
                        builder: (_) => BanListScreen())),
                  ),

                  const SizedBox(height: 24),

                  // ── Administration ────────────────────────────────────────
                  if (agent.isAdmin) ...[
                    _SectionLabel(label: 'ADMINISTRATION'),
                    const SizedBox(height: 10),
                    _SettingsTile(
                      icon: Icons.admin_panel_settings_outlined,
                      title: 'Administration',
                      color: AppColors.primary,
                      onTap: () => Navigator.push(context, MaterialPageRoute(
                          builder: (_) => AdministrationScreen())),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // ── Sign Out ──────────────────────────────────────────────
                  _SettingsTile(
                    icon: Icons.logout_rounded,
                    title: 'Sign Out',
                    color: Colors.red,
                    onTap: _signOut,
                  ),

                  const SizedBox(height: 110),
                ],
              ),
            ),
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String label;
  const _SectionLabel({required this.label});
  @override
  Widget build(BuildContext context) {
    return Text(label,
        style: const TextStyle(
            fontSize: 11, fontWeight: FontWeight.w700,
            color: AppColors.textSecondary, letterSpacing: 0.8));
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData   icon;
  final String     title;
  final String?    subtitle;
  final Widget?    trailing;
  final VoidCallback? onTap;
  final Color      color;

  const _SettingsTile({
    required this.icon,
    required this.title,
    this.subtitle,
    this.trailing,
    this.onTap,
    this.color = AppColors.textPrimary,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: AppColors.scaffoldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.divider),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 2),
        leading: Icon(icon, color: color, size: 22),
        title: Text(title,
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.w500, color: color)),
        subtitle: subtitle != null
            ? Text(subtitle!, style: AppTextStyles.bodySmall)
            : null,
        trailing: trailing ?? (onTap != null
            ? const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary)
            : null),
        onTap: onTap,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
