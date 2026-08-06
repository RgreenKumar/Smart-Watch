// ignore_for_file: unused_element, unused_local_variable, dead_code, avoid_print, duplicate_ignore, unnecessary_brace_in_string_interps, use_build_context_synchronously

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../dimensions.dart';
import 'CourseDetailPage.dart';
import 'package:http/http.dart' as http;
import '../url.dart';
import 'WelcomePage.dart';
import 'payment.dart';

enum CourseFilter {
  all,
  free,
  paid,
  enrolled,
}
class CourseListPage extends StatefulWidget {
  final VoidCallback onNavigateToDetail;
  final CourseFilter? initialFilter; 

  const CourseListPage({super.key, required this.onNavigateToDetail,this.initialFilter,});

  @override
  // ignore: library_private_types_in_public_api
  _CourseListPageState createState() => _CourseListPageState();
}

class _CourseListPageState extends State<CourseListPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final TextEditingController _searchController = TextEditingController();
  bool _isSearching = false;
  String searchQuery = "";
  List<dynamic> courses = [];
  List<dynamic> filteredCourses = [];
  List<dynamic> notifications = [];
  bool isLoading = true;
  final FlutterSecureStorage storage = FlutterSecureStorage();
  String userName = "User";
  String profileImage = "";
  bool isUserLoading = true;
  int totalCourses = 0;
int freeCourses = 0;
int paidCourses =0;
int _initialTabIndex = 0;

  int unreadCount = 0;
  @override
  void initState() {
    super.initState();
    _initialTabIndex = widget.initialFilter == CourseFilter.free ? 2 : 
                      (widget.initialFilter == CourseFilter.paid ? 1 : 0);
    
    _tabController = TabController(
      length: 3, 
      vsync: this,
      initialIndex: _initialTabIndex // Set initial tab
    );
    
    fetchCourses();
    fetchUnreadCount();
    fetchUserProfile();
    fetchNotifications();
    _searchController.addListener(_filterCourses);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _searchController.dispose();
    super.dispose();
  }
Future<void> _fetchUserId() async {
  }
  Future<void> fetchUnreadCount() async {
    String? token = await storage.read(key: "token");
    if (token == null) return; 

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/unreadCount'),

        headers: {'Authorization': token},
      );

      if (response.statusCode == 200) {
        setState(() {
          unreadCount =
              int.tryParse(response.body) ?? 0; // Convert response to int
        });
      }
    } catch (e) {
      // ignore: avoid_print
      print("Error fetching unread count: $e");
    }
  }

  Future<void> fetchUserProfile() async {
    try {
      final String? token = await storage.read(key: "token");
      setState(() => isUserLoading = true);
      if (token == null)
        // ignore: curly_braces_in_flow_control_structures
        throw Exception("No token found. Please log in again.");

      final response = await http.get(
        Uri.parse("$baseUrl/Edit/profiledetails"),

        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
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

  Future<List<Batch>> fetchBatches(String courseId) async {
  
  final response = await http.get(Uri.parse("$baseUrl/Batch/getAll/$courseId"));

  if (response.statusCode == 200) {
    List<dynamic> jsonData = json.decode(response.body);
    return jsonData.map((batch) => Batch.fromJson(batch)).toList();
  } else {
    throw Exception("Failed to load batches");
  }
}


  Future<void> fetchCourses() async {
    try {
      final String? token = await storage.read(key: "token");
      setState(() => isLoading = true);
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
        // ignore: avoid_print
        print("Fetched Courses: ${data.length}"); // Debugging
        setState(() {
          courses = data;
          filteredCourses = List.from(courses);

          totalCourses = courses.length;
        freeCourses = courses.where((course) => (course['amount'] ?? 0) == 0).length;
        paidCourses = totalCourses - freeCourses; // Since total = free + paid

          isLoading = false;
        });
        // Store values in Secure Storage
      await storage.write(key: "totalCourses", value: totalCourses.toString());
      await storage.write(key: "freeCourses", value: freeCourses.toString());
      await storage.write(key: "paidCourses", value: paidCourses.toString());

        Text("Total Courses: $totalCourses");
Text("Free Courses: $freeCourses");
Text("Paid Courses: $paidCourses");

      } else {
        throw Exception("Failed to load courses");
      }
    } catch (e) {
      setState(() => isLoading = false);
      debugPrint("Error: ${e.toString()}");
    }
  }

  void _filterCourses() {
    setState(() {
      searchQuery = _searchController.text.trim();
      String query = searchQuery.toLowerCase();
      filteredCourses = courses.where((course) {
        return course['courseName'].toLowerCase().contains(query);
      }).toList();
    });

    // ignore: avoid_print
    print("Filtered Courses:");
    for (var course in filteredCourses) {
      // ignore: avoid_print
      print("Name: ${course['courseName']}, Amount: ${course['amount']}");
    }
  }

Future<void> _fetchBatchAndProceed(String courseId, {required bool isFullPayment, required double amount}) async {
  try {
    final String? token = await storage.read(key: "token");
    if (token == null) {
      throw Exception("No token found. Please log in again.");
    }

    String? userIdStr = await storage.read(key: "userId");

    int userId = int.parse(userIdStr!);
    print("Fetching batches for courseId: $courseId");

    final response = await http.get(
      Uri.parse("$baseUrl/Batch/getAll/$courseId"),
      headers: {"Authorization": token},
    );

    if (response.statusCode == 200) {
      List<dynamic> batchList = json.decode(response.body);
      if (batchList.isNotEmpty) {
        Batch selectedBatch = Batch.fromJson(batchList[0]);
        print("$userId,${selectedBatch.id},${_isSearching},${isFullPayment ? 0 : 1},$amount,${selectedBatch.batchTitle}");
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => PaymentScreen(
              orderData: {
                "userId": userId,
                "batchId": selectedBatch.id,
                "paytype": isFullPayment ? 0 : 1,
                "amount": amount,
              },
              batchTitle: selectedBatch.batchTitle,
              amount: amount,
              payType: isFullPayment ? 0 : 1,
            ),
          ),
        );
      } else {
        debugPrint("No batches found for this course.");
      }
    } else {
      debugPrint("Failed to fetch batch details. Please try again.");
    }
  } catch (e) {
    debugPrint("Error fetching batch details: $e");
  }
}

