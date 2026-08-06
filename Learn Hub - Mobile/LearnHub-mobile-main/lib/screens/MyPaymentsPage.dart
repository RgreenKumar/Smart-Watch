// ignore_for_file: library_private_types_in_public_api, avoid_print, unnecessary_brace_in_string_interps

import 'dart:convert';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import '../dimensions.dart';
import '../url.dart';

class PendingPayment {
  final int id;
  final int batchId;
  final String batchName;
  final int installmentNo;
  final int installmentId;
  final int amount;
  final DateTime lastDate;
  final String email;
  final String bid;
  String? batchImageBase64;

  PendingPayment({
    required this.id,
    required this.batchId,
    required this.batchName,
    required this.installmentNo,
    required this.installmentId,
    required this.amount,
    required this.lastDate,
    required this.email,
    required this.bid,
    this.batchImageBase64,
  });

  factory PendingPayment.fromJson(Map<String, dynamic> json) {
    return PendingPayment(
      id: json['id'] ?? 0,
      batchId: json['batchId'] ?? 0,
      batchName: json['batchName'] ?? 'N/A',
      installmentNo: json['installmentNo'] ?? 0,
      installmentId: json['installmentId'] ?? 0,
      amount: json['amount'] ?? 0,
      lastDate: DateTime.parse(json['lastDate'] ?? DateTime.now().toString()),
      email: json['email'] ?? '',
      bid: json['bid'] ?? '',
    );
  }
}

class Payment {
  final String courseName;
  final int installmentNumber;
  final String paymentId;
  final String orderId;
  final int amountPaid;
  final String date;
  final String status;
  final int? pendingAmount;
  final String? dueDate;
  final String paymentType;
  final int? batchId; // Add this field
  String? batchImageBase64;

  Payment({
    required this.courseName,
    required this.installmentNumber,
    required this.paymentId,
    required this.orderId,
    required this.amountPaid,
    required this.date,
    required this.status,
    this.pendingAmount,
    this.dueDate,
    required this.paymentType,
    this.batchId, // Add to constructor
    this.batchImageBase64,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      courseName: json['batchName']?.toString() ?? 'N/A',
      installmentNumber: json['installmentnumber'] ?? 0,
      paymentId: json['paymentId']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      amountPaid: json['amountReceived'] ?? 0,
      date: json['date']?.toString() ?? '',
      status: json['status']?.toString() ?? 'Pending',
      pendingAmount: json['pendingAmount'],
      dueDate: json['dueDate']?.toString(),
      paymentType: json['paymentType']?.toString() ?? 'Unknown',
      batchId: json['batchId'] as int?,
      batchImageBase64: json['batchImageBase64']?.toString(),
    );
  }
}

class MyPaymentsPage extends StatefulWidget {
  final int selectedIndex;
  final Function(int) onItemTapped;

