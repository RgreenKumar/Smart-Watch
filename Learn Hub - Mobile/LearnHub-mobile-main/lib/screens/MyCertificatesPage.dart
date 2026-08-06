import 'dart:convert';
import 'dart:io';
import '../dimensions.dart';
import '../url.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import 'package:open_file/open_file.dart';
import 'package:path_provider/path_provider.dart';
import 'package:screenshot/screenshot.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:http/http.dart' as http;
import 'package:permission_handler/permission_handler.dart';

class MyCertificateList extends StatefulWidget {
  final int selectedIndex;
  final Function(int, {bool navigateToCertificatesTemplate, String? activityId, bool autoDownload}) onItemTapped;

  const MyCertificateList({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  // ignore: library_private_types_in_public_api
  _MyCertificateListState createState() => _MyCertificateListState();
}

class _MyCertificateListState extends State<MyCertificateList> {
  final _secureStorage = FlutterSecureStorage();
  List<dynamic> myCertificates = [];
  bool isLoading = true;

  @override
  void initState() {
    super.initState();
    fetchCertificates();
  }

  Future<void> fetchCertificates() async {
    try {
      final token = await _secureStorage.read(key: 'token') ?? '';

      final response = await http.get(
        Uri.parse('$baseUrl/certificate/getAllCertificate'),

        headers: {'Authorization': token},
      );
      if (response.statusCode == 200) {
        final List<dynamic> certificates = json.decode(response.body);

        // Fetch courses for the user
        final courseResponse = await http.get(
          Uri.parse('$baseUrl/AssignCourse/student/courselist'),

          headers: {'Authorization': token},
        );
        Map<String, String> courseImages = {};
        if (courseResponse.statusCode == 200) {
          final List<dynamic> courses = json.decode(courseResponse.body);

          // Store course images in Base64 format
          for (var course in courses) {
            courseImages[course['courseName']] = course['courseImage'] ?? "";
          }
        }

        // Add Base64 course image to each certificate
        setState(() {
          myCertificates = certificates.map((cert) {
            String courseName = cert['course'] ?? '';
            return {
              ...cert,
              'courseImage': courseImages[courseName] ?? '',
            };
          }).toList();
          isLoading = false; // Mark fetch as done
        });
      } else {
        throw Exception('Failed to load certificates');
      }
    } catch (e) {
      // ignore: avoid_print
      print('Error fetching certificates: $e');
      setState(() {
    isLoading = false; // Also stop loading on error
  });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Row(
          children: [
            SizedBox(width: Dimensions.fontSize(context, 55)),
            Icon(FontAwesomeIcons.award, color: Colors.black),
            SizedBox(width: Dimensions.fontSize(context, 8)),
            Text(
              "My Certificates",
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
          onPressed: () => widget.onItemTapped(3), // Go back to Profile Page
        ),
      ),
      body: 
      // myCertificates.isEmpty
      //     ? Center(child: CircularProgressIndicator())
      isLoading
    ? const Center(child: CircularProgressIndicator())
    : myCertificates.isEmpty
        ? const Center(
            child: Text(
              'No certificates found',
              style: TextStyle(
                // fontSize: 18,
                // fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
          )
          : GridView.builder(
              padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 3 / 4,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: myCertificates.length,
              itemBuilder: (context, index) {
                final cert = myCertificates[index];
                return CertificateCard(
                  title: cert['course'] ?? '',
                  date: cert['testDate'] ?? '',
                  // percentage: cert['percentage']?.toString() ?? '',
                  percentage: double.tryParse(cert['percentage']?.toString() ?? '0') ?? 0.0, // Convert to double
                  courseImage: cert['courseImage'] ?? '',
                  onPreview: () {
                    final activityId = cert['activityId']?.toString() ?? '';
widget.onItemTapped(3, navigateToCertificatesTemplate: true, activityId: activityId);

                    
                  },
                  onDownload: () async {
    final activityId = cert['activityId']?.toString() ?? '';
    widget.onItemTapped(
      3, 
      navigateToCertificatesTemplate: true, 
      activityId: activityId, 
      autoDownload: true,
    );
  },
                  
                );
              },
            ),
    );
  }
}

class CertificateCard extends StatelessWidget {
  final String title;
  final String date;
  //final String percentage;
  final double percentage;  // Changed from String to double for numerical formatting
  final String courseImage;
  final VoidCallback onPreview;
  final VoidCallback onDownload;

  // ignore: use_key_in_widget_constructors
  const CertificateCard({
    required this.title,
    required this.date,
    required this.percentage,
    required this.courseImage,
    required this.onPreview,
    required this.onDownload,
  });
@override
Widget build(BuildContext context) {
  return Card(
    color: Colors.white,
    elevation: 3,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(10),
      side: BorderSide(color: Color(0xFFA3A3A5), width: 1),
    ),
    child: Padding(
      padding: EdgeInsets.all(Dimensions.fontSize(context, 5)),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: Dimensions.fontSize(context, 120),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(8),
                image: DecorationImage(
                  image: courseImage.isNotEmpty
                      ? MemoryImage(base64Decode(courseImage))
                      : AssetImage("assets/Course Image.png") as ImageProvider,
                  fit: BoxFit.cover,
                ),
              ),
            ),
            Padding(
              padding: EdgeInsets.all(Dimensions.fontSize(context, 5)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: TextStyle(
                          fontWeight: FontWeight.w500,
                          fontFamily: 'Inter',
                          fontSize: Dimensions.fontSize(context, 16),
                          color: Colors.black)),
                  SizedBox(height: Dimensions.fontSize(context, 6)),
                  Text(
                    "${DateFormat('dd-MM-yyyy').format(DateTime.parse(date))}                 ${percentage.toStringAsFixed(1)}%",
                    style: TextStyle(
                        fontSize: Dimensions.fontSize(context, 12),
                        color: Colors.black,
                        fontWeight: FontWeight.w300,
                        fontFamily: 'Poppins'),
                  ),
                  Center(
                    child: TextButton(
                      onPressed: onDownload,
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.download, size: Dimensions.fontSize(context, 15), color: Colors.blue),
                          SizedBox(width: 2),
                          Text("Download",
                              style: TextStyle(
                                  fontSize: Dimensions.fontSize(context, 15), color: Colors.blue)),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    ),
  );
}
}

class CertificateTemplate extends StatefulWidget {
  final String activityId;
  // final String activityId;
  final bool autoDownload;
  //final Function(int) onItemTapped;
  final Function(int, {bool navigateToMyCertificates}) onItemTapped;


  // ignore: prefer_const_constructors_in_immutables
  CertificateTemplate(
      {super.key, required this.activityId, this.autoDownload = false,required this.onItemTapped,});

  // ignore: prefer_const_constructors_in_immutables
  // CertificateTemplate({super.key, required this.activityId});

  @override
  // ignore: library_private_types_in_public_api
  _CertificateTemplateState createState() => _CertificateTemplateState();
}

class _CertificateTemplateState extends State<CertificateTemplate> {
  final _secureStorage = FlutterSecureStorage();
  bool _isDownloading = false;
  final ScreenshotController _screenshotController = ScreenshotController();

  Map<String, dynamic> userData = {};
  Map<String, dynamic> defaultCerti = {
    'institutionName': '',
    'ownerName': '',
    'qualification': '',
    'address': '',
    'authorizedSign': null,
  };
  String? signImage;
  bool isNotFound = false;

  @override
  void initState() {
    super.initState();
    fetchCertificate();
  }
  Future<void> fetchCertificate() async {
    try {
      final token = await _secureStorage.read(key: 'token') ?? '';

      // Fetch default certificate details
      final certResponse = await http.get(
        Uri.parse('$baseUrl/certificate/viewAll'),

        headers: {'Authorization': token},
      );

      if (certResponse.statusCode == 200) {
        final certData = json.decode(certResponse.body);
        setState(() {
          defaultCerti = certData;
          signImage = 'data:image/jpeg;base64,${certData['authorizedSign']}';
        });

        // Fetch user certificate data
        final userResponse = await http.get(
          Uri.parse(
              '$baseUrl/certificate/getByActivityId/${widget.activityId}'),

          headers: {'Authorization': token},
        );

        if (userResponse.statusCode == 200) {
          setState(() {
            userData = json.decode(userResponse.body);
          });

          // Auto-download the certificate after data is loaded
          if (widget.autoDownload) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              downloadPdf();
            });
          }
        }
      } else if (certResponse.statusCode == 204) {
        setState(() => isNotFound = true);
      }
    } catch (e) {
      // ignore: avoid_print
      print('Error fetching certificate: $e');
    }
  }

  String formatDate(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final date = DateTime.parse(dateStr);
      return DateFormat('dd-MM-yyyy').format(date);
    } catch (e) {
      return dateStr; // Return original if parsing fails
    }
  }
  
Future<void> downloadPdf() async {
    if (_isDownloading) return;
    setState(() => _isDownloading = true);

    try {
      // Request storage permission (for Android)
      if (Platform.isAndroid) {
        final status = await Permission.storage.request();
        if (!status.isGranted) {
          debugPrint("Storage permission required to download");
        
          return;
        }
      }

      // Capture screenshot
      final image = await _screenshotController.capture();
      if (image == null) throw Exception('Failed to capture certificate image');

      // Create PDF
      final pdf = pw.Document();
      pdf.addPage(
        pw.Page(
          build: (pw.Context context) => pw.Center(
            child: pw.Image(pw.MemoryImage(image)),
          ),
        ),
      );

      // Save to downloads directory
      final directory = await getDownloadsDirectory();
      final timestamp = DateFormat('yyyyMMdd_HHmmss').format(DateTime.now());
      final filePath = '${directory?.path}/certificate_$timestamp.pdf';
      final file = File(filePath);
      await file.writeAsBytes(await pdf.save());

      // Open the file
      final result = await OpenFile.open(filePath);
      if (result.type != ResultType.done) {
        throw Exception('Failed to open file: ${result.message}');
      }
debugPrint("Certificate saved to $filePath");
      // );
    } catch (e) {
      debugPrint("Download failed: ${e.toString()}");
      debugPrint('Download error: $e');
    } finally {
      setState(() => _isDownloading = false);
    }
  }
  @override
  Widget build(BuildContext context) {
return Scaffold(
  backgroundColor: Colors.white,
  appBar: AppBar(
    backgroundColor: Colors.white,
    title: Row(
      children: [
        SizedBox(width: Dimensions.fontSize(context, 55)),
        Icon(FontAwesomeIcons.award, color: Colors.black),
        SizedBox(width: Dimensions.fontSize(context, 8)),
        Text(
          "My Certificates",
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
      icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.black),
      onPressed: () {
        widget.onItemTapped(3, navigateToMyCertificates: true);
      },
    ),
  ),
  body: isNotFound
      ? Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'Some error occurred. Please try again later! If the issue persists, contact your administrator.',
                textAlign: TextAlign.center,
              ),
              SizedBox(height: Dimensions.fontSize(context, 16)),
              ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4680FE),
                  padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 100), vertical: Dimensions.fontSize(context, 150)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  'Go Back',
                  style: TextStyle(
                    fontSize: Dimensions.fontSize(context, 18),
                    fontFamily: 'Poppins',
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        )
      : Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Screenshot(
                controller: _screenshotController,
                child: Card(
                  margin: const EdgeInsets.all(20),
                  color: const Color(0xFFFFFFFF),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(2),
                    side: const BorderSide(color: Color(0xFFB0B5E2), width: 4),
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          'Certificate of Completion',
                          style: TextStyle(
                            fontSize: Dimensions.fontSize(context, 20),
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF35477d),
                          ),
                        ),
                        SizedBox(height: Dimensions.fontSize(context, 10)),
                        Text(
                          'This is to certify that',
                          style: TextStyle(fontSize: Dimensions.fontSize(context, 15)),
                        ),
                        SizedBox(height: Dimensions.fontSize(context, 10)),
                        Text(
                          userData['user'] ?? '',
                          style: TextStyle(
                            fontSize: Dimensions.fontSize(context, 18),
                            color: Color(0xFF35477d),
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        SizedBox(height: Dimensions.fontSize(context, 10)),
                        Text(
                          'has successfully completed the online course of ${userData['course'] ?? ''} on ${formatDate(userData['testDate'])}',
                          style: TextStyle(fontSize: Dimensions.fontSize(context, 15)),
                          textAlign: TextAlign.center,
                        ),
                        SizedBox(height: Dimensions.fontSize(context, 20)),
                        if (signImage != null)
                          Image.memory(
                            base64Decode(signImage!.split(',').last),
                            width: Dimensions.iconSize(context, 100),
                            height: Dimensions.iconSize(context, 50),
                          ),
                        SizedBox(height: Dimensions.fontSize(context, 10)),
                        Text(defaultCerti['ownerName'] ?? ''),
                        Text(defaultCerti['qualification'] ?? ''),
                        Text(defaultCerti['address'] ?? ''),
                      ],
                    ),
                  ),
                ),
              ),
              SizedBox(height: Dimensions.fontSize(context, 30)),
              ElevatedButton(
                onPressed: downloadPdf,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4680FE),
                  padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 100), vertical: Dimensions.fontSize(context, 15)),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                child: Text(
                  "Download",
                  style: TextStyle(
                    fontSize: Dimensions.fontSize(context, 18),
                    fontFamily: 'Poppins',
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
        ),
);
  }
}