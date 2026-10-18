import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_state.dart';
import '../theme.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({Key? key}) : super(key: key);

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  String _selectedFilter = 'all';

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final lang = appState.language;

    final filterPills = [
      {'id': 'all', 'label': 'All', 'mm': 'အားလုံး'},
      {'id': 'transaction', 'label': 'Transaction', 'mm': 'ငွေလွှဲ'},
      {'id': 'system', 'label': 'System', 'mm': 'စနစ်'},
      {'id': 'promotion', 'label': 'Promotion', 'mm': 'ပရိုမိုးရှင်း'},
    ];

    final filtered = _selectedFilter == 'all'
        ? appState.notifications
        : appState.notifications.where((n) => n.type == _selectedFilter).toList();

    return Scaffold(
      backgroundColor: isDark ? obsidian : paper,
      appBar: AppBar(
        title: Text(
          lang == 'ak' ? 'အသိပေးချက်များ' : 'Notifications',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
        ),
        backgroundColor: isDark ? surfaceDark : Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () {
            if (Navigator.of(context).canPop()) {
              Navigator.of(context).pop();
            } else {
              appState.goBack();
            }
          },
        ),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 16, top: 14, bottom: 14),
            padding: const EdgeInsets.symmetric(horizontal: 8),
            decoration: BoxDecoration(
              border: Border.all(
                color: appState.unreadNotificationsCount > 0 ? Colors.redAccent : Colors.grey,
                width: 1.5,
              ),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Center(
              child: Text(
                '${appState.unreadNotificationsCount}',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  color: appState.unreadNotificationsCount > 0 ? Colors.redAccent : Colors.grey,
                ),
              ),
            ),
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter pills
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: filterPills.map((pill) {
                final active = _selectedFilter == pill['id'];
                return Container(
                  margin: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(
                      (lang == 'ak' ? pill['mm'] : pill['label']) as String,
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: active ? Colors.black : (isDark ? Colors.white70 : Colors.black87),
                      ),
                    ),
                    selected: active,
                    selectedColor: gold,
                    backgroundColor: isDark ? surfaceCard : Colors.grey[200],
                    onSelected: (_) => setState(() => _selectedFilter = pill['id'] as String),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    showCheckmark: false,
                  ),
                );
              }).toList(),
            ),
          ),

          // Mark all read button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: appState.unreadNotificationsCount > 0
                      ? () => appState.markAllNotificationsRead()
                      : null,
                  child: Text(
                    lang == 'ak' ? 'အားလုံး ဖတ်ပြီးဟု မှတ်သား' : 'Mark all as read',
                    style: TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.bold,
                      color: appState.unreadNotificationsCount > 0 ? Colors.redAccent : Colors.grey,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Notifications list
          Expanded(
            child: filtered.isEmpty
                ? Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.notifications_off_outlined, size: 40, color: Colors.grey[600]),
                        const SizedBox(height: 10),
                        Text(
                          lang == 'ak' ? 'အသိပေးချက် မရှိပါ' : 'No notifications in this category',
                          style: TextStyle(color: Colors.grey[500], fontSize: 12),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: filtered.length,
                    itemBuilder: (ctx, idx) {
                      final item = filtered[idx];
                      IconData iconData = Icons.campaign;
                      Color iconColor = Colors.blueAccent;

                      if (item.type == 'transaction') {
                        iconData = Icons.swap_horiz;
                        iconColor = emeraldSuccess;
                      } else if (item.type == 'system') {
                        iconData = Icons.access_time;
                        iconColor = gold;
                      }

                      return GestureDetector(
                        onTap: () => appState.markNotificationRead(item.id),
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: isDark ? surfaceCard : Colors.white,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: item.read
                                  ? (isDark ? Colors.white.withOpacity(0.04) : Colors.grey[200]!)
                                  : gold.withOpacity(0.4),
                              width: item.read ? 1 : 1.5,
                            ),
                            boxShadow: item.read ? null : [BoxShadow(color: gold.withOpacity(0.08), blurRadius: 8)],
                          ),
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  color: iconColor.withOpacity(0.15),
                                  shape: BoxShape.circle,
                                ),
                                child: Icon(iconData, color: iconColor, size: 18),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Expanded(
                                          child: Text(
                                            lang == 'ak' ? item.titleMm : item.titleEn,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 13,
                                              color: isDark ? Colors.white : Colors.black87,
                                            ),
                                          ),
                                        ),
                                        if (!item.read)
                                          Container(
                                            width: 8,
                                            height: 8,
                                            decoration: const BoxDecoration(
                                              color: Colors.redAccent,
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      lang == 'ak' ? item.bodyMm : item.bodyEn,
                                      style: TextStyle(
                                        fontSize: 11,
                                        color: isDark ? Colors.grey[400] : Colors.grey[700],
                                        height: 1.3,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                    Text(
                                      item.time,
                                      style: TextStyle(fontSize: 10, color: Colors.grey[500], fontFamily: 'monospace'),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
