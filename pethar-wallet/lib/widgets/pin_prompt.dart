import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Asks the user for their 6-digit transaction PIN.
///
/// Returns the PIN when confirmed, or `null` when the user cancels.
/// The PIN is never stored on the device by this widget; it is sent to the
/// server-side endpoint which verifies the bcrypt hash and applies lockout.
Future<String?> showPinPrompt(
  BuildContext context, {
  bool isAk = false,
  String? title,
  String? subtitle,
}) {
  final controller = TextEditingController();
  final formKey = GlobalKey<FormState>();
  bool obscure = true;

  return showDialog<String>(
    context: context,
    barrierDismissible: false,
    builder: (dialogContext) {
      return StatefulBuilder(
        builder: (context, setState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(22)),
            title: Text(
              title ?? (isAk ? 'လုံခြုံရေး PIN ထည့်ပါ' : 'Enter your PIN'),
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w800),
            ),
            content: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    subtitle ??
                        (isAk
                            ? 'ငွေလွှဲခြင်းကို အတည်ပြုရန် သင့် ၆ လုံး PIN ကို ထည့်ပါ။'
                            : 'Confirm this transaction with your 6-digit PIN.'),
                    style: const TextStyle(fontSize: 12.5, color: Color(0xFF71717A), height: 1.4),
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: controller,
                    autofocus: true,
                    obscureText: obscure,
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 6,
                    inputFormatters: [
                      FilteringTextInputFormatter.digitsOnly,
                      LengthLimitingTextInputFormatter(6),
                    ],
                    style: const TextStyle(fontSize: 22, letterSpacing: 8, fontWeight: FontWeight.w700),
                    decoration: InputDecoration(
                      counterText: '',
                      hintText: '••••••',
                      prefixIcon: const Icon(Icons.lock_outline_rounded, size: 20),
                      suffixIcon: IconButton(
                        icon: Icon(
                          obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                          size: 20,
                        ),
                        onPressed: () => setState(() => obscure = !obscure),
                      ),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    validator: (value) {
                      if (value == null || value.length != 6) {
                        return isAk ? '၆ လုံး PIN ထည့်ပါ' : 'Enter all 6 digits';
                      }
                      return null;
                    },
                    onFieldSubmitted: (_) {
                      if (formKey.currentState?.validate() ?? false) {
                        Navigator.of(dialogContext).pop(controller.text);
                      }
                    },
                  ),
                ],
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(dialogContext).pop(null),
                child: Text(isAk ? 'မလုပ်တော့ပါ' : 'Cancel'),
              ),
              FilledButton(
                onPressed: () {
                  if (formKey.currentState?.validate() ?? false) {
                    Navigator.of(dialogContext).pop(controller.text);
                  }
                },
                child: Text(isAk ? 'အတည်ပြုမည်' : 'Confirm'),
              ),
            ],
          );
        },
      );
    },
  ).whenComplete(controller.dispose);
}
