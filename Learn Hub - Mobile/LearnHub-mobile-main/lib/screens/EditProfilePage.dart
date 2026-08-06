import 'dart:convert';
import 'dart:io';
import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http_parser/http_parser.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';
import 'package:http/http.dart' as http;
import '../dimensions.dart';
import '../url.dart';
import 'ProfilePage.dart';

class EditProfilePage extends StatefulWidget {
  final int selectedIndex;
  final Function(int,
      {bool navigateToEditProfile,
      bool navigateToMyCourses,
      bool navigateToMyCertificates}) onItemTapped;

  const EditProfilePage({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  // ignore: library_private_types_in_public_api
  _EditProfilePageState createState() => _EditProfilePageState();
}

class _EditProfilePageState extends State<EditProfilePage> {
  bool _isEdited = false;
  final _formKey = GlobalKey<FormState>();

  void _onBackPressed() {
    if (_isEdited) {
      _showExitDialog();
    } else {
      //Navigator.pop(context);
      widget.onItemTapped(3);
    }
  }

  void _showExitDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          title: Column(
            children: [
              Icon(Icons.warning_rounded, size: Dimensions.iconSize(context, 70), color: Color(0xFF4680FE)),
              SizedBox(height: Dimensions.fontSize(context, 10)),
              Text(
                "Are You Sure Want to Exit?",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: Dimensions.fontSize(context, 18),
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Poppins',
                  color: Color(0xFF000000),
                ),
              ),
            ],
          ),
          content: Text(
            "Any unsaved changes will be discarded if you cancel. Are you sure you want to continue?",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: Dimensions.fontSize(context, 16),
              fontWeight: FontWeight.w400,
              fontFamily: 'Poppins',
              color: Color(0xFF929293),
            ),
          ),
          actions: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop(); // Close the dialog
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFA3A3A5),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6)),
                  ),
                  child: Text(
                    "Discard",
                    style: TextStyle(
                      color: Color(0xFFFFFFFF),
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w400,
                      fontSize: Dimensions.fontSize(context, 18),
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop(); // Close the dialog
                    FocusScope.of(context)
                        .nextFocus(); // Move to the next text field
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF4680FE),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6)),
                  ),
                  child: Text(
                    "Keep Editing",
                    style: TextStyle(
                      color: Color(0xFFFFFFFF),
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w400,
                      fontSize: Dimensions.fontSize(context, 18),
                    ),
                  ),
                ),
              ],
            ),
          ],
        );
      },
    );
  }

  void showSuccessDialog(
      BuildContext context,
      int selectedIndex,
      Function(int,
              {bool navigateToEditProfile,
              bool navigateToMyCourses,
              bool navigateToMyCertificates})
          onItemTapped) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return Stack(
          children: [
            BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 2, sigmaY: 2),
              child: ModalBarrier(
                dismissible: false,
                // ignore: deprecated_member_use
                color: Colors.black.withOpacity(0.0),
              ),
            ),
            Dialog(
              backgroundColor: Color(0xFFFFFFFF),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              child: Padding(
                padding: EdgeInsets.all(Dimensions.fontSize(context, 30)),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      'assets/Icon_1.png', // Replace with your image path
                      height: Dimensions.iconSize(context, 202),
                      width: Dimensions.iconSize(context, 205),
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 20)),
                    Text(
                      "Profile Updated Successfully",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: Dimensions.fontSize(context, 20),
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Poppins',
                          color: Color(0xFF000000)),
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 20)),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context); // Close success dialog
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                              builder: (context) => ProfilePage(
                                    selectedIndex: 3, // Set appropriate index
                                    onItemTapped: (index,
                                        {navigateToEditProfile = false,
                                        navigateToMyCourses = false,
                                        navigateToMyCertificates = false,
                                        navigateToMyPayments = false,
                                        navigateToAssignments = false,
                                        navigateToAttendance = false,
                                        navigateToGrades = false}) {
                                      // Implement navigation handling if needed
                                    },
                                  )), // Navigate to ProfilePage
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFFFFFFFF),
                        elevation: 3,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        "OK",
                        style: TextStyle(
                          color: Color(0xFF4680FE),
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.w600,
                          fontSize: Dimensions.fontSize(context, 20),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: _onBackPressed,
        ),
        title: Row(
          children: [
            SizedBox(width: Dimensions.fontSize(context, 55)),
            Icon(Icons.edit_outlined, color: Colors.black),
            SizedBox(width: Dimensions.fontSize(context, 8)),
            Text(
              "Edit Profile",
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
        child: EditProfilePageContent(
          formKey: _formKey,
          onEdited: () {
            setState(() {
              _isEdited = true;
            });
          },
          selectedIndex: widget.selectedIndex, // Pass the selectedIndex
          onItemTapped: widget.onItemTapped, // Pass the onItemTapped function
        ),
      ),
    );
  }
}

