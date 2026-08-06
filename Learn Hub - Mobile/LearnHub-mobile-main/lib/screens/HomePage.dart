// ignore_for_file: prefer_typing_uninitialized_variables

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'AssignmentScreen.dart';
import 'AttendanceScreen.dart';
import 'CourseDetailPage.dart';
import 'CourseListPage.dart';
import 'EditProfilePage.dart';
import 'GradesScreen.dart';
import 'MeetingPage.dart';
import 'MyCertificatesPage.dart';
import 'MyCoursesPage.dart';
import 'MyPaymentsPage.dart';
import 'ProfilePage.dart';
import 'WelcomePage.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;
  var selectedCourseId;
        var selectedCourseName;
        var selectedCourseDescription;

  late List<Widget> _pages;

  @override
  void initState() {
    super.initState();
    _pages = [
      const WelcomePage(),
      CourseListPage(
        onNavigateToDetail: () => _onItemTapped(1, navigateToDetails: true),
      ),
      MeetingPage(
        selectedIndex: _selectedIndex, // Pass the current selected index
        onItemTapped: _onItemTapped,
      ),
      ProfilePage(
        selectedIndex: _selectedIndex, // Pass the current selected index
        onItemTapped: _onItemTapped,
      ),
    ];
  }

  final List<String> _labels = ["Home", "Courses", "Meetings", "Profile"];
  final List<IconData?> _icons = [
    Icons.home,
    null, // Placeholder for image
    Icons.videocam,
    Icons.person,
  ];

  void _onItemTapped(int index,
      {bool navigateToDetails = false,
      bool navigateToEditProfile = false,
      bool navigateToMyCourses = false,
      bool navigateToMyCertificates = false,
      bool navigateToCertificatesTemplate = false,
      bool navigateToMyPayments = false,
      bool navigateToAssignments = false,
      bool navigateToAttendance = false,
      bool navigateToGrades = false,
      String? activityId}) {
    setState(() {
      if (index == 1 && navigateToDetails) {
        // Navigate to CourseDetailPage
        
        _pages[1] = CourseDetailPage(
          selectedIndex: 1,
    onItemTapped: _onItemTapped,
    courseId: selectedCourseId,  // Define this variable where appropriate
    courseName: selectedCourseName,
    courseDescription: selectedCourseDescription,
        );
      } else if (index == 3 && navigateToEditProfile) {
        // Navigate to EditProfilePage
        _pages[3] = EditProfilePage(
          selectedIndex: 3, // Ensure index 3 is active
          onItemTapped: _onItemTapped,
        );
      }
      else if (index == 2) {
        // Navigate to EditProfilePage
        _pages[2] = MeetingPage(
          selectedIndex: 2, // Ensure index 3 is active
          onItemTapped: _onItemTapped,
        );
      } else if (index == 3 && navigateToMyCourses) {
        // Navigate to MyCoursesPage
        _pages[3] = MyCoursesPage(
          selectedIndex: 3,
          onItemTapped: _onItemTapped,
        );
      }
      else if (index == 3 && navigateToAssignments) {
        // Navigate to MyCoursesPage
        _pages[3] = AssignmentScreen(
          selectedIndex: 3,
          onItemTapped: _onItemTapped,
        );
      }
      else if (index == 3 && navigateToAttendance) {
        // Navigate to MyCoursesPage
        _pages[3] = AttendanceScreen(
          selectedIndex: 3,
          onItemTapped: _onItemTapped,
        );
      }
      else if (index == 3 && navigateToGrades) {
        // Navigate to MyCoursesPage
        _pages[3] = GradesScreen(
          selectedIndex: 3,
          onItemTapped: _onItemTapped,
        );
      }
      
      else if (index == 3 && navigateToMyCertificates) {
  _pages[3] = MyCertificateList(
    selectedIndex: 3,
    onItemTapped: (int index, {String? activityId, bool autoDownload = false, bool navigateToCertificatesTemplate = false}) {
      _onItemTapped(
        index, 
        activityId: activityId, 
        navigateToCertificatesTemplate: navigateToCertificatesTemplate
      );
    },
  );
}

      else if (index == 3 && navigateToCertificatesTemplate) {
        _pages[3] = CertificateTemplate(
          activityId: activityId ?? '',
          autoDownload: false,
          onItemTapped: _onItemTapped,
        );
      } else if (index == 3 && navigateToMyPayments) {
        // Navigate to MyCoursesPage
        _pages[3] = MyPaymentsPage(
          selectedIndex: 3,
          onItemTapped: _onItemTapped,
        );
      }
       else {
        // Default pages
        if (index == 1) {
          _pages[1] = CourseListPage(
            onNavigateToDetail: () => _onItemTapped(1, navigateToDetails: true),
          );
        } else if (index == 3) {
          _pages[3] = ProfilePage(
            selectedIndex: 3,
            onItemTapped: _onItemTapped,
          );
        }
      }
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double itemWidth = screenWidth / _icons.length;
    final bottomPadding = MediaQuery.of(context).padding.bottom;

    // return Container(
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      //color: Color(0xFFFFFFFF),
      child: Scaffold(
        backgroundColor: Colors.white,
        body: _pages[
            _selectedIndex], // Display the current page based on _selectedIndex
        bottomNavigationBar: Container(
          height: 60 + bottomPadding,
          padding: EdgeInsets.only(bottom: bottomPadding),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              CustomPaint(
                size: Size(screenWidth, 70),
                painter: BottomNavBarPainter(_selectedIndex, _icons.length),
              ),
              Positioned(
                top: -30,
                left: (itemWidth * _selectedIndex) + (itemWidth / 2) - 30,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  height: 60,
                  width: 60,
                  decoration: BoxDecoration(
                    color: const Color(0xFF4680FE),
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        // ignore: deprecated_member_use
                        color: Colors.black.withOpacity(0.2),
                        blurRadius: 10,
                        spreadRadius: 1,
                      ),
                    ],
                  ),
                  child: _icons[_selectedIndex] == null
                      ? Image.asset('assets/book_icon.png',
                          width: 24, height: 24, color: Colors.white)
                      : Icon(_icons[_selectedIndex],
                          size: 30, color: Colors.white),
                ),
              ),
              Positioned.fill(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: List.generate(_icons.length, (index) {
                    return GestureDetector(
                      onTap: () => _onItemTapped(index),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (index != _selectedIndex)
                            index == 1
                                ? Image.asset('assets/book_icon_2.png',
                                    width: 20, height: 20)
                                : Icon(_icons[index],
                                    size: 24, color: Colors.black),
                          if (index == _selectedIndex)
                            Padding(
                              padding: const EdgeInsets.only(top: 35.0),
                              child: Text(
                                _labels[index],
                                style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.black),
                              ),
                            ),
                        ],
                      ),
                    );
                  }),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class BottomNavBarPainter extends CustomPainter {
  final int selectedIndex;
  final int totalItems;

  BottomNavBarPainter(this.selectedIndex, this.totalItems);

  @override
  void paint(Canvas canvas, Size size) {
    // Draw white background
    final backgroundPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.fill;

    canvas.drawRect(
      Rect.fromLTWH(0, 0, size.width, size.height),
      backgroundPaint,
    );

    final paint = Paint()
      ..color = Color(0xFFD9D9D9)
      ..style = PaintingStyle.fill;

    final path = Path();
    final segmentWidth = size.width / totalItems;
    final circleRadius = 30.0;
    final circleCenterX = segmentWidth * selectedIndex + segmentWidth / 2;

    path.moveTo(0, 0);
    path.lineTo(circleCenterX - circleRadius - 10, 0);

    path.quadraticBezierTo(
      circleCenterX - circleRadius,
      35,
      circleCenterX,
      35,
    );

    path.quadraticBezierTo(
      circleCenterX + circleRadius,
      35,
      circleCenterX + circleRadius + 10,
      0,
    );

    path.lineTo(size.width, 0);
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) {
    return true;
  }
}
