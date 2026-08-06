// ignore_for_file: unused_element, use_build_context_synchronously, avoid_print, deprecated_member_use, sort_child_properties_last

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../dimensions.dart';
import '../url.dart';


class MeetingPage extends StatefulWidget {
 // const MeetingPage({super.key});
  final int selectedIndex;
  final Function(int) onItemTapped;

  // ignore: prefer_const_constructors_in_immutables
  MeetingPage({
    super.key,
    required this.selectedIndex,
    required this.onItemTapped,
  });

  @override
  // ignore: library_private_types_in_public_api
  _MeetingPageState createState() => _MeetingPageState();
}

class _MeetingPageState extends State<MeetingPage> {
  String selectedView = "Month";
  DateTime _currentDate = DateTime.now();
  CalendarView _calendarView = CalendarView.month;
  List<Appointment> _meetings = [];
  final FlutterSecureStorage _storage = FlutterSecureStorage();
  final TextEditingController _meetingIdController = TextEditingController();
  @override
  void initState() {
    super.initState();
    _fetchMeetings();
  }


void _showMeetingNotStartedDialog(BuildContext context) {
  showDialog(
    context: context,
    builder: (context) => Dialog(
      backgroundColor: const Color(0xFFFFFFFF),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 30)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              "Meeting Not Started",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 20),
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
                color: Color(0xFF000000),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 10)),
            Text(
              "The meeting has not started yet. Please try again later.",
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 16),
                fontFamily: 'Poppins',
                color: Color(0xFF707070),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // Close the dialog
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4680FE),
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                "OK",
                style: TextStyle(
                  color: Color(0xFFFFFFFF),
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w600,
                  fontSize: Dimensions.fontSize(context, 20),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

void _showMeetingCompletedDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: const Color(0xFFFFFFFF),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(15),
      ),
      child: Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 30)),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
        Text("Meeting Completed",
        textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 20),
                fontWeight: FontWeight.w600,
                fontFamily: 'Poppins',
                color: Color(0xFF000000),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 10)),
        Text("The meeting has already been completed.",textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: Dimensions.fontSize(context, 16),
                fontFamily: 'Poppins',
                color: Color(0xFF707070),
              ),
            ),
            SizedBox(height: Dimensions.fontSize(context, 20)),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(context); // Close the dialog
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF4680FE),
                elevation: 3,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              child: Text(
                "OK",
                style: TextStyle(
                  color: Color(0xFFFFFFFF),
                  fontFamily: 'Poppins',
                  fontWeight: FontWeight.w600,
                  fontSize: Dimensions.fontSize(context, 20),
                ),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

Future<void> _joinMeeting(BuildContext context, int meetingId) async {
  try {
    String? token = await _storage.read(key: "token");
    if (token == null) return;

    // Fetch meeting details
    final meeting = _meetings.firstWhere(
      (m) => m.id == meetingId,
      orElse: () => Appointment(
        startTime: DateTime.now(),
        endTime: DateTime.now(),
        subject: "Unknown Meeting",
        color: Colors.grey,
        notes: null,
        id: -1,
      ),
    );

    if (meeting.id == -1) {
      _showErrorDialog(context, "Meeting not found");
      return;
    }

    // Check if we already have a join URL
    String? joinUrl = meeting.notes;
    if (joinUrl!.isEmpty) {
      // Fetch join URL from backend
      final response = await http.get(
        Uri.parse('$baseUrl/api/zoom/Join/$meetingId'),
        headers: {'Authorization': token},
      );

      if (response.statusCode == 200) {
        final responseData = jsonDecode(response.body);
        joinUrl = responseData is String ? responseData : responseData['joinUrl'];
      } else {
        _showErrorDialog(context, "Failed to get meeting link");
        return;
      }
    }

    // Validate URL
    if (joinUrl == null || joinUrl.isEmpty) {
      _showErrorDialog(context, "Invalid meeting link");
      return;
    }

    // Launch the meeting
    final uri = Uri.parse(joinUrl);
    if (await canLaunchUrl(uri)) {
      await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
    } else {
      _showErrorDialog(context, "Could not launch Zoom app");
    }
  } catch (e) {
    debugPrint("Error joining meeting: $e");
    _showErrorDialog(context, "An error occurred while joining");
  }
}

void _showErrorDialog(BuildContext context, String message) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      title: Text("Error"),
      content: Text(message),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text("OK"),
        ),
      ],
    ),
  );
}

