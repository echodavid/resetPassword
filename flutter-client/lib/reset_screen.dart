import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';

class ResetScreen extends StatefulWidget {
  const ResetScreen({super.key});
  @override
  State<ResetScreen> createState() => _ResetScreenState();
}

class _ResetScreenState extends State<ResetScreen> {
  final tokenController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmController = TextEditingController();
  String message = '';

  Future<void> reset() async {
    if (passwordController.text != confirmController.text) {
      setState(() { message = 'Passwords do not match'; });
      return;
    }
    final validateRes = await http.post(
      Uri.parse('${Config.apiUrl}/validate-token'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {'token': tokenController.text},
    );
    if (validateRes.statusCode != 200) {
      try {
        final error = validateRes.body.contains('error') ? validateRes.body : 'Invalid or expired token';
        setState(() { message = error; });
      } catch (_) {
        setState(() { message = 'Invalid or expired token'; });
      }
      return;
    }
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/reset'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {'token': tokenController.text, 'password': passwordController.text},
    );
    setState(() {
      message = res.body;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Reset Password')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: tokenController, decoration: const InputDecoration(labelText: 'Reset Token')),
            TextField(controller: passwordController, decoration: const InputDecoration(labelText: 'New Password'), obscureText: true),
            TextField(controller: confirmController, decoration: const InputDecoration(labelText: 'Confirm Password'), obscureText: true),
            ElevatedButton(child: const Text('Reset Password'), onPressed: reset),
            Text('Copia y pega el token recibido por correo.'),
            Text(message),
          ],
        ),
      ),
    );
  }
}
