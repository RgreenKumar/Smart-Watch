// // // import 'package:flutter/material.dart';
// // // import 'package:learnhub/dimensions.dart';

// // // class AttendanceScreen extends StatefulWidget {
// // //   final int selectedIndex;
// // //   final Function(int, {bool navigateToAttendance}) onItemTapped;

// // //   const AttendanceScreen({super.key, required this.selectedIndex, required this.onItemTapped});

// // //   @override
// // //   State<AttendanceScreen> createState() => _AttendanceScreenState();
// // // }

// // // class _AttendanceScreenState extends State<AttendanceScreen> {
// // //   @override
// // //   Widget build(BuildContext context) {
// // //     return Scaffold(
// // //       backgroundColor: Colors.white,
// // //       appBar: AppBar(
// // //         // leading: IconButton(
// // //         //   icon: Icon(Icons.arrow_back_ios_new_rounded),
// // //         //   onPressed: () {}//=> widget.onItemTapped(3), // Go back to Profile Page
// // //         // ),
// // //         // title: Center(
// // //         //   child:  Row(
// // //         //     children: [
// // //         //       Icon(Icons.assignment_ind_rounded, color: Colors.black),
// // //         //       SizedBox(width: 8),
// // //         //       Text(
// // //         //         "Attendance",
// // //         //         style: TextStyle(color: Colors.blue),
// // //         //       ),
// // //         //     ],
// // //         //   ),
// // //         // ),
// // //          title: Row(
// // //           children: [
// // //             SizedBox(width: Dimensions.fontSize(context, 55)),
// // //             Icon(Icons.badge_rounded, color: Colors.black),
// // //             SizedBox(width: Dimensions.fontSize(context, 8)),
// // //             Text(
// // //               "Attendance",
// // //               style: TextStyle(
// // //                 color: Color(0xFF4680FE),
// // //                 fontSize: Dimensions.fontSize(context, 24),
// // //                 fontWeight: FontWeight.w600,
// // //                 fontFamily: 'Poppins',
// // //               ),
// // //             ),
// // //           ],
// // //         ),
// // //         leading: IconButton(
// // //           icon: Icon(Icons.arrow_back_ios_new_rounded),
// // //           onPressed: () => widget.onItemTapped(3), // Go back to Profile Page
// // //         ),
// // //         // title: const Text("Attendance",
// // //         //     style: TextStyle(color: Color(0xFF4680FE))),
// // //         backgroundColor: Colors.white,
// // //         // leading: Icon(Icons
// // //             // .arrow_back_ios_rounded), //const BackButton(color: Colors.black),
// // //         elevation: 0,
// // //       ),
      
// // //       body: Padding(
// // //         padding: EdgeInsets.only(top: Dimensions.fontSize(context, 36)),
// // //         child: DataTable(
// // //           dividerThickness: 1.5, // This sets the thickness of the border between rows
// // //           border: TableBorder(
// // //             horizontalInside: BorderSide(
// // //               color: Color(
// // //                   0xFF4680FE), // This sets the color of the border between rows
// // //               width: 1,
// // //             ),
// // //           ),
// // //           headingRowColor: WidgetStateProperty.all(Color(0xFF4680FE)),
// // //           headingTextStyle: TextStyle(color: Colors.white),
// // //           columns: const [
// // //             DataColumn(label: Center(child: Text("#"))),
// // //             DataColumn(label: Center(child: Text("SESSION"))),
// // //             DataColumn(label: Center(child: Text("     DATE"))),
// // //             DataColumn(label: Center(child: Text("ATTENDANCE"))),
// // //           ],
// // //           rows: const [
// // //             DataRow(cells: [
// // //               DataCell(Center(child: Text("1"))),
// // //               DataCell(Text("My Meeting")),
// // //               DataCell(Center(child: Text("2025-04-10"))),
// // //               DataCell(Center(child: Text("Present"))),
// // //             ]),
// // //             DataRow(cells: [
// // //               DataCell(Center(child: Text("2"))),
// // //               DataCell( Text("Meet")),
// // //               DataCell(Center(child: Text("2025-04-12"))),
// // //               DataCell(Center(child: Text("Present"))),
// // //             ]),
// // //             DataRow(cells: [
// // //               DataCell(Center(child: Text("3"))),
// // //               DataCell(Text("Course Meet")),
// // //               DataCell(Center(child: Text("2025-04-14"))),
// // //               DataCell(Center(child: Text("Absent"))),
// // //             ]),
// // //           ],
// // //         ),
// // //       ),
// // //     );
// // //   }
// // // }
// // import 'dart:convert';
// // import 'package:flutter/material.dart';
// // import 'package:flutter_secure_storage/flutter_secure_storage.dart';
// // import 'package:http/http.dart' as http;
// // import 'package:learnhub/dimensions.dart';

