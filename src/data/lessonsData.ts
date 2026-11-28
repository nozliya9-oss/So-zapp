import {
  CityBuilding,
  Language,
  LessonNode,
  PracticeSession,
  PracticeWord,
  SoundKey,
  SoundStat,
  UserProfile,
  WeekCurriculum,
  WeeklyAssessmentRecord,
} from '../types';

const DAY_NAMES = [
  '1-kun (Dushanba)',
  '2-kun (Seshanba)',
  '3-kun (Chorshanba)',
  '4-kun (Payshanba)',
  '5-kun (Juma)',
  '6-kun (Shanba)',
  '7-kun (Yakshanba)',
];

const WEEK_THEMES_UZ = [
  {
    weekNumber: 1,
    title: '1-hafta: Asosiy tovushlarni uyg‘otamiz',
    subtitle: '6 kunlik tovush sikli (R, S, Sh, L, Ch, J/Z) va Yakshanba sinovi',
  },
  {
    weekNumber: 2,
    title: '2-hafta: Bo‘g‘inlarda ravon talaffuz',
    subtitle: 'O‘rta bo‘g‘inlarda aniq artikulyatsiya va nafas nazorati',
  },
  {
    weekNumber: 3,
    title: '3-hafta: Murakkab so‘zlar va qo‘sh undoshlar',
    subtitle: 'Qo‘shma so‘zlarda til va lab harakatini tezlashtirish',
  },
  {
    weekNumber: 4,
    title: '4-hafta: Ikki tilli (O‘zbek / Rus) muvozanat',
    subtitle: 'O‘zbekcha va ruscha tovushlarning nozik farqlarini mustahkamlash',
  },
  {
    weekNumber: 5,
    title: '5-hafta: Ravon nutq va chempionlik darajasi',
    subtitle: 'Ifodali so‘zlash, tez aytishlar va yakuniy haftalik baholash',
  },
];

interface WordSeed {
  word: string;
  syllables: string;
  exampleUsage: string;
  tipUz: string;
  meaningUz?: string;
}

