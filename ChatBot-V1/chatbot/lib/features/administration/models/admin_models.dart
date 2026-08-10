// ── Agent / Member ────────────────────────────────────────
class AgentMember {
  final String id;
  final String username;
  final String email;
  final String role; // 'ADMIN' | 'AGENT'
  final String status; // 'Active' | 'Inactive'

  const AgentMember({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.status = 'Active',
  });

  AgentMember copyWith({
    String? username,
    String? email,
    String? role,
    String? status,
  }) {
    return AgentMember(
      id: id,
      username: username ?? this.username,
      email: email ?? this.email,
      role: role ?? this.role,
      status: status ?? this.status,
    );
  }
}

// ── Department ────────────────────────────────────────────
class Department {
  final String id;
  final String name;
  final String description;
  final List<String> memberIds; // agent ids

  const Department({
    required this.id,
    required this.name,
    required this.description,
    this.memberIds = const [],
  });

  int get memberCount => memberIds.length;

  Department copyWith({
    String? name,
    String? description,
    List<String>? memberIds,
  }) {
    return Department(
      id: id,
      name: name ?? this.name,
      description: description ?? this.description,
      memberIds: memberIds ?? this.memberIds,
    );
  }
}

// ── Profile / Property ────────────────────────────────────
class PropertyProfile {
  final String name;
  final String url;
  final bool isActive;

  const PropertyProfile({
    required this.name,
    required this.url,
    this.isActive = true,
  });

  PropertyProfile copyWith({
    String? name,
    String? url,
    bool? isActive,
  }) {
    return PropertyProfile(
      name: name ?? this.name,
      url: url ?? this.url,
      isActive: isActive ?? this.isActive,
    );
  }
}

// ── Chat Widget Config ────────────────────────────────────
class ChatWidgetConfig {
  final String propertyName;
  final String websiteUrl;
  final String widgetColorHex;
  final String? generatedCode;

  const ChatWidgetConfig({
    required this.propertyName,
    required this.websiteUrl,
    this.widgetColorHex = '#225a0c',
    this.generatedCode,
  });

  ChatWidgetConfig copyWith({
    String? propertyName,
    String? websiteUrl,
    String? widgetColorHex,
    String? generatedCode,
  }) {
    return ChatWidgetConfig(
      propertyName: propertyName ?? this.propertyName,
      websiteUrl: websiteUrl ?? this.websiteUrl,
      widgetColorHex: widgetColorHex ?? this.widgetColorHex,
      generatedCode: generatedCode ?? this.generatedCode,
    );
  }
}

// ── Header Card (Widget Content) ─────────────────────────
enum CardType { logo, heading, textArea }
enum CardAlignment { left, center, right }

class HeaderCard {
  final String id;
  final String title;
  final bool isEnabled;
  final CardType type;
  final CardAlignment alignment;
  final String content; // headline text or text area content

  const HeaderCard({
    required this.id,
    required this.title,
    this.isEnabled = true,
    this.type = CardType.heading,
    this.alignment = CardAlignment.center,
    this.content = '',
  });

  HeaderCard copyWith({
    String? title,
    bool? isEnabled,
    CardType? type,
    CardAlignment? alignment,
    String? content,
  }) {
    return HeaderCard(
      id: id,
      title: title ?? this.title,
      isEnabled: isEnabled ?? this.isEnabled,
      type: type ?? this.type,
      alignment: alignment ?? this.alignment,
      content: content ?? this.content,
    );
  }
}

// ── Mock Data ─────────────────────────────────────────────
class AdminMockData {
  static PropertyProfile get profile => const PropertyProfile(
        name: 'E-commerce',
        url: 'http://localhost:5500/',
        isActive: true,
      );

  static ChatWidgetConfig get chatWidget => const ChatWidgetConfig(
        propertyName: 'Demo',
        websiteUrl: 'http://localhost:5500/',
        widgetColorHex: '#225a0c',
        generatedCode:
            "<script async defer src='http://localhost:8080/chatbot/widget/47d7d99f-a324-bc6e-e69457dc7dba'></script>",
      );

  static List<HeaderCard> get headerCards => [
        const HeaderCard(
          id: 'h1',
          title: 'Heading',
          isEnabled: true,
          type: CardType.heading,
          alignment: CardAlignment.center,
          content: 'This is Heading',
        ),
        const HeaderCard(
          id: 'h2',
          title: 'TextArea',
          isEnabled: true,
          type: CardType.textArea,
          alignment: CardAlignment.left,
          content: 'Text Area sample',
        ),
      ];

