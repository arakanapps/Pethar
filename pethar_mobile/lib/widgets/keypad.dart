import 'package:flutter/material.dart';

class Keypad extends StatelessWidget {
  final Function(String) onKeyPressed;
  final VoidCallback onDelete;

  const Keypad({Key? key, required this.onKeyPressed, required this.onDelete}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 3,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      childAspectRatio: 1.5,
      children: [
        _buildKey('1'), _buildKey('2'), _buildKey('3'),
        _buildKey('4'), _buildKey('5'), _buildKey('6'),
        _buildKey('7'), _buildKey('8'), _buildKey('9'),
        _buildKey('.'), _buildKey('0'), _buildDelKey(context),
      ],
    );
  }

  Widget _buildKey(String value) {
    return InkWell(
      onTap: () => onKeyPressed(value),
      child: Center(
        child: Text(value, style: const TextStyle(fontSize: 28, fontWeight: FontWeight.w500)),
      ),
    );
  }

  Widget _buildDelKey(BuildContext context) {
    return InkWell(
      onTap: onDelete,
      child: Center(
        child: Icon(Icons.backspace_outlined, size: 28, color: Theme.of(context).colorScheme.onSurface),
      ),
    );
  }
}