Future<Map<String, dynamic>?> _getOrderSummaryForDialog(String courseId) async {
  try {
    final String? token = await storage.read(key: "token");
    final String? userIdStr = await storage.read(key: "userId");
    if (token == null || userIdStr == null) return null;

    // First get batches for the course
    final batchesResponse = await http.get(
      Uri.parse("$baseUrl/Batch/getAll/$courseId"),
      headers: {"Authorization": token},
    );

    if (batchesResponse.statusCode != 200) return null;
    
    List<dynamic> batches = jsonDecode(batchesResponse.body);
    if (batches.isEmpty) return null;

    int batchId = batches[0]['id'];
    int userId = int.parse(userIdStr);

    // Then get order summary
    final response = await http.post(
      Uri.parse("$baseUrl/Batch/getOrderSummary"),
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "userId": userId,
        "batchId": batchId,
        "paytype": 0, // Check for full payment first
      }),
    );

    if (response.statusCode == 200) {
      Map<String, dynamic> data = jsonDecode(response.body);
      // Check if partial payment is allowed by trying to get part payment summary
      final partResponse = await http.post(
        Uri.parse("$baseUrl/Batch/getOrderSummary"),
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: jsonEncode({
          "userId": userId,
          "batchId": batchId,
          "paytype": 1, // Check for part payment
        }),
      );

      bool isPartialAllowed = partResponse.statusCode == 200;
      double partAmount = isPartialAllowed 
          ? (jsonDecode(partResponse.body)['totalAmount']?.toDouble() ?? 0)
          : 0;

      return {
        'totalAmount': data['totalAmount']?.toDouble(),
        'partAmount': partAmount,
        'isPartialAllowed': isPartialAllowed,
      };
    }
    return null;
  } catch (e) {
    debugPrint("Error getting order summary for dialog: ${e.toString()}");
    return null;
  }
}

