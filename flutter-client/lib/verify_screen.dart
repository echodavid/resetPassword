import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';

class VerifyScreen extends StatefulWidget {
  const VerifyScreen({super.key});

  @override
  State<VerifyScreen> createState() => _VerifyScreenState();
}

class _VerifyScreenState extends State<VerifyScreen> {
  final emailController = TextEditingController();
  final codeController = TextEditingController();
  final newPasswordController = TextEditingController();
  final confirmController = TextEditingController();
  final newEmailController = TextEditingController();

  String message = '';
  String stage = 'send';
  String purpose = 'change-password';
  String? actionToken;

  Future<void> sendCode() async {
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/verify/send'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {'email': emailController.text.trim(), 'purpose': purpose},
    );

    setState(() {
      message = res.body;
    });

    if (res.statusCode == 200) {
      setState(() {
        stage = 'verify';
      });
    }
  }

  Future<void> verifyCode() async {
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/verify/check'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'email': emailController.text.trim(),
        'purpose': purpose,
        'code': codeController.text.trim(),
      },
    );

    final body = json.decode(res.body);
    if (res.statusCode == 200 && body['verified'] == true && body['actionToken'] != null) {
      setState(() {
        actionToken = body['actionToken'];
        stage = 'action';
        message = 'Code verified; you can now complete the action.';
      });
    } else {
      setState(() {
        message = body['error'] ?? 'Invalid code.';
      });
    }
  }

  Future<void> changePassword() async {
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/action/change-password'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'actionToken': actionToken ?? '',
        'newPassword': newPasswordController.text,
      },
    );
    final body = json.decode(res.body);
    setState(() {
      message = body['message'] ?? body['error'] ?? 'Unexpected response';
    });
  }

  Future<void> changeEmail() async {
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/action/change-email'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'actionToken': actionToken ?? '',
        'newEmail': newEmailController.text.trim(),
      },
    );
    final body = json.decode(res.body);
    setState(() {
      message = body['message'] ?? body['error'] ?? 'Unexpected response';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify Identity')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            if (stage == 'send') ...[
              DropdownButtonFormField<String>(
                value: purpose,
                decoration: const InputDecoration(labelText: 'Action'),
                items: const [
                  DropdownMenuItem(value: 'change-password', child: Text('Change password')),
                  DropdownMenuItem(value: 'update-email', child: Text('Change email')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      purpose = value;
                    });
                  }
                },
              ),
              TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Current email')),
              ElevatedButton(onPressed: sendCode, child: const Text('Send verification code')),
            ],
            if (stage == 'verify') ...[
              TextField(controller: codeController, decoration: const InputDecoration(labelText: 'Verification code')),
              ElevatedButton(onPressed: verifyCode, child: const Text('Verify code')),
            ],
            if (stage == 'action') ...[
              if (purpose == 'change-password') ...[
                TextField(controller: newPasswordController, decoration: const InputDecoration(labelText: 'New password'), obscureText: true),
                TextField(controller: confirmController, decoration: const InputDecoration(labelText: 'Confirm password'), obscureText: true),
                ElevatedButton(onPressed: changePassword, child: const Text('Change password')),
              ],
              if (purpose == 'update-email') ...[
                TextField(controller: newEmailController, decoration: const InputDecoration(labelText: 'New email')),
                ElevatedButton(onPressed: changeEmail, child: const Text('Change email')),
              ],
            ],
            const SizedBox(height: 16),
            Text(message),
          ],
        ),
      ),
    );
  }
}