const UZ_WORD_BANK: Record<SoundKey, WordSeed[][]> = {
  R: [
    // Week 1
    [
      { word: 'Arra', syllables: 'AR - RA', exampleUsage: 'O‘tkir arra yog‘ochni kesdi.', tipUz: 'Til uchini yuqori tishlar orqasiga tekkizib, yengil titrating.' },
      { word: 'Daraxt', syllables: 'DA - RAXT', exampleUsage: 'Hovlida baland daraxt o‘sdi.', tipUz: 'O‘rtadagi "R" tovushini shoshilmasdan, aniq chiqaring.' },
      { word: 'Baraban', syllables: 'BA - RA - BAN', exampleUsage: 'Azizjon baraban chaldi.', tipUz: 'Har bir bo‘g‘inni bir maromda, jarangdor ayting.' },
      { word: 'Rasm', syllables: 'RASM', exampleUsage: 'Men chiroyli rasm chizdim.', tipUz: 'So‘z boshidagi "R" ni dadil boshlang.' },
      { word: 'Bahor', syllables: 'BA - HOR', exampleUsage: 'Bahor kelib gullar ochildi.', tipUz: 'Oxirgi "R" tovushini yutib yubormang.' },
      { word: 'Anor', syllables: 'A - NOR', exampleUsage: 'Bog‘da shirin anor pishdi.', tipUz: 'Lablarni bo‘sh qo‘yib, "nor" bo‘g‘inini tiniq ayting.' },
      { word: 'Qor', syllables: 'QOR', exampleUsage: 'Qishda oppoq qor yog‘di.', tipUz: 'Qisqa so‘z oxirida til uchini bir marta yengil tebrating.' },
      { word: 'Daryo', syllables: 'DAR - YO', exampleUsage: 'Tog‘dan tiniq daryo oqadi.', tipUz: '"Dar" bo‘g‘inini aniq ajratib talaffuz qiling.' },
      { word: 'Ruchka', syllables: 'RUCH - KA', exampleUsage: 'Ko‘k ruchka stol ustida.', tipUz: 'So‘z boshida havoni til uchi orqali yo‘naltiring.' },
      { word: 'Tarvuz', syllables: 'TAR - VUZ', exampleUsage: 'Yozda shirin tarvuz yedik.', tipUz: '"Tar" bo‘g‘inidagi "r" ni tiniq eshittiring.' },
    ],
    // Week 2
    [
      { word: 'Traktor', syllables: 'TRAK - TOR', exampleUsage: 'Dalada katta traktor yurdi.', tipUz: '"Tr" birikmasida tilni oldindan tayyorlang.' },
      { word: 'Sirk', syllables: 'SIRK', exampleUsage: 'Dam olish kuni sirkka bordik.', tipUz: '"Sir" bo‘g‘inida "r" ni qisqa va aniq ayting.' },
      { word: 'Giloszor', syllables: 'GI - LOS - ZOR', exampleUsage: 'Qishloq chetida giloszor bor.', tipUz: 'Oxirgi "zor" bo‘g‘inida ovozni pasaytirmang.' },
      { word: 'Karvon', syllables: 'KAR - VON', exampleUsage: 'Cho‘ldan uzun karvon o‘tdi.', tipUz: '"Kar" bo‘g‘inini jarangdor chiqaring.' },
      { word: 'Mard', syllables: 'MARD', exampleUsage: 'Mard bola do‘stiga yordam beradi.', tipUz: 'Undoshlar orasida "r" tovushi aniq eshitilsin.' },
      { word: 'Sharbat', syllables: 'SHAR - BAT', exampleUsage: 'Olma sharbati juda mazali.', tipUz: '"Sha" dan keyin til uchini darhol ko‘taring.' },
      { word: 'Pardoz', syllables: 'PAR - DOZ', exampleUsage: 'Sahna uchun chiroyli pardoz qilindi.', tipUz: '"Par" bo‘g‘inida nafasni bir tekis chiqaring.' },
      { word: 'Zarur', syllables: 'ZA - RUR', exampleUsage: 'Har kuni mashq qilish zarur.', tipUz: 'Ikkala "r" tovushini ham bir xil aniqlikda ayting.' },
      { word: 'Bozor', syllables: 'BO - ZOR', exampleUsage: 'Onam bilan bozorga bordik.', tipUz: 'Unlidan keyingi "r" ni mayin yakunlang.' },
      { word: 'Xabar', syllables: 'XA - BAR', exampleUsage: 'Bugun xushxabar eshitdik.', tipUz: '"Bar" bo‘g‘inini dadil tugating.' },
    ],
    // Week 3
    [
      { word: 'Qaldirg‘och', syllables: 'QAL - DIR - G‘OCH', exampleUsage: 'Bahorda qaldirg‘och uchib keldi.', tipUz: 'O‘rtadagi "dir" bo‘g‘inini shoshilmay ayting.' },
      { word: 'Targ‘il', syllables: 'TAR - G‘IL', exampleUsage: 'Targ‘il mushukcha o‘ynamoqda.', tipUz: '"R" va "g‘" orasida nafasni uzmang.' },
      { word: 'Birodar', syllables: 'BI - RO - DAR', exampleUsage: 'Do‘stlar bir-biriga birodar.', tipUz: 'Har ikki "r" tovushini tiniq chiqaring.' },
      { word: 'Kenguru', syllables: 'KEN - GU - RU', exampleUsage: 'Kenguru baland sakraydi.', tipUz: 'Oxirgi "ru" bo‘g‘inida lablarni yumaloqlang.' },
      { word: 'Harorat', syllables: 'HA - RO - RAT', exampleUsage: 'Bugun havo harorati iliq.', tipUz: '"Ro" va "rat" bo‘g‘inlarini ohista bog‘lang.' },
      { word: 'Sarguzasht', syllables: 'SAR - GU - ZASHT', exampleUsage: 'Qiziq sarguzasht kitob o‘qidik.', tipUz: '"Sar" bo‘g‘inini kuchliroq boshlang.' },
      { word: 'Dasturxon', syllables: 'DAS - TUR - XON', exampleUsage: 'Bayram dasturxoni bezatildi.', tipUz: '"Tur" bo‘g‘inida til uchini yuqoriga ko‘taring.' },
      { word: 'Qahramon', syllables: 'QAH - RA - MON', exampleUsage: 'Ertak qahramoni g‘olib chiqdi.', tipUz: '"Ra" bo‘g‘inini cho‘zmasdan ravon ayting.' },
      { word: 'Tafakkur', syllables: 'TA - FAK - KUR', exampleUsage: 'Kitob o‘qish tafakkurni oshiradi.', tipUz: 'Oxirgi "r" ni yengil titratib yakunlang.' },
      { word: 'Marvarid', syllables: 'MAR - VA - RID', exampleUsage: 'Dengiz tubida marvarid bor.', tipUz: '"Mar" va "rid" bo‘g‘inlarini aniq ayting.' },
    ],
    // Week 4
    [
      { word: 'Raketa', syllables: 'RA - KE - TA', exampleUsage: 'Kosmik raketa osmonga uchdi.', tipUz: 'O‘zbekcha yumshoq "R" va ruscha "Р" farqini his qiling.' },
      { word: 'Robot', syllables: 'RO - BOT', exampleUsage: 'Aqlli robot yordam berdi.', tipUz: '"Ro" bo‘g‘inida labni oldinga cho‘zing.' },
      { word: 'Radiator', syllables: 'RA - DI - A - TOR', exampleUsage: 'Xonada radiator iliq turibdi.', tipUz: 'Boshi va oxiridagi "r" larni teng ayting.' },
      { word: 'Motor', syllables: 'MO - TOR', exampleUsage: 'Qayiq motori ishga tushdi.', tipUz: '"Tor" bo‘g‘inini tiniq yakunlang.' },
      { word: 'Portfel', syllables: 'PORT - FEL', exampleUsage: 'Maktab portfeli tayyor.', tipUz: '"Port" bo‘g‘inida "r" ni tushirib qoldirmang.' },
      { word: 'Kran', syllables: 'KRAN', exampleUsage: 'Qurilishda baland kran ishladi.', tipUz: '"Kr" tovush birikmasini bir nafasda ayting.' },
      { word: 'Monitor', syllables: 'MO - NI - TOR', exampleUsage: 'Monitor ekrani yorqin.', tipUz: 'Oxirgi bo‘g‘inga urg‘u bering.' },
      { word: 'Kartina', syllables: 'KAR - TI - NA', exampleUsage: 'Devorida chiroyli kartina osilgan.', tipUz: '"Kar" bo‘g‘inini qat’iy talaffuz qiling.' },
      { word: 'Orkestr', syllables: 'OR - KESTR', exampleUsage: 'Maktab orkestri kuy chaldi.', tipUz: 'Boshidagi va oxiridagi "r" ni tiniq ayting.' },
      { word: 'Kapitan', syllables: 'KA - PI - TAN', exampleUsage: 'Kema kapitani yo‘lni ko‘rsatdi.', tipUz: 'So‘zni bir maromda, shoshilmasdan ayting.' },
    ],
    // Week 5
    [
      { word: 'Erta bahor', syllables: 'ER - TA BA - HOR', exampleUsage: 'Erta bahorda qushlar sayraydi.', tipUz: 'Ikki so‘zdagi "r" larni bir tekis talaffuz qiling.' },
      { word: 'Shirin anor', syllables: 'SHI - RIN A - NOR', exampleUsage: 'Tovoqda shirin anor bor.', tipUz: '"Rin" va "nor" bo‘g‘inlarini ohangdor ayting.' },
      { word: 'Tezkor poyezd', syllables: 'TEZ - KOR PO - YEZD', exampleUsage: 'Tezkor poyezd manzilga yetdi.', tipUz: '"Kor" bo‘g‘inini dadil chiqaring.' },
      { word: 'Yashil barg', syllables: 'YA - SHIL BARG', exampleUsage: 'Shamol yashil bargni uchirdi.', tipUz: '"Barg" so‘zi oxirida "r" ni aniq eshittiring.' },
      { word: 'Ziyrak bola', syllables: 'ZIY - RAK BO - LA', exampleUsage: 'Ziyrak bola tez o‘rganadi.', tipUz: '"Rak" bo‘g‘inini tiniq talaffuz qiling.' },
      { word: 'Nurli tong', syllables: 'NUR - LI TONG', exampleUsage: 'Nurli tong otmoqda.', tipUz: '"Nur" bo‘g‘inida til uchini yengil titrating.' },
      { word: 'Sayyora', syllables: 'SAY - YO - RA', exampleUsage: 'Yer — chiroyli sayyora.', tipUz: 'Oxirgi "ra" bo‘g‘inini mayin ayting.' },
      { word: 'Matonatli', syllables: 'MA - TO - NAT - LI', exampleUsage: 'Matonatli o‘quvchi g‘olib bo‘ladi.', tipUz: 'Barcha bo‘g‘inlarni bir tekis o‘qing.' },
      { word: 'Farishtadek', syllables: 'FA - RISH - TA - DEK', exampleUsage: 'Uning ovozi farishtadek mayin.', tipUz: '"Rish" bo‘g‘inini aniq ajrating.' },
      { word: 'Barakalla', syllables: 'BA - RA - KAL - LA', exampleUsage: 'Barcha mashqqa barakalla!', tipUz: '"Ra" bo‘g‘inini quvnoq va ravon ayting.' },
    ],
  ],
  S: [
    // Week 1
    [
      { word: 'Soat', syllables: 'SO - AT', exampleUsage: 'Devordagi soat chiqillaydi.', tipUz: 'Tishlarni yaqinlashtirib, salqin havo oqimini chiqaring.' },
      { word: 'Sabzi', syllables: 'SAB - ZI', exampleUsage: 'Quyoncha sariq sabzi yedi.', tipUz: 'So‘z boshidagi "S" ni tiniq va mayin boshlang.' },
      { word: 'Osmon', syllables: 'OS - MON', exampleUsage: 'Bugun osmon moviy rangda.', tipUz: '"Os" bo‘g‘inida til uchini pastki tishlar orqasida tuting.' },
      { word: 'Suv', syllables: 'SUV', exampleUsage: 'Tog‘dan muzdek suv oqmoqda.', tipUz: '"S" va "u" ni silliq bog‘lang.' },
      { word: 'Asal', syllables: 'A - SAL', exampleUsage: 'Asalari guldan asal yig‘adi.', tipUz: 'O‘rtadagi "S" ni hushyor va toza chiqaring.' },
      { word: 'Stol', syllables: 'STOL', exampleUsage: 'Kitoblar stol ustida turibdi.', tipUz: '"St" birikmasida "s" ni cho‘zib yubormang.' },
      { word: 'Savat', syllables: 'SA - VAT', exampleUsage: 'Savat ichida mevalar bor.', tipUz: '"Sa" bo‘g‘inini yengil havo oqimi bilan ayting.' },
      { word: 'Issiq', syllables: 'IS - SIQ', exampleUsage: 'Quyoshli kun juda issiq.', tipUz: 'Qo‘sh "s" ni bir tekis davom ettiring.' },
      { word: 'Musiqa', syllables: 'MU - SI - QA', exampleUsage: 'Yoqimli musiqa yangramoqda.', tipUz: '"Si" bo‘g‘inini tabassum bilan ayting.' },
      { word: 'Tovus', syllables: 'TO - VUS', exampleUsage: 'Tovus chiroyli patlarini yoydi.', tipUz: 'Oxirgi "s" ni tiniq tugating.' },
    ],
    // Week 2
    [
      { word: 'Samolyot', syllables: 'SA - MOL - YOT', exampleUsage: 'Oq samolyot bulutlar orasida.', tipUz: '"Sa" bo‘g‘inini ochiq va aniq ayting.' },
      { word: 'Soyabon', syllables: 'SO - YA - BON', exampleUsage: 'Yomg‘irda soyabon ochdik.', tipUz: '"So" bo‘g‘inida lablarni yumaloqlang.' },
      { word: 'Sandiq', syllables: 'SAN - DIQ', exampleUsage: 'Buvimning naqshli sandig‘i bor.', tipUz: '"San" bo‘g‘inini tiniq boshlang.' },
      { word: 'Kaktus', syllables: 'KAK - TUS', exampleUsage: 'Derazada kichik kaktus o‘sadi.', tipUz: 'Oxiridagi "s" tovushini yutib yubormang.' },
      { word: 'Darslik', syllables: 'DARS - LIK', exampleUsage: 'Yangi darslik juda qiziqarli.', tipUz: '"R" dan keyin "s" ni aniq eshittiring.' },
      { word: 'Fasl', syllables: 'FASL', exampleUsage: 'Bahor — eng go‘zal fasl.', tipUz: '"S" va "l" orasida tovushni uzmang.' },
      { word: 'Qasos', syllables: 'QA - SOS', exampleUsage: 'Ertakda yaxshilik g‘olib bo‘ldi.', tipUz: 'Ikkala "s" ni ham toza talaffuz qiling.' },
      { word: 'Nafas', syllables: 'NA - FAS', exampleUsage: 'Chuqur nafas olib chiqaring.', tipUz: '"Fas" bo‘g‘inini yengil havo bilan tugating.' },
      { word: 'Sichqon', syllables: 'SICH - QON', exampleUsage: 'Kichik sichqoncha don topdi.', tipUz: '"S" va "ch" tovushlarini aralashtirmang.' },
      { word: 'Saroy', syllables: 'SA - ROY', exampleUsage: 'Ertakdagi billur saroy yaltiraydi.', tipUz: '"Sa" bo‘g‘inini mayin chiqaring.' },
    ],
    // Week 3-5 varied sets
    [
      { word: 'Sayyoh', syllables: 'SAY - YOH', exampleUsage: 'Sayyohlar tog‘larga chiqishdi.', tipUz: 'So‘z boshidagi "S" ni jaranglamasdan, sof ayting.' },
      { word: 'Sinfdosh', syllables: 'SINF - DOSH', exampleUsage: 'Sinfdoshim bilan birga o‘qiymiz.', tipUz: '"Si" bo‘g‘inini aniq talaffuz qiling.' },
      { word: 'Moslama', syllables: 'MOS - LA - MA', exampleUsage: 'Bu foydali moslama.', tipUz: '"Mos" bo‘g‘inini shoshilmasdan ayting.' },
      { word: 'Mustahkam', syllables: 'MUS - TAH - KAM', exampleUsage: 'Mustahkam ko‘prik qurildi.', tipUz: '"Mus" bo‘g‘inida lablarni oldinga cho‘zmang.' },
      { word: 'Samarali', syllables: 'SA - MA - RA - LI', exampleUsage: 'Bugungi mashq samarali bo‘ldi.', tipUz: 'Barcha bo‘g‘inlarni bir ritmda ayting.' },
      { word: 'Teleskop', syllables: 'TE - LES - KOP', exampleUsage: 'Teleskop orqali yulduzlarni ko‘rdik.', tipUz: '"Les" bo‘g‘inini tiniq chiqaring.' },
      { word: 'Kosmos', syllables: 'KOS - MOS', exampleUsage: 'Kosmosda millionlab yulduz bor.', tipUz: 'Ikkala "s" ni ham ravon ayting.' },
      { word: 'Sirkul', syllables: 'SIR - KUL', exampleUsage: 'Sirkul bilan doira chizdik.', tipUz: '"Sir" bo‘g‘inini aniq ayting.' },
      { word: 'Asosiy', syllables: 'A - SO - SIY', exampleUsage: 'Asosiy qoidani eslab qoldik.', tipUz: 'O‘rtadagi ikki "s" ni yumshoq bog‘lang.' },
      { word: 'Tasvir', syllables: 'TAS - VIR', exampleUsage: 'Ekranda chiroyli tasvir paydo bo‘ldi.', tipUz: '"Tas" bo‘g‘inini toza yakunlang.' },
    ],
    [
      { word: 'Svetofor', syllables: 'SVE - TO - FOR', exampleUsage: 'Yashil svetofor yondi.', tipUz: '"Sv" birikmasida lablarni tez almashtiring.' },
      { word: 'Stadion', syllables: 'STA - DI - ON', exampleUsage: 'Bolalar stadionda yugurishdi.', tipUz: '"Sta" bo‘g‘inini qisqa boshlang.' },
      { word: 'Skripka', syllables: 'SKRIP - KA', exampleUsage: 'Skripka mayin kuy chaldi.', tipUz: '"Sk" tovushini yengil havo bilan ayting.' },
      { word: 'Avtobus', syllables: 'AV - TO - BUS', exampleUsage: 'Sariq avtobus bekatga keldi.', tipUz: 'Oxirgi "s" tovushini tiniq eshittiring.' },
      { word: 'Kompas', syllables: 'KOM - PAS', exampleUsage: 'Kompas shimolni ko‘rsatadi.', tipUz: '"Pas" bo‘g‘inini aniq tugating.' },
      { word: 'Termos', syllables: 'TER - MOS', exampleUsage: 'Termosda issiq choy bor.', tipUz: 'Oxirida salqin havo oqimini chiqaring.' },
      { word: 'Krossovka', syllables: 'KROS - SOV - KA', exampleUsage: 'Yangi krossovka juda qulay.', tipUz: 'Qo‘sh "s" ni tiniq ajrating.' },
      { word: 'Signal', syllables: 'SIG - NAL', exampleUsage: 'Poyezd baland signal berdi.', tipUz: '"Si" bo‘g‘inini mayin ayting.' },
      { word: 'Sektor', syllables: 'SEK - TOR', exampleUsage: 'Har bir sektor tekshirildi.', tipUz: '"Sek" bo‘g‘inini tiniq chiqaring.' },
      { word: 'Globus', syllables: 'GLO - BUS', exampleUsage: 'Globus Yer sharini ko‘rsatadi.', tipUz: 'So‘z oxirini aniq tugating.' },
    ],
    [
      { word: 'Sof osmon', syllables: 'SOF OS - MON', exampleUsage: 'Sof osmon ostida sayr qildik.', tipUz: 'Ikki "s" tovushini ham toza ayting.' },
      { word: 'Sokin daryo', syllables: 'SO - KIN DAR - YO', exampleUsage: 'Sokin daryo asta oqadi.', tipUz: '"So" bo‘g‘inini mayin boshlang.' },
      { word: 'Salqin shamol', syllables: 'SAL - QIN SHA - MOL', exampleUsage: 'Salqin shamol esmoqda.', tipUz: '"S" va "Sh" tovushlarini aniq farqlang.' },
      { word: 'Sariq olma', syllables: 'SA - RIQ OL - MA', exampleUsage: 'Savatda sariq olma bor.', tipUz: '"Sa" bo‘g‘inini ochiq talaffuz qiling.' },
      { word: 'Sadoqatli do‘st', syllables: 'SA - DO - QAT - LI', exampleUsage: 'Sadoqatli do‘st doim yoningda.', tipUz: 'Har bir bo‘g‘inni ravon o‘qing.' },
      { word: 'Saxiy quyosh', syllables: 'SA - XIY QU - YOSH', exampleUsage: 'Saxiy quyosh nur sochdi.', tipUz: '"S" va "Sh" almashinuvini nazorat qiling.' },
      { word: 'Sersoya bog‘', syllables: 'SER - SO - YA BOG‘', exampleUsage: 'Sersoya bog‘da dam oldik.', tipUz: 'Ikkala "s" ni ham yengil chiqaring.' },
      { word: 'Silliq tosh', syllables: 'SIL - LIQ TOSH', exampleUsage: 'Daryo bo‘yida silliq tosh topdik.', tipUz: '"Si" bo‘g‘inini hushyor boshlang.' },
      { word: 'Samarqand', syllables: 'SA - MAR - QAND', exampleUsage: 'Samarqand — qadimiy shahar.', tipUz: '"Sa" va "mar" bo‘g‘inlarini aniq ayting.' },
      { word: 'Tabassum', syllables: 'TA - BAS - SUM', exampleUsage: 'Yuzingda doim tabassum bo‘lsin.', tipUz: 'Qo‘sh "s" ni yumshoq va aniq ayting.' },
    ],
  ],
  Sh: [
    // Week 1
    [
      { word: 'Quyosh', syllables: 'QU - YOSH', exampleUsage: 'Ertalab iliq quyosh chiqdi.', tipUz: 'Lablarni oldinga biroz cho‘zib, "Sh" tovushini mayin ayting.' },
      { word: 'Mashina', syllables: 'MA - SHI - NA', exampleUsage: 'Ko‘chada ko‘k mashina ketdi.', tipUz: '"Shi" bo‘g‘inida tilni yuqoriga ko‘taring.' },
      { word: 'Shamol', syllables: 'SHA - MOL', exampleUsage: 'Daraxt barglarini shamol tebratdi.', tipUz: 'Xuddi shamol esgandek davomli "Sh" chiqaring.' },
      { word: 'Pishloq', syllables: 'PISH - LOQ', exampleUsage: 'Nonushtaga yangi pishloq qo‘yildi.', tipUz: '"Pish" bo‘g‘inini aniq talaffuz qiling.' },
      { word: 'Shapka', syllables: 'SHAP - KA', exampleUsage: 'Qishda issiq shapka kiydik.', tipUz: 'So‘z boshidagi "Sh" ni lablar bilan shakllantiring.' },
      { word: 'Qush', syllables: 'QUSH', exampleUsage: 'Shoxda kichik qush sayraydi.', tipUz: 'Oxirgi "sh" tovushini "s" ga almashtirmang.' },
      { word: 'Shahar', syllables: 'SHA - HAR', exampleUsage: 'Bizning shahar juda ozoda.', tipUz: 'Til o‘rtasini ko‘tarib, yumshoq "Sha" ayting.' },
      { word: 'Oshqozon', syllables: 'OSH - QO - ZON', exampleUsage: 'Sog‘lom ovqat foydali.', tipUz: '"Osh" bo‘g‘inini tiniq eshittiring.' },
      { word: 'Mushuk', syllables: 'MU - SHUK', exampleUsage: 'Oq mushukcha sut ichdi.', tipUz: '"Shuk" bo‘g‘inida lablarni yumaloqlang.' },
      { word: 'Tosh', syllables: 'TOSH', exampleUsage: 'Tog‘ yo‘lida katta tosh bor.', tipUz: 'Oxiridagi "sh" ni aniq tugating.' },
    ],
    // Week 2
    [
      { word: 'Shokolad', syllables: 'SHO - KO - LAD', exampleUsage: 'Shirin shokolad sovg‘a qilindi.', tipUz: '"Sho" bo‘g‘inini iliq havo oqimi bilan ayting.' },
      { word: 'Boshliq', syllables: 'BOSH - LIQ', exampleUsage: 'Jamoa boshlig‘i rejani tuzdi.', tipUz: '"Bosh" bo‘g‘inini aniq ajrating.' },
      { word: 'Qoshiq', syllables: 'QO - SHIQ', exampleUsage: 'Stolga kumush qoshiq qo‘yildi.', tipUz: 'O‘rtadagi "sh" ni mayin chiqaring.' },
      { word: 'Shifokor', syllables: 'SHI - FO - KOR', exampleUsage: 'Shifokor bolalarni tekshirdi.', tipUz: '"Shi" bo‘g‘inini tiniq boshlang.' },
      { word: 'Tish', syllables: 'TISH', exampleUsage: 'Har kuni tish tozalaymiz.', tipUz: 'Oxirida "sh" tovushi toza eshitilsin.' },
      { word: 'Shohona', syllables: 'SHO - HO - NA', exampleUsage: 'Bayramona shohona bezak qilindi.', tipUz: '"Sho" bo‘g‘inini ravon ayting.' },
      { word: 'Ishonch', syllables: 'I - SHONCH', exampleUsage: 'O‘zingga ishonch bilan gapir.', tipUz: '"Shon" bo‘g‘inini dadil chiqaring.' },
      { word: 'Shirmoy', syllables: 'SHIR - MOY', exampleUsage: 'Issiq shirmoy non yopildi.', tipUz: '"Sh" dan "r" ga silliq o‘ting.' },
      { word: 'Yashil', syllables: 'YA - SHIL', exampleUsage: 'Bahorda o‘tlar yashil bo‘ladi.', tipUz: '"Shil" bo‘g‘inini yumshoq ayting.' },
      { word: 'Kishmish', syllables: 'KISH - MISH', exampleUsage: 'Likopchada shirin kishmish bor.', tipUz: 'Ikkala "sh" tovushini ham aniq chiqaring.' },
    ],
    // Week 3-5
    [
      { word: 'Shoshilinch', syllables: 'SHO - SHI - LINCH', exampleUsage: 'Shoshilinch xat yetib keldi.', tipUz: 'Ketma-ket kelgan "sho" va "shi" ni tiniq ayting.' },
      { word: 'Shabnam', syllables: 'SHAB - NAM', exampleUsage: 'Tongda barglarda shabnam yaltiraydi.', tipUz: '"Shab" bo‘g‘inini yumshoq boshlang.' },
      { word: 'Qo‘shiqchi', syllables: 'QO‘ - SHIQ - CHI', exampleUsage: 'Yosh qo‘shiqchi sahnaga chiqdi.', tipUz: '"Shiq" va "chi" bo‘g‘inlarini aniq ajrating.' },
      { word: 'Tashakkur', syllables: 'TA - SHAK - KUR', exampleUsage: 'Yordamingiz uchun tashakkur!', tipUz: '"Shak" bo‘g‘inini ravon chiqaring.' },
      { word: 'Shoshqaloq', syllables: 'SHOSH - QA - LOQ', exampleUsage: 'Shoshqaloq quyoncha uxlab qoldi.', tipUz: '"Shosh" bo‘g‘inida ikki "sh" ni ham toza ayting.' },
      { word: 'Shirinlik', syllables: 'SHI - RIN - LIK', exampleUsage: 'Onam mazali shirinlik pishirdi.', tipUz: '"Shi" va "rin" bo‘g‘inlarini bog‘lang.' },
      { word: 'Pashsha', syllables: 'PASH - SHA', exampleUsage: 'Oynadan kichik pashsha uchdi.', tipUz: 'Qo‘sh "sh" ni davomli chiqaring.' },
      { word: 'Shumtaka', syllables: 'SHUM - TA - KA', exampleUsage: 'Shumtaka bola kulib yubordi.', tipUz: '"Shum" bo‘g‘inida lablarni oldinga tuting.' },
      { word: 'Beshik', syllables: 'BE - SHIK', exampleUsage: 'Chaqaloq beshikda uxladi.', tipUz: '"Shik" bo‘g‘inini mayin ayting.' },
      { word: 'Qishloq', syllables: 'QISH - LOQ', exampleUsage: 'Buvimning qishlog‘i juda so‘lim.', tipUz: '"Qish" bo‘g‘inini tiniq eshittiring.' },
    ],
    [
      { word: 'Shaxmat', syllables: 'SHAX - MAT', exampleUsage: 'Biz do‘stim bilan shaxmat o‘ynadik.', tipUz: 'So‘z boshidagi "Sh" ni dadil boshlang.' },
      { word: 'Sharq', syllables: 'SHARQ', exampleUsage: 'Quyosh sharqdan chiqadi.', tipUz: '"Sh" va "r" tovushlarini bir tekis ayting.' },
      { word: 'Shlyapa', syllables: 'SHLYA - PA', exampleUsage: 'Sayohatga keng shlyapa oldik.', tipUz: '"Shl" birikmasida tilni tez harakatlantiring.' },
      { word: 'Shoshma', syllables: 'SHOSH - MA', exampleUsage: 'Talaffuzda hech qachon shoshma.', tipUz: '"Shosh" bo‘g‘inini aniq talaffuz qiling.' },
      { word: 'Shifoner', syllables: 'SHI - FO - NER', exampleUsage: 'Kiyimlar shifonerga taxlandi.', tipUz: '"Shi" bo‘g‘inini yumshoq ayting.' },
      { word: 'Shlagbaum', syllables: 'SHLAG - BA - UM', exampleUsage: 'Temir yo‘lda shlagbaum tushdi.', tipUz: '"Shl" tovushini qisqa boshlang.' },
      { word: 'Shoyi', syllables: 'SHO - YI', exampleUsage: 'Kamalakdek shoyi mato to‘qildi.', tipUz: '"Sho" bo‘g‘inini cho‘zib mayin ayting.' },
      { word: 'Sharshara', syllables: 'SHAR - SHA - RA', exampleUsage: 'Tog‘dan baland sharshara tushadi.', tipUz: '"Shar" va "sha" bo‘g‘inlarini aniq ayting.' },
      { word: 'Shunchaki', syllables: 'SHUN - CHA - KI', exampleUsage: 'Shunchaki tabassum qilib qo‘y.', tipUz: '"Shun" va "cha" farqini saqlang.' },
      { word: 'Shohsupa', syllables: 'SHOH - SU - PA', exampleUsage: 'G‘oliblar shohsupaga chiqdi.', tipUz: '"Sh" va "s" ketma-ketligini toza ayting.' },
    ],
    [
      { word: 'Shirin tush', syllables: 'SHI - RIN TUSH', exampleUsage: 'Kichkintoy shirin tush ko‘rdi.', tipUz: 'Boshi va oxiridagi "sh" larni tiniq chiqaring.' },
      { word: 'Shamol esdi', syllables: 'SHA - MOL ES - DI', exampleUsage: 'Bog‘da mayin shamol esdi.', tipUz: '"Sha" bo‘g‘inini yengil havo bilan boshlang.' },
      { word: 'Quyosh nuri', syllables: 'QU - YOSH NU - RI', exampleUsage: 'Quyosh nuri xonani yoritdi.', tipUz: '"Yosh" va "nuri" ni ravon bog‘lang.' },
      { word: 'Yashil o‘rmon', syllables: 'YA - SHIL O‘R - MON', exampleUsage: 'Yashil o‘rmon havosi toza.', tipUz: '"Shil" bo‘g‘inini aniq talaffuz qiling.' },
      { word: 'Shodlik kuni', syllables: 'SHOD - LIK KU - NI', exampleUsage: 'Bugun haqiqiy shodlik kuni.', tipUz: '"Shod" bo‘g‘inini quvnoq ayting.' },
      { word: 'Shoshilmay o‘qi', syllables: 'SHO - SHIL - MAY', exampleUsage: 'Har bir so‘zni shoshilmay o‘qi.', tipUz: 'Ikkala "sh" ni ham bir xil mayinlikda ayting.' },
      { word: 'Besh yulduz', syllables: 'BESH YUL - DUZ', exampleUsage: 'Kiki senga besh yulduz berdi.', tipUz: '"Besh" so‘zi oxirini tiniq tugating.' },
      { word: 'Shuxratli yurt', syllables: 'SHUH - RAT - LI', exampleUsage: 'Bizning diyor shuhratli yurt.', tipUz: '"Shuh" bo‘g‘inini dadil chiqaring.' },
      { word: 'Shafoatli qo‘l', syllables: 'SHA - FO - AT - LI', exampleUsage: 'Mehribon qo‘llar yordamga shay.', tipUz: '"Sha" bo‘g‘inini ochiq ayting.' },
      { word: 'Sharqona naqsh', syllables: 'SHAR - QO - NA NAQSH', exampleUsage: 'Gilamda sharqona naqsh bor.', tipUz: 'Oxiridagi "qsh" tovushini aniq yakunlang.' },
    ],
  ],
  L: [
    // Week 1
    [
      { word: 'Lola', syllables: 'LO - LA', exampleUsage: 'Bahorda qizil lola ochildi.', tipUz: 'Til uchini yuqori old tishlarga yumshoq bosing.' },
      { word: 'Qalam', syllables: 'QA - LAM', exampleUsage: 'Rangli qalam bilan chizdik.', tipUz: '"Qa" va "lam" bo‘g‘inlarini silliq bog‘lang.' },
      { word: 'Olma', syllables: 'OL - MA', exampleUsage: 'Shirin olma daraxtdan tushdi.', tipUz: '"Ol" bo‘g‘inida til uchini bir lahza tuting.' },
      { word: 'Bulut', syllables: 'BU - LUT', exampleUsage: 'Osmonda oppoq bulut suzadi.', tipUz: 'Yengil nafas bilan "Bu-lut" deb ayting.' },
      { word: 'Limon', syllables: 'LI - MON', exampleUsage: 'Choyga bir bo‘lak limon soldik.', tipUz: '"Li" bo‘g‘inini mayin va tiniq boshlang.' },
      { word: 'Balon', syllables: 'BA - LON', exampleUsage: 'Rangli havo baloni uchdi.', tipUz: '"Lon" bo‘g‘inini jarangdor ayting.' },
      { word: 'Gul', syllables: 'GUL', exampleUsage: 'Derazada chiroyli gul o‘sadi.', tipUz: 'Oxiridagi "l" tovushini yumshoq yakunlang.' },
      { word: 'Bola', syllables: 'BO - LA', exampleUsage: 'Quvnoq bola qo‘shiq aytdi.', tipUz: '"La" bo‘g‘inini ochiq talaffuz qiling.' },
      { word: 'Olov', syllables: 'O - LOV', exampleUsage: 'Gulxanda yorqin olov yondi.', tipUz: '"Lov" bo‘g‘inini ohangdor chiqaring.' },
      { word: 'Tilla', syllables: 'TIL - LA', exampleUsage: 'Tilla kuz daraxtlarni bezadi.', tipUz: 'Qo‘sh "l" ni tiniq va ravon ayting.' },
    ],
    // Week 2
    [
      { word: 'Lochin', syllables: 'LO - CHIN', exampleUsage: 'Tog‘ tepasida lochin uchadi.', tipUz: '"Lo" bo‘g‘inida til uchini tishlarga tirang.' },
      { word: 'Halol', syllables: 'HA - LOL', exampleUsage: 'Halol mehnat baxt keltiradi.', tipUz: 'Ikkala "l" tovushini ham aniq eshittiring.' },
      { word: 'Kulgi', syllables: 'KUL - GI', exampleUsage: 'Bolalar kulgisi yangradi.', tipUz: '"Kul" bo‘g‘inini yumshoq tugating.' },
      { word: 'Baland', syllables: 'BA - LAND', exampleUsage: 'Baland tog‘lar qorga burkandi.', tipUz: '"Land" bo‘g‘inida "l" ni aniq ayting.' },
      { word: 'Laylak', syllables: 'LAY - LAK', exampleUsage: 'Bostirma ustida laylak in qurdi.', tipUz: 'Ikki "l" tovushini ham tiniq chiqaring.' },
      { word: 'Chiroyli', syllables: 'CHI - ROY - LI', exampleUsage: 'Bu rasm juda chiroyli chiqdi.', tipUz: 'Oxirgi "li" bo‘g‘inini yengil ayting.' },
      { word: 'Kalit', syllables: 'KA - LIT', exampleUsage: 'Oltin kalit eshikni ochdi.', tipUz: '"Lit" bo‘g‘inini shoshilmay talaffuz qiling.' },
      { word: 'Palov', syllables: 'PA - LOV', exampleUsage: 'Bayramda mazali palov damlandi.', tipUz: '"Lov" bo‘g‘inini ravon ayting.' },
      { word: 'Salom', syllables: 'SA - LOM', exampleUsage: 'Hammaga quvnoq salom!', tipUz: '"Lom" bo‘g‘inini ohangdor chiqaring.' },
      { word: 'Kamalak', syllables: 'KA - MA - LAK', exampleUsage: 'Yomg‘irdan so‘ng kamalak chiqdi.', tipUz: '"Lak" bo‘g‘inini tiniq yakunlang.' },
    ],
    // Week 3-5
    [
      { word: 'Lolazor', syllables: 'LO - LA - ZOR', exampleUsage: 'Adirda qizil lolazor yastanib yotibdi.', tipUz: 'Boshidagi ikki "l" ni mayin bog‘lang.' },
      { word: 'Lazzatli', syllables: 'LAZ - ZAT - LI', exampleUsage: 'Bu taom juda lazzatli.', tipUz: '"Laz" va "li" bo‘g‘inlarini aniq ayting.' },
      { word: 'Bilimdon', syllables: 'BI - LIM - DON', exampleUsage: 'Bilimdon o‘quvchi hamma savolga javob berdi.', tipUz: '"Lim" bo‘g‘inida til uchini ko‘taring.' },
      { word: 'Muloyim', syllables: 'MU - LO - YIM', exampleUsage: 'Muloyim so‘z ko‘ngilni ko‘taradi.', tipUz: '"Lo" bo‘g‘inini qo‘shiqdek mayin ayting.' },
      { word: 'Shalola', syllables: 'SHA - LO - LA', exampleUsage: 'Shalola suvi salqin va tiniq.', tipUz: '"Lo-la" qismini bir tekis talaffuz qiling.' },
      { word: 'Yalpiz', syllables: 'YAL - PIZ', exampleUsage: 'Ariq bo‘yida xushbo‘y yalpiz o‘sadi.', tipUz: '"Yal" bo‘g‘inini tiniq ayting.' },
      { word: 'Nilufar', syllables: 'NI - LU - FAR', exampleUsage: 'Ko‘lda oq nilufar ochildi.', tipUz: '"Lu" bo‘g‘inini yumshoq chiqaring.' },
      { word: 'Xaloskor', syllables: 'XA - LOS - KOR', exampleUsage: 'Qahramon do‘stlariga xaloskor bo‘ldi.', tipUz: '"Los" bo‘g‘inini aniq ayting.' },
      { word: 'Kelejak', syllables: 'KE - LA - JAK', exampleUsage: 'Bizni yorqin kelajak kutmoqda.', tipUz: '"La" bo‘g‘inini ravon talaffuz qiling.' },
      { word: 'Sulton', syllables: 'SUL - TON', exampleUsage: 'Ertakdagi dono sulton adolatli edi.', tipUz: '"Sul" bo‘g‘inini tiniq ayting.' },
    ],
    [
      { word: 'Lampochka', syllables: 'LAM - POCH - KA', exampleUsage: 'Xonada yorug‘ lampochka yondi.', tipUz: '"Lam" bo‘g‘inini aniq boshlang.' },
      { word: 'Albom', syllables: 'AL - BOM', exampleUsage: 'Rasm albomi rang-barang.', tipUz: '"Al" bo‘g‘inida til uchini tishlarga bosing.' },
      { word: 'Planetariy', syllables: 'PLA - NE - TA - RIY', exampleUsage: 'Planetariyda sayyoralarni ko‘rdik.', tipUz: '"Pl" birikmasini silliq ayting.' },
      { word: 'Flomaster', syllables: 'FLO - MAS - TER', exampleUsage: 'Flomaster bilan chiroyli yozdik.', tipUz: '"Flo" bo‘g‘inini yengil chiqaring.' },
      { word: 'Atlas', syllables: 'AT - LAS', exampleUsage: 'Marg‘ilon atlasi jilvalanadi.', tipUz: '"Las" bo‘g‘inini tiniq tugating.' },
      { word: 'Klub', syllables: 'KLUB', exampleUsage: 'Shaxmat klubiga a’zo bo‘ldik.', tipUz: '"Kl" birikmasini bir nafasda ayting.' },
      { word: 'Balet', syllables: 'BA - LET', exampleUsage: 'Teatrda chiroyli balet ko‘rdik.', tipUz: '"Let" bo‘g‘inini yumshoq ayting.' },
      { word: 'Katalog', syllables: 'KA - TA - LOG', exampleUsage: 'Kutubxona katalogi tartibli.', tipUz: '"Log" bo‘g‘inini ravon talaffuz qiling.' },
      { word: 'Biolog', syllables: 'BI - O - LOG', exampleUsage: 'Biolog o‘simliklarni o‘rganadi.', tipUz: 'Oxirgi bo‘g‘indagi "l" ni aniq ayting.' },
      { word: 'Medal', syllables: 'ME - DAL', exampleUsage: 'Turnir g‘olibi medal oldi.', tipUz: 'So‘z oxirini mayin va toza tugating.' },
    ],
    [
      { word: 'Lola gulladi', syllables: 'LO - LA GUL - LA - DI', exampleUsage: 'Bog‘da qizil lola gulladi.', tipUz: 'Barcha "l" tovushlarini bir tekis mayin ayting.' },
      { word: 'Olma shirin', syllables: 'OL - MA SHI - RIN', exampleUsage: 'Bog‘dagi qizil olma shirin.', tipUz: '"Ol" bo‘g‘inini tiniq chiqaring.' },
      { word: 'Baland parvoz', syllables: 'BA - LAND PAR - VOZ', exampleUsage: 'Burgut baland parvoz qildi.', tipUz: '"Land" bo‘g‘inini aniq talaffuz qiling.' },
      { word: 'Muloyim ovoz', syllables: 'MU - LO - YIM', exampleUsage: 'Kikining muloyim ovozi yoqimli.', tipUz: '"Lo" bo‘g‘inini ohangdor ayting.' },
      { word: 'Yorqin yulduz', syllables: 'YOR - QIN YUL - DUZ', exampleUsage: 'Kechasi yorqin yulduz porladi.', tipUz: '"Yul" bo‘g‘inini dadil chiqaring.' },
      { word: 'Halol g‘alaba', syllables: 'HA - LOL G‘A - LA - BA', exampleUsage: 'Halol g‘alaba quvonch beradi.', tipUz: '"Lol" va "la" bo‘g‘inlarini tiniq ayting.' },
      { word: 'Tilla yaproq', syllables: 'TIL - LA YAP - ROQ', exampleUsage: 'Kuzda tilla yaproq to‘kiladi.', tipUz: 'Qo‘sh "l" ni yengil bog‘lang.' },
      { word: 'Bulutli osmon', syllables: 'BU - LUT - LI', exampleUsage: 'Bugun havo biroz bulutli.', tipUz: '"Lut" va "li" ni shoshilmay ayting.' },
      { word: 'Ilmli avlod', syllables: 'ILM - LI AV - LOD', exampleUsage: 'Ilmli avlod yurt kelajagi.', tipUz: '"Ilm" va "li" ni aniq ajrating.' },
      { word: 'Baxtli bolalik', syllables: 'BAXT - LI BO - LA - LIK', exampleUsage: 'Baxtli bolalik eng go‘zal davr.', tipUz: 'So‘zdagi barcha "l" larni toza ayting.' },
    ],
  ],
  Ch: [
    // Week 1
    [
      { word: 'Choy', syllables: 'CHOY', exampleUsage: 'Issiq ko‘k choy damlandi.', tipUz: 'Til uchini yuqori tanglayga bosib, keskin oching.' },
      { word: 'Olcha', syllables: 'OL - CHA', exampleUsage: 'Bog‘da qizil olcha pishdi.', tipUz: '"Cha" bo‘g‘inini tiniq va qisqa chiqaring.' },
      { word: 'Chumoli', syllables: 'CHU - MO - LI', exampleUsage: 'Mehnatkash chumoli don tashidi.', tipUz: '"Chu" bo‘g‘inida lablarni oldinga cho‘zing.' },
      { word: 'Kechikma', syllables: 'KE - CHIK - MA', exampleUsage: 'Darsga hech qachon kechikma.', tipUz: 'O‘rtadagi "chik" bo‘g‘inini aniq ayting.' },
      { word: 'Pichoq', syllables: 'PI - CHOQ', exampleUsage: 'Oshxonada o‘tkir pichoq bor.', tipUz: '"Choq" bo‘g‘inini "sh" ga aylantirib yubormang.' },
      { word: 'Chiroq', syllables: 'CHI - ROQ', exampleUsage: 'Xonada yorug‘ chiroq yondi.', tipUz: '"Chi" bo‘g‘inini dadil boshlang.' },
      { word: 'Qaldirg‘och', syllables: 'QAL - DIR - G‘OCH', exampleUsage: 'Qaldirg‘och baland uchdi.', tipUz: 'Oxirgi "ch" ni qisqa va aniq tugating.' },
      { word: 'Chana', syllables: 'CHA - NA', exampleUsage: 'Qorda chana uchish mazza.', tipUz: '"Cha" bo‘g‘inini yengil chiqaring.' },
      { word: 'Burchak', syllables: 'BUR - CHAK', exampleUsage: 'Burchakda kitob javoni turibdi.', tipUz: '"Chak" bo‘g‘inini tiniq talaffuz qiling.' },
      { word: 'Tinch', syllables: 'TINCH', exampleUsage: 'Kutubxonada hamma joy tinch.', tipUz: 'Oxiridagi "ch" ni aniq eshittiring.' },
    ],
    // Week 2
    [
      { word: 'Chaqmoq', syllables: 'CHAQ - MOQ', exampleUsage: 'Yomg‘irdan oldin chaqmoq chaqdi.', tipUz: '"Chaq" bo‘g‘inini qat’iy boshlang.' },
      { word: 'O‘qituvchi', syllables: 'O‘ - QI - TUV - CHI', exampleUsage: 'O‘qituvchi yangi mavzuni tushuntirdi.', tipUz: 'Oxirgi "chi" bo‘g‘inini ravon ayting.' },
      { word: 'Chumchuq', syllables: 'CHUM - CHUQ', exampleUsage: 'Shoxda kichik chumchuq chug‘urladi.', tipUz: 'Ikkala "ch" ni ham tiniq talaffuz qiling.' },
      { word: 'Achchiq', syllables: 'ACH - CHIQ', exampleUsage: 'Qalampir juda achchiq bo‘ladi.', tipUz: 'Qo‘sh "ch" ni aniq va keskin chiqaring.' },
      { word: 'Choynak', syllables: 'CHOY - NAK', exampleUsage: 'Guldor choynak stol ustida.', tipUz: '"Choy" bo‘g‘inini ravon boshlang.' },
      { word: 'Kuchli', syllables: 'KUCH - LI', exampleUsage: 'Sportchi juda kuchli ekan.', tipUz: '"Kuch" bo‘g‘inini "sh" ga o‘tkazmang.' },
      { word: 'Chaman', syllables: 'CHA - MAN', exampleUsage: 'Bog‘-rog‘lar chaman bo‘ldi.', tipUz: '"Cha" bo‘g‘inini ochiq ayting.' },
      { word: 'Sanchqi', syllables: 'SANCH - QI', exampleUsage: 'Likopcha yonida sanchqi turibdi.', tipUz: '"Nch" birikmasini aniq ayting.' },
      { word: 'Chiroyli', syllables: 'CHI - ROY - LI', exampleUsage: 'Chiroyli xat yozishni o‘rgandik.', tipUz: '"Chi" bo‘g‘inini tiniq chiqaring.' },
      { word: 'Bog‘cha', syllables: 'BOG‘ - CHA', exampleUsage: 'Ukajonim bog‘chaga boradi.', tipUz: '"Cha" bo‘g‘inini yengil tugating.' },
    ],
    // Week 3-5
    [
      { word: 'Chug‘urlash', syllables: 'CHU - G‘UR - LASH', exampleUsage: 'Qushlarning chug‘urlashi yoqimli.', tipUz: 'Boshidagi "ch" va oxiridagi "sh" ni farqlang.' },
      { word: 'Chiqindisiz', syllables: 'CHI - QIN - DI - SIZ', exampleUsage: 'Tabiatni toza saqlaymiz.', tipUz: '"Chi" bo‘g‘inini tiniq boshlang.' },
      { word: 'Qushcha', syllables: 'QUSH - CHA', exampleUsage: 'Kichik qushcha don cho‘qiladi.', tipUz: '"Sh" dan "ch" ga aniq o‘ting!' },
      { word: 'O‘yinchoq', syllables: 'O‘ - YIN - CHOQ', exampleUsage: 'Javonda rangli o‘yinchoqlar bor.', tipUz: '"Choq" bo‘g‘inini dadil chiqaring.' },
      { word: 'Charchoq', syllables: 'CHAR - CHOQ', exampleUsage: 'Dam olgach charchoq tarqaldi.', tipUz: 'Ikkala "ch" ni ham toza ayting.' },
      { word: 'Tikuvchi', syllables: 'TI - KUV - CHI', exampleUsage: 'Tikuvchi chiroyli ko‘ylak tikdi.', tipUz: 'Oxirgi "chi" ni tiniq ayting.' },
      { word: 'Chempion', syllables: 'CHEM - PI - ON', exampleUsage: 'Bizning jamoa chempion bo‘ldi.', tipUz: '"Chem" bo‘g‘inini jarangdor boshlang.' },
      { word: 'Chidamli', syllables: 'CHI - DAM - LI', exampleUsage: 'Chidamli sportchi marraga yetdi.', tipUz: '"Chi" bo‘g‘inini aniq talaffuz qiling.' },
      { word: 'Puch', syllables: 'PUCH', exampleUsage: 'Puch yong‘oq yengil bo‘ladi.', tipUz: 'Oxirgi "ch" ni qisqa tuting.' },
      { word: 'G‘uncha', syllables: 'G‘UN - CHA', exampleUsage: 'Atirgul g‘uncha tugdi.', tipUz: '"Cha" bo‘g‘inini mayin chiqaring.' },
    ],
    [
      { word: 'Chemodan', syllables: 'CHE - MO - DAN', exampleUsage: 'Sayohat uchun chemodan tayyor.', tipUz: '"Che" bo‘g‘inini aniq boshlang.' },
      { word: 'Chek', syllables: 'CHEK', exampleUsage: 'Xarid cheki berildi.', tipUz: 'Boshidagi "ch" ni keskin chiqaring.' },
      { word: 'Chizg‘ich', syllables: 'CHIZ - G‘ICH', exampleUsage: 'Chizg‘ich bilan to‘g‘ri chiziq chizdik.', tipUz: 'Boshi va oxiridagi "ch" ni tiniq ayting.' },
      { word: 'Pochta', syllables: 'POCH - TA', exampleUsage: 'Pochta orqali tabriknoma keldi.', tipUz: '"Poch" bo‘g‘inida "ch" ni aniq eshittiring.' },
      { word: 'Kechki', syllables: 'KECH - KI', exampleUsage: 'Kechki sayr juda yoqimli.', tipUz: '"Kech" bo‘g‘inini toza ayting.' },
      { word: 'Chayon', syllables: 'CHA - YON', exampleUsage: 'Cho‘l hayvonlari haqida o‘qidik.', tipUz: '"Cha" bo‘g‘inini ochiq chiqaring.' },
      { word: 'Cho‘pon', syllables: 'CHO‘ - PON', exampleUsage: 'Cho‘pon qo‘ylarni yaylovga haydadi.', tipUz: '"Cho‘" bo‘g‘inida lablarni yumaloqlang.' },
      { word: 'Chegara', syllables: 'CHE - GA - RA', exampleUsage: 'Mamlakat chegarasi mustahkam.', tipUz: '"Che" va "ra" ni ravon ayting.' },
      { word: 'Ishonchli', syllables: 'I - SHONCH - LI', exampleUsage: 'Bu ishonchli do‘st.', tipUz: '"Sh" va "ch" ni ketma-ket toza chiqaring.' },
      { word: 'Tinchlik', syllables: 'TINCH - LIK', exampleUsage: 'Tinchlik — eng katta boylik.', tipUz: '"Tinch" bo‘g‘inini aniq ayting.' },
    ],
    [
      { word: 'Chiroyli uch', syllables: 'CHI - ROY - LI UCH', exampleUsage: 'Qushlar osmonga chiroyli uchdi.', tipUz: 'Boshi va oxiridagi "ch" ni bir xil ayting.' },
      { word: 'Tinch kecha', syllables: 'TINCH KE - CHA', exampleUsage: 'Yozgi tinch kecha sokin.', tipUz: '"Tinch" va "cha" ni ravon bog‘lang.' },
      { word: 'Chumoli mehnati', syllables: 'CHU - MO - LI', exampleUsage: 'Chumoli mehnati barchaga o‘rnak.', tipUz: '"Chu" bo‘g‘inini aniq boshlang.' },
      { word: 'Chaqnoq yulduz', syllables: 'CHAQ - NOQ YUL - DUZ', exampleUsage: 'Chaqnoq yulduz ko‘zni quvnatadi.', tipUz: '"Chaq" bo‘g‘inini tiniq chiqaring.' },
      { word: 'Olcha sharbati', syllables: 'OL - CHA SHAR - BA - TI', exampleUsage: 'Olcha sharbati mazali.', tipUz: '"Cha" va "sha" ni aralashtirmang.' },
      { word: 'Kichik qushcha', syllables: 'KI - CHIK QUSH - CHA', exampleUsage: 'Kichik qushcha shoxga qo‘ndi.', tipUz: '"Chik", "sh", "cha" larni navbatma-navbat aniq ayting.' },
      { word: 'Chempion jamoa', syllables: 'CHEM - PI - ON', exampleUsage: 'Chempion jamoa kubok oldi.', tipUz: '"Chem" bo‘g‘inini dadil chiqaring.' },
      { word: 'Chaman bog‘lar', syllables: 'CHA - MAN BOG‘ - LAR', exampleUsage: 'Bahorda chaman bog‘lar yashnaydi.', tipUz: '"Cha" bo‘g‘inini ochiq ayting.' },
      { word: 'Achchiq saboq', syllables: 'ACH - CHIQ SA - BOQ', exampleUsage: 'Xatodan to‘g‘ri saboq oldik.', tipUz: 'Qo‘sh "ch" ni qat’iy talaffuz qiling.' },
      { word: 'Barcha kuch', syllables: 'BAR - CHA KUCH', exampleUsage: 'Barcha kuch bilan mashq qildik.', tipUz: '"Cha" va "kuch" ni tiniq tugating.' },
    ],
  ],
  'J/Z': [
    // Week 1
    [
      { word: 'Jo‘ja', syllables: 'JO‘ - JA', exampleUsage: 'Sariq jo‘ja don cho‘qiladi.', tipUz: 'Tilni tanglayga bosib, ovoz paychalari bilan jarangli "J" ayting.' },
      { word: 'Zebra', syllables: 'ZEB - RA', exampleUsage: 'Hayvonot bog‘ida zebra ko‘rdik.', tipUz: '"Z" tovushini "S" kabi, lekin ovoz tebranishi bilan ayting.' },
      { word: 'Uzum', syllables: 'U - ZUM', exampleUsage: 'Kuzda shirin uzum pishadi.', tipUz: 'O‘rtadagi "Z" ni jarangdor chiqaring.' },
      { word: 'Jirafa', syllables: 'JI - RA - FA', exampleUsage: 'Jirafa uzun bo‘yni bilan barg yeydi.', tipUz: '"Ji" va "ra" bo‘g‘inlarini aniq ayting.' },
      { word: 'Qizil', syllables: 'QI - ZIL', exampleUsage: 'Qizil lola juda chiroyli.', tipUz: '"Zil" bo‘g‘inini jarangli talaffuz qiling.' },
      { word: 'Javon', syllables: 'JA - VON', exampleUsage: 'Kitoblar javonda tartibli turibdi.', tipUz: 'So‘z boshidagi "J" ni dadil boshlang.' },
      { word: 'Yulduz', syllables: 'YUL - DUZ', exampleUsage: 'Kechasi osmonda yulduz porlaydi.', tipUz: 'Oxiridagi "z" tovushini "s" ga o‘tkazmang.' },
      { word: 'G‘ijjak', syllables: 'G‘IJ - JAK', exampleUsage: 'Ustoz g‘ijjakda kuy chaldi.', tipUz: 'Qo‘sh "j" ni jarangdor ayting.' },
      { word: 'Zina', syllables: 'ZI - NA', exampleUsage: 'Zinadan ehtiyot bo‘lib chiqdik.', tipUz: '"Zi" bo‘g‘inini tiniq boshlang.' },
      { word: 'Mojiza', syllables: 'MO‘ - JI - ZA', exampleUsage: 'Tabiat — haqiqiy mo‘jiza.', tipUz: '"Ji" va "za" tovushlarini bir so‘zda aniq ajrating.' },
    ],
    // Week 2
    [
      { word: 'Jurnal', syllables: 'JUR - NAL', exampleUsage: 'Bolalar jurnali chop etildi.', tipUz: '"Jur" bo‘g‘inini jarangdor boshlang.' },
      { word: 'Zanjir', syllables: 'ZAN - JIR', exampleUsage: 'Darvozada temir zanjir bor.', tipUz: '"Z" va "J" tovushlarini navbat bilan aniq ayting.' },
      { word: 'Xazina', syllables: 'XA - ZI - NA', exampleUsage: 'Bilim — tuganmas xazina.', tipUz: '"Zi" bo‘g‘inini ovoz bilan chiqaring.' },
      { word: 'Jasur', syllables: 'JA - SUR', exampleUsage: 'Jasur bola qo‘rqmasdan gapirdi.', tipUz: '"Ja" bo‘g‘inini dadil boshlang.' },
      { word: 'Ovoz', syllables: 'O - VOZ', exampleUsage: 'Kikining ovozi juda tiniq.', tipUz: 'Oxirgi "z" ni jarangli tugating.' },
      { word: 'Majlis', syllables: 'MAJ - LIS', exampleUsage: 'Maktabda muhim majlis bo‘ldi.', tipUz: '"Maj" bo‘g‘inini aniq ajrating.' },
      { word: 'Zamburug‘', syllables: 'ZAM - BU - RUG‘', exampleUsage: 'O‘rmonda zamburug‘ o‘sadi.', tipUz: '"Zam" bo‘g‘inini jarangli boshlang.' },
      { word: 'Ijod', syllables: 'I - JOD', exampleUsage: 'Rasm chizish — zavqli ijod.', tipUz: '"Jod" bo‘g‘inini tiniq ayting.' },
      { word: 'Qozon', syllables: 'QO - ZON', exampleUsage: 'Qozonda mazali taom pishdi.', tipUz: '"Zon" bo‘g‘inini ovoz bilan chiqaring.' },
      { word: 'Jo‘shqin', syllables: 'JO‘SH - QIN', exampleUsage: 'Jo‘shqin qarsaklar yangradi.', tipUz: '"J" va "sh" ni aniq talaffuz qiling.' },
    ],
    // Week 3-5
    [
      { word: 'Jazoir', syllables: 'JA - ZO - IR', exampleUsage: 'Geografiya darsida xaritan ko‘rdik.', tipUz: '"Ja" va "zo" bo‘g‘inlarini tiniq ayting.' },
      { word: 'Zamonaviy', syllables: 'ZA - MO - NA - VIY', exampleUsage: 'Zamonaviy texnologiya yordam beradi.', tipUz: '"Za" bo‘g‘inini jarangli boshlang.' },
      { word: 'Mo‘jizakor', syllables: 'MO‘ - JI - ZA - KOR', exampleUsage: 'Mo‘jizakor ertak bolalarga yoqdi.', tipUz: '"Ji" va "za" ni aralashtirmang.' },
      { word: 'Jozibali', syllables: 'JO - ZI - BA - LI', exampleUsage: 'Bog‘ manzarasi juda jozibali.', tipUz: '"Jo" va "zi" tovushlarini ravon bog‘lang.' },
      { word: 'Ziyrak', syllables: 'ZIY - RAK', exampleUsage: 'Ziyrak o‘quvchi xatoni tez topadi.', tipUz: '"Ziy" bo‘g‘inini jarangdor ayting.' },
      { word: 'Hujjat', syllables: 'HUJ - JAT', exampleUsage: 'Muhim hujjat papkaga solindi.', tipUz: 'Qo‘sh "j" ni aniq chiqaring.' },
      { word: 'Uzunchoq', syllables: 'U - ZUN - CHOQ', exampleUsage: 'Tarvuz shakli uzunchoq ekan.', tipUz: '"Zun" va "choq" bo‘g‘inlarini tiniq ayting.' },
      { word: 'Jilva', syllables: 'JIL - VA', exampleUsage: 'Quyosh nuri suvda jilva qildi.', tipUz: '"Jil" bo‘g‘inini dadil boshlang.' },
      { word: 'Zafar', syllables: 'ZA - FAR', exampleUsage: 'Mehnat ortidan zafar keladi.', tipUz: '"Za" bo‘g‘inini jarangli ayting.' },
      { word: 'Baraka', syllables: 'BA - RA - KA', exampleUsage: 'Doim uyingizda baraka bo‘lsin.', tipUz: 'Barcha bo‘g‘inlarni tiniq chiqaring.' },
    ],
    [
      { word: 'Zoopark', syllables: 'ZO - O - PARK', exampleUsage: 'Yakshanba kuni zooparkka bordik.', tipUz: '"Zo" bo‘g‘inini jarangdor boshlang.' },
      { word: 'Jemper', syllables: 'JEM - PER', exampleUsage: 'Yashil jemper juda yarashdi.', tipUz: '"Jem" bo‘g‘inini qat’iy ayting.' },
      { word: 'Televizor', syllables: 'TE - LE - VI - ZOR', exampleUsage: 'Televizorda multfilm ko‘rdik.', tipUz: '"Zor" bo‘g‘inini aniq tugating.' },
      { word: 'Proyektor', syllables: 'PRO - YEK - TOR', exampleUsage: 'Sinfda proyektor yoqildi.', tipUz: 'Bo‘g‘inlarni shoshilmasdan ayting.' },
      { word: 'Dizayn', syllables: 'DI - ZAYN', exampleUsage: 'Ilova dizayni juda chiroyli.', tipUz: '"Zayn" bo‘g‘inini tiniq chiqaring.' },
      { word: 'Jurnalist', syllables: 'JUR - NA - LIST', exampleUsage: 'Yosh jurnalist intervyu oldi.', tipUz: '"Jur" bo‘g‘inini dadil boshlang.' },
      { word: 'Zontik', syllables: 'ZON - TIK', exampleUsage: 'Yomg‘irda zontik ishlatdik.', tipUz: '"Zon" bo‘g‘inini jarangli ayting.' },
      { word: 'Jeton', syllables: 'JE - TON', exampleUsage: 'O‘yin uchun jeton oldik.', tipUz: '"Je" bo‘g‘inini toza talaffuz qiling.' },
      { word: 'Vaza', syllables: 'VA - ZA', exampleUsage: 'Vazada chiroyli gullar bor.', tipUz: '"Za" bo‘g‘inini jarangli yakunlang.' },
      { word: 'Garmoniya', syllables: 'GAR - MO - NI - YA', exampleUsage: 'Musiga va nutqda garmoniya muhim.', tipUz: 'Ohangdor va ravon talaffuz qiling.' },
    ],
    [
      { word: 'Jasur zafar', syllables: 'JA - SUR ZA - FAR', exampleUsage: 'Jasur bola zafar quchdi.', tipUz: '"Ja" va "za" ni jarangdor ayting.' },
      { word: 'Qizil jo‘ja', syllables: 'QI - ZIL JO‘ - JA', exampleUsage: 'Hovlida kichik jo‘ja yugurdi.', tipUz: '"Zil" va "jo‘" tovushlarini aniq ajrating.' },
      { word: 'Ziyrak jirafa', syllables: 'ZIY - RAK JI - RA - FA', exampleUsage: 'Ziyrak jirafa uzoqni ko‘radi.', tipUz: '"Z" va "J" ning jarangdorligini saqlang.' },
      { word: 'Yorqin yulduz', syllables: 'YOR - QIN YUL - DUZ', exampleUsage: 'Yulduzlar tunda porlaydi.', tipUz: 'Oxirgi "z" ni "s" ga o‘tkazmang.' },
      { word: 'Tiniq ovoz', syllables: 'TI - NIQ O - VOZ', exampleUsage: 'Kiki tiniq ovozni yaxshi ko‘radi.', tipUz: '"Voz" bo‘g‘inini dadil tugating.' },
      { word: 'Zamonaviy zina', syllables: 'ZA - MO - NA - VIY', exampleUsage: 'Zamonaviy zina bo‘ylab ko‘tarildik.', tipUz: 'Ikkala "z" ni ham tiniq boshlang.' },
      { word: 'Jozibali uzum', syllables: 'JO - ZI - BA - LI', exampleUsage: 'Bog‘da uzum boshlari osilgan.', tipUz: '"Jo", "zi", "zu" bo‘g‘inlarini silliq bog‘lang.' },
      { word: 'Zafarli kun', syllables: 'ZA - FAR - LI KUN', exampleUsage: 'Bugun biz uchun zafarli kun.', tipUz: '"Za" bo‘g‘inini jarangdor ayting.' },
      { word: 'Jilvali rang', syllables: 'JIL - VA - LI RANG', exampleUsage: 'Kamalakda jilvali ranglar bor.', tipUz: '"Jil" bo‘g‘inini tiniq boshlang.' },
      { word: 'Mo‘jiza yarat', syllables: 'MO‘ - JI - ZA YA - RAT', exampleUsage: 'Har kuni kichik mo‘jiza yarat!', tipUz: '"Ji" va "za" ni aniq chiqaring.' },
    ],
  ],
};

