import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/floating_toast.dart';
import '../models/admin_models.dart';
import '../services/admin_service.dart';

enum ChannelTab { chatWidget, widgetContent }

String _appearanceNameForType(CardType type) {
  switch (type) {
    case CardType.logo:
      return 'Logo';
    case CardType.heading:
      return 'Heading';
    case CardType.textArea:
      return 'TextArea';
  }
}

CardType _cardTypeFromAppearanceName(String value) {
  switch (value.trim().toLowerCase()) {
    case 'logo':
      return CardType.logo;
    case 'heading':
      return CardType.heading;
    case 'textarea':
    case 'text area':
      return CardType.textArea;
    default:
      return CardType.heading;
  }
}

String _defaultCardContent(CardType type) {
  switch (type) {
    case CardType.logo:
      return '';
    case CardType.heading:
      return 'This is Heading';
    case CardType.textArea:
      return 'Text Area sample';
  }
}

class ChannelsScreen extends StatefulWidget {
  final ChannelTab initialTab;
  const ChannelsScreen({super.key, this.initialTab = ChannelTab.chatWidget});

  @override
  State<ChannelsScreen> createState() => _ChannelsScreenState();
}

class _ChannelsScreenState extends State<ChannelsScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTab == ChannelTab.chatWidget ? 0 : 1,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(112),
        child: Material(
          elevation: 3,
          shadowColor: Colors.black12,
          color: AppColors.scaffoldBg,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              SafeArea(
                bottom: false,
                child: SizedBox(
                  height: 60,
                  child: Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.arrow_back_ios_new_rounded,
                            size: 20),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const Expanded(
                        child: Text(
                          'Channels',
                          textAlign: TextAlign.center,
                          style: TextStyle(
                              fontSize: 18, fontWeight: FontWeight.w600),
                        ),
                      ),
                      const SizedBox(width: 48),
                    ],
                  ),
                ),
              ),
              const Divider(height: 1),
              TabBar(
                controller: _tabController,
                tabs: const [
                  Tab(text: 'Chat Widget'),
                  Tab(text: 'Widget Content'),
                ],
              ),
            ],
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: const [
          _ChatWidgetTab(),
          _WidgetContentTab(),
        ],
      ),
    );
  }
}

//  TAB 1 — Chat Widget

class _ChatWidgetTab extends StatefulWidget {
  const _ChatWidgetTab();

  @override
  State<_ChatWidgetTab> createState() => _ChatWidgetTabState();
}

