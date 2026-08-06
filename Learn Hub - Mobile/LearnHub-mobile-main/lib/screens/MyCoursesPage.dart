import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import '../dimensions.dart';
import '../url.dart';
import 'CourseDetailPage.dart';

class MyCoursesPage extends StatefulWidget {
  final int selectedIndex;
  final Function(int) onItemTapped;

  const MyCoursesPage({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  // ignore: library_private_types_in_public_api
  _MyCoursesPageState createState() => _MyCoursesPageState();
}

class _MyCoursesPageState extends State<MyCoursesPage> {
  Future<List<Course>>? _coursesFuture;
  int enrolledCoursesCount =0;
  final FlutterSecureStorage _storage = FlutterSecureStorage();

  @override
  void initState() {
    super.initState();
    _loadTokenAndFetchCourses();
  }

  Future<void> _loadTokenAndFetchCourses() async {
    String? token = await _storage.read(key: "token");
    setState(() {
      _coursesFuture =
          fetchCourses(token!);
    });
  }

  Future<List<Course>> fetchCourses(String token) async {
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
      await _storage.write(key: "enrolledCoursesCount", value: enrolledCourses.length.toString());
      setState(() {
        enrolledCoursesCount = enrolledCourses.length;
      });
      return data.map((course) => Course.fromJson(course)).toList();
      
    } else {
      throw Exception("Failed to load courses");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => widget.onItemTapped(3), // Go back to Profile Page
        ),
        title: Row(
          children: [
            SizedBox(width: Dimensions.fontSize(context, 55),),
            Icon(Icons.menu_book, color: Colors.black),
            SizedBox(width: Dimensions.fontSize(context, 8),),
            Text(
              "My Courses",
              style: TextStyle(
                color: Color(0xFF4680FE),
                fontSize: Dimensions.fontSize(context, 24),
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Container(
        color: Colors.white,
        child: FutureBuilder<List<Course>>(
          future: _coursesFuture,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return Center(child: CircularProgressIndicator());
            } else if (snapshot.hasError) {
              return Center(child: Text("Error loading courses"));
            } else if (!snapshot.hasData || snapshot.data!.isEmpty) {
              return Center(child: Text("No courses available"));
            }

            List<Course> courses = snapshot.data!;

            return GridView.builder(
              padding: EdgeInsets.all(Dimensions.fontSize(context, 12),),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.8,
              ),
              itemCount: courses.length,
              itemBuilder: (context, index) {
                return CourseCard(course: courses[index],onTap: _navigateToCourseDetail,);
              },
            );
          },
        ),
      ),
    );
  }
  
void _navigateToCourseDetail(Course course) {
  Navigator.push(
    context,
    MaterialPageRoute(
      builder: (context) => CourseDetailPage(
        courseId: course.courseId.toString(),
        courseName: course.courseName,
        courseDescription: course.courseDescription,
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
}
}

class Course {
  final int courseId;
  final String courseName;
  final String courseUrl;
  final String courseDescription;
  final String courseCategory;
  final int amount;
  final String courseImage;

  Course({
    required this.courseId,
    required this.courseName,
    required this.courseUrl,
    required this.courseDescription,
    required this.courseCategory,
    required this.amount,
    required this.courseImage,
  });

  factory Course.fromJson(Map<String, dynamic> json) {
    return Course(
      courseId: json['courseId'],
      courseName: json['courseName'],
      courseUrl: json['courseUrl'],
      courseDescription: json['courseDescription'],
      courseCategory: json['courseCategory'],
      amount: json['amount'],
      courseImage: json['courseImage'],
    );
  }
}

class CourseCard extends StatelessWidget {
  final Course course;
  final Function(Course) onTap;

  const CourseCard({
    super.key, 
    required this.course,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => onTap(course),
      child: Card(
        color: Colors.white,
        elevation: 3,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
          side: BorderSide(color: Color(0xFFA3A3A5), width: 1),
        ),
        child: Padding(
          padding: EdgeInsets.all(Dimensions.fontSize(context, 5),),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: Dimensions.fontSize(context, 120),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  image: DecorationImage(
                    image: MemoryImage(base64Decode(course.courseImage)),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
              Padding(
                padding: EdgeInsets.all(Dimensions.fontSize(context, 8),),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      course.courseName,
                      style: TextStyle(
                        fontWeight: FontWeight.w500,
                        fontSize: Dimensions.fontSize(context, 16),
                      ),
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 4)),
                    Text(
                      course.courseCategory,
                      style: TextStyle(
                        color: Color(0xFF929398),
                        fontSize: Dimensions.fontSize(context, 13),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}