  const MyPaymentsPage({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  _MyPaymentsPageState createState() => _MyPaymentsPageState();
}

class _MyPaymentsPageState extends State<MyPaymentsPage> {
  final storage = FlutterSecureStorage();
  List<Payment> payments = [];
  List<PendingPayment> pendingPayments = [];
  bool isLoading = true;
  bool showPendingPayments = false;
  

  @override
  void initState() {
    super.initState();
    // fetchPayments();
    fetchData();
  }
  Future<void> fetchData() async {
    await Future.wait([
      fetchPayments(),
      fetchPendingPayments(),
    ]);
    setState(() => isLoading = false);
  }

  Future<void> fetchPayments() async {
   String? token = await storage.read(key: 'token');
  if (token == null) {
    setState(() => isLoading = false);
    return; // no token, bail out early
  }

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/myPaymentHistory'),
        headers: {'Authorization': token},
      );

      if (response.statusCode == 200) {
        List<dynamic> body = jsonDecode(response.body);
        List<Payment> loadedPayments = body.map((json) => Payment.fromJson(json)).toList();

        await fetchBatchImages(loadedPayments, token);

        // Filter payments to show only the most recent status for each course
      List<Payment> filteredPayments = _filterPayments(loadedPayments);

        setState(() {
          payments = filteredPayments;//loadedPayments;
          isLoading = false;
        });
      } else {
        print('Failed to load payments: ${response.statusCode}');
        setState(() => isLoading = false);
      }
    } catch (e) {
      print('Error fetching payments: $e');
      setState(() => isLoading = false);
    }
  }
  List<Payment> _filterPayments(List<Payment> allPayments) {
  // First filter out any payments with "created" status
  List<Payment> filtered = allPayments.where((payment) => 
    payment.status.toLowerCase() != "created"
  ).toList();

  // Then group the remaining payments by course name
  Map<String, List<Payment>> paymentsByCourse = {};
  
  for (var payment in filtered) {
    if (!paymentsByCourse.containsKey(payment.courseName)) {
      paymentsByCourse[payment.courseName] = [];
    }
    paymentsByCourse[payment.courseName]!.add(payment);
  }

  // For each course, keep only the most recent payment
  List<Payment> result = [];
  
  paymentsByCourse.forEach((courseName, coursePayments) {
    // Sort payments by date (newest first)
    coursePayments.sort((a, b) => b.date.compareTo(a.date));
    
    // Find the first payment that is paid, or fall back to the most recent one
    Payment? paymentToKeep;
    for (var payment in coursePayments) {
      if (payment.status.toLowerCase() == 'paid') {
        paymentToKeep = payment;
        break;
      }
    }
    
    // If no paid payment found, keep the most recent one
    paymentToKeep ??= coursePayments.first;
    
    result.add(paymentToKeep);
  });

  return result;
}

Future<void> fetchPendingPayments() async {
    String? token = await storage.read(key: 'token');
  if (token == null) {
    setState(() => isLoading = false);
    return; // no token, bail out early
  }

    try {
      final response = await http.get(
        Uri.parse('$baseUrl/get/Pendings'),
        headers: {'Authorization': token},
      );

      if (response.statusCode == 200) {
        List<dynamic> body = jsonDecode(response.body);
        List<PendingPayment> loadedPendingPayments = 
            body.map((json) => PendingPayment.fromJson(json)).toList();
        await fetchPendingBatchImages(loadedPendingPayments, token);
        setState(() {
          pendingPayments = loadedPendingPayments;
        });
      }
    } catch (e) {
      print('Error fetching pending payments: $e');
    }
  }

  Future<void> fetchPendingBatchImages(List<PendingPayment> pendingPayments, String token) async {
    try {
      List<int> batchIds = pendingPayments
          .map((payment) => payment.batchId)
          .toSet()
          .toList();

      if (batchIds.isEmpty) return;

      final response = await http.get(
        Uri.parse('$baseUrl/Batch/getImages')
            .replace(queryParameters: {'batchIds': batchIds.map((id) => id.toString()).toList()}),
        headers: {'Authorization': token},
      );

      if (response.statusCode == 200) {
        List<dynamic> batchImages = jsonDecode(response.body);
        Map<int, String> imageMap = {};
        
        for (var imageData in batchImages) {
          if (imageData is Map<String, dynamic>) {
            int? batchId = imageData['batchId'] as int?;
            String? image = imageData['batchImage']?.toString();
            if (batchId != null && image != null) {
              imageMap[batchId] = image;
            }
          }
        }

        for (var payment in pendingPayments) {
          if (imageMap.containsKey(payment.batchId)) {
            payment.batchImageBase64 = imageMap[payment.batchId];
          }
        }
      }
    } catch (e) {
      print('Error fetching pending batch images: $e');
    }
  }

Future<void> fetchBatchImages(List<Payment> loadedPayments, String token) async {
  try {
    // Extract all unique batch IDs from payments
    List<int> batchIds = loadedPayments
        .where((payment) => payment.batchId != null)
        .map((payment) => payment.batchId!)
        .toSet() // Remove duplicates
        .toList();

    if (batchIds.isEmpty) return;

    final response = await http.get(
      Uri.parse('$baseUrl/Batch/getImages')
          .replace(queryParameters: {'batchIds': batchIds.map((id) => id.toString()).toList()}),
      headers: {'Authorization': token},
    );

    if (response.statusCode == 200) {
      List<dynamic> batchImages = jsonDecode(response.body);
      
      // Create a map for quick lookup (batchId -> image)
      Map<int, String> imageMap = {};
      for (var imageData in batchImages) {
        if (imageData is Map<String, dynamic>) {
          int? batchId = imageData['batchId'] as int?;
          String? image = imageData['batchImage']?.toString();
          if (batchId != null && image != null) {
            imageMap[batchId] = image;
          }
        }
      }

      // Update payments with corresponding images
      for (var payment in loadedPayments) {
        if (payment.batchId != null && imageMap.containsKey(payment.batchId)) {
          setState(() {
            payment.batchImageBase64 = imageMap[payment.batchId!];
          });
        }
      }
    } else {
      print('Failed to load batch images: ${response.statusCode}');
    }
  } catch (e) {
    print('Error fetching batch images: $e');
  }
}
  
