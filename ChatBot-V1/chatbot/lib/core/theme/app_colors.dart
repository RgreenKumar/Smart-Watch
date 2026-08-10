import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // ── Brand / Primary ──────────────────────────────────────
  static const Color primary       = Color(0xFF7B3FE4); // main purple
  static const Color primaryDark   = Color(0xFF2B145F); // deep navy-purple
  static const Color primaryLight  = Color(0xFFA855F7); // light violet
  static const Color accent        = Color(0xFFFFB800); // gold/yellow

  // ── Backgrounds ──────────────────────────────────────────
  static const Color scaffoldBg    = Color(0xFFFFFFFF);
  static const Color surfaceBg     = Color(0xFFF3F4F6);
  static const Color chatOpenBg    = Color(0xFFFFF1F3);
  static const Color profileInfoBg = Color(0xFFFFEAEA);

  // ── Text ─────────────────────────────────────────────────
  static const Color textPrimary   = Color(0xFF111111);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textHint      = Color(0xFF9CA3AF);
  static const Color textLink      = Color(0xFF7B3FE4);

  // ── Status badges ────────────────────────────────────────
  static const Color statusOpen    = Color(0xFFFFB800);
  static const Color statusClosed  = Color(0xFF9CA3AF);
  static const Color statusNew     = Color(0xFF7B3FE4);
  static const Color missedRed     = Color(0xFFEF4444);

  // ── Border / Divider ─────────────────────────────────────
  static const Color divider       = Color(0xFFE6E6E6);
  static const Color borderLight   = Color(0xFFE6E6F0);

  // ── Bottom nav ───────────────────────────────────────────
  static const Color navActive     = Color(0xFF2B145F);
  static const Color navInactive   = Color(0xFF9B97B8);
  static const Color navBg         = Color(0xFFF9F7F7);
}