// Fetch Meetings
Future<void> _fetchMeetings() async {
  String? token = await _storage.read(key: "token"); 
  if (token == null) return;

  final url = Uri.parse('$baseUrl/api/zoom/getMyMeetings');

  final response = await http.get(
    url,
    headers: {'Authorization': token},
  );

  if (response.statusCode == 200) {
    List<dynamic> data = json.decode(response.body);

    List<Appointment> meetings = data.map((meeting) {
      DateTime startTimeUtc = DateTime.parse(meeting['startTime']);
      DateTime startTimeLocal = startTimeUtc.toLocal();
      DateTime endTimeLocal = startTimeLocal.add(Duration(minutes: meeting['duration'] ?? 0));

      return Appointment(
        startTime: startTimeLocal,
        endTime: endTimeLocal,
        subject: meeting['topic'] ?? 'Meeting',
        color: const Color(0xFF4680FE),
        notes: meeting['joinUrl'],
        id: meeting['meetingId'],
      );
    }).toList();

    await _saveMeetingsLocally(meetings);

    if (mounted) {
      setState(() {
        _meetings = meetings;
      });
    }
  } else {
    print("Failed to load meetings: ${response.statusCode}");
    print("Response body: ${response.body}");
  }
}

// Save Meetings Locally
Future<void> _saveMeetingsLocally(List<Appointment> meetings) async {
  final SharedPreferences prefs = await SharedPreferences.getInstance();
  List<String> meetingList = meetings.map((meeting) => json.encode({
        'startTime': meeting.startTime.toIso8601String(),
        'endTime': meeting.endTime.toIso8601String(),
        'subject': meeting.subject,
        'color': meeting.color.value,
        'notes': meeting.notes,
        'id': meeting.id,
      })).toList();

  await prefs.setStringList('saved_meetings', meetingList);
}

// Load Meetings from Local Storage
Future<void> _loadMeetingsFromLocal() async {
  final SharedPreferences prefs = await SharedPreferences.getInstance();
  List<String>? savedMeetings = prefs.getStringList('saved_meetings');

  setState(() {
    _meetings = savedMeetings!.map((meeting) {
      Map<String, dynamic> meetingData = json.decode(meeting);
      return Appointment(
        startTime: DateTime.parse(meetingData['startTime']),
        endTime: DateTime.parse(meetingData['endTime']),
        subject: meetingData['subject'],
        color: Color(meetingData['color']),
        notes: meetingData['notes'],
        id: meetingData['id'],
      );
    }).toList();
  });
}

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.white,
      child: Scaffold(
        backgroundColor: Colors.white,
        appBar: _buildAppBar(),
        body: Column(
          children: [
            Padding(
              padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 16), vertical: Dimensions.fontSize(context, 8)),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(_getFormattedDate(), style: TextStyle(fontSize: Dimensions.fontSize(context, 16))),
                  ToggleButtons(
                    isSelected: [
                      selectedView == "Month",
                      selectedView == "Week",
                      selectedView == "Day"
                    ],
                    selectedColor: Colors.white,
                    fillColor: Colors.black,
                    borderRadius: BorderRadius.circular(8),
                    children: [
                      Padding(padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 12)), child: Text("Month")),
                      Padding(padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 12)), child: Text("Week")),
                      Padding(padding: EdgeInsets.symmetric(horizontal: Dimensions.fontSize(context, 12)), child: Text("Day")),
                    ],
                    onPressed: (index) {
                      setState(() {
                        selectedView = ["Month", "Week", "Day"][index];
                        _calendarView = index == 0
                            ? CalendarView.month
                            : index == 1
                                ? CalendarView.week
                                : CalendarView.day;
                      });
                    },
                  ),
                ],
              ),
            ),
            Expanded(
              child: selectedView == "Day"
                  ? _buildDayView()
                  : selectedView == "Week"
                      ? _buildWeekView()
                      : _buildCalendarView(),
            )
          ],
        ),
      ),
    );
  }
