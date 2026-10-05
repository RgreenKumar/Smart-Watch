import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:ott_project/components/category/category_service.dart';
import 'package:ott_project/components/video_folder/cast_crew.dart';
import 'package:ott_project/components/video_folder/video_container.dart';
import 'package:ott_project/tv_ui/FocusManager/focus_manager.dart';
import 'package:ott_project/service/movie_api_service.dart';
import 'package:ott_project/service/movie_service_page.dart';
import 'package:ott_project/service/watch_later_service.dart';
import 'package:wakelock_plus/wakelock_plus.dart';
import 'package:ott_project/tv_ui/components/tvlayout.dart';
import 'package:ott_project/tv_ui/FocusManager/videoplayer_focusmanager.dart';
import 'package:video_player/video_player.dart';
import 'package:ott_project/service/service.dart';

class TVMoviesPlayerPage extends StatefulWidget {
  final int categoryId;
  final List<VideoDescription> videoDescriptions;
  final int initialIndex;

  const TVMoviesPlayerPage({
    Key? key,
    required this.categoryId,
    required this.videoDescriptions,
    required this.initialIndex,
  }) : super(key: key);

  @override
  _TVMoviesPlayerPageState createState() => _TVMoviesPlayerPageState();
}

class _TVMoviesPlayerPageState extends State<TVMoviesPlayerPage> {
  VideoPlayerController? _videoController;
  bool _showControls = true;
  Timer? _hideControlsTimer;
  bool _showSettings = false;
  double _playbackSpeed = 1.0;
  double _volume = 1.0;
  bool _showSpeedOptions = false;
  late MovieApiService _apiService;

  Map<int, bool> videoWatchlistState = {};
  final Service service = Service();
  late CategoryService categoryService;
  VideoDescription? _movieDetails;
  List<CastCrew> castCrew = [];
  List<String> _categoryNames = [];
  late VideoFocusManager _videoFocusManager;
  bool _isFullScreen = false;
  bool _isPlaying = false;
  int selectedIndex = FocusManagerService.selectedSidebarIndex;
  Uint8List? _cachedThumbnail;

  bool _isPopping = false;

  final FocusNode _playerKeyboardFocusNode =
  FocusNode(debugLabel: 'moviePlayerKeyboard');

  void _onSidebarSelected(int index) {
    setState(() {
      selectedIndex = index;
      FocusManagerService.selectedSidebarIndex = index;
    });
  }

  @override
  void initState() {
    super.initState();
    FocusManagerService.currentPage = 1;
    _apiService = MovieApiService();
    categoryService = CategoryService();

    _videoFocusManager = VideoFocusManager(
      onSeek: (bool forward) => _seekVideo(forward ? 10 : -10),
      onUserInteraction: _resetControlsVisibility,
      onPlayPause: _togglePlayPause,
      onFullScreen: _toggleFullScreen,
      onToggleSettings: _toggleSettings,
      onPlaybackSpeedSelected: _onPlaybackspeedoptions,
      onChangePlaybackSpeed: _changePlaybackSpeed,
      onPlayMovie: _handlePlayMovie,
      onAddToWatchLater: () {
        if (_movieDetails != null) _toggleWatchLater(_movieDetails!.id);
      },
      isFullScreen: () => _isFullScreen,
      isMoviePlaying: () => _videoController?.value.isPlaying ?? false,
      onBack: _handleBackNavigation,
    );

    FocusManagerService.videoFocusManager = _videoFocusManager;

    WidgetsBinding.instance.addPostFrameCallback((_) async {
      _playerKeyboardFocusNode.requestFocus();

      if (widget.videoDescriptions.isNotEmpty &&
          widget.initialIndex < widget.videoDescriptions.length) {
        await _fetchVideoScreenDetails(
          widget.videoDescriptions[widget.initialIndex].id,
          widget.categoryId,
        );
      }
    });
  }

  Future<void> _initializeVideoPlayer(int videoId) async {
    try {
      final String videoStreamUrl =
      await MovieService.fetchVideoStreamUrl(videoId);

      final controller =
      VideoPlayerController.networkUrl(Uri.parse(videoStreamUrl));
      await controller.initialize();

      if (!mounted) {
        controller.dispose();
        return;
      }

      controller.setLooping(false);
      controller.setVolume(_volume);
      controller.setPlaybackSpeed(_playbackSpeed);
      controller.addListener(_onControllerUpdate);

      setState(() {
        _videoController = controller;
        _isPlaying = false;
      });

      _resetControlsVisibility();
    } catch (e) {
      debugPrint('Error initializing video player: $e');
    }
  }

