// lib/features/administration/services/admin_service.dart
// Web-safe: uses Uint8List instead of dart:io File for logo uploads.

import 'dart:typed_data';
import '../../../core/services/api_client.dart';

// ══════════════════════════════════════════════════════════════════════════════
// DTOs
// ══════════════════════════════════════════════════════════════════════════════

class AgentDto {
  final int     id;
  final String? username;
  final String  email;
  final String  role;
  final bool    status;
  final int?    departmentId;

  const AgentDto({
    required this.id, this.username, required this.email,
    required this.role, required this.status, this.departmentId,
  });

  String get displayName =>
      (username != null && username!.isNotEmpty) ? username! : email;

  factory AgentDto.fromJson(Map<String, dynamic> j) => AgentDto(
    id:           (j['id']   as num).toInt(),
    username:     j['username'] as String?,
    email:        j['email']    as String,
    role:         (j['role']    as Map?)?['role'] as String? ?? 'AGENT',
    status:       j['status']   as bool? ?? false,
    departmentId: j['department'] != null
        ? ((j['department'] as Map)['id'] as num?)?.toInt()
        : null,
  );
}

class AgentNameDto {
  final int     id;
  final String? username;
  final String  email;
  final int?    departmentId;

  const AgentNameDto({required this.id, this.username, required this.email, this.departmentId});

  String get displayName =>
      (username != null && username!.trim().isNotEmpty) ? username!.trim() : email;

  factory AgentNameDto.fromJson(Map<String, dynamic> j) => AgentNameDto(
    id:           (j['id'] as num).toInt(),
    username:     j['username'] as String?,
    email:        (j['email'] as String?) ?? '',
    departmentId: j['departmentId'] != null ? (j['departmentId'] as num).toInt() : null,
  );
}

class DepartmentDto {
  final int    id;
  final String name;
  final String description;
  final int    memberCount;

  const DepartmentDto({required this.id, required this.name,
      required this.description, required this.memberCount});

  factory DepartmentDto.fromJson(Map<String, dynamic> j) => DepartmentDto(
    id:          (j['id']          as num).toInt(),
    name:        j['depName']      as String,
    description: j['description']  as String? ?? '',
    memberCount: (j['memberCount'] as num?)?.toInt() ?? 0,
  );
}


class DepartmentDetailDto {
  final int id;
  final String depName;
  final String description;
  final List<int> adminIds;

  const DepartmentDetailDto({
    required this.id,
    required this.depName,
    required this.description,
    required this.adminIds,
  });

  factory DepartmentDetailDto.fromJson(Map<String, dynamic> j) => DepartmentDetailDto(
    id: (j['id'] as num).toInt(),
    depName: (j['depName'] as String?) ?? (j['name'] as String?) ?? '',
    description: (j['description'] as String?) ?? '',
    adminIds: (j['admins'] as List?)
        ?.map((e) => e is Map<String, dynamic>
            ? ((e['id'] as num?)?.toInt() ?? 0)
            : (e as num).toInt())
        .where((id) => id > 0)
        .toList() ?? const [],
  );
}

class TriggerTypeDto {
  final int    id;
  final String name;
  const TriggerTypeDto({required this.id, required this.name});
  factory TriggerTypeDto.fromJson(Map<String, dynamic> j) => TriggerTypeDto(
    id:   (j['id']          as num).toInt(),
    name: j['triggerType']  as String,
  );
}

class SetDeptDto {
  final int    id;
  final String name;
  final int    depId;
  const SetDeptDto({required this.id, required this.name, required this.depId});
  factory SetDeptDto.fromJson(Map<String, dynamic> j) => SetDeptDto(
    id:    (j['id']    as num).toInt(),
    name:  j['name']   as String,
    depId: (j['depId'] as num).toInt(),
  );
}

class TriggerDto {
  final int              triggerId;
  final String           name;
  final int              delay;
  final bool             status;
  final TriggerTypeDto?  triggerType;
  final String?          text;
  final List<String>     firstTrigger;
  final List<SetDeptDto> departments;

  const TriggerDto({
    required this.triggerId, required this.name, required this.delay,
    required this.status, this.triggerType, this.text,
    required this.firstTrigger, required this.departments,
  });