class EditProfilePageContent extends StatefulWidget {
  final GlobalKey<FormState> formKey;
  final VoidCallback onEdited;
  final int selectedIndex;
  final Function(int,
      {bool navigateToEditProfile,
      bool navigateToMyCourses,
      bool navigateToMyCertificates}) onItemTapped;

  const EditProfilePageContent({
    super.key,
    required this.formKey,
    required this.onEdited,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  // ignore: library_private_types_in_public_api
  _EditProfilePageContentState createState() => _EditProfilePageContentState();
}

class _EditProfilePageContentState extends State<EditProfilePageContent> {
  bool _isLoading = false;
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _dobController = TextEditingController();
  final TextEditingController _skillsController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  File? _selectedImage;
  String? _profileImageUrl;

  @override
  void initState() {
    super.initState();
    _isLoading = true;
    fetchUserData();
  }

  void showSuccessDialog(
      BuildContext context,
      int selectedIndex,
      Function(int,
              {bool navigateToEditProfile,
              bool navigateToMyCourses,
              bool navigateToMyCertificates})
          onItemTapped) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return Stack(
          children: [
            BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 2, sigmaY: 2),
              child: ModalBarrier(
                dismissible: false,
                // ignore: deprecated_member_use
                color: Colors.black.withOpacity(0.0),
              ),
            ),
            Dialog(
              backgroundColor: Color(0xFFFFFFFF),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(30),
              ),
              child: Padding(
                padding: EdgeInsets.all(Dimensions.fontSize(context, 30)),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Image.asset(
                      'assets/Icon_1.png', // Replace with your image path
                      height: Dimensions.fontSize(context, 202),
                      width: Dimensions.fontSize(context, 205),
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 20)),
                    Text(
                      "Profile Updated Successfully",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: Dimensions.fontSize(context, 20),
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Poppins',
                          color: Color(0xFF000000)),
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 20)),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context); // Close success dialog
                        widget.onItemTapped(
                            3); // Navigate back to ProfilePage with BottomNavigationBar
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFFFFFFFF),
                        elevation: 3,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        "OK",
                        style: TextStyle(
                          color: Color(0xFF4680FE),
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.w600,
                          fontSize: Dimensions.fontSize(context, 20),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Future<void> fetchUserData() async {
    FlutterSecureStorage storage = const FlutterSecureStorage();
    String? token = await storage.read(key: 'token');
    String? email = await storage.read(key: 'email');

    
  if (email == null || token == null)  {
      debugPrint("User not authenticated");
      setState(() => _isLoading = false);
      return;
    }

    var userUrl = Uri.parse("$baseUrl/student/users/$email");

    var profileUrl = Uri.parse("$baseUrl/Edit/profiledetails");


    var headers = {
      'Authorization': token,
      'Content-Type': 'application/json',
    };

    try {
      var userResponse = await http.get(userUrl, headers: headers);
      var profileResponse = await http.get(profileUrl, headers: headers);

      if (userResponse.statusCode == 200) {
        var userData = jsonDecode(userResponse.body);
        setState(() {
          _nameController.text = userData['username'] ?? "";
          _emailController.text = userData['email'] ?? "";
          _dobController.text = userData['dob'] ?? "";
          _skillsController.text = userData['skills'] ?? "";
          _phoneController.text = userData['phone'] ?? "";
        });
      } else {
        debugPrint("Failed to load user data");
      }

      if (profileResponse.statusCode == 200) {
        var profileData = jsonDecode(profileResponse.body);
        setState(() {
          _profileImageUrl = profileData["profileImage"];
        });
      } else {
        debugPrint("Failed to load profile image");
      }
    } catch (e) {
      debugPrint("Network error: $e");
    } finally {
    setState(() => _isLoading = false); // Hide loading indicator when done
  }
  }

  Widget _buildProfilePicture() {
    return Stack(
      children: [
        CircleAvatar(
          radius: 75,
          backgroundImage: _selectedImage != null
              ? FileImage(_selectedImage!)
              : (_profileImageUrl != null && _profileImageUrl!.isNotEmpty)
                  ? MemoryImage(base64Decode(_profileImageUrl!))
                  : AssetImage('assets/profile_pic.png') as ImageProvider,
        ),
        Positioned(
          bottom: 5,
          right: 5,
          child: GestureDetector(
            onTap: _pickImage,
            child: CircleAvatar(
              radius: 18,
              backgroundColor: Color(0xFF4680FE),
              child: Icon(Icons.camera_alt_outlined,
                  color: Colors.white, size: 23),
            ),
          ),
        ),
      ],
    );
  }

  Future<void> _pickImage() async {
    final pickedFile =
        await ImagePicker().pickImage(source: ImageSource.gallery);
    if (pickedFile != null) {
      setState(() => _selectedImage = File(pickedFile.path));
    }
  }

  Future<bool> updateProfile() async {
    FlutterSecureStorage storage = const FlutterSecureStorage();
    String? token = await storage.read(key: "token");
     if (token == null) return false; 

    var url = Uri.parse("$baseUrl/Edit/self");

    var request = http.MultipartRequest("PATCH", url);

    request.fields['email'] = _emailController.text.trim();
    request.fields['username'] = _nameController.text.trim();
    request.fields['dob'] = _dobController.text.trim();
    request.fields['phone'] = _phoneController.text.trim();
    request.fields['skills'] = _skillsController.text.trim();
    request.fields['isActive'] = "true";
    request.fields['countryCode'] = "+91";
    request.headers['Authorization'] = token;

if (_selectedImage != null) {
    // Get file extension
    var fileExtension = _selectedImage!.path.split('.').last.toLowerCase();
    var contentType = fileExtension == 'png' 
        ? MediaType('image', 'png')
        : MediaType('image', 'jpeg');
    
    request.files.add(await http.MultipartFile.fromPath(
      'profile', // This must match the parameter name in your Java backend
      _selectedImage!.path,
      contentType: contentType,
    ));
  }
    try {
      var response = await request.send();
      if (response.statusCode == 200) {
        return true;
      } else {
        debugPrint("Error updating profile");
        return false;
      }
    } catch (e) {
      debugPrint("Network error: $e");
      return false;
    }
  }

  Widget _buildTextField(
      {required String hintText, required TextEditingController controller}) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(
        labelText: hintText,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(6),
          borderSide: BorderSide(
            color: Color(0xFFA3A3A5),
            width: 2.5,
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
        ),
        errorBorder: OutlineInputBorder(
          borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
        ),
      ),
    );
  }

  Widget _buildDatePicker() {
    return GestureDetector(
      onTap: () async {
        DateTime? pickedDate = await showDatePicker(
          context: context,
          initialDate: DateTime.now(),
          firstDate: DateTime(1900),
          lastDate: DateTime.now(),
          builder: (context, child) {
            return Theme(
              data: ThemeData(
                primaryColor: Color(0xFF4680FE), // Blue header color
                colorScheme: ColorScheme.light(
                  primary: Color(0xFF4680FE), // Blue selection color
                  onPrimary: Colors.white, // Text color on selected date
                  onSurface: Colors.black, // Normal text color
                ),
                dialogBackgroundColor: Colors.white, // White background
              ),
              child: child!,
            );
          },
        );
        setState(() {
          _dobController.text = DateFormat("yyyy-MM-dd").format(pickedDate!);
        });
            },
      child: AbsorbPointer(
        child: _buildTextField(
            hintText: "Date of Birth", controller: _dobController),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return _isLoading
        ? Center(child: CircularProgressIndicator())//color: Color(0xFF4680FE)))
        : SingleChildScrollView(
            child: Padding(
              padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
              child: Form(
                key: widget.formKey,
                child: Column(
                  children: [
                    _buildProfilePicture(),
                    SizedBox(height: Dimensions.fontSize(context, 20)),
                    _buildTextField(
                        hintText: "Name", controller: _nameController),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    _buildTextField(
                        hintText: "Email", controller: _emailController),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    _buildDatePicker(),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    _buildTextField(
                        hintText: "Phone", controller: _phoneController),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    _buildTextField(
                        hintText: "Skills", controller: _skillsController),
                    SizedBox(height: Dimensions.fontSize(context, 40)),
                    ElevatedButton(
                      onPressed: () async {
                        setState(() => _isLoading = true);
                        bool success = await updateProfile();
                        setState(() => _isLoading = false);
                        if (success) {
                          // ignore: use_build_context_synchronously
                          showSuccessDialog(context, widget.selectedIndex,
                              widget.onItemTapped);
                          fetchUserData();
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(6),
                        ),
                        backgroundColor: Color(0xFF4680FE),
                      ),
                      child: Text(
                        "     Save     ",
                        style: TextStyle(
                            fontFamily: 'Poppins',
                            fontWeight: FontWeight.w400,
                            fontSize: Dimensions.fontSize(context, 22),
                            color: Color(0xFFFFFFFF)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
  }
}
