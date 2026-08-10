// lib/features/users/screens/users_screen.dart  (MODIFIED)
// Replaces UserMockData with real UserService.getAllUsers().
// All UI structure (appbar, search, list tiles) unchanged.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/constants.dart';
import '../../../core/utils/page_transition.dart';
import '../../../core/widgets/chat_avatar.dart';
import '../../../core/widgets/shadowed_app_bar.dart';
import '../services/user_service.dart';
import 'view_profile_screen.dart';

class UsersScreen extends StatefulWidget {
  const UsersScreen({super.key});

  @override
  State<UsersScreen> createState() => _UsersScreenState();
}

class _UsersScreenState extends State<UsersScreen> {
  final _searchCtrl = TextEditingController();
  List<VisitorDto> _all      = [];
  List<VisitorDto> _filtered = [];
  bool   _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() { _loading = true; _error = null; });
    try {
      final list = await UserService.instance.getAllUsers();
      if (!mounted) return;
      setState(() { _all = list; _filtered = List.from(list); _loading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() { _error = e.toString(); _loading = false; });
    }
  }

  void _search(String q) {
    setState(() {
      _filtered = _all.where((u) =>
          u.username.toLowerCase().contains(q.toLowerCase()) ||
          u.email.toLowerCase().contains(q.toLowerCase())).toList();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(148),
        child: ShadowedAppBar(
          height: 148,
          children: [
            AppBar(
              toolbarHeight: 80,
              backgroundColor: AppColors.scaffoldBg,
              elevation: 0,
              scrolledUnderElevation: 0,
              titleSpacing: 16,
              title: Row(children: [
                Image.asset('assets/images/chat.png', height: 80, fit: BoxFit.contain),
                const Spacer(),
                Text(AppConstants.propertyName,
                    style: AppTextStyles.heading3.copyWith(decoration: TextDecoration.underline, fontSize: 17)),
                const Spacer(),
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.primary,
                  child: const Text('M', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
                ),
              ]),
            ),
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 10),
              child: Container(
                height: 42,
                decoration: BoxDecoration(color: AppColors.surfaceBg, borderRadius: BorderRadius.circular(25)),
                child: TextField(
                  controller: _searchCtrl,
                  onChanged: _search,
                  decoration: const InputDecoration(
                    hintText: 'Search users...',
                    hintStyle: TextStyle(color: AppColors.textHint),
                    border: InputBorder.none,
                    prefixIcon: Icon(Icons.search, color: AppColors.textSecondary, size: 22),
                    isDense: true,
                    contentPadding: EdgeInsets.symmetric(vertical: 10),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _load,
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      // The /chatbot/users endpoint may not be in Spring yet
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
            const Icon(Icons.info_outline, size: 48, color: AppColors.divider),
            const SizedBox(height: 12),
            Text(
              'Visitor list is not available yet.\n\nAdd GET /chatbot/users to Spring Boot (see spring_additions/UserInfoController.java)',
              style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(onPressed: _load, child: const Text('Retry')),
          ]),
        ),
      );
    }
    if (_filtered.isEmpty) {
      return Center(child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
        Icon(Icons.people_outline_rounded, size: 64, color: AppColors.divider),
        const SizedBox(height: 14),
        Text(_searchCtrl.text.isEmpty ? 'No users yet' : 'No results',
            style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
      ]));
    }
    return ListView.separated(
      padding: const EdgeInsets.only(bottom: 110),
      physics: const AlwaysScrollableScrollPhysics(),
      itemCount: _filtered.length,
      separatorBuilder: (_, __) => const Divider(height: 1),
      itemBuilder: (_, i) {
        final u = _filtered[i];
        return ListTile(
          onTap: () => Navigator.push(
            context,
            DirectionalPageRoute(
              page: ViewProfileScreen(visitor: u),
              direction: SlideDirection.left,
            ),
          ),
          leading: ChatAvatar(label: u.username, radius: 22),
          title: Text(u.username, style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
          subtitle: Text(u.email, style: AppTextStyles.bodySmall),
          trailing: const Icon(Icons.chevron_right_rounded, color: AppColors.textSecondary),
        );
      },
    );
  }
}
