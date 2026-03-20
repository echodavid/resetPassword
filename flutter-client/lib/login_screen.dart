import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  String message = '';

  Future<void> login() async {
    final res = await http.post(Uri.parse('${Config.apiUrl}/login'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {'email': emailController.text, 'password': passwordController.text},
    );
    setState(() {
      message = res.body;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Login')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Email')),
            TextField(controller: passwordController, decoration: const InputDecoration(labelText: 'Password'), obscureText: true),
            ElevatedButton(child: const Text('Login'), onPressed: login),
            Text(message),
          ],
        ),
      ),
    );
  }
}
