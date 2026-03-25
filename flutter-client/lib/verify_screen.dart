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
        message = 'Código verificado; ahora puedes completar la acción.';
      });
    } else {
      setState(() {
        message = body['error'] ?? 'Código inválido.';
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

  Future<void> logoutAll() async {
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/action/logout-all'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {'actionToken': actionToken ?? ''},
    );
    final body = json.decode(res.body);
    setState(() {
      message = body['message'] ?? body['error'] ?? 'Unexpected response';
    });
  }

  Future<void> unlockAccount() async {
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/action/unlock-account'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {'actionToken': actionToken ?? ''},
    );
    final body = json.decode(res.body);
    setState(() {
      message = body['message'] ?? body['error'] ?? 'Unexpected response';
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verificar Identidad')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            if (stage == 'send') ...[
              DropdownButtonFormField<String>(
                value: purpose,
                decoration: const InputDecoration(labelText: 'Acción'),
                items: const [
                  DropdownMenuItem(value: 'change-password', child: Text('Cambiar contraseña')),
                  DropdownMenuItem(value: 'update-email', child: Text('Cambiar correo')),
                  DropdownMenuItem(value: 'logout-all', child: Text('Cerrar todas las sesiones')),
                  DropdownMenuItem(value: 'unlock-account', child: Text('Desbloquear cuenta')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() {
                      purpose = value;
                    });
                  }
                },
              ),
              TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Correo actual')),
              ElevatedButton(onPressed: sendCode, child: const Text('Enviar código de verificación')),
            ],
            if (stage == 'verify') ...[
              TextField(controller: codeController, decoration: const InputDecoration(labelText: 'Código de verificación')),
              ElevatedButton(onPressed: verifyCode, child: const Text('Verificar código')),
            ],
            if (stage == 'action') ...[
              if (purpose == 'change-password') ...[
                TextField(controller: newPasswordController, decoration: const InputDecoration(labelText: 'Nueva contraseña'), obscureText: true),
                TextField(controller: confirmController, decoration: const InputDecoration(labelText: 'Confirmar contraseña'), obscureText: true),
                ElevatedButton(onPressed: changePassword, child: const Text('Cambiar contraseña')),
              ],
              if (purpose == 'update-email') ...[
                TextField(controller: newEmailController, decoration: const InputDecoration(labelText: 'Nuevo correo')),
                ElevatedButton(onPressed: changeEmail, child: const Text('Cambiar correo')),
              ],
              if (purpose == 'logout-all') ...[
                const Text('Confirmar cierre de todas las sesiones:'),
                ElevatedButton(onPressed: logoutAll, child: const Text('Cerrar Todas las Sesiones')),
              ],
              if (purpose == 'unlock-account') ...[
                const Text('Confirmar desbloqueo de cuenta:'),
                ElevatedButton(onPressed: unlockAccount, child: const Text('Desbloquear Cuenta')),
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
