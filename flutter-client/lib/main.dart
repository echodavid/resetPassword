import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'register_screen.dart';
import 'forgot_screen.dart';
import 'reset_screen.dart';
import 'verify_screen.dart';
import 'config.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Password Reset Client',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Password Reset Client')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              child: const Text('Login'),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const LoginScreen())),
            ),
            ElevatedButton(
              child: const Text('Register'),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RegisterScreen())),
            ),
            ElevatedButton(
              child: const Text('Forgot Password'),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ForgotScreen())),
            ),
            ElevatedButton(
              child: const Text('Reset Password (token)'),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const ResetScreen())),
            ),
            ElevatedButton(
              child: const Text('Change Password (verification)'),
              onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const VerifyScreen())),
            ),
          ],
        ),
      ),
    );
  }
}