  static List<AgentMember> get members => [
        const AgentMember(
          id: 'm1',
          username: 'de',
          email: 'de@gmail.com',
          role: 'ADMIN',
          status: 'Active',
        ),
        const AgentMember(
          id: 'm2',
          username: 'de1',
          email: 'de1@gmail.com',
          role: 'AGENT',
          status: 'Active',
        ),
        const AgentMember(
          id: 'm3',
          username: 'agent_raj',
          email: 'raj@meganar.com',
          role: 'AGENT',
          status: 'Active',
        ),
        const AgentMember(
          id: 'm4',
          username: 'kumar_v',
          email: 'kumar@meganar.com',
          role: 'AGENT',
          status: 'Inactive',
        ),
      ];

  static List<Department> get departments => [
        const Department(
          id: 'd1',
          name: 'depart_two',
          description: 'demo',
          memberIds: [],
        ),
        const Department(
          id: 'd2',
          name: 'depart_3',
          description: '3',
          memberIds: ['m1', 'm2'],
        ),
        const Department(
          id: 'd3',
          name: 'Support Team',
          description: 'Customer support department',
          memberIds: ['m2', 'm3', 'm4'],
        ),
      ];

  static const List<String> languages = [
    'English',
    'Tamil',
    'Hindi',
    'French',
    'Spanish',
    'German',
    'Arabic',
  ];
}

// ── Trigger ───────────────────────────────────────────────
enum TriggerType { basic, custom }
enum TriggerDelay { noDelay, fiveSeconds, tenSeconds, thirtySeconds }

class TriggerBlock {
  final String id;
  final String blockType; // 'TextArea' | 'Department'
  final String content;
  final List<String> departments; // for Department block

  const TriggerBlock({
    required this.id,
    required this.blockType,
    this.content = '',
    this.departments = const [],
  });

  TriggerBlock copyWith({
    String? blockType,
    String? content,
    List<String>? departments,
  }) {
    return TriggerBlock(
      id: id,
      blockType: blockType ?? this.blockType,
      content: content ?? this.content,
      departments: departments ?? this.departments,
    );
  }
}

class AppTrigger {
  final String id;
  final String name;
  final String description;
  final bool isEnabled;
  final TriggerType type;
  final TriggerDelay delay;
  final List<TriggerBlock> blocks;

  const AppTrigger({
    required this.id,
    required this.name,
    required this.description,
    this.isEnabled = true,
    this.type = TriggerType.basic,
    this.delay = TriggerDelay.noDelay,
    this.blocks = const [],
  });

  AppTrigger copyWith({
    String? name,
    String? description,
    bool? isEnabled,
    TriggerType? type,
    TriggerDelay? delay,
    List<TriggerBlock>? blocks,
  }) {
    return AppTrigger(
      id: id,
      name: name ?? this.name,
      description: description ?? this.description,
      isEnabled: isEnabled ?? this.isEnabled,
      type: type ?? this.type,
      delay: delay ?? this.delay,
      blocks: blocks ?? this.blocks,
    );
  }

  String get typeLabel =>
      type == TriggerType.basic ? 'Basic' : 'Custom';

  String get delayLabel {
    switch (delay) {
      case TriggerDelay.noDelay:
        return 'No Delay';
      case TriggerDelay.fiveSeconds:
        return '5 Seconds';
      case TriggerDelay.tenSeconds:
        return '10 Seconds';
      case TriggerDelay.thirtySeconds:
        return '30 Seconds';
    }
  }
}

class TriggerMockData {
  static List<AppTrigger> get triggers => [
        AppTrigger(
          id: 't1',
          name: 'triggerone',
          description: 'Hello.....',
          isEnabled: true,
          type: TriggerType.basic,
          delay: TriggerDelay.noDelay,
          blocks: [
            TriggerBlock(
              id: 'b1',
              blockType: 'Department',
              departments: ['depart_two', 'depart_3'],
            ),
          ],
        ),
        AppTrigger(
          id: 't2',
          name: 'welcome_msg',
          description: 'Welcome to our support!',
          isEnabled: false,
          type: TriggerType.basic,
          delay: TriggerDelay.fiveSeconds,
          blocks: [
            const TriggerBlock(
              id: 'b2',
              blockType: 'TextArea',
              content: 'Hi there! How can we help you today?',
            ),
          ],
        ),
      ];
}