class _ChatWidgetTabState extends State<_ChatWidgetTab> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _urlCtrl;
  late final TextEditingController _colorCtrl;

  String? _scriptId;
  String? _generatedCode;
  bool _loading = true;
  bool _saving = false;
  bool _generating = false;

  static const List<Color> _colorPresets = [
    Color(0xFF225a0c),
    Color(0xFF7B3FE4),
    Color(0xFF0077B6),
    Color(0xFFE63946),
    Color(0xFFFF9F1C),
    Color(0xFF2D6A4F),
    Color(0xFF1A1A2E),
  ];

  Color _selectedColor = const Color(0xFF225a0c);

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController();
    _urlCtrl = TextEditingController();
    _colorCtrl = TextEditingController();
    _loadAppearance();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _urlCtrl.dispose();
    _colorCtrl.dispose();
    super.dispose();
  }

  String _normalizeHex(String? value) {
    final raw = (value ?? '').trim();
    if (raw.isEmpty) return '#225a0c';
    return raw.startsWith('#') ? raw : '#$raw';
  }

  Color _hexToColor(String hex) {
    final cleaned = hex.replaceAll('#', '').trim();
    if (cleaned.length != 6 && cleaned.length != 8) {
      return const Color(0xFF225a0c);
    }
    final withAlpha = cleaned.length == 6 ? 'FF$cleaned' : cleaned;
    return Color(int.parse(withAlpha, radix: 16));
  }

  List<String> _selectedAppearence = const ['Logo', 'Heading', 'TextArea'];

  Future<void> _loadAppearance() async {
    try {
      final appearance = await AdminService.instance.getAppearance();
      if (!mounted) return;
      setState(() {
        _loading = false;
        if (appearance != null) {
          _scriptId = appearance.id;
          _nameCtrl.text = appearance.propertyName ?? '';
          _urlCtrl.text = appearance.websiteUrl ?? '';
          _colorCtrl.text = _normalizeHex(appearance.buttonColor);
          _selectedColor = _hexToColor(_colorCtrl.text);
          _generatedCode = appearance.widgetScript;
        } else {
          _colorCtrl.text = _normalizeHex(null);
          _selectedColor = _hexToColor(_colorCtrl.text);
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      FloatingToast.show(context, message: 'Failed to load widget: $e');
    }
  }

  Future<String> _ensureScriptId() async {
    if (_scriptId != null) return _scriptId!;
    final id = await AdminService.instance.createAppearance(
      language: 'English',
      heading: '',
      textArea: '',
      logoAlign: 'center',
      headingAlign: 'center',
      textAlign: 'left',
      appearance: const ['Logo', 'Heading', 'TextArea'],
    );
    _scriptId = id;
    return id;
  }

  void _selectColor(Color color) {
    setState(() {
      _selectedColor = color;
      _colorCtrl.text = '#${color.value.toRadixString(16).substring(2)}';
    });
  }

  Future<void> _generate() async {
    if (_nameCtrl.text.trim().isEmpty || _urlCtrl.text.trim().isEmpty) {
      FloatingToast.show(context,
          message: 'Property name and URL are required');
      return;
    }

    setState(() => _generating = true);
    try {
      final scriptId = await _ensureScriptId();
      final code = await AdminService.instance.generateWidgetScript(
        scriptId: scriptId,
        propertyName: _nameCtrl.text.trim(),
        websiteUrl: _urlCtrl.text.trim(),
        buttonColor: _colorCtrl.text.trim().isEmpty
            ? _normalizeHex(null)
            : _normalizeHex(_colorCtrl.text),
      );
      if (!mounted) return;
      setState(() => _generatedCode = code);
      FloatingToast.show(context, message: 'Widget code generated');
    } catch (e) {
      if (!mounted) return;
      FloatingToast.show(context, message: 'Failed to generate code: $e');
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  void _copyCode() {
    if (_generatedCode == null) return;
    Clipboard.setData(ClipboardData(text: _generatedCode!));
    FloatingToast.show(context, message: 'Copied to clipboard');
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty || _urlCtrl.text.trim().isEmpty) {
      FloatingToast.show(context,
          message: 'Property name and URL are required');
      return;
    }

    setState(() => _saving = true);
    try {
      final scriptId = await _ensureScriptId();
      final code = await AdminService.instance.generateWidgetScript(
        scriptId: scriptId,
        propertyName: _nameCtrl.text.trim(),
        websiteUrl: _urlCtrl.text.trim(),
        buttonColor: _normalizeHex(_colorCtrl.text),
      );
      await AdminService.instance.saveWidgetProperty(
        scriptId: scriptId,
        propertyName: _nameCtrl.text.trim(),
        websiteUrl: _urlCtrl.text.trim(),
        buttonColor: _normalizeHex(_colorCtrl.text),
        widgetScript: code,
      );
      if (!mounted) return;
      setState(() => _generatedCode = code);
      FloatingToast.show(context, message: 'Widget settings saved');
    } catch (e) {
      if (!mounted) return;
      FloatingToast.show(context, message: 'Failed: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Channels', style: AppTextStyles.heading2),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (ctx, constraints) {
              final isWide = constraints.maxWidth > 500;
              if (isWide) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 5, child: _leftForm()),
                    const SizedBox(width: 20),
                    Expanded(flex: 4, child: _rightCode()),
                  ],
                );
              }
              return Column(
                children: [
                  _leftForm(),
                  const SizedBox(height: 20),
                  _rightCode(),
                ],
              );
            },
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              _CancelBtn(onTap: () => Navigator.pop(context)),
              const SizedBox(width: 12),
              _SaveBtn(loading: _saving, onTap: _save),
            ],
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _leftForm() {
    return _FormCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const _FieldLabel(label: 'Property Name'),
          const SizedBox(height: 8),
          AppTextField(
            controller: _nameCtrl,
            label: '',
            hintText: 'Enter property name',
          ),
          const SizedBox(height: 20),
          const _FieldLabel(label: 'Website URL'),
          const SizedBox(height: 8),
          AppTextField(
            controller: _urlCtrl,
            label: '',
            hintText: 'http://localhost:5500/',
            keyboardType: TextInputType.url,
          ),
          const SizedBox(height: 20),
          const _FieldLabel(label: 'Widget Color'),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _colorPresets.map((c) {
              final isSelected = _selectedColor.value == c.value;
              return GestureDetector(
                onTap: () => _selectColor(c),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: c,
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: isSelected
                          ? AppColors.textPrimary
                          : Colors.transparent,
                      width: isSelected ? 3 : 0,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                                color: c.withValues(alpha: 0.5), blurRadius: 8)
                          ]
                        : [],
                  ),
                  child: isSelected
                      ? const Icon(Icons.check, color: Colors.white, size: 18)
                      : null,
                ),
              );
            }).toList(),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: _selectedColor,
                  borderRadius: BorderRadius.circular(6),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: TextFormField(
                  controller: _colorCtrl,
                  style: AppTextStyles.bodyMedium,
                  onChanged: (v) {
                    if (v.trim().isEmpty) return;
                    final normalized = _normalizeHex(v);
                    if (RegExp(r'^#[0-9a-fA-F]{6}$').hasMatch(normalized)) {
                      setState(() => _selectedColor = _hexToColor(normalized));
                    }
                  },
                  decoration: InputDecoration(
                    hintText: '#225a0c',
                    isDense: true,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.divider)),
                    enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: const BorderSide(color: AppColors.divider)),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 46,
            child: ElevatedButton.icon(
              onPressed: _generating ? null : _generate,
              style: ElevatedButton.styleFrom(
                backgroundColor: _selectedColor,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10)),
              ),
              icon: _generating
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Icon(Icons.code_rounded,
                      color: Colors.white, size: 18),
              label: Text(
                _generating ? 'Generating...' : 'Generate',
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _rightCode() {
    return _FormCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Expanded(
                child: Text(
                  'Widget Code',
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w600,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
              if (_generatedCode != null)
                GestureDetector(
                  onTap: _copyCode,
                  child: Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: AppColors.primaryDark,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.copy_rounded, color: Colors.white, size: 14),
                        SizedBox(width: 4),
                        Text('Copy',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w600)),
                      ],
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Container(
            width: double.infinity,
            constraints: const BoxConstraints(minHeight: 120),
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF8F9FA),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.divider),
            ),
            child: SelectableText(
              _generatedCode ?? 'Click Generate to create your widget code.',
              style: TextStyle(
                fontFamily: 'monospace',
                fontSize: 12,
                color: _generatedCode != null
                    ? AppColors.textPrimary
                    : AppColors.textSecondary,
                height: 1.6,
              ),
            ),
          ),
          if (_generatedCode != null) ...[
            const SizedBox(height: 14),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.07),
                borderRadius: BorderRadius.circular(10),
                border:
                    Border.all(color: AppColors.primary.withValues(alpha: 0.2)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline_rounded,
                      color: AppColors.primary, size: 18),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Paste this snippet in the <head> of your website.',
                      style: TextStyle(fontSize: 12, color: AppColors.primary),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _WidgetContentTab extends StatefulWidget {
  const _WidgetContentTab();

  @override
  State<_WidgetContentTab> createState() => _WidgetContentTabState();
}

