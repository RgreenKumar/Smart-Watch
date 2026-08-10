import 'package:flutter/material.dart';
import '../theme/app_colors.dart';

class ChatAvatar extends StatelessWidget {
  final String label;
  final double radius;
  final Color? bgColor;
  final bool hasOnlineRing;

  const ChatAvatar({
    super.key,
    required this.label,
    this.radius = 22,
    this.bgColor,
    this.hasOnlineRing = false,
  });

  static const List<Color> _colors = [
    Color(0xFF7B3FE4),
    Color(0xFF9C4DFF),
    Color(0xFFDA70FF),
    Color(0xFF6366F1),
    Color(0xFF8B5CF6),
  ];

  Color get _resolvedColor {
    if (bgColor != null) return bgColor!;
    final index = label.isNotEmpty
        ? label.codeUnitAt(0) % _colors.length
        : 0;
    return _colors[index];
  }

  @override
  Widget build(BuildContext context) {
    final avatar = Container(
      width: radius * 2,
      height: radius * 2,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [_resolvedColor, _resolvedColor.withOpacity(0.75)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          label.isNotEmpty ? label[0].toUpperCase() : '?',
          style: TextStyle(
            color: Colors.white,
            fontSize: radius * 0.75,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );

    if (!hasOnlineRing) return avatar;

    return Stack(
      clipBehavior: Clip.none,
      children: [
        avatar,
        Positioned(
          bottom: 0,
          right: 0,
          child: Container(
            width: radius * 0.6,
            height: radius * 0.6,
            decoration: BoxDecoration(
              color: const Color(0xFF22C55E),
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 1.5),
            ),
          ),
        ),
      ],
    );
  }
}

/// Small compact avatar used in chat sub-rows (agent name row)
class MiniAvatar extends StatelessWidget {
  final String label;
  final double size;
  final Color? color;

  const MiniAvatar({
    super.key,
    required this.label,
    this.size = 18,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: color ?? AppColors.primary,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          label.isNotEmpty ? label[0].toUpperCase() : '?',
          style: TextStyle(
            color: Colors.white,
            fontSize: size * 0.55,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}
