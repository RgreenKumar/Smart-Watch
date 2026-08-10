// lib/features/administration/screens/add_department_screen.dart  (MODIFIED)
// Replaces the mock onSave(Department) pattern with direct AdminService calls.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/app_text_field.dart';
import '../../../core/widgets/floating_toast.dart';
import 'package:chat_app/features/administration/services/admin_service.dart';

class AddDepartmentScreen extends StatefulWidget {
  /// Pass these when editing an existing department
  final int?    existingId;
  final String? existingName;
  final String? existingDesc;
  /// Called after successful create/update so parent refreshes
  final VoidCallback onSaved;

  const AddDepartmentScreen({
    super.key,
    this.existingId,
    this.existingName,
    this.existingDesc,
    required this.onSaved,
  });

  bool get isEditing => existingId != null;

  @override
  State<AddDepartmentScreen> createState() => _AddDepartmentScreenState();
}

class _AddDepartmentScreenState extends State<AddDepartmentScreen> {
  final _formKey   = GlobalKey<FormState>();
  late final TextEditingController _nameCtrl;
  late final TextEditingController _descCtrl;

  List<AgentNameDto> _allAgents  = [];
  DepartmentDetailDto? _department;
  final Set<int>     _selectedIds = {};
  bool _loadingAgents = true;
  bool _saving        = false;

  @override
  void initState() {
    super.initState();
    _nameCtrl = TextEditingController(text: widget.existingName ?? '');
    _descCtrl = TextEditingController(text: widget.existingDesc ?? '');
    _loadAgents();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadAgents() async {
    try {
      final results = await Future.wait([
        AdminService.instance.getAgentNames(),
        if (widget.existingId != null)
          AdminService.instance.getDepartmentById(widget.existingId!)
        else
          Future<DepartmentDetailDto?>.value(null),
      ]);
      final agents = results[0] as List<AgentNameDto>;
      final department = results[1] as DepartmentDetailDto?;
      if (!mounted) return;
      setState(() {
        _allAgents = agents;
        _department = department;
        _loadingAgents = false;
        _selectedIds.clear();
        if (department != null) {
          _selectedIds.addAll(department.adminIds);
          if (_nameCtrl.text.isEmpty) _nameCtrl.text = department.depName;
          if (_descCtrl.text.isEmpty) _descCtrl.text = department.description;
        }
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _loadingAgents = false);
    }
  }

  Future<void> _save() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _saving = true);
    try {
      if (widget.isEditing) {
        await AdminService.instance.updateDepartment(
          id:       widget.existingId!,
          name:     _nameCtrl.text.trim(),
          description: _descCtrl.text.trim(),
          adminIds: _selectedIds.toList(),
        );
      } else {
        await AdminService.instance.addDepartment(
          name:     _nameCtrl.text.trim(),
          description: _descCtrl.text.trim(),
          adminIds: _selectedIds.toList(),
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
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(widget.isEditing ? 'Edit Department' : 'New Department',
                  style: AppTextStyles.heading2),
              const SizedBox(height: 20),
              AppTextField(
                controller: _nameCtrl,
                label: 'Department Name',
                hintText: 'e.g. Sales Support',
                validator: (v) => (v == null || v.trim().isEmpty)
                    ? 'Name is required' : null,
              ),
              const SizedBox(height: 16),
              AppTextField(
                controller: _descCtrl,
                label: 'Description',
                hintText: 'Brief description',
              ),
              const SizedBox(height: 24),
              Text('Assign Agents', style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 12),
              if (_loadingAgents)
                const Center(child: CircularProgressIndicator())
              else if (_allAgents.isEmpty)
                Text('No agents available', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary))
              else
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.scaffoldBg,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.divider),
                  ),
                  child: Column(
                    children: _allAgents.asMap().entries.map((e) {
                      final agent = e.value;
                      final isSelected = _selectedIds.contains(agent.id);
                      return Column(
                        children: [
                          CheckboxListTile(
                            value: isSelected,
                            onChanged: (v) => setState(() {
                              if (v == true) _selectedIds.add(agent.id);
                              else _selectedIds.remove(agent.id);
                            }),
                            title: Text(agent.displayName,
                                style: AppTextStyles.bodyMedium),
                            subtitle: Text(agent.email,
                                style: AppTextStyles.bodySmall),
                            activeColor: AppColors.primary,
                            contentPadding: const EdgeInsets.symmetric(
                                horizontal: 16, vertical: 4),
                          ),
                          if (e.key < _allAgents.length - 1)
                            const Divider(height: 1, indent: 16),
                        ],
                      );
                    }).toList(),
                  ),
                ),
              const SizedBox(height: 32),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  OutlinedButton(
                    onPressed: () => Navigator.pop(context),
                    style: OutlinedButton.styleFrom(minimumSize: const Size(90, 44)),
                    child: const Text('Cancel'),
                  ),
                  const SizedBox(width: 12),
                  ElevatedButton(
                    onPressed: _saving ? null : _save,
                    style: ElevatedButton.styleFrom(minimumSize: const Size(90, 44)),
                    child: _saving
                        ? const SizedBox(width: 18, height: 18,
                            child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
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
      child: Material(
        elevation: 3, shadowColor: Colors.black12, color: AppColors.scaffoldBg,
        child: AppBar(
          backgroundColor: AppColors.scaffoldBg, elevation: 0, centerTitle: true,
          title: Text(widget.isEditing ? 'Edit Department' : 'Add Department'),
          leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20), onPressed: () => Navigator.pop(context)),
          bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
        ),
      ),
    );
  }
}