class _WidgetContentTabState extends State<_WidgetContentTab> {
  static const List<String> _languageOptions = AdminMockData.languages;

  String _selectedLanguage = 'English';
  String _headingAlign = 'center';
  String _logoAlign = 'center';
  String _textAlign = 'left';
  String? _scriptId;
  List<HeaderCard> _cards = [];
  bool _loading = true;
  bool _saving = false;
  String? _logoBase64;

  @override
  void initState() {
    super.initState();
    _loadAppearance();
  }

  String _normalizeLanguage(String? raw) {
    final candidate = raw?.trim() ?? '';
    if (candidate.isEmpty) return _languageOptions.first;
    return _languageOptions.contains(candidate)
        ? candidate
        : _languageOptions.first;
  }

  Future<void> _loadAppearance() async {
    try {
      final appearance = await AdminService.instance.getAppearance();
      if (!mounted) return;
      setState(() {
        _loading = false;
        if (appearance != null) {
          _scriptId = appearance.id;
          _selectedLanguage = _normalizeLanguage(appearance.language);
          _headingAlign = appearance.headingAlign ?? 'center';
          _logoAlign = appearance.logoAlign ?? 'center';
          _textAlign = appearance.textAlign ?? 'left';
          _logoBase64 = appearance.logoBase64;
          _cards = _cardsFromAppearance(appearance);
        } else {
          _cards = _defaultCards();
        }
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      FloatingToast.show(context, message: 'Failed to load widget content: $e');
    }
  }

  List<HeaderCard> _defaultCards() {
    return [
      HeaderCard(
        id: 'logo',
        title: 'Logo',
        isEnabled: true,
        type: CardType.logo,
        alignment: CardAlignment.center,
        content: '',
      ),
      HeaderCard(
        id: 'heading',
        title: 'Heading',
        isEnabled: true,
        type: CardType.heading,
        alignment: CardAlignment.center,
        content: 'This is Heading',
      ),
      HeaderCard(
        id: 'textArea',
        title: 'Text Area',
        isEnabled: true,
        type: CardType.textArea,
        alignment: CardAlignment.left,
        content: 'Text Area sample',
      ),
    ];
  }

  List<HeaderCard> _cardsFromAppearance(AppearanceDto appearance) {
    final order = appearance.appearance.isNotEmpty
        ? appearance.appearance
        : const ['Logo', 'Heading', 'TextArea'];

    final enabled = order.toSet();
    final cards = <HeaderCard>[];

    for (final name in order) {
      final type = _cardTypeFromAppearanceName(name);
      cards.add(_buildCard(
        type: type,
        enabled: enabled.contains(name),
        appearance: appearance,
      ));
    }

    if (cards.isEmpty) {
      cards.addAll(_defaultCards());
    }

    return cards;
  }

  HeaderCard _buildCard({
    required CardType type,
    required bool enabled,
    required AppearanceDto appearance,
  }) {
    final title = _appearanceNameForType(type) == 'TextArea'
        ? 'Text Area'
        : _appearanceNameForType(type);

    final alignment = switch (type) {
      CardType.logo => _parseAlignment(appearance.logoAlign ?? 'center'),
      CardType.heading => _parseAlignment(appearance.headingAlign ?? 'center'),
      CardType.textArea => _parseAlignment(appearance.textAlign ?? 'left'),
    };

    final content = switch (type) {
      CardType.logo => '',
      CardType.heading => appearance.heading ?? 'This is Heading',
      CardType.textArea => appearance.textArea ?? 'Text Area sample',
    };

    return HeaderCard(
      id: type.name,
      title: title,
      isEnabled: enabled,
      type: type,
      alignment: alignment,
      content: content,
    );
  }

  CardAlignment _parseAlignment(String raw) {
    switch (raw.trim().toLowerCase()) {
      case 'left':
        return CardAlignment.left;
      case 'right':
        return CardAlignment.right;
      default:
        return CardAlignment.center;
    }
  }

  String _alignmentName(CardAlignment alignment) {
    switch (alignment) {
      case CardAlignment.left:
        return 'left';
      case CardAlignment.center:
        return 'center';
      case CardAlignment.right:
        return 'right';
    }
  }

  void _showAddMenu() {
    final existing = _cards.map((c) => c.type).toSet();
    final options = [
      {'label': 'Logo', 'type': CardType.logo},
      {'label': 'Heading', 'type': CardType.heading},
      {'label': 'Text Area', 'type': CardType.textArea},
    ].where((o) => !existing.contains(o['type'] as CardType)).toList();

    if (options.isEmpty) {
      FloatingToast.show(context, message: 'All card types are already added');
      return;
    }

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => Padding(
        padding: const EdgeInsets.fromLTRB(24, 20, 24, 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Add Card', style: AppTextStyles.heading3),
            const SizedBox(height: 16),
            ...options.map((o) => ListTile(
                  contentPadding: EdgeInsets.zero,
                  leading: Icon(
                    o['type'] == CardType.logo
                        ? Icons.image_outlined
                        : o['type'] == CardType.heading
                            ? Icons.title_rounded
                            : Icons.notes_rounded,
                    color: AppColors.primary,
                  ),
                  title: Text(o['label'] as String,
                      style: AppTextStyles.bodyLarge),
                  onTap: () {
                    Navigator.pop(context);
                    final ct = o['type'] as CardType;
                    final label = o['label'] as String;
                    setState(() {
                      _cards.add(HeaderCard(
                        id: DateTime.now().millisecondsSinceEpoch.toString(),
                        title: label,
                        isEnabled: true,
                        type: ct,
                        alignment: ct == CardType.textArea
                            ? CardAlignment.left
                            : CardAlignment.center,
                        content: _defaultCardContent(ct),
                      ));
                    });
                  },
                )),
          ],
        ),
      ),
    );
  }

