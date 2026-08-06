import 'package:flutter/material.dart';

class Dimensions {
  static double screenWidth(BuildContext context) => 
      MediaQuery.of(context).size.width;

  // Base sizes are designed for a standard screen width (e.g., iPhone 12: 390)
  static double fontSize(BuildContext context, double baseSize) =>
      screenWidth(context) * (baseSize / 390);

  static double iconSize(BuildContext context, double baseSize) =>
      screenWidth(context) * (baseSize / 390);
}