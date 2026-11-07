/// Structured address master data used by the KYC Level 2 flow and the
/// address editor. The hierarchy is:
///
///   Country → Province/State → District → Sub-district/Township → Ward
///
/// Myanmar is the default country. Every township exposes a postal-code
/// dropdown value and a generated ward list so the UI can always be driven by
/// dropdowns (house number and street remain free-text fields).
library;

class AddressTownship {
  final String name;
  final String nameMm;
  final String postalCode;
  final List<String> extraWards;

  const AddressTownship(
    this.name,
    this.nameMm,
    this.postalCode, {
    this.extraWards = const [],
  });

  /// Ward options for the township. A small number of representative local
  /// wards can be supplied per township; otherwise standard ward / quarter /
  /// village-tract options are generated.
  List<String> get wardOptions {
    final generated = <String>[
      for (var i = 1; i <= 12; i++) 'Ward $i',
      for (var i = 1; i <= 5; i++) 'Quarter $i',
      for (var i = 1; i <= 5; i++) 'Village Tract $i',
      ...extraWards,
      'Other',
    ];
    return generated.toSet().toList();
  }
}

class AddressDistrict {
  final String name;
  final String nameMm;
  final List<AddressTownship> townships;

  const AddressDistrict(this.name, this.nameMm, this.townships);
}

class AddressProvince {
  final String name;
  final String nameMm;
  final List<AddressDistrict> districts;

  const AddressProvince(this.name, this.nameMm, this.districts);
}

class AddressData {
  AddressData._();

  static const List<String> countries = [
    'Myanmar',
    'Thailand',
    'India',
    'Bangladesh',
    'China',
    'Laos',
    'Malaysia',
    'Singapore',
    'United States',
    'United Kingdom',
    'Australia',
    'Japan',
    'South Korea',
    'Other',
  ];

