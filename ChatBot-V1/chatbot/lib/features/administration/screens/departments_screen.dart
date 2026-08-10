// lib/features/administration/screens/departments_screen.dart  (MODIFIED)
// Changes: replaced AdminMockData with real AdminService.getAllDepartments(),
// deleteDepartment(), addDepartment(), updateDepartment() calls.
// All UI structure (table, rows, search, appbar) is UNCHANGED.

import 'package:flutter/material.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/floating_toast.dart';
import '../services/admin_service.dart';
import 'add_department_screen.dart';

class DepartmentsScreen extends StatefulWidget {
  const DepartmentsScreen({super.key});

  @override
  State<DepartmentsScreen> createState() => _DepartmentsScreenState();
}

class _DepartmentsScreenState extends State<DepartmentsScreen> {
  List<DepartmentDto> _departments = [];
  List<DepartmentDto> _filtered    = [];
  final _searchCtrl = TextEditingController();
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final list = await AdminService.instance.getAllDepartments();
      if (!mounted) return;
      setState(() { _departments = list; _filtered = List.from(list); _loading = false; });
    } catch (e) {
      if (!mounted) return;
      setState(() => _loading = false);
      FloatingToast.show(context, message: 'Failed to load departments');
    }
  }

  void _search(String q) {
    setState(() {
      _filtered = _departments.where((d) =>
          d.name.toLowerCase().contains(q.toLowerCase()) ||
          d.description.toLowerCase().contains(q.toLowerCase())).toList();
    });
  }

  void _deleteDepartment(DepartmentDto d) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Delete Department'),
        content: Text('Delete "${d.name}"? This cannot be undone.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel', style: TextStyle(color: AppColors.textSecondary)),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              try {
                await AdminService.instance.deleteDepartment(d.id);
                await _load();
                if (mounted) FloatingToast.show(context, message: '"${d.name}" deleted');
              } catch (e) {
                if (mounted) FloatingToast.show(context, message: 'Delete failed');
              }
            },
            child: const Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
  }

  void _editDepartment(DepartmentDto d) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddDepartmentScreen(
          existingId:   d.id,
          existingName: d.name,
          existingDesc: d.description,
          onSaved: () {
            _load();
            FloatingToast.show(context, message: 'Department updated');
          },
        ),
      ),
    );
  }

  void _addDepartment() {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => AddDepartmentScreen(
          onSaved: () {
            _load();
            FloatingToast.show(context, message: 'Department created');
          },
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF5F6FA),
      appBar: _buildAppBar(),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 42,
                    decoration: BoxDecoration(
                      color: AppColors.scaffoldBg,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.divider),
                    ),
                    child: TextField(
                      controller: _searchCtrl,
                      onChanged: _search,
                      decoration: const InputDecoration(
                        hintText: 'Search departments...',
                        border: InputBorder.none,
                        prefixIcon: Icon(Icons.search, color: AppColors.textSecondary, size: 20),
                        isDense: true,
                        contentPadding: EdgeInsets.symmetric(vertical: 11),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                ElevatedButton.icon(
                  onPressed: _addDepartment,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF28A745),
                    minimumSize: const Size(0, 42),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                  ),
                  icon: const Icon(Icons.add, color: Colors.white, size: 18),
                  label: const Text('Add Dept', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _filtered.isEmpty
                    ? _emptyState()
                    : RefreshIndicator(
                        onRefresh: _load,
                        child: SingleChildScrollView(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.fromLTRB(16, 0, 16, 110),
                          child: Container(
                            decoration: BoxDecoration(
                              color: AppColors.scaffoldBg,
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: AppColors.divider),
                              boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 6, offset: Offset(0, 2))],
                            ),
                            child: Column(
                              children: [
                                const _DeptTableHeader(),
                                const Divider(height: 1),
                                ..._filtered.asMap().entries.map((e) {
                                  final d = e.value;
                                  return Column(children: [
                                    _DeptRow(dept: d, onEdit: () => _editDepartment(d), onDelete: () => _deleteDepartment(d)),
                                    if (e.key < _filtered.length - 1) const Divider(height: 1),
                                  ]);
                                }),
                              ],
                            ),
                          ),
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _emptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.account_tree_outlined, size: 64, color: AppColors.divider),
          const SizedBox(height: 16),
          Text('No departments yet', style: AppTextStyles.bodyMedium.copyWith(color: AppColors.textSecondary)),
        ],
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
          title: const Text('Departments'),
          leading: IconButton(icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20), onPressed: () => Navigator.pop(context)),
          bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1)),
        ),
      ),
    );
  }
}

class _DeptTableHeader extends StatelessWidget {
  const _DeptTableHeader();
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(children: [
        Expanded(flex: 4, child: Text('Department', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700))),
        Expanded(flex: 3, child: Text('Description', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700))),
        Expanded(flex: 2, child: Text('Members', style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700))),
        const SizedBox(width: 70, child: Text('Action', style: TextStyle(fontWeight: FontWeight.w700))),
      ]),
    );
  }
}

class _DeptRow extends StatelessWidget {
  final DepartmentDto dept;
  final VoidCallback onEdit;
  final VoidCallback onDelete;
  const _DeptRow({required this.dept, required this.onEdit, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.transparent,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(children: [
        Expanded(flex: 4, child: Row(children: [
          Container(
            width: 34, height: 34,
            decoration: BoxDecoration(color: AppColors.primary.withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
            child: const Icon(Icons.account_tree_outlined, color: AppColors.primary, size: 18),
          ),
          const SizedBox(width: 10),
          Expanded(child: Text(dept.name, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w600), overflow: TextOverflow.ellipsis)),
        ])),
        Expanded(flex: 3, child: Text(dept.description.isEmpty ? '—' : dept.description, style: AppTextStyles.bodySmall, overflow: TextOverflow.ellipsis)),
        Expanded(flex: 2, child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
          decoration: BoxDecoration(color: AppColors.surfaceBg, borderRadius: BorderRadius.circular(12)),
          child: Text('${dept.memberCount}', textAlign: TextAlign.center, style: AppTextStyles.bodyMedium.copyWith(fontWeight: FontWeight.w700)),
        )),
        SizedBox(width: 70, child: Row(mainAxisAlignment: MainAxisAlignment.end, children: [
          _ActionIcon(icon: Icons.edit_outlined, color: const Color(0xFF28A745), onTap: onEdit, tooltip: 'Edit'),
          const SizedBox(width: 6),
          _ActionIcon(icon: Icons.delete_outline_rounded, color: Colors.red, onTap: onDelete, tooltip: 'Delete'),
        ])),
      ]),
    );
  }
}

class _ActionIcon extends StatelessWidget {
  final IconData icon; final Color color; final VoidCallback onTap; final String tooltip;
  const _ActionIcon({required this.icon, required this.color, required this.onTap, required this.tooltip});
  @override
  Widget build(BuildContext context) {
    return Tooltip(message: tooltip, child: GestureDetector(onTap: onTap, child: Container(
      width: 30, height: 30,
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(6)),
      child: Icon(icon, color: Colors.white, size: 16),
    )));
  }
}