const RU_WORD_BANK: Record<SoundKey, WordSeed[][]> = {
  R: [
    [
      { word: 'Ракета', syllables: 'РА - КЕ - ТА', meaningUz: 'Raketa', exampleUsage: 'Ракета летит высоко в космос.', tipUz: 'Ruscha "Р" tovushida til uchini kuchliroq titrating.' },
      { word: 'Рыба', syllables: 'РЫ - БА', meaningUz: 'Baliq', exampleUsage: 'Рыба плавает в чистой воде.', tipUz: '"Ры" bo‘g‘inini chuqur va jarangli ayting.' },
      { word: 'Арбуз', syllables: 'АР - БУЗ', meaningUz: 'Tarvuz', exampleUsage: 'Сладкий арбуз лежит на столе.', tipUz: '"Ар" bo‘g‘inida "Р" ni uzib qo‘ymang.' },
      { word: 'Барабан', syllables: 'БА - РА - БАН', meaningUz: 'Baraban', exampleUsage: 'Мальчик громко бьёт в барабан.', tipUz: 'O‘rtadagi "РА" bo‘g‘iniga urg‘u bering.' },
      { word: 'Радуга', syllables: 'РА - ДУ - ГА', meaningUz: 'Kamalak', exampleUsage: 'После дождя появилась радуга.', tipUz: 'So‘z boshidagi "Ра" ni ravon boshlang.' },
      { word: 'Робот', syllables: 'РО - БОТ', meaningUz: 'Robot', exampleUsage: 'Умный робот помогает детям.', tipUz: '"Ро" bo‘g‘inida lablarni yumaloqlang.' },
      { word: 'Гора', syllables: 'ГО - РА', meaningUz: 'Tog‘', exampleUsage: 'Высокая гора покрыта снегом.', tipUz: '"Ра" bo‘g‘inini aniq tugating.' },
      { word: 'Река', syllables: 'РЕ - КА', meaningUz: 'Daryo', exampleUsage: 'Быстрая река бежит к морю.', tipUz: 'Yumshoq ruscha "Ре" ni mayin ayting.' },
      { word: 'Трактор', syllables: 'ТРАК - ТОР', meaningUz: 'Traktor', exampleUsage: 'Синий трактор работает в поле.', tipUz: '"Тр" birikmasida tilni tez tebrating.' },
      { word: 'Море', syllables: 'МО - РЕ', meaningUz: 'Dengiz', exampleUsage: 'Летом мы поедем на море.', tipUz: '"Ре" bo‘g‘inini muloyim yakunlang.' },
    ],
  ],
  S: [
    [
      { word: 'Слон', syllables: 'СЛОН', meaningUz: 'Fil', exampleUsage: 'Добрый слон пьёт воду.', tipUz: '"С" va "л" tovushlarini silliq bog‘lang.' },
      { word: 'Сок', syllables: 'СОК', meaningUz: 'Sharbat', exampleUsage: 'Яблочный сок очень полезный.', tipUz: 'Qisqa va tiniq "Сок" ayting.' },
      { word: 'Солнце', syllables: 'СОЛН - ЦЕ', meaningUz: 'Quyosh', exampleUsage: 'Яркое солнце светит утром.', tipUz: 'So‘z boshidagi "С" ni toza chiqaring.' },
      { word: 'Собака', syllables: 'СО - БА - КА', meaningUz: 'Kuchuk', exampleUsage: 'Весёлая собака бежит во дворе.', tipUz: '"Со" bo‘g‘inini yengil havo bilan ayting.' },
      { word: 'Самолёт', syllables: 'СА - МО - ЛЁТ', meaningUz: 'Samolyot', exampleUsage: 'Самолёт летит над облаками.', tipUz: '"Са" bo‘g‘inini ochiq talaffuz qiling.' },
      { word: 'Лиса', syllables: 'ЛИ - СА', meaningUz: 'Tulki', exampleUsage: 'Рыжая лиса живёт в лесу.', tipUz: '"Са" bo‘g‘inini tiniq tugating.' },
      { word: 'Снег', syllables: 'СНЕГ', meaningUz: 'Qor', exampleUsage: 'Зимой падает пушистый снег.', tipUz: '"Сн" birikmasini ravon boshlang.' },
      { word: 'Автобус', syllables: 'АВ - ТО - БУС', meaningUz: 'Avtobus', exampleUsage: 'Автобус остановился на остановке.', tipUz: 'Oxirgi "с" ni yutib yubormang.' },
      { word: 'Сыр', syllables: 'СЫР', meaningUz: 'Pishloq', exampleUsage: 'Мышка любит вкусный сыр.', tipUz: '"С" tovushini tiniq chiqaring.' },
      { word: 'Сад', syllables: 'САД', meaningUz: 'Bog‘', exampleUsage: 'В нашем саду растут яблоки.', tipUz: 'Salqin havo oqimi bilan "Са" ni ayting.' },
    ],
  ],
  Sh: [
    [
      { word: 'Шапка', syllables: 'ШАП - КА', meaningUz: 'Bosh kiyim', exampleUsage: 'Тёплая шапка греет зимой.', tipUz: 'Ruscha "Ш" doimo qattiqroq talaffuz qilinadi.' },
      { word: 'Машина', syllables: 'МА - ШИ - НА', meaningUz: 'Mashina', exampleUsage: 'Красная машина едет быстро.', tipUz: '"ШИ" bo‘g‘inini qattiq "шы" kabi ayting.' },
      { word: 'Шар', syllables: 'ШАР', meaningUz: 'Shar', exampleUsage: 'Воздушный шар поднялся вверх.', tipUz: 'Lablarni oldinga cho‘zib "Ша" ayting.' },
      { word: 'Шоколад', syllables: 'ШО - КО - ЛАД', meaningUz: 'Shokolad', exampleUsage: 'Молочный шоколад очень вкусный.', tipUz: '"Шо" bo‘g‘inini aniq talaffuz qiling.' },
      { word: 'Мышка', syllables: 'МЫШ - КА', meaningUz: 'Sichqoncha', exampleUsage: 'Маленькая мышка нашла зерно.', tipUz: 'O‘rtadagi "Ш" ni qattiq tuting.' },
      { word: 'Кошка', syllables: 'КОШ - КА', meaningUz: 'Mushuk', exampleUsage: 'Белая кошка спит на диване.', tipUz: '"Кош" bo‘g‘inini tiniq chiqaring.' },
      { word: 'Школа', syllables: 'ШКО - ЛА', meaningUz: 'Maktab', exampleUsage: 'Дети идут в новую школу.', tipUz: '"Шк" birikmasini aniq boshlang.' },
      { word: 'Карандаш', syllables: 'КА - РАН - ДАШ', meaningUz: 'Qalam', exampleUsage: 'Зелёный карандаш рисует траву.', tipUz: 'Oxiridagi "ш" ni "с" ga almashtirmang.' },
      { word: 'Шуба', syllables: 'ШУ - БА', meaningUz: 'Po‘stin', exampleUsage: 'Пушистая шуба очень тёплая.', tipUz: '"Шу" bo‘g‘inida lablarni yumaloqlang.' },
      { word: 'Груша', syllables: 'ГРУ - ША', meaningUz: 'Nok', exampleUsage: 'Спелая груша висит на ветке.', tipUz: '"Ша" bo‘g‘inini qattiq va toza tugating.' },
    ],
  ],
  L: [
    [
      { word: 'Лампа', syllables: 'ЛАМ - ПА', meaningUz: 'Chiroq', exampleUsage: 'Настольная лампа ярко светит.', tipUz: 'Til uchini yuqori tishlarga tirab qattiq "Л" ayting.' },
      { word: 'Ложка', syllables: 'ЛОЖ - КА', meaningUz: 'Qoshiq', exampleUsage: 'Серебряная ложка лежит рядом.', tipUz: '"Ло" bo‘g‘inini dadil boshlang.' },
      { word: 'Луна', syllables: 'ЛУ - НА', meaningUz: 'Oy', exampleUsage: 'Ночью на небе светит луна.', tipUz: '"Лу" bo‘g‘inida lablarni oldinga cho‘zing.' },
      { word: 'Яблоко', syllables: 'ЯБ - ЛО - КО', meaningUz: 'Olma', exampleUsage: 'Красное яблоко очень сочное.', tipUz: '"Ло" bo‘g‘inini ravon ayting.' },
      { word: 'Стол', syllables: 'СТОЛ', meaningUz: 'Stol', exampleUsage: 'Деревянный стол стоит в центре.', tipUz: 'Oxiridagi "Л" ni aniq eshittiring.' },
      { word: 'Лошадь', syllables: 'ЛО - ШАДЬ', meaningUz: 'Ot', exampleUsage: 'Быстрая лошадь скачет по полю.', tipUz: '"Ло" va "ша" ni ketma-ket toza ayting.' },
      { word: 'Облако', syllables: 'ОБ - ЛА - КО', meaningUz: 'Bulut', exampleUsage: 'Белое облако плывёт по небу.', tipUz: '"Ла" bo‘g‘inini silliq chiqaring.' },
      { word: 'Лимон', syllables: 'ЛИ - МОН', meaningUz: 'Limon', exampleUsage: 'Жёлтый лимон полезен для здоровья.', tipUz: 'Yumshoq "Ли" bo‘g‘inini mayin ayting.' },
      { word: 'Пенал', syllables: 'ПЕ - НАЛ', meaningUz: 'Penal', exampleUsage: 'В пенале лежат ручки.', tipUz: '"Нал" bo‘g‘inini aniq tugating.' },
      { word: 'Белка', syllables: 'БЕЛ - КА', meaningUz: 'Olmaxon', exampleUsage: 'Рыжая белка собирает орехи.', tipUz: '"Бел" bo‘g‘inida til uchini ko‘taring.' },
    ],
  ],
  Ch: [
    [
      { word: 'Часы', syllables: 'ЧА - СЫ', meaningUz: 'Soat', exampleUsage: 'Настенные часы показывают время.', tipUz: 'Ruscha "Ч" doimo yumshoq talaffuz qilinadi.' },
      { word: 'Чайка', syllables: 'ЧАЙ - КА', meaningUz: 'Chag‘alay', exampleUsage: 'Белая чайка летит над морем.', tipUz: 'Mayin va yumshoq "Ча" ayting.' },
      { word: 'Мяч', syllables: 'МЯЧ', meaningUz: 'Koptok', exampleUsage: 'Разноцветный мяч прыгает высоко.', tipUz: 'Oxiridagi "Ч" ni yumshoq tugating.' },
      { word: 'Туча', syllables: 'ТУ - ЧА', meaningUz: 'Qora bulut', exampleUsage: 'Тёмная туча принесла дождь.', tipUz: '"Ча" bo‘g‘inini "ша" ga o‘tkazmang.' },
      { word: 'Ключ', syllables: 'КЛЮЧ', meaningUz: 'Kalit', exampleUsage: 'Золотой ключ открыл сундук.', tipUz: 'Oxirgi "ч" ni tiniq chiqaring.' },
      { word: 'Бабочка', syllables: 'БА - БОЧ - КА', meaningUz: 'Kapalak', exampleUsage: 'Красивая бабочка села на цветок.', tipUz: '"Боч" bo‘g‘inini yumshoq ayting.' },
      { word: 'Учитель', syllables: 'У - ЧИ - ТЕЛЬ', meaningUz: 'O‘qituvchi', exampleUsage: 'Добрый учитель хвалит учеников.', tipUz: '"Чи" bo‘g‘inini aniq chiqaring.' },
      { word: 'Чудо', syllables: 'ЧУ - ДО', meaningUz: 'Mo‘jiza', exampleUsage: 'Сегодня произошло настоящее чудо.', tipUz: '"Чу" bo‘g‘inini mayin boshlang.' },
      { word: 'Девочка', syllables: 'ДЕ - ВОЧ - КА', exampleUsage: 'Девочка читает интересную книгу.', tipUz: '"Воч" bo‘g‘inini ravon ayting.' },
      { word: 'Ручка', syllables: 'РУЧ - КА', meaningUz: 'Ruchka', exampleUsage: 'Синяя ручка пишет аккуратно.', tipUz: '"Руч" bo‘g‘inida "р" va "ч" ni aniq ayting.' },
    ],
  ],
  'J/Z': [
    [
      { word: 'Жук', syllables: 'ЖУК', meaningUz: 'Qo‘ng‘iz', exampleUsage: 'Маленький жук ползёт по листу.', tipUz: 'Ruscha "Ж" doimo qattiq va jarangli aytiladi.' },
      { word: 'Зайка', syllables: 'ЗАЙ - КА', meaningUz: 'Quyoncha', exampleUsage: 'Серый зайка прыгает по траве.', tipUz: '"Зай" bo‘g‘inini jarangdor boshlang.' },
      { word: 'Жираф', syllables: 'ЖИ - РАФ', meaningUz: 'Jirafa', exampleUsage: 'Высокий жираф ест листья.', tipUz: '"ЖИ" bo‘g‘ini qattiq "жы" kabi aytiladi.' },
      { word: 'Зонт', syllables: 'ЗОНТ', meaningUz: 'Soyabon', exampleUsage: 'Яркий зонт спасает от дождя.', tipUz: '"З" tovushini ovoz bilan boshlang.' },
      { word: 'Ёжик', syllables: 'Ё - ЖИК', meaningUz: 'Tipratikan', exampleUsage: 'Колючий ёжик несёт яблоко.', tipUz: '"Жик" bo‘g‘inini qattiq va aniq ayting.' },
      { word: 'Звезда', syllables: 'ЗВЕЗ - ДА', meaningUz: 'Yulduz', exampleUsage: 'Яркая звезда горит в небе.', tipUz: 'Ikkala "з" ni ham tiniq eshittiring.' },
      { word: 'Лыжи', syllables: 'ЛЫ - ЖИ', meaningUz: 'Chang‘i', exampleUsage: 'Зимой дети катаются на лыжах.', tipUz: '"Жи" bo‘g‘inini qattiq chiqaring.' },
      { word: 'Зебра', syllables: 'ЗЕБ - РА', meaningUz: 'Zebra', exampleUsage: 'Полосатая зебра бежит быстро.', tipUz: '"Зе" va "ра" ni aniq bog‘lang.' },
      { word: 'Жёлтый', syllables: 'ЖЁЛ - ТЫЙ', meaningUz: 'Sariq', exampleUsage: 'Жёлтый цыплёнок пищит.', tipUz: '"Жёл" bo‘g‘inini jarangdor ayting.' },
      { word: 'Арбуз', syllables: 'АР - БУЗ', meaningUz: 'Tarvuz', exampleUsage: 'Спелый арбуз очень сладкий.', tipUz: 'Oxiridagi "з" ni jarangli tugating.' },
    ],
  ],
};