// Ensures AppBar always remains white
  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      automaticallyImplyLeading: false,
      backgroundColor: Colors.white,
      elevation: 0,
      title: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.videocam_rounded, color: Colors.black),
          SizedBox(width: Dimensions.fontSize(context, 8)),
          Text(
            "My Meetings",
            style: TextStyle(
              color: Color(0xFF4680FE),
              fontSize: Dimensions.fontSize(context, 20),
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
Widget _buildCalendarView() {
  return Column(
    children: [
      Expanded(
        child: SfCalendar(
          view: _calendarView,
          dataSource: MeetingDataSource(_meetings),
          timeSlotViewSettings: const TimeSlotViewSettings(
            timeIntervalHeight: 60,
            timeFormat: 'h:mm a',
          ),
      onViewChanged: (viewChangedDetails) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (mounted && viewChangedDetails.visibleDates.isNotEmpty) {
      setState(() {
        // Use the middle date for more accurate display in month view
        _currentDate = viewChangedDetails.visibleDates[viewChangedDetails.visibleDates.length ~/ 2];
      });
    }
  });
},
  // todayHighlightColor: Color(0xFF4680FE),
          onTap: (CalendarTapDetails details) {
            if (details.date != null) {
              setState(() {
                _currentDate = details.date!;
              });
            }
          },
          headerHeight: 0,
          todayHighlightColor: Color(0xFF4680FE),
          selectionDecoration: BoxDecoration(
            color: Color(0xFF4680FE).withOpacity(0.2),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: Color(0xFF4680FE), width: 2),
          ),
        ),
      ),
      Padding(
        padding: EdgeInsets.all(Dimensions.fontSize(context, 16)),
        child: Column(
          children: [
            const Text("Join Meeting using Meeting ID"),
            SizedBox(height: Dimensions.fontSize(context, 10)),
            TextField(
              controller: _meetingIdController,
              decoration: InputDecoration(
                hintText: "Meeting ID",
                border: const OutlineInputBorder(),
                suffixIcon: Padding(
                  padding: EdgeInsets.only(right: 8.0, bottom: 8.0, top: 8.0),
                  child: SizedBox(
                    height: Dimensions.fontSize(context, 36),
                    child: ElevatedButton(
                      onPressed: () {
                        if (_meetingIdController.text.isNotEmpty) {
                            int meetingId = int.parse(_meetingIdController.text);
                            _joinMeeting(context, meetingId);
                          }// Implement Join logic here
                      },
                      child: Text("Join Now", style: TextStyle(color: Colors.white),),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Color(0xFF4680FE),
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(4),
                          
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
      SizedBox(height: Dimensions.fontSize(context, 20)),
    ],
  );
}

  Widget _buildWeekView() {
    return SfCalendar(
      view: _calendarView,
      dataSource: MeetingDataSource(_meetings),
//   onTap: (CalendarTapDetails details) {
//   if (details.appointments != null && details.appointments!.isNotEmpty) {
//     final Appointment meeting = details.appointments!.first;
//     if (meeting.notes != null) {
//       _joinMeeting(context, meetingId as int);
//     }
//   }
// },
onTap: (CalendarTapDetails details) {
    if (details.appointments != null && details.appointments!.isNotEmpty) {
      final appointment = details.appointments!.first as Appointment;
      _joinMeeting(context, appointment.id as int); // Use the meeting ID
    }
  },
  todayHighlightColor: Color(0xFF4680FE),
          selectionDecoration: BoxDecoration(
            color: Color(0xFF4680FE).withOpacity(0.2),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: Color(0xFF4680FE), width: 2),
          ),
      timeSlotViewSettings: TimeSlotViewSettings(startHour: 0, endHour: 24),
      headerHeight: 0,
      viewHeaderStyle: ViewHeaderStyle(backgroundColor: Colors.transparent),
      onViewChanged: (viewChangedDetails) {
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            setState(() {
              _currentDate = viewChangedDetails.visibleDates.first;
            });
          }
        });
      },
    );
  }
Widget _buildDayView() {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Expanded(
        child: SfCalendar(
          view: CalendarView.day,
          //initialDisplayDate: _currentDate,
          dataSource: MeetingDataSource(_meetings),
          headerHeight: 0,
      viewHeaderStyle: ViewHeaderStyle(backgroundColor: Colors.transparent),
          onViewChanged: (ViewChangedDetails viewChangedDetails) {
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (mounted && viewChangedDetails.visibleDates.isNotEmpty) {
                setState(() {
                  _currentDate = viewChangedDetails.visibleDates[
                      viewChangedDetails.visibleDates.length ~/ 2];
                });
              }
            });
          },
          todayHighlightColor: Color(0xFF4680FE),
          selectionDecoration: BoxDecoration(
            color: Color(0xFF4680FE).withOpacity(0.2),
            borderRadius: BorderRadius.circular(4),
            border: Border.all(color: Color(0xFF4680FE), width: 2),
          ),
onTap: (CalendarTapDetails details) {
    if (details.appointments != null && details.appointments!.isNotEmpty) {
      final appointment = details.appointments!.first as Appointment;
      _joinMeeting(context, appointment.id as int); // Use the meeting ID
    }
  },
        ),
      ),
    ],
  );
}

String _getFormattedDate() {
  if (selectedView == "Week") {
    DateTime startOfWeek = _currentDate.subtract(Duration(days: _currentDate.weekday % 7));
    DateTime endOfWeek = startOfWeek.add(const Duration(days: 6));
    return "${DateFormat.MMMd().format(startOfWeek)} - ${DateFormat.MMMd().format(endOfWeek)}";
  } else if (selectedView == "Day") {
    return DateFormat.yMMMM().format(_currentDate);
  } else {
    return DateFormat.yMMMM().format(_currentDate);
  }
}
}
class MeetingDataSource extends CalendarDataSource {
  MeetingDataSource(List<Appointment> source) {
    appointments = source;
  }
}