Future<Map<String, dynamic>?> getOrderSummary(int userId, int batchId, int payType) async {
  try {
    final String? token = await storage.read(key: "token");
    if (token == null) throw Exception("No token found");

    final response = await http.post(
      Uri.parse("$baseUrl/Batch/getOrderSummary"),
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "userId": userId,
        "batchId": batchId,
        "paytype": payType,
      }),
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception("Failed to get order summary: ${response.body}");
    }
  } catch (e) {
    debugPrint("Error getting order summary: ${e.toString()}");
    return null;
  }
}
  void _toggleSearch() {
    setState(() {
      _isSearching = !_isSearching;
      if (!_isSearching) {
        _searchController.clear();
        searchQuery = "";
        filteredCourses = List.from(courses); // Reset list
      }
    });
  }

  void _markNotificationsRead() {
    setState(() {
      unreadCount = 0; // Reset unread count when notifications are read
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
        automaticallyImplyLeading: false,
        toolbarHeight: 80, // Increased AppBar height
        backgroundColor: Colors.white, // Optional: Set background color
        elevation: 0, // Optional: Remove shadow

        title: _isSearching
            ? TextField(
                controller: _searchController,
                autofocus: true,
                decoration: InputDecoration(
                  hintText: "Search courses...",
                  border: InputBorder.none,
                  hintStyle: TextStyle(color: Colors.grey, fontSize: 18),
                ),
                style: TextStyle(color: Colors.black, fontSize: 18),
              )
            : Row(
                children: [
                  CircleAvatar(
                    radius: Dimensions.fontSize(context, 30),
                    backgroundImage: profileImage.isNotEmpty
                        ? MemoryImage(base64Decode(profileImage))
                        : AssetImage("assets/profile_pic.png") as ImageProvider,
                  ),
                  SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Hi, $userName',
                        style: TextStyle(
                          fontWeight: FontWeight.w600,
                          fontSize: Dimensions.fontSize(context, 20),
                          color: Colors.black,
                        ),
                      ),
                      Text(
                        'Have a Great Day!',
                        style: TextStyle(
                          fontSize: Dimensions.fontSize(context, 16),
                          color: Colors.black,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ],
              ),

        actions: [
          IconButton(
            icon: Icon(
              _isSearching ? Icons.close : Icons.search,
              color: Color(0xFFA3A3A5),
            ),
            onPressed: _toggleSearch,
          ),
Stack(
  children: [
    IconButton(
      icon: Icon(Icons.notifications_outlined, color: Color(0xFFA3A3A5)),
      onPressed: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => NotificationsScreen(
              notifications: notifications,
              
       //       onNotificationsRead: _markNotificationsRead,
            ),
          ),
        ).then((_) {
          // Refresh unread count when returning from notifications screen
          fetchUnreadCount();
        });
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
            style: TextStyle(color: Colors.white, fontSize: 12),
          ),
        ),
      ),
  ],
),
        ],

        bottom: PreferredSize(
          preferredSize: Size.fromHeight(50), // Set tab bar height
          child: TabBar(
            controller: _tabController,
            labelColor: Color(0xFF4680FE),
            unselectedLabelColor: Colors.black,
            indicatorColor: Color(0xFF4680FE),
            indicatorWeight: 3,
            labelStyle: TextStyle(fontWeight: FontWeight.w600, fontSize: 17),
            tabs: [
              Tab(text: "All Courses"),
              Tab(text: "Paid"),
              Tab(text: "Free"),
            ],
          ),
        ),
      ),
      body: isLoading
          ? Center(child: CircularProgressIndicator())
          : TabBarView(
              controller: _tabController,
              children: [
                _buildCourseGrid(filteredCourses), // All Courses
                _buildCourseGrid(filteredCourses
                    .where((course) => (course['amount'] ?? 0) > 0)
                    .toList()), // Paid Courses
                _buildCourseGrid(filteredCourses
                    .where((course) => (course['amount'] ?? 0) == 0)
                    .toList()), // Free Courses
              ],
            ),
    );
  }

  Widget _buildCourseGrid(List<dynamic> filteredCourses) {
    return Padding(
      padding: EdgeInsets.all(Dimensions.fontSize(context, 12)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_isSearching &&
              searchQuery.isNotEmpty) // Show message only when searching
            Padding(
              padding: const EdgeInsets.only(left: 8.0, bottom: 10.0),
              child: Text(
                'Results for "$searchQuery"',
                style: TextStyle(
                    fontSize: Dimensions.fontSize(context, 18),
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF000000),
                    fontFamily: 'Poppins'),
              ),
            ),
          Expanded(
            child: filteredCourses.isEmpty
                ? Center(
                    child: Text(
                      "No courses found",
                      style: TextStyle(
                          fontSize: Dimensions.fontSize(context, 16),
                          fontWeight: FontWeight.w500,
                          color: Colors.grey),
                    ),
                  )
                : GridView.builder(
                    itemCount:
                        filteredCourses.length, // Use filteredCourses here
                    gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 2,
                      crossAxisSpacing: 12,
                      mainAxisSpacing: 12,
                      childAspectRatio: 0.75,
                    ),
                    itemBuilder: (context, index) {
                      final course =
                          filteredCourses[index]; // Use filteredCourses[index]
                      return _buildCourseCard(course);
                    },
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildCourseCard(Map<String, dynamic> course) {
    return Card(
      color: Colors.white,
      elevation: 3,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: Color(0xFFA3A3A5), width: 1),
      ),
      child: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 5)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: Dimensions.fontSize(context, 120),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                image: DecorationImage(
                  image: MemoryImage(base64Decode(course['courseImage'])),
                  fit: BoxFit.cover,
                ),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 8)),
            Row(
              children: [
                SizedBox(width: Dimensions.fontSize(context, 4)),
                Expanded(
                  child: Text(
                    course['courseName'],
                    style: TextStyle(fontWeight: FontWeight.w500, fontSize: Dimensions.fontSize(context, 17)),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ),
            Spacer(),
            if (course['amount'] != 0)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("  ₹${course['amount']} ",
                      style:
                          TextStyle(fontWeight: FontWeight.w500, fontSize: Dimensions.fontSize(context, 15))),               
        SizedBox(
          width: Dimensions.fontSize(context, 80),  // Fixed width
          height: Dimensions.fontSize(context, 36),  // Fixed height
          child: ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: Color(0xFF4680FE),
              padding: EdgeInsets.zero,  // Remove default padding
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(4),
              ),
            ),
            onPressed: () => _showPaymentDialog(context, course),
            child: FittedBox(  // Ensures text fits in the button
              fit: BoxFit.scaleDown,
              child: Text(
                "Enroll Now",
                style: TextStyle(
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                  fontSize: Dimensions.fontSize(context, 12),
                ),
              ),
            ),
          ),
        ),
      ],
              )
            else
              Center(
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    elevation: 0,
                    padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 39), vertical: Dimensions.fontSize(context, 8)),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(4)),
                    side: BorderSide(color: Color(0xFF52CE75)),
                  ),
              onPressed: isLoading 
        ? null 
        : () async {
            await _enrollForFree(course);
          },
    child: isLoading
        ? SizedBox(
            width: Dimensions.fontSize(context, 20),
          //  height: Dimensions.fontSize(context, 20),
            child: CircularProgressIndicator(
              color: Color(0xFF52CE75),
              strokeWidth: 2,
            ),
          )
        : Text("Enroll for Free",
            style: TextStyle(
              color: Color(0xFF52CE75),
              fontWeight: FontWeight.w500,
              fontSize: Dimensions.fontSize(context, 12)
            )),
                ),
              ),
          ],
        ),
      ),
    );
  }
