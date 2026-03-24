import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';

class ForgotScreen extends StatefulWidget {
  const ForgotScreen({super.key});
  @override
  State<ForgotScreen> createState() => _ForgotScreenState();
}

class _ForgotScreenState extends State<ForgotScreen> {
  final emailController = TextEditingController();
  String message = '';

  Future<void> forgot() async {
    final res = await http.post(Uri.parse('${Config.apiUrl}/forgot'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {'email': emailController.text},
    );
    setState(() {
      message = res.body;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Forgot Password')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Email')),
            ElevatedButton(child: const Text('Send Recovery Code'), onPressed: forgot),
            Text(message),
          ],
        ),
      ),
    );
  }
}
