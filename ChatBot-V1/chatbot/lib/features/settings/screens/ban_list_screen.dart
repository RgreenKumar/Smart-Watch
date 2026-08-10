import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/chat_avatar.dart';
import '../../../core/widgets/floating_toast.dart';

class BanListScreen extends StatefulWidget {
  const BanListScreen({super.key});

  @override
  State<BanListScreen> createState() => _BanListScreenState();
}

class _BanListScreenState extends State<BanListScreen> {
  final List<Map<String, String>> _banned = [
    {
      'name': 'John Spammer',
      'email': 'spam@example.com',
      'ip': '192.168.1.101',
      'date': '12-Mar-2025',
    },
    {
      'name': 'Bot User 42',
      'email': 'bot42@fake.com',
      'ip': '10.0.0.42',
      'date': '18-Feb-2025',
    },
    {
      'name': 'Abusive Visitor',
      'email': 'abuse@mail.com',
      'ip': '172.16.0.55',
      'date': '05-Jan-2025',
    },
  ];

  void _unban(int index) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text('Unban User', style: AppTextStyles.heading3),
        content: Text(
            'Remove "${_banned[index]['name']}" from the ban list?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel',
                style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              setState(() => _banned.removeAt(index));
              FloatingToast.show(context, message: 'User unbanned');
            },
            child: const Text('Unban',
                style: TextStyle(color: AppColors.primary)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldBg,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Ban List'),
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(1),
          child: Divider(height: 1),
        ),
      ),
      body: _banned.isEmpty
          ? _emptyState()
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              physics: const ClampingScrollPhysics(),
              itemCount: _banned.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final entry = _banned[i];
                return Container(
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.scaffoldBg,
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.divider),
                    boxShadow: const [
                      BoxShadow(
                        color: Color.fromRGBO(0, 0, 0, 0.04),
                        blurRadius: 6,
                        offset: Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      // Avatar with red tint
                      Container(
                        width: 44,
                        height: 44,
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          shape: BoxShape.circle,
                          border: Border.all(
                              color: Colors.red.shade200, width: 1.5),
                        ),
                        child: Center(
                          child: Text(
                            entry['name']![0].toUpperCase(),
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                              color: Colors.red.shade600,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 12),
                      // Info
                      Expanded(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(entry['name']!,
                                style: AppTextStyles.bodyLarge
                                    .copyWith(
                                        fontWeight: FontWeight.w600)),
                            const SizedBox(height: 2),
                            Text(entry['email']!,
                                style: AppTextStyles.bodySmall),
                            const SizedBox(height: 2),
                            Row(
                              children: [
                                const Icon(Icons.router_outlined,
                                    size: 12,
                                    color: AppColors.textSecondary),
                                const SizedBox(width: 4),
                                Text(entry['ip']!,
                                    style: AppTextStyles.caption),
                                const SizedBox(width: 10),
                                const Icon(Icons.calendar_today_outlined,
                                    size: 12,
                                    color: AppColors.textSecondary),
                                const SizedBox(width: 4),
                                Text(entry['date']!,
                                    style: AppTextStyles.caption),
                              ],
                            ),
                          ],
                        ),
                      ),
                      // Unban button
                      GestureDetector(
                        onTap: () => _unban(i),
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.red.shade50,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                                color: Colors.red.shade200),
                          ),
                          child: Text(
                            'Unban',
                            style: TextStyle(
                              color: Colors.red.shade700,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shield_outlined, size: 64, color: AppColors.divider),
          const SizedBox(height: 16),
          Text('No banned users',
              style: AppTextStyles.bodyMedium
                  .copyWith(color: AppColors.textSecondary)),
          const SizedBox(height: 8),
          Text('The ban list is empty.',
              style: AppTextStyles.bodySmall),
        ],
      ),
    );
  }
}
