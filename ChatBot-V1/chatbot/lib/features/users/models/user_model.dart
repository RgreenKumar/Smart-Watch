class UserChatRecord {
  final String status;
  final String date;
  final String? agentName;
  final bool isMissed;

  const UserChatRecord({
    required this.status,
    required this.date,
    this.agentName,
    this.isMissed = false,
  });

  bool get isOpen => status.toLowerCase() == 'open';
}

class UserModel {
  final String id;
  final String name;
  final String email;
  final String firstLoginTime;
  final String phone;
  final List<UserChatRecord> chatHistory;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.firstLoginTime,
    this.phone = '',
    this.chatHistory = const [],
  });

  String get initials =>
      name.isNotEmpty ? name[0].toUpperCase() : '?';
}

class UserMockData {
  static List<UserModel> get users => [
        const UserModel(
          id: 'u1',
          name: 'Ram Kumar',
          email: 'ramkumar12@gmail.com',
          firstLoginTime: '9:55pm',
          phone: '9876543210',
          chatHistory: [
            UserChatRecord(
              status: 'Closed',
              date: '10-jul-2025',
              agentName: 'Agent 1',
            ),
          ],
        ),
        const UserModel(
          id: 'u2',
          name: 'Jai Kumar',
          email: 'jaikumar82@gmail.com',
          firstLoginTime: '9:55pm',
          phone: '9876543211',
          chatHistory: [
            UserChatRecord(
              status: 'Open',
              date: '12-jul-2025',
              isMissed: true,
            ),
          ],
        ),
        const UserModel(
          id: 'u3',
          name: 'Karthiwaren',
          email: 'karthiwaren1@gmail.com',
          firstLoginTime: '9:55pm',
          phone: '9876543212',
          chatHistory: [
            UserChatRecord(
              status: 'Open',
              date: '23-feb-2025',
              isMissed: true,
            ),
            UserChatRecord(
              status: 'Closed',
              date: '19-feb-2025',
              agentName: 'Agent 1',
            ),
          ],
        ),
        const UserModel(
          id: 'u4',
          name: 'Kannan Pandian',
          email: 'kannanpandian01@gmail.com',
          firstLoginTime: '9:55pm',
          phone: '9876543213',
          chatHistory: [],
        ),
        const UserModel(
          id: 'u5',
          name: 'Priya Kumari',
          email: 'priyakumari05@gmail.com',
          firstLoginTime: '9:55pm',
          phone: '9876543214',
          chatHistory: [
            UserChatRecord(
              status: 'Closed',
              date: '15-mar-2025',
              agentName: 'Agent 2',
            ),
          ],
        ),
        const UserModel(
          id: 'u6',
          name: 'Varsha',
          email: 'varsha72@gmail.com',
          firstLoginTime: '9:55pm',
          phone: '9876543215',
          chatHistory: [],
        ),
        const UserModel(
          id: 'u7',
          name: 'Praveen Kumar',
          email: 'praveenkumar@gmail.com',
          firstLoginTime: '9:55pm',
          phone: '9876543216',
          chatHistory: [
            UserChatRecord(
              status: 'Closed',
              date: '11-jul-2025',
              agentName: 'Agent 2',
            ),
          ],
        ),
        const UserModel(
          id: 'u8',
          name: 'Karthi Waren',
          email: 'karthiwaren1@gmail.com',
          firstLoginTime: '9:55pm',
          phone: '9876543217',
          chatHistory: [
            UserChatRecord(
              status: 'Closed',
              date: '09-jul-2025',
              agentName: 'Agent 3',
            ),
          ],
        ),
      ];
}