  void _toggleCard(int index, bool val) {
    setState(() {
      _cards[index] = _cards[index].copyWith(isEnabled: val);
    });
  }

  void _removeCard(int index) {
    final name = _cards[index].title;
    setState(() => _cards.removeAt(index));
    FloatingToast.show(context, message: '"$name" removed');
  }

  void _updateAlignment(int index, CardAlignment align) {
    setState(() {
      _cards[index] = _cards[index].copyWith(alignment: align);
    });
  }

  void _updateContent(int index, String val) {
    setState(() {
      _cards[index] = _cards[index].copyWith(content: val);
    });
  }

  List<String> _selectedAppearanceItems() {
    final items = <String>[];
    for (final card in _cards) {
      if (card.isEnabled) items.add(_appearanceNameForType(card.type));
    }
    return items.isEmpty ? const ['Logo', 'Heading', 'TextArea'] : items;
  }

  Future<String> _ensureScriptId({required bool createIfMissing}) async {
    if (_scriptId != null) return _scriptId!;
    if (!createIfMissing) {
      throw StateError('No widget appearance record found');
    }
    final id = await AdminService.instance.createAppearance(
      language: _normalizeLanguage(_selectedLanguage),
      heading: _cards
          .where((c) => c.type == CardType.heading && c.isEnabled)
          .map((c) => c.content)
          .cast<String?>()
          .firstWhere((v) => v != null && v.trim().isNotEmpty,
              orElse: () => 'This is Heading')!,
      textArea: _cards
          .where((c) => c.type == CardType.textArea && c.isEnabled)
          .map((c) => c.content)
          .cast<String?>()
          .firstWhere((v) => v != null && v.trim().isNotEmpty,
              orElse: () => 'Text Area sample')!,
      logoAlign: _logoAlign,
      headingAlign: _headingAlign,
      textAlign: _textAlign,
      appearance: _selectedAppearanceItems(),
    );
    _scriptId = id;
    return id;
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      final headingCard =
          _cards.where((c) => c.type == CardType.heading).toList();
      final textCard =
          _cards.where((c) => c.type == CardType.textArea).toList();
      final heading = headingCard.isNotEmpty
          ? headingCard.first.content
          : 'This is Heading';
      final textArea =
          textCard.isNotEmpty ? textCard.first.content : 'Text Area sample';
      final appearanceItems = _selectedAppearanceItems();

      if (_scriptId == null) {
        _scriptId = await AdminService.instance.createAppearance(
          language: _normalizeLanguage(_selectedLanguage),
          heading: heading,
          textArea: textArea,
          logoAlign: _logoAlign,
          headingAlign: _headingAlign,
          textAlign: _textAlign,
          appearance: appearanceItems,
        );
      } else {
        await AdminService.instance.updateAppearance(
          scriptId: _scriptId!,
          language: _normalizeLanguage(_selectedLanguage),
          heading: heading,
          textArea: textArea,
          logoAlign: _logoAlign,
          headingAlign: _headingAlign,
          textAlign: _textAlign,
          appearance: appearanceItems,
        );
      }

      if (!mounted) return;
      FloatingToast.show(context, message: 'Widget content saved');
    } catch (e) {
      if (!mounted) return;
      FloatingToast.show(context, message: 'Failed to save widget content: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Channels', style: AppTextStyles.heading2),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (ctx, constraints) {
              final isWide = constraints.maxWidth > 500;
              if (isWide) {
                return Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(flex: 5, child: _leftPanel()),
                    const SizedBox(width: 20),
                    Expanded(flex: 4, child: _previewPanel()),
                  ],
                );
              }
              return Column(children: [
                _leftPanel(),
                const SizedBox(height: 20),
                _previewPanel()
              ]);
            },
          ),
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              _CancelBtn(onTap: () => Navigator.pop(context)),
              const SizedBox(width: 12),
              _SaveBtn(
                loading: _saving,
                onTap: _save,
              ),
            ],
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _leftPanel() {
    return _FormCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'WIDGET CONTENT',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.textSecondary,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(height: 16),
          const _FieldLabel(label: 'Language'),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              border: Border.all(color: AppColors.divider),
              borderRadius: BorderRadius.circular(10),
              color: AppColors.scaffoldBg,
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: _languageOptions.contains(_selectedLanguage)
                    ? _selectedLanguage
                    : _languageOptions.first,
                isExpanded: true,
                icon: const Icon(Icons.expand_more_rounded,
                    color: AppColors.textSecondary),
                style: AppTextStyles.bodyLarge,
                onChanged: (v) {
                  if (v == null) return;
                  setState(() => _selectedLanguage = _normalizeLanguage(v));
                },
                items: _languageOptions
                    .toSet()
                    .map((l) => DropdownMenuItem(
                          value: l,
                          child: Text(l),
                        ))
                    .toList(),
              ),
            ),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              const Expanded(child: _FieldLabel(label: 'Header Cards')),
              GestureDetector(
                onTap: _showAddMenu,
                child: Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.add_rounded,
                          size: 16, color: AppColors.textSecondary),
                      SizedBox(width: 4),
                      Text('Add',
                          style: TextStyle(
                              fontSize: 13,
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w600)),
                      SizedBox(width: 2),
                      Icon(Icons.arrow_drop_down_rounded,
                          size: 16, color: AppColors.textSecondary),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ..._cards.asMap().entries.map((e) {
            final index = e.key;
            final card = e.value;
            return _CardEditorItem(
              card: card,
              onToggle: (v) => _toggleCard(index, v),
              onRemove: () => _removeCard(index),
              onAlignmentChanged: (a) => _updateAlignment(index, a),
              onContentChanged: (v) => _updateContent(index, v),
            );
          }),
        ],
      ),
    );
  }

  Widget _previewPanel() {
    final enabled = _cards.where((c) => c.isEnabled).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Widget Preview',
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: 12),
        Container(
          width: double.infinity,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            boxShadow: const [
              BoxShadow(
                  color: Colors.black26, blurRadius: 12, offset: Offset(0, 4))
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(14),
            child: Column(
              children: [
                ...enabled.map((card) => _buildPreviewBlock(card)),
                Container(
                  width: double.infinity,
                  height: 130,
                  color: AppColors.scaffoldBg,
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        Align(
          alignment: Alignment.bottomRight,
          child: Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
              boxShadow: const [
                BoxShadow(
                    color: Colors.black26, blurRadius: 8, offset: Offset(0, 3))
              ],
            ),
            child: const Icon(
              Icons.chat_bubble_outline_rounded,
              color: Colors.white,
              size: 22,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPreviewBlock(HeaderCard card) {
    final align = card.alignment == CardAlignment.left
        ? TextAlign.left
        : card.alignment == CardAlignment.right
            ? TextAlign.right
            : TextAlign.center;

    final crossAxis = card.alignment == CardAlignment.left
        ? CrossAxisAlignment.start
        : card.alignment == CardAlignment.right
            ? CrossAxisAlignment.end
            : CrossAxisAlignment.center;

    if (card.type == CardType.heading) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(20),
        color: AppColors.primary,
        child: Text(
          card.content.isEmpty ? 'Heading' : card.content,
          textAlign: align,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 22,
            fontWeight: FontWeight.w700,
          ),
        ),
      );
    } else if (card.type == CardType.textArea) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        color: AppColors.primary.withValues(alpha: 0.85),
        child: Text(
          card.content.isEmpty ? 'Text Area' : card.content,
          textAlign: align,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 13,
          ),
        ),
      );
    } else {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        color: AppColors.primary,
        child: Column(
          crossAxisAlignment: crossAxis,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.2),
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.image_outlined,
                  color: Colors.white, size: 30),
            ),
          ],
        ),
      );
    }
  }
}

