import AboutSection from './AboutSection';
import StaticAbout from './StaticAbout';
import img from '../../assets/hero-monument.jpg';

// Built-in copy, shown only until this section is published from the admin dashboard (About City -> history).
const DATA = {
  
  pageTitle_am: "ታሪክ",
  pageTitle_en: "History",
  
  subtitle_am: "የደብረ ታቦር ከተማ ታሪካዊ እና ጂኦግራፊያዊ ዳራ",
  subtitle_en: "Historical and Geographical Background of Debre Tabor",
  
  introHeading_am: "መግቢያ",
  introHeading_en: "Introduction",
  
  introText1_am: "ደብረ ታቦር በታሪክ፣ በባህል እና በሃይማኖታዊ ክንውኖች እጅግ የበለጸገች፣ በኢትዮጵያ ታሪክ ውስጥ ከፍተኛ ስፍራ የሚሰጣት ታሪካዊ ከተማ ናት። በ19ኛው መቶ ክፍለ ዘመን አጋማሽ ላይ የዘመነ ኢትዮጵያ ንጉሠ ነገሥት ቴዎድሮስ ሁለተኛ (Tewodros II) ማዕከላዊ መናኸሪያ በመሆን አገልግላለች።",
  introText1_en: "Debre Tabor is a historically significant city in Ethiopia, richly endowed with heritage, culture, and religious milestones. During the mid-19th century, it served as the prominent royal seat and capital of Emperor Tewodros II.",
  
  introText2_am: "ይህች ከተማ የሀገሪቱ ፖለቲካዊ፣ ወታደራዊ እና ሃይማኖታዊ እንቅስቃሴዎች የነበሩባት በመሆኑ ለኢትዮጵያ አንድነት እና ዘመናዊ አስተዳደር መሠረት ከተጣለባቸው ስፍራዎች መካከል ግንባር ቀደም ትጠቀሳለች።",
  introText2_en: "As the hub of the nation's political, military, and religious activities at the time, Debre Tabor stands out as one of the fundamental places where the vision for Ethiopia's unity and modern administration took root.",

  sec1Title_am: "1. የንጉሠ ነገሥት ቴዎድሮስ ሁለተኛ ዘመን እና መመስረት",
  sec1Title_en: "1. The Era of Emperor Tewodros II and Foundation",
  sec1Text_am: "ንጉሠ ነገሥት ቴዎድሮስ ሁለተኛ በዙፋን ላይ ከወጡ በኋላ ደብረ ታቦርን የንጉሠ ነገሥት መኖሪያቸው (ከተማቸው) አድርገው መረጧት። በወቅቱ በከተማዋ ውስጥ ግርማ ሞገስ ያላቸው ቤተ-መንግሥታትን፣ አብያተ-ክርስቲያናትን እና ወታደራዊ መሠረተ ልማቶችን አሰርተዋል። ንጉሠ ነገሥቱ ሀገሪቱን በአንድ ማዕከላዊ አስተዳደር ስር ለማስተባበር ያደረጉት ሰፊ ጥረት ከዚህች ከተማ ጀምሮ ነበር የተከናወነው።",
  sec1Text_en: "Upon ascending to the throne, Emperor Tewodros II chose Debre Tabor as his royal residence and administrative capital. He constructed magnificent palaces, churches, and military structures within the city. The Emperor's extensive efforts to unify the country under a centralized administration largely emanated from this historic center.",

  sec2Title_am: "2. የ'ደብረ ታቦር' ስም አሰጣጥ ትርጉም",
  sec2Title_en: "2. Origin and Meaning of the Name 'Debre Tabor'",
  sec2Text_am: "የ'ደብረ ታቦር' ስም ትውልዱ ከመጽሐፍ ቅዱስ የተወሰደ ነው። ትርጉሙም 'ታቦር ተራራ' ማለት ነው። በሐዲስ ኪዳን ጌታችን ኢየሱስ ክርስቶስ ብርሃኑን የገለጸበት ተራራ ስም ሲሆን፣ ንጉሠ ነገሥት ቴዎድሮስና የወቅቱ ሊቃውንት ይህንን ስም ለከተማዋ የሰጡት ከቦታው ውበት እና ከታሪካዊ ቁርኝት አንፃር እንደሆነ ታሪክ ያስረዳል።",
  sec2Text_en: "The name 'Debre Tabor' is derived from the Holy Bible, literally translating to 'Mount Tabor'. Historical accounts note that Emperor Tewodros and the scholars of the time bestowed this biblical name upon the city due to its scenic topography and spiritual significance.",

  sec3Title_am: "3. መልክዓ-ምድር፣ አየር ንብረት እና ማህበረሰብ",
  sec3Title_en: "3. Geography, Climate, and Community",
  sec3Text_am: "ከተማዋ ውብ በሆኑ አረንጓዴ ተራሮች የተከበበች፣ ቀዝቃዛና ጤናማ አየር ያላት ናት። የደብረ ታቦር ማህበረሰብ በባህሉ፣ በእንግዳ ተቀባይነቱ እና በሰላም አፍቃሪነቱ የታወቀ ነው። በግብርና፣ በንግድ እና በእደ-ጥበብ ስራዎች የሚተዳደረው የከተማዋ ህዝብ ለኢኮኖሚያዊ ዕድገት ከፍተኛ አስተዋጽኦ እያበረከተ ይገኛል።",
  sec3Text_en: "Surrounded by picturesque green highlands, Debre Tabor enjoys a pleasant, cool, and healthy climate. The local community is widely recognized for its vibrant culture, exceptional hospitality, and peaceful coexistence. Engaged primarily in agriculture, commerce, and craftsmanship, the residents contribute significantly to regional economic growth.",

  sec4Title_am: "4. ዘመናዊ ዕድገት እና ተቋማዊ መስፋፋት",
  sec4Title_en: "4. Modern Development and Institutional Expansion",
  sec4Text_am: "በአሁኑ ወቅት ደብረ ታቦር ከታሪካዊነቷ ባለፈ በፈጣን የዕድገት ጎዳና ላይ ትገኛለች። የደብረ ታቦር ዩኒቨርሲቲን የመሳሰሉ ዓለም አቀፍ ደረጃቸውን የጠበቁ የከፍተኛ ትምህርት ተቋማት፣ የዘመናዊ ጤና ተቋማት እና የልማት ፕሮጀክቶች መኖሪያ በመሆን ለትውልድ ዕውቀት ማዕከል ሆና አገልግላለች።",
  sec4Text_en: "Today, alongside its profound historical legacy, Debre Tabor is on a fast track of urban development. It hosts prominent higher education institutions such as Debre Tabor University, advanced healthcare facilities, and ongoing municipal development projects, serving as a vital knowledge and regional hub.",

  backBtn_am: "ወደ መነሻ ገጽ ተመለስ",
  backBtn_en: "Back to Home",
  
  imgCaption_am: "የደብረ ታቦር ከተማ ታሪካዊ ገጽታ እና ዋናው ሀውልት/መንገድ እይታ",
  imgCaption_en: "Historical landscape and main street view of Debre Tabor city",

  showMore_am: "ተጨማሪ ያንብቡ",
  showMore_en: "Show More",

  showLess_am: "አሳንሰው ይመልከቱ",
  showLess_en: "Show Less"
};

function HistoryStatic() {
  
  return (
    <StaticAbout data={DATA} image={img} />
  );
}

export default function History() {
  return <AboutSection category="history" fallback={<HistoryStatic />} />;
}
