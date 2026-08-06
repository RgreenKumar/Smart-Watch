// ignore_for_file: unnecessary_null_comparison, use_key_in_widget_constructors, library_private_types_in_public_api, use_build_context_synchronously, unnecessary_string_interpolations, avoid_print, use_super_parameters

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../dimensions.dart';
import '../url.dart';

class PaymentScreen extends StatefulWidget {
  final Map<String, dynamic> orderData;
  final String batchTitle;
  final double amount;
  final int payType;
//   PaymentScreen({required this.orderData});
  const PaymentScreen({required this.orderData, required this.batchTitle, required this.amount, required this.payType,  });

  @override
  _PaymentScreenState createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final storage = FlutterSecureStorage();
  String? selectedPaymentMethod;
  bool isPaymentMethodSelected = false;
  bool loading = true;
  bool isProcessing = false;
  late Razorpay _razorpay;
  Map<String, dynamic> paymentMethods = {
    "PAYPAL": false,
    "RAZORPAY": false,
    "STRIPE": false,
  };

  @override
  void initState() {
    super.initState();
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
    fetchPaymentMethods();
  }

   @override
  void dispose() {
    _razorpay.clear();
    super.dispose();
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) async {
    debugPrint("Payment Successful: ${response.paymentId}");
  
  // Call backend to update payment status
  await updatePaymentStatus(response.orderId!, response.paymentId!);
  
  // Navigate to success screen or perform other actions
}

Future<void> updatePaymentStatus(String orderId, String paymentId) async {
  String? token = await storage.read(key: "token");
  if (token == null) {
    debugPrint("Authentication error. Please log in again.");
    return;
  }

  try {
    final response = await http.post(
      Uri.parse("$baseUrl/buyCourse/payment"),
      headers: {
        "Authorization": token,
        "Content-Type": "application/json",
      },
      body: jsonEncode({
        "orderId": orderId,
        "paymentId": paymentId,
      }),
    );

    if (response.statusCode == 200) {
      // Successfully updated payment status
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (context) => PaymentSuccessScreen(transactionId: paymentId,
          amount: widget.amount,
          paymentMethod: "Razorpay",
          batchTitle: widget.batchTitle,
          paymentDate: DateTime.now(),)),
      );
    } else {
      debugPrint("Failed to update payment status");
    }
  } catch (e) {
    debugPrint('Error updating payment status: $e');
    debugPrint("Error updating payment status: $e");
  }
}
// Future<void> verifyPayment(String paymentId, String orderId) async {
//   String? token = await storage.read(key: "token");
//   if (token == null) {
//     debugPrint("Authentication error. Please log in again.");
//     return;
//   }

//   try {
//     final response = await http.post(
//       Uri.parse("$baseUrl/verify/payment"),
//       headers: {
//         "Authorization": token,
//         "Content-Type": "application/json",
//       },
//       body: jsonEncode({
//         "paymentId": paymentId,
//         "orderId": orderId,
//         "batchId": widget.orderData["batchId"].toString(),
//         "userId": widget.orderData["userId"].toString(),
//       }),
//     );

