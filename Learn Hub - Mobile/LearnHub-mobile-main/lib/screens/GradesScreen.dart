// // import 'package:flutter/material.dart';

// // import '../dimensions.dart';

// // class GradesScreen extends StatefulWidget {
// //   final int selectedIndex;
// //   final Function(int, {bool navigateToGrades}) onItemTapped;

// //   // const MyCertificateList({
// //   //   super.key,
// //   //   required this.selectedIndex,
// //   //   required this.onItemTapped,
// //   // });
// //   const GradesScreen({super.key,
// //    required this.selectedIndex, 
// //    required this.onItemTapped});

// //   @override
// //   State<GradesScreen> createState() => _GradesScreenState();
// // }

// // class _GradesScreenState extends State<GradesScreen> {
// //   @override
// //   Widget build(BuildContext context) {
// //     return Scaffold(
// //       backgroundColor: Colors.white,
// //       appBar: AppBar(
// //         // leading: IconButton(
// //         //   icon: Icon(Icons.arrow_back_ios_new_rounded),
// //         //   onPressed: () {}//=> widget.onItemTapped(3), // Go back to Profile Page
// //         // ),
// //         // title: Center(
// //         //   child:  Row(
// //         //     children: [
// //         //       Icon(Icons.badge_rounded, color: Colors.black),
// //         //       SizedBox(width: 8),
// //         //       Text(
// //         //         "Grade",
// //         //         style: TextStyle(color: Colors.blue),
// //         //       ),
// //         //     ],
// //         //   ),
// //         // ),
        
// //         // // title: const Text("Grade", style: TextStyle(color: Colors.blue)),
// //         // backgroundColor: Colors.white,
// //         // // leading: const BackButton(color: Colors.black),
// //         // // leading: Icon(Icons.arrow_back_ios_rounded),
// //         // elevation: 0,
// //         title: Row(
// //           children: [
// //             SizedBox(width: Dimensions.fontSize(context, 75)),
// //             Icon(Icons.badge_rounded, color: Colors.black),
// //             SizedBox(width: Dimensions.fontSize(context, 8)),
// //             Text(
// //               "Grade",
// //               style: TextStyle(
// //                 color: Color(0xFF4680FE),
// //                 fontSize: Dimensions.fontSize(context, 24),
// //                 fontWeight: FontWeight.w600,
// //                 fontFamily: 'Poppins',
// //               ),
// //             ),
// //           ],
// //         ),
// //         leading: IconButton(
// //           icon: Icon(Icons.arrow_back_ios_new_rounded),
// //           onPressed: () => widget.onItemTapped(3), // Go back to Profile Page
// //         )
// //       ),
// //       body: ListView(
// //         padding: const EdgeInsets.all(8),
// //         children: [
// //           GradeCard(
// //             courseName: 'Flutter',
// //             assignmentPercent: 0.05,
// //             testPercent: 0.8,
// //             quizPercent: 0.1,
// //             attendancePercent: 0.05,
// //             totalPercent: 100,
// //             result: 'PASS',
// //             resultColor: Colors.green,
// //             resultIcon: Icons.thumb_up_alt_rounded,
// //             imagePath: 'assets/java2.jpg',
// //           ),
// //           SizedBox(height: 12),
// //           GradeCard(
// //             courseName: "Java Full Stack",
// //             assignmentPercent: 0.05,
// //             testPercent: 0.40,
// //             quizPercent: 0.0,
// //             attendancePercent: 0.0,
// //             totalPercent: 45,
// //             result: "FAIL",
// //             resultColor: Colors.red,
// //             resultIcon: Icons.thumb_down_alt_rounded,
// //             imagePath: 'assets/java2.jpg',
// //           ),
// //         ],
// //       ),
// //     );
// //   }
// // }

// // class GradeCard extends StatelessWidget {
// //   final String courseName;
// //   final double assignmentPercent;
// //   final double testPercent;
// //   final double quizPercent;
// //   final double attendancePercent;
// //   final int totalPercent;
// //   final String result;
// //   final Color resultColor;
// //   final IconData resultIcon;
// //   final String imagePath;

