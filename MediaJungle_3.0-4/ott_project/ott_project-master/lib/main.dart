import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:ott_project/components/forget_password/forget_password_email.dart';
import 'package:ott_project/components/music_folder/audio_provider.dart';
import 'package:ott_project/components/music_folder/recently_played.dart';
import 'package:ott_project/main_tv.dart';
import 'package:ott_project/pages/Sign_up.dart';
import 'package:ott_project/pages/login_page.dart';
import 'package:ott_project/service/authservice.dart';
import 'package:ott_project/service/playlist_service.dart';
import 'package:ott_project/service/watch_remote_service.dart';
import 'package:ott_project/splashscreen.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Load environment variables — safe to call even if .env is missing on web
  try {
    await dotenv.load(fileName: ".env");
  } catch (_) {
    // dotenv not available on web or .env missing — continue without it
  }

  // Listen for remote media commands from the Wear OS watch app.
  WatchRemoteService.instance.start();

  runApp(const AppRoot());
}

class AppRoot extends StatelessWidget {
  const AppRoot({super.key});

  @override
  Widget build(BuildContext context) {
    return const StartupRouter();
  }
}

/// Detects platform and routes to TV UI or Mobile UI.
class StartupRouter extends StatelessWidget {
  const StartupRouter({super.key});

  Future<bool> _isTV() async {
    // Web (Chrome, Edge, localhost) → TV UI
    if (kIsWeb) return true;

    // Desktop → TV UI
    if (defaultTargetPlatform == TargetPlatform.linux ||
        defaultTargetPlatform == TargetPlatform.fuchsia) {
      return true;
    }

    // Android: distinguish TV/Fire TV from real phone
    if (defaultTargetPlatform == TargetPlatform.android) {
      try {
        final info = await DeviceInfoPlugin().androidInfo;

        // Leanback feature = Android TV / Fire TV
        final features = info.systemFeatures;
        if (features.contains('android.software.leanback')) {
          return true;
        }

        // Fallback string matching
        final model        = (info.model        ?? '').toLowerCase();
        final manufacturer = (info.manufacturer ?? '').toLowerCase();
        final brand        = (info.brand        ?? '').toLowerCase();
        final product      = (info.product      ?? '').toLowerCase();

        return model.contains('tv')       ||
            model.contains('fire')     ||
            model.contains('bravia')   ||
            product.contains('atv')    ||
            brand.contains('amlogic')  ||
            manufacturer.contains('amazon') ||
            manufacturer.contains('lge');
      } catch (_) {
        return false;
      }
    }

    // iOS / macOS / anything else → Mobile UI
    return false;
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<bool>(
      future: _isTV(),
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const MaterialApp(
            debugShowCheckedModeBanner: false,
            home: Scaffold(
              backgroundColor: Colors.black,
              body: Center(child: CircularProgressIndicator()),
            ),
          );
        }

        if (snapshot.data!) {
          // TV UI — standalone
          return const MediaJungleApp();
        }

        // Mobile UI — standard providers and routing
        return MultiProvider(
          providers: [
            // 1. Base Auth Service
            Provider<AuthService>(create: (_) => AuthService()),

            // 2. Playlist Service dependent on Auth Service
            ProxyProvider<AuthService, PlaylistService>(
              update: (_, auth, __) => PlaylistService(),
            ),

            // 3. Audio Provider dependent on Playlist Service
            ChangeNotifierProxyProvider<PlaylistService, AudioProvider>(
              create: (ctx) => AudioProvider(
                Provider.of<PlaylistService>(ctx, listen: false),
              ),
              update: (_, playlistService, previousAudioProvider) =>
              previousAudioProvider ?? AudioProvider(playlistService),
            ),

            // 4. Recently Played
            ChangeNotifierProvider(create: (_) => RecentlyPlayed()),
          ],
          child: MaterialApp(
            title: 'Media Jungle',
            debugShowCheckedModeBanner: false,
            theme: ThemeData(
              fontFamily: 'sans-serif',
              primarySwatch: Colors.blue,
              visualDensity: VisualDensity.adaptivePlatformDensity,
              colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
              useMaterial3: true,
            ),
            routes: {
              '/login':           (context) => const LoginPage(),
              'ForgetPassword':   (context) => ForgetPasswordEmail(),
              'CreateNewAccount': (context) => const SignUp(),
            },
            home: const SplashScreen(),
          ),
        );
      },
    );
  }
}