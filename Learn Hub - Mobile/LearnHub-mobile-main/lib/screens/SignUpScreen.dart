
// ignore_for_file: unused_import, unused_element, deprecated_member_use

import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import '../dimensions.dart';
import '../url.dart';
import 'HomePage.dart';
import 'LoginScreen.dart';

class SignUpScreen extends StatefulWidget {
  const SignUpScreen({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _SignUpScreenState createState() => _SignUpScreenState();
}

class _SignUpScreenState extends State<SignUpScreen> {
  File? _selectedImage; // Add this line to store the selected image
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _confirmPasswordController =
      TextEditingController();

  final bool _obscurePassword = true;

  final FocusNode _emailFocusNode = FocusNode();
  final FocusNode _phoneFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();
  final FocusNode _confirmPasswordFocusNode = FocusNode();

  bool _isEmailHintVisible = true;
  bool _isPhoneHintVisible = true;
  bool _isPasswordHintVisible = true;
  bool _isConfirmPasswordHintVisible = true;

  Timer? _emailHintTimer;
  Timer? _phoneHintTimer;
  Timer? _passwordHintTimer;
  Timer? _confirmPasswordHintTimer;

  bool _isAnyFieldFocused = false;
  bool _isSnackBarVisible = false;

  @override
  void initState() {
    super.initState();
    _setupFocusListeners();
  }
  Future<void> _pickImage() async {
  final picker = ImagePicker();
  final pickedFile = await picker.pickImage(source: ImageSource.gallery);
  
  if (pickedFile != null) {
    setState(() {
      _selectedImage = File(pickedFile.path); // Store the selected image
    });
  }
}

  void _setupFocusListeners() {
    _emailFocusNode.addListener(() {
      _updateFocusState(_emailFocusNode);
      _handleFocusChange(_emailFocusNode, _emailController,
          (visible) => setState(() => _isEmailHintVisible = visible));
    });

    _phoneFocusNode.addListener(() {
      _updateFocusState(_phoneFocusNode);
      _handleFocusChange(_phoneFocusNode, _phoneController,
          (visible) => setState(() => _isPhoneHintVisible = visible));
    });

    _passwordFocusNode.addListener(() {
      _updateFocusState(_passwordFocusNode);
      _handleFocusChange(_passwordFocusNode, _passwordController,
          (visible) => setState(() => _isPasswordHintVisible = visible));
    });

    _confirmPasswordFocusNode.addListener(() {
      _updateFocusState(_confirmPasswordFocusNode);
      _handleFocusChange(_confirmPasswordFocusNode, _confirmPasswordController,
          (visible) => setState(() => _isConfirmPasswordHintVisible = visible));
    });
  }

  void _updateFocusState(FocusNode focusNode) {
    setState(() {
      _isAnyFieldFocused = focusNode.hasFocus;
    });
  }

  void _showSnackBar(String message, BuildContext context) {
    if (!_isSnackBarVisible) {
      setState(() {
        _isSnackBarVisible = true;
      });

      ScaffoldMessenger.of(context)
          .showSnackBar(
            SnackBar(
              content: Text(message),
              duration: Duration(milliseconds: 600), // Shortened duration
            ),
          )
          .closed
          .then((_) {
        setState(() {
          _isSnackBarVisible = false; // Reset flag when SnackBar closes
        });
      });
    }
  }

  void _handleFocusChange(FocusNode focusNode, TextEditingController controller,
      void Function(bool visible) updateHintVisibility) {
    if (focusNode.hasFocus) {
      updateHintVisibility(false); // Hide the hint text when focused
      _startHintTimer(controller, updateHintVisibility);
    } else if (controller.text.isEmpty) {
      updateHintVisibility(true); // Show the hint text when field is left empty
      _cancelHintTimer();
    }
  }

  void _startHintTimer(TextEditingController controller,
      void Function(bool visible) updateHintVisibility) {
    _cancelHintTimer();

    if (controller.text.isEmpty) {
      _emailHintTimer = Timer(Duration(seconds: 2), () {
        updateHintVisibility(
            true); // Show hint text after 5 minutes if still empty
      });
    }
  }

  void _cancelHintTimer() {
    _emailHintTimer?.cancel();
    _phoneHintTimer?.cancel();
    _passwordHintTimer?.cancel();
    _confirmPasswordHintTimer?.cancel();
  }

  @override
  void dispose() {
    _emailFocusNode.dispose();
    _phoneFocusNode.dispose();
    _passwordFocusNode.dispose();
    _confirmPasswordFocusNode.dispose();
    _cancelHintTimer();
    super.dispose();
  }

@override
Widget build(BuildContext context) {
  return Scaffold(
    backgroundColor: Color(0xFFFFFFFF),
    body: SingleChildScrollView(
      child: Column(
        children: [
          if (!_isAnyFieldFocused) // Display the image header when no field is focused
            Container(
              height: Dimensions.fontSize(context, 340),
              decoration: BoxDecoration(
                color: Color(0xFFFFFFFF),
                image: DecorationImage(
                  image: AssetImage('assets/blue_top_image.png'),
                  fit: BoxFit.cover,
                ),
              ),
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      'Sign Up',
                      style: TextStyle(
                        fontFamily: 'Poppins',
                        fontWeight: FontWeight.w600,
                        fontSize: Dimensions.fontSize(context, 30),
                        letterSpacing: -0.5,
                        color: Color(0xFFFFFFFF),
                        shadows: [
                          Shadow(
                            color: Colors.black.withOpacity(0.4),
                            blurRadius: 10,
                            offset: Offset(2, 2),
                          ),
                        ],
                      ),
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 20)),
                    Stack(
                      alignment: Alignment.center,
                      children: [
                        CircleAvatar(
                          radius: Dimensions.fontSize(context, 85),
                          backgroundImage: _selectedImage != null
                              ? FileImage(_selectedImage!)
                              : AssetImage('assets/profile_pic3.png') as ImageProvider,
                        ),
                        Positioned(
                          bottom: 10,
                          right: 10,
                          child: GestureDetector(
                            onTap: _pickImage,
                            child: Container(
                              padding: EdgeInsets.all(Dimensions.fontSize(context, 8)),
                              decoration: BoxDecoration(
                                color: Color(0xFF4680FE),
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors.black.withOpacity(0.2),
                                    blurRadius: 6,
                                    offset: Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Icon(
                                Icons.camera_alt_outlined,
                                color: Colors.white,
                                size: Dimensions.fontSize(context, 23),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          Container(
            color: Color(0xFFFFFFFF),
            child: Padding(
              padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 30)),
              child: Column(
                children: [
                  if (_isAnyFieldFocused) // Text for focused state
                    Column(
                      children: [
                        SizedBox(height: Dimensions.fontSize(context, 50)),
                        Text(
                          'Sign Up',
                          style: TextStyle(
                            fontFamily: 'Poppins',
                            fontWeight: FontWeight.w600,
                            fontSize: Dimensions.fontSize(context, 48),
                            letterSpacing: -0.5,
                            color: Color(0xFF000000),
                          ),
                        ),
                        SizedBox(height: Dimensions.fontSize(context, 10)),
                      ],
                    ),
                  Text(
                    'Enter your details below',
                    style: TextStyle(
                      fontFamily: 'Poppins',
                      color: Color(0xFFA3A3A5),
                      fontSize: Dimensions.fontSize(context, 25),
                      fontWeight: FontWeight.w300,
                    ),
                  ),
                  SizedBox(height: Dimensions.fontSize(context, 30)),
                  _buildFormFields(), // Form fields are always shown
                  SizedBox(height: Dimensions.fontSize(context, 40)),
                  if (_isAnyFieldFocused) // Focus mode: Login text first
                    Column(
                      children: [
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Already have an account? ',
                              style: TextStyle(
                                fontFamily: 'Roboto',
                                fontWeight: FontWeight.w400,
                                fontSize: Dimensions.fontSize(context, 14),
                                letterSpacing: 0.4,
                                color: Color(0xFFA29595),
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => LoginScreen(),
                                  ),
                                );
                              },
                              child: Text(
                                'Login',
                                style: TextStyle(
                                  fontFamily: 'Roboto',
                                  fontWeight: FontWeight.w400,
                                  fontSize: Dimensions.fontSize(context, 14),
                                  letterSpacing: 0.4,
                                  color: Color(0xFF4680FE),
                                  decoration: TextDecoration.underline,
                                  decorationColor: Color(0xFF4680FE),
                                ),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: Dimensions.fontSize(context, 14)),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              if (_formKey.currentState!.validate()) {
                                _registerUser();
                                _showSnackBar("Account created successfully!", context);
                                Navigator.pushReplacement(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => LoginScreen()),
                                );
                              } else {
                                _showSnackBar("Please fix the errors in the form", context);
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Color(0xFF4680FE),
                              padding:
                            EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 10), vertical: Dimensions.fontSize(context, 15)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                            ),
                            child: Text(
                              'Create Account',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: Dimensions.fontSize(context, 21),
                                fontWeight: FontWeight.w500,
                                color: Color(0xFFFFFFFF),
                              ),
                            ),
                          ),
                        ),
                      ],
                    )
                  else // No focus: Button first
                    Column(
                      children: [
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: () {
                              if (_formKey.currentState!.validate()) {
                                _registerUser();
                                _showSnackBar("Account created successfully!", context);
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                      builder: (context) => LoginScreen()),
                                );
                              } else {
                                _showSnackBar("Please fix the errors in the form", context
                                );
                              }
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Color(0xFF4680FE),
                              padding:
                            EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 10), vertical: Dimensions.fontSize(context, 15)),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(30),
                              ),
                            ),
                            child: Text(
                              'Create Account',
                              style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: Dimensions.fontSize(context, 21),
                                fontWeight: FontWeight.w500,
                                color: Color(0xFFFFFFFF),
                              ),
                            ),
                          ),
                        ),
                        SizedBox(height: Dimensions.fontSize(context, 20)),
                        Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Already have an account? ',
                              style: TextStyle(
                                fontFamily: 'Roboto',
                                fontWeight: FontWeight.w400,
                                fontSize: Dimensions.fontSize(context, 14),
                                letterSpacing: 0.4,
                                color: Color(0xFFA29595),
                              ),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (context) => LoginScreen(),
                                  ),
                                );
                              },
                              child: Text(
                                'Login',
                                style: TextStyle(
                                  fontFamily: 'Roboto',
                                  fontWeight: FontWeight.w400,
                                  fontSize: Dimensions.fontSize(context, 14),
                                  letterSpacing: 0.4,
                                  color: Color(0xFF4680FE),
                                  decoration: TextDecoration.underline,
                                  decorationColor: Color(0xFF4680FE),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    ),
  );
}
  void _registerUser() async {
    var url = Uri.parse("$baseUrl/Student/register");

    var request = http.MultipartRequest("POST", url)
      ..fields.addAll({
        'username': _emailController.text.split('@')[0], // Only the part before @ //_emailController.text,
        'psw': _passwordController.text,
        'email': _emailController.text,
        'dob': " ",
        'role': "student",
        'phone': _phoneController.text,
        'skills': " ",
        'isActive': "true",
        'countryCode': "+91",
      });
  if (_selectedImage != null) {
    request.files.add(
      await http.MultipartFile.fromPath(
        'profile',
        _selectedImage!.path,
      ),
    );
  }

    try {
      var response = await request.send();
      if (response.statusCode == 200) {
        // ignore: avoid_print
        print("User Registered Successfully");
      } else {
        // ignore: avoid_print
        print("Failed to register user: ${response.statusCode}");
      }
    } catch (e) {
      // ignore: avoid_print
      print("Error: $e");
    }
  }

  Widget _buildFormFields() {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          TextFormField(
            controller: _emailController,
            focusNode: _emailFocusNode,
            showCursor: false,
            decoration: InputDecoration(
              hintText: _isEmailHintVisible ? 'Email ID' : null,
              border: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: Color(0xFFA3A3A5),
                  width: 2.5,
                ),
              ),
              focusedBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
              ),
              errorBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your email';
              }
              if (!value.contains('@')) {
                return 'Enter a valid email address';
              }
              return null;
            },
          ),
          SizedBox(height: Dimensions.fontSize(context, 30)),
          TextFormField(
            controller: _phoneController,
            focusNode: _phoneFocusNode,
            showCursor: false,
            keyboardType: TextInputType.phone,
            decoration: InputDecoration(
              hintText: _isPhoneHintVisible ? 'Phone Number' : null,
              border: UnderlineInputBorder(
                borderSide: BorderSide(
                  color: Color(0xFFA3A3A5),
                  width: 2.5,
                ),
              ),
              focusedBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
              ),
              errorBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your phone number';
              }
              final phoneRegex = RegExp(r'^\d{10}$');
              if (!phoneRegex.hasMatch(value)) {
                return 'Phone number must be exactly 10 digits';
              }
              return null;
            },
          ),
          SizedBox(height: Dimensions.fontSize(context, 30)),
          TextFormField(
            controller: _passwordController,
            focusNode: _passwordFocusNode,
            showCursor: true,
            obscureText: _obscurePassword, // Only controls UI visibility
            decoration: InputDecoration(
              hintText: _isPasswordHintVisible ? 'Password' : null,
              border: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
              ),
              focusedBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
              ),
              errorBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please enter your password';
              }
              if (value.length < 8) {
                return 'Password must be at least 8 characters';
              }
              
  // Password regex: at least 8 chars, 1 letter, 1 number, 1 special character
  final passwordRegex = RegExp(r'^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$');

  if (!passwordRegex.hasMatch(value)) {
    return 'Password must be at least 8 characters and include a letter, number, and special character';
  }

              return null;
            },
          ),
          SizedBox(height: Dimensions.fontSize(context, 30)),
          TextFormField(
            controller: _confirmPasswordController,
            focusNode: _confirmPasswordFocusNode,
            showCursor: true,
            obscureText: _obscurePassword, // Keeps UI obscured
            decoration: InputDecoration(
              hintText:
                  _isConfirmPasswordHintVisible ? 'Confirm Password' : null,
              border: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
              ),
              focusedBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
              ),
              errorBorder: UnderlineInputBorder(
                borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) {
                return 'Please confirm your password';
              }
              if (value != _passwordController.text) {
                return 'Passwords do not match';
              }
              return null;
            },
          ),
        ],
      ),
    );
  }
}
// // ignore_for_file: unused_import, unused_element, deprecated_member_use

