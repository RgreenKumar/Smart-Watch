// lib/features/rag_admin/screens/rag_admin_screen.dart  (MODIFIED)
// ─────────────────────────────────────────────────────────────────────────────
// Changes vs original:
//   1. initState() polls RagService.isOnline() instead of a fixed delay
//   2. Polls every 30 seconds to keep the online pill accurate
//   3. All UI structure (header, tabs, bottom nav) UNCHANGED
// ─────────────────────────────────────────────────────────────────────────────

import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../models/rag_app_colors.dart';
import '../models/rag_app_text_styles.dart';
import '../services/rag_service.dart';
import 'upload_screen.dart';
import 'documents_screen.dart';
import 'settings_screen.dart';

class RagAdminScreen extends StatefulWidget {
  const RagAdminScreen({super.key});

  @override
  State<RagAdminScreen> createState() => _RagAdminScreenState();
}

class _RagAdminScreenState extends State<RagAdminScreen> {
  int  _currentIndex = 0;
  bool _isOnline     = false;
  Timer? _pollTimer;

  final List<Widget> _pages = const [
    UploadScreen(),
    DocumentsScreen(),
    SettingsScreen(),
  ];

  final List<_TabItem> _tabs = const [
    _TabItem(iconAsset: 'assets/icons/upload.png',   label: 'Upload'),
    _TabItem(iconAsset: 'assets/icons/docs.png',     label: 'Docs'),
    _TabItem(iconAsset: 'assets/icons/settings.png', label: 'Settings'),
  ];

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ));
    // CHANGED: real health check
    _checkOnline();
    _pollTimer = Timer.periodic(const Duration(seconds: 30), (_) => _checkOnline());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _checkOnline() async {
    final online = await RagService.instance.isOnline();
    if (mounted) setState(() => _isOnline = online);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: RagAppColors.navy,
      body: Stack(
        children: [
          Column(
            children: [
              _RagHeader(isOnline: _isOnline),
              Expanded(
                child: IndexedStack(
                  index: _currentIndex,
                  children: _pages,
                ),
              ),
            ],
          ),
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: _RagBottomNav(
              tabs: _tabs,
              currentIndex: _currentIndex,
              onTap: (i) => setState(() => _currentIndex = i),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Header (unchanged) ────────────────────────────────────────────────────────

class _RagHeader extends StatelessWidget {
  final bool isOnline;
  const _RagHeader({required this.isOnline});

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top;
    return Container(
      padding: EdgeInsets.fromLTRB(20, topPadding + 10, 20, 12),
      decoration: const BoxDecoration(
        color: RagAppColors.surface,
        border: Border(bottom: BorderSide(color: RagAppColors.border)),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: const Padding(
              padding: EdgeInsets.only(right: 12),
              child: Icon(Icons.arrow_back_ios_new_rounded, size: 18, color: Colors.black),
            ),
          ),
          Container(
            width: 34, height: 34,
            decoration: BoxDecoration(
              color: const Color(0xFF5C1AA8),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.hub_outlined, color: Colors.white, size: 18),
          ),
          const SizedBox(width: 10),
          const Text('RAG Admin',
              style: TextStyle(fontSize: 16, fontWeight: FontWeight.w700,
                  color: Colors.black, letterSpacing: 0.2)),
          const Spacer(),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: RagAppColors.surface2,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: RagAppColors.border),
            ),
            child: Row(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: 7, height: 7,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isOnline ? RagAppColors.online : RagAppColors.offline,
                  ),
                ),
                const SizedBox(width: 6),
                Text(
                  isOnline ? 'Online' : 'Offline',
                  style: RagAppTextStyles.serverPill,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Tab Item + Bottom Nav (unchanged) ─────────────────────────────────────────

class _TabItem {
  final String iconAsset;
  final String label;
  const _TabItem({required this.iconAsset, required this.label});
}

class _RagBottomNav extends StatelessWidget {
  final List<_TabItem> tabs;
  final int currentIndex;
  final ValueChanged<int> onTap;
  const _RagBottomNav({required this.tabs, required this.currentIndex, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final bottomPadding = MediaQuery.of(context).padding.bottom;
    return Container(
      height: 68 + bottomPadding,
      decoration: const BoxDecoration(
        color: RagAppColors.surface,
        border: Border(top: BorderSide(color: RagAppColors.border)),
      ),
      child: Row(
        children: List.generate(tabs.length, (i) {
          final isActive = currentIndex == i;
          return Expanded(
            child: GestureDetector(
              onTap: () => onTap(i),
              behavior: HitTestBehavior.opaque,
              child: Padding(
                padding: EdgeInsets.only(top: 8, bottom: bottomPadding),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 250),
                      width: isActive ? 36 : 0, height: 2,
                      margin: const EdgeInsets.only(bottom: 6),
                      decoration: BoxDecoration(
                        color: Colors.black,
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                    AnimatedOpacity(
                      duration: const Duration(milliseconds: 200),
                      opacity: isActive ? 1.0 : 0.35,
                      child: ColorFiltered(
                        colorFilter: const ColorFilter.mode(Colors.black, BlendMode.srcIn),
                        child: Image.asset(tabs[i].iconAsset,
                            width: isActive ? 24 : 22, height: isActive ? 24 : 22),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(tabs[i].label,
                        style: RagAppTextStyles.tabLabel.copyWith(
                          color: isActive ? RagAppColors.navActive : RagAppColors.navInactive,
                        )),
                  ],
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}