  static const List<AddressProvince> myanmarProvinces = [
    AddressProvince('Ayeyarwady Region', 'ဧရာဝတီတိုင်းဒေသကြီး', [
      AddressDistrict('Pathein', 'ပုသိမ်ခရိုင်', [
        AddressTownship('Pathein', 'ပုသိမ်', '10011'),
        AddressTownship('Kangyidaunt', 'ကန်ကြီးထောင့်', '10012'),
        AddressTownship('Thabaung', 'သပိတ်ကျင်း', '10013'),
        AddressTownship('Ngapudaw', 'ငပုတော', '10014'),
        AddressTownship('Kyonpyaw', 'ကျုံပျော်', '10015'),
        AddressTownship('Yegyi', 'ရေကြည်', '10016'),
        AddressTownship('Kyaunggon', 'ကျောင်းကုန်း', '10017'),
      ]),
      AddressDistrict('Hinthada', 'ဟင်္သာတခရိုင်', [
        AddressTownship('Hinthada', 'ဟင်္သာတ', '10021'),
        AddressTownship('Zalun', 'ဇလွန်', '10022'),
        AddressTownship('Laymyethna', 'လေးမျက်နှာ', '10023'),
        AddressTownship('Myanaung', 'မြန်အောင်', '10024'),
        AddressTownship('Ingapu', 'အင်္ဂပူ', '10025'),
      ]),
      AddressDistrict('Labutta', 'လပွတ္တာခရိုင်', [
        AddressTownship('Labutta', 'လပွတ္တာ', '10031'),
        AddressTownship('Mawlamyinegyun', 'မော်လမြိုင်ကျွန်း', '10032'),
      ]),
      AddressDistrict('Maubin', 'မအူပင်ခရိုင်', [
        AddressTownship('Maubin', 'မအူပင်', '10041'),
        AddressTownship('Pantanaw', 'ပန်းတနော်', '10042'),
        AddressTownship('Nyaungdon', 'ညောင်တုန်း', '10043'),
        AddressTownship('Danubyu', 'ဓနုဖြူ', '10044'),
      ]),
      AddressDistrict('Myaungmya', 'မြောင်းမြခရိုင်', [
        AddressTownship('Myaungmya', 'မြောင်းမြ', '10051'),
        AddressTownship('Einme', 'အိမ်မဲ', '10052'),
        AddressTownship('Wakema', 'ဝါးခယ်မ', '10053'),
      ]),
      AddressDistrict('Pyapon', 'ဖျာပုံခရိုင်', [
        AddressTownship('Pyapon', 'ဖျာပုံ', '10061'),
        AddressTownship('Bogale', 'ဘိုကလေး', '10062'),
        AddressTownship('Kyaiklat', 'ကျိုက်လတ်', '10063'),
        AddressTownship('Dedaye', 'ဒေးဒရဲ', '10064'),
      ]),
    ]),
    AddressProvince('Bago Region', 'ပဲခူးတိုင်းဒေသကြီး', [
      AddressDistrict('Bago', 'ပဲခူးခရိုင်', [
        AddressTownship('Bago', 'ပဲခူး', '08011'),
        AddressTownship('Thanatpin', 'သနပ်ပင်', '08012'),
        AddressTownship('Kawa', 'ကဝ', '08013'),
        AddressTownship('Waw', 'ဝေါ', '08014'),
        AddressTownship('Nyaunglebin', 'ညောင်လေးပင်', '08015'),
        AddressTownship('Kyauktaga', 'ကျောက်တံခါး', '08016'),
        AddressTownship('Daik-U', 'ဒိုက်ဦး', '08017'),
        AddressTownship('Shwegyin', 'ရွှေကျင်', '08018'),
      ]),
      AddressDistrict('Taungoo', 'တောင်ငူခရိုင်', [
        AddressTownship('Taungoo', 'တောင်ငူ', '08021'),
        AddressTownship('Yedashe', 'ရေတာရှည်', '08022'),
        AddressTownship('Kyaukkyi', 'ကျောက်ကြီး', '08023'),
        AddressTownship('Htantabin', 'ထန်တပင်', '08024'),
        AddressTownship('Oktwin', 'အုတ်တွင်း', '08025'),
        AddressTownship('Phyu', 'ဖြူး', '08026'),
      ]),
      AddressDistrict('Thayarwady', 'သာယာဝတီခရိုင်', [
        AddressTownship('Thayarwady', 'သာယာဝတီ', '08031'),
        AddressTownship('Monyo', 'မုန်းရိုး', '08032'),
        AddressTownship('Gyobingauk', 'ကြို့ပင်ကောက်', '08033'),
        AddressTownship('Okpho', 'အုတ်ဖို', '08034'),
        AddressTownship('Zigon', 'ဇီးကုန်း', '08035'),
        AddressTownship('Minhla', 'မင်းလှ', '08036'),
        AddressTownship('Nattalin', 'နတ်တလင်း', '08037'),
        AddressTownship('Letpadan', 'လက်ပံတန်း', '08038'),
      ]),
      AddressDistrict('Pyay', 'ပြည်ခရိုင်', [
        AddressTownship('Pyay', 'ပြည်', '08041'),
        AddressTownship('Paukkhaung', 'ပေါက်ခေါင်း', '08042'),
        AddressTownship('Padaung', 'ပန်းတောင်း', '08043'),
        AddressTownship('Paungde', 'ပေါင်းတည်', '08044'),
        AddressTownship('Thegon', 'သဲကုန်း', '08045'),
        AddressTownship('Shwedaung', 'ရွှေတောင်', '08046'),
      ]),
    ]),
    AddressProvince('Chin State', 'ချင်းပြည်နယ်', [
      AddressDistrict('Falam', 'ဖလမ်းခရိုင်', [
        AddressTownship('Falam', 'ဖလမ်း', '03011'),
        AddressTownship('Tedim', 'တီးတိန်', '03012'),
        AddressTownship('Tonzang', 'တွန်းဇံ', '03013'),
        AddressTownship('Cikha', 'စီခါ', '03014'),
        AddressTownship('Rihkhawdar', 'ရိခ်ခေါဒါ', '03015'),
      ]),
      AddressDistrict('Hakha', 'ဟားခါးခရိုင်', [
        AddressTownship('Hakha', 'ဟားခါး', '03021'),
        AddressTownship('Thantlang', 'ထန်တလန်', '03022'),
        AddressTownship('Kanpetlet', 'ကန်ပက်လက်', '03023'),
        AddressTownship('Matupi', 'မတူပီ', '03024'),
        AddressTownship('Paletwa', 'ပလက်ဝ', '03025'),
        AddressTownship('Mindat', 'မင်းတပ်', '03026'),
      ]),
    ]),
    AddressProvince('Kachin State', 'ကချင်ပြည်နယ်', [
      AddressDistrict('Myitkyina', 'မြစ်ကြီးနားခရိုင်', [
        AddressTownship('Myitkyina', 'မြစ်ကြီးနား', '01011'),
        AddressTownship('Waingmaw', 'ဝိုင်းမော်', '01012'),
        AddressTownship('Injangyang', 'အင်ဂျန်းယန်', '01013'),
        AddressTownship('Tanai', 'တနိုင်း', '01014'),
        AddressTownship('Chipwi', 'ချီဖွေ', '01015'),
        AddressTownship('Tsawlaw', 'ဆော့လော်', '01016'),
        AddressTownship('Hsawlaw', 'ဆော့လော်', '01017'),
      ]),
      AddressDistrict('Bhamo', 'ဗန်းမော်ခရိုင်', [
        AddressTownship('Bhamo', 'ဗန်းမော်', '01021'),
        AddressTownship('Mansi', 'မံစီ', '01022'),
        AddressTownship('Momauk', 'မိုးမောက်', '01023'),
        AddressTownship('Shwegu', 'ရွှေကူ', '01024'),
      ]),
      AddressDistrict('Mohnyin', 'မိုးညှင်းခရိုင်', [
        AddressTownship('Mohnyin', 'မိုးညှင်း', '01031'),
        AddressTownship('Mogaung', 'မိုးကောင်း', '01032'),
        AddressTownship('Hpakant', 'ဖားကန့်', '01033'),
        AddressTownship('Kamine', 'ကာမိုင်း', '01034'),
      ]),
      AddressDistrict('Putao', 'ပူတာအိုခရိုင်', [
        AddressTownship('Putao', 'ပူတာအို', '01041'),
        AddressTownship('Machanbaw', 'မချမ်းဘော', '01042'),
        AddressTownship('Sumprabum', 'ဆွမ်ပရာဘွမ်', '01043'),
        AddressTownship('Nawngmun', 'နောင်မွန်', '01044'),
        AddressTownship('Khaunglanhpu', 'ခေါင်းလန်းဖူ', '01045'),
      ]),
    ]),
    AddressProvince('Kayah State', 'ကယားပြည်နယ်', [
      AddressDistrict('Loikaw', 'လွိုင်ကော်ခရိုင်', [
        AddressTownship('Loikaw', 'လွိုင်ကော်', '09011'),
        AddressTownship('Demoso', 'ဒီမောဆို', '09012'),
        AddressTownship('Hpruso', 'ဖရူဆို', '09013'),
        AddressTownship('Shadaw', 'ရှားတော', '09014'),
        AddressTownship('Bawlake', 'ဘောလခဲ', '09015'),
        AddressTownship('Kyebogyi', 'ကြေးဘုန်းကြီး', '09016'),
        AddressTownship('Mese', 'မယ်စဲ', '09017'),
      ]),
    ]),
    AddressProvince('Kayin State', 'ကရင်ပြည်နယ်', [
      AddressDistrict('Hpa-An', 'ဘားအံခရိုင်', [
        AddressTownship('Hpa-An', 'ဘားအံ', '13011'),
        AddressTownship('Hlaingbwe', 'လှိုင်းဘွဲ', '13012'),
        AddressTownship('Hpapun', 'ဖာပွန်', '13013'),
        AddressTownship('Thandaunggyi', 'သံတောင်ကြီး', '13014'),
      ]),
      AddressDistrict('Myawaddy', 'မြဝတီခရိုင်', [
        AddressTownship('Myawaddy', 'မြဝတီ', '13021'),
        AddressTownship('Kawkareik', 'ကော့ကရိတ်', '13022'),
        AddressTownship('Kyainseikgyi', 'ကြာအင်းဆိပ်ကြီး', '13023'),
        AddressTownship('Kyaikdon', 'ကျိုက်ဒုံ', '13024'),
      ]),
    ]),
    AddressProvince('Magway Region', 'မကွေးတိုင်းဒေသကြီး', [
      AddressDistrict('Magway', 'မကွေးခရိုင်', [
        AddressTownship('Magway', 'မကွေး', '04011'),
        AddressTownship('Yenangyaung', 'ရေနံချောင်း', '04012'),
        AddressTownship('Chauk', 'ချောက်', '04013'),
        AddressTownship('Taungdwingyi', 'တောင်တွင်းကြီး', '04014'),
        AddressTownship('Myothit', 'မြို့သစ်', '04015'),
        AddressTownship('Natmauk', 'နတ်မောက်', '04016'),
      ]),
      AddressDistrict('Minbu', 'မင်းဘူးခရိုင်', [
        AddressTownship('Minbu', 'မင်းဘူး', '04021'),
        AddressTownship('Pwintbyu', 'ပွင့်ဖြူ', '04022'),
        AddressTownship('Ngape', 'ငဖဲ', '04023'),
        AddressTownship('Salin', 'ဆားလင်း', '04024'),
        AddressTownship('Sidoktaya', 'စေတုတ္တရာ', '04025'),
      ]),
      AddressDistrict('Pakokku', 'ပခုက္ကူခရိုင်', [
        AddressTownship('Pakokku', 'ပခုက္ကူ', '04031'),
        AddressTownship('Yesagyo', 'ရေစကြို', '04032'),
        AddressTownship('Pauk', 'ပေါက်', '04033'),
        AddressTownship('Myaing', 'မြိုင်', '04034'),
        AddressTownship('Seikphyu', 'ဆိပ်ဖြူ', '04035'),
      ]),
      AddressDistrict('Thayet', 'သရက်ခရိုင်', [
        AddressTownship('Thayet', 'သရက်', '04041'),
        AddressTownship('Aunglan', 'အောင်လံ', '04042'),
        AddressTownship('Sinbaungwe', 'ဆင်ပေါင်ဝဲ', '04043'),
        AddressTownship('Kamma', 'ကံမ', '04044'),
        AddressTownship('Mindon', 'မင်းတုန်း', '04045'),
      ]),
      AddressDistrict('Gangaw', 'ဂန့်ဂေါခရိုင်', [
        AddressTownship('Gangaw', 'ဂန့်ဂေါ', '04051'),
        AddressTownship('Tilin', 'ထီးလင်း', '04052'),
        AddressTownship('Saw', 'ဆော', '04053'),
        AddressTownship('Htilin', 'ထီးလင်း', '04054'),
        AddressTownship('Kyaukhtu', 'ကျောက်ထူ', '04055'),
      ]),
    ]),
    AddressProvince('Mandalay Region', 'မန္တလေးတိုင်းဒေသကြီး', [
      AddressDistrict('Mandalay', 'မန္တလေးခရိုင်', [
        AddressTownship('Chanayethazan', 'ချမ်းအေးသာဇံ', '05011'),
        AddressTownship('Maha Aungmyay', 'မဟာအောင်မြေ', '05012'),
        AddressTownship('Aungmyaythazan', 'အောင်မြေသာဇံ', '05013'),
        AddressTownship('Pyigyitagon', 'ပြည်ကြီးတံခွန်', '05014'),
        AddressTownship('Amarapura', 'အမရပူရ', '05015'),
        AddressTownship('Patheingyi', 'ပုသိမ်ကြီး', '05016'),
        AddressTownship('Madaya', 'မတ္တရာ', '05017'),
        AddressTownship('Sintgaing', 'စဉ့်ကူး', '05018'),
      ]),
      AddressDistrict('Pyin Oo Lwin', 'ပြင်ဦးလွင်ခရိုင်', [
        AddressTownship('Pyin Oo Lwin', 'ပြင်ဦးလွင်', '05021'),
        AddressTownship('Mogok', 'မိုးကုတ်', '05022'),
        AddressTownship('Thabeikkyin', 'သပိတ်ကျင်း', '05023'),
        AddressTownship('Singu', 'စဉ့်ကူ', '05024'),
      ]),
      AddressDistrict('Kyaukse', 'ကျောက်ဆည်ခရိုင်', [
        AddressTownship('Kyaukse', 'ကျောက်ဆည်', '05031'),
        AddressTownship('Myittha', 'မြစ်သား', '05032'),
        AddressTownship('Tada-U', 'တံတားဦး', '05033'),
        AddressTownship('Singaing', 'စဉ့်ကိုင်', '05034'),
      ]),
      AddressDistrict('Myingyan', 'မြင်းခြံခရိုင်', [
        AddressTownship('Myingyan', 'မြင်းခြံ', '05041'),
        AddressTownship('Taungtha', 'တောင်သာ', '05042'),
        AddressTownship('Natogyi', 'နွားထိုးကြီး', '05043'),
        AddressTownship('Kyaukpadaung', 'ကျောက်ပန်းတောင်း', '05044'),
        AddressTownship('Ngazun', 'ငါန်းဇွန်', '05045'),
      ]),
      AddressDistrict('Nyaung-U', 'ညောင်ဦးခရိုင်', [
        AddressTownship('Nyaung-U', 'ညောင်ဦး', '05051'),
        AddressTownship('Kyaukpadaung', 'ကျောက်ပန်းတောင်း', '05052'),
      ]),
      AddressDistrict('Yamethin', 'ရမည်းသင်းခရိုင်', [
        AddressTownship('Yamethin', 'ရမည်းသင်း', '05061'),
        AddressTownship('Pyawbwe', 'ပျော်ဘွယ်', '05062'),
      ]),
      AddressDistrict('Meiktila', 'မိတ္ထီလာခရိုင်', [
        AddressTownship('Meiktila', 'မိတ္ထီလာ', '05071'),
        AddressTownship('Mahlaing', 'မလှိုင်', '05072'),
        AddressTownship('Thazi', 'သာစည်', '05073'),
        AddressTownship('Wundwin', 'ဝမ်းတွင်း', '05074'),
      ]),
    ]),
    AddressProvince('Mon State', 'မွန်ပြည်နယ်', [
      AddressDistrict('Mawlamyine', 'မော်လမြိုင်ခရိုင်', [
        AddressTownship('Mawlamyine', 'မော်လမြိုင်', '12011'),
        AddressTownship('Kyaikmaraw', 'ကျိုက်မရော', '12012'),
        AddressTownship('Chaungzon', 'ချောင်းဆုံ', '12013'),
        AddressTownship('Thanbyuzayat', 'သံဖြူဇရပ်', '12014'),
        AddressTownship('Mudon', 'မုဒုံ', '12015'),
        AddressTownship('Ye', 'ရေး', '12016'),
      ]),
      AddressDistrict('Thaton', 'သထုံခရိုင်', [
        AddressTownship('Thaton', 'သထုံ', '12021'),
        AddressTownship('Paung', 'ပေါင်', '12022'),
        AddressTownship('Kyaikto', 'ကျိုက်ထို', '12023'),
        AddressTownship('Bilin', 'ဘီးလင်း', '12024'),
      ]),
    ]),
    AddressProvince('Rakhine State', 'ရခိုင်ပြည်နယ်', [
      AddressDistrict('Sittwe', 'စစ်တွေခရိုင်', [
        AddressTownship('Sittwe', 'စစ်တွေ', '07011'),
        AddressTownship('Ponnagyun', 'ပုဏ္ဏားကျွန်း', '07012'),
        AddressTownship('Rathedaung', 'ရသေ့တောင်', '07013'),
        AddressTownship('Kyauktaw', 'ကျောက်တော်', '07014'),
        AddressTownship('Mrauk-U', 'မြောက်ဦး', '07015'),
        AddressTownship('Minbya', 'မင်းပြား', '07016'),
        AddressTownship('Myebon', 'မြေပုံ', '07017'),
        AddressTownship('Pauktaw', 'ပေါက်တော', '07018'),
      ]),
      AddressDistrict('Kyaukpyu', 'ကျောက်ဖြူခရိုင်', [
        AddressTownship('Kyaukpyu', 'ကျောက်ဖြူ', '07021'),
        AddressTownship('Ann', 'အမ်း', '07022'),
        AddressTownship('Ramree', 'ရမ်းဗြဲ', '07023'),
        AddressTownship('Manaung', 'မာန်အောင်', '07024'),
      ]),
      AddressDistrict('Thandwe', 'သံတွဲခရိုင်', [
        AddressTownship('Thandwe', 'သံတွဲ', '07031'),
        AddressTownship('Taungup', 'တောင်ကုတ်', '07032'),
        AddressTownship('Gwa', 'ဂွမ', '07033'),
        AddressTownship('Maei', 'မေယီ', '07034'),
      ]),
      AddressDistrict('Maungdaw', 'မောင်တောခရိုင်', [
        AddressTownship('Maungdaw', 'မောင်တော', '07041'),
        AddressTownship('Buthidaung', 'ဘူးသီးတောင်', '07042'),
      ]),
    ]),
    AddressProvince('Sagaing Region', 'စစ်ကိုင်းတိုင်းဒေသကြီး', [
      AddressDistrict('Sagaing', 'စစ်ကိုင်းခရိုင်', [
        AddressTownship('Sagaing', 'စစ်ကိုင်း', '02011'),
        AddressTownship('Myinmu', 'မြင်းမူ', '02012'),
        AddressTownship('Myaung', 'မြောင်', '02013'),
        AddressTownship('Salingyi', 'ဆားလင်းကြီး', '02014'),
        AddressTownship('Pale', 'ပုလဲ', '02015'),
        AddressTownship('Yinmabin', 'ယင်းမာပင်', '02016'),
        AddressTownship('Kani', 'ကနီ', '02017'),
        AddressTownship('Wetlet', 'ဝက်လက်', '02018'),
      ]),
      AddressDistrict('Monywa', 'မုံရွာခရိုင်', [
        AddressTownship('Monywa', 'မုံရွာ', '02021'),
        AddressTownship('Ayadaw', 'အရာတော်', '02022'),
        AddressTownship('Budalin', 'ဘုတလင်', '02023'),
        AddressTownship('Chaung-U', 'ချောင်းဦး', '02024'),
        AddressTownship('Tabayin', 'ဒီပဲယင်း', '02025'),
      ]),
      AddressDistrict('Katha', 'ကသာခရိုင်', [
        AddressTownship('Katha', 'ကသာ', '02031'),
        AddressTownship('Banmauk', 'ဗန်းမောက်', '02032'),
        AddressTownship('Indaw', 'အင်းတော်', '02033'),
        AddressTownship('Tigyaing', 'တိဂျိန်း', '02034'),
        AddressTownship('Wuntho', 'ဝန်းသို', '02035'),
        AddressTownship('Kawlin', 'ကောလင်း', '02036'),
        AddressTownship('Pinlebu', 'ပင်လည်ဘူး', '02037'),
      ]),
      AddressDistrict('Kalay', 'ကလေးခရိုင်', [
        AddressTownship('Kalay', 'ကလေး', '02041'),
        AddressTownship('Kalewa', 'ကလေးဝ', '02042'),
        AddressTownship('Mingin', 'မင်းကင်း', '02043'),
      ]),
      AddressDistrict('Tamu', 'တမူးခရိုင်', [
        AddressTownship('Tamu', 'တမူး', '02051'),
        AddressTownship('Khampat', 'ခန်းပတ်', '02052'),
      ]),
      AddressDistrict('Hkamti', 'ခန္တီးခရိုင်', [
        AddressTownship('Hkamti', 'ခန္တီး', '02061'),
        AddressTownship('Homalin', 'ဟုမ္မလင်း', '02062'),
        AddressTownship('Leshi', 'လေရှီး', '02063'),
        AddressTownship('Lahe', 'လဟယ်', '02064'),
        AddressTownship('Nanyun', 'နန်းယွန်း', '02065'),
      ]),
      AddressDistrict('Mawlaik', 'မော်လိုက်ခရိုင်', [
        AddressTownship('Mawlaik', 'မော်လိုက်', '02071'),
        AddressTownship('Paungbyin', 'ပေါင်းဘြဲ', '02072'),
      ]),
    ]),
    AddressProvince('Shan State', 'ရှမ်းပြည်နယ်', [
      AddressDistrict('Taunggyi', 'တောင်ကြီးခရိုင်', [
        AddressTownship('Taunggyi', 'တောင်ကြီး', '06011'),
        AddressTownship('Nyaungshwe', 'ညောင်ရွှေ', '06012'),
        AddressTownship('Hopong', 'ဟိုပုံး', '06013'),
        AddressTownship('Hsihseng', 'ဆီဆိုင်', '06014'),
        AddressTownship('Kalaw', 'ကလော', '06015'),
        AddressTownship('Pindaya', 'ပင်းတယ', '06016'),
        AddressTownship('Ywangan', 'ရွာငံ', '06017'),
        AddressTownship('Lawksawk', 'ရပ်စောက်', '06018'),
      ]),
      AddressDistrict('Loilem', 'လွိုင်လင်ခရိုင်', [
        AddressTownship('Loilem', 'လွိုင်လင်', '06021'),
        AddressTownship('Kunhing', 'ကွန်ဟိန်း', '06022'),
        AddressTownship('Kyethi', 'ကျေးသီး', '06023'),
        AddressTownship('Laihka', 'လဲချား', '06024'),
        AddressTownship('Mongkaing', 'မိုင်းကိုင်', '06025'),
        AddressTownship('Mongyai', 'မိုင်းယပ်', '06026'),
        AddressTownship('Nansang', 'နမ့်စန်', '06027'),
      ]),
      AddressDistrict('Kyaukme', 'ကျောက်မဲခရိုင်', [
        AddressTownship('Kyaukme', 'ကျောက်မဲ', '06031'),
        AddressTownship('Hsipaw', 'သီပေါ', '06032'),
        AddressTownship('Namtu', 'နမ္မတူ', '06033'),
        AddressTownship('Namkham', 'နမ့်ခမ်း', '06034'),
        AddressTownship('Mongmit', 'မိုးမိတ်', '06035'),
        AddressTownship('Manton', 'မန်တုန်', '06036'),
        AddressTownship('Kutkai', 'ကွတ်ခိုင်', '06037'),
      ]),
      AddressDistrict('Lashio', 'လားရှိုးခရိုင်', [
        AddressTownship('Lashio', 'လားရှိုး', '06041'),
        AddressTownship('Hseni', 'သိန္နီ', '06042'),
        AddressTownship('Tangyan', 'တန့်ယန်း', '06043'),
      ]),
      AddressDistrict('Muse', 'မူဆယ်ခရိုင်', [
        AddressTownship('Muse', 'မူဆယ်', '06051'),
        AddressTownship('Namkham', 'နမ့်ခမ်း', '06052'),
        AddressTownship('Kutkai', 'ကွတ်ခိုင်', '06053'),
        AddressTownship('Konkyan', 'ကုန်းကျန်', '06054'),
        AddressTownship('Laukkaing', 'လောက်ကိုင်', '06055'),
        AddressTownship('Chinshwehaw', 'ချင်းရွှေဟော်', '06056'),
      ]),
      AddressDistrict('Kengtung', 'ကျိုင်းတုံခရိုင်', [
        AddressTownship('Kengtung', 'ကျိုင်းတုံ', '06061'),
        AddressTownship('Mong Khet', 'မိုင်းခတ်', '06062'),
        AddressTownship('Mong Yang', 'မိုင်းယန်း', '06063'),
        AddressTownship('Mong La', 'မိုင်းလား', '06064'),
        AddressTownship('Mong Yawng', 'မိုင်းယောင်း', '06065'),
      ]),
      AddressDistrict('Tachileik', 'တာချီလိတ်ခရိုင်', [
        AddressTownship('Tachileik', 'တာချီလိတ်', '06071'),
        AddressTownship('Mong Hsat', 'မိုင်းဆတ်', '06072'),
        AddressTownship('Mong Ton', 'မိုင်းတုံ', '06073'),
        AddressTownship('Mong Hpayak', 'မိုင်းဖြတ်', '06074'),
      ]),
    ]),
    AddressProvince('Tanintharyi Region', 'တနင်္သာရီတိုင်းဒေသကြီး', [
      AddressDistrict('Dawei', 'ထားဝယ်ခရိုင်', [
        AddressTownship('Dawei', 'ထားဝယ်', '14011'),
        AddressTownship('Launglon', 'လောင်းလုံ', '14012'),
        AddressTownship('Thayetchaung', 'သရက်ချောင်း', '14013'),
        AddressTownship('Yebyu', 'ရေဖြူ', '14014'),
      ]),
      AddressDistrict('Myeik', 'မြိတ်ခရိုင်', [
        AddressTownship('Myeik', 'မြိတ်', '14021'),
        AddressTownship('Kyunsu', 'ကျွန်းစု', '14022'),
        AddressTownship('Palaw', 'ပုလော', '14023'),
        AddressTownship('Tanintharyi', 'တနင်္သာရီ', '14024'),
      ]),
      AddressDistrict('Kawthaung', 'ကော့သောင်းခရိုင်', [
        AddressTownship('Kawthaung', 'ကော့သောင်း', '14031'),
        AddressTownship('Bokpyin', 'ဘုတ်ပြင်း', '14032'),
      ]),
    ]),
    AddressProvince('Yangon Region', 'ရန်ကုန်တိုင်းဒေသကြီး', [
      AddressDistrict('Yangon East', 'ရန်ကုန်အရှေ့ပိုင်းခရိုင်', [
        AddressTownship('Botataung', 'ဗိုလ်တထောင်', '11101'),
        AddressTownship('Pabedan', 'ပန်းဘဲတန်း', '11102'),
        AddressTownship('Kyauktada', 'ကျောက်တံတား', '11103'),
        AddressTownship('Pazundaung', 'ပုဇွန်တောင်', '11104'),
        AddressTownship('Mingala Taungnyunt', 'မင်္ဂလာတောင်ညွန့်', '11105'),
        AddressTownship('Dagon', 'ဒဂုံ', '11106'),
        AddressTownship('Thaketa', 'သက်တန့်', '11107'),
        AddressTownship('Dawbon', 'ဒေါပုံ', '11108'),
        AddressTownship('Tamwe', 'တာမွေ', '11109'),
        AddressTownship('Yankin', 'ရန်ကင်း', '11110'),
        AddressTownship('Thingangyun', 'သင်္ဃန်းကျွန်း', '11111'),
        AddressTownship('South Okkalapa', 'တောင်ဥက္ကလာပ', '11112'),
      ]),
      AddressDistrict('Yangon West', 'ရန်ကုန်အနောက်ပိုင်းခရိုင်', [
        AddressTownship('Ahlone', 'အလုံ', '11121'),
        AddressTownship('Kyeemyindaing', 'ကြည့်မြင်တိုင်', '11122'),
        AddressTownship('Lanmadaw', 'လမ်းမတော်', '11123'),
        AddressTownship('Latha', 'လသာ', '11124'),
        AddressTownship('Seikkan', 'ဆိပ်ကမ်း', '11125'),
        AddressTownship('Sanchaung', 'စမ်းချောင်း', '11126'),
      ]),
      AddressDistrict('Yangon North', 'ရန်ကုန်မြောက်ပိုင်းခရိုင်', [
        AddressTownship('Insein', 'အင်းစိန်', '11131'),
        AddressTownship('Mingaladon', 'မင်္ဂလာဒုံ', '11132'),
        AddressTownship('Shwepyitha', 'ရွှေပြည်သာ', '11133'),
        AddressTownship('Hlaingtharya', 'လှိုင်သာယာ', '11134'),
        AddressTownship('Hlaing', 'လှိုင်', '11135'),
        AddressTownship('Kamayut', 'ကမာရွတ်', '11136'),
        AddressTownship('Mayangone', 'မရမ်းကုန်း', '11137'),
        AddressTownship('North Okkalapa', 'မြောက်ဥက္ကလာပ', '11138'),
      ]),
      AddressDistrict('Yangon South', 'ရန်ကုန်တောင်ပိုင်းခရိုင်', [
        AddressTownship('Kyauktan', 'ကျောက်တန်း', '11141'),
        AddressTownship('Thanlyin', 'သန်လျင်', '11142'),
        AddressTownship('Thongwa', 'သုံးခွ', '11143'),
        AddressTownship('Kayan', 'ခရမ်း', '11144'),
        AddressTownship('Twante', 'တွံတေး', '11145'),
        AddressTownship('Kawhmu', 'ကော့မှူး', '11146'),
        AddressTownship('Kungyangon', 'ကွမ်းခြံကုန်း', '11147'),
        AddressTownship('Dala', 'ဒလ', '11148'),
        AddressTownship('Seikkyi Kanaungto', 'ဆိပ်ကြီးခနောင်တို', '11149'),
        AddressTownship('Cocokyun', 'ကိုကိုးကျွန်း', '11150'),
      ]),
    ]),
    AddressProvince('Naypyidaw Union Territory', 'နေပြည်တော်ပြည်ထောင်စုနယ်မြေ', [
      AddressDistrict('Zabuthiri', 'ဇမ္ဗူသီရိခရိုင်', [
        AddressTownship('Zabuthiri', 'ဇမ္ဗူသီရိ', '15011'),
      ]),
      AddressDistrict('Pobbathiri', 'ပုဗ္ဗသီရိခရိုင်', [
        AddressTownship('Pobbathiri', 'ပုဗ္ဗသီရိ', '15012'),
      ]),
      AddressDistrict('Ottarathiri', 'ဥတ္တရသီရိခရိုင်', [
        AddressTownship('Ottarathiri', 'ဥတ္တရသီရိ', '15013'),
      ]),
      AddressDistrict('Dekkhinathiri', 'ဒက္ခိဏသီရိခရိုင်', [
        AddressTownship('Dekkhinathiri', 'ဒက္ခိဏသီရိ', '15014'),
      ]),
      AddressDistrict('Pyinmana', 'ပျဉ်းမနားခရိုင်', [
        AddressTownship('Pyinmana', 'ပျဉ်းမနား', '15015'),
      ]),
      AddressDistrict('Lewe', 'လယ်ဝေးခရိုင်', [
        AddressTownship('Lewe', 'လယ်ဝေး', '15016'),
      ]),
      AddressDistrict('Tatkon', 'တပ်ကုန်းခရိုင်', [
        AddressTownship('Tatkon', 'တပ်ကုန်း', '15017'),
      ]),
    ]),
  ];