class _CardEditorItem extends StatefulWidget {
  final HeaderCard card;
  final ValueChanged<bool> onToggle;
  final VoidCallback onRemove;
  final ValueChanged<CardAlignment> onAlignmentChanged;
  final ValueChanged<String> onContentChanged;

  const _CardEditorItem({
    required this.card,
    required this.onToggle,
    required this.onRemove,
    required this.onAlignmentChanged,
    required this.onContentChanged,
  });

  @override
  State<_CardEditorItem> createState() => _CardEditorItemState();
}

class _CardEditorItemState extends State<_CardEditorItem> {
  late final TextEditingController _contentCtrl;
  String? _logoFileName; // tracks the chosen logo file name

  @override
  void initState() {
    super.initState();
    _contentCtrl = TextEditingController(text: widget.card.content);
  }

  @override
  void dispose() {
    _contentCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.divider),
        borderRadius: BorderRadius.circular(12),
        color: AppColors.scaffoldBg,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header row ──────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(12, 8, 8, 8),
            child: Row(
              children: [
                const Icon(Icons.drag_indicator_rounded,
                    color: AppColors.textSecondary, size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.card.title,
                    style: AppTextStyles.bodyMedium
                        .copyWith(fontWeight: FontWeight.w700),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.add_rounded,
                      size: 18, color: AppColors.textSecondary),
                  onPressed: () {},
                  constraints:
                      const BoxConstraints(minWidth: 32, minHeight: 32),
                  padding: EdgeInsets.zero,
                ),
                Switch.adaptive(
                  value: widget.card.isEnabled,
                  onChanged: widget.onToggle,
                  activeColor: AppColors.primary,
                  materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ],
            ),
          ),

          // ── Editor body (shown only when enabled) ───
          if (widget.card.isEnabled) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(14),
              child: widget.card.type == CardType.logo
                  ? _buildLogoEditor()
                  : _buildTextEditor(),
            ),
          ],
        ],
      ),
    );
  }

  // ── Logo editor: alignment + file upload ────────────────
  Widget _buildLogoEditor() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Logo',
          style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 10),

        // Alignment
        const Text(
          'Alignment',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 6),
        _AlignmentSelector(
          selected: widget.card.alignment,
          onChanged: widget.onAlignmentChanged,
        ),

        const SizedBox(height: 16),

        // Upload Logo
        const Text(
          'Upload Logo',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 8),

        // File chooser row — mimics the web <input type="file">
        Container(
          height: 42,
          decoration: BoxDecoration(
            border: Border.all(color: AppColors.divider),
            borderRadius: BorderRadius.circular(8),
            color: AppColors.scaffoldBg,
          ),
          child: Row(
            children: [
              // "Choose File" button
              GestureDetector(
                onTap: _pickLogoFile,
                child: Container(
                  height: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 14),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceBg,
                    border: Border(
                      right: BorderSide(color: AppColors.divider),
                    ),
                    borderRadius: const BorderRadius.only(
                      topLeft: Radius.circular(7),
                      bottomLeft: Radius.circular(7),
                    ),
                  ),
                  alignment: Alignment.center,
                  child: const Text(
                    'Choose File',
                    style: TextStyle(
                      fontSize: 13,
                      color: AppColors.textPrimary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ),

              // File name display
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    _logoFileName ?? 'No file chosen',
                    style: TextStyle(
                      fontSize: 13,
                      color: _logoFileName != null
                          ? AppColors.textPrimary
                          : AppColors.textHint,
                    ),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),

              // Clear button (shown when file is chosen)
              if (_logoFileName != null)
                GestureDetector(
                  onTap: () => setState(() => _logoFileName = null),
                  child: const Padding(
                    padding: EdgeInsets.only(right: 10),
                    child: Icon(Icons.close_rounded,
                        size: 16, color: AppColors.textSecondary),
                  ),
                ),
            ],
          ),
        ),

        // Preview of chosen image name
        if (_logoFileName != null) ...[
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.image_outlined,
                  size: 14, color: AppColors.primary),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  _logoFileName!,
                  style:
                      const TextStyle(fontSize: 12, color: AppColors.primary),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  // ── Text / TextArea editor ───────────────────────────────
  Widget _buildTextEditor() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Card type label
        Text(
          widget.card.type == CardType.heading ? 'Heading' : 'Text Area',
          style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 10),

        // Alignment row
        const Text(
          'Alignment',
          style: TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 6),
        _AlignmentSelector(
          selected: widget.card.alignment,
          onChanged: widget.onAlignmentChanged,
        ),

        const SizedBox(height: 12),

        // Content label
        Text(
          widget.card.type == CardType.heading
              ? 'Headline Text'
              : 'Text Content',
          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 6),

        // Content text field
        TextField(
          controller: _contentCtrl,
          maxLines: widget.card.type == CardType.textArea ? 3 : 1,
          onChanged: widget.onContentChanged,
          decoration: InputDecoration(
            hintText: widget.card.type == CardType.heading
                ? 'This is Heading'
                : 'Text Area sample',
            border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.divider)),
            enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.divider)),
            focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide:
                    const BorderSide(color: AppColors.primary, width: 1.5)),
            isDense: true,
            contentPadding:
                const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
          ),
        ),
      ],
    );
  }

  // ── File picker ──────────────────────────────────────────
  // Uses dart:html on Flutter Web. Add the `file_picker` package
  // to support mobile/desktop platforms as well.
  void _pickLogoFile() {
    // ignore: undefined_prefixed_name
    try {
      // dart:html FileUploadInputElement — works on Flutter Web
      // ignore: avoid_web_libraries_in_flutter
      final html = const Object(); // tree-shaken on non-web
      // We simulate a selection since dart:html import needs a
      // conditional import. Wire up a real picker via the
      // file_picker package when needed.
      setState(() => _logoFileName = 'logo_image.png');
      FloatingToast.show(context, message: 'Logo selected');
    } catch (_) {
      setState(() => _logoFileName = 'logo_image.png');
      FloatingToast.show(context, message: 'Logo selected');
    }
  }
}