// // import '../url.dart';

// // class AttendanceScreen extends StatefulWidget {
// //   final int selectedIndex;
// //   final Function(int, {bool navigateToAttendance}) onItemTapped;

// //   const AttendanceScreen({super.key, required this.selectedIndex, required this.onItemTapped});

// //   @override
// //   State<AttendanceScreen> createState() => _AttendanceScreenState();
// // }

// // class _AttendanceScreenState extends State<AttendanceScreen> {
// //   final _storage = const FlutterSecureStorage();
// //   List<Map<String, dynamic>> _attendanceData = [];
// //   double _percentage = 0.0;
// //   bool _isLoading = true;

// //   @override
// //   void initState() {
// //     super.initState();
// //     _fetchAttendance();
// //   }

// //   Future<void> _fetchAttendance() async {
// //     const batchId = 1; // Replace with dynamic batchId if available
// //     // final token = await _storage.read(key: 'token');
// //     // String? token = await _storage.read(key: 'token');
// //     // final url = Uri.parse('$baseUrl/view/MyAttendance/$batchId?page=0&size=10');

// //     // try {
// //     //   final response = await http.get(url, 
// //     //   headers: {'Authorization': token},
// //     //   headers: {
// //     //     'Authorization': token,
// //     //   });
// //       String? token = await _storage.read(key: 'token');
// //     if (token == null) return;

// //     try {
// //       final response = await http.get(
// //         Uri.parse('$baseUrl/view/MyAttendance/$batchId?page=0&size=10'),

// //         headers: {'Authorization': token},
// //       );

// //       if (response.statusCode == 200) {
// //         final data = json.decode(response.body);
// //         final attendanceList = data['attendance']['content'] as List;
// //         final percentage = data['percentage'];

// //         setState(() {
// //           _attendanceData = attendanceList
// //               .asMap()
// //               .entries
// //               .map((entry) => {
// //                     "index": entry.key + 1,
// //                     "session": entry.value['sessionName'] ?? 'N/A',
// //                     "date": entry.value['date'] ?? 'N/A',
// //                     "status": entry.value['status'] ?? 'N/A',
// //                   })
// //               .toList();
// //           _percentage = percentage.toDouble();
// //           _isLoading = false;
// //         });
// //       } else {
// //         throw Exception('Failed to load attendance');
// //       }
// //     } catch (e) {
// //       print("Error: $e");
// //       setState(() {
// //         _isLoading = false;
// //       });
// //     }
// //   }

// //   @override
// //   Widget build(BuildContext context) {
// //     return Scaffold(
// //       backgroundColor: Colors.white,
// //       appBar: AppBar(
// //         title: Row(
// //           children: [
// //             SizedBox(width: Dimensions.fontSize(context, 55)),
// //             Icon(Icons.badge_rounded, color: Colors.black),
// //             SizedBox(width: Dimensions.fontSize(context, 8)),
// //             Text(
// //               "Attendance",
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
// //           onPressed: () => widget.onItemTapped(3),
// //         ),
// //         backgroundColor: Colors.white,
// //         elevation: 0,
// //       ),
// //       body: _isLoading
// //           ? Center(child: CircularProgressIndicator())
// //           : Padding(
// //               padding: EdgeInsets.only(top: Dimensions.fontSize(context, 36)),
// //               child: Column(
// //                 children: [
// //                   Text("Attendance: ${_percentage.toStringAsFixed(2)}%", style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
// //                   SizedBox(height: 10),
// //                   Expanded(
// //                     child: SingleChildScrollView(
// //                       scrollDirection: Axis.horizontal,
// //                       child: DataTable(
// //                         dividerThickness: 1.5,
// //                         border: TableBorder(
// //                           horizontalInside: BorderSide(color: Color(0xFF4680FE), width: 1),
// //                         ),
// //                         headingRowColor: WidgetStateProperty.all(Color(0xFF4680FE)),
// //                         headingTextStyle: TextStyle(color: Colors.white),
// //                         columns: const [
// //                           DataColumn(label: Center(child: Text("#"))),
// //                           DataColumn(label: Center(child: Text("SESSION"))),
// //                           DataColumn(label: Center(child: Text("     DATE"))),
// //                           DataColumn(label: Center(child: Text("ATTENDANCE"))),
// //                         ],
// //                         rows: _attendanceData
// //                             .map((data) => DataRow(cells: [
// //                                   DataCell(Center(child: Text(data["index"].toString()))),
// //                                   DataCell(Text(data["session"])),
// //                                   DataCell(Center(child: Text(data["date"]))),
// //                                   DataCell(Center(child: Text(data["status"]))),
// //                                 ]))
// //                             .toList(),
// //                       ),
// //                     ),
// //                   ),
// //                 ],
// //               ),
// //             ),
// //     );
// //   }
// // }
// import 'dart:convert';
// import 'package:flutter/material.dart';
// import 'package:flutter_secure_storage/flutter_secure_storage.dart';
// import 'package:http/http.dart' as http;
// import 'package:learnhub/dimensions.dart';
// import '../url.dart';

