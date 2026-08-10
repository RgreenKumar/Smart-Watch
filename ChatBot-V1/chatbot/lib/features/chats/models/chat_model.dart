class ChatModel {
  final String id;
  final String visitorName;
  final String lastMessage;
  final String agentName;
  final String time;
  final String status; // 'Open' | 'Closed'
  final bool isMissed;

  const ChatModel({
    required this.id,
    required this.visitorName,
    required this.lastMessage,
    required this.agentName,
    required this.time,
    required this.status,
    this.isMissed = false,
  });

  bool get isOpen => status.toLowerCase() == 'open';
}

/// Mock data
class ChatMockData {
  static List<ChatModel> get chats => [
        const ChatModel(
          id: '1',
          visitorName: 'Ram Kumar',
          lastMessage: 'Hi all',
          agentName: 'Agent Name',
          time: '9:55',
          status: 'Open',
        ),
        const ChatModel(
          id: '2',
          visitorName: 'Jai Kumar',
          lastMessage: 'Hello there',
          agentName: 'Agent Name',
          time: '9:40',
          status: 'Closed',
          isMissed: true,
        ),
        const ChatModel(
          id: '3',
          visitorName: 'Karthiwaren',
          lastMessage: 'I need help with...',
          agentName: 'Agent Name',
          time: '9:20',
          status: 'Open',
        ),
        const ChatModel(
          id: '4',
          visitorName: 'Varsha',
          lastMessage: 'Thank you!',
          agentName: 'Agent Name',
          time: '8:55',
          status: 'Closed',
        ),
        const ChatModel(
          id: '5',
          visitorName: 'Praveen Kumar',
          lastMessage: 'Can you assist me?',
          agentName: 'Agent Name',
          time: '8:30',
          status: 'Open',
        ),
        const ChatModel(
          id: '6',
          visitorName: 'Kannan Pandian',
          lastMessage: 'Hi all',
          agentName: 'Agent Name',
          time: '8:10',
          status: 'Closed',
        ),
        const ChatModel(
          id: '7',
          visitorName: 'Priya Kumari',
          lastMessage: 'Looking for support',
          agentName: 'Agent Name',
          time: '7:50',
          status: 'Open',
          isMissed: true,
        ),
        const ChatModel(
          id: '8',
          visitorName: 'Ramachandran',
          lastMessage: 'Please help',
          agentName: 'Agent Name',
          time: '7:30',
          status: 'Open',
        ),
        const ChatModel(
          id: '9',
          visitorName: 'Sundar Raj',
          lastMessage: 'Good morning',
          agentName: 'Agent Name',
          time: '7:10',
          status: 'Closed',
        ),
        const ChatModel(
          id: '10',
          visitorName: 'Meena Devi',
          lastMessage: 'Is anyone there?',
          agentName: 'Agent Name',
          time: '6:55',
          status: 'Open',
        ),
      ];

  static List<Map<String, String>> get messages => [
        {
          'text':
              'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
          'sender': 'visitor',
          'time': '4.55pm',
          'avatar': 'R',
        },
        {
          'text':
              'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
          'sender': 'agent',
          'time': '4.57pm',
          'avatar': 'G',
        },
        {
          'text':
              'Lorem Ipsum is simply dummy text of the printing and typesetting industry',
          'sender': 'visitor',
          'time': '4.59pm',
          'avatar': 'R',
        },
        {
          'text': 'Sure, let me look into that for you right away.',
          'sender': 'agent',
          'time': '5.01pm',
          'avatar': 'G',
        },
        {
          'text': 'Thank you, I appreciate your quick response!',
          'sender': 'visitor',
          'time': '5.02pm',
          'avatar': 'R',
        },
      ];
}
