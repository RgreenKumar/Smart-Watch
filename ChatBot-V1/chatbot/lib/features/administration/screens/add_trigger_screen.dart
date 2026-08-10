// lib/features/administration/screens/add_trigger_screen.dart  (MODIFIED)
// Loads real trigger types + departments from API. Saves via AdminService.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/admin_service.dart';

class AddTriggerScreen extends StatefulWidget {
  final TriggerDto?  existing;
  final VoidCallback onSaved;

  const AddTriggerScreen({super.key, this.existing, required this.onSaved});
  bool get isEditing => existing != null;

  @override
  State<AddTriggerScreen> createState() => _AddTriggerScreenState();
}

class _AddTriggerScreenState extends State<AddTriggerScreen> {
  final _formKey  = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _textCtrl = TextEditingController(); // TextArea content

  List<TriggerTypeDto>  _types       = [];
  List<DepartmentDto>   _departments = [];
  int?                  _selectedTypeId;
  final Set<int>        _selectedDeptIds = {};
  final Set<String>     _firstTrigger    = {}; // 'TextArea' | 'Department'
  int                   _delay           = 0;
  bool                  _loading         = true;
  bool                  _saving          = false;

  static const _delayOptions = [0, 5, 10, 30];

  @override
  void initState() {
    super.initState();
    _loadDropdowns();
    if (widget.existing != null) {
      final t = widget.existing!;
      _nameCtrl.text = t.name;
      _textCtrl.text = t.text ?? '';
      _delay         = t.delay;
      _firstTrigger.addAll(t.firstTrigger);
      _selectedDeptIds.addAll(t.departments.map((d) => d.depId));
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _textCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadDropdowns() async {
    try {
      final types = await AdminService.instance.getTriggerTypes();
      final depts = await AdminService.instance.getAllDepartments();
      if (!mounted) return;
      setState(() {
        _types       = types;
        _departments = depts;
        _loading     = false;
        if (widget.existing != null) {
          _selectedTypeId = widget.existing!.triggerType?.id ?? types.firstOrNull?.id;
        } else {
          _selectedTypeId = types.firstOrNull?.id;
        }
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loading = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedTypeId == null) {
      FloatingToast.show(context, message: 'Select a trigger type');
      return;
    }
    setState(() => _saving = true);
    try {
      if (widget.isEditing) {
        await AdminService.instance.updateTrigger(
          id:            widget.existing!.triggerId,
          name:          _nameCtrl.text.trim(),
          delay:         _delay,
          triggerTypeId: _selectedTypeId!,
          firstTrigger:  _firstTrigger.toList(),
          text:          _textCtrl.text.trim().isNotEmpty ? _textCtrl.text.trim() : null,
          departmentIds: _selectedDeptIds.toList(),
        );
      } else {
        await AdminService.instance.addTrigger(
          name:          _nameCtrl.text.trim(),
          delay:         _delay,
          triggerTypeId: _selectedTypeId!,
          firstTrigger:  _firstTrigger.toList(),
          text:          _textCtrl.text.trim().isNotEmpty ? _textCtrl.text.trim() : null,
          departmentIds: _selectedDeptIds.toList(),
        );
      }
      if (!mounted) return;
      widget.onSaved();
      Navigator.pop(context);
    } catch (e) {
      if (!mounted) return;
      FloatingToast.show(context, message: 'Failed: $e');
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: _buildAppBar(),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : Form(
              key: _formKey,
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.isEditing ? 'Edit Trigger' : 'New Trigger', style: AppTextStyles.heading2),
                    const SizedBox(height: 20),
                    AppTextField(
                      controller: _nameCtrl,
                      label: 'Trigger Name',
                      hintText: 'e.g. Welcome Message',
                      validator: (v) => (v == null || v.trim().isEmpty) ? 'Name is required' : null,
                    ),
                    const SizedBox(height: 16),
                    // Trigger type
                    Text('Trigger Type', style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: _selectedTypeId,
                      items: _types.map((t) => DropdownMenuItem(value: t.id, child: Text(t.name))).toList(),
                      onChanged: (v) => setState(() => _selectedTypeId = v),
                      decoration: const InputDecoration(border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
                    // Delay
                    Text('Delay', style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<int>(
                      value: _delay,
                      items: _delayOptions.map((d) => DropdownMenuItem(value: d, child: Text(d == 0 ? 'No Delay' : '$d seconds'))).toList(),
                      onChanged: (v) => setState(() => _delay = v ?? 0),
                      decoration: const InputDecoration(border: OutlineInputBorder()),
                    ),
                    const SizedBox(height: 16),
                    // First trigger items
                    Text('Content Blocks', style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 8),
                    CheckboxListTile(
                      value: _firstTrigger.contains('Text Area'),
                      onChanged: (v) => setState(() { if (v!) _firstTrigger.add('Text Area'); else _firstTrigger.remove('Text Area'); }),
                      title: const Text('Text Message'),
                      subtitle: const Text('Show a text bubble when chat opens'),
                      activeColor: AppColors.primary,
                      contentPadding: EdgeInsets.zero,
                    ),
                    if (_firstTrigger.contains('Text Area')) ...[
                      const SizedBox(height: 8),
                      AppTextField(controller: _textCtrl, label: 'Message Text', hintText: 'Hi! How can we help you today?'),
                    ],
                    CheckboxListTile(
                      value: _firstTrigger.contains('Department'),
                      onChanged: (v) => setState(() { if (v!) _firstTrigger.add('Department'); else _firstTrigger.remove('Department'); }),
                      title: const Text('Department Buttons'),
                      subtitle: const Text('Show department selection buttons'),
                      activeColor: AppColors.primary,
                      contentPadding: EdgeInsets.zero,
                    ),
                    // Department selector
                    if (_firstTrigger.contains('Department') && _departments.isNotEmpty) ...[
                      const SizedBox(height: 8),
                      Text('Select Departments', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600)),
                      const SizedBox(height: 8),
                      Container(
                        decoration: BoxDecoration(color: AppColors.scaffoldBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.divider)),
                        child: Column(
                          children: _departments.map((d) => CheckboxListTile(
                            value: _selectedDeptIds.contains(d.id),
                            onChanged: (v) => setState(() { if (v!) _selectedDeptIds.add(d.id); else _selectedDeptIds.remove(d.id); }),
                            title: Text(d.name, style: AppTextStyles.bodyMedium),
                            activeColor: AppColors.primary,
                            contentPadding: const EdgeInsets.symmetric(horizontal: 16),
                          )).toList(),
                        ),
                      ),
                    ],
                    const SizedBox(height: 32),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        OutlinedButton(onPressed: () => Navigator.pop(context), style: OutlinedButton.styleFrom(minimumSize: const Size(90, 44)), child: const Text('Cancel')),
                        const SizedBox(width: 12),
                        ElevatedButton(
                          onPressed: _saving ? null : _save,
                          style: ElevatedButton.styleFrom(minimumSize: const Size(90, 44)),
                          child: _saving
                              ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                              : Text(widget.isEditing ? 'Update' : 'Create'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return PreferredSize(
      preferredSize: const Size.fromHeight(72),
      child: Material(elevation: 3, shadowColor: Colors.black12, color: AppColors.scaffoldBg,
        child: AppBar(
          backgroundColor: AppColors.scaffoldBg, elevation: 0, centerTitle: true,
          title: Text(widget.isEditing ? 'Edit Trigger' : 'Add Trigger'),
          leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20), onPressed: () => Navigator.pop(context)),
          bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
        )),
    );
  }
}