const SOUND_ORDER: SoundKey[] = ['R', 'S', 'Sh', 'L', 'Ch', 'J/Z'];

const SOUND_TITLES: Record<SoundKey, string> = {
  R: '"R" tovushi mashqi',
  S: '"S" tovushi mashqi',
  Sh: '"Sh" tovushi mashqi',
  L: '"L" tovushi mashqi',
  Ch: '"Ch" tovushi mashqi',
  'J/Z': '"J" va "Z" tovushlari mashqi',
};

function buildPracticeWords(
  lang: Language,
  weekIdx: number,
  sound: SoundKey
): PracticeWord[] {
  const bank = lang === 'uz' ? UZ_WORD_BANK[sound] : RU_WORD_BANK[sound];
  const rawSet = bank[weekIdx % bank.length];
  return rawSet.map((item, idx) => ({
    id: `${lang}-w${weekIdx + 1}-${sound}-${idx + 1}`,
    word: item.word,
    syllables: item.syllables,
    targetSound: sound,
    speechLang: lang === 'ru' ? 'ru-RU' : 'uz-UZ',
    exampleUsage: item.exampleUsage,
    tipUz: item.tipUz,
    meaningUz: item.meaningUz,
    contrastNote:
      weekIdx === 3 && sound === 'R'
        ? {
            uzSound: 'O‘zbekcha "R"',
            uzExample: 'Arra, Bahor (1–2 yengil tebranish)',
            ruSound: 'Ruscha "Р"',
            ruExample: 'Ракета, Рыба (3–4 kuchli tebranish)',
            explanation:
              'O‘zbek tilida "R" mayinroq, rus tilida esa til uchi yuqori tanglayda kuchliroq titraydi.',
          }
        : undefined,
  }));
}