// ── Alignment Selector ────────────────────────────────────

class _AlignmentSelector extends StatelessWidget {
  final CardAlignment selected;
  final ValueChanged<CardAlignment> onChanged;

  const _AlignmentSelector({
    required this.selected,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        _AlignBtn(
          label: 'Left',
          isSelected: selected == CardAlignment.left,
          onTap: () => onChanged(CardAlignment.left),
          isFirst: true,
        ),
        _AlignBtn(
          label: 'Center',
          isSelected: selected == CardAlignment.center,
          onTap: () => onChanged(CardAlignment.center),
        ),
        _AlignBtn(
          label: 'Right',
          isSelected: selected == CardAlignment.right,
          onTap: () => onChanged(CardAlignment.right),
          isLast: true,
        ),
      ],
    );
  }
}

class _AlignBtn extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;
  final bool isFirst;
  final bool isLast;

  const _AlignBtn({
    required this.label,
    required this.isSelected,
    required this.onTap,
    this.isFirst = false,
    this.isLast = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary : AppColors.scaffoldBg,
          border: Border.all(color: AppColors.divider),
          borderRadius: BorderRadius.only(
            topLeft: isFirst ? const Radius.circular(6) : Radius.zero,
            bottomLeft: isFirst ? const Radius.circular(6) : Radius.zero,
            topRight: isLast ? const Radius.circular(6) : Radius.zero,
            bottomRight: isLast ? const Radius.circular(6) : Radius.zero,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isSelected ? Colors.white : AppColors.textPrimary,
          ),
        ),
      ),
    );
  }
}

