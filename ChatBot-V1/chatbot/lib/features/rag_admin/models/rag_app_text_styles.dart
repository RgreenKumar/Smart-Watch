import 'package:flutter/material.dart';
import 'rag_app_colors.dart';

class RagAppTextStyles {
  RagAppTextStyles._();

  static const TextStyle sectionTitle = TextStyle(
    fontSize: 20, fontWeight: FontWeight.w700, color: Colors.black, letterSpacing: -0.2,
  );
  static const TextStyle sectionSub = TextStyle(
    fontSize: 12, fontWeight: FontWeight.w400, color: RagAppColors.muted,
  );
  static const TextStyle cardLabel = TextStyle(
    fontSize: 11, fontWeight: FontWeight.w600, color: RagAppColors.muted,
    letterSpacing: 1.0, fontFamily: 'monospace',
  );
  static const TextStyle modeName = TextStyle(
    fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black,
  );
  static const TextStyle modeNameSelected = TextStyle(
    fontSize: 14, fontWeight: FontWeight.w600, color: Colors.black,
  );
  static const TextStyle modeDesc = TextStyle(
    fontSize: 12, fontWeight: FontWeight.w400, color: RagAppColors.muted, height: 1.5,
  );
  static const TextStyle infoKey = TextStyle(
    fontSize: 12, fontWeight: FontWeight.w400, color: RagAppColors.muted, fontFamily: 'monospace',
  );
  static const TextStyle infoVal = TextStyle(
    fontSize: 13, fontWeight: FontWeight.w500, color: Colors.black,
  );
  static const TextStyle btnText = TextStyle(
    fontSize: 14, fontWeight: FontWeight.w600, color: Colors.white,
  );
  static const TextStyle btnTextDark = TextStyle(
    fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white,
  );
  static const TextStyle uploadTitle = TextStyle(
    fontSize: 15, fontWeight: FontWeight.w600, color: Colors.black,
  );
  static const TextStyle uploadSub = TextStyle(
    fontSize: 12, fontWeight: FontWeight.w400, color: RagAppColors.muted,
  );
  static const TextStyle docName = TextStyle(
    fontSize: 13, fontWeight: FontWeight.w500, color: Colors.black, fontFamily: 'monospace',
  );
  static const TextStyle docChunks = TextStyle(
    fontSize: 11, fontWeight: FontWeight.w400, color: RagAppColors.muted,
  );
  static const TextStyle settingLabel = TextStyle(
    fontSize: 12, fontWeight: FontWeight.w500, color: RagAppColors.muted,
    letterSpacing: 0.8, fontFamily: 'monospace',
  );
  static const TextStyle dangerTitle = TextStyle(
    fontSize: 14, fontWeight: FontWeight.w700, color: RagAppColors.red,
  );
  static const TextStyle dangerDesc = TextStyle(
    fontSize: 12, fontWeight: FontWeight.w400, color: RagAppColors.muted, height: 1.6,
  );
  static const TextStyle logoText = TextStyle(
    fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: 0.2,
  );
  static const TextStyle serverPill = TextStyle(
    fontSize: 11, fontWeight: FontWeight.w400, color: RagAppColors.muted, fontFamily: 'monospace',
  );
  static const TextStyle tabLabel = TextStyle(
    fontSize: 10, fontWeight: FontWeight.w600, letterSpacing: 0.2,
  );
  static const TextStyle badgeText = TextStyle(
    fontSize: 9, fontWeight: FontWeight.w700, fontFamily: 'monospace',
  );
  static const TextStyle dialogTitle = TextStyle(
    fontSize: 18, fontWeight: FontWeight.w700, color: RagAppColors.red,
  );
  static const TextStyle dialogBody = TextStyle(
    fontSize: 13, fontWeight: FontWeight.w400, color: RagAppColors.muted, height: 1.7,
  );
  static const TextStyle fileItemName = TextStyle(
    fontSize: 11, fontWeight: FontWeight.w400, color: Colors.black, fontFamily: 'monospace',
  );
  static const TextStyle fileItemSize = TextStyle(
    fontSize: 10, fontWeight: FontWeight.w400, color: RagAppColors.muted,
  );
  static const TextStyle alertText = TextStyle(
    fontSize: 13, fontWeight: FontWeight.w400, height: 1.5,
  );
  static const TextStyle progressText = TextStyle(
    fontSize: 11, fontWeight: FontWeight.w400, color: RagAppColors.muted, fontFamily: 'monospace',
  );
  static const TextStyle queueCount = TextStyle(
    fontSize: 11, fontWeight: FontWeight.w400, color: RagAppColors.muted,
    letterSpacing: 0.8, fontFamily: 'monospace',
  );
}