// class AttendanceScreen extends StatefulWidget {
//   final int selectedIndex;
//   final Function(int, {bool navigateToAttendance}) onItemTapped;

//   const AttendanceScreen({
//     super.key, 
//     required this.selectedIndex, 
//     required this.onItemTapped
//   });

//   @override
//   State<AttendanceScreen> createState() => _AttendanceScreenState();
// }

// class _AttendanceScreenState extends State<AttendanceScreen> {
//   final _storage = const FlutterSecureStorage();
//   List<Map<String, dynamic>> _attendanceData = [];
//   List<Map<String, dynamic>> _batches = [];
//   int? _selectedBatchId;
//   double _percentage = 0.0;
//   bool _isLoading = true;
//   int _currentPage = 0;
//   int _totalPages = 0;
//   int _itemsPerPage = 10;
//   int _totalElements = 0;

//   @override
//   void initState() {
//     super.initState();
//     _fetchBatches();
//   }

//   Future<void> _fetchBatches() async {
//     final token = await _storage.read(key: 'token');
//     final email = await _storage.read(key: 'email');
//     if (token == null || email == null) return;

//     try {
//       final response = await http.get(
//         Uri.parse('$baseUrl/view/batch/$email'),
//         headers: {'Authorization': token},
//       );

//       if (response.statusCode == 200) {
//         final data = json.decode(response.body) as List;
//         setState(() {
//           _batches = data.map((batch) => {
//             'id': batch['id'],
//             'name': batch['name'],
//             'type': batch['type'] ?? ''
//           }).toList();
          
//           if (_batches.isNotEmpty) {
//             _selectedBatchId = _batches[0]['id'];
//             _fetchAttendance();
//           } else {
//             _isLoading = false;
//           }
//         });
//       }
//     } catch (e) {
//       print("Error fetching batches: $e");
//       setState(() => _isLoading = false);
//     }
//   }

//   Future<void> _fetchAttendance() async {
//     if (_selectedBatchId == null) return;
    
//     setState(() => _isLoading = true);
//     final token = await _storage.read(key: 'token');
//     if (token == null) return;

//     try {
//       final response = await http.get(
//         Uri.parse('$baseUrl/view/MyAttendance/$_selectedBatchId?page=$_currentPage&size=$_itemsPerPage'),
//         headers: {'Authorization': token},
//       );

//       if (response.statusCode == 200) {
//         final data = json.decode(response.body);
//         final attendanceList = data['attendance']['content'] as List;
        
//         setState(() {
//           _attendanceData = attendanceList
//               .asMap()
//               .entries
//               .map((entry) => {
//                     "index": entry.key + 1 + (_currentPage * _itemsPerPage),
//                     "session": entry.value['topic'] ?? 'N/A',
//                     "date": entry.value['date'] ?? 'N/A',
//                     "status": entry.value['status'] ?? 'N/A',
//                   })
//               .toList();
          
//           _percentage = (data['percentage'] as num).toDouble();
//           _totalPages = data['attendance']['totalPages'];
//           _totalElements = data['attendance']['totalElements'];
//           _isLoading = false;
//         });
//       } else {
//         throw Exception('Failed to load attendance');
//       }
//     } catch (e) {
//       print("Error: $e");
//       setState(() => _isLoading = false);
//     }
//   }