void _onItemTapped(int index) {
  setState(() {
  });
}

void _navigateToCourseDetail(Map<String, dynamic> course) {
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => CourseDetailPage(
        courseId: course['courseId'].toString(),
        courseName: course['courseName'],
        courseDescription: course['courseDescription'],
        selectedIndex: 1,
        onItemTapped: (int index, {
          bool navigateToDetails = false,
          bool navigateToEditProfile = false,
          bool navigateToMyCourses = false,
          bool navigateToMyCertificates = false,
          bool navigateToCertificatesTemplate = false,
          bool navigateToMyPayments = false,
          String? activityId,
        }) {
        },
      ),
    ),
  );
// Navigator.push(
//   context,
//   MaterialPageRoute(
//     builder: (context) => TrainerSelectionScreen(studentId: 17, courseId: 5),
//   ),
// );
}

Future<bool> _checkIfCourseIsPaid(String courseId) async {
  try {
    String? token = await storage.read(key: "token");
      if (token == null) return false;  

    // First get all batches for this course
    final batchesResponse = await http.get(
      Uri.parse('$baseUrl/Batch/getAll/$courseId'),
      headers: {'Authorization': token},
    );

    if (batchesResponse.statusCode != 200) return false;
    
    List<dynamic> batches = jsonDecode(batchesResponse.body);
    if (batches.isEmpty) return false;

    // Then check payment status for each batch
    final paymentsResponse = await http.get(
      Uri.parse('$baseUrl/myPaymentHistory'),
      headers: {'Authorization': token},
    );

    if (paymentsResponse.statusCode == 200) {
      List<dynamic> payments = jsonDecode(paymentsResponse.body);
      
      // Get all batch IDs for this course
      List<int> batchIds = batches.map((b) => b['id'] as int).toList();
      
      // Check if any payment exists for these batches with status 'paid'
      return payments.any((payment) => 
        batchIds.contains(payment['batchId']) && 
        payment['status'].toLowerCase() == 'paid');
    }
    return false;
  } catch (e) {
    print('Error checking payment status: $e');
    return false;
  }
}
Future<void> _enrollForFree(Map<String, dynamic> course) async {
  try {
    final String? token = await storage.read(key: "token");
    if (token == null) throw Exception("No token found");

    setState(() => isLoading = true);
    
    final response = await http.get(
      Uri.parse("$baseUrl/AssignCourse/student/courselist"),
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
    );

    if (response.statusCode == 200) {
      // Successfully enrolled
      _navigateToCourseDetail(course);
    } else {
      throw Exception("Failed to enroll: ${response.body}");
    }
  } catch (e) {
    debugPrint("Enrollment failed: ${e.toString()}");
    
  } finally {
    setState(() => isLoading = false);
  }
}