  factory TriggerDto.fromJson(Map<String, dynamic> j) => TriggerDto(
    triggerId:    (j['triggerid'] as num).toInt(),
    name:         j['name']       as String,
    delay:        (j['delay'] as num?)?.toInt() ?? 0,
    status:       j['status']     as bool? ?? false,
    triggerType:  j['triggerType'] != null
        ? TriggerTypeDto.fromJson(j['triggerType'] as Map<String, dynamic>)
        : null,
    text:         (j['textOption'] as Map?)?['text'] as String?,
    firstTrigger: (j['firstTrigger'] as List?)?.map((e) => e as String).toList() ?? [],
    departments:  (j['departments'] as List?)
            ?.map((e) => SetDeptDto.fromJson(e as Map<String, dynamic>))
            .toList() ??
        [],
  );
}

class AppearanceDto {
  final String? id;
  final String? propertyName;
  final String? websiteUrl;
  final String? widgetScript;
  final String? buttonColor;
  final String? language;
  final String? heading;
  final String? textArea;
  final String? logoAlign;
  final String? headingAlign;
  final String? textAlign;
  final String? logoBase64;
  final List<String> appearance;

  const AppearanceDto({
    this.id,
    this.propertyName,
    this.websiteUrl,
    this.widgetScript,
    this.buttonColor,
    this.language,
    this.heading,
    this.textArea,
    this.logoAlign,
    this.headingAlign,
    this.textAlign,
    this.logoBase64,
    this.appearance = const [],
  });

