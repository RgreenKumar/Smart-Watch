import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

import '../dimensions.dart';
import '../url.dart';
import 'AssignmentQnAScreen.dart';
import 'AssignmentUploadScreen.dart';

class AssignmentScreen extends StatefulWidget {
  final int selectedIndex;
  final Function(int, {bool navigateToGrades}) onItemTapped;

  const AssignmentScreen({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  State<AssignmentScreen> createState() => _AssignmentScreenState();
}

class _AssignmentScreenState extends State<AssignmentScreen> {
  List<dynamic> assignments = [];
  List<dynamic> batches = [];
  int? selectedBatchId;
  String? token;
  String? email;
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadUserData();
  }

  Future<void> _loadUserData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      token = prefs.getString('token');
      email = prefs.getString('email');
    });
    await fetchBatches();
  }

  Future<void> fetchBatches() async {
    if (email == null || token == null) return;

    try {
      final response = await http.get(
        Uri.parse('${baseUrl}/view/batch/$email'),
        headers: {'Authorization': token!},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          batches = data;
          if (batches.isNotEmpty) {
            selectedBatchId = batches[0]['id'];
            fetchMyAssignments();
          }
        });
      } else {
        _showErrorDialog('Failed to load batches');
      }
    } catch (e) {
      _showErrorDialog('Error: $e');
    }
  }

  Future<void> fetchMyAssignments() async {
    if (selectedBatchId == null || token == null) return;

    setState(() {
      isLoading = true;
    });

    try {
      final response = await http.get(
        Uri.parse('${baseUrl}/Assignments/get?batchId=$selectedBatchId'),
        headers: {'Authorization': token!},
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          assignments = data;
          isLoading = false;
        });
      } else if (response.statusCode == 204) {
        _showInfoDialog('No assignments found for this batch');
        setState(() {
          assignments = [];
          isLoading = false;
        });
      } else {
        _showErrorDialog('Failed to load assignments');
        setState(() {
          isLoading = false;
        });
      }
    } catch (e) {
      _showErrorDialog('Error: $e');
      setState(() {
        isLoading = false;
      });
    }
  }

  void _showErrorDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Error'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showInfoDialog(String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Info'),
        content: Text(message),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              widget.onItemTapped(3); // Navigate back
            },
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'SUBMITTED':
      case 'VALIDATED':
        return Colors.green;
      case 'LATE_SUBMISSION':
        return Colors.orange;
      case 'NOT_SUBMITTED':
        return Colors.red;
      default:
        return Colors.grey;
    }
  }

  String _formatStatus(String status) {
    return status.replaceAll('_', ' ') ?? 'Not Submitted';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        title: Row(
          children: [
            SizedBox(width: Dimensions.fontSize(context, 55)),
            Icon(Icons.assignment_rounded, color: Colors.black),
            SizedBox(width: Dimensions.fontSize(context, 8)),
            Text(
              "Assignment",
              style: TextStyle(
                color: const Color(0xFF4680FE),
                fontSize: Dimensions.fontSize(context, 24),
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => widget.onItemTapped(3), // Go back to Profile Page
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: DropdownButtonFormField<int>(
              value: selectedBatchId,
              decoration: InputDecoration(
                labelText: 'Select Batch',
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                ),
                filled: true,
                fillColor: Colors.grey[100],
              ),
              items: batches.map((batch) {
                return DropdownMenuItem<int>(
                  value: batch['id'],
                  child: Text(batch['name']),
                );
              }).toList(),
              onChanged: (value) {
                setState(() {
                  selectedBatchId = value;
                });
                fetchMyAssignments();
              },
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : assignments.isEmpty
                    ? const Center(child: Text('No assignments found'))
                    : ListView.builder(
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        itemCount: assignments.length,
                        itemBuilder: (context, index) {
                          final assignment = assignments[index];
                          return AssignmentCard(
                            status: _formatStatus(assignment['submissionstatus']),
                            date: assignment['assignmentdate'],
                            statusColor: _getStatusColor(
                                assignment['submissionstatus']),
                            title: assignment['assignmenttitle'],
                            onTap: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => AssignmentQnAScreen(
                                    batchId: selectedBatchId!,
                                    assignmentId: assignment['assignmentid'],
                                  ),
                                ),
                              );
                            },
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}

class AssignmentCard extends StatelessWidget {
  final String status;
  final String date;
  final String title;
  final Color statusColor;
  final VoidCallback onTap;

  const AssignmentCard({
    super.key,
    required this.status,
    required this.date,
    required this.statusColor,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: Colors.white,
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      child: InkWell(
        borderRadius: BorderRadius.circular(10),
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.circle,
                        color: statusColor,
                        size: 12,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        status,
                        style: TextStyle(
                          color: statusColor,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Text(
                    'Due: $date',
                    style: const TextStyle(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}