  Uint8List? decodeBase64Image(String? base64String) {
    if (base64String == null || base64String.isEmpty) return null;
    try {
      if (base64String.startsWith("data:image")) {
        base64String = base64String.split(",")[1];
      }
      return base64Decode(base64String);
    } catch (e) {
      print("Error decoding Base64 image: $e");
      return null;
    }
  }

 void navigateToDetail(dynamic payment) {
    if (payment is Payment) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => payment.installmentNumber > 1
              ? InstallmentDetailPage(payment: payment)
              : PaymentDetailPage(payment: payment),
        ),
      );
    } else if (payment is PendingPayment) {
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PendingPaymentDetailPage(payment: payment),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => widget.onItemTapped(3), // Go back to Profile Page
        ),
        title: Center(
          child: Row(
            children: [
              SizedBox(width: Dimensions.fontSize(context, 65)),
              //Icon(Icons.menu_book, color: Colors.black),
              // SizedBox(width: 8),
              Text(
                "My Payments",
                style: TextStyle(
                  color: Color(0xFF4680FE),
                  fontSize: Dimensions.fontSize(context, 24),
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Poppins',
                ),
              ),
            ],
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(showPendingPayments ? Icons.payment : Icons.pending_actions),
            onPressed: () {
              setState(() {
                showPendingPayments = !showPendingPayments;
              });
            },
          ),
        ],
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: isLoading
          ? const Center(child: CircularProgressIndicator())
          // :showPendingPayments
          //     ? _buildPendingPaymentsList()
          //     : _buildPaymentsList(),
          : _buildContent(),
    );
  }
   Widget _buildContent() {
  if (showPendingPayments) {
    return pendingPayments.isEmpty
        ? _buildEmptyState("No pending payments found")
        : _buildPendingPaymentsList();
  } else {
    return payments.isEmpty
        ? _buildEmptyState("No payments found")
        : _buildPaymentsList();
  }
}