function buildSundayAssessmentWords(lang: Language, weekIdx: number): PracticeWord[] {
  const collected: PracticeWord[] = [];
  SOUND_ORDER.forEach((sound) => {
    const words = buildPracticeWords(lang, weekIdx, sound);
    // Pick 2 distinct words per sound -> 12 words total covering all 6 sounds
    collected.push(words[0], words[1]);
  });
  return collected;
}

export function buildInitialCurriculum(lang: Language): WeekCurriculum[] {
  return WEEK_THEMES_UZ.map((theme, weekIdx) => {
    const nodes: LessonNode[] = [];

    SOUND_ORDER.forEach((sound, dayIdx) => {
      const dayNumber = dayIdx + 1;
      const words = buildPracticeWords(lang, weekIdx, sound);
      // Week 1 Days 1 & 2 start completed, Day 3 (Sh) starts active; all other nodes unlocked so judges can test any week/day freely!
      const isCompleted = weekIdx === 0 && dayIdx < 2;
      const isActive = weekIdx === 0 && dayIdx === 2;

      nodes.push({
        id: `${lang}-w${theme.weekNumber}-d${dayNumber}`,
        weekNumber: theme.weekNumber,
        dayNumber,
        dayLabel: DAY_NAMES[dayIdx],
        language: lang,
        title: `${DAY_NAMES[dayIdx]}: ${SOUND_TITLES[sound]}`,
        subtitle: `${words.length} ta so‘z · ${words
          .slice(0, 3)
          .map((w) => w.word)
          .join(', ')}...`,
        targetSound: sound,
        status: isCompleted ? 'completed' : isActive ? 'active' : 'unlocked',
        variant: weekIdx === 3 && sound === 'R' ? 'multilingual' : 'standard',
        starsEarned: isCompleted ? 3 : 0,
        maxStars: 3,
        kikiGreeting: `Bugun ${DAY_NAMES[dayIdx]} — "${sound}" tovushini ${words.length} ta so‘zda mashq qilamiz!`,
        words,
      });
    });

    // Day 7: Yakshanba — Haftalik baholash (all 6 sounds together)
    const assessmentWords = buildSundayAssessmentWords(lang, weekIdx);
    nodes.push({
      id: `${lang}-w${theme.weekNumber}-d7-assessment`,
      weekNumber: theme.weekNumber,
      dayNumber: 7,
      dayLabel: DAY_NAMES[6],
      language: lang,
      title: `${theme.weekNumber}-hafta Yakshanba: Haftalik baholash`,
      subtitle: 'Barcha 6 tovush (R, S, Sh, L, Ch, J/Z) bo‘yicha 12 ta sinov so‘zi',
      targetSound: 'R · S · Sh · L · Ch · J/Z',
      status: 'unlocked',
      variant: 'assessment',
      starsEarned: 0,
      maxStars: 3,
      kikiGreeting: `Yakshanba sinovi! Bugun barcha 6 ta tovushni birga tekshirib, haftalik natijani saqlaymiz!`,
      words: assessmentWords,
    });

    return {
      weekNumber: theme.weekNumber,
      title: lang === 'ru' ? `${theme.title} (Rus tili)` : theme.title,
      subtitle: theme.subtitle,
      nodes,
    };
  });
}