// import 'dart:async';
// import 'dart:io';

// import 'package:flutter/material.dart';
// import 'package:image_picker/image_picker.dart';
// import 'package:http/http.dart' as http;
// import '../dimensions.dart';
// import '../url.dart';
// import 'HomePage.dart';
// import 'LoginScreen.dart';

// class SignUpScreen extends StatefulWidget {
//   const SignUpScreen({super.key});

//   @override
//   // ignore: library_private_types_in_public_api
//   _SignUpScreenState createState() => _SignUpScreenState();
// }

// class _SignUpScreenState extends State<SignUpScreen> {
//   File? _selectedImage; // Add this line to store the selected image
//   final _formKey = GlobalKey<FormState>();
//   final TextEditingController _emailController = TextEditingController();
//   final TextEditingController _passwordController = TextEditingController();
//   final TextEditingController _phoneController = TextEditingController();
//   final TextEditingController _confirmPasswordController =
//       TextEditingController();

//   final bool _obscurePassword = true;

//   final FocusNode _emailFocusNode = FocusNode();
//   final FocusNode _phoneFocusNode = FocusNode();
//   final FocusNode _passwordFocusNode = FocusNode();
//   final FocusNode _confirmPasswordFocusNode = FocusNode();

//   bool _isEmailHintVisible = true;
//   bool _isPhoneHintVisible = true;
//   bool _isPasswordHintVisible = true;
//   bool _isConfirmPasswordHintVisible = true;

