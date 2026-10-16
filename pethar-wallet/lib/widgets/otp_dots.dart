import 'package:flutter/material.dart';
import '../theme.dart';

class OtpDots extends StatelessWidget {
  final int length;
  final int filledCount;

  const OtpDots({Key? key, this.length = 6, required this.filledCount}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(length, (index) {
        bool isFilled = index < filledCount;
        bool isActive = index == filledCount;
        return Container(
          margin: const EdgeInsets.symmetric(horizontal: 8),
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: isFilled ? gold : Colors.transparent,
            border: Border.all(color: isActive ? gold : (isFilled ? gold : Colors.grey), width: 2),
          ),
        );
      }),
    );
  }
}