export const INITIAL_SOUND_STATS: SoundStat[] = [
  { sound: 'R', label: '"R" tovushi', accuracy: 74, previousAccuracy: 62, color: '#00BFFF' },
  { sound: 'S', label: '"S" tovushi', accuracy: 86, previousAccuracy: 71, color: '#58CC02' },
  { sound: 'Sh', label: '"Sh" tovushi', accuracy: 79, previousAccuracy: 67, color: '#FFC800' },
  { sound: 'L', label: '"L" tovushi', accuracy: 91, previousAccuracy: 83, color: '#8B5CF6' },
  { sound: 'Ch', label: '"Ch" tovushi', accuracy: 82, previousAccuracy: 70, color: '#FF9600' },
  { sound: 'J/Z', label: '"J / Z" tovushlari', accuracy: 84, previousAccuracy: 74, color: '#06B6D4' },
];

export const INITIAL_WEEKLY_ASSESSMENTS: WeeklyAssessmentRecord[] = [
  {
    id: 'assess-week-0',
    weekNumber: 0,
    weekLabel: 'Boshlang‘ich diagnostika',
    completedAt: '14 kun oldin',
    overallScore: 71,
    previousWeekScore: null,
    soundScores: {
      R: 62,
      S: 71,
      Sh: 67,
      L: 83,
      Ch: 70,
      'J/Z': 74,
    },
    notesUz: 'Dastlabki diagnostika: "R" va "Sh" tovushlarida til uchi holatini mustahkamlash tavsiya etiladi.',
  },
  {
    id: 'assess-week-1-baseline',
    weekNumber: 1,
    weekLabel: 'Tayyorgarlik haftasi (Yakshanba)',
    completedAt: '7 kun oldin',
    overallScore: 81,
    previousWeekScore: 71,
    soundScores: {
      R: 74,
      S: 86,
      Sh: 79,
      L: 91,
      Ch: 82,
      'J/Z': 84,
    },
    notesUz: 'Barcha 6 tovush bo‘yicha +10% o‘sish qayd etildi. Intonatsiya va nafas me’yorda.',
  },
];

