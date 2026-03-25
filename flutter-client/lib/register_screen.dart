import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'config.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final emailController = TextEditingController();
  final passwordController = TextEditingController();
  final confirmController = TextEditingController();
  String message = '';

  Future<void> register() async {
    if (passwordController.text != confirmController.text) {
      setState(() { message = 'Las contraseñas no coinciden'; });
      return;
    }
    final res = await http.post(Uri.parse('${Config.apiUrl}/register'),
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
      appBar: AppBar(title: const Text('Registro')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: emailController, decoration: const InputDecoration(labelText: 'Correo electrónico')),
            TextField(controller: passwordController, decoration: const InputDecoration(labelText: 'Contraseña'), obscureText: true),
            TextField(controller: confirmController, decoration: const InputDecoration(labelText: 'Confirmar contraseña'), obscureText: true),
            ElevatedButton(child: const Text('Registrarse'), onPressed: register),
            Text(message),
          ],
        ),
      ),
    );
  }
}
