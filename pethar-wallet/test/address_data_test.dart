import 'package:flutter_test/flutter_test.dart';
import 'package:pethar_mobile/data/address_data.dart';

void main() {
  group('KYC structured address data', () {
    test('Myanmar province → district → township → ward cascade resolves', () {
      final provinces = AddressData.provincesFor('Myanmar');
      expect(provinces, contains('Yangon Region'));

      final districts = AddressData.districtsFor('Myanmar', 'Yangon Region');
      expect(districts, contains('Yangon East'));

      final townships = AddressData.townshipsFor(
        'Myanmar',
        'Yangon Region',
        'Yangon East',
      );
      expect(townships, contains('Botataung'));

      final postalCode = AddressData.postalCodeFor(
        'Myanmar',
        'Yangon Region',
        'Yangon East',
        'Botataung',
      );
      expect(postalCode, '11101');

      final wards = AddressData.wardsFor(
        'Myanmar',
        'Yangon Region',
        'Yangon East',
        'Botataung',
      );
      expect(wards, isNotEmpty);
      expect(wards, contains('Ward 1'));
    });

    test('every township exposes a ward list and postal code', () {
      for (final province in AddressData.myanmarProvinces) {
        expect(province.districts, isNotEmpty, reason: province.name);
        for (final district in province.districts) {
          expect(district.townships, isNotEmpty,
              reason: '${province.name}/${district.name}');
          for (final township in district.townships) {
            expect(township.wardOptions, isNotEmpty,
                reason: township.name);
            expect(township.postalCode, isNotEmpty,
                reason: township.name);
          }
        }
      }
    });

    test('non-Myanmar countries fall back to an Other option', () {
      expect(AddressData.provincesFor('Thailand'), ['Other']);
      expect(AddressData.districtsFor('Thailand', 'Other'), ['Other']);
      expect(AddressData.townshipsFor('Thailand', 'Other', 'Other'), ['Other']);
    });
  });
}
