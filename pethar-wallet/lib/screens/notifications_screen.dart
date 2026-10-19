import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../models/data.dart';
import '../theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedFilter = 'all';

  void _showNotificationDetail(
    BuildContext context,
    NotificationItem item,
    AppState appState,
    bool isDark,
    String lang,
  ) {
    appState.markNotificationRead(item.id);
    HapticFeedback.lightImpact();

    IconData iconData = Icons.campaign_rounded;
    List<Color> gradientColors = [const Color(0xFF3B82F6), const Color(0xFF1D4ED8)];
    String categoryName = 'General';

    if (item.type == 'transaction') {
      iconData = Icons.swap_horiz_rounded;
      gradientColors = [const Color(0xFF10B981), const Color(0xFF059669)];
      categoryName = lang == 'ak' ? 'ငွေလွှဲပြောင်းမှု' : 'Transaction';
    } else if (item.type == 'system') {
      iconData = Icons.shield_rounded;
      gradientColors = [const Color(0xFFF59E0B), const Color(0xFFD97706)];
      categoryName = lang == 'ak' ? 'စနစ်လုံခြုံရေး' : 'System & Security';
    } else if (item.type == 'promotion') {
      iconData = Icons.card_giftcard_rounded;
      gradientColors = [const Color(0xFFEC4899), const Color(0xFFE11D48)];
      categoryName = lang == 'ak' ? 'ပရိုမိုးရှင်း' : 'Special Offer';
    }

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) {
        return Container(
          decoration: BoxDecoration(
            color: isDark ? surfaceCard : Colors.white,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.15),
                blurRadius: 24,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          padding: const EdgeInsets.fromLTRB(24, 14, 24, 34),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Drag handle
              Center(
                child: Container(
                  width: 42,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                children: [
                  Container(
                    width: 48,
                    height: 48,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: gradientColors,
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [
                        BoxShadow(
                          color: gradientColors.first.withValues(alpha: 0.35),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Icon(iconData, color: Colors.white, size: 24),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3.5),
                          decoration: BoxDecoration(
                            color: gradientColors.first.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            categoryName,
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: gradientColors.last,
                            ),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Icon(
                              Icons.access_time_rounded,
                              size: 13,
                              color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              item.time,
                              style: TextStyle(
                                fontSize: 12,
                                color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              Text(
                lang == 'ak' ? item.titleMm : item.titleEn,
                style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w800,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                  letterSpacing: -0.2,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                lang == 'ak' ? item.bodyMm : item.bodyEn,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.55,
                  color: isDark ? Colors.grey[300] : const Color(0xFF334155),
                ),
              ),
              const SizedBox(height: 26),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      icon: const Icon(Icons.delete_outline_rounded, size: 18),
                      label: Text(
                        lang == 'ak' ? 'ဖျက်မည်' : 'Delete',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFFE11D48),
                        side: const BorderSide(color: Color(0xFFFECDD3)),
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        appState.deleteNotification(item.id);
                        Navigator.pop(ctx);
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text(lang == 'ak' ? 'အသိပေးချက် ဖျက်ပြီးပါပြီ' : 'Notification deleted'),
                            behavior: SnackBarBehavior.floating,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            duration: const Duration(seconds: 2),
                          ),
                        );
                      },
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: paynoBlue,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () => Navigator.pop(ctx),
                      child: Text(
                        lang == 'ak' ? 'ပြီးပြီ' : 'Done',
                        style: const TextStyle(fontWeight: FontWeight.w700),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final filterPills = [
      {
        'id': 'all',
        'label': 'All',
        'mm': 'အားလုံး',
        'icon': Icons.all_inbox_rounded,
        'count': appState.notifications.length,
      },
      {
        'id': 'transaction',
        'label': 'Transactions',
        'mm': 'ငွေလွှဲ',
        'icon': Icons.swap_horiz_rounded,
        'count': appState.notifications.where((n) => n.type == 'transaction').length,
      },
      {
        'id': 'system',
        'label': 'System',
        'mm': 'စနစ်',
        'icon': Icons.shield_outlined,
        'count': appState.notifications.where((n) => n.type == 'system').length,
      },
      {
        'id': 'promotion',
        'label': 'Offers',
        'mm': 'ပရိုမိုးရှင်း',
        'icon': Icons.card_giftcard_rounded,
        'count': appState.notifications.where((n) => n.type == 'promotion').length,
      },
    ];

    final filtered = _selectedFilter == 'all'
        ? appState.notifications
        : appState.notifications.where((n) => n.type == _selectedFilter).toList();

    // Group filtered notifications by dateGroup
    final dateGroups = <String>[];
    for (final item in filtered) {
      final group = item.dateGroup.isNotEmpty
          ? item.dateGroup
          : (lang == 'ak' ? 'မကြာမီက' : 'Recent');
      if (!dateGroups.contains(group)) {
        dateGroups.add(group);
      }
    }

    final unreadCount = appState.unreadNotificationsCount;

    return Scaffold(
      backgroundColor: isDark ? obsidian : const Color(0xFFF1F6FB),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        scrolledUnderElevation: 0,
        centerTitle: false,
        leadingWidth: 56,
        leading: Padding(
          padding: const EdgeInsets.only(left: 14),
          child: Center(
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: isDark ? surfaceCard : Colors.white,
                shape: BoxShape.circle,
                border: Border.all(
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.08)
                      : const Color(0xFFE2EDF9),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: IconButton(
                padding: EdgeInsets.zero,
                icon: Icon(
                  Icons.arrow_back_ios_new_rounded,
                  size: 16,
                  color: isDark ? Colors.white : const Color(0xFF0F172A),
                ),
                onPressed: () {
                  if (Navigator.of(context).canPop()) {
                    Navigator.of(context).pop();
                  } else {
                    appState.goBack();
                  }
                },
              ),
            ),
          ),
        ),
        title: Text(
          lang == 'ak' ? 'အသိပေးချက်များ' : 'Notifications',
          style: TextStyle(
            fontWeight: FontWeight.w800,
            fontSize: 20,
            color: isDark ? Colors.white : const Color(0xFF0F172A),
            letterSpacing: -0.4,
          ),
        ),
        actions: [
          // Unread status pill
          Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              margin: const EdgeInsets.only(right: 6),
              decoration: BoxDecoration(
                color: unreadCount > 0
                    ? const Color(0xFFFEF2F2)
                    : const Color(0xFFF0FDF4),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: unreadCount > 0
                      ? const Color(0xFFFECACA)
                      : const Color(0xFFBBF7D0),
                  width: 1.2,
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  if (unreadCount > 0) ...[
                    Container(
                      width: 7,
                      height: 7,
                      decoration: const BoxDecoration(
                        color: Color(0xFFDC2626),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 5),
                    Text(
                      '$unreadCount',
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        color: Color(0xFFDC2626),
                      ),
                    ),
                  ] else ...[
                    const Icon(
                      Icons.check_circle_rounded,
                      size: 12,
                      color: Color(0xFF16A34A),
                    ),
                    const SizedBox(width: 4),
                    Text(
                      lang == 'ak' ? 'ဖတ်ပြီး' : 'All read',
                      style: const TextStyle(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w700,
                        color: Color(0xFF16A34A),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),

          // Overflow menu for extra options
          PopupMenuButton<String>(
            icon: Icon(
              Icons.more_vert_rounded,
              color: isDark ? Colors.white70 : const Color(0xFF475569),
            ),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            color: isDark ? surfaceCard : Colors.white,
            elevation: 8,
            onSelected: (val) {
              if (val == 'mark_read') {
                appState.markAllNotificationsRead();
                HapticFeedback.lightImpact();
              } else if (val == 'clear_all') {
                appState.clearAllNotifications();
                HapticFeedback.mediumImpact();
              }
            },
            itemBuilder: (ctx) => [
              PopupMenuItem(
                value: 'mark_read',
                enabled: unreadCount > 0,
                child: Row(
                  children: [
                    const Icon(Icons.done_all_rounded, size: 18, color: paynoBlue),
                    const SizedBox(width: 10),
                    Text(
                      lang == 'ak' ? 'အားလုံး ဖတ်ပြီးဟု မှတ်သား' : 'Mark all as read',
                      style: TextStyle(
                        fontSize: 13,
                        color: unreadCount > 0
                            ? (isDark ? Colors.white : const Color(0xFF0F172A))
                            : Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
              PopupMenuItem(
                value: 'clear_all',
                enabled: appState.notifications.isNotEmpty,
                child: Row(
                  children: [
                    const Icon(Icons.delete_sweep_rounded, size: 18, color: Colors.redAccent),
                    const SizedBox(width: 10),
                    Text(
                      lang == 'ak' ? 'အားလုံး ရှင်းထုတ်မည်' : 'Clear all',
                      style: TextStyle(
                        fontSize: 13,
                        color: appState.notifications.isNotEmpty
                            ? (isDark ? Colors.white : const Color(0xFF0F172A))
                            : Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(width: 6),
        ],
      ),
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: isDark
                ? [surfaceDark, obsidian]
                : [
                    const Color(0xFFE5F1FC).withValues(alpha: 0.8),
                    const Color(0xFFF1F6FB),
                    const Color(0xFFF8FAFC),
                  ],
            stops: const [0.0, 0.25, 1.0],
          ),
        ),
        child: Column(
          children: [
            // Filter Pills Bar
            Container(
              padding: const EdgeInsets.only(top: 8, bottom: 10),
              child: SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: 16),
                child: Row(
                  children: filterPills.map((pill) {
                    final active = _selectedFilter == pill['id'];
                    final count = pill['count'] as int;

                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        curve: Curves.easeInOut,
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            onTap: () {
                              HapticFeedback.selectionClick();
                              setState(() => _selectedFilter = pill['id'] as String);
                            },
                            borderRadius: BorderRadius.circular(24),
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                              decoration: BoxDecoration(
                                gradient: active
                                    ? const LinearGradient(
                                        colors: [Color(0xFF2563EB), Color(0xFF1D4ED8)],
                                        begin: Alignment.topLeft,
                                        end: Alignment.bottomRight,
                                      )
                                    : null,
                                color: active
                                    ? null
                                    : (isDark ? surfaceCard : Colors.white),
                                borderRadius: BorderRadius.circular(24),
                                border: Border.all(
                                  color: active
                                      ? Colors.transparent
                                      : (isDark
                                          ? Colors.white.withValues(alpha: 0.08)
                                          : const Color(0xFFE2EDF9)),
                                  width: 1.2,
                                ),
                                boxShadow: active
                                    ? [
                                        BoxShadow(
                                          color: const Color(0xFF2563EB).withValues(alpha: 0.32),
                                          blurRadius: 10,
                                          offset: const Offset(0, 3),
                                        ),
                                      ]
                                    : [
                                        BoxShadow(
                                          color: Colors.black.withValues(alpha: 0.02),
                                          blurRadius: 4,
                                          offset: const Offset(0, 1),
                                        ),
                                      ],
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    pill['icon'] as IconData,
                                    size: 15,
                                    color: active
                                        ? Colors.white
                                        : (isDark ? Colors.grey[400] : const Color(0xFF64748B)),
                                  ),
                                  const SizedBox(width: 6),
                                  Text(
                                    (lang == 'ak' ? pill['mm'] : pill['label']) as String,
                                    style: TextStyle(
                                      fontSize: 12,
                                      fontWeight: active ? FontWeight.w700 : FontWeight.w600,
                                      color: active
                                          ? Colors.white
                                          : (isDark ? Colors.white70 : const Color(0xFF334155)),
                                    ),
                                  ),
                                  if (count > 0) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                      decoration: BoxDecoration(
                                        color: active
                                            ? Colors.white.withValues(alpha: 0.25)
                                            : (isDark
                                                ? Colors.white.withValues(alpha: 0.08)
                                                : const Color(0xFFF1F5F9)),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: Text(
                                        '$count',
                                        style: TextStyle(
                                          fontSize: 10,
                                          fontWeight: FontWeight.w800,
                                          color: active
                                              ? Colors.white
                                              : (isDark ? Colors.grey[300] : const Color(0xFF64748B)),
                                        ),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),

            // Secondary Toolbar / Status summary
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    filtered.isNotEmpty
                        ? (lang == 'ak'
                            ? '${filtered.length} ခု ပြသနေသည်'
                            : '${filtered.length} notification${filtered.length == 1 ? '' : 's'}')
                        : '',
                    style: TextStyle(
                      fontSize: 11.5,
                      fontWeight: FontWeight.w600,
                      color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                    ),
                  ),
                  if (unreadCount > 0)
                    InkWell(
                      onTap: () {
                        HapticFeedback.lightImpact();
                        appState.markAllNotificationsRead();
                      },
                      borderRadius: BorderRadius.circular(8),
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.done_all_rounded,
                              size: 14,
                              color: Color(0xFF2563EB),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              lang == 'ak' ? 'အားလုံး ဖတ်ပြီး' : 'Mark all read',
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.w700,
                                color: Color(0xFF2563EB),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),

            // Content Area: Empty State or Notification Feed
            Expanded(
              child: filtered.isEmpty
                  ? Center(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(28),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            // Multi-layer glowing icon container
                            Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                gradient: LinearGradient(
                                  colors: isDark
                                      ? [
                                          surfaceCard,
                                          surfaceCard.withValues(alpha: 0.6),
                                        ]
                                      : [
                                          const Color(0xFFDBEAFE).withValues(alpha: 0.6),
                                          const Color(0xFFEFF6FF),
                                        ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                ),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: isDark
                                      ? Colors.white.withValues(alpha: 0.08)
                                      : const Color(0xFFBFDBFE),
                                  width: 1.5,
                                ),
                                boxShadow: [
                                  BoxShadow(
                                    color: paynoBlue.withValues(alpha: 0.08),
                                    blurRadius: 20,
                                    spreadRadius: 4,
                                  ),
                                ],
                              ),
                              child: Center(
                                child: Container(
                                  width: 70,
                                  height: 70,
                                  decoration: BoxDecoration(
                                    color: isDark ? obsidian : Colors.white,
                                    shape: BoxShape.circle,
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withValues(alpha: 0.04),
                                        blurRadius: 10,
                                      ),
                                    ],
                                  ),
                                  child: Stack(
                                    alignment: Alignment.center,
                                    children: [
                                      Icon(
                                        _selectedFilter == 'all'
                                            ? Icons.notifications_none_rounded
                                            : Icons.filter_list_off_rounded,
                                        size: 34,
                                        color: paynoBlue,
                                      ),
                                      Positioned(
                                        top: 14,
                                        right: 14,
                                        child: Container(
                                          width: 10,
                                          height: 10,
                                          decoration: BoxDecoration(
                                            color: const Color(0xFF10B981),
                                            shape: BoxShape.circle,
                                            border: Border.all(
                                              color: isDark ? obsidian : Colors.white,
                                              width: 2,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(height: 22),
                            Text(
                              _selectedFilter == 'all'
                                  ? (lang == 'ak'
                                      ? 'အသိပေးချက်များ အားလုံးရှင်းလင်းပြီးပါပြီ'
                                      : "You're all caught up!")
                                  : (lang == 'ak'
                                      ? 'ဤကဏ္ဍတွင် အသိပေးချက် မရှိသေးပါ'
                                      : 'No notifications in this category'),
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.w800,
                                color: isDark ? Colors.white : const Color(0xFF0F172A),
                                letterSpacing: -0.3,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 20),
                              child: Text(
                                _selectedFilter == 'all'
                                    ? (lang == 'ak'
                                        ? 'ငွေလွှဲပြောင်းမှုများနှင့် လုံခြုံရေးဆိုင်ရာ အသိပေးချက်များ ရောက်ရှိလာပါက ဤနေရာတွင် ဖော်ပြပေးပါမည်။'
                                        : "We'll let you know when new transactions settle, security updates occur, or special benefits arrive.")
                                    : (lang == 'ak'
                                        ? 'အခြားကဏ္ဍများကို စစ်ဆေးကြည့်ပါ သို့မဟုတ် အားလုံးကဏ္ဍသို့ ပြန်သွားပါ။'
                                        : 'There are no updates in this specific tab right now.'),
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  fontSize: 12.5,
                                  height: 1.5,
                                  color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                                ),
                              ),
                            ),
                            const SizedBox(height: 24),
                            if (_selectedFilter != 'all')
                              ElevatedButton.icon(
                                icon: const Icon(Icons.arrow_back_rounded, size: 16),
                                label: Text(
                                  lang == 'ak' ? 'အားလုံးကဏ္ဍသို့ ပြန်သွားမည်' : 'View All Notifications',
                                  style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: paynoBlue,
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                                ),
                                onPressed: () {
                                  setState(() => _selectedFilter = 'all');
                                },
                              ),
                          ],
                        ),
                      ),
                    )
                  : ListView.builder(
                      physics: const BouncingScrollPhysics(),
                      padding: const EdgeInsets.fromLTRB(16, 4, 16, 24),
                      itemCount: dateGroups.length,
                      itemBuilder: (ctx, groupIdx) {
                        final groupName = dateGroups[groupIdx];
                        final itemsInGroup = filtered.where((n) {
                          final g = n.dateGroup.isNotEmpty
                              ? n.dateGroup
                              : (lang == 'ak' ? 'မကြာမီက' : 'Recent');
                          return g == groupName;
                        }).toList();

                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Date section header
                            Padding(
                              padding: const EdgeInsets.only(left: 4, right: 4, top: 12, bottom: 8),
                              child: Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3.5),
                                    decoration: BoxDecoration(
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.05)
                                          : const Color(0xFFE2EDF9).withValues(alpha: 0.7),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      groupName.toUpperCase(),
                                      style: TextStyle(
                                        fontSize: 10,
                                        fontWeight: FontWeight.w800,
                                        letterSpacing: 0.8,
                                        color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  Expanded(
                                    child: Divider(
                                      color: isDark
                                          ? Colors.white.withValues(alpha: 0.06)
                                          : const Color(0xFFE2EDF9),
                                      thickness: 1,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            // Items inside this date group
                            ...itemsInGroup.map((item) {
                              IconData iconData = Icons.campaign_rounded;
                              List<Color> gradientColors = [
                                const Color(0xFF3B82F6),
                                const Color(0xFF1D4ED8),
                              ];
                              String typeLabel = 'General';
                              Color tagBgColor = const Color(0xFFEFF6FF);
                              Color tagTextColor = const Color(0xFF2563EB);

                              if (item.type == 'transaction') {
                                iconData = Icons.swap_horiz_rounded;
                                gradientColors = [
                                  const Color(0xFF10B981),
                                  const Color(0xFF059669),
                                ];
                                typeLabel = lang == 'ak' ? 'ငွေလွှဲ' : 'Transfer';
                                tagBgColor = const Color(0xFFECFDF5);
                                tagTextColor = const Color(0xFF059669);
                              } else if (item.type == 'system') {
                                iconData = Icons.shield_rounded;
                                gradientColors = [
                                  const Color(0xFFF59E0B),
                                  const Color(0xFFD97706),
                                ];
                                typeLabel = lang == 'ak' ? 'စနစ်' : 'System';
                                tagBgColor = const Color(0xFFFFFBEB);
                                tagTextColor = const Color(0xFFD97706);
                              } else if (item.type == 'promotion') {
                                iconData = Icons.card_giftcard_rounded;
                                gradientColors = [
                                  const Color(0xFFEC4899),
                                  const Color(0xFFE11D48),
                                ];
                                typeLabel = lang == 'ak' ? 'ပရိုမိုးရှင်း' : 'Offer';
                                tagBgColor = const Color(0xFFFDF2F8);
                                tagTextColor = const Color(0xFFDB2777);
                              }

                              return Dismissible(
                                key: ValueKey('noti-${item.id}'),
                                direction: DismissDirection.endToStart,
                                background: Container(
                                  margin: const EdgeInsets.only(bottom: 10),
                                  alignment: Alignment.centerRight,
                                  padding: const EdgeInsets.only(right: 20),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFEF4444),
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Row(
                                    mainAxisAlignment: MainAxisAlignment.end,
                                    children: [
                                      const Icon(Icons.delete_outline_rounded, color: Colors.white, size: 22),
                                      const SizedBox(width: 6),
                                      Text(
                                        lang == 'ak' ? 'ဖျက်မည်' : 'Delete',
                                        style: const TextStyle(
                                          color: Colors.white,
                                          fontWeight: FontWeight.bold,
                                          fontSize: 12,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                onDismissed: (_) {
                                  appState.deleteNotification(item.id);
                                  HapticFeedback.lightImpact();
                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      content: Text(lang == 'ak' ? 'အသိပေးချက် ဖျက်ပြီးပါပြီ' : 'Notification removed'),
                                      behavior: SnackBarBehavior.floating,
                                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                      duration: const Duration(seconds: 2),
                                    ),
                                  );
                                },
                                child: Container(
                                  margin: const EdgeInsets.only(bottom: 10),
                                  decoration: BoxDecoration(
                                    color: isDark ? surfaceCard : Colors.white,
                                    borderRadius: BorderRadius.circular(20),
                                    border: Border.all(
                                      color: item.read
                                          ? (isDark
                                              ? Colors.white.withValues(alpha: 0.05)
                                              : const Color(0xFFE8EEF5))
                                          : const Color(0xFF3B82F6).withValues(alpha: 0.35),
                                      width: item.read ? 1 : 1.5,
                                    ),
                                    boxShadow: item.read
                                        ? [
                                            BoxShadow(
                                              color: Colors.black.withValues(alpha: 0.02),
                                              blurRadius: 6,
                                              offset: const Offset(0, 2),
                                            ),
                                          ]
                                        : [
                                            BoxShadow(
                                              color: const Color(0xFF2563EB).withValues(alpha: 0.08),
                                              blurRadius: 12,
                                              offset: const Offset(0, 4),
                                            ),
                                          ],
                                  ),
                                  child: Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      onTap: () => _showNotificationDetail(
                                        context,
                                        item,
                                        appState,
                                        isDark,
                                        lang,
                                      ),
                                      borderRadius: BorderRadius.circular(20),
                                      child: Padding(
                                        padding: const EdgeInsets.all(14),
                                        child: Row(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            // Rich Icon Badge with subtle gradient
                                            Container(
                                              width: 44,
                                              height: 44,
                                              decoration: BoxDecoration(
                                                gradient: LinearGradient(
                                                  colors: gradientColors,
                                                  begin: Alignment.topLeft,
                                                  end: Alignment.bottomRight,
                                                ),
                                                borderRadius: BorderRadius.circular(14),
                                                boxShadow: [
                                                  BoxShadow(
                                                    color: gradientColors.first.withValues(alpha: 0.28),
                                                    blurRadius: 8,
                                                    offset: const Offset(0, 3),
                                                  ),
                                                ],
                                              ),
                                              child: Icon(iconData, color: Colors.white, size: 21),
                                            ),
                                            const SizedBox(width: 12),

                                            // Text info
                                            Expanded(
                                              child: Column(
                                                crossAxisAlignment: CrossAxisAlignment.start,
                                                children: [
                                                  // Title & New indicator
                                                  Row(
                                                    crossAxisAlignment: CrossAxisAlignment.center,
                                                    children: [
                                                      Expanded(
                                                        child: Text(
                                                          lang == 'ak' ? item.titleMm : item.titleEn,
                                                          maxLines: 1,
                                                          overflow: TextOverflow.ellipsis,
                                                          style: TextStyle(
                                                            fontWeight: item.read ? FontWeight.w600 : FontWeight.w800,
                                                            fontSize: 13.5,
                                                            color: isDark ? Colors.white : const Color(0xFF0F172A),
                                                            letterSpacing: -0.2,
                                                          ),
                                                        ),
                                                      ),
                                                      if (!item.read) ...[
                                                        const SizedBox(width: 6),
                                                        Container(
                                                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                          decoration: BoxDecoration(
                                                            color: const Color(0xFFEFF6FF),
                                                            borderRadius: BorderRadius.circular(6),
                                                            border: Border.all(
                                                              color: const Color(0xFFBFDBFE),
                                                            ),
                                                          ),
                                                          child: const Text(
                                                            'NEW',
                                                            style: TextStyle(
                                                              fontSize: 9,
                                                              fontWeight: FontWeight.w900,
                                                              color: Color(0xFF1D4ED8),
                                                              letterSpacing: 0.5,
                                                            ),
                                                          ),
                                                        ),
                                                      ],
                                                    ],
                                                  ),
                                                  const SizedBox(height: 4),

                                                  // Description body
                                                  Text(
                                                    lang == 'ak' ? item.bodyMm : item.bodyEn,
                                                    maxLines: 2,
                                                    overflow: TextOverflow.ellipsis,
                                                    style: TextStyle(
                                                      fontSize: 12,
                                                      height: 1.4,
                                                      color: isDark ? Colors.grey[300] : const Color(0xFF475569),
                                                    ),
                                                  ),
                                                  const SizedBox(height: 8),

                                                  // Bottom metadata row
                                                  Row(
                                                    children: [
                                                      Container(
                                                        padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                                        decoration: BoxDecoration(
                                                          color: isDark
                                                              ? Colors.white.withValues(alpha: 0.08)
                                                              : tagBgColor,
                                                          borderRadius: BorderRadius.circular(6),
                                                        ),
                                                        child: Text(
                                                          typeLabel,
                                                          style: TextStyle(
                                                            fontSize: 10,
                                                            fontWeight: FontWeight.w700,
                                                            color: isDark ? Colors.white70 : tagTextColor,
                                                          ),
                                                        ),
                                                      ),
                                                      const SizedBox(width: 8),
                                                      Icon(
                                                        Icons.access_time_rounded,
                                                        size: 11,
                                                        color: isDark ? Colors.grey[400] : const Color(0xFF94A3B8),
                                                      ),
                                                      const SizedBox(width: 3),
                                                      Text(
                                                        item.time,
                                                        style: TextStyle(
                                                          fontSize: 11,
                                                          color: isDark ? Colors.grey[400] : const Color(0xFF64748B),
                                                        ),
                                                      ),
                                                      const Spacer(),
                                                      Icon(
                                                        Icons.chevron_right_rounded,
                                                        size: 16,
                                                        color: isDark ? Colors.white24 : const Color(0xFFCBD5E1),
                                                      ),
                                                    ],
                                                  ),
                                                ],
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ),
                                ),
                              );
                            }).toList(),
                          ],
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