  static List<String> provincesFor(String country) {
    if (country == 'Myanmar') {
      return myanmarProvinces.map((p) => p.name).toList();
    }
    return const ['Other'];
  }

  static List<String> districtsFor(String country, String provinceName) {
    if (country != 'Myanmar') return const ['Other'];
    final province = myanmarProvinces
        .where((p) => p.name == provinceName)
        .cast<AddressProvince?>()
        .firstWhere((p) => p != null, orElse: () => null);
    return province == null
        ? const ['Other']
        : province.districts.map((d) => d.name).toList();
  }

  static List<String> townshipsFor(
      String country, String provinceName, String districtName) {
    if (country != 'Myanmar') return const ['Other'];
    for (final province in myanmarProvinces) {
      if (province.name != provinceName) continue;
      for (final district in province.districts) {
        if (district.name != districtName) continue;
        return district.townships.map((t) => t.name).toList();
      }
    }
    return const ['Other'];
  }

  static AddressTownship? findTownship(
    String country,
    String provinceName,
    String districtName,
    String townshipName,
  ) {
    if (country != 'Myanmar') return null;
    for (final province in myanmarProvinces) {
      if (province.name != provinceName) continue;
      for (final district in province.districts) {
        if (district.name != districtName) continue;
        for (final township in district.townships) {
          if (township.name == townshipName) return township;
        }
      }
    }
    return null;
  }

  static List<String> wardsFor(
    String country,
    String provinceName,
    String districtName,
    String townshipName,
  ) {
    final township =
        findTownship(country, provinceName, districtName, townshipName);
    return township?.wardOptions ?? const ['Other'];
  }

  static String? postalCodeFor(
    String country,
    String provinceName,
    String districtName,
    String townshipName,
  ) {
    return findTownship(country, provinceName, districtName, townshipName)
        ?.postalCode;
  }

  static List<String> postalCodesFor(
    String country,
    String provinceName,
    String districtName,
    String townshipName,
  ) {
    final code =
        postalCodeFor(country, provinceName, districtName, townshipName);
    if (code == null || code.isEmpty) return const ['Other'];
    return [code];
  }
}
