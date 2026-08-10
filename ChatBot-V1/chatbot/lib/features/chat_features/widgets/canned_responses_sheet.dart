// lib/features/chat_features/widgets/canned_responses_sheet.dart
// Bottom sheet that shows matching canned responses as agent types "/".
// Also used for full browse via toolbar button.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../services/chat_features_service.dart';

class CannedResponseSheet extends StatefulWidget {
  final List<CannedResponse> responses;
  final String initialQuery;
  final void Function(String message) onSelect;

  const CannedResponseSheet({
    super.key,
    required this.responses,
    required this.initialQuery,
    required this.onSelect,
  });

  @override
  State<CannedResponseSheet> createState() => _CannedResponseSheetState();
}

class _CannedResponseSheetState extends State<CannedResponseSheet> {
  late TextEditingController _searchCtrl;
  late List<CannedResponse> _filtered;

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController(text: widget.initialQuery);
    _filtered   = ChatFeaturesService.instance
        .filterByQuery(widget.responses, widget.initialQuery);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _search(String q) {
    setState(() {
      _filtered = ChatFeaturesService.instance
          .filterByQuery(widget.responses, q);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      constraints: BoxConstraints(
        maxHeight: MediaQuery.of(context).size.height * 0.6,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Center(
            child: Container(
              width: 36, height: 4,
              margin: const EdgeInsets.only(top: 12, bottom: 8),
              decoration: BoxDecoration(
                color: AppColors.divider,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 0, 20, 8),
            child: Row(
              children: [
                const Icon(Icons.bolt_rounded, color: AppColors.primary, size: 20),
                const SizedBox(width: 8),
                Text('Quick Replies', style: AppTextStyles.heading3),
                const Spacer(),
                Text('${_filtered.length} match', style: AppTextStyles.bodySmall),
              ],
            ),
          ),

          // Search
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: TextField(
              controller: _searchCtrl,
              onChanged: _search,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'Search shortcuts…',
                prefixText: '/',
                prefixStyle: const TextStyle(
                    color: AppColors.primary, fontWeight: FontWeight.w700),
                filled: true,
                fillColor: AppColors.surfaceBg,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 10),
              ),
            ),
          ),

          const Divider(height: 1),

          // Results
          Flexible(
            child: _filtered.isEmpty
                ? Padding(
                    padding: const EdgeInsets.all(32),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.search_off_rounded,
                            size: 36, color: AppColors.divider),
                        const SizedBox(height: 8),
                        Text('No shortcuts match',
                            style: AppTextStyles.bodyMedium
                                .copyWith(color: AppColors.textSecondary)),
                      ],
                    ),
                  )
                : ListView.separated(
                    shrinkWrap: true,
                    itemCount: _filtered.length,
                    separatorBuilder: (_, __) => const Divider(height: 1, indent: 16),
                    itemBuilder: (_, i) {
                      final cr = _filtered[i];
                      return InkWell(
                        onTap: () {
                          Navigator.pop(context);
                          widget.onSelect(cr.message);
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 20, vertical: 12),
                          child: Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 8, vertical: 3),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text(
                                  cr.shortcut,
                                  style: const TextStyle(
                                    fontSize: 12,
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.primary,
                                    fontFamily: 'monospace',
                                  ),
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  cr.message,
                                  style: AppTextStyles.bodyMedium,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              const Icon(Icons.chevron_right_rounded,
                                  color: AppColors.textSecondary, size: 18),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
          SizedBox(height: MediaQuery.of(context).padding.bottom),
        ],
      ),
    );
  }
}
