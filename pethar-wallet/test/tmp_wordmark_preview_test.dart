import 'dart:io';
import 'dart:ui' as ui;

import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';

const Color crimson = Color(0xFFD91624);

void main() {
  testWidgets('wordmark preview', (tester) async {
    final roboto = FontLoader('Roboto')
      ..addFont(Future.value(File(
              r'C:\tools\flutter\bin\cache\artifacts\material_fonts\roboto-black.ttf')
          .readAsBytes()
          .then((b) => ByteData.view(b.buffer))));
    await roboto.load();
    final myanmar = FontLoader('MyanmarText')
      ..addFont(Future.value(File(r'C:\Windows\Fonts\mmrtext.ttf')
          .readAsBytes()
          .then((b) => ByteData.view(b.buffer))));
    await myanmar.load();

    final key = GlobalKey();
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          backgroundColor: Colors.white,
          body: Center(
            child: RepaintBoundary(
              key: key,
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.all(24),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: const [
                    Text(
                      'Péthar',
                      style: TextStyle(
                        color: crimson,
                        fontSize: 36,
                        height: 1.0,
                        fontFamily: 'Roboto',
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.8,
                      ),
                    ),
                    SizedBox(width: 8),
                    Text(
                      'ဖေ့သာ',
                      style: TextStyle(
                        color: Color(0xFF18181B),
                        fontSize: 36,
                        height: 1.0,
                        fontFamily: 'MyanmarText',
                        fontWeight: FontWeight.w300,
                        letterSpacing: -0.8,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
    await tester.pumpAndSettle();

    await tester.runAsync(() async {
      final boundary =
          key.currentContext!.findRenderObject() as RenderRepaintBoundary;
      final image = await boundary.toImage(pixelRatio: 3);
      final bytes = await image.toByteData(format: ui.ImageByteFormat.png);
      File(r'D:\Pethar\pethar-wallet\test\tmp_wordmark.png')
          .writeAsBytesSync(bytes!.buffer.asUint8List());
    });
  });
}
