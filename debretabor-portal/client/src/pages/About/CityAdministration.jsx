import AboutSection from './AboutSection';
import StaticAbout from './StaticAbout';
import img from '../../assets/city-administration.jpg';

// Built-in copy, shown only until this section is published from the admin dashboard (About City -> city_administration).
const DATA = {
  pageTitle_am: "የከተማ አስተዳደር መዋቅር",
  pageTitle_en: "City Administration Structure",
  
  subtitle_am: "የደብረ ታቦር ከተማ አስተዳደር ካቢኔ፣ የስራ አስፈፃሚ አካላት እና የአገልግሎት አሰጣጥ ማዕቀፍ",
  subtitle_en: "Debre Tabor City Cabinet, Executive Bodies, and Service Delivery Framework",
  
  introHeading_am: "የከተማ አስተዳደሩ አጠቃላይ እይታ",
  introHeading_en: "Overview of the Administration",
  
  introText1_am: "የደብረ ታቦር ከተማ አስተዳደር ለነዋሪዎች ቀልጣፋ፣ ግልጽነት እና ተጠያቂነት ያለው የመንግሥት አገልግሎት ለመስጠት በህግ የተቋቋመ የአካባቢ አስተዳደር አካል ነው። አስተዳደሩ የከተማዋን ማህበራዊ፣ ኢኮኖሚያዊ እና መሠረተ-ልማት እንቅስቃሴዎች በበላይነት ይመራል።",
  introText1_en: "The Debre Tabor City Administration is a legally established local government body committed to delivering efficient, transparent, and accountable public services to its residents. The administration oversees the city's social, economic, and infrastructural development.",

  introText2_am: "የከተማዋ አስተዳደር ከንቲባ ጽህፈት ቤትን ጨምሮ የተለያዩ የስራ ዘርፎችን፣ ቋሚ ኮሚቴዎችን እና የማዘጋጃ ቤት አገልግሎት ሰጪ ተቋማትን በማቀንጅት ህብረተሰቡን በባለቤትነት ያገለግላል።",
  introText2_en: "Incorporating the Mayor's Office, various sectoral offices, standing committees, and municipal service providers, the administration operates with a strong focus on community empowerment and development.",

  sec1Title_am: "1. የከተማው ከንቲባ ጽህፈት ቤት እና የስራ አስፈፃሚ አካላት",
  sec1Title_en: "1. Mayor's Office and Executive Organs",
  sec1Text_am: "የከንቲባ ጽህፈት ቤት የከተማዋን ፖሊሲዎች እና ስትራቴጂዎች የማስፈጸም ዋና ሃላፊነት አለበት። ከከተማ ከንቲባው በተጨማሪ የከተማ አስተዳደር ካቢኔ አባላት, የሰላም እና ፀጥታ ጽህፈት ቤት፣ እና የፋይናንስ ኢኮኖሚ ልማት ቢሮዎችን ጨምሮ በርካታ ተቋማት ይገኙበታል ።",
  sec1Text_en: "The Mayor's Office bears the primary responsibility of executing municipal policies and strategies. Alongside the City Mayor, it encompasses the city cabinet members, the Peace and Security Office, and the Finance and Economic Development Bureau.",

  sec2Title_am: "2. የማዘጋጃ ቤት አገልግሎት እና የዘርፍ መስሪያ ቤቶች",
  sec2Title_en: "2. Municipal Services and Sectoral Offices",
  sec2Text_am: "በከተማ አስተዳደሩ ስር የሚገኙት እንደ ንግድና ገበያ ልማት ጽህፈት ቤት፣ የኮንስትራክሽንና ዩባን ዴቨሎፕመንት ቢሮ፣ የትምህርትና ጤና ጥበቃ ጽህፈት ቤቶች ለህብረተሰቡ በቀጥታ የሚሰጡ አገልግሎቶችን ይቆጣጠራሉ፤ የዲጂታል ፖርታል አገልግሎቶችን ያስተባብራሉ።",
  sec2Text_en: "Operating under the municipal administration, sectors such as Trade and Market Development, Construction and Urban Development, and Education and Health Offices manage direct public services and coordinate digital portal initiatives.",

  sec3Title_am: "3. የህዝብ ተሳትፎ እና መልካም አስተዳደር",
  sec3Title_en: "3. Public Participation and Good Governance",
  sec3Text_am: "ከተማ አስተዳደሩ የነዋሪዎችን ተሳትፎ በማሳደግ፣ ግልጽነትን የሰፈነበት የአስተዳደር ስርዓት በመዘርጋት እና የሙስና መከላከል ስራዎችን በማጠናከር የከተማዋን ሁለንተናዊ ዕድገት ለማረጋገጥ ያለማል።",
  sec3Text_en: "The administration aims to ensure holistic urban growth by enhancing resident participation, establishing a transparent administrative framework, and strengthening anti-corruption mechanisms.",

  sec4Title_am: "4. የወደፊት የልማት እቅዶች እና ስትራቴጂዎች",
  sec4Title_en: "4. Future Development Plans and Strategies",
  sec4Text_am: "በመሰረተ ልማት ዝርጋታ፣ በዘመናዊ የከተማ ፕላን (Urban Planning)፣ በወጣቶች የስራ ዕድል ፈጠራ እና በቱሪዝም መሠረተ ልማት ማሻሻያ ላይ ትኩረት አድርጎ እየሰራ ይገኛል።",
  sec4Text_en: "Current strategic priorities focus on infrastructure expansion, modern urban planning, youth job creation, and the enhancement of tourism-related facilities.",

  backBtn_am: "ወደ መነሻ ገጽ ተመለስ",
  backBtn_en: "Back to Home",
  
  imgCaption_am: "የደብረ ታቦር ከተማ አስተዳደር ሕንፃ እና የአገልግሎት ማዕከል እይታ",
  imgCaption_en: "Debre Tabor City Administration building and service center view",

  showMore_am: "ተጨማሪ ያንብቡ",
  showMore_en: "Show More",

  showLess_am: "አሳንሰው ይመልከቱ",
  showLess_en: "Show Less"
};

function CityAdministrationStatic() {
  
  return (
    <StaticAbout data={DATA} image={img} />
  );
}

export default function CityAdministration() {
  return <AboutSection category="city_administration" fallback={<CityAdministrationStatic />} />;
}
