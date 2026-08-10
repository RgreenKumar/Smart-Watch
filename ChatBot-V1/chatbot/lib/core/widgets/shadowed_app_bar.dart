import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

/// Wraps a Column of widgets in a Material with elevation shadow.
/// Use as the PreferredSize child for a custom AppBar.
class ShadowedAppBar extends StatelessWidget implements PreferredSizeWidget {
  final double height;
  final List<Widget> children;

  const ShadowedAppBar({
    super.key,
    required this.height,
    required this.children,
  });

  @override
  Size get preferredSize => Size.fromHeight(height);

  @override
  Widget build(BuildContext context) {
    return Material(
      elevation: 3,
      shadowColor: const Color.fromRGBO(0, 0, 0, 0.12),
      color: AppColors.scaffoldBg,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: children,
      ),
    );
  }
}