//   Timer? _emailHintTimer;
//   Timer? _phoneHintTimer;
//   Timer? _passwordHintTimer;
//   Timer? _confirmPasswordHintTimer;

//   bool _isAnyFieldFocused = false;
//   bool _isSnackBarVisible = false;

//   @override
//   void initState() {
//     super.initState();
//     _setupFocusListeners();
//   }
//   Future<void> _pickImage() async {
//   final picker = ImagePicker();
//   final pickedFile = await picker.pickImage(source: ImageSource.gallery);
  
//   if (pickedFile != null) {
//     setState(() {
//       _selectedImage = File(pickedFile.path); // Store the selected image
//     });
//   }
// }

//   void _setupFocusListeners() {
//     _emailFocusNode.addListener(() {
//       _updateFocusState(_emailFocusNode);
//       _handleFocusChange(_emailFocusNode, _emailController,
//           (visible) => setState(() => _isEmailHintVisible = visible));
//     });

//     _phoneFocusNode.addListener(() {
//       _updateFocusState(_phoneFocusNode);
//       _handleFocusChange(_phoneFocusNode, _phoneController,
//           (visible) => setState(() => _isPhoneHintVisible = visible));
//     });

//     _passwordFocusNode.addListener(() {
//       _updateFocusState(_passwordFocusNode);
//       _handleFocusChange(_passwordFocusNode, _passwordController,
//           (visible) => setState(() => _isPasswordHintVisible = visible));
//     });

