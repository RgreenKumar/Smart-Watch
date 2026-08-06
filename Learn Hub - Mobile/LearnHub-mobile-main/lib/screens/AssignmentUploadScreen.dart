import 'package:flutter/material.dart';
import 'package:dotted_border/dotted_border.dart';

import '../dimensions.dart';

class AssignmentUploadScreen extends StatefulWidget {
  const AssignmentUploadScreen({super.key});

  @override
  State<AssignmentUploadScreen> createState() => _AssignmentUploadScreenState();
}

class _AssignmentUploadScreenState extends State<AssignmentUploadScreen> {
  bool _isUploading = true; // Simulating an ongoing upload (set this as needed)

  void _onBackPressed() {
    if (_isUploading) {
      _showExitDialog();
    } else {
      Navigator.pop(context);
    }
  }

  void _showExitDialog() {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          backgroundColor: Colors.white,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
          title: Column(
            children: [
              Icon(Icons.warning_rounded,
                  size: Dimensions.iconSize(context, 70),
                  color: const Color(0xFF4680FE)),
              SizedBox(height: Dimensions.fontSize(context, 10)),
              const Text(
                "Are You Sure Want to Exit?",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Poppins',
                  color: Colors.black,
                ),
              ),
            ],
          ),
          content: const Text(
            "The assignment submission process will be cancelled. Click 'OK' to proceed",
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
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
                    Navigator.of(context).pop(); // Close dialog
                    Navigator.of(context).pop(); // Go back
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFA3A3A5),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6)),
                  ),
                  child: Text(
                    "OK",
                    style: TextStyle(
                      color: Colors.white,
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
                    ),
                  ),
                ),
                ElevatedButton(
                  onPressed: () {
                    Navigator.of(context).pop(); // Close dialog
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF4680FE),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(6)),
                  ),
                  child: Text(
                    "Cancel",
                    style: TextStyle(
                      color: Colors.white,
                      fontFamily: 'Poppins',
                      fontWeight: FontWeight.w400,
                      fontSize: 18,
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          // onPressed: Navigator.pop(context),// {}//=> widget.onItemTapped(3), // Go back to Profile Page
          // onPressed: () => Navigator.pop(context),
          onPressed: _onBackPressed,
        ),
      //   title: Center(
      //     child:  Row(
      //       children: [
      //         Icon(Icons.assignment_rounded, color: Colors.black),
      //         SizedBox(width: 8),
      //         Text(
      //           "Assignment",
      //           style: TextStyle(color: Colors.blue),
      //         ),
      //       ],
      //     ),
      //   ),
        
      //   // title: const Text("Assignment", style: TextStyle(color: Colors.blue)),
      //   backgroundColor: Colors.white,
      //   // leading: const BackButton(color: Colors.black),
      //   // leading: Icon(Icons.arrow_back_ios_rounded),
      //   elevation: 0,
      // ),
      title: Row(
          children: [
            SizedBox(width: Dimensions.fontSize(context, 55)),
            Icon(Icons.assignment_rounded, color: Colors.black),
            SizedBox(width: Dimensions.fontSize(context, 8)),
            Text(
              "Assignment",
              style: TextStyle(
                color: Color(0xFF4680FE),
                fontSize: Dimensions.fontSize(context, 24),
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
              ),
            ),
          ],
        ),
        // leading: IconButton(
        //   icon: Icon(Icons.arrow_back_ios_new_rounded),
        //   onPressed: () => widget.onItemTapped(3), // Go back to Profile Page
        // ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: const [
                Text(
                  'Assignment Title',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'Poppins',
                  ),
                ),
                Text(
                  'Total Marks : 10',
                  style: TextStyle(
                    fontSize: 14,
                    fontFamily: 'Poppins',
                    color: Colors.black87,
                  ),
                ),
              ],
            ),
            // const Text('Assignment Title',
            //     style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            const Text(
                '   Read the below questions carefully and answer the questions', style: TextStyle(color: Colors.grey),),
            const SizedBox(height: 20),
            const Text('Assignment Description',
                style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 60),
            Center(
                child: const Text('Submit your assignment here',
                    style: TextStyle(fontWeight: FontWeight.bold))),
            const SizedBox(height: 10),
            // DottedBorder(
            //   child: Container(
            //     height: 120,
            //     width: double.infinity,
            //     children: [const Center(child: Text('Click here or drag a file to upload\nMax File Size - 10MB')),
            //     DottedBorder(child: Container(
            //       height: 100,
            //     width: double.infinity,
            //     child: const Center(child: Text('Supported Formats - .pdf, .ppt & .docx')),
            //     ))],
            //   ),
            // ),
            Card(
              color: Colors.white, // specify your border color
              // strokeWidth: 1, // specify your border width
              // dashPattern: [5, 5], // specify your dash pattern
              child: Container(
                height: 300,
                width: double.infinity,
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Center(child: const Text('Upload a File', style: TextStyle(fontWeight: FontWeight.bold),)),
                      const SizedBox(height: 15), // spacing between texts
                      DottedBorder(
                        color: Colors.grey,
                        strokeWidth: 1,
                        dashPattern: [5, 5],
                        child: Container(
                          height: 190,
                          width: 350,
                          alignment: Alignment.center,
                          child: Center(
                            child: TextButton(
                      onPressed: (){setState(() {
                                _isUploading = true; // Start upload
                              });
                              // Add file picker and upload logic here
                              },
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.upload_rounded, size:  30, color: Colors.black,),
                          SizedBox(height: 20),
                          Center(child: Text('Click here or drag a file to upload\nMax File Size - 10MB', style: TextStyle(color: Colors.grey),)),
                        ],
                      ),
                    ),
                              // child: const Text(
                              //     'Click here or drag a file to upload\nMax File Size - 10MB', style: TextStyle(color: Colors.grey),)),
                        ),
                      ),
                      ),
                      const SizedBox(height: 17),
                      Center(
                          child: const Text(
                              'Supported Formats - .pdf, .ppt & .docx', style: TextStyle(color: Colors.grey),)),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Center(
              child: ElevatedButton(
                onPressed: () {},
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4680FE),
                  padding: EdgeInsets.symmetric(horizontal:  15),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: const Text(
                  'Submit',
                  style: TextStyle(
                    fontSize:  18,
                    fontFamily: 'Poppins',
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
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