//     if (response.statusCode != 200) {
//       debugPrint("Payment verification failed");
//     }
//   } catch (e) {
//     debugPrint('Verification error: $e');
//     debugPrint("Error verifying payment: $e");
//   }
// }
  void _handlePaymentError(PaymentFailureResponse response) {
    debugPrint("Payment Failed: ${response.code} - ${response.message}");
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint("External Wallet: ${response.walletName}");
  }

  Future<void> initiateRazorpayOrder() async {
    String? token = await storage.read(key: "token");
    if (token == null) {
      debugPrint("Authentication error. Please log in again.");
      return;
    }

    setState(() {
      isProcessing = true;
    });

    try {
      final response = await http.post(
        Uri.parse("$baseUrl/full/buyBatch/create?gateway=RAZORPAY"),
        headers: {
          "Authorization": token,
          "Content-Type": "application/json",
        },
        body: jsonEncode({
          "batchId": widget.orderData["batchId"].toString(),
          "userId": widget.orderData["userId"].toString(),
          "paytypeL": widget.payType,
        }),
      );
    

      if (response.statusCode == 200) {
        final responseBody = jsonDecode(response.body);
        final orderId = responseBody['orderId'];
        final razorpayKey = responseBody['Key'];
        final amount = (widget.amount * 100).toInt(); // Convert to paise

var options = {
  'key': razorpayKey,//'rzp_test_otwFpJisFZWGcw',
  'amount': amount.toString(),
  'name': 'Meganar',
  'description': 'Payment for ${widget.batchTitle}',
  'order_id': orderId,
  'prefill': {
    'contact': '7339600840',
    'email': 'meganar@gmail.com',
  },
  'notes': {
    'batch_id': widget.orderData["batchId"].toString(),
    'user_id': widget.orderData["userId"].toString(),
  },
  'theme': {
    'color': '#4680FE',
  }
};
        try {
          _razorpay.open(options);
        } catch (e) {
          debugPrint('Error: $e');
          debugPrint("Error launching Razorpay: $e");
        }
      } else {
  // Enhanced error handling
        String errorMessage = "Failed to create Razorpay order";
        
        try {
          final errorResponse = jsonDecode(response.body);
          if (errorResponse.containsKey('message')) {
            errorMessage += ": ${errorResponse['message']}";
          } else if (errorResponse.containsKey('error')) {
            errorMessage += ": ${errorResponse['error']}";
          }
        } catch (e) {
          errorMessage += " (Status code: ${response.statusCode})";
        }
        debugPrint("$errorMessage");
        // );
      }
    } catch (error) {
      debugPrint("Error processing payment: $error");
    } finally {
      setState(() {
        isProcessing = false;
      });
    }
  }

  Future<void> fetchPaymentMethods() async {
    String? token = await storage.read(key: "token");
    if (token == null) return;

    final response = await http.get(
      Uri.parse("$baseUrl/get/paytypedetailsforUser"),
      headers: {
        "Authorization": token,
        //  "Content-Type": "application/json"
      },
    );

    if (response.statusCode == 200) {
      setState(() {
        paymentMethods = jsonDecode(response.body);
        loading = false;
      });
    } else {
      print("Failed to load payment methods");
    }
  }

  Future<void> processPayment() async {
    if (selectedPaymentMethod == null) {
      debugPrint("Please select a payment method.");
      return;
    }

    setState(() {
      isProcessing = true;
    });

    if (selectedPaymentMethod == "RAZORPAY") {
      await initiateRazorpayOrder();
    } else {
      // Implement Stripe or PayPal payment processing here
      print("Processing $selectedPaymentMethod payment...");
    }

    setState(() {
      isProcessing = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Center(child: CircularProgressIndicator());
    }

    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black),
          onPressed: () {
            showDialog(
              context: context,
              builder: (context) => ExitConfirmationDialog(),
            );
          },
        ),
        title: Text(
          "Payment method",
          style: TextStyle(
            color: Color(0xFF4680FE),
            fontSize: Dimensions.fontSize(context, 24),
            fontWeight: FontWeight.w600,
            fontFamily: 'Poppins',
          ),
        ),
        centerTitle: true,
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: Container(
        color: Colors.white,
        padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Card(
              color: Colors.white,
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              child: Padding(
                padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
                child: Column(
                  children: [
  if (!paymentMethods.containsValue(true))
    Padding(
      padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
      child: Text("No payment methods are enabled."),
    ),
  if (paymentMethods["STRIPE"] == true || paymentMethods["PAYPAL"] == true)
    Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (paymentMethods["STRIPE"] == true)
          GestureDetector(
            onTap: () {
              setState(() {
                selectedPaymentMethod = "STRIPE";
              });
            },
            child: Container(
              padding: EdgeInsets.all(Dimensions.fontSize(context, 8)),
              decoration: BoxDecoration(
                border: Border.all(
                  color: selectedPaymentMethod == "STRIPE"
                      ? Color(0xFF4680FE)
                      : Colors.transparent,
                  width: Dimensions.fontSize(context, 2),
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Image.asset("assets/stripe.png", height: Dimensions.iconSize(context, 40)),
            ),
          ),
        if (paymentMethods["STRIPE"] == true && paymentMethods["PAYPAL"] == true)
          SizedBox(width: Dimensions.fontSize(context, 20)),
        if (paymentMethods["PAYPAL"] == true)
          GestureDetector(
            onTap: () {
              setState(() {
                selectedPaymentMethod = "PAYPAL";
              });
            },
            child: Container(
              padding: EdgeInsets.all(Dimensions.fontSize(context, 8)),
              decoration: BoxDecoration(
                border: Border.all(
                  color: selectedPaymentMethod == "PAYPAL"
                      ? Color(0xFF4680FE)
                      : Colors.transparent,
                  width: Dimensions.fontSize(context, 2),
                ),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Image.asset("assets/paypal.png", height: Dimensions.iconSize(context, 40)),
            ),
          ),
      ],
    ),
  if (paymentMethods["STRIPE"] == true || paymentMethods["PAYPAL"] == true)
    SizedBox(height: Dimensions.fontSize(context, 10)),
  if (paymentMethods["STRIPE"] == true || paymentMethods["PAYPAL"] == true)
    Center(child: Text("OR")),
  if (paymentMethods["STRIPE"] == true || paymentMethods["PAYPAL"] == true)
    SizedBox(height: Dimensions.fontSize(context, 10)),
  if (paymentMethods["STRIPE"] == true || paymentMethods["PAYPAL"] == true)
    Divider(),
  if (paymentMethods["RAZORPAY"] == true)
    SizedBox(height: Dimensions.fontSize(context, 10)),
  if (paymentMethods["RAZORPAY"] == true)
    GestureDetector(
      onTap: () {
        setState(() {
          selectedPaymentMethod = "RAZORPAY";
        });
      },
      child: Container(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 8)),
        decoration: BoxDecoration(
          border: Border.all(
            color: selectedPaymentMethod == "RAZORPAY"
                ? Color(0xFF4680FE)
                : Colors.transparent,
            width: Dimensions.fontSize(context, 2),
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Image.asset("assets/razorpay.png", height: Dimensions.iconSize(context, 40)),
      ),
    ),
],
                ),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            Card(
              color: Colors.white,
              elevation: 1,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: BorderSide(color: Color.fromARGB(255, 210, 210, 211), width: 1),
              ),
              child: Padding(
                padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Center(
                        child: Text("Order Summary",
                            style: TextStyle(fontWeight: FontWeight.w600, fontSize: Dimensions.fontSize(context, 20), fontFamily: 'Open Sans'))),
                    SizedBox(height: Dimensions.fontSize(context, 10)),
                    Divider(),
                    orderRow("Course Name:", widget.batchTitle),
                    Divider(),
                    orderRow("Course Amount:", widget.amount != null ? widget.amount.toString() : "0"),
                    // orderRow("Partial Amount:", "300"),
                    SizedBox(height: Dimensions.fontSize(context, 80)),
                    orderRow("Total:", widget.amount != null ? widget.amount.toString() : "0", isBold: true),
                    SizedBox(height: Dimensions.fontSize(context, 40)),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF4680FE),
                        minimumSize: Size(double.infinity, Dimensions.fontSize(context, 50)),
                        shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8), // Adjust the radius as needed
    ),
                      ),
                      onPressed: (selectedPaymentMethod != null && !isProcessing) 
      ? processPayment 
      : null, // Disable if no payment method is selectedisPaymentMethodSelected && !isProcessing ? processPayment : null, // Only enable if a payment method is selected//isProcessing ? null : processPayment,
                      child: Text("Pay Now", style: TextStyle(color: Colors.white, fontSize: Dimensions.fontSize(context, 20), fontFamily: 'Open Sans', fontWeight: FontWeight.w600)),
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

  Widget orderRow(String label, String value, {bool isBold = false}) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 4)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                fontFamily: 'Open Sans',
                  fontSize: Dimensions.fontSize(context, 16),
                  fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(value,
              style: TextStyle(
                  fontSize: Dimensions.fontSize(context, 16),
                  fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
        ],
      ),
    );
  }
}
class ExitConfirmationDialog extends StatelessWidget {
  const ExitConfirmationDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12), // Increased border radius
      ),
      backgroundColor: Colors.white,
      contentPadding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 24), vertical: Dimensions.fontSize(context, 20)),
      content: SizedBox(
        width: Dimensions.fontSize(context, 320), // Increase width
        height: Dimensions.fontSize(context, 240), // Increase height
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.warning_rounded, size: Dimensions.iconSize(context, 80), color: Color(0xFF4680FE)),
            SizedBox(height: Dimensions.fontSize(context, 10)),
            Text(
              "Are You Sure Want to exit?",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w600,
                fontSize: Dimensions.fontSize(context, 16), // Slightly increased font size
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 10)),
            Text(
              "The payment process will be cancelled.\nClick \"OK\" to proceed",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w400,
                fontSize: Dimensions.fontSize(context, 14),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFFA3A3A5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    Navigator.pop(context);
                  },
                  child: Text("OK", style: TextStyle(color: Colors.white)),
                ),
                SizedBox(width: Dimensions.fontSize(context, 10)),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF4680FE),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () => Navigator.pop(context),
                  child: Text("Cancel", style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class PaymentSuccessScreen extends StatelessWidget {
  final String transactionId;
  final double amount;
  final String paymentMethod;
  final String batchTitle;
  final DateTime paymentDate;

  const PaymentSuccessScreen({
    Key? key,
    required this.transactionId,
    required this.amount,
    required this.paymentMethod,
    required this.batchTitle,
    required this.paymentDate,
  }) : super(key: key);
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: Padding(
          padding: EdgeInsets.all(Dimensions.fontSize(context, 24)),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // Success Icon
              Container(
                width: Dimensions.iconSize(context, 120),
                height: Dimensions.iconSize(context, 120),
                decoration: BoxDecoration(
                  color: Color(0xFFE8F5E9),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.check,
                  size: Dimensions.iconSize(context, 60),
                  color: Color(0xFF4CAF50),
                ),
              ),
              
              SizedBox(height: Dimensions.fontSize(context, 32)),
              
              // Success Title
              Text(
                "Payment Successful!",
                style: TextStyle(
                  fontSize: Dimensions.fontSize(context, 28),
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF4680FE),
                ),
              ),
              
              SizedBox(height: Dimensions.fontSize(context, 16)),
              
              // Success Message
              Text(
                "Your payment has been processed successfully.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: Dimensions.fontSize(context, 16),
                  color: Colors.grey[600],
                ),
              ),
              
              SizedBox(height: Dimensions.fontSize(context, 32)),
              
              // Order Details Card
              Card(
                color: Colors.white,
                elevation: 2,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Padding(
                  padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
                  child: Column(
                    children: [
                      _buildDetailRow(context, "Transaction ID", transactionId),
                      Divider(),
                      _buildDetailRow(context, "Amount Paid", "₹${amount.toStringAsFixed(2)}"),
                      Divider(),
                      _buildDetailRow(context, "Date", "${paymentDate.day}/${paymentDate.month}/${paymentDate.year}"),
                      Divider(),
                      _buildDetailRow(context, "Payment Method", paymentMethod),
                      Divider(),
                      _buildDetailRow(context, "Course", batchTitle),
                    ],
                  ),
                ),
              ),
              
              SizedBox(height: Dimensions.fontSize(context, 40)),
              
              // Continue Button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Color(0xFF4680FE),
                    padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 16)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () {
                    Navigator.pop(context);
                    //Navigator.pop(context);
                  },
                  child: Text(
                    "Continue to Courses",
                    style: TextStyle(
                      fontSize: Dimensions.fontSize(context, 18),
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
              
              SizedBox(height: Dimensions.fontSize(context, 16)),
              
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDetailRow(BuildContext context, String label, String value) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: Dimensions.fontSize(context, 8)),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: TextStyle(
              color: Colors.grey[600],
              fontSize: Dimensions.fontSize(context, 16),
            ),
          ),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: Dimensions.fontSize(context, 16),
            ),
          ),
        ],
      ),
    );
  }
}