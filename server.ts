import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;

interface ChatHistoryMessage {
  role: 'user' | 'model';
  text: string;
}

interface ChatRequestBody {
  message?: string;
  history?: ChatHistoryMessage[];
  persona?: 'child' | 'parent_therapist';
  useSearch?: boolean;
  fastMode?: boolean;
}

function getSystemInstruction(persona: 'child' | 'parent_therapist'): string {
  if (persona === 'parent_therapist') {
    return (
      "Sen 'So‘zApp' ekotizimidagi Kiki AI yordamchisi va professional logoped-maslahatchisan. " +
      "Foydalanuvchi nima haqida so‘rasa (salomlashish, ilova qanday ishlashi, bola tarbiyasi, motivatsiya " +
      "yoki umumiy savollar), avvalo o‘sha savolga tabiiy, samimiy va aniq javob ber. " +
      "Faqat foydalanuvchi nutq rivoji, tovushlar (R, S, Sh, L, Ch, J/Z), disleksiya yoki mashqlar haqida " +
      "so‘raganda ilmiy asoslangan amaliy logopedik tavsiyalar ber. Har doim tabiiy o‘zbek tilida yoz."
    );
  }

  return (
    "Sen Kikisan — 'So‘zApp' ilovasidagi mehribon, quvnoq va aqlli ko‘k-oq panda do‘st va AI nutq yordamchisi. " +
    "Sening shioring: 'Kiki bilan kichik harakat — katta natija'. " +
    "MUHIM QOIDA: Foydalanuvchi Senga nima yozsa (masalan: 'salom', 'qalaysan', ertak so‘rasa, maktab, hayvonlar, " +
    "o‘yinlar yoki istalgan boshqa mavzuda savol bersa), aynan o‘sha savolga tabiiy, iliq, qiziqarli va bola tushunadigan " +
    "o‘zbek tilida javob ber! Har bir javobda majburan R, S, Sh harflari haqida shablon ma’lumot berma — " +
    "faqat foydalanuvchi harflar, tovushlar yoki talaffuz haqida so‘ragandagina tovush mashqlarini tushuntir."
  );
}

