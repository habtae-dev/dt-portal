import AboutSection from './AboutSection';
import StaticAbout from './StaticAbout';
import { useLanguage } from '../../context/LanguageContext';
import img from '../../assets/geography-panorama.webp';

const MAP_URL = 'https://www.google.com/maps?q=11.85,38.0167&z=13&output=embed'; // Debre Tabor, 11.85°N 38.02°E

// Built-in copy, shown only until this section is published from the admin dashboard (About City -> geography).
const DATA = {
  pageTitle_am: "መልክዓ-ምድር እና ጂኦግራፊ",
  pageTitle_en: "Geography & Topography",
  
  subtitle_am: "የደብረ ታቦር ከተማ ጂኦግራፊያዊ አቀማመጥ፣ አየር ንብረት እና ከፍታ",
  subtitle_en: "Geographical location, climate, and topography of Debre Tabor",
  
  introHeading_am: "የመልክዓ-ምድር አጠቃላይ እይታ",
  introHeading_en: "Topographical Overview",
  
  introText1_am: "ደብረ ታቦር በሰሜን ኢትዮጵያ በደብረ ታቦር ዙሪያ ወረዳ ውስጥ የምትገኝ ሲሆን፣ በገነነና ውብ በሆኑ ተራሮች የተከበበች ታሪካዊ ከተማ ናት። ከተማዋ በከፍተኛ የተራራማ ሰንሰለት ላይ የምትገኝ መሆኗ ለየት ያለ ውበት እና ስትራቴጂካዊ ጠቀሜታ ሰጥቷታል።",
  introText1_en: "Debre Tabor is located in northern Ethiopia within the Debre Tabor Zuria district, surrounded by majestic and picturesque mountains. Situated on a high highland plateau, its topography grants it unique scenic beauty and strategic significance.",

  introText2_am: "ከተማዋ ከአዲስ አበባ በስተሰሜን በኩል በግምት 666 ኪሎ ሜትር ርቀት ላይ የምትገኝ ሲሆን፣ ለአካባቢው የንግድ እና የመንገድ ትስስር ማዕከል በመሆን ታገለግላለች።",
  introText2_en: "The city is located approximately 666 kilometers north of Addis Ababa, serving as an essential regional hub for commerce and transport connectivity.",

  sec1Title_am: "1. ከፍታ እና ቴራይ ሳስተር (Elevation & Topography)",
  sec1Title_en: "1. Elevation and Topography",
  sec1Text_am: "ደብረ ታቦር ከባለ ባህር ጠለል በላይ በግምት 2,700 እስከ 2,900 ሜትር ገደማ ከፍታ ላይ ትገኛለች። ይህ ከፍተኛ የከፍታ መጠን ከተማዋን ቀዝቃዛ እና ጤናማ የአየር ንብረት እንዲኖራት አድርጓታል።",
  sec1Text_en: "Debre Tabor lies at an elevation of approximately 2,700 to 2,900 meters above sea level. This high altitude provides the city with a characteristically cool and refreshing climate.",

  sec2Title_am: "2. አየር ንብረት (Climate)",
  sec2Title_en: "2. Climate",
  sec2Text_am: "ከተማዋ 'ደጋ' (Temperate) የአየር ንብረት ምድብ ውስጥ የምትወድቅ ስሆን፣ ዓመታዊ መጠነኛ የሙቀት መጠኗ ከቀዝቃዛ እስከ መካከለኛ ይመደባል። በክረምት ወቅት አዘውትሮ የሚጥለው ዝናብ ለአካባቢው ለምለም አረንጓዴ ከቨር እና ለግብርና እንቅስቃሴ ከፍተኛ አስተዋጽኦ አለው።",
  sec2Text_en: "The city falls under the 'Dega' (temperate/highland) agro-climatic zone, featuring cool to moderate temperatures year-round. The reliable seasonal rainfall significantly contributes to the lush green landscape and robust agricultural activities in the surrounding area.",

  sec3Title_am: "3. ስትራቴጂካዊ አቀማመጥ እና አጎራባች አካባቢዎች",
  sec3Title_en: "3. Strategic Location and Boundaries",
  sec3Text_am: "ደብረ ታቦር ከአማራ ክልል ዋና ከተማ ከባህር ዳር እና ከታዋቂው የጣና ሀይድ አካባቢ ጋር በመንገድ ትስስር የተገናኘች ናት። የጎንደር እና የላልይበላ የጉዞ መስመሮች መጋጠሚያ ላይ በመሆኗ ለቱሪዝም እና ለኢኮኖሚ እንቅስቃሴ ተመራጭ ስፍራ ያደርጋታል።",
  sec3Text_en: "Debre Tabor is connected via major road networks to Bahir Dar, the capital of the Amhara Region, and the Lake Tana basin. Positioned at a strategic crossroads linking major historical routes toward Gondar and Lalibela, it holds strong potential for tourism and commerce.",

  sec4Title_am: "4. የተፈጥሮ ሐብት እና ስነ-ምህዳር",
  sec4Title_en: "4. Natural Resources and Ecology",
  sec4Text_am: "በከተማዋ ዙሪያ የሚገኙ ተራሮች እና የደን ልማት ዞኖች ለብዝሀ-ህይወት ጥበቃ ምቹ ሁኔታን ይፈጥራሉ። የአካባቢው መልክዓ-ምድር ለተፈጥሮ ቱሪዝም፣ ለእግር ጉዞ (Hiking) እና ለሰፊ እይታዎች እጅግ ማራኪ ነው።",
  sec4Text_en: "The surrounding mountains and afforestation zones create favorable conditions for biodiversity conservation. The local topography is exceptionally attractive for nature tourism, hiking, and scenic viewing.",

  backBtn_am: "ወደ መነሻ ገጽ ተመለስ",
  backBtn_en: "Back to Home",
  
  imgCaption_am: "የደብረ ታቦር ከተማ እና አካባቢዋ ከፍ ካለ ስፍራ ሲታይ",
  imgCaption_en: "Debre Tabor and its surroundings seen from above",
  mapCaption_am: "የደብረ ታቦር ከተማ የቀጥታ የጎግል ካርታ (Google Maps) አቀማመጥ እይታ",
  mapCaption_en: "Interactive Google Maps view of Debre Tabor city location",

  showMore_am: "ተጨማሪ ያንብቡ",
  showMore_en: "Show More",

  showLess_am: "አሳንሰው ይመልከቱ",
  showLess_en: "Show Less"
};

function GeographyStatic() {
  const { pick } = useLanguage();
  return (
    <StaticAbout data={DATA} image={img}>
      <figure className="mb-8">
        <div className="h-72 sm:h-96 w-full overflow-hidden rounded-lg border border-gray-200">
          <iframe title="Debre Tabor map" src={MAP_URL} className="h-full w-full" style={{ border: 0 }} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
        <figcaption className="mt-2 text-xs sm:text-sm text-gray-500">{pick(DATA, 'mapCaption')}</figcaption>
      </figure>
    </StaticAbout>
  );
}

export default function Geography() {
  return <AboutSection category="geography" fallback={<GeographyStatic />} />;
}