//     _confirmPasswordFocusNode.addListener(() {
//       _updateFocusState(_confirmPasswordFocusNode);
//       _handleFocusChange(_confirmPasswordFocusNode, _confirmPasswordController,
//           (visible) => setState(() => _isConfirmPasswordHintVisible = visible));
//     });
//   }

//   void _updateFocusState(FocusNode focusNode) {
//     setState(() {
//       _isAnyFieldFocused = focusNode.hasFocus;
//     });
//   }

//   void _showSnackBar(String message, BuildContext context) {
//     if (!_isSnackBarVisible) {
//       setState(() {
//         _isSnackBarVisible = true;
//       });

//       ScaffoldMessenger.of(context)
//           .showSnackBar(
//             SnackBar(
//               content: Text(message),
//               duration: Duration(milliseconds: 600), // Shortened duration
//             ),
//           )
//           .closed
//           .then((_) {
//         setState(() {
//           _isSnackBarVisible = false; // Reset flag when SnackBar closes
//         });
//       });
//     }
//   }

//   void _handleFocusChange(FocusNode focusNode, TextEditingController controller,
//       void Function(bool visible) updateHintVisibility) {
//     if (focusNode.hasFocus) {
//       updateHintVisibility(false); // Hide the hint text when focused
//       _startHintTimer(controller, updateHintVisibility);
//     } else if (controller.text.isEmpty) {
//       updateHintVisibility(true); // Show the hint text when field is left empty
//       _cancelHintTimer();
//     }
//   }

