import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../dimensions.dart';
import '../url.dart';
import 'HomePage.dart';
import 'SignUpScreen.dart';
import 'package:http/http.dart' as http;

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  final FocusNode _emailFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();
  bool _isEmailHintVisible = true;
  bool _isPasswordHintVisible = true;
  bool _obscurePassword = true;
  bool _isLoading = false;
  bool _isSnackBarVisible = false;

  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  Timer? _hintTimer;

  @override
  void initState() {
    super.initState();
    _setupFocusListeners();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    _hintTimer?.cancel();
    super.dispose();
  }

  void _setupFocusListeners() {
    _emailFocusNode.addListener(() => _handleFocusChange(
          _emailFocusNode,
          _emailController,
          (visible) => setState(() => _isEmailHintVisible = visible),
        ));

    _passwordFocusNode.addListener(() => _handleFocusChange(
          _passwordFocusNode,
          _passwordController,
          (visible) => setState(() => _isPasswordHintVisible = visible),
        ));
  }

  void _handleFocusChange(
    FocusNode focusNode,
    TextEditingController controller,
    void Function(bool visible) updateHintVisibility,
  ) {
    if (focusNode.hasFocus) {
      updateHintVisibility(false);
      _startHintTimer(controller, updateHintVisibility);
    } else if (controller.text.isEmpty) {
      updateHintVisibility(true);
      _cancelHintTimer();
    }
  }

  void _startHintTimer(
    TextEditingController controller,
    void Function(bool visible) updateHintVisibility,
  ) {
    _cancelHintTimer();
    if (controller.text.isEmpty) {
      _hintTimer = Timer(const Duration(seconds: 2), () {
        updateHintVisibility(true);
      });
    }
  }

  void _cancelHintTimer() {
    _hintTimer?.cancel();
  }

  void _showSnackBar(String message) {
    if (!_isSnackBarVisible) {
      setState(() => _isSnackBarVisible = true);
      ScaffoldMessenger.of(context)
          .showSnackBar(
            SnackBar(
              content: Text(message),
              duration: const Duration(milliseconds: 600),
            ),
          )
          .closed
          .then((_) => setState(() => _isSnackBarVisible = false));
    }
  }

  Future<void> _loginUser() async {
    if (!_formKey.currentState!.validate()) {
      _showSnackBar("Please fix the errors in the form");
      return;
    }

    setState(() => _isLoading = true);

    try {
      final response = await http.post(
        Uri.parse("$baseUrl/login"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "username": _emailController.text.trim(),
          "password": _passwordController.text.trim(),
        }),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 200) {
        await _handleSuccessfulLogin(responseData);
      } else {
        _handleLoginError(responseData);
      }
    } catch (e) {
      _showSnackBar("Error: ${e.toString()}");
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  Future<void> _handleSuccessfulLogin(Map<String, dynamic> responseData) async {
    final token = responseData["token"] ?? "";
    final userId = responseData["userid"]?.toString() ?? "";
    final role = responseData["role"] ?? "";
    final email = _emailController.text.trim();

    // Secure storage
    await _storage.write(key: "token", value: token);
    await _storage.write(key: "email", value: email);
    await _storage.write(key: "userId", value: userId);

    // Shared preferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.setInt("userId", int.tryParse(userId) ?? 0);
    await prefs.setString("role", role);

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(builder: (context) => HomeScreen()),
    );
  }

  void _handleLoginError(Map<String, dynamic> responseData) {
    final errorMessage = responseData["message"] ?? "Invalid credentials!";
    _showSnackBar(errorMessage);
  }

  @override
  Widget build(BuildContext context) {
    final bool isFocused = _emailFocusNode.hasFocus || _passwordFocusNode.hasFocus;
    // final dimensions = Dimensions.of(context);

    return Scaffold(
      backgroundColor: Colors.white,
      body: SingleChildScrollView(
        child: Column(
          children: [
            if (!isFocused) _buildWelcomeHeader(),
            if (isFocused) _buildFocusedWelcomeText(),
            SizedBox(height: isFocused ? Dimensions.fontSize(context,40) : Dimensions.fontSize(context,80)),
            _buildLoginForm(isFocused),
          ],
        ),
      ),
    );
  }

  Widget _buildWelcomeHeader() {
    return Container(
      height: Dimensions.fontSize(context, 340),
      decoration: const BoxDecoration(
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
              'Welcome Back',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w600,
                fontSize: Dimensions.fontSize(context,48),
                letterSpacing: -0.5,
                color: const Color(0xFFFFFFFF),
                shadows: [
                  Shadow(
                    color: Colors.black.withOpacity(0.4),
                    blurRadius: 10,
                    offset: const Offset(2, 2),
                  ),
                ],
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            CircleAvatar(
              radius: Dimensions.fontSize(context, 85),
              backgroundImage: const AssetImage('assets/profile_pic3.png'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFocusedWelcomeText() {
    return Padding(
      padding: EdgeInsets.only(top: Dimensions.fontSize(context, 50)),
      child: Text(
        'Welcome Back',
        style: TextStyle(
          fontFamily: 'Poppins',
          fontWeight: FontWeight.w600,
          fontSize: Dimensions.fontSize(context, 48),
          letterSpacing: -0.5,
          color: Colors.black,
        ),
      ),
    );
  }

  Widget _buildLoginForm(bool isFocused) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 30)),
      child: Form(
        key: _formKey,
        child: Column(
          children: [
            _buildEmailField(),
            SizedBox(height: Dimensions.fontSize(context, 30)),
            _buildPasswordField(),
            SizedBox(height: Dimensions.fontSize(context, 40)),
            if (isFocused) _buildSignUpPrompt(),
            _buildLoginButton(),
            if (!isFocused) _buildBottomSignUpPrompt(),
          ],
        ),
      ),
    );
  }

  Widget _buildEmailField() {
    return TextFormField(
      controller: _emailController,
      focusNode: _emailFocusNode,
      showCursor: false,
      decoration: InputDecoration(
        hintText: _isEmailHintVisible ? 'Email ID' : null,
        hintStyle: TextStyle(
          fontFamily: 'Roboto',
          fontWeight: FontWeight.w400,
          fontSize: Dimensions.fontSize(context, 16),
          height: Dimensions.fontSize(context, 1.33),
          letterSpacing: 0.4,
          color: const Color(0xFF000000),
        ),
        border: UnderlineInputBorder(
          borderSide: BorderSide(
            color: const Color(0xFFA3A3A5),
            width: 2.5,
          ),
        ),
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your email';
        }
        if (!value.contains('@') || !value.contains('.')) {
          return 'Enter a valid email address';
        }
        return null;
      },
    );
  }

  Widget _buildPasswordField() {
    return TextFormField(
      controller: _passwordController,
      focusNode: _passwordFocusNode,
      showCursor: false,
      obscureText: _obscurePassword,
      decoration: InputDecoration(
        hintText: _isPasswordHintVisible ? 'Password' : null,
        hintStyle: TextStyle(
          fontFamily: 'Roboto',
          fontWeight: FontWeight.w400,
          fontSize: Dimensions.fontSize(context, 16),
          height: Dimensions.fontSize(context, 1.33),
          letterSpacing: 0.4,
          color: const Color(0xFF000000),
        ),
        border: UnderlineInputBorder(
          borderSide: BorderSide(
            color: const Color(0xFFA3A3A5),
            width: 2.5,
          ),
        ),
        focusedBorder: const UnderlineInputBorder(
          borderSide: BorderSide(color: Color(0xFF4680FE), width: 2.5),
        ),
        suffixIcon: IconButton(
          icon: Icon(
            _obscurePassword ? Icons.visibility_off : Icons.visibility,
            color: Colors.grey,
          ),
          onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
        ),
      ),
      validator: (value) {
        if (value == null || value.isEmpty) {
          return 'Please enter your password';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters';
        }
        return null;
      },
    );
  }

  Widget _buildLoginButton() {
    return ElevatedButton(
      onPressed: _isLoading ? null : _loginUser,
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF4680FE),
        padding: EdgeInsets.symmetric(
          horizontal: Dimensions.fontSize(context, 100),
          vertical: Dimensions.fontSize(context, 15),
        ),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(30),
        ),
      ),
      child: _isLoading
          ? const CircularProgressIndicator(color: Colors.white)
          : Text(
              'Login',
              style: TextStyle(
                fontFamily: 'Poppins',
                fontSize: Dimensions.fontSize(context, 21),
                fontWeight: FontWeight.w500,
                color: Colors.white,
              ),
            ),
    );
  }

  Widget _buildSignUpPrompt() {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          'New User? ',
          style: TextStyle(
            fontFamily: 'Roboto',
            fontWeight: FontWeight.w400,
            fontSize: Dimensions.fontSize(context, 14),
            letterSpacing: 0.4,
            color: const Color(0xFFA29595),
          ),
        ),
        TextButton(
          onPressed: () => Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const SignUpScreen()),
          ),
          child: Text(
            'Sign Up Here',
            style: TextStyle(
              fontFamily: 'Roboto',
              fontWeight: FontWeight.w400,
              fontSize: Dimensions.fontSize(context, 14),
              letterSpacing: 0.4,
              color: const Color(0xFF4680FE),
              decoration: TextDecoration.underline,
              decorationColor: const Color(0xFF4680FE),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildBottomSignUpPrompt() {
    return Column(
      children: [
        SizedBox(height: Dimensions.fontSize(context,20)),
        _buildSignUpPrompt(),
      ],
    );
  }
}