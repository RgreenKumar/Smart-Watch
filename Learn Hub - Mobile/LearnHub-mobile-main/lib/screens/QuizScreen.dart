// ignore_for_file: library_private_types_in_public_api, use_full_hex_values_for_flutter_colors

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

import '../dimensions.dart';
import '../url.dart';

class TestInstructionsScreen extends StatefulWidget {
  final String courseId;

  const TestInstructionsScreen({super.key, required this.courseId});
  //const TestInstructionsScreen({super.key, required String courseId});

  @override
  _TestInstructionsScreenState createState() => _TestInstructionsScreenState();
}

class _TestInstructionsScreenState extends State<TestInstructionsScreen> {
  bool _isChecked = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      // bottomNavigationBar: BottomNavBar(),
      body: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            SizedBox(height: Dimensions.fontSize(context, 20)),
            Center(child: Icon(Icons.warning_rounded, size: Dimensions.iconSize(context, 80), color: Color(0xFF4680FE))),
            Center(child: Text("Notice", style: TextStyle(fontSize: Dimensions.fontSize(context, 18), fontWeight: FontWeight.bold, color: Color(0xFF4680FE)))),
            SizedBox(height: Dimensions.fontSize(context, 10)),
            Center(child: Text("Test Instructions", style: TextStyle(fontSize: Dimensions.fontSize(context, 22), fontWeight: FontWeight.bold,decoration: TextDecoration.underline))),
            SizedBox(height: Dimensions.fontSize(context, 30)),
            Expanded(
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text("Welcome to the online test. Please read the following information carefully before proceeding.",
                        style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    Text("Instruction:", style: TextStyle(fontSize: Dimensions.fontSize(context, 18), fontWeight: FontWeight.bold)),
                    SizedBox(height: Dimensions.fontSize(context, 5)),
                    Text("- Ensure you have a stable internet connection throughout the duration of the test.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- Use a Desktop or Laptop with a compatible browser (Google Chrome, Mozila Firefox, Safari, or Microsoft Edge).", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- Disable any pop-up blockers and enable JavaScript is enabled in your Browser Settings.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    Text("Test Environment:", style: TextStyle(fontSize: Dimensions.fontSize(context, 18), fontWeight: FontWeight.bold)),
                    SizedBox(height: Dimensions.fontSize(context, 5)),
                    Text("- Find a quiet and comfortable place to take the test.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- Avoid distractions and interruptions during the test duration.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- Make sure your surroundings are well-lighted and your screen is easily readable.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    Text("Test Format:", style: TextStyle(fontSize: Dimensions.fontSize(context, 18), fontWeight: FontWeight.bold)),
                    SizedBox(height: Dimensions.fontSize(context, 5)),
                    Text("- The Test consist of Multiple-choice questions.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- This test allows 2 attempt(s) only.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- Each question carries one mark.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- Read the question carefully before selecting your answer.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- To pass this test you have to score atleast 50 % to get the certificate.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    Text("Submission:", style: TextStyle(fontSize: Dimensions.fontSize(context, 18), fontWeight: FontWeight.bold)),
                    SizedBox(height: Dimensions.fontSize(context, 5)),
                    Text("- Once you have answered all the questions, click on the 'Submit' button to submit your test.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    Text("- You will not be able to make any changes after the test is submitted.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    // Text("- Make sure your surroundings are well-lighted and your screen is easily readable.", style: TextStyle(fontSize: 16)),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    Text("By proceeding, you acknowledge that you have read and understood the instructions above.", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)), textAlign: TextAlign.justify),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    Center(child: Text("Good Luck !", style: TextStyle(fontSize: Dimensions.fontSize(context, 16)))),

SizedBox(height: Dimensions.fontSize(context, 10)),
                    Row(
                      children: [
                        Checkbox(
                          value: _isChecked,
                          activeColor: Color(0xFF4680FE),
                          onChanged: (val) {
                            setState(() {
                              _isChecked = val!;
                            });
                          },
                        ),
                        Text("I have read the instructions", style: TextStyle(fontSize: Dimensions.fontSize(context, 16))),
                      ],
                    ),
                    Center(
                      child: ElevatedButton(
                        onPressed: _isChecked
                            ? () {
                                Navigator.push(context, MaterialPageRoute(builder: (context) => QuizScreen(courseId: widget.courseId)));
                              }
                            : null,
                            style: ButtonStyle(
                          backgroundColor: WidgetStateProperty.resolveWith<Color?>(
                            (Set<WidgetState> states) {
                              if (states.contains(WidgetState.disabled)) {
                                return Colors.grey;
                              }
                              return Color(0xFF4680FE);
                            },
                            
                          ),
                        shape: WidgetStateProperty.all<RoundedRectangleBorder>(
      RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(4),
      ),
    ),
  ),
                        child: Text("Start", style: TextStyle(color: Colors.white, fontSize: Dimensions.fontSize(context, 16)),),
                      ),
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
}

class QuizScreen extends StatefulWidget {
  final String courseId;

  const QuizScreen({super.key, required this.courseId});

  @override
  _QuizScreenState createState() => _QuizScreenState();
}

class _QuizScreenState extends State<QuizScreen> {
  final storage = const FlutterSecureStorage();
  int _currentIndex = 0;
  List<Map<String, dynamic>> questions = [];
  List<int?> selectedAnswers = [];
  bool isLoading = true;
  String errorMessage = '';
  int attemptCount = 0;
  int maxAttempts = 0;
  double passPercentage = 0.0;
  bool isSubmitting = false;

  @override
  void initState() {
    super.initState();
    _fetchTestQuestions();
  }

Future<void> _fetchTestQuestions() async {
  final url = "$baseUrl/test/getTestByCourseId/${widget.courseId}";
  final String? token = await storage.read(key: "token");
  
  if (token == null) {
    setState(() {
      isLoading = false;
      errorMessage = "Authentication required. Please log in again.";
    });
    return;
  }

  try {
    final response = await http.get(
      Uri.parse(url),
      headers: {"Authorization": token},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final testData = data['test'];
      
      setState(() {
        questions = List<Map<String, dynamic>>.from(testData['questions']);
        selectedAnswers = List.filled(questions.length, null);
        attemptCount = data['attemptCount'] ?? 0;
        maxAttempts = testData['noofattempt'] ?? 0;
        passPercentage = testData['passPercentage']?.toDouble() ?? 50.0;
        isLoading = false;
      });
    } else {
      setState(() {
        isLoading = false;
        errorMessage = "Test not available";
      });
    }
  } catch (e) {
    setState(() {
      isLoading = false;
      errorMessage = "Error fetching test: ${e.toString()}";
    });
  }
}
  void _nextQuestion() {
    setState(() {
      if (_currentIndex < questions.length - 1) {
        _currentIndex++;
      }
    });
  }

  void _prevQuestion() {
    setState(() {
      if (_currentIndex > 0) {
        _currentIndex--;
      }
    });
  }

  Future<void> _submitTest() async {
    setState(() {
      isSubmitting = true;
    });

    final String? token = await storage.read(key: "token");
    if (token == null) {
      setState(() {
        isSubmitting = false;
        errorMessage = "Authentication required. Please log in again.";
      });
      return;
    }

    // Prepare answers in the format expected by the backend
    List<Map<String, dynamic>> answers = [];
    for (int i = 0; i < questions.length; i++) {
      if (selectedAnswers[i] != null) {
        answers.add({
          "questionId": questions[i]['questionId'],
          "selectedAnswer": questions[i]['option${selectedAnswers[i]! + 1}'],
        });
      }
    }

    try {
      final response = await http.post(
        Uri.parse("$baseUrl/test/calculateMarks/${widget.courseId}"),
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: jsonEncode(answers),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        _showResultDialog(
          message: data['message'],
          result: data['result'],
          score: double.parse(data['message'].split(' ').last.replaceAll('%', '')),
        );
      } else {
        final errorData = jsonDecode(response.body);
        throw Exception(errorData['message'] ?? 'Failed to submit test');
      }
    } catch (e) {
      setState(() {
        errorMessage = e.toString();
      });
      debugPrint("Error submitting test: ${e.toString()}");
    } finally {
      setState(() {
        isSubmitting = false;
      });
    }
  }
void _showResultDialog({
  required String message,
  required String result,
  required double score,
}) {
  showDialog(
    context: context,
    barrierDismissible: false,
    builder: (context) => Dialog(
      backgroundColor: Colors.white, // Set white background here
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white, // Additional white background
          borderRadius: BorderRadius.circular(16),
        ),
      child: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 24)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                Icon(
                  result == "pass" ? Icons.check_circle_outline_rounded : Icons.close_rounded,
                  size: Dimensions.fontSize(context, 45),
                  color: result == "pass" ? Colors.green : Colors.red,
                ),
              ],
            ),
            SizedBox(height: Dimensions.fontSize(context, 16)),
            Text(
              "Thanks for Attending the test",
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 20),
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 16)),
            Text(
              result == "pass" ? "Good you Passed the test" : "Better Luck Next Time",
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 18),
                color: result == "pass" ? Colors.green : Colors.red,//color: Colors.green, // Change to red if failed
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 24)),
            Text(
              "Score: ${score.toStringAsFixed(0)}",
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 20),
                fontWeight: FontWeight.bold,
                color: Colors.black,
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 32)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                Expanded(
                  child: ElevatedButton(
                    onPressed: () { Navigator.pop(context);Navigator.pop(context);Navigator.pop(context);},                    
                    style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF4680FE),
                        padding:
                            EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 12)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    child: Text("Done",style: TextStyle(
                                fontFamily: 'Poppins',
                                fontSize: Dimensions.fontSize(context, 21),
                                fontWeight: FontWeight.w500,
                                color: Colors.white,
                              ),),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
    ),
  );
}

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(child: CircularProgressIndicator()),
      );
    }