//   void _handleBatchChange(int? newValue) {
//     if (newValue != null) {
//       setState(() {
//         _selectedBatchId = newValue;
//         _currentPage = 0;
//       });
//       _fetchAttendance();
//     }
//   }

//   void _handlePageChange(int newPage) {
//     if (newPage >= 0 && newPage < _totalPages) {
//       setState(() => _currentPage = newPage);
//       _fetchAttendance();
//     }
//   }

//   List<Widget> _buildPaginationButtons() {
//     List<Widget> buttons = [];
//     for (int i = 0; i < _totalPages; i++) {
//       buttons.add(
//         InkWell(
//           onTap: () => _handlePageChange(i),
//           child: Container(
//             padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
//             decoration: BoxDecoration(
//               color: i == _currentPage ? Color(0xFF4680FE) : Colors.white,
//               borderRadius: BorderRadius.circular(4),
//             ),
//             child: Text(
//               '${i + 1}',
//               style: TextStyle(
//                 color: i == _currentPage ? Colors.white : Colors.black,
//               ),
//             ),
//           ),
//         ),
//       );
//     }
//     return buttons;
//   }

//   @override
//   Widget build(BuildContext context) {
//     return Scaffold(
//       backgroundColor: Colors.white,
//       appBar: AppBar(
//         title: Row(
//           children: [
//             SizedBox(width: Dimensions.fontSize(context, 55)),
//             Icon(Icons.badge_rounded, color: Colors.black),
//             SizedBox(width: Dimensions.fontSize(context, 8)),
//             Text(
//               "Attendance",
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
//         backgroundColor: Colors.white,
//         elevation: 0,
//         actions: [
//           if (_batches.isNotEmpty)
//             Padding(
//               padding: EdgeInsets.only(right: 16),
//               child: DropdownButton<int>(
//                 value: _selectedBatchId,
//                 items: _batches.map((batch) {
//                   return DropdownMenuItem<int>(
//                     value: batch['id'],
//                     child: Text(batch['name']),
//                   );
//                 }).toList(),
//                 onChanged: _handleBatchChange,
//                 underline: Container(),
//                 style: TextStyle(
//                   color: Colors.black,
//                   fontSize: Dimensions.fontSize(context, 14),
//                 ),
//               ),
//             ),
//         ],
//       ),
//       body: _isLoading
//           ? Center(child: CircularProgressIndicator())
//           : Column(
//               children: [
//                 Padding(
//                   padding: EdgeInsets.all(16),
//                   child: Text(
//                     "Attendance: ${_percentage.toStringAsFixed(2)}%", 
//                     style: TextStyle(
//                       fontSize: 16, 
//                       fontWeight: FontWeight.w600
//                     ),
//                   ),
//                 ),
//                 Expanded(
//                   child: SingleChildScrollView(
//                     scrollDirection: Axis.horizontal,
//                     child: DataTable(
//                       dividerThickness: 1.5,
//                       border: TableBorder(
//                         horizontalInside: BorderSide(color: Color(0xFF4680FE), width: 1),
//                       ),
//                       headingRowColor: MaterialStateProperty.all(Color(0xFF4680FE)),
//                       headingTextStyle: TextStyle(color: Colors.white),
//                       columns: const [
//                         DataColumn(label: Center(child: Text("#"))),
//                         DataColumn(label: Center(child: Text("SESSION"))),
//                         DataColumn(label: Center(child: Text("DATE"))),
//                         DataColumn(label: Center(child: Text("ATTENDANCE"))),
//                       ],
//                       rows: _attendanceData
//                           .map((data) => DataRow(cells: [
//                                 DataCell(Center(child: Text(data["index"].toString()))),
//                                 DataCell(Text(data["session"])),
//                                 DataCell(Center(child: Text(data["date"]))),
//                                 DataCell(Center(child: Text(data["status"]))),
//                               ]))
//                           .toList(),
//                     ),
//                   ),
//                 ),
//                 if (_totalPages > 1)
//                   Padding(
//                     padding: EdgeInsets.all(16),
//                     child: Row(
//                       mainAxisAlignment: MainAxisAlignment.center,
//                       children: [
//                         IconButton(
//                           icon: Icon(Icons.chevron_left),
//                           onPressed: _currentPage > 0 
//                               ? () => _handlePageChange(_currentPage - 1)
//                               : null,
//                         ),
//                         ..._buildPaginationButtons(),
//                         IconButton(
//                           icon: Icon(Icons.chevron_right),
//                           onPressed: _currentPage < _totalPages - 1
//                               ? () => _handlePageChange(_currentPage + 1)
//                               : null,
//                         ),
//                       ],
//                     ),
//                   ),
//                 Padding(
//                   padding: EdgeInsets.only(bottom: 16),
//                   child: Text(
//                     "Showing ${_currentPage * _itemsPerPage + 1}-${_currentPage * _itemsPerPage + _attendanceData.length} of $_totalElements",
//                     style: TextStyle(color: Colors.blue),
//                   ),
//                 ),
//               ],
//             ),
//     );
//   }
// }
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:learnhub/dimensions.dart';
import '../url.dart';

