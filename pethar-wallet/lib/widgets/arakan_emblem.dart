import 'package:flutter/material.dart';
import '../theme.dart';

class ArakanEmblem extends StatelessWidget {
  final double size;
  final Color? color;

  const ArakanEmblem({Key? key, this.size = 40.0, this.color}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final emblemColor = color ?? gold;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        gradient: LinearGradient(
          colors: [emblemColor.withOpacity(0.25), Colors.black54],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        border: Border.all(color: emblemColor, width: size * 0.05),
        boxShadow: [
          BoxShadow(
            color: emblemColor.withOpacity(0.35),
            blurRadius: size * 0.25,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Center(
        child: Container(
          width: size * 0.75,
          height: size * 0.75,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            border: Border.all(color: emblemColor.withOpacity(0.6), width: 1),
          ),
          child: Icon(
            Icons.shield_outlined,
            color: emblemColor,
            size: size * 0.45,
          ),
        ),
      ),
    );
  }
}
