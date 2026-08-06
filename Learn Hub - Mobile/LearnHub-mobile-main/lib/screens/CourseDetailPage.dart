// ignore_for_file: library_private_types_in_public_api, deprecated_member_use, no_leading_underscores_for_local_identifiers, unnecessary_import

import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';
import '../dimensions.dart';
import '../url.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;

// import 'package:learnhub/screens/WelcomePage.dart';
import 'package:video_player/video_player.dart';
import 'package:youtube_player_flutter/youtube_player_flutter.dart';
import 'package:chewie/chewie.dart';
import 'package:learnhub/screens/QuizScreen.dart';

// import 'HomePage.dart';
// import 'MeetingPage.dart';
// import 'ProfilePage.dart';
class CourseDetailPage extends StatefulWidget {
  final int selectedIndex;
  final Function(
    int, {
    bool navigateToDetails,
    bool navigateToEditProfile,
    bool navigateToMyCourses,
    bool navigateToMyCertificates,
    bool navigateToCertificatesTemplate,
    bool navigateToMyPayments,
    String? activityId,
  }) onItemTapped;
  final String courseId;
  final String courseName;
  final String courseDescription;

  const CourseDetailPage({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
    required this.courseId,
    required this.courseName,
    required this.courseDescription,
  });

  @override
  _CourseDetailPageState createState() => _CourseDetailPageState();
}