if (errorMessage.isNotEmpty) {
  return Scaffold(
    backgroundColor: Colors.white,
    body: Center(
      child: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              errorMessage,
              style: TextStyle(fontSize: Dimensions.fontSize(context, 16), color: Colors.red),
              textAlign: TextAlign.center,
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Color(0xFF4680FE),
                padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 30), vertical: 12),
              ),
              onPressed: () {
                Navigator.pop(context); // Go back to previous page
                Navigator.pop(context); 
              },
              child: Text(
                "Go Back",
                style: TextStyle(
                  color: Colors.white,
                  fontSize: Dimensions.fontSize(context, 16),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

    if (questions.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Text(
            "No questions available for this test.",
            style: TextStyle(fontSize: Dimensions.fontSize(context, 16)),
          ),
        ),
      );
    }

    if (attemptCount >= maxAttempts) {
      return Scaffold(
        backgroundColor: Colors.white,
        body: Center(
          child: Padding(
            padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
            child: Text(
              "You have exhausted all attempts for this test.",
              style: TextStyle(fontSize: Dimensions.fontSize(context, 16)),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      );
    }

    final currentQuestion = questions[_currentIndex];
    List<String> options = [
      currentQuestion['option1'],
      currentQuestion['option2'],
      currentQuestion['option3'],
      currentQuestion['option4'],
    ].where((option) => option != null).cast<String>().toList();

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Text("Test Attempt ${attemptCount + 1}/$maxAttempts"),
      ),
      body: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Card(
              color: Colors.white,
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
              child: Padding(
                padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      "${_currentIndex + 1}. ${currentQuestion['questionText']}",
                      style: TextStyle(fontSize: Dimensions.fontSize(context, 18), fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: Dimensions.fontSize(context, 20)),
                    Column(
                      children: List.generate(options.length, (index) {
                        return RadioListTile<int>(
                          title: Text(options[index]),
                          value: index,
                          groupValue: selectedAnswers[_currentIndex],
                          onChanged: (value) {
                            setState(() {
                              selectedAnswers[_currentIndex] = value;
                            });
                          },
                        );
                      }),
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.grey,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  onPressed: _currentIndex == 0 ? null : _prevQuestion,
                  icon: Icon(Icons.arrow_back_ios_rounded, color: Colors.white),
                  label: Text("Previous", style: TextStyle(color: Colors.white)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF45680FE),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  onPressed: _currentIndex == questions.length - 1
                      ? isSubmitting ? null : _submitTest
                      : _nextQuestion,
                  child: isSubmitting
                      ? CircularProgressIndicator(color: Colors.white)
                      : Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              _currentIndex == questions.length - 1 ? "Submit" : "Next",
                              style: TextStyle(color: Colors.white),
                            ),
                            if (_currentIndex != questions.length - 1) ...[
                              SizedBox(width: Dimensions.fontSize(context, 5)),
                              Icon(Icons.arrow_forward_ios_rounded, color: Colors.white),
                            ]
                          ],
                        ),
                ),
              ],
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                questions.length,
                (index) => Padding(
                  padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 5)),
                  child: Container(
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selectedAnswers[index] != null
                            ? Colors.green
                            : (_currentIndex == index
                                ? Color(0xFF45680FE)
                                : Colors.black),
                        width: Dimensions.fontSize(context, 2),
                      ),
                      color: selectedAnswers[index] != null
                          ? Colors.green
                          : (_currentIndex == index
                              ? Colors.transparent
                              : Colors.transparent),
                    ),
                    child: CircleAvatar(
                      radius: Dimensions.fontSize(context, 12),
                      backgroundColor: Colors.transparent,
                      child: Text(
                        "${index + 1}",
                        style: TextStyle(
                          color: selectedAnswers[index] != null
                              ? Colors.white
                              : (_currentIndex == index
                                  ? Color(0xFF45680FE)
                                  : Colors.black),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}