//   void _startHintTimer(TextEditingController controller,
//       void Function(bool visible) updateHintVisibility) {
//     _cancelHintTimer();

//     if (controller.text.isEmpty) {
//       _emailHintTimer = Timer(Duration(seconds: 2), () {
//         updateHintVisibility(
//             true); // Show hint text after 5 minutes if still empty
//       });
//     }
//   }

//   void _cancelHintTimer() {
//     _emailHintTimer?.cancel();
//     _phoneHintTimer?.cancel();
//     _passwordHintTimer?.cancel();
//     _confirmPasswordHintTimer?.cancel();
//   }

//   @override
//   void dispose() {
//     _emailFocusNode.dispose();
//     _phoneFocusNode.dispose();
//     _passwordFocusNode.dispose();
//     _confirmPasswordFocusNode.dispose();
//     _cancelHintTimer();
//     super.dispose();
//   }

// @override
// Widget build(BuildContext context) {
//   return Scaffold(
//     backgroundColor: Color(0xFFFFFFFF),
//     body: SingleChildScrollView(
//       child: Column(
//         children: [
//           if (!_isAnyFieldFocused) // Display the image header when no field is focused
//             Container(
//               height: Dimensions.fontSize(context, 340),
//               decoration: BoxDecoration(
//                 color: Color(0xFFFFFFFF),
//                 image: DecorationImage(
//                   image: AssetImage('assets/blue_top_image.png'),
//                   fit: BoxFit.cover,
//                 ),
//               ),
//               child: Center(
//                 child: Column(
//                   mainAxisAlignment: MainAxisAlignment.center,
//                   children: [
//                     Text(
//                       'Sign Up',
//                       style: TextStyle(
//                         fontFamily: 'Poppins',
//                         fontWeight: FontWeight.w600,
//                         fontSize: Dimensions.fontSize(context, 30),
//                         letterSpacing: -0.5,
//                         color: Color(0xFFFFFFFF),
//                         shadows: [
//                           Shadow(
//                             color: Colors.black.withOpacity(0.4),
//                             blurRadius: 10,
//                             offset: Offset(2, 2),
//                           ),
//                         ],
//                       ),
//                     ),
//                     SizedBox(height: Dimensions.fontSize(context, 20)),
//                     Stack(
//                       alignment: Alignment.center,
//                       children: [
//                         CircleAvatar(
//                           radius: Dimensions.fontSize(context, 85),
//                           backgroundImage: _selectedImage != null
//                               ? FileImage(_selectedImage!)
//                               : AssetImage('assets/profile_pic.png') as ImageProvider,
//                         ),
//                         Positioned(
//                           bottom: 10,
//                           right: 10,
//                           child: GestureDetector(
//                             onTap: _pickImage,
//                             child: Container(
//                               padding: EdgeInsets.all(Dimensions.fontSize(context, 8)),
//                               decoration: BoxDecoration(
//                                 color: Color(0xFF4680FE),
//                                 shape: BoxShape.circle,
//                                 boxShadow: [
//                                   BoxShadow(
//                                     color: Colors.black.withOpacity(0.2),
//                                     blurRadius: 6,
//                                     offset: Offset(0, 3),
//                                   ),
//                                 ],
//                               ),
//                               child: Icon(
//                                 Icons.camera_alt_outlined,
//                                 color: Colors.white,
//                                 size: Dimensions.fontSize(context, 23),
//                               ),
//                             ),
//                           ),
//                         ),
//                       ],
//                     ),
//                   ],
//                 ),
//               ),
//             ),
//           Container(
//             color: Color(0xFFFFFFFF),
//             child: Padding(
//               padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 30)),
//               child: Column(
//                 children: [
//                   if (_isAnyFieldFocused) // Text for focused state
//                     Column(
//                       children: [
//                         SizedBox(height: Dimensions.fontSize(context, 50)),
//                         Text(
//                           'Sign Up',
//                           style: TextStyle(
//                             fontFamily: 'Poppins',
//                             fontWeight: FontWeight.w600,
//                             fontSize: Dimensions.fontSize(context, 48),
//                             letterSpacing: -0.5,
//                             color: Color(0xFF000000),
//                           ),
//                         ),
//                         SizedBox(height: Dimensions.fontSize(context, 10)),
//                       ],
//                     ),
//                   Text(
//                     'Enter your details below',
//                     style: TextStyle(
//                       fontFamily: 'Poppins',
//                       color: Color(0xFFA3A3A5),
//                       fontSize: Dimensions.fontSize(context, 25),
//                       fontWeight: FontWeight.w300,
//                     ),
//                   ),
//                   SizedBox(height: Dimensions.fontSize(context, 30)),
//                   _buildFormFields(), // Form fields are always shown
//                   SizedBox(height: Dimensions.fontSize(context, 40)),
//                   if (_isAnyFieldFocused) // Focus mode: Login text first
//                     Column(
//                       children: [
//                         Row(
//                           mainAxisSize: MainAxisSize.min,
//                           children: [
//                             Text(
//                               'Already have an account? ',
//                               style: TextStyle(
//                                 fontFamily: 'Roboto',
//                                 fontWeight: FontWeight.w400,
//                                 fontSize: Dimensions.fontSize(context, 14),
//                                 letterSpacing: 0.4,
//                                 color: Color(0xFFA29595),
//                               ),
//                             ),
//                             TextButton(
//                               onPressed: () {
//                                 Navigator.push(
//                                   context,
//                                   MaterialPageRoute(
//                                     builder: (context) => LoginScreen(),
//                                   ),
//                                 );
//                               },
//                               child: Text(
//                                 'Login',
//                                 style: TextStyle(
//                                   fontFamily: 'Roboto',
//                                   fontWeight: FontWeight.w400,
//                                   fontSize: Dimensions.fontSize(context, 14),
//                                   letterSpacing: 0.4,
//                                   color: Color(0xFF4680FE),
//                                   decoration: TextDecoration.underline,
//                                   decorationColor: Color(0xFF4680FE),
//                                 ),
//                               ),
//                             ),
//                           ],
//                         ),
//                         SizedBox(height: Dimensions.fontSize(context, 14)),
//                         SizedBox(
//                           width: double.infinity,
//                           child: ElevatedButton(
//                             onPressed: () {
//                               if (_formKey.currentState!.validate()) {
//                                 _registerUser();
//                                 debugPrint("Account created successfully!");
//                                 Navigator.pushReplacement(
//                                   context,
//                                   MaterialPageRoute(
//                                       builder: (context) => LoginScreen()),
//                                 );
//                               } else {
//                                 debugPrint("Please fix the errors in the form");
//                               }
//                             },
//                             style: ElevatedButton.styleFrom(
//                               backgroundColor: Color(0xFF4680FE),
//                               padding:
//                             EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 10), vertical: Dimensions.fontSize(context, 15)),
//                               shape: RoundedRectangleBorder(
//                                 borderRadius: BorderRadius.circular(30),
//                               ),
//                             ),
//                             child: Text(
//                               'Create Account',
//                               style: TextStyle(
//                                 fontFamily: 'Poppins',
//                                 fontSize: Dimensions.fontSize(context, 21),
//                                 fontWeight: FontWeight.w500,
//                                 color: Color(0xFFFFFFFF),
//                               ),
//                             ),
//                           ),
//                         ),
//                       ],
//                     )
//                   else // No focus: Button first
//                     Column(
//                       children: [
//                         SizedBox(
//                           width: double.infinity,
//                           child: ElevatedButton(
//                             onPressed: () {
//                               if (_formKey.currentState!.validate()) {
//                                 _registerUser();
//                                 debugPrint("Login successful!");
//                                 Navigator.push(
//                                   context,
//                                   MaterialPageRoute(
//                                       builder: (context) => LoginScreen()),
//                                 );
//                               } else {
//                                 debugPrint("Please fix the errors in the form");
//                               }
//                             },
//                             style: ElevatedButton.styleFrom(
//                               backgroundColor: Color(0xFF4680FE),
//                               padding:
//                             EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 10), vertical: Dimensions.fontSize(context, 15)),
//                               shape: RoundedRectangleBorder(
//                                 borderRadius: BorderRadius.circular(30),
//                               ),
//                             ),
//                             child: Text(
//                               'Create Account',
//                               style: TextStyle(
//                                 fontFamily: 'Poppins',
//                                 fontSize: Dimensions.fontSize(context, 21),
//                                 fontWeight: FontWeight.w500,
//                                 color: Color(0xFFFFFFFF),
//                               ),
//                             ),
//                           ),
//                         ),
//                         SizedBox(height: Dimensions.fontSize(context, 20)),
//                         Row(
//                           mainAxisSize: MainAxisSize.min,
//                           children: [
//                             Text(
//                               'Already have an account? ',
//                               style: TextStyle(
//                                 fontFamily: 'Roboto',
//                                 fontWeight: FontWeight.w400,
//                                 fontSize: Dimensions.fontSize(context, 14),
//                                 letterSpacing: 0.4,
//                                 color: Color(0xFFA29595),
//                               ),
//                             ),
//                             TextButton(
//                               onPressed: () {
//                                 Navigator.push(
//                                   context,
//                                   MaterialPageRoute(
//                                     builder: (context) => LoginScreen(),
//                                   ),
//                                 );
//                               },
//                               child: Text(
//                                 'Login',
//                                 style: TextStyle(
//                                   fontFamily: 'Roboto',
//                                   fontWeight: FontWeight.w400,
//                                   fontSize: Dimensions.fontSize(context, 14),
//                                   letterSpacing: 0.4,
//                                   color: Color(0xFF4680FE),
//                                   decoration: TextDecoration.underline,
//                                   decorationColor: Color(0xFF4680FE),
//                                 ),
//                               ),
//                             ),
//                           ],
//                         ),
//                       ],
//                     ),
//                 ],
//               ),
//             ),
//           ),
//         ],
//       ),
//     ),
//   );
// }
//   void _registerUser() async {
//     var url = Uri.parse("$baseUrl/Student/register");