Future<Map<String, dynamic>> _fetchPaymentOptions(String courseId) async {
  try {
    final String? token = await storage.read(key: "token");
    final String? userIdStr = await storage.read(key: "userId");
    if (token == null || userIdStr == null) {
      return {'isPartialAllowed': false};
    }

    // Get batches for the course
    final batchesResponse = await http.get(
      Uri.parse("$baseUrl/Batch/getAll/$courseId"),
      headers: {"Authorization": token},
    );

    if (batchesResponse.statusCode != 200 || jsonDecode(batchesResponse.body).isEmpty) {
      return {'isPartialAllowed': false};
    }

    final batchId = jsonDecode(batchesResponse.body)[0]['id'];
    final userId = int.parse(userIdStr);

    // Get full payment details
    final fullResponse = await http.post(
      Uri.parse("$baseUrl/Batch/getOrderSummary"),
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "userId": userId,
        "batchId": batchId,
        "paytype": 0, // Full payment
      }),
    );

    if (fullResponse.statusCode != 200) {
      return {'isPartialAllowed': false};
    }

    final fullData = jsonDecode(fullResponse.body);
    final double fullAmount = fullData['amount']?.toDouble() ?? 0; // Changed to use 'amount' instead of 'totalAmount'

    // Check if partial payment is allowed
    final partResponse = await http.post(
      Uri.parse("$baseUrl/Batch/getOrderSummary"),
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "userId": userId,
        "batchId": batchId,
        "paytype": 1, // Partial payment
      }),
    );

    final isPartialAllowed = partResponse.statusCode == 200;
    final partData = isPartialAllowed ? jsonDecode(partResponse.body) : null;
    final double partAmount = isPartialAllowed 
        ? (partData?['amount']?.toDouble() ?? 0) // Changed to use 'amount' instead of 'totalAmount'
        : 0;

    return {
      'fullAmount': fullAmount,
      'partAmount': partAmount,
      'isPartialAllowed': isPartialAllowed && partAmount > 0, // Only allow if partAmount > 0
    };
  } catch (e) {
    debugPrint("Error fetching payment options: $e");
    return {'isPartialAllowed': false};
  }
}
void _showPaymentDialog(BuildContext context, Map<String, dynamic> course) async {
  bool isPaid = await _checkIfCourseIsPaid(course['courseId'].toString());
  
  if (isPaid) {
    _navigateToCourseDetail(course);
    return;
  }

  if (course['amount'] == 0) {
    await _enrollForFree(course);
    return;
  }

  // Fetch order summary to check if partial payment is allowed
  final orderSummary = await _getOrderSummaryForDialog(course['courseId'].toString());
  final paymentOptions = await _fetchPaymentOptions(course['courseId'].toString());
  final double fullAmount = paymentOptions['fullAmount'] ?? course['amount'].toDouble();
  final double partAmount = paymentOptions['partAmount'] ?? 0;
  final bool isPartialAllowed = paymentOptions['isPartialAllowed'] ?? false && partAmount > 0;

  showDialog(
    context: context,
    builder: (BuildContext context) {
      return AlertDialog(
        backgroundColor: Color(0xFFFFFFFF),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: EdgeInsets.zero,
        content: Container(
          padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.help_outline, size: 60, color: Color(0xFF40C0E7)),
              SizedBox(height: Dimensions.fontSize(context, 10)),
              Text(
                "Payment Type?",
                style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: Dimensions.fontSize(context, 19),
                    color: Color(0xFF000000)),
              ),
              SizedBox(height: Dimensions.fontSize(context, 10)),
              Text(
                isPartialAllowed 
                  ? "Want to pay the amount partially or fully?"
                  : "Please pay the full amount to enroll",
                textAlign: TextAlign.center,
                style: TextStyle(
                    fontWeight: FontWeight.w400,
                    fontSize: Dimensions.fontSize(context, 19),
                    color: Color(0xFF929398)),),
              SizedBox(height: Dimensions.fontSize(context, 20)),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  // Always show Full Payment button
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF4680FE),
                        padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 12)),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(6)),
                      ),
                      onPressed: () async {
                        Navigator.pop(context);
                        await _fetchBatchAndProceed(
                          course['courseId'].toString(), 
                          isFullPayment: true,
                          amount: fullAmount,
                        );
                      },
                      child: Text(
                        "Pay Full\n₹$fullAmount",
                        textAlign: TextAlign.center,
                        style: TextStyle(
                            color: Color(0xFFFFFFFF),
                            fontSize: Dimensions.fontSize(context, 16),
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                  if (isPartialAllowed) SizedBox(width: Dimensions.fontSize(context, 8)),
                  // Show Partial Payment button only if allowed
                  if (isPartialAllowed)
                    Expanded(
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Color(0xFF4680FE),
                          padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 12)),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4)),
                        ),
                        onPressed: () async {
                          Navigator.pop(context);
                          await _fetchBatchAndProceed(
                            course['courseId'].toString(), 
                            isFullPayment: false,
                            amount: partAmount,
                          );
                        },
                        child: Text(
                          "Pay Part\n₹$partAmount",
                          textAlign: TextAlign.center,
                          style: TextStyle(
                            color: Color(0xFFFFFFFF),
                            fontSize: Dimensions.fontSize(context, 16),
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                  SizedBox(width: Dimensions.fontSize(context, 8)),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF626368),
                        padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 12)),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(4)),
                      ),
                      onPressed: () => Navigator.pop(context),
                      child: Text(
                        "Cancel",
                        style: TextStyle(
                            color: Color(0xFFFFFFFF),
                            fontSize: Dimensions.fontSize(context, 16),
                            fontWeight: FontWeight.w600),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      );
    },
  );
}
    }

class Batch {
  final int id;
  final String batchId;
  final String batchTitle;
  final double amount;
  final int noOfSeats;
  final int userCountInBatch;

  Batch({
    required this.id,
    required this.batchId,
    required this.batchTitle,
    required this.amount,
    required this.noOfSeats,
    required this.userCountInBatch,
  });

  factory Batch.fromJson(Map<String, dynamic> json) {
    return Batch(
      id: json['id'],
      batchId: json['batchId'],
      batchTitle: json['batchTitle'],
      amount: json['amount']?.toDouble() ?? 0.0,
      noOfSeats: json['noOfSeats'] ?? 0,
      userCountInBatch: json['userCountinBatch'] ?? 0,
    );
  }
}