Widget _buildEmptyState(String message) {
  return Center(
    child: Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Icon(Icons.payment, 
        // size: 48, 
        color: Colors.grey),
        SizedBox(height: 16),
        Text(
          message,
          style: TextStyle(
            // fontSize: 18,
            color: Colors.grey,
          ),
        ),
      ],
    ),
  );
}
  Widget _buildPaymentsList() {
    return ListView.builder(
      itemCount: payments.length,
      itemBuilder: (context, index) {
        final payment = payments[index];
        String formattedDate = DateFormat('dd MMM yyyy').format(DateTime.parse(payment.date));
        Uint8List? imageBytes = decodeBase64Image(payment.batchImageBase64);

        return GestureDetector(
          onTap: () => navigateToDetail(payment),
          child: Padding(
            padding: EdgeInsets.all(Dimensions.fontSize(context, 15)),
            child: Card(
              color: Colors.white,
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(color: Color(0xFFA3A3A5), width: 1),
              ),
              margin: EdgeInsets.all(2),
              child: Padding(
                padding: EdgeInsets.all(Dimensions.fontSize(context, 5)),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    if (imageBytes != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.memory(
                          imageBytes,
                          height: Dimensions.iconSize(context, 100),
                          width: Dimensions.iconSize(context, 125),
                          fit: BoxFit.cover,
                        ),
                      )
                    else
                      Container(
                        height: Dimensions.iconSize(context, 60),
                        width: Dimensions.iconSize(context, 60),
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.image, size: Dimensions.iconSize(context, 40), color: Colors.grey[600]),
                      ),
                    SizedBox(width: Dimensions.fontSize(context, 10)),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            payment.courseName,
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: Dimensions.fontSize(context, 16)),
                            overflow: TextOverflow.ellipsis,
                          ),
                          SizedBox(height: Dimensions.fontSize(context, 10)),
                          Text(
                            "${payment.status.toLowerCase() == "paid" ? "Date" : "Due Date"}: $formattedDate",
                            style: TextStyle(fontSize: Dimensions.fontSize(context, 14), color: Colors.black),
                          ),
                          SizedBox(height: Dimensions.fontSize(context, 25)),
                          Row(
                            children: [
                              if (payment.paymentType.toLowerCase() == "razorpay")
                                Image.asset(
                                  "assets/razorpay.png",
                                  height: Dimensions.iconSize(context, 12),
                                  width: Dimensions.iconSize(context, 70),
                                ),
                              //Row(
                                // children: [
                                  Text("Status: ", style: TextStyle(fontSize: Dimensions.fontSize(context, 12))),
                                  Text(
                                    payment.status,
                                    style: TextStyle(
                                      fontSize: Dimensions.fontSize(context, 12),
                                      color: payment.status.toLowerCase() == "paid" 
                                          ? Colors.green 
                                          : Colors.orange,
                                    ),
                                  ),
                                // ],
                             // ),
                              SizedBox(width: Dimensions.fontSize(context, 13)),
                              Text("₹${payment.amountPaid}", style: TextStyle(fontSize: Dimensions.fontSize(context, 13))),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildPendingPaymentsList() {
    return ListView.builder(
      itemCount: pendingPayments.length,
      itemBuilder: (context, index) {
        final payment = pendingPayments[index];
        String formattedDate = DateFormat('dd MMM yyyy').format(payment.lastDate);
        Uint8List? imageBytes = decodeBase64Image(payment.batchImageBase64);

        return GestureDetector(
          onTap: () => navigateToDetail(payment),
          child: Padding(
            padding: EdgeInsets.all(Dimensions.fontSize(context, 15)),
            child: Card(
              color: Colors.white,
              elevation: 3,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(color: Color(0xFFA3A3A5), width: 1),
              ),
              margin: EdgeInsets.all(2),
              child: Padding(
                padding: EdgeInsets.all(Dimensions.fontSize(context, 5)),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    if (imageBytes != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.memory(
                          imageBytes,
                          height: Dimensions.iconSize(context, 100),
                          width: Dimensions.iconSize(context, 125),
                          fit: BoxFit.cover,
                        ),
                      )
                    else
                      Container(
                        height: Dimensions.iconSize(context, 60),
                        width: Dimensions.iconSize(context, 60),
                        decoration: BoxDecoration(
                          color: Colors.grey[300],
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Icon(Icons.image, size: Dimensions.iconSize(context, 40), color: Colors.grey[600]),
                      ),
                    SizedBox(width: Dimensions.fontSize(context, 10)),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            payment.batchName,
                            style: TextStyle(fontWeight: FontWeight.bold, fontSize: Dimensions.fontSize(context, 16)),
                            overflow: TextOverflow.ellipsis,
                          ),
                          // SizedBox(height: Dimensions.fontSize(context, 10)),
                          // Text(
                          //   "Installment: ${payment.installmentNo}",
                          //   style: TextStyle(fontSize: Dimensions.fontSize(context, 14), color: Colors.black),
                          // ),
                          SizedBox(height: Dimensions.fontSize(context, 10)),
                          Text(
                            "Due Date: $formattedDate",
                            style: TextStyle(fontSize: Dimensions.fontSize(context, 14), color: Colors.black),
                          ),
                          SizedBox(height: Dimensions.fontSize(context, 10)),
                          Row(
                            children: [
                              Text(
                                "Pending Amount: ",
                                style: TextStyle(fontSize: Dimensions.fontSize(context, 14)),
                              ),
                              Text(
                                "₹${payment.amount}",
                                style: TextStyle(
                                  fontSize: Dimensions.fontSize(context, 14),
                                  color: Colors.red,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}

class PendingPaymentDetailPage extends StatelessWidget {
  final PendingPayment payment;

  const PendingPaymentDetailPage({super.key, required this.payment});

  @override
  Widget build(BuildContext context) {
    String formattedDate = DateFormat('dd MMM yyyy').format(payment.lastDate);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Center(
          child: Text(
            "Pending Payment",
            style: TextStyle(
              color: Color(0xFF4680FE),
              fontSize: Dimensions.fontSize(context, 24),
              fontWeight: FontWeight.w600,
              fontFamily: 'Poppins',
            ),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
        child: Center(
          child: Card(
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
                  _buildDetailRow(context, "Course Name", payment.batchName),
                  _buildDetailRow(context, "Installment Number", payment.installmentNo.toString()),
                  _buildDetailRow(context, "Pending Amount", "₹${payment.amount}"),
                  _buildDetailRow(context, "Due Date", formattedDate),
                  _buildDetailRow(context, "Course ID", payment.bid),
                  SizedBox(height: Dimensions.fontSize(context, 20)),
                  // Center(
                  //   child: ElevatedButton(
                  //       style: ElevatedButton.styleFrom(
                  //         backgroundColor: Color(0xFF4680FE),
                  //         minimumSize: Size(20, Dimensions.fontSize(context, 40)),
                  //         shape: RoundedRectangleBorder(
                  //         borderRadius: BorderRadius.circular(8), // Adjust the radius as needed
                  //       ),
                  //       ),
                  //       onPressed :(){},
                  //        // Disable if no payment method is selectedisPaymentMethodSelected && !isProcessing ? processPayment : null, // Only enable if a payment method is selected//isProcessing ? null : processPayment,
                  //       child: Text("Pay Now", style: TextStyle(color: Colors.white, fontSize: Dimensions.fontSize(context, 18), fontFamily: 'Open Sans', fontWeight: FontWeight.w600)),
                  //     ),
                  // ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(BuildContext context, String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 8)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: Dimensions.fontSize(context, 140),
            child: Text(
              label,
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 16),
                fontWeight: FontWeight.w500,
                color: Color(0xFF4680FE),
              ),
            ),
          ),
          Expanded(
            child: Container(
              padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 10), horizontal: Dimensions.fontSize(context, 8)),
              decoration: BoxDecoration(
                color: Color(0xFFD9D9D9),
                border: Border(
                  bottom: BorderSide(color: Colors.black, width: 1),
                ),
              ),
              child: Text(
                value,
                style: TextStyle(
                  fontSize: Dimensions.fontSize(context, 16),
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class PaymentDetailPage extends StatelessWidget {
  final Payment payment;

  const PaymentDetailPage({super.key, required this.payment});

  @override
  Widget build(BuildContext context) {
    String formattedDate = DateFormat('dd-MM-yyyy').format(DateTime.parse(payment.date));

    return Scaffold(
      
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Center(
          child: Text(
            "My Payments",
            style: TextStyle(
              color: Color(0xFF4680FE),
              fontSize: Dimensions.fontSize(context, 24),
              fontWeight: FontWeight.w600,
              fontFamily: 'Poppins',
            ),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
        child: Center(
          child: Card(
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
                  _buildPaymentDetailRow(context, "Course Name", payment.courseName),
                  _buildPaymentDetailRow(context, "Installment Number", payment.installmentNumber.toString()),
                  _buildPaymentDetailRow(context, "Payment ID", payment.paymentId),
                  _buildPaymentDetailRow(context, "Order ID", payment.orderId),
                  _buildPaymentDetailRow(context, "Amount Paid", "₹${payment.amountPaid}"),
                  _buildPaymentDetailRow(context, payment.status.toLowerCase() == "paid" ? "Date" : "Due Date", formattedDate),
                  _buildPaymentDetailRow(context, "Status", payment.status),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPaymentDetailRow(BuildContext context, String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 8)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 140, // Fixed width for labels
            child: Text(
              label,
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 16),
                fontWeight: FontWeight.w500,
                color: Color(0xFF4680FE),
              ),
            ),
          ),
          Expanded(
            child: Container(
              padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 10), horizontal: Dimensions.fontSize(context, 8)),
              decoration: BoxDecoration(
                color: Color(0xFFD9D9D9), // Highlighted background
                border: Border(
                  bottom: BorderSide(color: Colors.black, width: 1), // Underline effect
                ),
              ),
              child: Text(
                value,
                style: TextStyle(
                  fontSize: Dimensions.fontSize(context, 16),
                  fontWeight: FontWeight.w400,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class InstallmentDetailPage extends StatelessWidget {
  final Payment payment;

  const InstallmentDetailPage({super.key, required this.payment});

  @override
  Widget build(BuildContext context) {
    String formattedDate = DateFormat('dd MMM yyyy').format(DateTime.parse(payment.date));
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: Center(
          child: Text(
            "Installment Details",
            style: TextStyle(
              color: Color(0xFF4680FE),
              fontSize: Dimensions.fontSize(context, 24),
              fontWeight: FontWeight.w600,
              fontFamily: 'Poppins',
            ),
          ),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      // appBar: AppBar(title: Text('Installment Details')),
      body: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text("Course Name: ${payment.courseName}"),
            Text("Installment Number: ${payment.installmentNumber}"),
            Text("Payment ID: ${payment.paymentId}"),
            Text("Order ID: ${payment.orderId}"),
            Text("Amount Paid: ₹${payment.amountPaid}"),
            Text("Paid Date: ${payment.date}"),
            Text("Pending Amount: ₹${payment.pendingAmount ?? 0}"),
            Text("Due Date: ${formattedDate}"),
            Text("Status: ${payment.status}"),
          ],
        ),
      ),
    );
  }
 }