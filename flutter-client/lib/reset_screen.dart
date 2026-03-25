import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';

class ResetScreen extends StatefulWidget {
  const ResetScreen({super.key});
  @override
  State<ResetScreen> createState() => _ResetScreenState();
}

class _ResetScreenState extends State<ResetScreen> {
  final emailController = TextEditingController();
  final codeController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmController = TextEditingController();
  String message = '';
  bool isVerified = false;
  String? actionToken;

  Future<void> verifyCode() async {
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/verify/check'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'email': emailController.text,
        'purpose': 'recovery',
        'code': codeController.text,
      },
    );
    final data = json.decode(res.body);
    if (data['verified'] == true) {
      setState(() {
        isVerified = true;
        actionToken = data['actionToken'];
        message = '¡Código verificado! Establece tu nueva contraseña.';
      });
    } else {
      setState(() {
        message = data['error'] ?? 'Falló la verificación';
      });
    }
  }

  Future<void> reset() async {
    if (passwordController.text != confirmController.text) {
      setState(() { message = 'Las contraseñas no coinciden'; });
      return;
    }
    final res = await http.post(
      Uri.parse('${Config.apiUrl}/reset'),
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: {
        'token': actionToken ?? '',
        'password': passwordController.text,
      },
    );
    final data = json.decode(res.body);
    setState(() {
      message = data['message'] ?? data['error'] ?? 'Error al actualizar la contraseña';
    });
    if (res.statusCode == 200) {
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) Navigator.pop(context);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Restablecer Contraseña')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            children: [
              if (!isVerified) ...[
                TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Correo electrónico')),
                TextField(controller: codeController, decoration: const InputDecoration(labelText: 'Código de recuperación')),
                const SizedBox(height: 16),
                ElevatedButton(onPressed: verifyCode, child: const Text('Verificar Código')),
              ] else ...[
                TextField(controller: passwordController, decoration: const InputDecoration(labelText: 'Nueva contraseña'), obscureText: true),
                TextField(controller: confirmController, decoration: const InputDecoration(labelText: 'Confirmar contraseña'), obscureText: true),
                const SizedBox(height: 16),
                ElevatedButton(onPressed: reset, child: const Text('Actualizar Contraseña')),
              ],
              const SizedBox(height: 16),
              Text(message, style: TextStyle(color: message.contains('Error') || message.contains('failed') ? Colors.red : Colors.green)),
            ],
          ),
        ),
      ),
    );
  }
}
