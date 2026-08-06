import 'package:flutter/material.dart';

import '../dimensions.dart';

class AssignmentQnAScreen extends StatefulWidget {
  const AssignmentQnAScreen({super.key, required int batchId, required assignmentId});

  @override
  State<AssignmentQnAScreen> createState() => _AssignmentQnAScreenState();
}

class _AssignmentQnAScreenState extends State<AssignmentQnAScreen> {
  bool _isEdited = false;
  final List<TextEditingController> _controllers = List.generate(5, (_) => TextEditingController());

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _onBackPressed() {
    if (_isEdited) {
      _showExitDialog();
    } else {
      Navigator.pop(context);
      // widget.onItemTapped(3);
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
          // onPressed: () {}//=> widget.onItemTapped(3), // Go back to Profile Page
          onPressed: _onBackPressed,//() => Navigator.pop(context),
        ),
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
      // ),
        // title: Center(
        //   child:  Row(
        //     children: [
        //       Icon(Icons.assignment, color: Colors.black),
        //       SizedBox(width: 8),
        //       Text(
        //         "Assignment",
        //         style: TextStyle(color: Colors.blue),
        //       ),
        //     ],
        //   ),
        // ),
        
        // // title: const Text("Assignment", style: TextStyle(color: Colors.blue)),
        // backgroundColor: Colors.white,
        // // leading: const BackButton(color: Colors.black),
        // // leading: Icon(Icons.arrow_back_ios_rounded),
        // elevation: 0,
      ),
     body: Padding(
      padding: const EdgeInsets.all(16),
       child: Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      // Header: Title and Marks
      Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: const [
          Text(
            'Assignment Title',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              fontFamily: 'Poppins',
              color: Color(0xFF000000),
            ),
          ),
          Text(
            'Total Marks : 10',
            style: TextStyle(
              fontSize: 15,
              fontFamily: 'Poppins',
              color: Color(0xFF000000),
            ),
          ),
        ],
      ),
      const SizedBox(height: 8),

      // Instructions
      const Text(
        '   Read the below questions carefully and answer the questions',
        style: TextStyle(
          color: Colors.grey,
          fontSize: 15,
          fontFamily: 'Poppins',
        ),
      ),
      const SizedBox(height: 16),
            Expanded(
              child: ListView.builder(
                itemCount: 5,
                itemBuilder: (context, index) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('${index + 1}. Question ${index + 1}',
                          style: TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF808080), fontSize: Dimensions.fontSize(context, 16))),
                      TextField(
                        controller: _controllers[index],
                        cursorColor: const Color(0xFFA3A3A5),
                        onChanged: (value) {
    setState(() {
      _isEdited = true;
    });
  },
                        decoration: const InputDecoration(
                          hintText: "Type your answer here...",
                          hintStyle: TextStyle(color: Color(0xFF808080),fontSize: 15),
                          enabledBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                    color: Color(0xFFA3A3A5),
                    width: 1.5,
                  ),
                ),
                focusedBorder: UnderlineInputBorder(
                  borderSide: BorderSide(
                    color: Color(0xFFA3A3A5),
                    width: 2.0,
                  ),
                ),
                          border: UnderlineInputBorder(
                borderSide: BorderSide(
                  color:  Color(0xFFA3A3A5),
                  width: 3.5,
                ),
              ),
              
                        ),
                        
                        maxLines: 2,
                      ),
                      // const Divider(height: 30),
                      SizedBox(height: 20),
                    ],
                  );
                },
              ),
            ),
                    // const SizedBox(height: 20),
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
