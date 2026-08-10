// test/unit/visitor_info_test.dart
//
// UNIT TESTS — VisitorInfo + CannedResponse + ChatNote models
// Run: flutter test test/unit/visitor_info_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:chat_app/features/chat_features/services/chat_features_service.dart';

void main() {

  // ════════════════════════════════════════════════════════════════════════════
  // VisitorInfo
  // ════════════════════════════════════════════════════════════════════════════

  group('VisitorInfo — parsing and computed properties', () {

    test('fromJson parses all fields', () {
      final epoch = DateTime.now().millisecondsSinceEpoch ~/ 1000;
      final json = {
        'visitorId': 'v-001',
        'page':      '/products',
        'username':  'Ram Kumar',
        'email':     'ram@test.com',
        'sessionId': 'sess-abc',
        'lastSeen':  epoch,
      };
      final v = VisitorInfo.fromJson(json);
      expect(v.visitorId,  'v-001');
      expect(v.page,       '/products');
      expect(v.username,   'Ram Kumar');
      expect(v.email,      'ram@test.com');
      expect(v.sessionId,  'sess-abc');
      expect(v.lastSeen,   epoch);
    });

    test('pageLabel truncates long URLs', () {
      final v = VisitorInfo(
        visitorId: 'v1', page: '/this/is/a/very/long/url/path/that/exceeds/limit',
        username: 'A', email: '', lastSeen: 0,
      );
      expect(v.pageLabel.length, lessThanOrEqualTo(36),
          reason: 'Long URLs should be truncated with ellipsis');
      expect(v.pageLabel.endsWith('…'), isTrue);
    });

    test('pageLabel returns "/" for empty page', () {
      final v = VisitorInfo(
        visitorId: 'v1', page: '',
        username: 'A', email: '', lastSeen: 0,
      );
      expect(v.pageLabel, '/');
    });

    test('Handles missing optional fields with defaults', () {
      final json = {
        'visitorId': 'v-min',
      };
      final v = VisitorInfo.fromJson(json as Map<String, dynamic>);
      expect(v.page,      '/');
      expect(v.username,  'Anonymous');
      expect(v.email,     '');
      expect(v.sessionId, isNull);
      expect(v.lastSeen,  0);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // CannedResponse filtering
  // ════════════════════════════════════════════════════════════════════════════

  group('CannedResponse — filterByQuery', () {

    final mockList = [
      CannedResponse(id: 1, shortcut: '/greet',   message: 'Hi, how can I help you today?'),
      CannedResponse(id: 2, shortcut: '/thanks',  message: 'Thank you for contacting us!'),
      CannedResponse(id: 3, shortcut: '/close',   message: 'Have a great day, goodbye!'),
      CannedResponse(id: 4, shortcut: '/pricing', message: 'Our pricing starts at ₹999/month'),
    ];

    final svc = ChatFeaturesService.instance;

    test('Empty query returns all results', () {
      final result = svc.filterByQuery(mockList, '');
      expect(result.length, 4);
    });

    test('Filter by shortcut prefix', () {
      final result = svc.filterByQuery(mockList, 'gree');
      expect(result.length, 1);
      expect(result.first.shortcut, '/greet');
    });

    test('Filter by message content', () {
      final result = svc.filterByQuery(mockList, 'Thank you');
      expect(result.length, 1);
      expect(result.first.shortcut, '/thanks');
    });

    test('Filter is case-insensitive', () {
      final result = svc.filterByQuery(mockList, 'PRICING');
      expect(result.length, 1);
      expect(result.first.shortcut, '/pricing');
    });

    test('No match returns empty list', () {
      final result = svc.filterByQuery(mockList, 'xyznotexist');
      expect(result, isEmpty);
    });

    test('Partial match finds multiple results', () {
      final result = svc.filterByQuery(mockList, 'a'); // 'thanks', 'have', 'great', 'pricing'
      expect(result.length, greaterThan(1));
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // UploadedFile helpers
  // ════════════════════════════════════════════════════════════════════════════

  group('UploadedFile — type and size labels', () {

    test('isImage true for jpg/png/gif/webp', () {
      final exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      for (final ext in exts) {
        final f = UploadedFile(url: '/', filename: 'test.$ext', size: 1000, ext: ext);
        expect(f.isImage, isTrue, reason: '$ext should be image');
      }
    });

    test('isImage false for non-image types', () {
      final exts = ['pdf', 'docx', 'txt', 'csv', 'zip'];
      for (final ext in exts) {
        final f = UploadedFile(url: '/', filename: 'test.$ext', size: 1000, ext: ext);
        expect(f.isImage, isFalse, reason: '$ext should NOT be image');
      }
    });

    test('sizeLabel shows bytes for small files', () {
      final f = UploadedFile(url: '/', filename: 'test.txt', size: 512, ext: 'txt');
      expect(f.sizeLabel, '512B');
    });

    test('sizeLabel shows KB for medium files', () {
      final f = UploadedFile(url: '/', filename: 'test.pdf', size: 2048, ext: 'pdf');
      expect(f.sizeLabel, contains('KB'));
    });

    test('sizeLabel shows MB for large files', () {
      final f = UploadedFile(url: '/', filename: 'test.zip', size: 5 * 1024 * 1024, ext: 'zip');
      expect(f.sizeLabel, contains('MB'));
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // AgentInfo
  // ════════════════════════════════════════════════════════════════════════════

  group('AgentInfo — status and display name', () {

    test('isOnline true only for ONLINE status', () {
      final online  = AgentInfo(id: 1, email: 'a@b.com', status: 'ONLINE');
      final away    = AgentInfo(id: 2, email: 'b@b.com', status: 'AWAY');
      final offline = AgentInfo(id: 3, email: 'c@b.com', status: 'OFFLINE');
      expect(online.isOnline,  isTrue);
      expect(away.isOnline,    isFalse);
      expect(offline.isOnline, isFalse);
    });

    test('isAway true only for AWAY status', () {
      final away = AgentInfo(id: 1, email: 'a@b.com', status: 'AWAY');
      expect(away.isAway, isTrue);
      expect(AgentInfo(id: 1, email: 'x@y.com', status: 'ONLINE').isAway, isFalse);
    });

    test('displayName shows username when available', () {
      final a = AgentInfo(id: 1, username: 'Deepika', email: 'd@co.com', status: 'ONLINE');
      expect(a.displayName, 'Deepika');
    });

    test('displayName falls back to email when username is empty', () {
      final a = AgentInfo(id: 1, username: '', email: 'd@co.com', status: 'ONLINE');
      expect(a.displayName, 'd@co.com');
    });

    test('fromJson parses correctly', () {
      final json = {'id': 5, 'username': 'Kumar', 'email': 'k@co.com', 'status': 'ONLINE'};
      final a = AgentInfo.fromJson(json);
      expect(a.id,          5);
      expect(a.username,    'Kumar');
      expect(a.isOnline,    isTrue);
    });
  });
}