export const WEEKLY_PRACTICE_MINUTES = [
  { day: 'Du', minutes: 15 },
  { day: 'Se', minutes: 18 },
  { day: 'Ch', minutes: 14 },
  { day: 'Pa', minutes: 20 },
  { day: 'Ju', minutes: 17 },
  { day: 'Sh', minutes: 22 },
  { day: 'Ya', minutes: 25 },
];

export const INITIAL_SESSIONS: PracticeSession[] = [
  {
    id: 'sess-1',
    dateLabel: 'Kecha, 18:10',
    lessonTitle: '2-kun (Seshanba): "S" tovushi mashqi',
    targetSound: 'S',
    accuracy: 86,
    pitchHz: 244,
    starsEarned: 45,
  },
  {
    id: 'sess-2',
    dateLabel: '2 kun oldin',
    lessonTitle: '1-kun (Dushanba): "R" tovushi mashqi',
    targetSound: 'R',
    accuracy: 78,
    pitchHz: 239,
    starsEarned: 40,
  },
];

export const CITY_BUILDINGS: CityBuilding[] = [
  {
    id: 'b1-tovushlar-kutubxonasi',
    order: 1,
    name: 'Tovushlar kutubxonasi',
    description: 'Sehrli eshikdan kirib Kiki bilan R va S tovushlari topishmog‘ini yeching',
    unlockStars: 0,
    soundFocus: 'R · S',
    roofColor: '#008ECC',
    wallColor: '#E5F8FF',
    accentColor: '#00BFFF',
    storyLine:
      'Tovushlar kutubxonasida Kiki har kuni ertalab «Arra» va «Soat» so‘zlari bilan tilcha mashqini boshlaydi.',
    miniQuiz: {
      question: 'Qaysi so‘zda jarangli «R» tovushi ikki marta keladi?',
      options: ['Soat', 'Arra', 'Qush'],
      correctIndex: 1,
      praiseUz: 'To‘g‘ri! «Arra» so‘zida til uchi yumshoq titraydi!',
    },
    practiceCards: [
      { word: 'Arra', syllables: 'AR - RA', tip: 'Til uchini yengil titrating' },
      { word: 'Soat', syllables: 'SO - AT', tip: 'Salqin havo oqimini chiqaring' },
      { word: 'Daraxt', syllables: 'DA - RAXT', tip: 'O‘rtadagi R ni aniq ayting' },
    ],
  },
  {
    id: 'b2-boginlar-ustaxonasi',
    order: 2,
    name: 'Bo‘g‘inlar ustaxonasi',
    description: 'So‘zlarni bo‘g‘inlarga ajratib, tovush bloklaridan yangi so‘z yasang',
    unlockStars: 90,
    soundFocus: 'Sh · L',
    roofColor: '#46A302',
    wallColor: '#ECFCCB',
    accentColor: '#58CC02',
    storyLine:
      'Bu ustaxonada Kiki «Qu-yosh» va «Lo-la» bo‘g‘inlaridan rangli so‘z kubiklarini teradi.',
    miniQuiz: {
      question: '«QU - YOSH» bo‘g‘inlari birlashsa qaysi so‘z hosil bo‘ladi?',
      options: ['Quyosh', 'Qoshiq', 'Shamol'],
      correctIndex: 0,
      praiseUz: 'Barakalla! «Quyosh» so‘zidagi Sh tovushi juda mayin!',
    },
    practiceCards: [
      { word: 'Quyosh', syllables: 'QU - YOSH', tip: 'Lablarni oldinga cho‘zing' },
      { word: 'Lola', syllables: 'LO - LA', tip: 'Til uchini old tishlarga bosing' },
      { word: 'Qalam', syllables: 'QA - LAM', tip: 'Bo‘g‘inlarni ravon bog‘lang' },
    ],
  },
  {
    id: 'b3-talaffuz-bogi',
    order: 3,
    name: 'Talaffuz bog‘i',
    description: 'Bog‘ sayrida hayvonlar va mevalar hikoyasini tinglab topishmoq toping',
    unlockStars: 140,
    soundFocus: 'Ch · J/Z',
    roofColor: '#E5A500',
    wallColor: '#FEF3C7',
    accentColor: '#FFC800',
    storyLine:
      'Talaffuz bog‘ida sariq Jo‘ja va chiziqli Zebra daraxtdan qizil Olcha terib o‘ynashmoqda.',
    miniQuiz: {
      question: 'Bog‘da qaysi hayvon «Z» tovushi bilan boshlanadi?',
      options: ['Jo‘ja', 'Zebra', 'Olcha'],
      correctIndex: 1,
      praiseUz: 'Ofarin! «Zebra» so‘zida Z jarangli chiqadi!',
    },
    practiceCards: [
      { word: 'Olcha', syllables: 'OL - CHA', tip: 'Cha bo‘g‘inini qisqa ayting' },
      { word: 'Zebra', syllables: 'ZEB - RA', tip: 'Z tovushini ovoz bilan chiqaring' },
      { word: 'Jo‘ja', syllables: 'JO‘ - JA', tip: 'Jarangdor boshlang' },
    ],
  },
  {
    id: 'b4-ovoz-laboratoriyasi',
    order: 4,
    name: 'Ovoz laboratoriyasi',
    description: 'Nafas kuchini sinab, ovoz to‘lqinlarini quvnoq tajribada boshqaring',
    unlockStars: 190,
    soundFocus: 'R · Sh · S',
    roofColor: '#0284C7',
    wallColor: '#E0F2FE',
    accentColor: '#00BFFF',
    storyLine:
      'Laboratoriyada Shamol parragi faqat «Sh» va «S» tovushlari toza aytilganda aylanadi!',
    miniQuiz: {
      question: 'Shamol parragini aylantirish uchun qaysi so‘zda «Sh» bor?',
      options: ['Osmon', 'Shamol', 'Baraban'],
      correctIndex: 1,
      praiseUz: 'Ajoyib! «Shamol» bir tekis havo oqimi bilan aytiladi!',
    },
    practiceCards: [
      { word: 'Shamol', syllables: 'SHA - MOL', tip: 'Bir tekis havo oqimi chiqaring' },
      { word: 'Baraban', syllables: 'BA - RA - BAN', tip: 'O‘rtadagi RA ni tiniq ayting' },
      { word: 'Osmon', syllables: 'OS - MON', tip: 'Salqin S tovushi' },
    ],
  },
  {
    id: 'b5-ertaklar-saroyi',
    order: 5,
    name: 'Ertaklar saroyi',
    description: 'Qaldirg‘och va shalola haqidagi kichik ertakni o‘qib qahramonni toping',
    unlockStars: 240,
    soundFocus: 'L · Ch',
    roofColor: '#7C3AED',
    wallColor: '#EDE9FE',
    accentColor: '#8B5CF6',
    storyLine:
      'Ertaklar saroyining sehrli kitobida Qaldirg‘och tiniq Shalola ustidan uchib o‘tadi.',
    miniQuiz: {
      question: 'Ertakdagi qaysi so‘zda ham «L», ham «Ch» tovushi bor?',
      options: ['Shalola', 'Qaldirg‘och', 'Chiroq'],
      correctIndex: 1,
      praiseUz: 'Zo‘r topding! «Qaldirg‘och» juda chiroyli so‘z!',
    },
    practiceCards: [
      { word: 'Qaldirg‘och', syllables: 'QAL - DIR - G‘OCH', tip: 'Uch bo‘g‘inni teng ohangda ayting' },
      { word: 'Shalola', syllables: 'SHA - LO - LA', tip: 'Mayin L tovushi' },
      { word: 'Chiroq', syllables: 'CHI - ROQ', tip: 'Aniq Chi bo‘g‘ini' },
    ],
  },
  {
    id: 'b6-sheriyat-maydoni',
    order: 6,
    name: 'She’riyat maydoni',
    description: 'Qofiyali she’r misralarini davom ettirib ritm bilan o‘qish o‘yini',
    unlockStars: 300,
    soundFocus: 'R · S · L',
    roofColor: '#DB2777',
    wallColor: '#FCE7F3',
    accentColor: '#EC4899',
    storyLine:
      'Maydonda Kiki she’r o‘qimoqda: «Bahor kelar gul bilan, Kamalak chiqar nur bilan!»',
    miniQuiz: {
      question: '«Bahor» so‘zi bilan qaysi so‘z ohangdosh qofiya bo‘ladi?',
      options: ['Tovus', 'Anor', 'Kamalak'],
      correctIndex: 1,
      praiseUz: 'Qoyil! «Bahor — Anor» ajoyib qofiya!',
    },
    practiceCards: [
      { word: 'Bahor', syllables: 'BA - HOR', tip: 'Yumshoq yakuniy R' },
      { word: 'Kamalak', syllables: 'KA - MA - LAK', tip: 'Quvnoq ohang' },
      { word: 'Tovus', syllables: 'TO - VUS', tip: 'Tiniq S yakuni' },
    ],
  },
  {
    id: 'b7-diktsiya-markazi',
    order: 7,
    name: 'Diktsiya markazi',
    description: 'Tez aytish musobaqasida qo‘sh undoshli so‘zlarni chalg‘imay ayting',
    unlockStars: 360,
    soundFocus: 'Tr · Sk · Shl',
    roofColor: '#0D9488',
    wallColor: '#CCFBF1',
    accentColor: '#14B8A6',
    storyLine:
      'Diktsiya markazida sportchilar Stadion atrofida Traktor va Skripka haqidagi tez aytishni mashq qilishadi.',
    miniQuiz: {
      question: 'Qaysi so‘z «Tr» qo‘sh undoshi bilan boshlanadi?',
      options: ['Skripka', 'Traktor', 'Stadion'],
      correctIndex: 1,
      praiseUz: 'Aniq javob! «Traktor» so‘zini bir nafasda ayting!',
    },
    practiceCards: [
      { word: 'Traktor', syllables: 'TRAK - TOR', tip: 'Tr birikmasini bir nafasda ayting' },
      { word: 'Stadion', syllables: 'STA - DI - ON', tip: 'Sta bo‘g‘inini qisqa ayting' },
      { word: 'Skripka', syllables: 'SKRIP - KA', tip: 'Aniq va tez talaffuz' },
    ],
  },
  {
    id: 'b8-kiki-madaniyat-uyi',
    order: 8,
    name: 'Kiki madaniyat uyi',
    description: 'O‘zbekcha va ruscha do‘st so‘zlarni taqqoslab tarjimon o‘yinini o‘ynang',
    unlockStars: 420,
    soundFocus: 'O‘zbekcha R · Ruscha Р',
    roofColor: '#EA580C',
    wallColor: '#FFEDD5',
    accentColor: '#FF9600',
    storyLine:
      'Madaniyat uyida Kiki ikki tilda salomlashib, o‘zbekcha «Raketa» va ruscha «Ракета» farqini ko‘rsatadi.',
    miniQuiz: {
      question: 'Ruscha «Рыба» so‘zining o‘zbekcha ma’nosi nima?',
      options: ['Baliq', 'Quyosh', 'Daraxt'],
      correctIndex: 0,
      praiseUz: 'Judayam to‘g‘ri! «Рыба» — Baliq degani!',
    },
    practiceCards: [
      { word: 'Ракета', syllables: 'РА - КЕ - ТА', tip: 'Kuchli ruscha Р' },
      { word: 'Raketa', syllables: 'RA - KE - TA', tip: 'Yumshoq o‘zbekcha R' },
      { word: 'Рыба', syllables: 'РЫ - БА', tip: 'Chuqur Ры bo‘g‘ini' },
    ],
  },
  {
    id: 'b9-nutq-akademiyasi',
    order: 9,
    name: 'Nutq akademiyasi',
    description: 'Katta imtihon oldidan barcha 6 murakkab tovushni sinovdan o‘tkazing',
    unlockStars: 490,
    soundFocus: 'R · S · Sh · L · Ch · J/Z',
    roofColor: '#2563EB',
    wallColor: '#DBEAFE',
    accentColor: '#3B82F6',
    storyLine:
      'Akademiya zalida eng ziyrak bolalar «Mo‘jiza» va «Shokolad» so‘zlarini bexato aytib diplom olishadi.',
    miniQuiz: {
      question: 'Qaysi so‘zda ham «Sh», ham «L» tovushi mavjud?',
      options: ['Ziyrak', 'Shokolad', 'Mo‘jiza'],
      correctIndex: 1,
      praiseUz: 'Akademiya ustasi! «Shokolad» so‘zi to‘g‘ri topildi!',
    },
    practiceCards: [
      { word: 'Mo‘jiza', syllables: 'MO‘ - JI - ZA', tip: 'J va Z farqini saqlang' },
      { word: 'Shokolad', syllables: 'SHO - KO - LAD', tip: 'Sh va L uyg‘unligi' },
      { word: 'Ziyrak', syllables: 'ZIY - RAK', tip: 'Z va R aniqligi' },
    ],
  },
  {
    id: 'b10-chempionlar-minorasi',
    order: 10,
    name: 'Chempionlar minorasi',
    description: 'Shahar cho‘qqisiga chiqib Kiki bilan g‘oliblik shohsupasida tabrik oling',
    unlockStars: 560,
    soundFocus: 'Mutlaq ravonlik',
    roofColor: '#D97706',
    wallColor: '#FEF9C3',
    accentColor: '#FFC800',
    storyLine:
      'Minoraning eng yuqori qavatidan butun So‘zlar shahri kaftdek ko‘rinadi — sen haqiqiy chempionsan!',
    miniQuiz: {
      question: '«So‘zApp»ning asosiy shiori qaysi?',
      options: [
        'Kiki bilan kichik harakat — katta natija',
        'Shoshilib tez gapir',
        'Faqat bir harfni bil',
      ],
      correctIndex: 0,
      praiseUz: 'Tabriklaymiz, chempion! Kiki sen bilan faxrlanadi!',
    },
    practiceCards: [
      { word: 'Barakalla', syllables: 'BA - RA - KAL - LA', tip: 'G‘olibona va tiniq talaffuz!' },
      { word: 'Qahramon', syllables: 'QAH - RA - MON', tip: 'Dadil va jarangdor' },
      { word: 'Chempion', syllables: 'CHEM - PI - ON', tip: 'Aniq Ch tovushi' },
    ],
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  firstName: 'Azizjon',
  lastName: 'Karimov',
  age: 8,
  gender: 'boy',
  focusSound: 'Sh',
  dailyWordGoal: 10,
  musicEnabled: false,
  sfxEnabled: true,
  inclusiveMode: false,
  voiceStyle: 'child_boy',
  theme: 'light',
};
