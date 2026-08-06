import 'dart:async';
import 'dart:ui';

import 'package:flutter/material.dart';

class UpdatePasswordPage extends StatefulWidget {
  const UpdatePasswordPage({super.key});

  @override
  // ignore: library_private_types_in_public_api
  _UpdatePasswordPageState createState() => _UpdatePasswordPageState();
}

class _UpdatePasswordPageState extends State<UpdatePasswordPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _newpasswordController = TextEditingController();
  final TextEditingController _confirmpasswordController =
      TextEditingController();

  final FocusNode _emailFocusNode = FocusNode();
  final FocusNode _newpasswordFocusNode = FocusNode();
  final FocusNode _confirmpasswordFocusNode = FocusNode();

  bool _isemailHintVisible = true;
  bool _isnewpasswordHintVisible = true;
  bool _isconfirmpasswordHintVisible = true;

  Timer? _emailHintTimer;
  Timer? _newpasswordHintTimer;
  Timer? _confirmpasswordHintTimer;

  bool _isAnyFieldFocused = false;
  //bool _isSnackBarVisible = false;

  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _setupFocusListeners();
  }

  void _setupFocusListeners() {
    _emailFocusNode.addListener(() {
      _updateFocusState(_emailFocusNode);
      _handleFocusChange(_emailFocusNode, _emailController,
          (visible) => setState(() => _isemailHintVisible = visible));
    });

    _newpasswordFocusNode.addListener(() {
      _updateFocusState(_newpasswordFocusNode);
      _handleFocusChange(_newpasswordFocusNode, _newpasswordController,
          (visible) => setState(() => _isnewpasswordHintVisible = visible));
    });

    _confirmpasswordFocusNode.addListener(() {
      _updateFocusState(_confirmpasswordFocusNode);
      _handleFocusChange(_confirmpasswordFocusNode, _confirmpasswordController,
          (visible) => setState(() => _isconfirmpasswordHintVisible = visible));
    });
  }

  void _updateFocusState(FocusNode focusNode) {
    setState(() {
      _isAnyFieldFocused = focusNode.hasFocus;
    });

    if (focusNode.hasFocus) {
      // Scroll to the bottom when a text field is focused
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
    } else {
      // Scroll back to the top when no text field is focused
      _scrollController.animateTo(
        0,
        duration: Duration(milliseconds: 300),
        curve: Curves.easeOut,
      );
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
    _newpasswordHintTimer?.cancel();
    _confirmpasswordHintTimer?.cancel();
  }

  void _updatePassword() {
    if (_formKey.currentState!.validate()) {
      showSuccessDialog(context);
    }
  }

  @override
  void dispose() {
    _emailFocusNode.dispose();
    _newpasswordFocusNode.dispose();
    _confirmpasswordFocusNode.dispose();
    _cancelHintTimer();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;

    return Scaffold(
      resizeToAvoidBottomInset:
          false, // Disable automatic resizing when the keyboard opens
      appBar: AppBar(
        title: Text(
          "Update Password",
          style: TextStyle(
            color: Color(0xFF000000),
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
            fontSize: 24,
          ),
        ),
        backgroundColor: Colors.white,
        leading: IconButton(
          icon: Icon(
            Icons.arrow_back_ios_new_rounded,
            color: Color(0xFF000000),
          ),
          onPressed: () {
            Navigator.pop(context); // Use Navigator.pop to go back
          },
        ),
      ),
      body: Container(
        color: Color(0xFFFFFFFF),
        child: SingleChildScrollView(
          controller: _scrollController,
          physics: _isAnyFieldFocused
              ? AlwaysScrollableScrollPhysics() // Enable scrolling only when a text field is focused
              : NeverScrollableScrollPhysics(), // Disable scrolling otherwise
          child: ConstrainedBox(
            constraints: BoxConstraints(
              minHeight: screenHeight * 1.15,
            ),
            child: IntrinsicHeight(
              child: Column(
                children: [
                  SizedBox(height: 20),
                  CircleAvatar(
                    radius: 75,
                    backgroundImage: AssetImage('assets/profile_pic.png'),
                  ),
                  SizedBox(height: 30),
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        // color: Color(0xFF4680FE),
                        borderRadius: BorderRadius.only(
                          topLeft: Radius.circular(40),
                          topRight: Radius.circular(40),
                        ),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(30.0),
                        child: Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              TextFormField(
                                controller: _emailController,
                                decoration: InputDecoration(
                                  labelText: "Email Id",
                                  hintText:
                                      _isemailHintVisible ? "Email Id" : null,
                                  hintStyle: TextStyle(
                                    fontFamily: 'Roboto',
                                    fontWeight: FontWeight.w400,
                                    fontSize: 16,
                                    color: Color(0xFFA3A3A5),
                                  ),
                                  border: UnderlineInputBorder(
                                    borderSide: BorderSide(
                                        color: Color(0xFF000000), width: 3),
                                  ),
                                  focusedBorder: UnderlineInputBorder(
                                    borderSide: BorderSide(
                                        color: Color(0xFF000000), width: 2.5),
                                  ),
                                  errorBorder: UnderlineInputBorder(
                                    borderSide: BorderSide(
                                        color: Color(0xFF000000), width: 2.5),
                                  ),
                                ),
                                keyboardType: TextInputType.emailAddress,
                                validator: (value) {
                                  if (value == null || value.isEmpty) {
                                    return "Email cannot be empty";
                                  } else if (!RegExp(
                                          r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
                                      .hasMatch(value)) {
                                    return "Enter a valid email";
                                  }
                                  return null;
                                },
                              ),
                              SizedBox(height: 30),
                              _buildPasswordField(
                                "New Password",
                                _newpasswordController,
                                _newpasswordFocusNode,
                                _isnewpasswordHintVisible,
                              ),
                              SizedBox(height: 30),
                              _buildPasswordField(
                                "Confirm Password",
                                _confirmpasswordController,
                                _confirmpasswordFocusNode,
                                _isconfirmpasswordHintVisible,
                              ),
                              SizedBox(height: 80),
                              ElevatedButton(
                                onPressed: _updatePassword,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Color(0xFF4680FE),
                                  elevation: 3,
                                  padding: EdgeInsets.symmetric(vertical: 13),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(15),
                                  ),
                                ),
                                child: Text(
                                  "Update Password",
                                  style: TextStyle(
                                    fontSize: 22,
                                    color: Color(0xFFFFFFFF),
                                    fontWeight: FontWeight.w500,
                                    fontFamily: 'Poppins',
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPasswordField(
    String hintText,
    TextEditingController controller,
    FocusNode focusNode,
    bool hintVisible,
  ) {
    return StatefulBuilder(
      builder: (context, setState) {
        bool obscurePassword = true; // Default to hidden
        return TextFormField(
          controller: controller,
          focusNode: focusNode,
          showCursor: false,
          obscureText: obscurePassword,
          decoration: InputDecoration(
            hintText: hintVisible ? hintText : null,
            hintStyle: TextStyle(
              fontFamily: 'Roboto',
              fontWeight: FontWeight.w400,
              fontSize: 16,
              color: Color(0xFFA3A3A5),
            ),
            border: UnderlineInputBorder(
              borderSide: BorderSide(color: Color(0xFF000000), width: 3),
            ),
            focusedBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: Color(0xFF000000), width: 2.5),
            ),
            errorBorder: UnderlineInputBorder(
              borderSide: BorderSide(color: Color(0xFF000000), width: 2.5),
            ),
            suffixIcon: IconButton(
              icon: Icon(
                // ignore: dead_code
                obscurePassword ? Icons.visibility_off : Icons.visibility,
                color: Colors.grey,
              ),
              onPressed: () {
                setState(() {
                  obscurePassword = !obscurePassword;
                });
              },
            ),
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return 'Please enter $hintText';
            }
            if (hintText == "New Password" && value.length < 8) {
              return 'Password must be at least 8 characters long';
            }
            if (hintText == "Confirm Password" &&
                value != _newpasswordController.text) {
              return 'Passwords do not match';
            }
            return null;
          },
        );
      },
    );
  }

  void showSuccessDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false, // Prevent dismissing by tapping outside
      builder: (context) {
        return Stack(
          children: [
            //Add the blurred background
            BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 2, sigmaY: 2),
              child: ModalBarrier(
                dismissible: false,
                color:
                    // ignore: deprecated_member_use
                    Colors.black.withOpacity(0.0), // Semi-transparent overlay
              ),
            ),
            // Add the dialog box
            Dialog(
              backgroundColor: Color(0xFFFFFFFF),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(30)), // Updated radius
              child: Padding(
                padding: const EdgeInsets.all(30.0),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Add your image here
                    Image.asset(
                      'assets/Icon_1.png', // Replace with your image path
                      height: 202,
                      width: 205,
                    ),
                    SizedBox(height: 20),
                    Text(
                      "Password Updated Successfully",
                      textAlign: TextAlign.center,
                      style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                          fontFamily: 'Poppins',
                          color: Color(0xFF000000)),
                    ),
                    SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFFFFFFFF),
                        elevation: 3,
                        shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(8), // Button radius
                        ),
                      ),
                      child: Text(
                        "OK",
                        style: TextStyle(
                            color: Color(0xFF4680FE),
                            fontFamily: 'Poppins',
                            fontWeight: FontWeight.w600,
                            fontSize: 20),
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
}
