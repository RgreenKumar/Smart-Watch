import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../rag_admin/screens/rag_admin_screen.dart';
import 'profile_overview_screen.dart';
import 'channels_screen.dart';
import 'property_members_screen.dart';
import 'departments_screen.dart';
import 'triggers_screen.dart';

class AdministrationScreen extends StatelessWidget {
  const AdministrationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
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
            title: const Text('Administration'),
            leading: IconButton(
              icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
              onPressed: () => Navigator.pop(context),
            ),
            bottom: const PreferredSize(
              preferredSize: Size.fromHeight(1),
              child: Divider(height: 1),
            ),
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Section: Property ───────────────────────
            _SectionHeader(
              icon: Icons.business_outlined,
              label: 'PROPERTY',
            ),
            const SizedBox(height: 10),
            _AdminCard(
              children: [
                _AdminTile(
                  icon: Icons.manage_accounts_outlined,
                  title: 'Profile Overview',
                  subtitle: 'Name, status, and property URL',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ProfileOverviewScreen(),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ── Section: Channels ────────────────────────
            _SectionHeader(
              icon: Icons.settings_input_antenna_outlined,
              label: 'CHANNELS',
            ),
            const SizedBox(height: 10),
            _AdminCard(
              children: [
                _AdminTile(
                  icon: Icons.chat_bubble_outline_rounded,
                  title: 'Chat Widget',
                  subtitle: 'Widget code, color & URL setup',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ChannelsScreen(
                        initialTab: ChannelTab.chatWidget,
                      ),
                    ),
                  ),
                ),
                const Divider(height: 1, indent: 56),
                _AdminTile(
                  icon: Icons.view_compact_outlined,
                  title: 'Widget Content',
                  subtitle: 'Language, header cards & live preview',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const ChannelsScreen(
                        initialTab: ChannelTab.widgetContent,
                      ),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ── Section: Settings ────────────────────────
            _SectionHeader(
              icon: Icons.settings_outlined,
              label: 'SETTINGS',
            ),
            const SizedBox(height: 10),
            _AdminCard(
              children: [
                _AdminTile(
                  icon: Icons.bolt_outlined,
                  title: 'Triggers',
                  subtitle: 'Auto-messages triggered by visitor actions',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const TriggersScreen(),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ── Section: User Management ─────────────────
            _SectionHeader(
              icon: Icons.group_outlined,
              label: 'USER MANAGEMENT',
            ),
            const SizedBox(height: 10),
            _AdminCard(
              children: [
                _AdminTile(
                  icon: Icons.badge_outlined,
                  title: 'Property Members',
                  subtitle: 'Agents, roles and access control',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const PropertyMembersScreen(),
                    ),
                  ),
                ),
                const Divider(height: 1, indent: 56),
                _AdminTile(
                  icon: Icons.account_tree_outlined,
                  title: 'Departments',
                  subtitle: 'Organise agents into departments',
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const DepartmentsScreen(),
                    ),
                  ),
                ),
              ],
            ),

            const SizedBox(height: 24),

            // ── Section: RAG Admin ────────────────────────
            _SectionHeader(
              icon: Icons.hub_outlined,
              label: 'RAG ADMIN',
            ),
            const SizedBox(height: 10),
            _RagAdminBanner(
              onTap: () => Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (_) => const RagAdminScreen(),
                ),
              ),
            ),

            const SizedBox(height: 110),
          ],
        ),
      ),
    );
  }
}

// ── Reusable sub-widgets ─────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final IconData icon;
  final String label;
  const _SectionHeader({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 6),
        Text(
          label,
          style: const TextStyle(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.textSecondary,
            letterSpacing: 0.8,
          ),
        ),
      ],
    );
  }
}

class _AdminCard extends StatelessWidget {
  final List<Widget> children;
  const _AdminCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.scaffoldBg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.divider),
        boxShadow: const [
          BoxShadow(
            color: Color.fromRGBO(0, 0, 0, 0.04),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: Column(children: children),
    );
  }
}

class _AdminTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _AdminTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding:
          const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      leading: Container(
        width: 38,
        height: 38,
        decoration: BoxDecoration(
          color: AppColors.primary.withOpacity(0.1),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppColors.primary, size: 20),
      ),
      title: Text(title, style: AppTextStyles.bodyLarge),
      subtitle: Text(subtitle,
          style: AppTextStyles.caption.copyWith(fontSize: 12)),
      trailing: const Icon(Icons.chevron_right_rounded,
          color: AppColors.textSecondary),
      onTap: onTap,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(14)),
    );
  }
}

// ── RAG Admin Banner ─────────────────────────────────────

class _RagAdminBanner extends StatelessWidget {
  final VoidCallback onTap;
  const _RagAdminBanner({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.scaffoldBg,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.divider),
          boxShadow: const [
            BoxShadow(
              color: Color.fromRGBO(0, 0, 0, 0.04),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: ListTile(
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
          leading: Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.hub_outlined,
                color: AppColors.primary, size: 20),
          ),
          title: Text('RAG Admin Panel',
              style: AppTextStyles.bodyLarge),
          subtitle: Text(
            'Dashboard, upload docs, sources & settings',
            style: AppTextStyles.caption.copyWith(fontSize: 12),
          ),
          trailing: const Icon(Icons.chevron_right_rounded,
              color: AppColors.textSecondary),
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14)),
        ),
      ),
    );
  }
}
