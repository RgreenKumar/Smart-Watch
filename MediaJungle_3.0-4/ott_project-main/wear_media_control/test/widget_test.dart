import 'package:flutter_test/flutter_test.dart';

import 'package:wear_media_control/main.dart';

void main() {
  testWidgets('watch home screen renders controls', (WidgetTester tester) async {
    await tester.pumpWidget(const WearMediaControlApp());
    await tester.pump();

    expect(find.text('Media Jungle'), findsOneWidget);
  });
}