function buildConversationalFallback(
  userMessage: string,
  persona: 'child' | 'parent_therapist'
): string {
  const trimmed = userMessage.trim();
  const lower = trimmed.toLowerCase();

  // 1. Greetings (salom, assalomu alaykum, etc.)
  if (
    /\b(salom|assalom|assalomu|alaykum|xayrli|hayrli|privet|hello|hi)\b/i.test(lower)
  ) {
    if (persona === 'parent_therapist') {
      return (
        "Va alaykum assalom! So‘zApp ekotizimiga xush kelibsiz 🐼\n" +
        "Men Kiki AI maslahatchisiman. Farzandingizning nutq rivoji, haftalik natijalari yoki istalgan savolingiz bo‘yicha yordam berishga tayyorman. Bugun qaysi mavzuda suhbatlashamiz?"
      );
    }
    return (
      "Salom, aziz do‘stim! 🐼 Men Kikiman — So‘zApp’dagi quvnoq do‘sting!\n" +
      "Bugun kayfiyating qanday? Menga istalgan savolingni berishing, birga suhbatlashishing yoki xohlasang o‘yinlar va tovush mashqlari haqida so‘rashing mumkin!"
    );
  }

  // 2. How are you / status questions
  if (
    /(qalaysan|qandaysan|yaxshimisiz|ishlar|nima gap|ahvoling|tuzukmisiz)/i.test(lower)
  ) {
    return persona === 'parent_therapist'
      ? "Rahmat, hammasi a’lo! Bolalarning nutqini rivojlantirish va ota-onalarga yordam berish uchun doim tayyorman. Sizda qanday savol bor?"
      : "Menda hammasi zo‘r, rahmat! 🐼 Bugun So‘zlar shahrida yangi binolarni ko‘zdan kechirib, do‘stlarim bilan suhbatlashib o‘tiribman. O‘zingning ishlaring va darslaring qanday ketyapti?";
  }

  // 3. Identity & What can you do / App questions
  if (
    /(kimsan|isming|nima qila olasan|so‘zapp|sozapp|ilova|dastur|yordam)/i.test(lower)
  ) {
    return (
      "Men Kikiman — So‘zApp ilovasining bosh qahramoni va aqlli suhbatdoshingman! 🐼\n\n" +
      "Bu yerda biz birga:\n" +
      "• «Darslar» bo‘limida qiziqarli mashqlarni bajaramiz,\n" +
      "• «So‘zlar shahri»da binolar ochib +20 tadan tanga yig‘amiz,\n" +
      "• «O‘yinlar» bo‘limida 3 xil quvnoq o‘yin o‘ynaymiz,\n" +
      "• Shu chatda esa istalgan mavzuda gaplasha olamiz!"
    );
  }

  // 4. Thanks / Praise
  if (/(rahmat|raxmat|tashakkur|zo‘r|zor|ajoyib|barakalla|super)/i.test(lower)) {
    return persona === 'parent_therapist'
      ? "Arzimaydi! Har qanday savolingiz bo‘lsa bemalol murojaat qiling — birgalikda ajoyib natijalarga erishamiz."
      : "Arzimaydi, do‘stim! 🌟 Sen juda aqlli va tirishqoqsiz. Yana nimani muhokama qilamiz?";
  }

  // 5. Stories / Jokes / Entertainment requests
  if (/(ertak|hikoya|latifa|qiziq|kulgi|topishmoq)/i.test(lower)) {
    return (
      "Mana senga Kikidan kichkina hikoya: 🐼✨\n\n" +
      "Bir kuni So‘zlar shahridagi ko‘k panda Kiki daraxt ostida qizil olmani ko‘rib qolibdi. " +
      "Olma shamolda sekin tebranib: «Meni aniq va chiroyli aytgan bolaga do‘st bo‘laman!» debdi. " +
      "Shunda Kiki va uning do‘stlari birga kulishib, eng chiroyli so‘zlar bayramini boshlab yuborishibdi!\n\n" +
      "Agar xohlasang, topishmoq ham aytib beraman!"
    );
  }

  // 6. Games / City / Coins / Tournament questions
  if (/(o‘yin|oyin|shahar|bino|tanga|yulduz|turnir)/i.test(lower)) {
    return (
      "«O‘yinlar» bo‘limida 3 ta qiziqarli o‘yin kutmoqda: Tovushni top, Bo‘g‘inlarni birlashtir va Tezkor talaffuz raundi! 🎮\n" +
      "«So‘zlar shahri»da esa har bir yangi binoni ochganingda senga +20 tanga mukofot beriladi. «Haftalik turnir»da esa o‘z yulduzlaring bilan Top-1 o‘rinda turasan!"
    );
  }

  // 7. Tired / Difficulty / Motivation
  if (/(charchadim|qiyin|zerikdim|xafa|uddalay olmayman|qo‘rqyapman)/i.test(lower)) {
    return (
      "Hechqisi yo‘q, do‘stim! Hatto eng tez yuguradigan sportchilar ham biroz dam olishadi. 💙\n" +
      "Esingdami shiorimiz: «Kiki bilan kichik harakat — katta natija»! Bir stakan suv ichib, chuqur nafas ol — xohlasang hozir shunchaki suhbatlashamiz yoki oson o‘yin o‘ynaymiz."
    );
  }

  // 8. Bilingual R vs Р comparison (ONLY when explicitly asked)
  if (
    /(ruscha|o‘zbekcha|farqi|ikkalasi|ikki tilli)/i.test(lower) &&
    /(r|р|tovush|harf|talaffuz)/i.test(lower)
  ) {
    return (
      "O‘zbekcha «R» va ruscha «Р» o‘rtasidagi asosiy farq til uchi tebranishida:\n\n" +
      "1. O‘zbekcha «R» (masalan: Arra, Bahor) mayinroq bo‘lib, til uchi yuqori tanglayga 1–2 marta yengil tegadi.\n" +
      "2. Ruscha «Р» (masalan: Ракета, Рыба) kuchliroq va jarangdor bo‘lib, til uchi 3–4 marta tez titraydi.\n\n" +
      "Mashq: Avval «dr-dr» deb havo chiqaring, so‘ng «Arra — Ракета» juftligini navbat bilan ayting!"
    );
  }

  // 9. Explicit pronunciation/letter questions ONLY (word boundaries or explicit sound keywords)
  const asksAboutPronunciation =
    /(tovush|harf|talaffuz|artikul|logoped|bo‘g‘in|mashq)/i.test(lower);

  if (asksAboutPronunciation) {
    if (/\bsh\b|«sh»|"sh"|ш/i.test(lower)) {
      return (
        "«Sh» tovushini tiniq chiqarish uchun oddiy mashq:\n\n" +
        "• Lablaringni oldinga yumaloqlab biroz cho‘z.\n" +
        "• Til uchini yuqori tishlar orqasiga ko‘tar (tishlarga tegmasin).\n" +
        "• Iliq havo oqimini shoshilmasdan chiqar: «Sh-sh-sh».\n\n" +
        "Sinab ko‘r: QU-YOSH, SHA-MOL, MA-SHI-NA!"
      );
    }
    if (/\bch\b|«ch»|"ch"|ч/i.test(lower)) {
      return (
        "«Ch» tovushini aniq aytish uchun:\n\n" +
        "• Til uchini yuqori tanglayga bosib, havoni qisqa va keskin och.\n" +
        "• «Ch» ni «Sh» ga cho‘zib yuborma — u qisqa va jarangli bo‘lishi kerak.\n\n" +
        "Mashq so‘zlari: CHOY, OL-CHA, CHU-MO-LI, CHI-ROQ."
      );
    }
    if (/\bs\b|«s»|"s"|с/i.test(lower)) {
      return (
        "«S» tovushi mashqi:\n\n" +
        "• Tishlaringni yaqinlashtirib, yengil tabassum qil.\n" +
        "• Til uchini pastki tishlar orqasida tutib, salqin havo chiqar: «S-s-s».\n\n" +
        "So‘zlar: SO-AT, SAB-ZI, OS-MON, A-SAL."
      );
    }
    if (/\bl\b|«l»|"l"|л/i.test(lower)) {
      return (
        "«L» tovushini mayin talaffuz qilish siri:\n\n" +
        "• Til uchini yuqori old tishlarning orqa tomoniga yumshoq bos.\n" +
        "• «La-lo-lu» bo‘g‘inlarini kuylagandek ayt: LO-LA, QA-LAM, OL-MA, BU-LUT."
      );
    }
    if (/\b(j|z)\b|«j»|«z»|"j"|"z"/i.test(lower)) {
      return (
        "«J» va «Z» jarangli tovushlari mashqi:\n\n" +
        "• Qo‘lingni bo‘g‘zingga qo‘yib «Z-z-z» va «J-j-j» de — ovoz tebranishini his qilasan!\n" +
        "• Mashq so‘zlari: JO‘-JA, ZEB-RA, U-ZUM, JI-RA-FA."
      );
    }
    if (/\br\b|«r»|"r"|р/i.test(lower)) {
      return (
        "«R» tovushi uchun Kikidan tezkor mashq:\n\n" +
        "1. Til uchini yuqori tishlar orqasiga qo‘yib «D-d-d» deb tez takrorla.\n" +
        "2. Nafas oqimi bilan «Dr-r-r» deb titrat.\n" +
        "3. Bo‘g‘inlab ayt: AR-RA, DA-RAXT, BA-RA-BAN, BA-HOR!"
      );
    }
  }

  // 10. General natural conversation for any other topic
  if (persona === 'parent_therapist') {
    return (
      `Savolingiz uchun rahmat («${trimmed}»)! \n\n` +
      "Bu borada farzandingiz bilan har kuni 10–15 daqiqa iliq suhbat qurish, savol-javoblar orqali " +
      "so‘z boyligini oshirish va So‘zApp’dagi kundalik mashqlarni muntazam bajarish juda katta samara beradi. " +
      "Agar aniq yosh yoki muayyan mavzu bo‘yicha batafsil tavsiya kerak bo‘lsa, bemalol yozing!"
    );
  }

  return (
    `Qiziq fikr, do‘stim! («${trimmed}» haqida so‘raganing juda zo‘r 🐼)\n\n` +
    "Men sening suhbatdoshing sifatida bu mavzuni ham jon deb muhokama qilaman! " +
    "Sen menga maktab, sevimli mashg‘ulotlaring, ertaklar, hayvonlar yoki o‘zing qiziqqan istalgan narsa haqida gapirib berishing mumkin. " +
    "Yana nima haqida gaplashamiz?"
  );
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.post('/api/kiki-chat', async (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    try {
      const body = (req.body || {}) as ChatRequestBody;
      const userMessage = typeof body.message === 'string' ? body.message.trim() : '';
      if (!userMessage) {
        res.status(400).json({ error: 'Xabar matni bo‘sh bo‘lmasligi kerak.' });
        return;
      }

      const persona = body.persona === 'parent_therapist' ? 'parent_therapist' : 'child';
      const useSearch = Boolean(body.useSearch);
      const fastMode = Boolean(body.fastMode);
      const history = Array.isArray(body.history) ? body.history.slice(-16) : [];

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.json({
          reply: buildConversationalFallback(userMessage, persona),
          model: 'kiki-local-therapist',
          sources: [],
          fallback: true,
          statusLabel: 'Kiki suhbat yordamchisi faol',
        });
        return;
      }

      const selectedModel =
        fastMode && !useSearch ? 'gemini-3.1-flash-lite' : 'gemini-4-hydrogen';

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const contents = [
        ...history
          .filter(
            (item) =>
              item &&
              (item.role === 'user' || item.role === 'model') &&
              typeof item.text === 'string' &&
              item.text.trim().length > 0
          )
          .map((item) => ({
            role: item.role,
            parts: [{ text: item.text.trim() }],
          })),
        {
          role: 'user' as const,
          parts: [{ text: userMessage }],
        },
      ];

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: getSystemInstruction(persona),
          ...(useSearch ? { tools: [{ googleSearch: {} }] } : {}),
        },
      });

      const replyText =
        response.text?.trim() || buildConversationalFallback(userMessage, persona);

      const rawChunks =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: { title: string; uri: string }[] = [];
      const seenUris = new Set<string>();

      for (const chunk of rawChunks) {
        const web = chunk?.web;
        if (web?.uri && !seenUris.has(web.uri)) {
          seenUris.add(web.uri);
          sources.push({
            title: web.title || web.uri,
            uri: web.uri,
          });
        }
      }

      res.json({
        reply: replyText,
        model: selectedModel,
        sources,
        fallback: false,
        statusLabel: useSearch ? 'Gemini AI + Google Qidiruv' : 'Gemini AI faol',
      });
    } catch {
      const body = (req.body || {}) as ChatRequestBody;
      const userMessage = typeof body.message === 'string' ? body.message.trim() : '';
      const persona = body.persona === 'parent_therapist' ? 'parent_therapist' : 'child';

      res.status(200).json({
        reply: buildConversationalFallback(userMessage, persona),
        model: 'kiki-local-therapist',
        sources: [],
        fallback: true,
        statusLabel: 'Kiki suhbat yordamchisi faol',
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`So‘zApp serveri http://0.0.0.0:${PORT} da ishlamoqda`);
  });
}

startServer();