class AttendanceScreen extends StatefulWidget {
  final int selectedIndex;
  final Function(int, {bool navigateToAttendance}) onItemTapped;

  const AttendanceScreen({
    super.key, 
    required this.selectedIndex, 
    required this.onItemTapped
  });

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final _storage = const FlutterSecureStorage();
  List<Map<String, dynamic>> _attendanceData = [];
  List<Map<String, dynamic>> _batches = [];
  int? _selectedBatchId;
  double _percentage = 0.0;
  int _totalSessions = 0;
  int _attended = 0;
  int _absent = 0;
  bool _showPercentageView = true;
  bool _isLoading = true;
  int _currentPage = 0;
  int _totalPages = 0;
  int _itemsPerPage = 10;
  int _totalElements = 0;

  @override
  void initState() {
    super.initState();
    _fetchBatches();
  }

  Future<void> _fetchBatches() async {
    final token = await _storage.read(key: 'token');
    final email = await _storage.read(key: 'email');
    if (token == null || email == null) return;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/view/batch/$email'),
        headers: {'Authorization': token},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body) as List;
        setState(() {
          _batches = data.map((batch) => {
            'id': batch['id'],
            'name': batch['name'],
            'type': batch['type'] ?? ''
          }).toList();
          
          if (_batches.isNotEmpty) {
            _selectedBatchId = _batches[0]['id'];
            _fetchAttendance();
          } else {
            _isLoading = false;
          }
        });
      }
    } catch (e) {
      print("Error fetching batches: $e");
      setState(() => _isLoading = false);
    }
  }

  Future<void> _fetchAttendance() async {
    if (_selectedBatchId == null) return;
    
    setState(() => _isLoading = true);
    final token = await _storage.read(key: 'token');
    if (token == null) return;

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/view/MyAttendance/$_selectedBatchId?page=$_currentPage&size=$_itemsPerPage'),
        headers: {'Authorization': token},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final attendanceList = data['attendance']['content'] as List;
        
        setState(() {
          _attendanceData = attendanceList
              .asMap()
              .entries
              .map((entry) => {
                    "index": entry.key + 1 + (_currentPage * _itemsPerPage),
                    "session": entry.value['topic'] ?? 'N/A',
                    "date": entry.value['date'] ?? 'N/A',
                    "status": entry.value['status'] ?? 'N/A',
                  })
              .toList();
          
          _percentage = (data['percentage'] as num).toDouble();
          _totalPages = data['attendance']['totalPages'];
          _totalElements = data['attendance']['totalElements'];
          
          // Calculate attended and absent counts
          _attended = _attendanceData.where((a) => a['status'] == 'Present').length;
          _absent = _attendanceData.where((a) => a['status'] == 'Absent').length;
          _totalSessions = _totalElements;
          
          _isLoading = false;
        });
      } else {
        throw Exception('Failed to load attendance');
      }
    } catch (e) {
      print("Error: $e");
      setState(() => _isLoading = false);
    }
  }

  void _handleBatchChange(int? newValue) {
    if (newValue != null) {
      setState(() {
        _selectedBatchId = newValue;
        _currentPage = 0;
      });
      _fetchAttendance();
    }
  }

  void _handlePageChange(int newPage) {
    if (newPage >= 0 && newPage < _totalPages) {
      setState(() => _currentPage = newPage);
      _fetchAttendance();
    }
  }

  void _toggleView() {
    setState(() {
      _showPercentageView = !_showPercentageView;
    });
  }

  List<Widget> _buildPaginationButtons() {
    List<Widget> buttons = [];
    for (int i = 0; i < _totalPages; i++) {
      buttons.add(
        InkWell(
          onTap: () => _handlePageChange(i),
          child: Container(
            padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              color: i == _currentPage ? Color(0xFF4680FE) : Colors.white,
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              '${i + 1}',
              style: TextStyle(
                color: i == _currentPage ? Colors.white : Colors.black,
              ),
            ),
          ),
        ),
      );
    }
    return buttons;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Row(
          children: [
            SizedBox(width: Dimensions.fontSize(context, 55)),
            Icon(Icons.badge_rounded, color: Colors.black),
            SizedBox(width: Dimensions.fontSize(context, 8)),
            Text(
              "Attendance",
              style: TextStyle(
                color: Color(0xFF4680FE),
                fontSize: Dimensions.fontSize(context, 24),
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => widget.onItemTapped(3),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: [
          if (_batches.isNotEmpty)
            Padding(
              padding: EdgeInsets.only(right: 16),
              child: DropdownButton<int>(
                value: _selectedBatchId,
                items: _batches.map((batch) {
                  return DropdownMenuItem<int>(
                    value: batch['id'],
                    child: Text(batch['name']),
                  );
                }).toList(),
                onChanged: _handleBatchChange,
                underline: Container(),
                style: TextStyle(
                  color: Colors.black,
                  fontSize: Dimensions.fontSize(context, 14),
                ),
              ),
            ),
        ],
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              child: Padding(
                padding: EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    if (_showPercentageView) ...[
                      _buildPercentageCard(),
                      SizedBox(height: 20),
                      _buildStatsCard(),
                    ] else ...[
                      _buildAttendanceTable(),
                      if (_totalPages > 1)
                        Padding(
                          padding: EdgeInsets.all(16),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              IconButton(
                                icon: Icon(Icons.chevron_left),
                                onPressed: _currentPage > 0 
                                    ? () => _handlePageChange(_currentPage - 1)
                                    : null,
                              ),
                              ..._buildPaginationButtons(),
                              IconButton(
                                icon: Icon(Icons.chevron_right),
                                onPressed: _currentPage < _totalPages - 1
                                    ? () => _handlePageChange(_currentPage + 1)
                                    : null,
                              ),
                            ],
                          ),
                        ),
                      Padding(
                        padding: EdgeInsets.only(bottom: 16),
                        child: Text(
                          "Showing ${_currentPage * _itemsPerPage + 1}-${_currentPage * _itemsPerPage + _attendanceData.length} of $_totalElements",
                          style: TextStyle(color: Colors.blue),
                        ),
                      ),
                    ],
                    ElevatedButton(
                      onPressed: _toggleView,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF4680FE),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        _showPercentageView ? "View Details" : "View Percentage",
                        style: TextStyle(color: Colors.white),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  Widget _buildPercentageCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(20.0),
        child: Column(
          children: [
            Text(
              "ATTENDANCE PERCENTAGE",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
            SizedBox(height: 10),
            Text(
              "${_percentage.toStringAsFixed(0)}%",
              style: TextStyle(
                fontSize: 48,
                fontWeight: FontWeight.bold,
                color: Color(0xFF4680FE),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatsCard() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              "Total Sessions",
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              _totalSessions.toString(),
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Color(0xFF4680FE),
              ),
            ),
            SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildStatItem("Attended", _attended, _totalSessions),
                _buildStatItem("Absent", _absent, _totalSessions),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatItem(String label, int count, int total) {
    final percentage = (count / total * 100).toStringAsFixed(0);
    return Column(
      children: [
        Text(
          "$label: $percentage%",
          style: TextStyle(fontSize: 14),
        ),
        SizedBox(height: 4),
        Text(
          count.toString(),
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildAttendanceTable() {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              "# SESSION    DATE    ATTENDANCE",
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
              ),
            ),
            Divider(thickness: 2),
            ..._attendanceData.map((item) => Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text("${item["index"]}"),
                        Expanded(
                          child: Text(
                            item['session'],
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            item['date'],
                            textAlign: TextAlign.center,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            item['status'],
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: item['status'] == "Present"
                                  ? Colors.green
                                  : Colors.red,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    Divider(),
                  ],
                )),
          ],
        ),
      ),
    );
  }
}