  void _onControllerUpdate() {
    if (mounted) setState(() {});
  }

  void _startVideoPlayback() {
    if (!(_videoController?.value.isInitialized ?? false)) return;
    setState(() => _isPlaying = true);
    _updateWakelockState();
    _videoController!.play();
  }

  void _updateWakelockState() {
    if (_isPlaying) {
      WakelockPlus.enable();
    } else {
      WakelockPlus.disable();
    }
  }

  Future<void> _fetchVideoScreenDetails(int videoId, int categoryId) async {
    try {
      final movieDetails =
      await _apiService.fetchVideoScreenDetails(videoId, categoryId);
      if (movieDetails == null) return;

      final List<CastCrew> castList = movieDetails.castAndCrewList.isNotEmpty
          ? (await _apiService.fetchCastAndCrew(movieDetails.castAndCrewList))
          .cast<CastCrew>()
          : [];

      await CategoryService().loadCategories();
      final categoryNames =
      categoryService.getCategoryNames(movieDetails.categoryList);

      if (movieDetails.thumbnailImage != null) {
        _cachedThumbnail = await movieDetails.thumbnailImage;
      }

      await _initializeVideoPlayer(videoId);

      if (!mounted) return;
      setState(() {
        _movieDetails = movieDetails;
        castCrew = castList;
        _categoryNames = categoryNames;
      });

      WidgetsBinding.instance.addPostFrameCallback(
              (_) => _playerKeyboardFocusNode.requestFocus());
    } catch (e) {
      debugPrint('Error fetching video screen details: $e');
    }
  }