  factory AppearanceDto.fromJson(Map<String, dynamic> j) => AppearanceDto(
    id:           j['id']?.toString(),
    propertyName: j['propertyName'] as String?,
    websiteUrl:   j['websiteURL'] as String?,
    widgetScript: j['widgetScript'] as String?,
    buttonColor:  j['buttonColor'] as String?,
    language:     j['language'] as String?,
    heading:      j['heading'] as String?,
    textArea:     j['textArea'] as String?,
    logoAlign:    j['logoAlign'] as String?,
    headingAlign: j['headingAlign'] as String?,
    textAlign:    j['textAlign'] as String?,
    logoBase64:   j['logoBase64'] as String?,
    appearance:   (j['appearence'] as List?)?.map((e) => e as String).toList() ?? [],
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Service
// ══════════════════════════════════════════════════════════════════════════════

class AdminService {
  AdminService._();
  static final AdminService instance = AdminService._();

  // ── Agents / Members ──────────────────────────────────────────────────────

  Future<List<AgentDto>> getAllAgents() async {
    final data = await ApiClient.instance.get('/chatbot/getAllAdmin') as List;
    return data.map((j) => AgentDto.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<List<AgentNameDto>> getAgentNames() async {
    final data = await ApiClient.instance.get('/chatbot/getadminnames') as List;
    return data.map((j) => AgentNameDto.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<void> inviteAgent({required String email, required String role}) async {
    await ApiClient.instance.postForm('/chatbot/invite', {'email': email, 'role': role});
  }

  Future<void> deleteAgent(int id) async {
    await ApiClient.instance.delete('/chatbot/delete/$id');
  }

  // ── Departments ───────────────────────────────────────────────────────────

  Future<List<DepartmentDto>> getAllDepartments() async {
    final data = await ApiClient.instance.get('/chatbot/getAllDepartment') as List;
    return data.map((j) => DepartmentDto.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<void> addDepartment({
    required String    name,
    required String    description,
    required List<int> adminIds,
  }) async {
    await ApiClient.instance.post('/chatbot/adddepartment', {
      'depName': name, 'description': description, 'adminIds': adminIds,
    });
  }

  Future<void> updateDepartment({
    required int       id,
    required String    name,
    required String    description,
    required List<int> adminIds,
  }) async {
    await ApiClient.instance.patch('/chatbot/updatedepartment/$id', {
      'depName': name, 'description': description, 'adminIds': adminIds,
    });
  }

  Future<DepartmentDetailDto?> getDepartmentById(int id) async {
    final data = await ApiClient.instance.get('/chatbot/getdep/$id');
    if (data == null) return null;
    return DepartmentDetailDto.fromJson(data as Map<String, dynamic>);
  }

  Future<void> deleteDepartment(int id) async {
    await ApiClient.instance.delete('/chatbot/deleteDep/$id');
  }

  // ── Triggers ──────────────────────────────────────────────────────────────

  Future<List<TriggerDto>> getAllTriggers() async {
    final data = await ApiClient.instance.get('/chatbot/getAllTrigger') as List;
    return data.map((j) => TriggerDto.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<List<TriggerTypeDto>> getTriggerTypes() async {
    final data = await ApiClient.instance.get('/chatbot/getTriggerType') as List;
    return data.map((j) => TriggerTypeDto.fromJson(j as Map<String, dynamic>)).toList();
  }

  Future<void> addTrigger({
    required String       name,
    required int          delay,
    required int          triggerTypeId,
    required List<String> firstTrigger,
    String?               text,
    List<int>             departmentIds = const [],
  }) async {
    await ApiClient.instance.post('/chatbot/AddTrigger', {
      'name': name, 'delay': delay, 'triggerTypeId': triggerTypeId,
      'firstTrigger': firstTrigger,
      if (text != null) 'text': text,
      'departmentIds': departmentIds,
    });
  }

  Future<void> updateTrigger({
    required int          id,
    required String       name,
    required int          delay,
    required int          triggerTypeId,
    required List<String> firstTrigger,
    String?               text,
    List<int>             departmentIds = const [],
  }) async {
    await ApiClient.instance.patch('/chatbot/UpdateTrigger/$id', {
      'name': name, 'delay': delay, 'triggerTypeId': triggerTypeId,
      'firstTrigger': firstTrigger,
      if (text != null) 'text': text,
      'departmentIds': departmentIds,
    });
  }

  Future<void> toggleTriggerStatus(int triggerId, {required bool enabled}) async {
    await ApiClient.instance.postForm('/chatbot/UpdateTriggerStatus', {
      'triggerId': triggerId.toString(), 'status': enabled.toString(),
    });
  }

  Future<void> deleteTrigger(int id) async {
    await ApiClient.instance.delete('/chatbot/deleteTrigger/$id');
  }

  // ── Widget Appearance ─────────────────────────────────────────────────────

  Future<AppearanceDto?> getAppearance() async {
    try {
      final data = await ApiClient.instance.get('/chatbot/GetAppearance');
      if (data == null) return null;
      return AppearanceDto.fromJson(data as Map<String, dynamic>);
    } on ApiException catch (e) {
      if (e.statusCode == 204) return null;
      rethrow;
    }
  }

  Future<String> createAppearance({
    required String       language,
    required String       heading,
    required String       textArea,
    required String       logoAlign,
    required String       headingAlign,
    required String       textAlign,
    required List<String> appearance,
    Uint8List?            logoBytes,
    String?               logoFilename,
  }) async {
    final fields = <String, String>{
      'Language': language,
      'heading': heading,
      'TextArea': textArea,
      'logoAlign': logoAlign,
      'headingAlign': headingAlign,
      'TextAlign': textAlign,
      'appearence': appearance.join(','),
    };
    dynamic result;
    if (logoBytes != null && logoFilename != null) {
      result = await ApiClient.instance.uploadBytes(
        '/chatbot/widget/appearance',
        logoBytes,
        logoFilename,
        'logo',
        fields: fields,
      );
    } else {
      result = await ApiClient.instance.postForm('/chatbot/widget/appearance', fields);
    }
    return result?.toString() ?? '';
  }

  Future<void> updateAppearance({
    required String       scriptId,
    required String       language,
    required String       heading,
    required String       textArea,
    required String       logoAlign,
    required String       headingAlign,
    required String       textAlign,
    required List<String> appearance,
    Uint8List?            logoBytes,
    String?               logoFilename,
  }) async {
    final fields = <String, String>{
      'Language': language,
      'heading': heading,
      'TextArea': textArea,
      'logoAlign': logoAlign,
      'headingAlign': headingAlign,
      'TextAlign': textAlign,
      'appearence': appearance.join(','),
    };
    if (logoBytes != null && logoFilename != null) {
      await ApiClient.instance.patchUploadBytes(
        '/chatbot/widget/appearance/$scriptId',
        logoBytes,
        logoFilename,
        'logo',
        fields: fields,
      );
    } else {
      await ApiClient.instance.patchForm('/chatbot/widget/appearance/$scriptId', fields);
    }
  }

  Future<void> saveWidgetProperty({
    required String scriptId,
    required String propertyName,
    required String websiteUrl,
    required String buttonColor,
    required String widgetScript,
  }) async {
    await ApiClient.instance.postForm('/chatbot/property/save', {
      'scriptId': scriptId, 'propertyName': propertyName,
      'websiteURL': websiteUrl, 'buttonColor': buttonColor,
      'widgetScript': widgetScript,
    });
  }

  Future<String> generateWidgetScript({
    required String scriptId,
    required String propertyName,
    required String websiteUrl,
    required String buttonColor,
  }) async {
    final result = await ApiClient.instance.postForm('/chatbot/property/generate', {
      'scriptId': scriptId, 'propertyName': propertyName,
      'websiteURL': websiteUrl, 'buttonColor': buttonColor,
    });
    return result?.toString() ?? '';
  }
}