class _CourseDetailPageState extends State<CourseDetailPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final FlutterSecureStorage storage = const FlutterSecureStorage();
  int _selectedLessonIndex = 0;
  bool isLoading = true;
  List<Map<String, dynamic>> lessons = [];
  String _currentVideoUrl = '';
  String _currentLessonTitle = '';
  Uint8List? _currentThumbnail;
  YoutubePlayerController? _youtubeController;
  VideoPlayerController? _videoController;
  ChewieController? _chewieController;
  bool _isVideoInitialized = false;
  bool _isDisposing = false;
  bool _isInitializing = false;
  Completer<void>? _disposeCompleter;
  bool _hasTestAvailable = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    fetchLessons();
    _checkTestAvailability();
  }

  Future<void> _checkTestAvailability() async {
    final url = "$baseUrl/test/getTestByCourseId/${widget.courseId}";
    final String? token = await storage.read(key: "token");

    if (token == null) return;

    try {
      final response = await http.get(
        Uri.parse(url),
        headers: {"Authorization": token},
      );

      if (mounted) {
        setState(() {
          _hasTestAvailable = response.statusCode == 200;
        });
      }
    } catch (e) {
      debugPrint("Error checking test availability: $e");
      if (mounted) {
        setState(() {
          _hasTestAvailable = false;
        });
      }
    }
  }

  Future<void> fetchLessons() async {
    final url = "$baseUrl/course/getLessondetail/${widget.courseId}";
    debugPrint("CourseId: ${widget.courseId}");
    final String? token = await storage.read(key: "token");
    if (token == null) {
      throw Exception("No token found. Please log in again.");
    }

    try {
      final response = await http.get(Uri.parse(url), headers: {
        "Authorization": token,
      });

      if (response.statusCode == 200) {
        List<dynamic> data = jsonDecode(response.body);
        setState(() {
          lessons = data.map((lesson) {
            return {
              "title": lesson["lessontitle"],
              "subtitle": lesson["lessonDescription"],
              "videoUrl": lesson["fileUrl"],
              "thumbnail": lesson["thumbnail"] != null
                  ? base64Decode(lesson["thumbnail"])
                  : null,
            };
          }).toList();
          debugPrint("Lessons Data: $lessons");

          if (lessons.isNotEmpty) {
            _setLesson(0);
          }
          isLoading = false;
        });
      } else {
        debugPrint(
            "Error: Server responded with status ${response.statusCode}");
        debugPrint("Response body: ${response.body}");
        throw Exception("Failed to load lesson details");
      }
    } catch (e) {
      debugPrint("Error fetching lessons: $e");
      if (mounted) {
        setState(() {
          isLoading = false;
        });
      }
    }
  }

  Future<void> _disposeControllers() async {
    if (_isDisposing) return;
    _isDisposing = true;

    _disposeCompleter ??= Completer<void>();

    try {
      _isInitializing = false;

      if (_chewieController != null) {
        _chewieController!.dispose();
        _chewieController = null;
      }

      if (_videoController != null) {
        await _videoController!.dispose();
        _videoController = null;
      }

      if (_youtubeController != null) {
        _youtubeController!.removeListener(_youtubeListener);
        _youtubeController!.pause();
        _youtubeController!.dispose();
        _youtubeController = null;
      }

      _disposeCompleter?.complete();
    } catch (e) {
      _disposeCompleter?.completeError(e);
      rethrow;
    } finally {
      _isDisposing = false;
      _disposeCompleter = null;
    }
  }

  void _youtubeListener() {
    if (_isDisposing || !mounted) return;
  }

  Future<void> _initializeVideo(String url) async {
    if (_isDisposing || _isInitializing || !mounted) return;

    _isInitializing = true;
    try {
      await _disposeCompleter?.future;

      if (_isDisposing || !mounted) return;

      if (url.contains("youtube.com") || url.contains("youtu.be")) {
        String? videoId = YoutubePlayer.convertUrlToId(url);

        if (videoId == null) {
          // handle invalid/unparseable YouTube URL — e.g. show an error, skip playback
          print("Could not extract video ID from URL: $url");
          return; // or whatever fallback makes sense in this context
        }

        _youtubeController = YoutubePlayerController(
          initialVideoId: videoId, // ✅ now smart-cast to String
          flags: const YoutubePlayerFlags(
            autoPlay: false,
            mute: false,
            disableDragSeek: true,
            enableCaption: false,
          ),
        )..addListener(_youtubeListener);
      } else {
        _videoController = VideoPlayerController.network(url);
        await _videoController!.initialize();

        _chewieController = ChewieController(
          videoPlayerController: _videoController!,
          autoPlay: false,
          looping: false,
          allowFullScreen: true,
          allowMuting: true,
          showControls: true,
          materialProgressColors: ChewieProgressColors(
            playedColor: Color(0xFF4680FE),
            handleColor: Color(0xFF4680FE),
            backgroundColor: Colors.grey,
            bufferedColor: Colors.grey,
          ),
        );
      }

      if (!_isDisposing && mounted) {
        setState(() {
          _isVideoInitialized = true;
          _isInitializing = false;
        });
      }
    } catch (e) {
      _isInitializing = false;
      if (!_isDisposing && mounted) {
        debugPrint("Failed to load video: ${e.toString()}");
      }
      if (!_isDisposing && mounted && _currentVideoUrl.isNotEmpty) {
        await _initializeVideo(_currentVideoUrl);
      }
    }
  }

  Future<void> _setLesson(int index) async {
    if (_isDisposing || !mounted) return;

    setState(() {
      _selectedLessonIndex = index;
      _currentVideoUrl = lessons[index]["videoUrl"];
      _currentLessonTitle = lessons[index]["title"];
      _currentThumbnail = lessons[index]["thumbnail"] as Uint8List?;
      _isVideoInitialized = false;
    });

    try {
      await _disposeControllers();
      await _initializeVideo(_currentVideoUrl);
    } catch (e) {
      debugPrint("Error switching lesson: $e");
      if (mounted) {
        debugPrint("Failed to switch lesson");
      }
    }
  }

  @override
  void dispose() {
    _isDisposing = true;
    _disposeControllers().then((_) {
      _tabController.dispose();
      super.dispose();
    }).catchError((e) {
      debugPrint("Error disposing controllers: $e");
      _tabController.dispose();
      super.dispose();
    });
  }

  Widget _buildVideoPlayer() {
    if (_isDisposing || _isInitializing) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            CircularProgressIndicator(),
            SizedBox(height: 10),
            Text("Loading video..."),
          ],
        ),
      );
    }

    if (!_isVideoInitialized) {
      return Stack(
        alignment: Alignment.center,
        children: [
          _currentThumbnail != null
              ? Image.memory(
                  _currentThumbnail!,
                  height: 250,
                  width: double.infinity,
                  fit: BoxFit.cover,
                )
              : Image.asset(
                  'assets/image340.png',
                  height: 250,
                  width: double.infinity,
                  fit: BoxFit.cover,
                ),
          const Icon(
            Icons.play_circle_filled_rounded,
            size: 70,
            color: Colors.white,
          ),
          Positioned(
            top: 16,
            left: 16,
            child: GestureDetector(
              onTap: () => Navigator.pop(context),
              child: CircleAvatar(
                backgroundColor: Colors.black.withOpacity(0.5),
                child: const Icon(Icons.arrow_back_ios_new_rounded,
                    color: Colors.white),
              ),
            ),
          ),
        ],
      );
    }

    Widget playerWidget;
    if (_youtubeController != null) {
      playerWidget = YoutubePlayer(
        controller: _youtubeController!,
        showVideoProgressIndicator: true,
        progressIndicatorColor: Color(0xFF4680FE),
      );
    } else if (_chewieController != null &&
        _videoController?.value.isInitialized == true) {
      playerWidget = Chewie(controller: _chewieController!);
    } else {
      playerWidget = Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.error, size: 50, color: Colors.white),
            const Text("Video unavailable",
                style: TextStyle(color: Colors.white)),
            ElevatedButton(
              onPressed: () => _setLesson(_selectedLessonIndex),
              child: const Text("Retry"),
            )
          ],
        ),
      );
    }

    return Stack(
      children: [
        playerWidget,
        Positioned(
          top: 16,
          left: 16,
          child: GestureDetector(
            onTap: () => Navigator.pop(context),
            child: CircleAvatar(
              backgroundColor: Colors.black.withOpacity(0.5),
              child: const Icon(Icons.arrow_back_ios_new_rounded,
                  color: Colors.white),
            ),
          ),
        ),
      ],
    );
  }

  void _playVideo() {
    if (_youtubeController != null) {
      _youtubeController!.play();
    } else if (_chewieController != null) {
      _chewieController!.play();
    }
  }

  @override
  Widget build(BuildContext context) {
    final topPadding = MediaQuery.of(context).padding.top - 25;
    // final bottomPadding = MediaQuery.of(context).padding.bottom;
    // final double screenWidth = MediaQuery.of(context).size.width;
    // final List<String> _labels = ["Home", "Courses", "Meetings", "Profile"];
    // final List<IconData?> _icons = [
    //   Icons.home,
    //   null, // Placeholder for image
    //   Icons.videocam,
    //   Icons.person,
    // ];
    // final int totalItems = _icons.length;
    // final double itemWidth = screenWidth / totalItems;

    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        systemNavigationBarColor: Colors.white,
        systemNavigationBarIconBrightness: Brightness.dark,
      ),
      child: Scaffold(
        backgroundColor: const Color(0xffffffff),
        body: SafeArea(
          bottom: false,
          child: isLoading
              ? const Center(child: CircularProgressIndicator())
              : Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        child: Column(
                          children: [
                            Padding(
                              padding: EdgeInsets.only(top: topPadding),
                              child: GestureDetector(
                                onTap: _isVideoInitialized ? _playVideo : null,
                                child: Container(
                                  height: Dimensions.fontSize(context, 250),
                                  width: double.infinity,
                                  color: Colors.black,
                                  child: _buildVideoPlayer(),
                                ),
                              ),
                            ),
                            Padding(
                              padding: EdgeInsets.all(
                                  Dimensions.fontSize(context, 16)),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _currentLessonTitle,
                                    style: TextStyle(
                                        color: Color(0xFF000000),
                                        fontSize:
                                            Dimensions.fontSize(context, 24),
                                        fontWeight: FontWeight.w500,
                                        fontFamily: 'Roboto'),
                                  ),
                                  SizedBox(
                                      height: Dimensions.fontSize(context, 8)),
                                  Text(
                                    widget.courseName,
                                    style: TextStyle(
                                        fontSize:
                                            Dimensions.fontSize(context, 16),
                                        color: Color(0xFFA3A3A5),
                                        fontWeight: FontWeight.w500,
                                        fontFamily: 'Roboto'),
                                  ),
                                  SizedBox(
                                      height: Dimensions.fontSize(context, 8)),
                                  Row(
                                    children: [
                                      Text(
                                        "Lesson - ${_selectedLessonIndex + 1} ",
                                        style: TextStyle(
                                            fontSize: Dimensions.fontSize(
                                                context, 16),
                                            color: Color(0xFF4680FE),
                                            fontWeight: FontWeight.w500,
                                            fontFamily: 'Roboto'),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            TabBar(
                              controller: _tabController,
                              labelColor: const Color(0xFF4680FE),
                              unselectedLabelColor: const Color(0xFF000000),
                              indicatorColor: const Color(0xFF4680FE),
                              labelStyle: TextStyle(
                                  fontSize: Dimensions.fontSize(context, 20),
                                  fontWeight: FontWeight.w500,
                                  fontFamily: 'Roboto'),
                              unselectedLabelStyle: TextStyle(
                                  fontSize: Dimensions.fontSize(context, 20),
                                  fontWeight: FontWeight.w500,
                                  fontFamily: 'Roboto'),
                              tabs: const [
                                Tab(text: "Description"),
                                Tab(text: "Lessons"),
                              ],
                            ),
                            SizedBox(
                              height: MediaQuery.of(context).size.height * 0.5,
                              child: TabBarView(
                                controller: _tabController,
                                children: [
                                  Padding(
                                    padding: EdgeInsets.all(
                                        Dimensions.fontSize(context, 16)),
                                    child: Text(
                                      widget.courseDescription,
                                      style: TextStyle(
                                          fontSize:
                                              Dimensions.fontSize(context, 18),
                                          fontFamily: 'Inter',
                                          fontWeight: FontWeight.w400),
                                      maxLines: 10,
                                      overflow: TextOverflow.ellipsis,
                                      textAlign: TextAlign.justify,
                                    ),
                                  ),
                                  ListView.builder(
                                    padding: EdgeInsets.all(
                                        Dimensions.fontSize(context, 16)),
                                    itemCount: lessons.length +
                                        (_hasTestAvailable ? 1 : 0),
                                    itemBuilder: (context, index) {
                                      if (index < lessons.length) {
                                        return LessonTile(
                                          title: lessons[index]["title"] ??
                                              "No Title",
                                          subtitle: lessons[index]
                                                  ["subtitle"] ??
                                              "No Description",
                                          imageUrl: lessons[index]
                                                      ["thumbnail"] !=
                                                  null
                                              ? MemoryImage(
                                                  lessons[index]["thumbnail"])
                                              : null,
                                          isSelected:
                                              _selectedLessonIndex == index,
                                          onTap: () => _setLesson(index),
                                        );
                                      } else {
                                        return Padding(
                                          padding: const EdgeInsets.only(
                                              top: 16.0, bottom: 32.0),
                                          child: ElevatedButton(
                                            onPressed: () {
                                              Navigator.push(
                                                context,
                                                MaterialPageRoute(
                                                    builder: (context) =>
                                                        TestInstructionsScreen(
                                                            courseId: widget
                                                                .courseId)),
                                              );
                                            },
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor:
                                                  const Color(0xFF4680FE),
                                              padding: EdgeInsets.symmetric(
                                                  vertical: Dimensions.fontSize(
                                                      context, 14)),
                                              shape: RoundedRectangleBorder(
                                                borderRadius:
                                                    BorderRadius.circular(10),
                                              ),
                                            ),
                                            child: Center(
                                              child: Text(
                                                "Start Test",
                                                style: TextStyle(
                                                  fontSize: Dimensions.fontSize(
                                                      context, 18),
                                                  fontWeight: FontWeight.w600,
                                                  fontFamily: 'Roboto',
                                                  color: Colors.white,
                                                ),
                                              ),
                                            ),
                                          ),
                                        );
                                      }
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
//                     Container(
//   height: 60 + bottomPadding,
//   padding: EdgeInsets.only(bottom: bottomPadding),
//   child: Stack(
//     clipBehavior: Clip.none,
//     children: [
//       CustomPaint(
//         size: Size(screenWidth, 70),
//         painter: BottomNavBarPainter(widget.selectedIndex, totalItems),
//       ),
//       Positioned(
//         top: -30,
//         left: (itemWidth * widget.selectedIndex) + (itemWidth / 2) - 30,
//         child: AnimatedContainer(
//           duration: const Duration(milliseconds: 300),
//           height: 60,
//           width: 60,
//           decoration: BoxDecoration(
//             color: const Color(0xFF4680FE),
//             shape: BoxShape.circle,
//             boxShadow: [
//               BoxShadow(
//                 color: Colors.black.withOpacity(0.2),
//                 blurRadius: 10,
//                 spreadRadius: 1,
//               ),
//             ],
//           ),
//           child: _icons[widget.selectedIndex] == null
//               ? Image.asset('assets/book_icon.png',
//                   width: 24, height: 24, color: Colors.white)
//               : Icon(_icons[widget.selectedIndex],
//                   size: 30, color: Colors.white),
//         ),
//       ),
//       Positioned.fill(
//         child: Row(
//           mainAxisAlignment: MainAxisAlignment.spaceAround,
//           children: List.generate(totalItems, (index) {
//             return GestureDetector(
//               onTap: () {
//                 widget.onItemTapped(index);
//                 if (index == 1) {
//                   // Stay on CourseDetailPage
//                   widget.onItemTapped(
//                     index,
//                     navigateToDetails: true,
//                   );
//                 } else if (index == 2) {
//                   // Navigate to MeetingPage (replace completely)//AndRemoveUntil
//                   Navigator.pushReplacement(
//                     context,
//                     MaterialPageRoute(
//                       builder: (context) => MeetingPage(
//                         selectedIndex: 2,
//               onItemTapped: (index) {},
//                       ),
//                     ),
//                     // (route) => false,
//                   );
//                 } else if (index == 3) {
//                   // Navigate to ProfilePage (replace completely)
//                   Navigator.pushAndRemoveUntil(
//                     context,
//                     MaterialPageRoute(
//                       builder: (context) => ProfilePage(
//                         selectedIndex: 3,
//                         onItemTapped: widget.onItemTapped,
//                       ),
//                     ),
//                     (route) => false,
//                   );
//                 }
//                 else if (index == 0) {
//                   // Navigate to ProfilePage (replace completely)
//                   Navigator.pushAndRemoveUntil(
//                     context,
//                     MaterialPageRoute(
//                       builder: (context) => WelcomePage(
//                         // selectedIndex: 3,
//                         // onItemTapped: widget.onItemTapped,
//                       ),
//                     ),
//                     (route) => false,
//                   );
//                 } else {
//                   // Navigate to HomeScreen (replace completely)
//                   Navigator.pushAndRemoveUntil(
//                     context,
//                     MaterialPageRoute(
//                       builder: (context) => HomeScreen(),
//                     ),
//                     (route) => false,
//                   );
//                 }
//               },
//               child: Column(
//                 mainAxisSize: MainAxisSize.min,
//                 mainAxisAlignment: MainAxisAlignment.center,
//                 children: [
//                   if (index != widget.selectedIndex)
//                     index == 1
//                         ? Image.asset('assets/book_icon_2.png',
//                             width: 20, height: 20)
//                         : Icon(_icons[index],
//                             size: 24, color: Colors.black),
//                   if (index == widget.selectedIndex)
//                     Padding(
//                       padding: const EdgeInsets.only(top: 35.0),
//                       child: Text(
//                         _labels[index],
//                         style: const TextStyle(
//                             fontSize: 14,
//                             fontWeight: FontWeight.bold,
//                             color: Colors.black),
//                       ),
//                     ),
//                 ],
//               ),
//             );
//           }),
//         ),
//       ),
//     ],
//   ),
// ),
                  ],
                ),
        ),
      ),
    );
  }
}

// class BottomNavBarPainter extends CustomPainter {
//   final int selectedIndex;
//   final int totalItems;

//   BottomNavBarPainter(this.selectedIndex, this.totalItems);

//   @override
//   void paint(Canvas canvas, Size size) {
//     // Draw white background
//     final backgroundPaint = Paint()
//       ..color = Colors.white
//       ..style = PaintingStyle.fill;

//     canvas.drawRect(
//       Rect.fromLTWH(0, 0, size.width, size.height),
//       backgroundPaint,
//     );

//     final paint = Paint()
//       ..color = Color(0xFFD9D9D9)
//       ..style = PaintingStyle.fill;

//     final path = Path();
//     final segmentWidth = size.width / totalItems;
//     final circleRadius = 30.0;
//     final circleCenterX = segmentWidth * selectedIndex + segmentWidth / 2;

//     path.moveTo(0, 0);
//     path.lineTo(circleCenterX - circleRadius - 10, 0);

//     path.quadraticBezierTo(
//       circleCenterX - circleRadius,
//       35,
//       circleCenterX,
//       35,
//     );

//     path.quadraticBezierTo(
//       circleCenterX + circleRadius,
//       35,
//       circleCenterX + circleRadius + 10,
//       0,
//     );

//     path.lineTo(size.width, 0);
//     path.lineTo(size.width, size.height);
//     path.lineTo(0, size.height);
//     path.close();

//     canvas.drawPath(path, paint);
//   }

//   @override
//   bool shouldRepaint(covariant CustomPainter oldDelegate) {
//     return true;
//   }
// }

class LessonTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final ImageProvider? imageUrl;
  final bool isSelected;
  final VoidCallback onTap;

  const LessonTile({
    super.key,
    required this.title,
    required this.subtitle,
    required this.imageUrl,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 15),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color:
                isSelected ? const Color(0xFF4680FE) : const Color(0xFFA3A3A5),
            width: 1.5,
          ),
        ),
        child: SizedBox(
          height: 100,
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: imageUrl != null
                      ? Image(
                          image: imageUrl!,
                          width: 130,
                          height: 100,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.image_not_supported, size: 100),
                        )
                      : const Icon(Icons.video_library, size: 100),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                          fontFamily: 'Roboto',
                          color: Color(0xFF000000),
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        subtitle,
                        style: const TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w300,
                          color: Color(0xFF2E2E2E),
                          fontFamily: 'Roboto',
                        ),
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
  }
}

class CustomTextField extends StatelessWidget {
  final String hintText;
  const CustomTextField({super.key, required this.hintText});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8.0),
      child: TextField(
        decoration: InputDecoration(
            hintText: hintText,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(color: Color(0xFFA3A3A5)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(
                  color: Color(0xFFA3A3A5)), // Change to your desired color
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(6),
              borderSide: BorderSide(color: Color(0xFFA3A3A5)),
            ),
            hintStyle: TextStyle(
                fontFamily: 'Poppins',
                fontWeight: FontWeight.w400,
                fontSize: 17,
                color: Color(0xFF929398))),
      ),
    );
  }
}