// //   const GradeCard({
// //     super.key,
// //     required this.courseName,
// //     required this.assignmentPercent,
// //     required this.testPercent,
// //     required this.quizPercent,
// //     required this.attendancePercent,
// //     required this.totalPercent,
// //     required this.result,
// //     required this.resultColor,
// //     required this.resultIcon,
// //     required this.imagePath,
// //   });

// //   Widget _buildProgressRow(String label, double progress) {
// //     Color progressColor = progress == 0 ? Colors.red : Colors.lightGreen;
// //     double adjustedProgress =
// //         progress == 0 ? 0.01 : progress; // For slight bar visibility

// //     return Padding(
// //       padding: const EdgeInsets.symmetric(vertical: 2),
// //       child: Row(
// //         children: [
// //           SizedBox(
// //             width: 80,
// //             child: Text(label, style: const TextStyle(fontSize: 12)),
// //           ),
// //           Expanded(
// //             child: LinearProgressIndicator(
// //               value: adjustedProgress,
// //               minHeight: 8,
// //               backgroundColor: Colors.grey[300],
// //               color: progressColor,
// //               borderRadius: BorderRadius.circular(5),
// //             ),
// //           ),
// //           const SizedBox(width: 8),
// //           Text(
// //             '${(progress * 100).toInt()}%',
// //             style: const TextStyle(fontSize: 12),
// //           ),
// //         ],
// //       ),
// //     );
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     return Card(
// //       color: Colors.white,
// //       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
// //       elevation: 4,
// //       // leading: Image.asset('assets/java_logo.png', height: 60), // Replace with actual image
// //       // child: Padding(
// //       //   padding: const EdgeInsets.all(12),
// //       //   // child: Row(
// //       //   //   crossAxisAlignment: CrossAxisAlignment.center,
// //       //   //   children: [
// //       //   //     // Image section
// //       //   //     Container(
// //       //   //       height: 100,
// //       //   //       width: 100,
// //       //   //       decoration: BoxDecoration(
// //       //   //         borderRadius: BorderRadius.circular(8),
// //       //   //         image: DecorationImage(
// //       //   //           image: AssetImage(imagePath),
// //       //   //           fit: BoxFit.cover,
// //       //   //         ),
// //       //   //       ),
// //       //   //     ),
// //       //   child: Row(
// //       //     children: [
// //       //       // Course Image with glow
// //       //       Container(
// //       //         height: 100,
// //       //         width: 100,
// //       //         decoration: BoxDecoration(
// //       //           shape: BoxShape.circle,
// //       //           boxShadow: [
// //       //             BoxShadow(
// //       //               color: Colors.blue.withOpacity(0.4),
// //       //               blurRadius: 12,
// //       //               spreadRadius: 2,
// //       //             ),
// //       //           ],
// //       //         ),
// //       //         child: ClipRRect(
// //       //           child: Image.asset(
// //       //             imagePath,
// //       //             fit: BoxFit.cover,
// //       //           ),
// //       //         ),
// //       //       ),
// //       margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
// //     child: SizedBox(
// //       height: 120,
// //       child: Row(
// //         children: [
// //           // 👉 Image that fills the card height
// //           ClipRRect(
// //             borderRadius: const BorderRadius.only(
// //               topLeft: Radius.circular(16),
// //               bottomLeft: Radius.circular(16),
// //             ),
// //             child: Image.asset(
// //               imagePath,
// //               width: 100,
// //               height: double.infinity,
// //               fit: BoxFit.cover,
// //             ),
// //           ),
// //             const SizedBox(width: 12),
// //             // Course + Progress section
// //             Expanded(
// //               child: Column(
// //                 crossAxisAlignment: CrossAxisAlignment.start,
// //                 children: [
// //                   Text(
// //                     courseName,
// //                     style: const TextStyle(
// //                       fontWeight: FontWeight.bold,
// //                       fontSize: 16,
// //                     ),
// //                   ),
// //                   const SizedBox(height: 8),
// //                   _buildProgressRow("Assignment", assignmentPercent),
// //                   _buildProgressRow("Test", testPercent),
// //                   _buildProgressRow("Quiz", quizPercent),
// //                   _buildProgressRow("Attendance", attendancePercent),
// //                 ],
// //               ),
// //             ),
// //             const SizedBox(width: 10),
// //             // Result section
// //             Column(
// //               mainAxisAlignment: MainAxisAlignment.center,
// //               children: [
// //                 const Text(
// //                   "RESULT",
// //                   style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
// //                 ),
// //                 const SizedBox(height: 4),
// //                 Text(
// //                   result,
// //                   style: TextStyle(
// //                     fontSize: 12,
// //                     fontWeight: FontWeight.bold,
// //                     color: resultColor,
// //                   ),
// //                 ),
// //                 const SizedBox(height: 10),
// //                 Row(
// //                   children: [
// //                     Text(
// //                       '$totalPercent%',
// //                       style: const TextStyle(
// //                         fontSize: 12,
// //                         fontWeight: FontWeight.bold,
// //                       ),
// //                     ),
// //                   SizedBox(width: 5),
// //                 Icon(
// //                   resultIcon,
// //                   color: resultColor,
// //                   size: 14,
// //                 ),
// //                 ],
// //                 ),
// //               ],
// //             ),
// //             SizedBox(width: 10),
// //           ],
// //         ),
// //       ),
// //     );
// //   }
// // }

// import 'package:flutter/material.dart';
// import 'package:flutter_secure_storage/flutter_secure_storage.dart';
// import 'package:http/http.dart' as http;
// import 'dart:convert';

// import '../url.dart';

// // Dummy Dimensions helper – Replace with your actual implementation
// class Dimensions {
//   static double fontSize(BuildContext context, double size) => size;
// }

// class GradesScreen extends StatefulWidget {
//   final int selectedIndex;
//   final Function(int, {bool navigateToGrades}) onItemTapped;

//   const GradesScreen({
//     super.key,
//     required this.selectedIndex,
//     required this.onItemTapped,
//   });

//   @override
//   State<GradesScreen> createState() => _GradesScreenState();
// }

// class _GradesScreenState extends State<GradesScreen> {
//   final storage = FlutterSecureStorage();
//   List<GradeDto> grades = [];
//   bool isLoading = true;

//   @override
//   void initState() {
//     super.initState();
//     fetchGrades();
//   }

//   Future<void> fetchGrades() async {
//     // try {
//       final token = await storage.read(key: 'token');
//       if (token == null) return;

//     try {
//       final response = await http.get(
//         Uri.parse('$baseUrl/get/Grade'),

//         headers: {'Authorization': token},
//       );
//       // final response = await http.get(
//       //   Uri.parse('$baseUrl/get/Grade'), // Replace with actual URL
//       //   headers: {'Authorization': token ?? ''},
//       // );

//       if (response.statusCode == 200) {
//         final data = json.decode(response.body);
//         final gradeList = data['grades'] as List;
//         setState(() {
//           grades = gradeList.map((json) => GradeDto.fromJson(json)).toList();
//           isLoading = false;
//         });
//       } else {
//         setState(() => isLoading = false);
//         print("Error: ${response.statusCode} - ${response.body}");
//       }
//     } catch (e) {
//       setState(() => isLoading = false);
//       print("Exception: $e");
//     }
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: Colors.white,
//       appBar: AppBar(
//         title: Row(
//           children: [
//             SizedBox(width: Dimensions.fontSize(context, 75)),
//             Icon(Icons.badge_rounded, color: Colors.black),
//             SizedBox(width: Dimensions.fontSize(context, 8)),
//             Text(
//               "Grade",
//               style: TextStyle(
//                 color: Color(0xFF4680FE),
//                 fontSize: Dimensions.fontSize(context, 24),
//                 fontWeight: FontWeight.w600,
//                 fontFamily: 'Poppins',
//               ),
//             ),
//           ],
//         ),
//         leading: IconButton(
//           icon: Icon(Icons.arrow_back_ios_new_rounded),
//           onPressed: () => widget.onItemTapped(3),
//         ),
//       ),
//       body: isLoading
//           ? Center(child: CircularProgressIndicator())
//           : ListView.builder(
//               padding: const EdgeInsets.all(8),
//               itemCount: grades.length,
//               itemBuilder: (context, index) {
//                 final grade = grades[index];
//                 return GradeCard(
//                   courseName: grade.courseName,
//                   assignmentPercent: grade.assignmentPercent,
//                   testPercent: grade.testPercent,
//                   quizPercent: grade.quizPercent,
//                   attendancePercent: grade.attendancePercent,
//                   totalPercent: grade.totalPercent,
//                   result: grade.result,
//                   resultColor:
//                       grade.result == "PASS" ? Colors.green : Colors.red,
//                   resultIcon: grade.result == "PASS"
//                       ? Icons.thumb_up_alt_rounded
//                       : Icons.thumb_down_alt_rounded,
//                   imagePath: 'assets/java2.jpg',
//                 );
//               },
//             ),
//     );
//   }
// }

// // Grade DTO model
// class GradeDto {
//   final String courseName;
//   final double assignmentPercent;
//   final double testPercent;
//   final double quizPercent;
//   final double attendancePercent;
//   final int totalPercent;
//   final String result;

//   GradeDto({
//     required this.courseName,
//     required this.assignmentPercent,
//     required this.testPercent,
//     required this.quizPercent,
//     required this.attendancePercent,
//     required this.totalPercent,
//     required this.result,
//   });

//   factory GradeDto.fromJson(Map<String, dynamic> json) {
//     return GradeDto(
//       courseName: json['courseName'] ?? '',
//       assignmentPercent: (json['assignmentPercent'] ?? 0).toDouble(),
//       testPercent: (json['testPercent'] ?? 0).toDouble(),
//       quizPercent: (json['quizPercent'] ?? 0).toDouble(),
//       attendancePercent: (json['attendancePercent'] ?? 0).toDouble(),
//       totalPercent: (json['totalPercent'] ?? 0).toInt(),
//       result: json['result'] ?? '',
//     );
//   }
// }

// // GradeCard widget
// class GradeCard extends StatelessWidget {
//   final String courseName;
//   final double assignmentPercent;
//   final double testPercent;
//   final double quizPercent;
//   final double attendancePercent;
//   final int totalPercent;
//   final String result;
//   final Color resultColor;
//   final IconData resultIcon;
//   final String imagePath;

//   const GradeCard({
//     super.key,
//     required this.courseName,
//     required this.assignmentPercent,
//     required this.testPercent,
//     required this.quizPercent,
//     required this.attendancePercent,
//     required this.totalPercent,
//     required this.result,
//     required this.resultColor,
//     required this.resultIcon,
//     required this.imagePath,
//   });

//   Widget _buildProgressRow(String label, double progress) {
//     Color progressColor = progress == 0 ? Colors.red : Colors.lightGreen;
//     double adjustedProgress = progress == 0 ? 0.01 : progress;

//     return Padding(
//       padding: const EdgeInsets.symmetric(vertical: 2),
//       child: Row(
//         children: [
//           SizedBox(width: 80, child: Text(label, style: TextStyle(fontSize: 12))),
//           Expanded(
//             child: LinearProgressIndicator(
//               value: adjustedProgress,
//               minHeight: 8,
//               backgroundColor: Colors.grey[300],
//               color: progressColor,
//               borderRadius: BorderRadius.circular(5),
//             ),
//           ),
//           SizedBox(width: 8),
//           Text('${(progress * 100).toInt()}%', style: TextStyle(fontSize: 12)),
//         ],
//       ),
//     );
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Card(
//       color: Colors.white,
//       shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
//       elevation: 4,
//       margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
//       child: SizedBox(
//         height: 120,
//         child: Row(
//           children: [
//             ClipRRect(
//               borderRadius: const BorderRadius.only(
//                 topLeft: Radius.circular(16),
//                 bottomLeft: Radius.circular(16),
//               ),
//               child: Image.asset(
//                 imagePath,
//                 width: 100,
//                 height: double.infinity,
//                 fit: BoxFit.cover,
//               ),
//             ),
//             SizedBox(width: 12),
//             Expanded(
//               child: Column(
//                 crossAxisAlignment: CrossAxisAlignment.start,
//                 children: [
//                   Text(courseName,
//                       style:
//                           TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
//                   SizedBox(height: 8),
//                   _buildProgressRow("Assignment", assignmentPercent),
//                   _buildProgressRow("Test", testPercent),
//                   _buildProgressRow("Quiz", quizPercent),
//                   _buildProgressRow("Attendance", attendancePercent),
//                 ],
//               ),
//             ),
//             SizedBox(width: 10),
//             Column(
//               mainAxisAlignment: MainAxisAlignment.center,
//               children: [
//                 Text("RESULT",
//                     style:
//                         TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
//                 SizedBox(height: 4),
//                 Text(result,
//                     style: TextStyle(
//                         fontSize: 12,
//                         fontWeight: FontWeight.bold,
//                         color: resultColor)),
//                 SizedBox(height: 10),
//                 Row(
//                   children: [
//                     Text('$totalPercent%',
//                         style: TextStyle(
//                             fontSize: 12, fontWeight: FontWeight.bold)),
//                     SizedBox(width: 5),
//                     Icon(resultIcon, color: resultColor, size: 14),
//                   ],
//                 ),
//               ],
//             ),
//             SizedBox(width: 10),
//           ],
//         ),
//       ),
//     );
//   }
// }
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

import '../url.dart';

class GradesScreen extends StatefulWidget {
  final int selectedIndex;
  final Function(int, {bool navigateToGrades}) onItemTapped;

  const GradesScreen({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  State<GradesScreen> createState() => _GradesScreenState();
}

class Grade {
  final String courseName;
  final double assignmentPercent;
  final double testPercent;
  final double quizPercent;
  final double attendancePercent;
  final int totalPercent;
  final String result;

  Grade({
    required this.courseName,
    required this.assignmentPercent,
    required this.testPercent,
    required this.quizPercent,
    required this.attendancePercent,
    required this.totalPercent,
    required this.result,
  });
factory Grade.fromJson(Map<String, dynamic> json) {
  return Grade(
    courseName: json['batchName'] ?? 'Unknown',
    assignmentPercent: (json['weightedAssignment']?.toDouble() ?? 0.0) / 100,
    testPercent: (json['weightedTest']?.toDouble() ?? 0.0) / 100,
    quizPercent: (json['weightedQuiz']?.toDouble() ?? 0.0) / 100,
    attendancePercent: (json['weightedAttendance']?.toDouble() ?? 0.0) / 100,
    totalPercent: (json['totalScore']?.toDouble() ?? 0.0).toInt(),
    result: json['result'] ?? 'FAIL',
  );
}

  // factory Grade.fromJson(Map<String, dynamic> json) {
  //   return Grade(
  //     courseName: json['batchTitle'],
  //     assignmentPercent: json['assignmentPercent']?.toDouble() ?? 0.0,
  //     testPercent: json['testPercent']?.toDouble() ?? 0.0,
  //     quizPercent: json['quizPercent']?.toDouble() ?? 0.0,
  //     attendancePercent: json['attendancePercent']?.toDouble() ?? 0.0,
  //     totalPercent: json['totalPercent']?.toInt() ?? 0,
  //     result: json['result'] ?? 'FAIL',
  //   );
  // }
}

class _GradesScreenState extends State<GradesScreen> {
  final List<Grade> grades = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchGrades();
  }

  Future<void> fetchGrades() async {
    const storage = FlutterSecureStorage();
     String? token = await storage.read(key: "token");
     if (token == null) return;

    final response = await http.get(
      Uri.parse("$baseUrl/get/Grade"),
      headers: {
        // 'Content-Type': 'application/json',
        'Authorization': token,
      },
    );

    if (response.statusCode == 200) {
      final Map<String, dynamic> data = json.decode(response.body);
      final List<dynamic> gradeList = data['grades'];

      setState(() {
        grades.clear();
        grades.addAll(gradeList.map((e) => Grade.fromJson(e)));
        isLoading = false;
      });
    } else {
      print("Error: ${response.statusCode} - ${response.body}");
      setState(() => isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.badge_rounded, color: Colors.black),
            const SizedBox(width: 8),
            const Text("Grade", style: TextStyle(color: Color(0xFF4680FE))),
          ],
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => widget.onItemTapped(3),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: isLoading 
          ? const Center(child: CircularProgressIndicator())
          : grades.isEmpty
              ? const Center(child: Text("No grades available"))
              : ListView.builder(
                  itemCount: grades.length,
                  padding: const EdgeInsets.all(8),
                  itemBuilder: (context, index) {
                    final grade = grades[index];
                    return GradeCard(
                      courseName: grade.courseName,
                      assignmentPercent: grade.assignmentPercent,
                      testPercent: grade.testPercent,
                      quizPercent: grade.quizPercent,
                      attendancePercent: grade.attendancePercent,
                      totalPercent: grade.totalPercent,
                      result: grade.result,
                      resultColor:
                          grade.result == 'PASS' ? Colors.green : Colors.red,
                      resultIcon: grade.result == 'PASS'
                          ? Icons.thumb_up_alt_rounded
                          : Icons.thumb_down_alt_rounded,
                      imagePath: 'assets/java2.jpg',
                    );
                  },
                ),
    );
  }
}

class GradeCard extends StatelessWidget {
  final String courseName;
  final double assignmentPercent;
  final double testPercent;
  final double quizPercent;
  final double attendancePercent;
  final int totalPercent;
  final String result;
  final Color resultColor;
  final IconData resultIcon;
  final String imagePath;

  const GradeCard({
    super.key,
    required this.courseName,
    required this.assignmentPercent,
    required this.testPercent,
    required this.quizPercent,
    required this.attendancePercent,
    required this.totalPercent,
    required this.result,
    required this.resultColor,
    required this.resultIcon,
    required this.imagePath,
  });

  Widget _buildProgressRow(String label, double progress) {
    Color progressColor = progress == 0 ? Colors.red : Colors.lightGreen;
    double adjustedProgress = progress == 0 ? 0.01 : progress;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        children: [
          SizedBox(width: 80, child: Text(label, style: const TextStyle(fontSize: 12))),
          Expanded(
            child: LinearProgressIndicator(
              value: adjustedProgress,
              minHeight: 8,
              backgroundColor: Colors.grey[300],
              color: progressColor,
              borderRadius: BorderRadius.circular(5),
            ),
          ),
          const SizedBox(width: 8),
          Text('${(progress * 100).toInt()}%', style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      elevation: 4,
      margin: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
      child: SizedBox(
        height: 120,
        child: Row(
          children: [
            ClipRRect(
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                bottomLeft: Radius.circular(16),
              ),
              child: Image.asset(
                imagePath,
                width: 100,
                height: double.infinity,
                fit: BoxFit.cover,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(courseName,
                      style: const TextStyle(
                          fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 8),
                  _buildProgressRow("Assignment", assignmentPercent),
                  _buildProgressRow("Test", testPercent),
                  _buildProgressRow("Quiz", quizPercent),
                  _buildProgressRow("Attendance", attendancePercent),
                ],
              ),
            ),
            const SizedBox(width: 10),
            Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text("RESULT", style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(result,
                    style: TextStyle(
                        fontSize: 12, fontWeight: FontWeight.bold, color: resultColor)),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Text('$totalPercent%',
                        style: const TextStyle(
                            fontSize: 12, fontWeight: FontWeight.bold)),
                    const SizedBox(width: 5),
                    Icon(resultIcon, color: resultColor, size: 14),
                  ],
                ),
              ],
            ),
            const SizedBox(width: 10),
          ],
        ),
      ),
    );
  }
}
