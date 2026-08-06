// ignore_for_file: unused_element

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import 'package:learnhub/screens/QuizScreen.dart';
import 'package:url_launcher/url_launcher.dart';

import '../dimensions.dart';
import '../url.dart';
import 'CourseListPage.dart';
import 'MeetingPage.dart';
import 'MyCoursesPage.dart';
import 'MyPaymentsPage.dart';

class WelcomePage extends StatefulWidget {
  const WelcomePage({super.key});

  @override
  State<WelcomePage> createState() => _WelcomePageState();
}

class _WelcomePageState extends State<WelcomePage> {
  final FlutterSecureStorage storage = FlutterSecureStorage();
  String userName = "User";
  String profileImage = "";
  bool isUserLoading = true;
  int unreadCount = 0;
  List<dynamic> courses = [];
  List<dynamic> filteredCourses = []; 
  List<dynamic> notifications = [];
  bool isLoading = true;
  int totalCourses = 0;
  int freeCourses = 0;
  int paidCourses = 0;
  int enrolledCoursesCount = 0;

  @override
  void initState() {
    super.initState();
    fetchUserProfile();
    fetchNotifications();
    loadCourseCounts();
    loadEnrolledCoursesCount();
    loadInitialData();
  }

Future<void> loadInitialData() async {
  setState(() => isLoading = true);
  final String? token = await storage.read(key: "token");
  if (token != null) {
    await fetchEnrolledCourses(token);
    await fetchAllCourses();
  }
  setState(() => isLoading = false);
}
Future<List<Course>> fetchEnrolledCourses(String token) async {
  final response = await http.get(
    Uri.parse('$baseUrl/AssignCourse/student/courselist'),
    headers: {
      'Authorization': token,
      'Content-Type': 'application/json',
    },
  );

  if (response.statusCode == 200) {
    List<dynamic> data = jsonDecode(response.body);
    List<Course> enrolledCourses = data.map((course) => Course.fromJson(course)).toList();
    await storage.write(key: "enrolledCoursesCount", value: enrolledCourses.length.toString());
    setState(() {
      enrolledCoursesCount = enrolledCourses.length;
    });
    return enrolledCourses;
  } else {
    throw Exception("Failed to load courses");
  }
}

Future<void> fetchAllCourses() async {
  try {
    final String? token = await storage.read(key: "token");
    if (token == null) {
      throw Exception("No token found. Please log in again.");
    }

    final response = await http.get(
      Uri.parse("$baseUrl/course/viewAll"),
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      setState(() {
        courses = data;
        filteredCourses = List.from(courses);
        totalCourses = courses.length;
        freeCourses = courses.where((course) => (course['amount'] ?? 0) == 0).length;
        paidCourses = totalCourses - freeCourses;
        isLoading = false;
      });
      
      await storage.write(key: "totalCourses", value: totalCourses.toString());
      await storage.write(key: "freeCourses", value: freeCourses.toString());
      await storage.write(key: "paidCourses", value: paidCourses.toString());
    } else {
      throw Exception("Failed to load courses");
    }
  } catch (e) {
    setState(() => isLoading = false);
    debugPrint("Error: ${e.toString()}");
  }
}
  Future<void> fetchUserProfile() async {
    try {
      final String? token = await storage.read(key: "token");
      setState(() => isUserLoading = true);
      if (token == null) throw Exception("No token found. Please log in again.");

      final response = await http.get(
        Uri.parse("$baseUrl/Edit/profiledetails"),
        headers: {"Authorization": token, "Content-Type": "application/json"},
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          userName = data['name'] ?? "User";
          profileImage = data['profileImage'] ?? "";
          isUserLoading = false;
        });
      } else {
        throw Exception("Failed to load user profile");
      }
    } catch (e) {
      setState(() => isUserLoading = false);
      debugPrint("Error: ${e.toString()}");
    }
  }

  Future<void> loadEnrolledCoursesCount() async {
    final String? count = await storage.read(key: "enrolledCoursesCount");
    setState(() {
      enrolledCoursesCount = int.tryParse(count ?? "0") ?? 0;
      isLoading = false;
    });
  }

  Widget _freeCoursesCard() {
    return Container(
      // padding: EdgeInsets.all(12),
      padding: EdgeInsets.all(Dimensions.fontSize(context, 12)),
      decoration: _cardDecoration().copyWith(border: Border(top: BorderSide(color: Color(0xFF4680FE), width: Dimensions.fontSize(context, 5)))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Free Courses", style: TextStyle(fontSize: Dimensions.fontSize(context, 15), color: Colors.grey, fontWeight: FontWeight.bold)),
             // Icon(Icons.fact_check_rounded, color: Color(0xFF4680FE), size: Dimensions.iconSize(context, 34)),
             GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => CourseListPage(
                      initialFilter: CourseFilter.free,
                      onNavigateToDetail: () {},
                    ),
                  ),
                );
              },
              child: Icon(
                Icons.fact_check_rounded, 
                color: Color(0xFF4680FE), 
                size: Dimensions.iconSize(context, 34),
              ),
            ),
            ],
          ),
          SizedBox(height: Dimensions.fontSize(context, 20)),
          Text("$freeCourses", style: TextStyle(fontSize: Dimensions.fontSize(context, 48), fontWeight: FontWeight.bold)),
          Text("Free Courses", style: TextStyle(fontSize: Dimensions.fontSize(context, 18), color: Color(0xFF4680FE))),
        ],
      ),
    );
  }

  Widget _enrolledCoursesCard() {
    return Container(
      padding: EdgeInsets.all(Dimensions.fontSize(context, 12)),
      decoration: _cardDecoration().copyWith(border: Border(top: BorderSide(color: Color(0xFF4680FE), width: Dimensions.fontSize(context, 5)))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text("Enrolled Courses", style: TextStyle(fontSize: Dimensions.fontSize(context, 15), color: Colors.grey, fontWeight: FontWeight.bold)),
            GestureDetector(
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => MyCoursesPage(
                      selectedIndex: 3,
                      onItemTapped: (index) {},
                    ),
                  ),
                );
              },
              child: Icon(
                Icons.download_done_rounded, 
                color: Color(0xFF4680FE), 
                size: Dimensions.iconSize(context, 28),
              ),
            ),
             // Icon(Icons.download_done_rounded, color: Color(0xFF4680FE), size: Dimensions.iconSize(context, 34),),
            ],
          ),
          SizedBox(height: Dimensions.fontSize(context, 10)),
          SizedBox(
            height: Dimensions.fontSize(context, 120),
            child: isLoading
                ? Center(child: CircularProgressIndicator())
                : SizedBox(
                    width: Dimensions.fontSize(context, 200), // Dynamic
        height: Dimensions.fontSize(context, 200),
                    child: PieChart(
                      PieChartData(
                        sections: [
                          PieChartSectionData(
                              color: Color(0xFF4680FE),
                              value: totalCourses > 0 ? (enrolledCoursesCount / totalCourses) * 100 : 0, 
                              title: "${totalCourses > 0 ? (enrolledCoursesCount / totalCourses * 100).toStringAsFixed(1) : 0}%"),
                          PieChartSectionData(
                              color: Colors.grey,
                              value: totalCourses > 0 ? ((totalCourses - enrolledCoursesCount) / totalCourses) * 100 : 0,
                              title: "${totalCourses > 0 ? ((totalCourses - enrolledCoursesCount) / totalCourses * 100).toStringAsFixed(1) : 0}%"),
                        ],
                        borderData: FlBorderData(show: false),
                        centerSpaceRadius: Dimensions.fontSize(context, 25),
                        sectionsSpace: 0,
                      ),
                    ),
                  ),
          ),
          SizedBox(height: Dimensions.fontSize(context, 10)),
          Text("$enrolledCoursesCount Courses Enrolled", style: TextStyle(fontSize: Dimensions.fontSize(context, 15), color: Colors.black, fontWeight: FontWeight.bold)),
          SizedBox(height: Dimensions.fontSize(context, 10)),
          Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              _buildLegendItem(Color(0xFF4680FE), "Enrolled Courses"),
              SizedBox(height: Dimensions.fontSize(context, 10)),
              _buildLegendItem(Colors.grey, "Remaining Courses"),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String text) {
    return Row(
      children: [
        Container(
          width: Dimensions.fontSize(context, 12), // Dynamic
        height: Dimensions.fontSize(context, 12),
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.rectangle,
          ),
        ),
        SizedBox(width: Dimensions.fontSize(context, 6)),
        Text(text, style: TextStyle(fontSize: Dimensions.fontSize(context, 12), color: Colors.black)),
      ],
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(Dimensions.fontSize(context, 12)),
      boxShadow: [BoxShadow(color: Colors.black12, blurRadius: 4, spreadRadius: 1)],
    );
  }

  Future<void> fetchNotifications() async {
    try {
      final String? token = await storage.read(key: "token");
      if (token == null) throw Exception("No token found. Please log in again.");

      final response = await http.get(
        Uri.parse("$baseUrl/notifications"),
        headers: {"Authorization": token, "Content-Type": "application/json"},
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = jsonDecode(response.body);

        setState(() {
          notifications = data.map((n) => {
                "title": n['heading'] ?? "No Title",
                "message": n['description'] ?? "No Message",
                "date": n['createdDate'] ?? "Unknown Date",
                "link": n['link'] ?? "",
                "notifyTypeId": n['notifyTypeId'] ?? 0,
                "isRead": n['isRead'] ?? false,
              }).toList();
          notifications = notifications.reversed.take(20).toList();
          unreadCount = notifications.where((n) => n['isRead'] == false).length;
        });
      } else {
        throw Exception("Failed to load notifications");
      }
    } catch (e) {
      debugPrint("Error: ${e.toString()}");
    }
  }

  Future<void> loadCourseCounts() async {
    final String? total = await storage.read(key: "totalCourses");
    final String? free = await storage.read(key: "freeCourses");
    final String? paid = await storage.read(key: "paidCourses");

    setState(() {
      totalCourses = int.tryParse(total ?? "0") ?? 0;
      freeCourses = int.tryParse(free ?? "0") ?? 0;
      paidCourses = int.tryParse(paid ?? "0") ?? 0;
    });
  }

  void _markNotificationsRead() {
    setState(() {
      unreadCount = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading || isUserLoading) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: CircularProgressIndicator(
            color: Color(0xFF4680FE),
          ),
        ),
      );
    }
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false, // hides the back arrow
        // toolbarHeight: 80,
        toolbarHeight: Dimensions.fontSize(context, 80),
        backgroundColor: Colors.white,
        elevation: 0,
        title: Row(
          children: [
            CircleAvatar(
              // radius: 30,
              radius: Dimensions.fontSize(context, 30), // Dynamic radius
              backgroundImage: profileImage.isNotEmpty
                  ? MemoryImage(base64Decode(profileImage))
                  : AssetImage("assets/profile_pic.png") as ImageProvider,
            ),
            // SizedBox(width: 10),
            SizedBox(width: Dimensions.fontSize(context, 10)),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hi, $userName', style: TextStyle(fontWeight: FontWeight.w600,
                //  fontSize: 22, 
                fontSize: Dimensions.fontSize(context, 22),
                 color: Colors.black)),
                Text('Have a Great Day!', style: TextStyle(
                  // fontSize: 18, 
                  fontSize: Dimensions.fontSize(context, 18),
                  color: Colors.black, fontWeight: FontWeight.w600)),
              ],
            ),
          ],
        ),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: Icon(Icons.notifications_outlined, size: Dimensions.iconSize(context, 24), color: Color(0xFFA3A3A5)),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => NotificationsScreen(notifications: notifications),
                    ),
                  );
                },
              ),
              if (unreadCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: CircleAvatar(
                    radius: 10,
                    backgroundColor: Colors.red,
                    child: Text(
                      unreadCount.toString(),
                      style: TextStyle(color: Colors.white, fontSize: Dimensions.fontSize(context, 12), fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Padding(
          padding:  EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 16)),
          child: Column(
            children: [
              SizedBox(height: Dimensions.fontSize(context, 20)),
              Row(
                children: [
                  Expanded(child: _enrolledCoursesCard()),
                  SizedBox(width: Dimensions.fontSize(context, 10)),
                  Expanded(
                    child: SizedBox(
                      height: Dimensions.fontSize(context, 200),
                      child: _freeCoursesCard(),
                    ),
                  ),
                ],
              ),
              SizedBox(height: Dimensions.fontSize(context, 20)),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Notifications", style: TextStyle(fontSize: Dimensions.fontSize(context, 18), fontWeight: FontWeight.bold)),
                  TextButton(
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(builder: (context) => NotificationsScreen(notifications: notifications)),
                      );
                    },
                    child: Text("See all", style: TextStyle(fontSize: Dimensions.fontSize(context, 14), color: Color(0xFF4680FE))),
                  ),
                ],
              ),
              SizedBox(height: Dimensions.fontSize(context, 10)),
              if (notifications.isNotEmpty)
                ...notifications.take(3).map((n) => _notificationItem(
                      n['title'] ?? "No Title",
                      n['message'] ?? "No Message",
                      n['date'] ?? "Unknown Date",
                      n['link'],
                      n['notifyTypeId'] ?? 0,
                      context,
                    ))
              else
              SizedBox(height: Dimensions.fontSize(context, 120)),
                Center(child: Text("No new notifications", style: TextStyle(fontSize: Dimensions.fontSize(context, 14), color: Colors.grey))),
            ],
          ),
        ),
      ),
    );
  }

  Widget _notificationItem(
    String title,
    String subtitle,
    String date,
    String? link,
    int notifyTypeId,
    BuildContext context,
  ) {
    return GestureDetector(
      onTap: () {
        debugPrint("Notification clicked - Type: $notifyTypeId, Link: $link");
        handleNotificationClick(context, notifyTypeId, link: link);
      },
      child: Container(
        margin:  EdgeInsets.only(bottom: Dimensions.fontSize(context, 10)),
        padding:  EdgeInsets.all(Dimensions.fontSize(context, 12)),
        decoration: BoxDecoration(
          color: const Color(0xFFA3A3A5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                     Icon(
                      Icons.notifications,
                      color: Colors.white,
                      size: Dimensions.iconSize(context, 20)
                    ),
                     SizedBox(width: Dimensions.fontSize(context, 8)),
                    Text(
                      title,
                      style:  TextStyle(
                        fontSize: Dimensions.fontSize(context, 14),
                        fontWeight: FontWeight.bold,
                        color: Colors.white
                      ),
                    ),
                  ],
                ),
                Text(
                  _formatDate(date),
                  style:  TextStyle(
                    fontSize: Dimensions.fontSize(context, 12),
                    color: Colors.white
                  ),
                ),
              ],
            ),
            SizedBox(height: Dimensions.fontSize(context, 5)),
            Text(
              subtitle,
              style:  TextStyle(
                fontSize: Dimensions.fontSize(context, 12),
                color: Colors.white
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd-MM-yyyy').format(date);
    } catch (e) {
      return dateString;
    }
  }
 
  void handleNotificationClick(BuildContext context, int notifyTypeId, {String? link}) {
  debugPrint("Handling notification click - Type: $notifyTypeId, Link: $link");
  
  switch (notifyTypeId) {
    case 1: // Course List
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CourseListPage(
            onNavigateToDetail: () {
              // Handle navigation to course detail if needed
            },
          ),
        ),
      );
      break;
      
    case 2: // Test Page
      if (link != null) {
        // Extract courseId from link (format: /test/start/Flutter/5)
        final parts = link.split('/');
        if (parts.length >= 5) {
          final courseId = parts[4];
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TestInstructionsScreen(
                courseId: courseId,
                //courseName: parts[3], // "Flutter" in the example
              ),
            ),
          );
        } else {
          debugPrint("Invalid test link format");
        }
      } else {
        debugPrint("Test link not available");
      }
      break;
      
    case 35: // My Courses (existing)
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => MyCoursesPage(
            selectedIndex: 3,
            onItemTapped: (index) {},
          ),
        ),
      );
      break;
      
    case 37: // Meeting Page (existing)
      if (link != null && link.isNotEmpty) {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MeetingPage(
              selectedIndex: 2,
              onItemTapped: (index) {},
            ),
          ),
        );
        
      } else {
        debugPrint("Meeting link not available");
      }
      break;
      
    case 38: // Payments (existing)
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => MyPaymentsPage(
            selectedIndex: 3,
            onItemTapped: (index) {},
          ),
        ),
      );
      break;
      
    default:
      if (link != null && link.isNotEmpty && link.startsWith("http")) {
        launchUrl(Uri.parse(link), mode: LaunchMode.externalApplication);
      } else {
        debugPrint("Unknown notification type: $notifyTypeId");
      }
      break;
  }
}
}

