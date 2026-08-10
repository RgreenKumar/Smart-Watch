// lib/features/app_root.dart
//
// FIX: Use IndexedStack so ALL tab pages stay alive in memory.
// Previously AnimatedSwitcher disposed the DashboardScreen when switching tabs,
// destroying any pushed routes (like ActiveChatScreen) along with it.
// IndexedStack keeps every page mounted, so chats remain open across tab switches.

import 'package:flutter/material.dart';
import '../core/widgets/custom_bottom_nav.dart';
import 'chats/screens/chat_list_screen.dart';
import 'users/screens/users_screen.dart';
import 'dashboard/screens/dashboard_screen.dart';
import 'dm/screens/dm_screen.dart';
import 'settings/screens/settings_screen.dart';

class AppRoot extends StatefulWidget {
  const AppRoot({super.key});

  @override
  State<AppRoot> createState() => _AppRootState();
}

class _AppRootState extends State<AppRoot> {
  int _currentIndex = 0;

  // Pages are created once and kept alive by IndexedStack.
  // Using UniqueKey() forces recreation — we use ValueKey so they're stable.
  final List<Widget> _pages = const [
    ChatListScreen(key: ValueKey('chats')),
    UsersScreen(key: ValueKey('users')),
    DashboardScreen(key: ValueKey('dashboard')),
    DMScreen(key: ValueKey('dm')),
    SettingsScreen(key: ValueKey('settings')),
  ];

  void _onTabTap(int index) {
    if (index == _currentIndex) return;
    setState(() => _currentIndex = index);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      // IndexedStack keeps all pages alive — switching tabs never disposes any page.
      // This means the WebSocket subscription, scroll position, and any open
      // Navigator routes inside each tab are all preserved.
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: CustomBottomNav(
        currentIndex: _currentIndex,
        onTap: _onTabTap,
      ),
    );
  }
}
