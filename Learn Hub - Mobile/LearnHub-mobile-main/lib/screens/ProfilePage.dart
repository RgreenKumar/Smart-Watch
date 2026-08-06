import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import '../dimensions.dart';
import '../url.dart';
import 'LoginScreen.dart';

class ProfilePage extends StatefulWidget {
  final int selectedIndex;
  final Function(int,
      {bool navigateToEditProfile,
      bool navigateToMyCourses,
      bool navigateToMyCertificates,
      bool navigateToMyPayments,
      bool navigateToAssignments,
      bool navigateToAttendance,
      bool navigateToGrades}) onItemTapped;

  // ignore: prefer_const_constructors_in_immutables
  ProfilePage({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  // ignore: library_private_types_in_public_api
  _ProfilePageState createState() => _ProfilePageState();
}

class _ProfilePageState extends State<ProfilePage> {
  final FlutterSecureStorage storage = FlutterSecureStorage();
  String profileImage = '';
  String userName = '';
  bool _isLoading = true;
  

  @override
  void initState() {
    super.initState();
    _fetchProfileDetails();
  }

  Future<void> _fetchProfileDetails() async {
    try {
       String? token = await storage.read(key: "token");
      if (token == null) return;

      final response = await http.get(
        Uri.parse("$baseUrl/Edit/profiledetails"),

        headers: {"Authorization": token},
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        setState(() {
          userName = responseData["name"] ?? "User";
          profileImage =
              responseData["profileImage"] ?? ''; // Base64 profile image
              _isLoading = false;
        });
      } else {
        debugPrint("Error fetching profile details: ${response.body}");
        setState(() => _isLoading = false);
      }
    } catch (e) {
      debugPrint("Profile Fetch Error: $e");
      setState(() => _isLoading = false);
    }
  }

  Future<void> _logout(BuildContext context) async {
    try {
       String? token = await storage.read(key: "token");
        if (token == null) return;

      final response = await http.post(
        Uri.parse("$baseUrl/logoutuser"),

        headers: {"Authorization": token},
      );

      if (response.statusCode == 200) {
        await storage.deleteAll();
        SharedPreferences prefs = await SharedPreferences.getInstance();
        await prefs.clear();

        if (!context.mounted) return;
        Navigator.pushReplacement(
            context, MaterialPageRoute(builder: (context) => LoginScreen()));
      } else {
        debugPrint("Logout failed: ${response.body}");
      }
    } catch (e) {
      debugPrint("Logout Error: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: _isLoading
          ? Center(
              child: CircularProgressIndicator(
               // color: Color(0xFF4680FE),
              ),
            )
          : SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              height: Dimensions.fontSize(context, 340),
              decoration: BoxDecoration(
                image: DecorationImage(
                  image: AssetImage('assets/Vector 3202.png'),
                  fit: BoxFit.cover,
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    SizedBox(height: Dimensions.fontSize(context, 105)),
                    Text(
                      'Profile',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w600,
                        fontSize: Dimensions.fontSize(context, 30),
                        letterSpacing: -0.5,
                        color: Colors.white,
                        shadows: [
                          Shadow(
                            // ignore: deprecated_member_use
                            color: Colors.black.withOpacity(0.4),
                            blurRadius: 10,
                            offset: Offset(2, 2),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 30)),
                    CircleAvatar(
                      radius: Dimensions.fontSize(context, 60),
                      backgroundImage: profileImage.isNotEmpty
                          ? MemoryImage(base64Decode(profileImage))
                          : AssetImage('assets/profile_pic.png')
                              as ImageProvider,
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    Text(
                      userName,
                      style: TextStyle(
                          fontSize: Dimensions.fontSize(context, 20),
                          fontWeight: FontWeight.w600,
                          color: Colors.white),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            ProfileOption(
              icon: Icons.edit_outlined,
              text: "Edit Profile",
              onTap: () => widget.onItemTapped(3, navigateToEditProfile: true),
            ),
            ProfileOption(
              icon: Icons.menu_book_rounded,
              text: "My Courses",
              onTap: () => widget.onItemTapped(3, navigateToMyCourses: true),
            ),
            ProfileOption(
                icon: Icons.badge,
                text: "Certificates",
                onTap: () =>
                    widget.onItemTapped(3, navigateToMyCertificates: true)),
            ProfileOption(
                icon: Icons.payment_outlined,
                text: "My Payments",
                onTap: () =>
                    widget.onItemTapped(3, navigateToMyPayments: true)),
            ProfileOption(
                icon: Icons.assignment_rounded,
                text: "Assignments",
                onTap: () =>
                    widget.onItemTapped(3, navigateToAssignments: true)),
            ProfileOption(
                icon: Icons.assignment_ind_rounded,
                text: "Attendance",
                onTap: () =>
                    widget.onItemTapped(3, navigateToAttendance: true)),
            ProfileOption(
                icon: Icons.badge_rounded,
                text: "Grade",
                onTap: () =>
                    widget.onItemTapped(3, navigateToGrades: true)),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            TextButton(
              onPressed: () => _logout(context),
              child: Text(
                "Logout",
                style: TextStyle(
                  color: Color(0xFF4680FE),
                  fontSize: Dimensions.fontSize(context, 20),
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class ProfileOption extends StatelessWidget {
  final IconData icon;
  final String text;
  final VoidCallback onTap;

  const ProfileOption(
      {super.key, required this.icon, required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Color(0xFFFFFFFF),
      child: ListTile(
        leading: Icon(icon, color: Colors.black),
        title: Text(
          text,
          style: TextStyle(
              fontFamily: 'Poppins',
              fontWeight: FontWeight.w600,
              fontSize: Dimensions.fontSize(context, 16),
              color: Color(0xFF929398)),
        ),
        trailing:
            Icon(Icons.arrow_forward_ios, size: Dimensions.iconSize(context, 16), color: Color(0xFF929398)),
        onTap: onTap,
      ),
    );
  }
}