  void _toggleFullScreen() {
    setState(() {
      _isFullScreen = !_isFullScreen;
      if (_isFullScreen) {
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.leanBack);
        if (_isPlaying) WakelockPlus.enable();
      } else {
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
        _showControls = true;
      }
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _playerKeyboardFocusNode.requestFocus();
      _resetControlsVisibility();
    });
  }

  void _togglePlayPause() {
    if (!(_videoController?.value.isInitialized ?? false)) return;
    setState(() {
      if (_videoController!.value.isPlaying) {
        _videoController!.pause();
        _isPlaying = false;
      } else {
        _videoController!.play();
        _isPlaying = true;
      }
      _updateWakelockState();
    });
    _resetControlsVisibility();
  }

  void _onPlaybackspeedoptions() {
    setState(() => _showSpeedOptions = !_showSpeedOptions);
  }

  void _changePlaybackSpeed(double speed) {
    setState(() {
      _playbackSpeed = speed;
      _videoController?.setPlaybackSpeed(speed);
      _showSpeedOptions = false;
    });
  }

  void _toggleSettings() {
    setState(() => _showSettings = !_showSettings);
  }

  void _resetControlsVisibility() {
    if (!mounted) return;
    setState(() => _showControls = true);
    _hideControlsTimer?.cancel();
    _hideControlsTimer = Timer(const Duration(seconds: 5), () {
      if (mounted) setState(() => _showControls = false);
    });
  }

  void _seekVideo(int seconds) {
    final ctrl = _videoController;
    if (ctrl == null || !ctrl.value.isInitialized) return;
    final newPosition = ctrl.value.position + Duration(seconds: seconds);
    ctrl.seekTo(newPosition < Duration.zero ? Duration.zero : newPosition);
  }

  void _handleBackNavigation() {
    if (_isPopping) return;

    if (_isFullScreen) {
      setState(() => _isFullScreen = false);
      SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      SystemChrome.setPreferredOrientations([
        DeviceOrientation.portraitUp,
        DeviceOrientation.portraitDown,
      ]);
      WidgetsBinding.instance.addPostFrameCallback(
              (_) => _playerKeyboardFocusNode.requestFocus());
      return;
    }

    _isPopping = true;
    try {
      _videoController?.pause();
    } catch (_) {}

    if (mounted && Navigator.canPop(context)) {
      Navigator.pop(context);
    }
  }

  @override
  void dispose() {
    _hideControlsTimer?.cancel();

    FocusManagerService.videoFocusManager = null;

    _videoController?.removeListener(_onControllerUpdate);
    _videoController?.dispose();
    _videoController = null;

    _playerKeyboardFocusNode.dispose();

    WakelockPlus.disable();
    SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
    SystemChrome.setPreferredOrientations([
      DeviceOrientation.portraitUp,
      DeviceOrientation.portraitDown,
    ]);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      final gridNode = FocusManagerService.gridFocusNode;
      if (gridNode != null) {
        gridNode.requestFocus();
      } else {
        FocusManagerService.globalFocusNode.requestFocus();
      }
    });

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_movieDetails == null) {
      return KeyboardListener(
        focusNode: _playerKeyboardFocusNode,
        autofocus: true,
        onKeyEvent: (KeyEvent event) {
          if (event is KeyDownEvent) {
            if (event.logicalKey == LogicalKeyboardKey.escape ||
                event.logicalKey == LogicalKeyboardKey.goBack ||
                event.logicalKey == LogicalKeyboardKey.browserBack) {
              _handleBackNavigation();
            }
          }
        },
        child: TVLayout(
          onSidebarSelected: _onSidebarSelected,
          selectedIndex: selectedIndex,
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [Color(0xFF070708), Color(0xFF1D1B53)],
              ),
            ),
            child: Stack(
              children: [
                const Center(child: CircularProgressIndicator()),
                Positioned(
                  top: 20,
                  left: 20,
                  child: IconButton(
                    onPressed: _handleBackNavigation,
                    icon: const Icon(Icons.arrow_back,
                        color: Colors.white, size: 30),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    final isWatchlisted = videoWatchlistState[_movieDetails!.id] ?? false;

    final playerContent = PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) return;
        _handleBackNavigation();
      },
      child: Scaffold(
        backgroundColor: Colors.black,
        body: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF070708), Color(0xFF1D1B53)],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: MediaQuery.of(context).size.width,
                height: _isFullScreen
                    ? MediaQuery.of(context).size.height
                    : MediaQuery.of(context).size.height * 0.5,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    _isPlaying && _videoController != null
                        ? AspectRatio(
                      aspectRatio: _isFullScreen
                          ? _videoController!.value.aspectRatio
                          : 16 / 9,
                      child: Padding(
                        padding: const EdgeInsets.all(1.0),
                        child: VideoPlayer(_videoController!),
                      ),
                    )
                        : ClipRect(
                      child: _cachedThumbnail != null
                          ? Image.memory(_cachedThumbnail!,
                          fit: BoxFit.cover)
                          : Container(
                        color: Colors.grey,
                        child: const Center(
                          child: CircularProgressIndicator(
                              color: Colors.white),
                        ),
                      ),
                    ),
                    if (!_isPlaying)
                      Positioned(
                        bottom: 5,
                        left: 5,
                        child: Row(
                          children: [
                            ElevatedButton(
                              onPressed: _handlePlayMovie,
                              style: ElevatedButton.styleFrom(
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                    BorderRadius.circular(5)),
                                backgroundColor:
                                _videoFocusManager.isPlayMovieFocused()
                                    ? const Color.fromARGB(
                                    255, 143, 228, 0)
                                    : const Color.fromARGB(
                                    255, 193, 39, 45),
                              ),
                              child: Text(
                                _movieDetails?.videoAccessType == true
                                    ? 'Subscription'
                                    : 'Play Now',
                                style: const TextStyle(
                                    color: Colors.white, fontSize: 12),
                              ),
                            ),
                            const SizedBox(width: 5),
                            ElevatedButton(
                              onPressed: () async {
                                if (_movieDetails != null) {
                                  await _toggleWatchLater(
                                      _movieDetails!.id);
                                }
                              },
                              style: ElevatedButton.styleFrom(
                                backgroundColor: _videoFocusManager
                                    .isAddToWatchLaterFocused()
                                    ? const Color.fromARGB(
                                    255, 143, 228, 0)
                                    : const Color.fromARGB(135, 0, 0, 0),
                                shape: RoundedRectangleBorder(
                                    borderRadius:
                                    BorderRadius.circular(5)),
                              ),
                              child: Row(
                                children: [
                                  const Icon(Icons.add_circle_outline,
                                      color: Colors.white, size: 16),
                                  const SizedBox(width: 4),
                                  Text(
                                    isWatchlisted
                                        ? 'Remove from watchlater'
                                        : 'Add to watchlater',
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 12),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                    Positioned(
                      top: 20,
                      left: 20,
                      child: IconButton(
                        onPressed: _handleBackNavigation,
                        icon: const Icon(Icons.arrow_back,
                            color: Colors.white, size: 30),
                      ),
                    ),
                    if (_showControls && _isPlaying) _buildVideoControls(),
                  ],
                ),
              ),
              if (!_isFullScreen) Expanded(child: _buildMovieDetails()),
            ],
          ),
        ),
      ),
    );

    return KeyboardListener(
      focusNode: _playerKeyboardFocusNode,
      autofocus: true,
      onKeyEvent: (KeyEvent event) {
        if (event is KeyDownEvent) {
          if (event.logicalKey == LogicalKeyboardKey.escape ||
              event.logicalKey == LogicalKeyboardKey.goBack ||
              event.logicalKey == LogicalKeyboardKey.browserBack) {
            _handleBackNavigation();
            return;
          }
        }
        _videoFocusManager.handleKeyEvent(event);
      },
      child: _isFullScreen
          ? playerContent
          : TVLayout(
        child: playerContent,
        onSidebarSelected: _onSidebarSelected,
        selectedIndex: selectedIndex,
      ),
    );
  }

  Widget _buildVideoControls() {
    final controller = _videoController;
    if (controller == null) return const SizedBox.shrink();

    final position = controller.value.position;
    final duration = controller.value.duration;

    return Container(
      color: Colors.black45,
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          VideoProgressIndicator(
            controller,
            allowScrubbing: true,
            colors: const VideoProgressColors(
              playedColor: Color.fromARGB(255, 143, 228, 0),
              bufferedColor: Colors.white24,
              backgroundColor: Colors.grey,
            ),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  IconButton(
                    icon: Icon(
                      _isPlaying ? Icons.pause : Icons.play_arrow,
                      color: Colors.white,
                    ),
                    onPressed: _togglePlayPause,
                  ),
                  IconButton(
                    icon: const Icon(Icons.replay_10, color: Colors.white),
                    onPressed: () => _seekVideo(-10),
                  ),
                  IconButton(
                    icon: const Icon(Icons.forward_10, color: Colors.white),
                    onPressed: () => _seekVideo(10),
                  ),
                  Text(
                    '${_formatDuration(position)} / ${_formatDuration(duration)}',
                    style: const TextStyle(color: Colors.white, fontSize: 12),
                  ),
                ],
              ),
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.speed, color: Colors.white),
                    onPressed: _onPlaybackspeedoptions,
                  ),
                  IconButton(
                    icon: Icon(
                      _isFullScreen ? Icons.fullscreen_exit : Icons.fullscreen,
                      color: Colors.white,
                    ),
                    onPressed: _toggleFullScreen,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }

  String _formatDuration(Duration duration) {
    final minutes = duration.inMinutes.remainder(60).toString().padLeft(2, '0');
    final seconds = duration.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$minutes:$seconds';
  }

  Widget _buildMovieDetails() {
    return Padding(
      padding: const EdgeInsets.all(1),
      child: SizedBox(
        width: MediaQuery.of(context).size.width,
        child: Padding(
          padding: const EdgeInsets.all(5.0),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _movieDetails!.videoTitle,
                      style: TextStyle(
                        fontSize:
                        MediaQuery.of(context).size.height * 0.04,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    SizedBox(
                        height:
                        MediaQuery.of(context).size.height * 0.005),
                    Text(
                      _categoryNames.isNotEmpty
                          ? _categoryNames.join(" / ")
                          : "Unknown",
                      style: TextStyle(
                          color: Colors.grey,
                          fontSize:
                          MediaQuery.of(context).size.height * 0.02),
                    ),
                    SizedBox(
                        height:
                        MediaQuery.of(context).size.height * 0.02),
                    Row(
                      children: [
                        Text(
                          'Duration : ',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize:
                            MediaQuery.of(context).size.height * 0.03,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        Text(
                          _movieDetails!.mainVideoDuration,
                          style: TextStyle(
                            color: Colors.white,
                            fontSize:
                            MediaQuery.of(context).size.height * 0.03,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(
                        height:
                        MediaQuery.of(context).size.height * 0.02),
                    Row(
                      children: [
                        Text(
                          "Description:  ",
                          style: TextStyle(
                            color: Colors.grey,
                            fontSize:
                            MediaQuery.of(context).size.height * 0.025,
                          ),
                        ),
                        Expanded(
                          child: Text(
                            _movieDetails!.description,
                            style: TextStyle(
                              color: Colors.grey,
                              fontSize:
                              MediaQuery.of(context).size.height * 0.025,
                            ),
                            softWrap: true,
                          ),
                        ),
                      ],
                    ),
                    SizedBox(
                        height:
                        MediaQuery.of(context).size.height * 0.02),
                  ],
                ),
              ),
              SizedBox(width: MediaQuery.of(context).size.width * 0.02),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Cast & Crew',
                    style: TextStyle(
                      fontSize:
                      MediaQuery.of(context).size.height * 0.03,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  SizedBox(
                      height:
                      MediaQuery.of(context).size.height * 0.02),
                  castCrew.length > 3
                      ? SizedBox(
                    height:
                    MediaQuery.of(context).size.height * 0.3,
                    width:
                    MediaQuery.of(context).size.width * 0.3,
                    child: NotificationListener<ScrollNotification>(
                      onNotification: (_) => true,
                      child: GridView.builder(
                        controller:
                        _videoFocusManager.scrollController,
                        physics:
                        const AlwaysScrollableScrollPhysics(),
                        shrinkWrap: true,
                        gridDelegate:
                        const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          crossAxisSpacing: 45.0,
                          mainAxisSpacing: 40.0,
                          childAspectRatio: 0.85,
                        ),
                        itemCount: castCrew.length,
                        itemBuilder: (context, index) {
                          final cast = castCrew[index];
                          return SizedBox.expand(
                            child: Column(
                              mainAxisAlignment:
                              MainAxisAlignment.start,
                              children: [
                                CircleAvatar(
                                  radius: MediaQuery.of(context)
                                      .size
                                      .height *
                                      0.04,
                                  backgroundImage: cast.image !=
                                      null
                                      ? MemoryImage(cast.image!)
                                      : const AssetImage(
                                      'assets/icon/thupaki.png')
                                  as ImageProvider,
                                ),
                                SizedBox(
                                    height:
                                    MediaQuery.of(context)
                                        .size
                                        .height *
                                        0.01),
                                SizedBox(
                                  width: MediaQuery.of(context)
                                      .size
                                      .width *
                                      0.12,
                                  child: Text(
                                    cast.name,
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize:
                                      MediaQuery.of(context)
                                          .size
                                          .height *
                                          0.02,
                                    ),
                                    textAlign: TextAlign.center,
                                    overflow:
                                    TextOverflow.ellipsis,
                                    maxLines: 1,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  )
                      : SizedBox(
                    height:
                    MediaQuery.of(context).size.height * 0.15,
                    width:
                    MediaQuery.of(context).size.width * 0.3,
                    child: ListView.builder(
                      controller:
                      _videoFocusManager.scrollController,
                      scrollDirection: Axis.horizontal,
                      itemCount: castCrew.length,
                      itemBuilder: (context, index) {
                        final cast = castCrew[index];
                        return Padding(
                          padding:
                          const EdgeInsets.only(right: 12.0),
                          child: Column(
                            children: [
                              CircleAvatar(
                                radius: MediaQuery.of(context)
                                    .size
                                    .height *
                                    0.05,
                                backgroundImage: cast.image != null
                                    ? MemoryImage(cast.image!)
                                    : const AssetImage(
                                    'assets/icon/thupaki.png')
                                as ImageProvider,
                              ),
                              SizedBox(
                                  height: MediaQuery.of(context)
                                      .size
                                      .height *
                                      0.01),
                              SizedBox(
                                width: MediaQuery.of(context)
                                    .size
                                    .width *
                                    0.15,
                                child: Text(
                                  cast.name,
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: MediaQuery.of(context)
                                        .size
                                        .height *
                                        0.02,
                                  ),
                                  textAlign: TextAlign.center,
                                  overflow: TextOverflow.ellipsis,
                                  maxLines: 1,
                                ),
                              ),
                            ],
                          ),
                        );
                      },
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

  Future<void> _handlePlayMovie() async {
    if (_movieDetails == null) return;
    if (!(_videoController?.value.isInitialized ?? false)) {
      await _initializeVideoPlayer(_movieDetails!.id);
    }
    _startVideoPlayback();
    WidgetsBinding.instance
        .addPostFrameCallback((_) => _playerKeyboardFocusNode.requestFocus());
  }

  Future<void> _toggleWatchLater(int videoId) async {
    if (_movieDetails == null) return;
    try {
      final rawUser = await service.getLoggedInUserId();
      final currentUser = rawUser != null ? int.tryParse(rawUser) : null;

      if (currentUser == null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
                content: Text('Please log in to add to watchlist.')),
          );
        }
        return;
      }

      final watchLaterService = WatchLaterService();
      final isInWatchList =
      await watchLaterService.isInWatchList(videoId, currentUser);

      if (isInWatchList) {
        await watchLaterService.removeWatchLater(videoId, currentUser);
        if (mounted) {
          setState(() => videoWatchlistState[videoId] = false);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Removed from watchlist.')),
          );
        }
      } else {
        await watchLaterService.addToWatchLater(videoId, currentUser);
        if (mounted) {
          setState(() => videoWatchlistState[videoId] = true);
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Added to watchlist.')),
          );
        }
      }
    } catch (e) {
      debugPrint('Error toggling watchlist: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to update watchlist.')),
        );
      }
    }
  }
}