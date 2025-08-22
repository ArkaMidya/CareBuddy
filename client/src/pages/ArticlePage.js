import React, { useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';

const articles = {
  english: {
    title: 'Nutrition Fundamentals',
    content: `
Meal Planning Basics

Balanced nutrition fuels health, supports growth and repair, and helps prevent disease. Focus on whole foods, portion control, and variety.

Key idea: Build meals from vegetables, lean proteins, whole grains, healthy fats, and limit added sugars and excess salt.

Practical tips: Fill half your plate with vegetables, choose whole grains, include a protein source at each meal, and prefer water over sugary drinks.

Micronutrients: Eat colorful foods to cover vitamins and minerals; pregnant people should consider folic acid and iron.

Meal planning: Batch-cook staples, pack healthy snacks (fruit, nuts, yogurt), and read labels for sodium and sugar.

When to get help: See a clinician or registered dietitian for significant weight change, pregnancy, chronic disease, or suspected nutrient deficiencies.
    `,
  },
  hindi: {
    title: 'पोषण की मूल बातें',
    content: `
भोजन योजना की मूल बातें

संतुलित पोषण स्वास्थ्य को ऊर्जा देता है, वृद्धि और मरम्मत में मदद करता है, और बीमारियों की रोकथाम में सहायक होता है। ध्यान दें – संपूर्ण (whole) खाद्य पदार्थों, भाग नियंत्रण (portion control), और विविधता पर।

मुख्य विचार: भोजन को सब्ज़ियों, कम वसा वाले प्रोटीन, साबुत अनाज, स्वस्थ वसा से बनाएं, और अतिरिक्त चीनी व अधिक नमक को सीमित करें।

व्यावहारिक सुझाव: अपनी प्लेट का आधा हिस्सा सब्ज़ियों से भरें, साबुत अनाज चुनें, हर भोजन में प्रोटीन का स्रोत शामिल करें, और मीठे पेयों की जगह पानी पिएं।

सूक्ष्म पोषक तत्व (Micronutrients): रंग-बिरंगे खाद्य पदार्थ खाएं ताकि विटामिन और खनिज पूरे हों। गर्भवती महिलाओं को फोलिक एसिड और आयरन पर विशेष ध्यान देना चाहिए।

भोजन योजना: ज़रूरी चीज़ों को बैच में पकाएं, स्वास्थ्यवर्धक नाश्ते (फल, मेवे, दही) साथ रखें, और सोडियम व चीनी के लिए लेबल पढ़ें।

कब मदद लें: अगर वजन में बड़ा बदलाव हो, गर्भावस्था हो, कोई दीर्घकालिक बीमारी हो, या पोषक तत्वों की कमी का संदेह हो, तो चिकित्सक या पंजीकृत डाइटीशियन से सलाह लें।
    `,
  },
  bengali: {
    title: 'পুষ্টির মূল বিষয়',
    content: `
খাবারের পরিকল্পনার মূল বিষয়

সুষম পুষ্টি আমাদের শরীরকে শক্তি জোগায়, বৃদ্ধি ও মেরামতে সাহায্য করে এবং রোগ প্রতিরোধে ভূমিকা রাখে। গুরুত্ব দিন — প্রাকৃতিক (whole) খাবার, পরিমাণ নিয়ন্ত্রণ এবং বৈচিত্র্যের উপর।

মূল ভাবনা: খাবার সাজান শাকসবজি, কম চর্বিযুক্ত প্রোটিন, পূর্ণ শস্য, স্বাস্থ্যকর চর্বি দিয়ে, আর অতিরিক্ত চিনি ও লবণ সীমিত করুন।

ব্যবহারিক পরামর্শ: প্লেটের অর্ধেক ভরুন শাকসবজি দিয়ে, পূর্ণ শস্য বেছে নিন, প্রতিটি খাবারে প্রোটিন রাখুন, আর চিনিযুক্ত পানীয়র বদলে পানি পান করুন।

মাইক্রোনিউট্রিয়েন্টস: রঙিন খাবার খান যাতে ভিটামিন ও খনিজ পূরণ হয়। গর্ভবতী নারীদের ফোলিক অ্যাসিড ও আয়রনের দিকে বিশেষ নজর দেওয়া উচিত।

খাবারের পরিকল্পনা: দরকারি জিনিস একসাথে রান্না করে রাখুন, স্বাস্থ্যকর নাস্তা (ফল, বাদাম, দই) সঙ্গে রাখুন, আর খাবারের লেবেল দেখে নিন লবণ ও চিনি কেমন আছে।

কখন সাহায্য নিতে হবে: ওজনের বড় পরিবর্তন হলে, গর্ভাবস্থায়, দীর্ঘস্থায়ী অসুস্থতায়, বা পুষ্টির ঘাটতির সন্দেহ হলে চিকিৎসক বা নিবন্ধিত ডায়েটিশিয়ানের সঙ্গে পরামর্শ করুন।
    `,
  },
};

export default function ArticlePage() {
  const [lang, setLang] = useState('english');

  return (
    <Box maxWidth="md" mx="auto" mt={4}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          {articles[lang].title}
        </Typography>
        <Box mb={2} display="flex" gap={2}>
          <Button
            variant={lang === 'english' ? 'contained' : 'outlined'}
            onClick={() => setLang('english')}
          >
            English
          </Button>
          <Button
            variant={lang === 'bengali' ? 'contained' : 'outlined'}
            onClick={() => setLang('bengali')}
          >
            Bengali
          </Button>
          <Button
            variant={lang === 'hindi' ? 'contained' : 'outlined'}
            onClick={() => setLang('hindi')}
          >
            Hindi
          </Button>
        </Box>
        <Typography variant="body1" style={{ whiteSpace: 'pre-line' }}>
          {articles[lang].content}
        </Typography>
      </Paper>
    </Box>
  );
}