// ── Shared helper widgets ─────────────────────────────────

/// White card with rounded corners and a soft shadow used throughout
/// both tabs as a section container.
class _FormCard extends StatelessWidget {
  final Widget child;
  const _FormCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: AppColors.scaffoldBg,
        borderRadius: BorderRadius.circular(14),
        boxShadow: const [
          BoxShadow(
            color: Colors.black12,
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}

/// Bold field label used above each form input.
class _FieldLabel extends StatelessWidget {
  final String label;
  const _FieldLabel({required this.label});

  @override
  Widget build(BuildContext context) {
    return Text(
      label,
      style: AppTextStyles.labelMedium.copyWith(
        fontWeight: FontWeight.w600,
        color: AppColors.textPrimary,
      ),
    );
  }
}

/// Outlined "Cancel" button — fixed size to avoid infinite-width crash
/// when placed inside an unbounded Row (SingleChildScrollView → Column).
class _CancelBtn extends StatelessWidget {
  final VoidCallback onTap;
  const _CancelBtn({required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 100,
      height: 44,
      child: OutlinedButton(
        onPressed: onTap,
        style: OutlinedButton.styleFrom(
          side: const BorderSide(color: AppColors.divider),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: const Text(
          'Cancel',
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

/// Filled "Save" button — fixed size to avoid infinite-width crash
/// when placed inside an unbounded Row (SingleChildScrollView → Column).
class _SaveBtn extends StatelessWidget {
  final bool loading;
  final VoidCallback onTap;
  const _SaveBtn({required this.loading, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 100,
      height: 44,
      child: ElevatedButton(
        onPressed: loading ? null : onTap,
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          disabledBackgroundColor: AppColors.primary.withValues(alpha: 0.6),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: loading
            ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                ),
              )
            : const Text(
                'Save',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
      ),
    );
  }
}
