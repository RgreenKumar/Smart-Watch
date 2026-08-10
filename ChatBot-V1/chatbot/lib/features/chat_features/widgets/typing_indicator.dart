// lib/features/chat_features/widgets/typing_indicator.dart
// Animated "visitor is typing..." bubble shown in the chat screen.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';

class TypingIndicator extends StatefulWidget {
  final String senderName;
  const TypingIndicator({super.key, required this.senderName});

  @override
  State<TypingIndicator> createState() => _TypingIndicatorState();
}

class _TypingIndicatorState extends State<TypingIndicator>
    with TickerProviderStateMixin {
  late final List<AnimationController> _controllers;
  late final List<Animation<double>>   _anims;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(3, (i) => AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    ));
    _anims = _controllers.map((c) =>
        Tween<double>(begin: 0, end: 6).animate(
          CurvedAnimation(parent: c, curve: Curves.easeInOut),
        )).toList();

    // Stagger each dot by 150ms
    for (int i = 0; i < 3; i++) {
      Future.delayed(Duration(milliseconds: i * 150), () {
        if (mounted) _controllers[i].repeat(reverse: true);
      });
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10, left: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          Container(
            width: 28, height: 28,
            decoration: BoxDecoration(
              color: AppColors.primaryLight.withOpacity(0.4),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                widget.senderName.isNotEmpty
                    ? widget.senderName[0].toUpperCase()
                    : 'V',
                style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700,
                    color: AppColors.primary),
              ),
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: AppColors.surfaceBg,
              borderRadius: const BorderRadius.only(
                topLeft:     Radius.circular(14),
                topRight:    Radius.circular(14),
                bottomRight: Radius.circular(14),
                bottomLeft:  Radius.circular(4),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: List.generate(3, (i) => _Dot(animation: _anims[i])),
            ),
          ),
          const SizedBox(width: 8),
          Text(
            '${widget.senderName} is typing…',
            style: AppTextStyles.caption.copyWith(color: AppColors.textSecondary),
          ),
        ],
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final Animation<double> animation;
  const _Dot({required this.animation});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: animation,
      builder: (_, __) => Container(
        width: 7, height: 7,
        margin: const EdgeInsets.symmetric(horizontal: 2),
        decoration: BoxDecoration(
          color: AppColors.textSecondary.withOpacity(0.5 + (animation.value / 12)),
          shape: BoxShape.circle,
        ),
        transform: Matrix4.translationValues(0, -animation.value, 0),
      ),
    );
  }
}