//     var request = http.MultipartRequest("POST", url)
//       ..fields.addAll({
//         'username': _emailController.text,
//         'psw': _passwordController.text,
//         'email': _emailController.text,
//         'dob': "2010-11-07",
//         'role': "student",
//         'phone': _phoneController.text,
//         'skills': "Flutter, Java",
//         'isActive': "true",
//         'countryCode': "+91",
//       });
//   if (_selectedImage != null) {
//     request.files.add(
//       await http.MultipartFile.fromPath(
//         'profile',
//         _selectedImage!.path,
//       ),
//     );
//   }

//     try {
//       var response = await request.send();
//       if (response.statusCode == 200) {
//         // ignore: avoid_print
//         print("User Registered Successfully");
//       } else {
//         // ignore: avoid_print
//         print("Failed to register user: ${response.statusCode}");
//       }
//     } catch (e) {
//       // ignore: avoid_print
//       print("Error: $e");
//     }
//   }

//   Widget _buildFormFields() {
//     return Form(
//       key: _formKey,
//       child: Column(
//         children: [
//           TextFormField(
//             controller: _emailController,
//             focusNode: _emailFocusNode,
//             showCursor: false,
//             decoration: InputDecoration(
//               hintText: _isEmailHintVisible ? 'Email ID' : null,
//               border: UnderlineInputBorder(
//                 borderSide: BorderSide(
//                   color: Color(0xFFA3A3A5),
//                   width: 2.5,
//                 ),
//               ),
//               focusedBorder: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
//               ),
//               errorBorder: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
//               ),
//             ),
//             validator: (value) {
//               if (value == null || value.isEmpty) {
//                 return 'Please enter your email';
//               }
//               if (!value.contains('@')) {
//                 return 'Enter a valid email address';
//               }
//               return null;
//             },
//           ),
//           SizedBox(height: Dimensions.fontSize(context, 30)),
//           TextFormField(
//             controller: _phoneController,
//             focusNode: _phoneFocusNode,
//             showCursor: false,
//             keyboardType: TextInputType.phone,
//             decoration: InputDecoration(
//               hintText: _isPhoneHintVisible ? 'Phone Number' : null,
//               border: UnderlineInputBorder(
//                 borderSide: BorderSide(
//                   color: Color(0xFFA3A3A5),
//                   width: 2.5,
//                 ),
//               ),
//               focusedBorder: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
//               ),
//               errorBorder: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
//               ),
//             ),
//             validator: (value) {
//               if (value == null || value.isEmpty) {
//                 return 'Please enter your phone number';
//               }
//               final phoneRegex = RegExp(r'^\d{10}$');
//               if (!phoneRegex.hasMatch(value)) {
//                 return 'Phone number must be exactly 10 digits';
//               }
//               return null;
//             },
//           ),
//           SizedBox(height: Dimensions.fontSize(context, 30)),
//           TextFormField(
//             controller: _passwordController,
//             focusNode: _passwordFocusNode,
//             showCursor: true,
//             obscureText: _obscurePassword, // Only controls UI visibility
//             decoration: InputDecoration(
//               hintText: _isPasswordHintVisible ? 'Password' : null,
//               border: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
//               ),
//               focusedBorder: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
//               ),
//               errorBorder: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
//               ),
//             ),
//             validator: (value) {
//               if (value == null || value.isEmpty) {
//                 return 'Please enter your password';
//               }
//               if (value.length < 8) {
//                 return 'Password must be at least 8 characters';
//               }
//               return null;
//             },
//           ),
//           SizedBox(height: Dimensions.fontSize(context, 30)),
//           TextFormField(
//             controller: _confirmPasswordController,
//             focusNode: _confirmPasswordFocusNode,
//             showCursor: true,
//             obscureText: _obscurePassword, // Keeps UI obscured
//             decoration: InputDecoration(
//               hintText:
//                   _isConfirmPasswordHintVisible ? 'Confirm Password' : null,
//               border: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
//               ),
//               focusedBorder: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
//               ),
//               errorBorder: UnderlineInputBorder(
//                 borderSide: BorderSide(color: Color(0xFFA3A3A5), width: 2.5),
//               ),
//             ),
//             validator: (value) {
//               if (value == null || value.isEmpty) {
//                 return 'Please confirm your password';
//               }
//               if (value != _passwordController.text) {
//                 return 'Passwords do not match';
//               }
//               return null;
//             },
//           ),
//         ],
//       ),
//     );
//   }
// }