class NotificationsScreen extends StatelessWidget {
  final List<dynamic> notifications;

  const NotificationsScreen({super.key, required this.notifications});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title:  Text(
          "Notifications",
          style: TextStyle(
            color: Colors.black,
            fontSize: Dimensions.fontSize(context, 24),
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () {
            if (Navigator.canPop(context)) {
              Navigator.pop(context);
            }
          },
        ),
      ),
      body: notifications.isEmpty
          ? const Center(child: Text("No notifications available"))
          : ListView.builder(
              itemCount: notifications.length,
              itemBuilder: (context, index) {
                final notification = notifications[index];
                return Padding(
                  padding: const EdgeInsets.all(8.0),
                  child: _NotificationItem(
                    title: notification['title'] ?? "No Title",
                    subtitle: notification['message'] ?? "No Message",
                    date: notification['date'] ?? "Unknown Date",
                    link: notification['link'],
                    notifyTypeId: notification['notifyTypeId'] ?? 0,
                    onTap: () {
                      _handleNotificationClick(
                        context,
                        notification['notifyTypeId'] ?? 0,
                        link: notification['link'],
                      );
                    },
                  ),
                );
              },
            ),
    );
  }

  void _handleNotificationClick(BuildContext context, int notifyTypeId, {String? link}) {
    debugPrint("Handling notification click - Type: $notifyTypeId, Link: $link");
    
    switch (notifyTypeId) {
      case 1: // Course List
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => CourseListPage(
            onNavigateToDetail: () {
             
            },
            
          ),
        ),
      );
      break;
      
    case 2: // Test Page
      if (link != null) {
        final parts = link.split('/');
        if (parts.length >= 5) {
          final courseId = parts[4];
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => TestInstructionsScreen(
                courseId: courseId,
               // courseName: parts[3],
              ),
            ),
          );
        } else {
          debugPrint("Invalid test link format");
        }
      } else {
        debugPrint("Test link not available");
      }
      break;
      case 35: // My Courses
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MyCoursesPage(
              selectedIndex: 3,
              onItemTapped: (index) {},
            ),
          ),
        );
        break;
        
      case 37: // Meeting Link
        if (link != null && link.isNotEmpty) {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => MeetingPage(
                selectedIndex: 2,
              onItemTapped: (index) {},
              ),
            ),
          );
        } else {
          debugPrint("Meeting link not available");
        }
        break;
        
      case 38: // Payments
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => MyPaymentsPage(
              selectedIndex: 3,
              onItemTapped: (index) {},
            ),
          ),
        );
        break;
        
      default:
        if (link != null && link.isNotEmpty && link.startsWith("http")) {
          launchUrl(Uri.parse(link), mode: LaunchMode.externalApplication);
        } else {
          debugPrint("Unknown notification type: $notifyTypeId");
        }
        break;
    }
  }
}

class _NotificationItem extends StatelessWidget {
  final String title;
  final String subtitle;
  final String date;
  final String? link;
  final int notifyTypeId;
  final VoidCallback onTap;

  const _NotificationItem({
    required this.title,
    required this.subtitle,
    required this.date,
    this.link,
    required this.notifyTypeId,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 12)),
        decoration: BoxDecoration(
          color: const Color(0xFFA3A3A5),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                     Icon(Icons.notifications, color: Colors.white, size: Dimensions.iconSize(context, 20)),
                     SizedBox(width: 8),
                    Text(
                      title,
                      style:  TextStyle(
                        fontSize: Dimensions.fontSize(context, 14),
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
                Text(
                  _formatDate(date),
                  style: TextStyle(fontSize: Dimensions.fontSize(context, 12), color: Colors.white70),
                ),
              ],
            ),
            SizedBox(height: Dimensions.fontSize(context, 5)),
            Text(
              subtitle,
              style: TextStyle(fontSize: Dimensions.fontSize(context, 12), color: Colors.white),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDate(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      return DateFormat('dd-MM-yyyy').format(date);
    } catch (e) {
      return dateString;
    }
  }
}