import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Container,
  Tabs,
  Tab,
  Chip,
  Avatar,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  IconButton,
  Badge,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Rating,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  School,
  HealthAndSafety,
  FitnessCenter,
  Psychology,
  Restaurant,
  LocalHospital,
  PlayArrow,
  CheckCircle,
  ExpandMore,
  Language,
  Timer,
  Star,
  Bookmark,
  BookmarkBorder,
  Share,
  Download,
  Quiz,
  Assignment,
  VideoLibrary,
  Article,
  TouchApp,
  TrendingUp,
  EmojiEvents,
  CalendarToday,
  Person
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';

  const EducationPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  
  const [activeTab, setActiveTab] = useState(0);
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [userProgress, setUserProgress] = useState({});
  const [bookmarkedModules, setBookmarkedModules] = useState(new Set());
  const [language, setLanguage] = useState('en');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const [showVideoDialog, setShowVideoDialog] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState(null);
  const [showLessonContentDialog, setShowLessonContentDialog] = useState(false);
  const ytPlayerRef = React.useRef(null);
  const vimeoPlayerRef = React.useRef(null);
  const vimeoIdRef = React.useRef(null);
  const [videoUnavailable, setVideoUnavailable] = useState(false);
  const [fallbackUrl, setFallbackUrl] = useState(null);
  const [pauseOverlayVisible, setPauseOverlayVisible] = useState(false);
  const [playingLessonId, setPlayingLessonId] = useState(null);
  const [lessonDurations, setLessonDurations] = useState({});
  const [showCertificates, setShowCertificates] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [scheduleEntries, setScheduleEntries] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ moduleId: '', date: '', time: '' });
  const [moduleRatings, setModuleRatings] = useState({});
  const [currentModuleRating, setCurrentModuleRating] = useState(0);
  const [showRatingPrompt, setShowRatingPrompt] = useState(false);
  const [ratingValueInput, setRatingValueInput] = useState(null);
  const [articleLang, setArticleLang] = useState('en');

  const mapUiLangToKey = (uiLang) => {
    switch (uiLang) {
      case 'en': return 'english';
      case 'bn': return 'bengali';
      case 'hi': return 'hindi';
      default: return 'english';
    }
  };

  const articlesForLessons = {
    'Meal Planning Basics': {
      english: `Meal Planning Basics

Balanced nutrition fuels health, supports growth and repair, and helps prevent disease. Focus on whole foods, portion control, and variety.

Key idea: Build meals from vegetables, lean proteins, whole grains, healthy fats, and limit added sugars and excess salt.

Practical tips: Fill half your plate with vegetables, choose whole grains, include a protein source at each meal, and prefer water over sugary drinks.

Micronutrients: Eat colorful foods to cover vitamins and minerals; pregnant people should consider folic acid and iron.

Meal planning: Batch-cook staples, pack healthy snacks (fruit, nuts, yogurt), and read labels for sodium and sugar.

When to get help: See a clinician or registered dietitian for significant weight change, pregnancy, chronic disease, or suspected nutrient deficiencies.`,
      hindi: `भोजन योजना की मूल बातें

संतुलित पोषण स्वास्थ्य को ऊर्जा देता है, वृद्धि और मरम्मत में मदद करता है, और बीमारियों की रोकथाम में सहायक होता है। ध्यान दें – संपूर्ण (whole) खाद्य पदार्थों, भाग नियंत्रण (portion control), और विविधता पर।

मुख्य विचार: भोजन को सब्ज़ियों, कम वसा वाले प्रोटीन, साबुत अनाज, स्वस्थ वसा से बनाएं, और अतिरिक्त चीनी व अधिक नमक को सीमित करें।

व्यावहारिक सुझाव: अपनी प्लेट का आधा हिस्सा सब्ज़ियों से भरें, साबुत अनाज चुनें, हर भोजन में प्रोटीन का स्रोत शामिल करें, और मीठे पेयों की जगह पानी पिएं।

सूक्ष्म पोषक तत्व (Micronutrients): रंग-बिरंगे खाद्य पदार्थ खाएं ताकि विटामिन और खनिज पूरे हों। गर्भवती महिलाओं को फोलिक एसिड और आयरन पर विशेष ध्यान देना चाहिए।

भोजन योजना: ज़रूरी चीज़ों को बैच में पकाएं, स्वास्थ्यवर्धक नाश्ते (फल, मेवे, दही) साथ रखें, और सोडियम व चीनी के लिए लेबल पढ़ें।

कब मदद लें: अगर वजन में बड़ा बदलाव हो, गर्भावस्था हो, कोई दीर्घकालिक बीमारी हो, या पोषक तत्वों की कमी का संदेह हो, तो चिकित्सक या पंजीकृत डाइटीशियन से सलाह लें।`,
      bengali: `খাবারের পরিকল্পনার মূল বিষয়

সুষম পুষ্টি আমাদের শরীরকে শক্তি জোগায়, বৃদ্ধি ও মেরামতে সাহায্য করে এবং রোগ প্রতিরোধে ভূমিকা রাখে। গুরুত্ব দিন — প্রাকৃতিক (whole) খাবার, পরিমাণ নিয়ন্ত্রণ এবং বৈচিত্র্যের উপর।

মূল ভাবনা: খাবার সাজান শাকসবজি, কম চর্বিযুক্ত প্রোটিন, পূর্ণ শস্য, স্বাস্থ্যকর চর্বি দিয়ে, আর অতিরিক্ত চিনি ও লবণ সীমিত করুন।

ব্যবহারিক পরামর্শ: প্লেটের অর্ধেক ভরুন শাকসবজি দিয়ে, পূর্ণ শস্য বেছে নিন, প্রতিটি খাবারে প্রোটিন রাখুন, আর চিনিযুক্ত পানীয়র বদলে পানি পান করুন।

মাইক্রোনিউট্রিয়েন্টস: রঙিন খাবার খান যাতে ভিটামিন ও খনিজ পূরণ হয়। গর্ভবতী নারীদের ফোলিক অ্যাসিড ও আয়রনের দিকে বিশেষ নজর দেওয়া উচিত।

খাবারের পরিকল্পনা: দরকারি জিনিস একসাথে রান্না করে রাখুন, স্বাস্থ্যকর নাস্তা (ফল, বাদাম, দই) সঙ্গে রাখুন, আর খাবারের লেবেল দেখে নিন লবণ ও চিনি কেমন আছে।

কখন সাহায্য নিতে হবে: ওজনের বড় পরিবর্তন হলে, গর্ভাবস্থায়, দীর্ঘস্থায়ী অসুস্থতায়, বা পুষ্টির ঘাটতির সন্দেহ হলে চিকিৎসক বা নিবন্ধিত ডায়েটিশিয়ানের সঙ্গে পরামর্শ করুন।`,
    },
    'Building Resilience': {
      english: `Building Resilience

Mental health is as important as physical health. Early recognition and small daily habits improve resilience and functioning.

Key idea: Mental wellbeing involves emotional regulation, meaningful relationships, and coping skills.

Daily actions: Prioritize sleep, regular movement, social contact, and brief mindfulness or breathing exercises.

Coping strategies: Use structured routines, problem-solving, and activities that provide mastery and pleasure.

When to seek help: Persistent sadness, anxiety that limits functioning, suicidal thoughts, or major behavior changes—contact a mental health professional.

Resources: Peer support, counseling, and evidence-based therapies (e.g., CBT) are effective.`,
      hindi: `लचीलापन (Resilience) बनाना

मानसिक स्वास्थ्य उतना ही महत्वपूर्ण है जितना शारीरिक स्वास्थ्य। समय पर पहचान और छोटी-छोटी दैनिक आदतें लचीलापन और कार्यक्षमता को बेहतर बनाती हैं।

मुख्य विचार: मानसिक सुख-समृद्धि का अर्थ है भावनाओं पर नियंत्रण, सार्थक रिश्ते, और सामना करने की क्षमता।

दैनिक क्रियाएँ: नींद को प्राथमिकता दें, नियमित शारीरिक गतिविधि करें, सामाजिक संपर्क बनाए रखें, और थोड़े समय के लिए माइंडफुलनेस या श्वास-प्रश्वास अभ्यास करें।

सामना करने की रणनीतियाँ: नियमित दिनचर्या अपनाएँ, समस्याओं का समाधान ढूंढें, और ऐसी गतिविधियाँ करें जिनसे संतुष्टि व आनंद मिले।

कब मदद लें: लगातार उदासी, ऐसा तनाव/चिंता जो कार्यक्षमता को सीमित करे, आत्महत्या के विचार, या व्यवहार में बड़ा बदलाव—ऐसे समय मानसिक स्वास्थ्य विशेषज्ञ से संपर्क करें।

संसाधन: साथी समूह का सहयोग, परामर्श, और प्रमाण-आधारित थेरेपी (जैसे CBT) प्रभावी हैं।`,
      bengali: `স্থিতিস্থাপকতা (Resilience) গড়ে তোলা

মানসিক স্বাস্থ্য শারীরিক স্বাস্থ্যের মতোই গুরুত্বপূর্ণ। আগেভাগে চিহ্নিত করা এবং ছোট ছোট দৈনন্দিন অভ্যাস স্থিতিস্থাপকতা ও কর্মক্ষমতা উন্নত করে।

মূল ভাবনা: মানসিক সুস্থতা মানে হলো আবেগ নিয়ন্ত্রণ, অর্থবহ সম্পর্ক এবং মোকাবেলার দক্ষতা।

দৈনন্দিন কাজ: ঘুমকে গুরুত্ব দিন, নিয়মিত শরীরচর্চা করুন, সামাজিক যোগাযোগ রাখুন এবং অল্প সময়ের জন্য মাইন্ডফুলনেস বা শ্বাস-প্রশ্বাসের ব্যায়াম করুন।

মোকাবেলার কৌশল: গঠিত রুটিন ব্যবহার করুন, সমস্যার সমাধান বের করুন এবং এমন কাজ করুন যা দক্ষতা ও আনন্দ দেয়।

কখন সাহায্য নিতে হবে: দীর্ঘস্থায়ী দুঃখ, কর্মক্ষমতা কমিয়ে দেওয়া উদ্বেগ, আত্মহত্যার চিন্তা, বা বড় ধরনের আচরণের পরিবর্তন হলে মানসিক স্বাস্থ্য বিশেষজ্ঞের সঙ্গে যোগাযোগ করুন।

উপায়: সহপাঠীর সহায়তা, কাউন্সেলিং এবং প্রমাণ-ভিত্তিক থেরাপি (যেমন CBT) কার্যকর।`,
    },
    'Family Planning Basics': {
      english: `Family Planning Basics

Reproductive health covers safe conception, pregnancy, childbirth, and access to family planning and STI prevention.

- Key idea: Access to accurate information, contraception, prenatal/postnatal care, and respectful services improves outcomes.
- Preconception: Folic acid, immunization checks, and health reviews reduce risks.
- Pregnancy care: Regular antenatal visits, balanced nutrition, avoid tobacco/alcohol, and seek care for warning signs.
- Family planning & STI prevention: Offer reliable contraception and condoms; test and treat STIs when needed.
- Support: Provide youth-friendly education, maternal services, and nonjudgmental counseling.`,
      hindi: `परिवार नियोजन की मूल बातें

प्रजनन स्वास्थ्य में सुरक्षित गर्भधारण, गर्भावस्था, प्रसव और परिवार नियोजन तथा यौन संचारित संक्रमण (STI) की रोकथाम शामिल है।

मुख्य विचार: सटीक जानकारी, गर्भनिरोधक साधन, प्रसवपूर्व/प्रसवोत्तर देखभाल और सम्मानजनक सेवाओं की उपलब्धता परिणामों को बेहतर बनाती है।

गर्भधारण से पहले: फोलिक एसिड लेना, टीकाकरण की जाँच करना और स्वास्थ्य समीक्षा करना जोखिमों को कम करता है।

गर्भावस्था देखभाल: नियमित प्रसवपूर्व जांच कराएँ, संतुलित आहार लें, तंबाकू/शराब से बचें, और चेतावनी संकेत दिखने पर तुरंत देखभाल लें।

परिवार नियोजन एवं STI रोकथाम: विश्वसनीय गर्भनिरोधक और कंडोम उपलब्ध कराएँ; आवश्यकता पड़ने पर STI की जांच और इलाज करें।

सहायता: युवाओं के लिए अनुकूल शिक्षा, मातृ सेवाएँ, और बिना भेदभाव वाली परामर्श सेवाएँ प्रदान करें।`,
      bengali: `পরিবার পরিকল্পনার মূল বিষয়

প্রজনন স্বাস্থ্য অন্তর্ভুক্ত করে নিরাপদ গর্ভধারণ, গর্ভাবস্থা, সন্তান জন্ম এবং পরিবার পরিকল্পনা ও যৌনবাহিত সংক্রমণ (STI) প্রতিরোধ।

মূল ভাবনা: সঠিক তথ্য, গর্ভনিরোধক, প্রসব-পূর্ব/প্রসব-পরবর্তী যত্ন এবং সম্মানজনক সেবা প্রাপ্যতা ফলাফল উন্নত করে।

গর্ভধারণের আগে: ফোলিক অ্যাসিড গ্রহণ, টিকাদান পরীক্ষা এবং স্বাস্থ্য পর্যালোচনা ঝুঁকি কমায়।

গর্ভাবস্থার যত্ন: নিয়মিত প্রসব-পূর্ব পরীক্ষা করুন, সুষম খাদ্য গ্রহণ করুন, তামাক/মদ্যপান এড়িয়ে চলুন এবং সতর্ক সংকেত দেখা দিলে দ্রুত যত্ন নিন।

পরিবার পরিকল্পনা ও STI প্রতিরোধ: নির্ভরযোগ্য গর্ভনিরোধক ও কনডম ব্যবহার করুন; প্রয়োজনে STI পরীক্ষা ও চিকিৎসা করুন।

সহায়তা: যুববান্ধব শিক্ষা, মাতৃসেবা এবং বৈষম্যহীন পরামর্শ প্রদান করুন।`,
    },
    'Personal Hygiene': {
      english: `Good hygiene and sanitation prevent infections and support community health.

- Key idea: Regular behaviors (handwashing, safe food handling, clean water) reduce disease transmission.
- Handwashing: Use soap and scrub for ~20 seconds, especially before eating and after using the toilet.
- Food safety: Separate raw and cooked foods, cook to safe temperatures, and store properly.
- Household sanitation: Safe waste disposal, clean water (boil or treat if needed), and surface cleaning reduce outbreaks.
- Community actions: Promote vaccination, clean delivery practices, and hygiene education.`,
      hindi: `अच्छी स्वच्छता और स्वच्छता प्रथाएँ

अच्छी स्वच्छता और साफ-सफाई संक्रमणों को रोकती है और सामुदायिक स्वास्थ्य को समर्थन देती है।

मुख्य विचार: नियमित आदतें (हाथ धोना, सुरक्षित भोजन संभालना, साफ पानी) बीमारियों के प्रसार को कम करती हैं।

हाथ धोना: साबुन का उपयोग करें और लगभग 20 सेकंड तक रगड़ें, विशेषकर खाने से पहले और शौचालय के बाद।

भोजन सुरक्षा: कच्चे और पके भोजन को अलग रखें, सुरक्षित तापमान पर पकाएँ, और सही तरीके से संग्रह करें।

घर की स्वच्छता: सुरक्षित कचरा निपटान, स्वच्छ पानी (जरूरत पड़ने पर उबालें या शुद्ध करें), और सतहों की सफाई से बीमारियों का फैलाव कम होता हैं।

सामुदायिक कार्य: टीकाकरण को बढ़ावा दें, सुरक्षित प्रसव प्रथाओं को अपनाएँ, और स्वच्छता शिक्षा फैलाएँ।`,
      bengali: `Good hygiene and sanitation prevent infections and support community health.

- Key idea: Regular behaviors (handwashing, safe food handling, clean water) reduce disease transmission.
- Handwashing: Use soap and scrub for ~20 seconds, especially before eating and after using the toilet.
- Food safety: Separate raw and cooked foods, cook to safe temperatures, and store properly.
- Household sanitation: Safe waste disposal, clean water (boil or treat if needed), and surface cleaning reduce outbreaks.
- Community actions: Promote vaccination, clean delivery practices, and hygiene education.`,
    },
    'Wound Care': {
      english: `Wound Care

Timely first aid stabilizes people and reduces harm before professional help arrives.

- Key idea: Prioritize scene safety, call for help, then apply basic interventions.
- Severe bleeding: Apply direct pressure to control bleeding and seek urgent care.
- Burns & wounds: Cool burns with running water; clean and cover wounds and watch for signs of infection.
- CPR & emergencies: If unresponsive and not breathing, start CPR and call emergency services.
- Preparedness: Learn basic CPR/first aid, keep a stocked kit, and know emergency numbers.`,
      hindi: `घाव की देखभाल (Wound Care)

समय पर प्राथमिक उपचार व्यक्ति को स्थिर करता है और पेशेवर मदद आने से पहले नुकसान को कम करता है।

मुख्य विचार: सबसे पहले स्थान की सुरक्षा सुनिश्चित करें, मदद के लिए कॉल करें, फिर बुनियादी हस्तक्षेप लागू करें।

गंभीर रक्तस्राव: रक्तस्राव को नियंत्रित करने के लिए सीधे दबाव डालें और तुरंत चिकित्सा सहायता लें।

जलन और घाव: जलन को बहते पानी से ठंडा करें; घाव को साफ करके ढकें और संक्रमण के लक्षणों पर नज़र रखें।

सीपीआर और आपात स्थिति: यदि व्यक्ति बेहोश है और साँस नहीं ले रहा है, तो सीपीआर शुरू करें और आपातकालीन सेवाओं को कॉल करें।

तैयारी: बुनियादी सीपीआर/प्राथमिक चिकित्सा सीखें, अच्छी तरह से भरी हुई प्राथमिक उपचार किट रखें, और आपातकालीन नंबर जानें।`,
      bengali: `ক্ষত পরিচর্যা (Wound Care)

সময়ে প্রাথমিক চিকিৎসা দিলে রোগী স্থিতিশীল হয় এবং পেশাদার সাহায্য আসার আগে ক্ষতি কমে যায়।

মূল ভাবনা: প্রথমে জায়গার নিরাপত্তা নিশ্চিত করুন, সাহায্যের জন্য ফোন করুন, তারপর প্রাথমিক হস্তক্ষেপ করুন।

তীব্র রক্তপাত: রক্তপাত বন্ধ করতে সরাসরি চাপ দিন এবং দ্রুত চিকিৎসা নিন।

পোড়া ও ক্ষত: পোড়া স্থানে চলমান পানির নিচে ঠান্ডা করুন; ক্ষত পরিষ্কার করে ঢেকে দিন এবং সংক্রমণের লক্ষণ পর্যবেক্ষণ করুন।

সিপিআর ও জরুরি অবস্থা: যদি রোগী অচেতন থাকে এবং শ্বাস না নেয়, তবে সিপিআর শুরু করুন এবং জরুরি সেবায় কল করুন।

প্রস্তুতি: মৌলিক সিপিআর/প্রথম চিকিৎসা শিখুন, প্রয়োজনীয় সামগ্রীসহ একটি ফার্স্ট এইড কিট রাখুন এবং জরুরি নম্বরগুলো জানুন।`,
    }
  };

  // Progress report helpers
  const getCompletedCountForModule = (module) => {
    if (!module?.lessons) return 0;
    return module.lessons.reduce((acc, lesson) => acc + (userProgress[`${module.id}-${lesson.id}`] ? 1 : 0), 0);
  };

  const computeReportData = () => {
    const totalModules = educationModules.length;
    const totalLessons = educationModules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    const completedLessons = Object.values(userProgress).filter(Boolean).length;
    const completedModules = educationModules.filter(m => getModuleProgress(m) >= 100).length;
    const overallProgress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    const modules = educationModules.map(m => {
      const completed = getCompletedCountForModule(m);
      const total = m.lessons?.length || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { id: m.id, title: m.title, category: m.category, completedLessons: completed, totalLessons: total, progress };
    });

    return { overall: { totalModules, totalLessons, completedLessons, overallProgress, completedModules }, modules };
  };

  const handleExportReport = () => {
    const data = computeReportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'education-progress-report.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Mock education modules data
  // Load saved progress and bookmarks
  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem('educationProgress');
      if (savedProgress) setUserProgress(JSON.parse(savedProgress));
      const savedBookmarks = localStorage.getItem('educationBookmarks');
      if (savedBookmarks) setBookmarkedModules(new Set(JSON.parse(savedBookmarks)));
      const savedSchedule = localStorage.getItem('educationSchedule');
      if (savedSchedule) setScheduleEntries(JSON.parse(savedSchedule));
    } catch {}
  }, []);

  // load persisted module ratings
  useEffect(() => {
    try {
      const saved = localStorage.getItem('educationModuleRatings');
      if (saved) setModuleRatings(JSON.parse(saved));
    } catch (e) {}
  }, []);

  // update displayed current module rating when ratings change or selected module changes
  useEffect(() => {
    try {
      if (selectedModule) {
        setCurrentModuleRating(getAverageRating(selectedModule.id, selectedModule.rating));
      }
    } catch (e) {}
  }, [moduleRatings, selectedModule]);

  const getAverageRating = (moduleId, fallback) => {
    const arr = moduleRatings && moduleRatings[moduleId];
    if (!arr || !Array.isArray(arr) || arr.length === 0) return fallback || 0;
    const sum = arr.reduce((s, v) => s + Number(v || 0), 0);
    return Math.round((sum / arr.length) * 10) / 10; // one decimal
  };

  const getRatingCount = (moduleId) => {
    const arr = moduleRatings && moduleRatings[moduleId];
    return arr && Array.isArray(arr) ? arr.length : 0;
  };

  const submitModuleRating = (moduleId, rating) => {
    try {
      const existing = JSON.parse(localStorage.getItem('educationModuleRatings') || '{}');
      const arr = Array.isArray(existing[moduleId]) ? existing[moduleId].slice() : [];
      arr.push(Number(rating));
      existing[moduleId] = arr;
      localStorage.setItem('educationModuleRatings', JSON.stringify(existing));
      setModuleRatings(existing);
      showSuccess('Thank you for rating');
    } catch (e) {
      showError('Could not save rating');
    }
  };

  // Persist progress and bookmarks
  useEffect(() => {
    try {
      localStorage.setItem('educationProgress', JSON.stringify(userProgress));
    } catch {}
  }, [userProgress]);

  useEffect(() => {
    try {
      localStorage.setItem('educationBookmarks', JSON.stringify(Array.from(bookmarkedModules)));
    } catch {}
  }, [bookmarkedModules]);

  useEffect(() => {
    try {
      localStorage.setItem('educationSchedule', JSON.stringify(scheduleEntries));
    } catch {}
  }, [scheduleEntries]);
  const educationModules = [
    {
      id: 1,
      title: 'Nutrition Fundamentals',
      category: 'nutrition',
      description: 'Learn about balanced nutrition, essential nutrients, and healthy eating habits.',
      duration: '45 min',
      difficulty: 'Beginner',
      rating: 4.5,
      lessons: 6,
      completed: 0,
      image: '🍎',
      language: ['en', 'es', 'fr', 'bn', 'hi'],
      lessons: [
        {
          id: 1,
          title: 'Understanding Macronutrients',
          type: 'video',
          duration: '8 min',
          content: 'Learn about proteins, carbohydrates, and fats.',
          videoUrl: {
            en: 'https://youtu.be/inEPlZZ_SfA?si=aEEjKucSl6KPdRrF',
            bn: 'https://youtu.be/YMH3wXMp9Fs?si=B9Q9Pm57Y0jYbgA1',
            hi: 'https://youtu.be/8Z1LaXG93X8?si=QIEsRNyQy9khOGMD'
          },
          completed: false
        },
        {
          id: 2,
          title: 'Micronutrients and Vitamins',
          type: 'quiz_contest',
          duration: '10 min',
          content: 'Interactive guide to vitamins and minerals.',
          completed: false
        },
        {
          id: 3,
          title: 'Meal Planning Basics',
          type: 'article',
          duration: '12 min',
          content: `Balanced nutrition fuels health, supports growth and repair, and helps prevent disease. Focus on whole foods, portion control, and variety.

- Key idea: Build meals from vegetables, lean proteins, whole grains, healthy fats, and limit added sugars and excess salt.
- Practical tips: Fill half your plate with vegetables, choose whole grains, include a protein source at each meal, and prefer water over sugary drinks.
- Micronutrients: Eat colorful foods to cover vitamins and minerals; pregnant people should consider folic acid and iron.
- Meal planning: Batch-cook staples, pack healthy snacks (fruit, nuts, yogurt), and read labels for sodium and sugar.
- When to get help: See a clinician or registered dietitian for significant weight change, pregnancy, chronic disease, or suspected nutrient deficiencies.`,
          completed: false
        },
        {
          id: 4,
          title: 'Reading Food Labels',
          type: 'quiz',
          duration: '15 min',
          content: 'Test your knowledge about nutrition labels.',
          completed: false
        }
      ]
    },
    {
      id: 2,
      title: 'Mental Health Awareness',
      category: 'mental_health',
      description: 'Understanding mental health, stress management, and emotional well-being.',
      duration: '60 min',
      difficulty: 'Intermediate',
      rating: 4.8,
      lessons: 5,
      completed: 0,
      image: '🧠',
      language: ['en', 'es', 'bn', 'hi'],
      lessons: [
        {
          id: 1,
          title: 'Understanding Stress',
          type: 'video',
          duration: '10 min',
          content: 'Learn about stress triggers and responses.',
          videoUrl: {
            en: 'https://www.youtube.com/watch?v=gmwiJ6ghLIM',
            hi: 'https://youtu.be/Nlz8yKG0ySU?si=ZJv7nOvxNRJ83G15',
            bn: 'https://youtu.be/jrpB5kxKYbg?si=9FB6Ic1yNpnxYf_l'
          },
          completed: false
        },
        {
          id: 2,
          title: 'Mindfulness Techniques',
          type: 'quiz_contest',
          duration: '15 min',
          content: 'Practice mindfulness and meditation.',
          completed: false
        },
        {
          id: 3,
          title: 'Building Resilience',
          type: 'article',
          duration: '12 min',
          content: `Mental health is as important as physical health. Early recognition and small daily habits improve resilience and functioning.

- Key idea: Mental wellbeing involves emotional regulation, meaningful relationships, and coping skills.
- Daily actions: Prioritize sleep, regular movement, social contact, and brief mindfulness or breathing exercises.
- Coping strategies: Use structured routines, problem-solving, and activities that provide mastery and pleasure.
- When to seek help: Persistent sadness, anxiety that limits functioning, suicidal thoughts, or major behavior changes—contact a mental health professional.
- Resources: Peer support, counseling, and evidence-based therapies (e.g., CBT) are effective.`,
          completed: false
        }
      ]
    },
    {
      id: 3,
      title: 'Physical Fitness Basics',
      category: 'fitness',
      description: 'Safe exercise routines, strength training, and cardiovascular health.',
      duration: '50 min',
      difficulty: 'Beginner',
      rating: 4.3,
      lessons: 4,
      completed: 0,
      image: '💪',
      language: ['en', 'fr', 'bn', 'hi'],
      lessons: [
        // Warm-up lesson removed per update
        {
          id: 2,
          title: 'Cardio Exercises',
          type: 'quiz_contest',
          duration: '12 min',
          content: 'Interactive cardio workout guide.',
          completed: false
        },
        {
          id: 3,
          title: 'Strength Training',
          type: 'video',
          duration: '15 min',
          content: 'Basic strength training exercises.',
          videoUrl: {
            en: 'https://www.youtube.com/watch?v=U0bhE67HuDY',
            bn: 'https://youtu.be/awWnsm2WDy8?si=bEIEbSqLbtXbhz4b',
            hi: 'https://youtu.be/XLeqsNKyYbI?si=156LrITwHaR6DYcM'
          },
          completed: false
        }
      ]
    },
    {
      id: 4,
      title: 'Hygiene and Sanitation',
      category: 'hygiene',
      description: 'Personal hygiene, hand washing, and disease prevention.',
      duration: '30 min',
      difficulty: 'Beginner',
      rating: 4.7,
      lessons: 3,
      completed: 0,
      image: '🧼',
      language: ['en', 'es', 'fr', 'ar', 'bn', 'hi'],
      lessons: [
        {
          id: 1,
          title: 'Hand Washing Techniques',
          type: 'video',
          duration: '5 min',
          content: 'Proper hand washing for disease prevention.',
          videoUrl: {
            en: 'https://youtu.be/SDNzBYPosT8?si=1fd__QExAVPbpgnB',
            bn: 'https://youtu.be/aoeNDQHG3F0?si=-f5wNPRTv26uD4-e',
            hi: 'https://youtu.be/9bPCBYN34xE?si=gTVRjgIK6dRKmynm'
          },
          completed: false
        },
        {
          id: 2,
          title: 'Personal Hygiene',
          type: 'article',
          duration: '10 min',
          content: `Good hygiene and sanitation prevent infections and support community health.

- Key idea: Regular behaviors (handwashing, safe food handling, clean water) reduce disease transmission.
- Handwashing: Use soap and scrub for ~20 seconds, especially before eating and after using the toilet.
- Food safety: Separate raw and cooked foods, cook to safe temperatures, and store properly.
- Household sanitation: Safe waste disposal, clean water (boil or treat if needed), and surface cleaning reduce outbreaks.
- Community actions: Promote vaccination, clean delivery practices, and hygiene education.`,
          completed: false
        }
      ]
    },
    {
      id: 5,
      title: 'Reproductive Health',
      category: 'reproductive_health',
      description: 'Family planning, pregnancy care, and reproductive health education.',
      duration: '75 min',
      difficulty: 'Intermediate',
      rating: 4.6,
      lessons: 7,
      completed: 0,
      image: '👶',
      language: ['en', 'es', 'bn', 'hi'],
      lessons: [
        {
          id: 1,
          title: 'Family Planning Basics',
          type: 'article',
          duration: '15 min',
          content: `Reproductive health covers safe conception, pregnancy, childbirth, and access to family planning and STI prevention.

- Key idea: Access to accurate information, contraception, prenatal/postnatal care, and respectful services improves outcomes.
- Preconception: Folic acid, immunization checks, and health reviews reduce risks.
- Pregnancy care: Regular antenatal visits, balanced nutrition, avoid tobacco/alcohol, and seek care for warning signs.
- Family planning & STI prevention: Offer reliable contraception and condoms; test and treat STIs when needed.
- Support: Provide youth-friendly education, maternal services, and nonjudgmental counseling.`,
          completed: false
        },
        {
          id: 2,
          title: 'Pregnancy Care',
          type: 'video',
          duration: '20 min',
          content: 'Essential care during pregnancy.',
          videoUrl: {
            en: 'https://youtu.be/FXXAF_B7vN0?si=JyRGEbTjoz9cOST1',
            bn: 'https://youtu.be/exb-WSgjQpU?si=NZsAjYlQAzp82g5b',
            hi: 'https://www.youtube.com/live/SPfv9S0zsxk?si=dPmPVPa3IQjq2Lrp'
          },
          completed: false
        }
      ]
    },
    {
      id: 6,
      title: 'First Aid Essentials',
      category: 'first_aid',
      description: 'Basic first aid techniques and emergency response.',
      duration: '90 min',
      difficulty: 'Intermediate',
      rating: 4.9,
      lessons: 8,
      completed: 0,
      image: '🩹',
      language: ['en', 'es', 'fr', 'bn', 'hi'],
      lessons: [
        {
          id: 1,
          title: 'CPR Basics',
          type: 'video',
          duration: '4 min 3 sec',
          content: 'Learn cardiopulmonary resuscitation.',
          // use direct embed URL for reliable embedding
          videoUrl: {
            en: 'https://youtu.be/hizBdM1Ob68?si=nnrJ1pUz7kvSzMKl',
            bn: 'https://youtu.be/3h5wSUrUv2o?si=Y-fXofU4XPXFeMyl',
            hi: 'https://youtu.be/IPgb0j1S4Eo?si=_wloHrgUPbxt6Gdz'
          },
          completed: false
        },
        {
          id: 2,
          title: 'Wound Care',
          type: 'article',
          duration: '12 min',
          content: `Timely first aid stabilizes people and reduces harm before professional help arrives.

- Key idea: Prioritize scene safety, call for help, then apply basic interventions.
- Severe bleeding: Apply direct pressure to control bleeding and seek urgent care.
- Burns & wounds: Cool burns with running water; clean and cover wounds and watch for signs of infection.
- CPR & emergencies: If unresponsive and not breathing, start CPR and call emergency services.
- Preparedness: Learn basic CPR/first aid, keep a stocked kit, and know emergency numbers.`,
          completed: false
        }
      ]
    }
  ];

  // Map lesson titles to YouTube IDs (used for video lessons)
  const videoIdMap = {
    'Understanding Macronutrients': 'inEPlZZ_SfA',
    'Understanding Stress': 'gmwiJ6ghLIM',
    'Warm-up and Stretching': 'j6Z8I47v9wE',
    'Strength Training': 'U0bhE67HuDY',
    'Hand Washing Techniques': 'SDNzBYPosT8',
    'Pregnancy Care': 'FXXAF_B7vN0',
    'CPR Basics': 'ewdKM9NYo1A'
  };

  const loadYouTubeAPI = () => {
    return new Promise((resolve) => {
      if (window.YT && window.YT.Player) return resolve(window.YT);
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      window.onYouTubeIframeAPIReady = () => resolve(window.YT);
      document.body.appendChild(tag);
    });
  };

  const loadVimeoAPI = () => {
    return new Promise((resolve) => {
      if (window.Vimeo && window.Vimeo.Player) return resolve(window.Vimeo);
      const tag = document.createElement('script');
      tag.src = 'https://player.vimeo.com/api/player.js';
      tag.onload = () => resolve(window.Vimeo);
      document.body.appendChild(tag);
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins} min ${secs.toString().padStart(2, '0')} sec`;
  };

  const openVideoDialog = async (module, lesson, lang) => {
    // prefer explicit lesson.videoUrl, fallback to title map
    const rawLessonUrl = lesson.videoUrl || (videoIdMap[lesson.title] ? `https://www.youtube.com/watch?v=${videoIdMap[lesson.title]}` : null);
    // resolve when lesson.videoUrl is an object keyed by language
    let lessonUrl = rawLessonUrl;
    const effectiveLang = lang || language;
    if (rawLessonUrl && typeof rawLessonUrl === 'object') {
      lessonUrl = rawLessonUrl[effectiveLang] || rawLessonUrl.en || Object.values(rawLessonUrl)[0] || null;
    }
    // if no URL, open dialog and show unavailable message so user has context
    if (!lessonUrl) {
      setSelectedModule(module);
      setSelectedLesson(lesson);
      setFallbackUrl(null);
      setVideoUnavailable(true);
      setShowVideoDialog(true);
      return;
    }

    setSelectedModule(module);
    // set displayed rating for this module
    try { setCurrentModuleRating(getAverageRating(module.id, module.rating)); } catch (e) {}
    setSelectedLesson(lesson);
    setFallbackUrl(lessonUrl);
    setVideoUnavailable(false);
    setPlayingLessonId(`${module.id}-${lesson.id}`);
    setShowVideoDialog(true);
    // if it's a YouTube URL, use the iframe API for ended event detection
    // support watch?v=, youtu.be/, and embed/ URL forms
    const ytMatch = typeof lessonUrl === 'string' ? lessonUrl.match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{6,})/) : null;
    if (ytMatch) {
      const videoId = ytMatch[1];
      setCustomVideoUrl(null);
      try {
        const YT = await loadYouTubeAPI();
        setTimeout(() => {
          try { if (ytPlayerRef.current && ytPlayerRef.current.destroy) ytPlayerRef.current.destroy(); } catch (e) {}
          ytPlayerRef.current = new YT.Player('yt-player', {
            height: '100%',
            width: '100%',
            videoId,
            playerVars: { autoplay: 1, modestbranding: 1, rel: 0, enablejsapi: 1 },
            events: {
              onReady: (e) => {
                try {
                  const duration = e.target.getDuration();
                  if (duration && !isNaN(duration)) {
                    setLessonDurations(prev => ({ ...prev, [`${module.id}-${lesson.id}`]: formatDuration(duration) }));
                  }
                } catch (err) {}
              },
              onStateChange: (e) => {
                try {
                  if (e.data === YT.PlayerState.ENDED) {
                    markLessonComplete(lesson);
                  } else if (e.data === YT.PlayerState.PAUSED) {
                    setPauseOverlayVisible(true);
                  } else if (e.data === YT.PlayerState.PLAYING) {
                    setPauseOverlayVisible(false);
                  }
                } catch (err) {}
              }
            }
          });
        }, 300);
      } catch (e) {
        console.error('YT load error', e);
        setFallbackUrl(lessonUrl);
        setVideoUnavailable(true);
      }
    } else {
      // not YouTube — render an iframe directly
      // If it's a Vimeo page URL (vimeo.com/{id}) convert to embed URL
      let embedUrl = lessonUrl;
      const vimeoMatch = lessonUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (vimeoMatch) {
        // use Vimeo Player API to detect ended
        const vimeoId = vimeoMatch[1];
        vimeoIdRef.current = vimeoId;
        setCustomVideoUrl(null);
        setFallbackUrl(lessonUrl);
        setVideoUnavailable(false);
        try { if (ytPlayerRef.current && ytPlayerRef.current.destroy) ytPlayerRef.current.destroy(); } catch (e) {}
        try {
          const Vimeo = await loadVimeoAPI();
          setTimeout(() => {
            try { if (vimeoPlayerRef.current && typeof vimeoPlayerRef.current.unload === 'function') vimeoPlayerRef.current.unload(); } catch (e) {}
            // create player in div with id 'vimeo-player'
            try {
              vimeoPlayerRef.current = new window.Vimeo.Player('vimeo-player', { id: parseInt(vimeoId, 10), autoplay: true });
              vimeoPlayerRef.current.on('ended', () => { markLessonComplete(lesson); });
              vimeoPlayerRef.current.on('play', () => setPauseOverlayVisible(false));
              vimeoPlayerRef.current.on('pause', () => setPauseOverlayVisible(true));
              // try to get duration
              vimeoPlayerRef.current.getDuration().then(d => {
                if (d) setLessonDurations(prev => ({ ...prev, [`${module.id}-${lesson.id}`]: formatDuration(d) }));
              }).catch(() => {});
            } catch (err) {}
          }, 300);
        } catch (err) {
          // fallback to iframe
          vimeoIdRef.current = null;
          setCustomVideoUrl(embedUrl);
        }
        return;
      }
      // fallback: non-vimeo iframe
      setCustomVideoUrl(embedUrl);
      setFallbackUrl(lessonUrl);
      setVideoUnavailable(false);
      // try to fetch duration via embed (not always possible); leave to manual if not
      try { if (ytPlayerRef.current && ytPlayerRef.current.destroy) ytPlayerRef.current.destroy(); } catch (e) {}
    }
  };

  const closeVideoDialog = () => {
    setShowVideoDialog(false);
    setSelectedLesson(null);
    setCustomVideoUrl(null);
    setVideoUnavailable(false);
    setFallbackUrl(null);
    setPlayingLessonId(null);
    if (ytPlayerRef.current && ytPlayerRef.current.destroy) {
      try { ytPlayerRef.current.destroy(); } catch (e) {}
      ytPlayerRef.current = null;
    }
  };

  const resumePlayback = () => {
    // resume YouTube player if available
    try {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
        ytPlayerRef.current.playVideo();
        setPauseOverlayVisible(false);
        return;
      }
    } catch (e) {}
    // fallback: if custom iframe, open the fallback URL in same dialog (can't programmatically resume cross-origin)
    setPauseOverlayVisible(false);
  };

  const categories = [
    { value: 'all', label: 'All Categories', icon: 'School' },
    { value: 'nutrition', label: 'Nutrition', icon: 'Restaurant' },
    { value: 'mental_health', label: 'Mental Health', icon: 'Psychology' },
    { value: 'fitness', label: 'Fitness', icon: 'FitnessCenter' },
    { value: 'hygiene', label: 'Hygiene', icon: 'HealthAndSafety' },
    { value: 'reproductive_health', label: 'Reproductive Health', icon: 'LocalHospital' },
    { value: 'first_aid', label: 'First Aid', icon: 'HealthAndSafety' }
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'ar', name: 'العربية' }
  ];

  // Quiz state (questions are generated per-module)
  const [quizData, setQuizData] = useState({ questions: [] });

  // Per-module quiz question pools (30 questions per module).
  // Only 15 unique questions will be selected for each quiz.
  const quizPools = {
    1: [
      { id: 1, question: 'Which of the following is a macronutrient?', options: ['Vitamin C', 'Protein', 'Iron', 'Calcium'], correct: 1 },
      { id: 2, question: 'How many glasses of water are commonly recommended daily?', options: ['2-4', '4-6', '6-8', '10+'], correct: 2 },
      { id: 3, question: 'Which food group should make up the largest portion of your plate?', options: ['Proteins', 'Vegetables', 'Grains', 'Dairy'], correct: 1 },
      { id: 4, question: 'Which nutrient helps build and repair tissues?', options: ['Fats', 'Carbohydrates', 'Protein', 'Vitamins'], correct: 2 },
      { id: 5, question: 'Which fat is considered healthier?', options: ['Trans fat', 'Saturated fat', 'Unsaturated fat', 'Hydrogenated oil'], correct: 2 },
      { id: 6, question: 'Good sources of fiber include:', options: ['Fruits and vegetables', 'Soda', 'Candy', 'White bread'], correct: 0 },
      { id: 7, question: 'Which vitamin is important for vision?', options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin B12'], correct: 0 },
      { id: 8, question: 'Which mineral is important for bone health?', options: ['Iron', 'Calcium', 'Sodium', 'Potassium'], correct: 1 },
      { id: 9, question: 'Whole grains are rich in:', options: ['Refined sugars', 'Fiber', 'Saturated fat', 'Cholesterol'], correct: 1 },
      { id: 10, question: 'A healthy snack choice is:', options: ['Chips', 'Fruit', 'Candy bar', 'Soda'], correct: 1 },
      { id: 11, question: 'Which nutrients provide energy?', options: ['Vitamins', 'Minerals', 'Macronutrients', 'Water'], correct: 2 },
      { id: 12, question: 'Which is an example of a complex carbohydrate?', options: ['White rice', 'Whole wheat bread', 'Candy', 'Soda'], correct: 1 },
      { id: 13, question: 'Omega-3 fatty acids are commonly found in:', options: ['Fish', 'Butter', 'Sausage', 'Soda'], correct: 0 },
      { id: 14, question: 'Which vitamin helps the immune system?', options: ['Vitamin C', 'Vitamin K', 'Vitamin B2', 'Vitamin B6'], correct: 0 },
      { id: 15, question: 'Excessive sugar intake can lead to:', options: ['Tooth decay', 'Improved sleep', 'Stronger bones', 'Better vision'], correct: 0 },
      { id: 16, question: 'Which food is high in protein?', options: ['Lentils', 'Apple', 'Lettuce', 'Soda'], correct: 0 },
      { id: 17, question: 'Which nutrient assists with oxygen transport in blood?', options: ['Calcium', 'Iron', 'Vitamin D', 'Magnesium'], correct: 1 },
      { id: 18, question: 'Which is a healthy cooking method?', options: ['Deep frying', 'Grilling', 'Burning', 'Over-salting'], correct: 1 },
      { id: 19, question: 'Unsweetened yogurt is a good source of:', options: ['Probiotics and protein', 'Trans fats', 'Refined sugar', 'Soda'], correct: 0 },
      { id: 20, question: 'Portion control helps with:', options: ['Weight management', 'More snacking', 'Increased sugar intake', 'None'], correct: 0 },
      { id: 21, question: 'Which beverage is best for hydration?', options: ['Water', 'Soda', 'Energy drinks', 'Sugary juice'], correct: 0 },
      { id: 22, question: 'Reading food labels can help identify:', options: ['Nutritional content', 'Color preferences', 'Package design', 'Price only'], correct: 0 },
      { id: 23, question: 'Which is a source of healthy fats?', options: ['Avocado', 'Donuts', 'Processed snack', 'Soda'], correct: 0 },
      { id: 24, question: 'Fiber primarily aids in:', options: ['Vision', 'Digestion', 'Hearing', 'Balance'], correct: 1 },
      { id: 25, question: 'Which nutrient is water-soluble?', options: ['Vitamin A', 'Vitamin C', 'Vitamin K', 'Vitamin D'], correct: 1 },
      { id: 26, question: 'Which practice supports healthy eating?', options: ['Skipping meals frequently', 'Eating balanced meals', 'Only eating late at night', 'Only drinking soda'], correct: 1 },
      { id: 27, question: 'Which is a low-sodium food choice?', options: ['Fresh vegetables', 'Canned soup', 'Processed meat', 'Fast food'], correct: 0 },
      { id: 28, question: 'Which nutrient is important during pregnancy?', options: ['Folic acid', 'Caffeine', 'Alcohol', 'Excess vitamin A'], correct: 0 },
      { id: 29, question: 'Which is a sign of dehydration?', options: ['Clear urine', 'Dark urine', 'Increased energy', 'Improved concentration'], correct: 1 },
      { id: 30, question: 'Which approach helps long-term healthy eating?', options: ['Restrictive fad diets', 'Balanced variety', 'Skipping food groups', 'Excessive supplements'], correct: 1 }
    ],
    2: [
      { id: 1, question: 'Which practice helps reduce stress?', options: ['Avoiding sleep', 'Regular exercise', 'Overworking', 'Skipping meals'], correct: 1 },
      { id: 2, question: 'A common symptom of depression is:', options: ['Increased energy', 'Persistent sadness', 'Improved appetite', 'Over-socializing'], correct: 1 },
      { id: 3, question: 'Mindfulness primarily involves:', options: ['Judging thoughts', 'Suppressing thoughts', 'Observing thoughts without judgment', 'Arguing with thoughts'], correct: 2 },
      { id: 4, question: 'Which is a healthy coping strategy for anxiety?', options: ['Alcohol use', 'Deep breathing', 'Isolation', 'Procrastination'], correct: 1 },
      { id: 5, question: 'Good sleep hygiene includes:', options: ['Using screens before bed', 'Irregular sleep times', 'Keeping a consistent sleep schedule', 'Drinking caffeine late'], correct: 2 },
      { id: 6, question: 'Which professional should you see for severe mental health concerns?', options: ['Chef', 'Psychologist', 'Mechanic', 'Accountant'], correct: 1 },
      { id: 7, question: 'Social support mainly helps by:', options: ['Increasing isolation', 'Worsening stress', 'Providing emotional resources', 'Causing conflict'], correct: 2 },
      { id: 8, question: 'Which activity promotes mental wellbeing?', options: ['Regular physical activity', 'Avoiding all social contact', 'Excessive screen time', 'Chronic sleep deprivation'], correct: 0 },
      { id: 9, question: 'Panic attacks typically include:', options: ['Calm feelings', 'Rapid heartbeat', 'Improved concentration', 'Lowered breathing rate'], correct: 1 },
      { id: 10, question: 'Which is a sign of burnout?', options: ['Increased motivation', 'Emotional exhaustion', 'Heightened joy', 'Better focus'], correct: 1 },
      { id: 11, question: 'Cognitive Behavioral Therapy focuses on:', options: ['Changing weather', 'Changing thoughts and behaviors', 'Only medication', 'Physical therapy'], correct: 1 },
      { id: 12, question: 'Which can improve mood immediately?', options: ['Skipping meals', 'Light exercise', 'Excessive alcohol', 'Isolation'], correct: 1 },
      { id: 13, question: 'Mental health stigma leads to:', options: ['More help-seeking', 'Reduced help-seeking', 'No effect', 'Improved treatment'], correct: 1 },
      { id: 14, question: 'Early intervention for mental illness is important because:', options: ['It worsens outcomes', 'It improves long-term outcomes', 'It makes no difference', 'It is unnecessary'], correct: 1 },
      { id: 15, question: 'Which is a healthy way to manage stress?', options: ['Substance use', 'Mindfulness or relaxation', 'Avoiding sleep', 'Suppressing emotions'], correct: 1 },
      { id: 16, question: 'Which is a common symptom of anxiety?', options: ['Relaxation', 'Persistent worry', 'Increased appetite', 'Sense of euphoria'], correct: 1 },
      { id: 17, question: 'Which habit supports good mental health?', options: ['Regular exercise', 'Ignoring social ties', 'Chronic overtime', 'Poor diet'], correct: 0 },
      { id: 18, question: 'Which is NOT a sign of depression?', options: ['Loss of interest', 'Persistent sadness', 'Improved concentration', 'Sleep disturbances'], correct: 2 },
      { id: 19, question: 'Which practice can reduce rumination?', options: ['Mindfulness', 'Excessive rumination', 'Staying awake', 'Overthinking'], correct: 0 },
      { id: 20, question: 'Which is effective for mild depression?', options: ['Isolation', 'Talk therapy', 'Alcohol use', 'Self-harm'], correct: 1 },
      { id: 21, question: 'Which factor supports resilience?', options: ['Strong social connections', 'Chronic stress', 'Complete isolation', 'Regular substance misuse'], correct: 0 },
      { id: 22, question: 'When someone is suicidal, you should:', options: ['Ignore them', 'Take threats seriously and seek help', 'Encourage isolation', 'Joke about it'], correct: 1 },
      { id: 23, question: 'Which nutrient deficiency can affect mood?', options: ['Iron deficiency', 'Excess water', 'Too much oxygen', 'None'], correct: 0 },
      { id: 24, question: 'Which supports emotional wellbeing?', options: ['Good sleep', 'Excess sugar', 'No exercise', 'Isolation'], correct: 0 },
      { id: 25, question: 'Which is a relaxation technique?', options: ['Deep breathing', 'Holding breath', 'Racing thoughts', 'Worrying more'], correct: 0 },
      { id: 26, question: 'Substance misuse often:', options: ['Improves mental health', 'Worsens mental health', 'Has no effect', 'Is recommended'], correct: 1 },
      { id: 27, question: 'Which professional provides talk therapy?', options: ['Psychotherapist', 'Plumber', 'Pilot', 'Chef'], correct: 0 },
      { id: 28, question: 'Setting realistic goals helps with:', options: ['Stress management', 'Increased anxiety', 'More confusion', 'Poor sleep'], correct: 0 },
      { id: 29, question: 'Gratitude practices can:', options: ['Worsen mood', 'Improve wellbeing', 'Cause illness', 'Decrease sleep'], correct: 1 },
      { id: 30, question: 'Which is an evidence-based treatment for many conditions?', options: ['Talk therapy', 'Ignoring symptoms', 'Self-medication', 'Avoiding sleep'], correct: 0 }
    ],
    3: [
      { id: 1, question: 'How many minutes of moderate exercise are recommended per week?', options: ['30', '75', '150', '300'], correct: 2 },
      { id: 2, question: 'Which exercise improves cardiovascular fitness?', options: ['Walking', 'Weightlifting only', 'Static stretching', 'Sitting'], correct: 0 },
      { id: 3, question: 'Which is a benefit of resistance training?', options: ['Reduced muscle strength', 'Improved muscle mass', 'Worse posture', 'Less endurance'], correct: 1 },
      { id: 4, question: 'Warm-up before exercise helps to:', options: ['Decrease blood flow', 'Increase injury risk', 'Prepare muscles and reduce injury risk', 'Cause immediate fatigue'], correct: 2 },
      { id: 5, question: 'Which is important for recovery?', options: ['No rest', 'Adequate sleep and nutrition', 'Skipping meals', 'Overtraining'], correct: 1 },
      { id: 6, question: 'Hydration during exercise helps to:', options: ['Reduce performance', 'Maintain performance and prevent cramps', 'Increase dizziness', 'Prevent breathing'], correct: 1 },
      { id: 7, question: 'Which helps flexibility?', options: ['Static stretching after warm-up', 'Cold showers', 'Skipping stretching', 'Sitting all day'], correct: 0 },
      { id: 8, question: 'Proper form reduces:', options: ['Effectiveness', 'Injury risk', 'Energy expenditure', 'Motivation'], correct: 1 },
      { id: 9, question: 'Cardio exercise primarily benefits the:', options: ['Bones', 'Cardiovascular system', 'Vision', 'Hearing'], correct: 1 },
      { id: 10, question: 'Progressive overload means:', options: ['Never increase load', 'Gradually increase training stimulus', 'Only decrease intensity', 'Random training'], correct: 1 },
      { id: 11, question: 'Which is a sign of overtraining?', options: ['Improved performance', 'Chronic fatigue', 'Better sleep', 'Increased appetite'], correct: 1 },
      { id: 12, question: 'Which is a safe way to lose weight?', options: ['Crash diets', 'Balanced diet and exercise', 'Starvation', 'Excessive laxatives'], correct: 1 },
      { id: 13, question: 'Which exercise improves balance?', options: ['Single-leg stands', 'Only running', 'Sitting', 'Skipping meals'], correct: 0 },
      { id: 14, question: 'Which macronutrient provides the most energy per gram?', options: ['Protein', 'Carbohydrate', 'Fat', 'Water'], correct: 2 },
      { id: 15, question: 'Which is important before heavy lifting?', options: ['Proper warm-up', 'No sleep', 'Fasting all day', 'Dehydration'], correct: 0 },
      { id: 16, question: 'Interval training alternates between:', options: ['Rest only', 'High and low intensity periods', 'Only steady pace', 'Avoiding exercise'], correct: 1 },
      { id: 17, question: 'Which is recommended post-exercise?', options: ['Refueling with protein/carbs', 'No food', 'Only alcohol', 'Skipping fluids'], correct: 0 },
      { id: 18, question: 'Which reduces injury risk?', options: ['Ignoring pain', 'Proper technique and rest', 'Training through severe pain', 'No warm-up'], correct: 1 },
      { id: 19, question: 'Which is a core muscle exercise?', options: ['Plank', 'Bicep curl', 'Leg press', 'Bench press'], correct: 0 },
      { id: 20, question: 'Which improves endurance?', options: ['Long-duration aerobic training', 'Only stretching', 'No movement', 'Chronic rest'], correct: 0 },
      { id: 21, question: 'Which helps muscle recovery?', options: ['Protein-rich meal', 'No food', 'Excess alcohol', 'No sleep'], correct: 0 },
      { id: 22, question: 'Which is a low-impact exercise?', options: ['Swimming', 'Jumping jacks', 'Running on hard surface', 'High-intensity plyometrics'], correct: 0 },
      { id: 23, question: 'Good exercise frequency for most adults is:', options: ['Every hour', '2–3 times/week strength + most days cardio', 'Once a month', 'Never'], correct: 1 },
      { id: 24, question: 'Which is important for posture?', options: ['Core strength', 'Avoiding movement', 'Sleeping less', 'Poor ergonomics'], correct: 0 },
      { id: 25, question: 'Which helps cardiovascular health?', options: ['Regular aerobic activity', 'Smoking', 'Sedentary lifestyle', 'Excessive sugar intake'], correct: 0 },
      { id: 26, question: 'When exercising, listen to your body to avoid:', options: ['Appropriate rest', 'Overuse injuries', 'Improved fitness', 'Relaxation'], correct: 1 },
      { id: 27, question: 'Which is a sign to stop exercising?', options: ['Sharp chest pain', 'Mild exertion', 'Feeling energetic', 'Slight sweat'], correct: 0 },
      { id: 28, question: 'Which supports athletic performance?', options: ['Balanced nutrition', 'Skipping meals', 'Chronic dehydration', 'Lack of sleep'], correct: 0 },
      { id: 29, question: 'Which is true about stretching?', options: ['Dynamic warm-up before activity', 'Static stretch before intense effort always', 'Never stretch', 'Stretching causes injuries'], correct: 0 },
      { id: 30, question: 'Which reduces soreness after exercise?', options: ['Active recovery', 'Complete immobility', 'Overtraining', 'Dehydration'], correct: 0 }
    ],
    4: [
      { id: 1, question: 'Hand washing with soap should last about:', options: ['5 seconds', '10 seconds', '20 seconds', '1 minute'], correct: 2 },
      { id: 2, question: 'Safe food handling includes:', options: ['Cross-contamination', 'Using same cutting board raw/cooked', 'Keeping raw and cooked separate', 'Leaving food out all day'], correct: 2 },
      { id: 3, question: 'Which helps prevent spread of infection?', options: ['Hand washing', 'Not covering coughs', 'Sharing utensils', 'Ignoring wounds'], correct: 0 },
      { id: 4, question: 'Proper tooth brushing should be done:', options: ['Once a week', 'Twice a day', 'Never', 'Only when sick'], correct: 1 },
      { id: 5, question: 'Safe water for drinking means:', options: ['Contaminated', 'Boiled or treated', 'Unknown source', 'Stagnant water'], correct: 1 },
      { id: 6, question: 'Which reduces mosquito bites?', options: ['No nets', 'Insecticide-treated nets', 'Standing water', 'Wearing shorts at night'], correct: 1 },
      { id: 7, question: 'Sanitizing surfaces helps:', options: ['Increase germs', 'Reduce pathogens', 'Make food unsafe', 'Is unnecessary'], correct: 1 },
      { id: 8, question: 'Which is good personal hygiene?', options: ['Regular bathing', 'Never washing', 'Sharing towels', 'Ignoring wounds'], correct: 0 },
      { id: 9, question: 'Food should be cooked to:', options: ['Safe internal temperatures', 'Bright color only', 'No specific temp', 'Frozen'], correct: 0 },
      { id: 10, question: 'Which prevents teeth decay?', options: ['Regular toothbrushing and reduced sugar', 'High sugar intake', 'Never cleaning teeth', 'Only water'], correct: 0 },
      { id: 11, question: 'Which reduces respiratory infection spread?', options: ['Covering coughs', 'Coughing openly', 'Sharing masks when dirty', 'Ignoring symptoms'], correct: 0 },
      { id: 12, question: 'Which is safe waste disposal?', options: ['Burning hazardous waste carelessly', 'Proper disposal and sanitation', 'Dumping in water', 'Leaving trash near homes'], correct: 1 },
      { id: 13, question: 'Which practice reduces skin infections?', options: ['Keeping wounds clean and covered', 'Ignoring wounds', 'Sharing bandages', 'Scratching sores'], correct: 0 },
      { id: 14, question: 'Which is important for menstrual hygiene?', options: ['Using clean materials and regular change', 'Using dirty cloths', 'Never changing materials', 'Hiding symptoms'], correct: 0 },
      { id: 15, question: 'Which prevents foodborne illness?', options: ['Proper storage and cooking', 'Leaving food unrefrigerated', 'Eating expired food', 'Poor hygiene'], correct: 0 },
      { id: 16, question: 'Safe water can be ensured by:', options: ['Boiling, filtering, or treatment', 'Drinking untreated water', 'Using dirty containers', 'Storing in open buckets'], correct: 0 },
      { id: 17, question: 'Which reduces dental cavities in children?', options: ['Limiting sugary snacks', 'Frequent sugary drinks', 'No brushing', 'High sugar diet'], correct: 0 },
      { id: 18, question: 'Which is true about hand sanitizers?', options: ['Effective when soap is unavailable', 'Always better than soap', 'Never useful', 'Harmful'], correct: 0 },
      { id: 19, question: 'Which is a sign of poor hygiene?', options: ['Clean clothes', 'Foul odor', 'Healthy skin', 'Good grooming'], correct: 1 },
      { id: 20, question: 'Which reduces infection risk in clinics?', options: ['Sterile technique and hand hygiene', 'No sterilization', 'Sharing needles', 'Improper disposal'], correct: 0 },
      { id: 21, question: 'Which is recommended for food handlers?', options: ['Hand washing and not working when sick', 'Working while ill', 'No handwashing', 'Poor storage'], correct: 0 },
      { id: 22, question: 'Which prevents cross-contamination?', options: ['Separate utensils for raw and cooked', 'Using same knife', 'Mixing raw and cooked', 'No cleaning'], correct: 0 },
      { id: 23, question: 'Which helps wound healing?', options: ['Cleaning and dressing wound', 'Leaving it dirty', 'Ignoring infection', 'Sharing bandages'], correct: 0 },
      { id: 24, question: 'Which is key to personal hygiene education?', options: ['Teaching handwashing and sanitation', 'Ignoring hygiene', 'Promoting dirtiness', 'Discouraging bathing'], correct: 0 },
      { id: 25, question: 'Which is a sign of dehydration?', options: ['Normal urine color', 'Dark urine and dry mouth', 'Increased urination', 'Excessive energy'], correct: 1 },
      { id: 26, question: 'Which helps prevent infections after childbirth?', options: ['Clean delivery practices', 'Dirty instruments', 'No hand hygiene', 'Poor sanitation'], correct: 0 },
      { id: 27, question: 'Which reduces spread of diarrheal disease?', options: ['Safe water and sanitation', 'Open defecation', 'Poor hand hygiene', 'Contaminated food'], correct: 0 },
      { id: 28, question: 'Which is a hygienic practice for food storage?', options: ['Refrigeration and sealed containers', 'Leaving food uncovered', 'Storing at room temp long-term', 'Using dirty containers'], correct: 0 },
      { id: 29, question: 'Which protects newborns from infection?', options: ['Clean cord care', 'Dirty instruments', 'No breastfeeding', 'Poor hygiene'], correct: 0 },
      { id: 30, question: 'Which is a basic sanitation measure?', options: ['Safe excreta disposal', 'Open dumping', 'Water contamination', 'No toilets'], correct: 0 }
    ],
    5: [
      { id: 1, question: 'Folic acid is important during which period?', options: ['Pregnancy', 'Old age', 'Infancy', 'None'], correct: 0 },
      { id: 2, question: 'Which is a reliable contraceptive method?', options: ['Barrier methods, hormonal methods, IUDs', 'Ignoring pregnancy risk', 'Only herbal remedies', 'None'], correct: 0 },
      { id: 3, question: 'Prenatal care helps by:', options: ['Monitoring mother and baby health', 'Increasing risk', 'Causing complications', 'No benefit'], correct: 0 },
      { id: 4, question: 'Which helps a healthy pregnancy?', options: ['Balanced diet and supplements', 'Smoking', 'Alcohol use', 'Poor nutrition'], correct: 0 },
      { id: 5, question: 'Which symptom needs immediate prenatal attention?', options: ['Severe bleeding or severe pain', 'Mild tiredness', 'Occasional thirst', 'Normal movement'], correct: 0 },
      { id: 6, question: 'Breastfeeding benefits include:', options: ['Nutrition and immunity for baby', 'No benefit', 'Harmful effects', 'None'], correct: 0 },
      { id: 7, question: 'Which protects against sexually transmitted infections?', options: ['Consistent condom use', 'No protection', 'Only pills', 'None'], correct: 0 },
      { id: 8, question: 'Which is a common sign of pregnancy?', options: ['Missed period and nausea', 'Improved vision', 'Instant weight loss', 'Better hearing'], correct: 0 },
      { id: 9, question: 'Which vaccine is important before pregnancy?', options: ['Rubella immunity', 'None', 'Random vaccine', 'No vaccine ever'], correct: 0 },
      { id: 10, question: 'Which helps plan a healthy family?', options: ['Access to family planning services', 'Avoiding care', 'No contraception', 'Random decisions'], correct: 0 },
      { id: 11, question: 'Postnatal care should include:', options: ['Monitoring mother and newborn', 'Ignoring infection signs', 'No care', 'None'], correct: 0 },
      { id: 12, question: 'Which increases risk during pregnancy?', options: ['Smoking and alcohol', 'Healthy diet', 'Prenatal care', 'Exercise appropriately'], correct: 0 },
      { id: 13, question: 'Which method prevents pregnancy immediately after intercourse?', options: ['Emergency contraception', 'Regular diet', 'No action', 'Exercise'], correct: 0 },
      { id: 14, question: 'Which helps during labor?', options: ['Skilled birth attendant', 'Untrained helper', 'No assistance', 'Unsafe practice'], correct: 0 },
      { id: 15, question: 'Which is important for reproductive health education?', options: ['Accurate information and access to services', 'Misinformation', 'Ignoring youth', 'None'], correct: 0 },
      { id: 16, question: 'Which STI can be prevented by vaccine?', options: ['HPV', 'HIV', 'Gonorrhea', 'Chlamydia'], correct: 0 },
      { id: 17, question: 'Which symptom should prompt STI testing?', options: ['Unusual discharge or pain', 'No symptoms at all', 'Feeling fine always', 'None'], correct: 0 },
      { id: 18, question: 'Which contraceptive is long-acting?', options: ['IUD', 'Condom', 'Spermicide', 'None'], correct: 0 },
      { id: 19, question: 'Which supports sexual and reproductive rights?', options: ['Access to information and services', 'Denial of services', 'Coercion', 'Abuse'], correct: 0 },
      { id: 20, question: 'Which is a safe pregnancy practice?', options: ['Regular antenatal check-ups', 'Skipping check-ups', 'Smoking', 'Alcohol use'], correct: 0 },
      { id: 21, question: 'Which helps prevent mother-to-child transmission of HIV?', options: ['Appropriate antiretroviral therapy', 'No treatment', 'Ignoring status', 'None'], correct: 0 },
      { id: 22, question: 'Which is important for adolescent reproductive health?', options: ['Comprehensive education', 'No education', 'Misinformation', 'None'], correct: 0 },
      { id: 23, question: 'Which is a sign of complication in pregnancy?', options: ['Severe headache and visual changes', 'Mild tiredness', 'Normal appetite', 'Occasional discomfort'], correct: 0 },
      { id: 24, question: 'Which supports safe childbirth?', options: ['Skilled attendant and clean facility', 'Unskilled home delivery always', 'No care', 'Unsafe practice'], correct: 0 },
      { id: 25, question: 'Which is recommended before conception?', options: ['Preconception counseling and folic acid', 'No care', 'Excess alcohol', 'Smoking'], correct: 0 },
      { id: 26, question: 'Which is a female contraceptive method?', options: ['Pill, IUD, implant, injection', 'Only male methods', 'None', 'Random methods'], correct: 0 },
      { id: 27, question: 'Which supports healthy newborns?', options: ['Early and exclusive breastfeeding', 'No feeding', 'Contaminated feeding', 'None'], correct: 0 },
      { id: 28, question: 'Which helps prevent unintended pregnancy?', options: ['Access to contraception', 'No information', 'Forced choices', 'None'], correct: 0 },
      { id: 29, question: 'Which is important for safe abortion care?', options: ['Access to safe services and counseling', 'Unsafe providers', 'No counseling', 'None'], correct: 0 },
      { id: 30, question: 'Which helps reproductive health across the life course?', options: ['Education, services, and respect for rights', 'No services', 'Stigma', 'None'], correct: 0 }
    ],
    6: [
      { id: 1, question: 'What is the first step in basic first aid for bleeding?', options: ['Apply pressure to the wound', 'Ignore it', 'Rub it', 'Leave it open'], correct: 0 },
      { id: 2, question: 'For a suspected broken bone, you should:', options: ['Immobilize the area and seek care', 'Move it forcefully', 'Ignore and walk', 'Try to set the bone yourself'], correct: 0 },
      { id: 3, question: 'CPR for adults focuses on:', options: ['Chest compressions and rescue breaths', 'Only shouting', 'Only running', 'No action'], correct: 0 },
      { id: 4, question: 'If someone is choking but can cough, you should:', options: ['Encourage coughing and monitor', 'Perform blind finger sweep', 'Do nothing', 'Hit them hard'], correct: 0 },
      { id: 5, question: 'Which is important for burn first aid?', options: ['Cool with running water', 'Apply ice directly', 'Cover with butter', 'Expose to heat'], correct: 0 },
      { id: 6, question: 'When dealing with an unconscious person, first check:', options: ['Responsiveness and breathing', 'Phone battery', 'Their food', 'Their clothing fashion'], correct: 0 },
      { id: 7, question: 'Which is a sign of a severe allergic reaction?', options: ['Difficulty breathing and swelling', 'Feeling hungry', 'Better mood', 'No reaction'], correct: 0 },
      { id: 8, question: 'If a person is having a seizure, you should:', options: ['Protect them from injury and do not restrain', 'Put something in their mouth', 'Hold them down tightly', 'Leave them unattended'], correct: 0 },
      { id: 9, question: 'For a nosebleed, you should:', options: ['Lean forward and pinch the nose', 'Lean back and tilt head', 'Lie flat', 'Tilt head back'], correct: 0 },
      { id: 10, question: 'If someone is poisoned, you should:', options: ['Call emergency services or poison center', 'Give them random antidote', 'Make them vomit always', 'Ignore it'], correct: 0 },
      { id: 11, question: 'For an eye injury, you should:', options: ['Rinse with clean water and seek care', 'Rub the eye', 'Apply creams without advice', 'Ignore it'], correct: 0 },
      { id: 12, question: 'If a person is not breathing, do:', options: ['Start CPR immediately', 'Wait for 10 minutes', 'Only call later', 'Do nothing'], correct: 0 },
      { id: 13, question: 'Which helps prevent infection in wounds?', options: ['Clean and cover wound', 'Leave wound dirty', 'Share bandages', 'Ignore signs of infection'], correct: 0 },
      { id: 14, question: 'If someone has chest pain and shortness of breath, you should:', options: ['Seek emergency medical care', 'Assume it is nothing', 'Give alcohol', 'Make them exercise'], correct: 0 },
      { id: 15, question: 'For heat exhaustion, treatment includes:', options: ['Move to cool place and hydrate', 'Expose to more heat', 'Ignore and keep working', 'Give hot drinks'], correct: 0 },
      { id: 16, question: 'Which is important when applying a tourniquet?', options: ['Use only if severe life-threatening bleeding and trained', 'Always use for any cut', 'Never use', 'Use randomly'], correct: 0 },
      { id: 17, question: 'For insect bites with allergic reaction, you should:', options: ['Seek medical care if severe', 'Ignore always', 'Apply unknown substances', 'Expose to sun'], correct: 0 },
      { id: 18, question: 'Which is a sign of shock?', options: ['Pale, clammy skin and rapid pulse', 'Warm dry skin', 'Good color', 'Energetic movement'], correct: 0 },
      { id: 19, question: 'If someone is choking and cannot breathe, you should:', options: ['Perform abdominal thrusts (Heimlich) if trained', 'Do nothing', 'Only wait', 'Give water'], correct: 0 },
      { id: 20, question: 'When managing a fracture, avoid:', options: ['Moving the limb unnecessarily', 'Stabilizing it', 'Seeking care', 'Immobilizing properly'], correct: 0 },
      { id: 21, question: 'Which is correct for mild hypothermia?', options: ['Warm the person slowly and seek care', 'Throw them in cold water', 'Expose to wind', 'No action'], correct: 0 },
      { id: 22, question: 'For burns, you should NOT do:', options: ['Apply ice directly or butter', 'Cool with water', 'Cover loosely', 'Seek medical care if severe'], correct: 0 },
      { id: 23, question: 'If someone is bleeding heavily, first:', options: ['Apply direct pressure', 'Walk away', 'Remove dressing and leave', 'Wave hands'], correct: 0 },
      { id: 24, question: 'Which safe action for chemical splash to eyes?', options: ['Rinse with clean water for 15+ minutes and seek help', 'Rinse briefly and stop', 'Rub eyes', 'Use oil'], correct: 0 },
      { id: 25, question: 'If a person is unconscious but breathing, place them in:', options: ['Recovery position', 'Face down', 'Hanging position', 'Upright while standing'], correct: 0 },
      { id: 26, question: 'Which is important in responding to an emergency?', options: ['Ensure scene safety first', 'Rush in without checking', 'Ignore danger', 'Do nothing'], correct: 0 },
      { id: 27, question: 'For suspected spinal injury, avoid:', options: ['Moving the person unless necessary', 'Stabilizing the head and neck', 'Calling emergency services', 'Keeping still'], correct: 0 },
      { id: 28, question: 'Which helps prevent infection from animal bites?', options: ['Clean wound and seek medical advice', 'Ignore the bite', 'Use unclean tools', 'Share wound care'], correct: 0 },
      { id: 29, question: 'If someone is having a diabetic emergency, check for:', options: ['Glucose level and give sugar if low', 'Ignore sugar', 'Only water', 'Assume normal'], correct: 0 },
      { id: 30, question: 'When in doubt during a medical emergency, you should:', options: ['Call emergency services', 'Do nothing', 'Wait hours', 'Ignore'], correct: 0 }
    ]
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleModuleSelect = (module) => {
    setSelectedModule(module);
  };

  const handleLessonSelect = (lesson) => {
    // If it's a video, open the video player. If it's a quiz contest, start quiz for the module. Otherwise open content dialog
    if (lesson.type === 'video') {
      openVideoDialog(selectedModule, lesson);
      return;
    }
    if (lesson.type === 'quiz_contest') {
      // start quiz for the selected module
      handleStartQuiz(selectedModule, lesson);
      return;
    }
    setSelectedLesson(lesson);
    setShowLessonContentDialog(true);
  };

  const markLessonComplete = (lesson) => {
    if (!selectedModule || !lesson) return;
    setUserProgress(prev => ({
      ...prev,
      [`${selectedModule.id}-${lesson.id}`]: true
    }));
    showSuccess('Lesson marked as completed');
    try {
      if (lesson.type === 'video') {
        // prompt user to rate the module after completing a video
        setRatingValueInput(null);
        setShowRatingPrompt(true);
      }
    } catch (e) {}
  };

  const handleBookmark = (moduleId) => {
    const newBookmarks = new Set(bookmarkedModules);
    if (newBookmarks.has(moduleId)) {
      newBookmarks.delete(moduleId);
    } else {
      newBookmarks.add(moduleId);
    }
    setBookmarkedModules(newBookmarks);
    showSuccess(newBookmarks.has(moduleId) ? 'Module bookmarked' : 'Bookmark removed');
  };

  const handleShare = async (module) => {
    try {
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share({
          title: `${module.title} - Care Buddy Health Education`,
          text: module.description,
          url: `${window.location.origin}/education?module=${module.id}`,
        });
        showSuccess('Module shared successfully!');
      } else {
        // Fallback: copy to clipboard
        const shareText = `${module.title}\n\n${module.description}\n\nLearn more at: ${window.location.origin}/education?module=${module.id}`;
        await navigator.clipboard.writeText(shareText);
        showSuccess('Module link copied to clipboard!');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Fallback to clipboard if Web Share API fails
        try {
          const shareText = `${module.title}\n\n${module.description}\n\nLearn more at: ${window.location.origin}/education?module=${module.id}`;
          await navigator.clipboard.writeText(shareText);
          showSuccess('Module link copied to clipboard!');
        } catch (clipboardError) {
          showError('Failed to share module');
        }
      }
    }
  };

  const shuffleArray = (arr) => arr.slice().sort(() => Math.random() - 0.5);

  const handleStartQuiz = (module, lesson) => {
    if (!module) return showError('Module not specified for quiz');
    // Ensure module/lesson context is set so we can mark the lesson complete after quiz
    setSelectedModule(module);
    if (lesson) {
      setSelectedLesson(lesson);
    } else {
      const quizLesson = module.lessons && module.lessons.find(l => l.type === 'quiz_contest' || l.type === 'quiz');
      setSelectedLesson(quizLesson || null);
    }
    const pool = quizPools[module.id] || [];
    let questions = [];
    // sample WITHOUT replacement: shuffle pool and take up to 15 unique questions
    if (pool.length > 0) {
      const shuffled = shuffleArray(pool);
      const take = Math.min(15, shuffled.length);
      questions = shuffled.slice(0, take).map((q, idx) => ({ ...q, id: `${q.id}-${idx}` }));
    }
    // If pool has fewer than 15 unique questions, fill remaining with placeholders
    while (questions.length < 15) {
      const idx = questions.length + 1;
      questions.push({ id: `p-${idx}`, question: `Placeholder question ${idx}`, options: ['A', 'B', 'C', 'D'], correct: 0 });
    }
    setQuizData({ questions });
    setQuizAnswers({});
    setQuizScore(null);
    setShowQuiz(true);
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    quizData.questions.forEach((question, index) => {
      if (quizAnswers[index] === question.correct) {
        correct++;
      }
    });
    const score = (correct / quizData.questions.length) * 100;
    setQuizScore(score);
    showSuccess(`Quiz completed! Score: ${score.toFixed(0)}%`);
    // Mark the related lesson as complete (if we have context)
    try {
      if (selectedLesson) {
        markLessonComplete(selectedLesson);
      }
    } catch (e) {}
    // If user scored >=75%, enable certificate action
    if (score >= 75) {
      // store a record to userProgressCertificates for later access
      try {
        const key = `cert-${selectedModule?.id}`;
        const existing = JSON.parse(localStorage.getItem('educationCertificates') || '{}');
        existing[key] = { moduleId: selectedModule?.id, moduleTitle: selectedModule?.title, score: Math.round(score), date: new Date().toISOString() };
        localStorage.setItem('educationCertificates', JSON.stringify(existing));
      } catch (e) {}
    }
  };

  const handleDownloadCertificate = (module) => {
    // prefer passed module to avoid relying on async state updates
    const mod = module || selectedModule;
    if (!mod) return showError('No module selected for certificate');
    try {
      const existing = JSON.parse(localStorage.getItem('educationCertificates') || '{}');
      const key = `cert-${mod.id}`;
      const cert = existing[key];
      if (!cert) return showError('Your score is less than 75% — you must score 75% or higher to earn a certificate.');
      if (cert.score < 75) return showError('Your score is less than 75% — you must score 75% or higher to earn a certificate.');
      // Generate certificate HTML with embedded logo path
      const participant = (user && (user.name || user.email)) || 'Participant';
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Certificate</title><style>body{font-family:Arial,sans-serif;text-align:center;padding:40px} .cert{border:8px solid #4caf50;padding:40px} .logo{width:120px;margin-bottom:20px} .title{font-size:28px;font-weight:bold;margin-bottom:10px}.subtitle{font-size:18px;color:#555;margin-bottom:30px}.name{font-size:22px;font-weight:600;margin-bottom:10px}.meta{margin-top:30px;font-size:14px;color:#333}</style></head><body><div class="cert"><img class="logo" src="/certificate-logo.png" onerror="this.style.display='none'"/><div class="title">Certificate of Completion</div><div class="subtitle">This certifies that</div><div class="name">${participant}</div><div class="subtitle">has successfully completed the module</div><div style="font-size:20px;font-weight:600;margin:12px 0;">${cert.moduleTitle}</div><div class="subtitle">with a score of</div><div style="font-size:20px;font-weight:600;margin:12px 0;">${cert.score}%</div><div class="meta">Date: ${new Date(cert.date).toLocaleDateString()}</div></div></body></html>`;
      const win = window.open('', '_blank');
      if (!win) return showError('Unable to open certificate window — check popup blocker');
      win.document.write(html);
      win.document.close();
      setTimeout(() => { try { win.print(); } catch (e) {} }, 500);
    } catch (e) {
      showError('Could not generate certificate');
    }
  };

  const getModuleProgress = (module) => {
    const completedLessons = module.lessons.filter(lesson => 
      userProgress[`${module.id}-${lesson.id}`]
    ).length;
    return (completedLessons / module.lessons.length) * 100;
  };

  const filteredModules = educationModules.filter(module => {
    const matchesSearch = module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         module.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || module.category === selectedCategory;
    const matchesLanguage = module.language && Array.isArray(module.language) ? module.language.includes(language) : true;
    const progress = getModuleProgress(module);
    let matchesTab = true;
    if (activeTab === 1) {
      matchesTab = progress > 0 && progress < 100; // In Progress
    } else if (activeTab === 2) {
      matchesTab = progress >= 100; // Completed
    } else if (activeTab === 3) {
      matchesTab = bookmarkedModules.has(module.id); // Bookmarked
    }
    return matchesSearch && matchesCategory && matchesLanguage && matchesTab;
  });

  const getCategoryIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat ? cat.icon : 'School';
  };

  const getIconComponent = (iconName) => {
    const iconMap = {
      School,
      Restaurant,
      Psychology,
      FitnessCenter,
      HealthAndSafety,
      LocalHospital
    };
    return iconMap[iconName] || School;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'success';
      case 'Intermediate': return 'warning';
      case 'Advanced': return 'error';
      default: return 'default';
    }
  };

  const renderModuleCard = (module) => {
    const progress = getModuleProgress(module);
    const isBookmarked = bookmarkedModules.has(module.id);

    return (
      <Card key={module.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ mr: 2, fontSize: '2rem' }}>{module.image}</Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {module.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {/* if no ratings, show empty stars (value=0) */}
                <Rating value={getRatingCount(module.id) === 0 ? 0 : getAverageRating(module.id, module.rating)} readOnly size="small" />
                <Typography variant="body2" color="text.secondary">
                  {getRatingCount(module.id) === 0 ? '(0 . 0 rating)' : `(${getAverageRating(module.id, module.rating)} • ${getRatingCount(module.id)} ratings)`}
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={() => handleBookmark(module.id)}>
              {isBookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {module.description}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            <Chip 
              icon={<Timer />} 
              label={module.duration} 
              size="small" 
              variant="outlined" 
            />
            <Chip 
              label={module.difficulty} 
              size="small" 
              color={getDifficultyColor(module.difficulty)}
            />
            <Chip 
              icon={<Assignment />} 
              label={`${module.lessons.length} lessons`} 
              size="small" 
              variant="outlined" 
            />
          </Box>

          {progress > 0 && (
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round(progress)}%
                </Typography>
              </Box>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          )}
        </CardContent>

        <CardActions>
          <Button 
            size="small" 
            onClick={() => handleModuleSelect(module)}
            startIcon={<PlayArrow />}
          >
            Start Learning
          </Button>
          <Box sx={{ ml: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating
              name={`rate-module-${module.id}`}
              value={getAverageRating(module.id, module.rating)}
              precision={1}
              onChange={(_, value) => submitModuleRating(module.id, value)}
              size="small"
            />
          </Box>
          <Button 
            size="small" 
            variant="outlined"
            startIcon={<Share />}
            onClick={() => handleShare(module)}
          >
            Share
          </Button>
        </CardActions>
      </Card>
    );
  };

  const renderLessonItem = (lesson) => {
    const isCompleted = userProgress[`${selectedModule.id}-${lesson.id}`];
    const thisLessonKey = `${selectedModule.id}-${lesson.id}`;
    const displayDuration = lessonDurations[thisLessonKey] || lesson.duration;
    const isPlayingNow = playingLessonId && playingLessonId !== thisLessonKey;
    
    return (
      <ListItem 
        key={lesson.id} 
        button 
        onClick={() => handleLessonSelect(lesson)}
        sx={{ 
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          mb: 1,
          '&:hover': { backgroundColor: 'action.hover' }
        }}
      >
        <ListItemIcon>
          {isCompleted ? (
            <CheckCircle color="success" />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {lesson.type === 'video' && <VideoLibrary />}
              {lesson.type === 'quiz_contest' && <Quiz />}
              {lesson.type === 'article' && <Article />}
              {lesson.type === 'quiz' && <Quiz />}
              {lesson.type === 'article' && <Article />}
              {lesson.type === 'quiz' && <Quiz />}
            </Box>
          )}
        </ListItemIcon>
        <ListItemText
          primary={lesson.title}
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                {displayDuration}
              </Typography>
              <Chip label={lesson.type} size="small" variant="outlined" />
              {lesson.type === 'video' && (
                (!isPlayingNow ? (
                  <Box sx={{ display: 'flex', gap: 1 }} onClick={(e) => e.stopPropagation()}>
                    <Button size="small" onClick={() => openVideoDialog(selectedModule, lesson, 'en')}>Watch</Button>
                    <Button size="small" onClick={() => openVideoDialog(selectedModule, lesson, 'bn')}>বাংলায় দেখুন</Button>
                    <Button size="small" onClick={() => openVideoDialog(selectedModule, lesson, 'hi')}>हिंदी में देखें</Button>
                  </Box>
                ) : null)
              )}
            </Box>
          }
        />
        {isCompleted && (
          <Chip label="Completed" size="small" color="success" />
        )}
      </ListItem>
    );
  };

  const renderQuiz = () => (
    <Dialog open={showQuiz} onClose={() => setShowQuiz(false)} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Quiz />
          <Typography variant="h6">Nutrition Quiz</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {selectedLesson?.type === 'video' ? (
          <Box>
            <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 1, overflow: 'hidden', mb: 2 }}>
              <iframe
                title={selectedLesson.title}
                src={(() => {
                  const map = {
                    'Understanding Macronutrients': 'S3bWzP0a6c0',
                    'Understanding Stress': 'gmwiJ6ghLIM',
                    'Warm-up and Stretching': 'j6Z8I47v9wE',
                    'Strength Training': 'U0bhE67HuDY',
                    'Hand Washing Techniques': 'd914EnpU4Fo',
                    'Pregnancy Care': 'hqkP6RB3WQw',
                    'CPR Basics': 'hizBdM1Ob68',
                  };
                  const id = map[selectedLesson.title] || 'dQw4w9WgXcQ';
                  return `https://www.youtube.com/embed/${id}`;
                })()}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            </Box>
            {/* completion is automatic after full video playback; no manual button */}
          </Box>
        ) : quizScore === null ? (
          <Box>
            {quizData.questions.map((question, index) => (
              <Box key={question.id} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Question {index + 1}: {question.question}
                </Typography>
                <FormControl component="fieldset" fullWidth>
                  {question.options.map((option, optionIndex) => (
                    <Button
                      key={optionIndex}
                      variant={quizAnswers[index] === optionIndex ? "contained" : "outlined"}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [index]: optionIndex }))}
                      sx={{ 
                        mb: 1, 
                        justifyContent: 'flex-start',
                        textTransform: 'none'
                      }}
                      fullWidth
                    >
                      {option}
                    </Button>
                  ))}
                </FormControl>
              </Box>
            ))}
          </Box>
        ) : (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <EmojiEvents sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
            <Typography variant="h4" gutterBottom>
              Quiz Complete!
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              Score: {quizScore.toFixed(0)}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {quizScore >= 80 ? 'Excellent! You have a great understanding of nutrition.' :
               quizScore >= 60 ? 'Good job! Keep learning to improve your knowledge.' :
               'Keep studying! Review the material and try again.'}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {quizScore === null ? (
          <>
            <Button onClick={() => setShowQuiz(false)}>Cancel</Button>
            <Button 
              onClick={handleQuizSubmit} 
              variant="contained"
              disabled={Object.keys(quizAnswers).length < quizData.questions.length}
            >
              Submit Quiz
            </Button>
          </>
        ) : (
          <Button onClick={() => setShowQuiz(false)} variant="contained">
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="xl">
      <Box sx={{ 
        py: 3,
        position: 'relative',
      }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Health Education Hub
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Interactive learning modules for better health and wellness. Track your progress and earn certificates.
          </Typography>

          {/* Search and Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <School sx={{ mr: 1, color: 'text.secondary' }} />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  {categories.map((category) => {
                    const IconComponent = getIconComponent(category.icon);
                    return (
                      <MenuItem key={category.value} value={category.value}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <IconComponent />
                          {category.label}
                        </Box>
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Language</InputLabel>
                <Select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  label="Language"
                >
                  {languages.map((lang) => (
                    <MenuItem key={lang.code} value={lang.code}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Language />
                        {lang.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Main Content */}
        <Grid container spacing={3}>
          {/* Modules List */}
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3 }}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={activeTab} onChange={handleTabChange}>
                  <Tab label="All Modules" />
                  <Tab label="In Progress" />
                  <Tab label="Completed" />
                  <Tab label="Bookmarked" />
                </Tabs>
              </Box>

              <Grid container spacing={3}>
                {filteredModules.map(renderModuleCard)}
              </Grid>

              {filteredModules.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <School sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No modules found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search or filter criteria.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ position: 'sticky', top: 20 }}>
              {/* Progress Summary */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Your Progress
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Modules Completed</Typography>
                    <Typography variant="body2" color="primary">
                      {Object.keys(userProgress).length}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={(Object.keys(userProgress).length / (educationModules.length * 3)) * 100} 
                  />
                </Box>
                <Button variant="outlined" fullWidth startIcon={<TrendingUp />} onClick={() => setShowReport(true)}>
                  View Progress Report
                </Button>
              </Paper>

              {/* Quick Actions */}
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <List dense>
                  <ListItem button onClick={() => setShowSchedule(true)}>
                    <ListItemIcon><CalendarToday /></ListItemIcon>
                    <ListItemText primary="Learning Schedule" />
                  </ListItem>
                  <ListItem button onClick={() => setShowCertificates(true)}>
                    <ListItemIcon><EmojiEvents /></ListItemIcon>
                    <ListItemText primary="Certificates" />
                  </ListItem>
                  {/* Study Groups removed */}
                </List>
              </Paper>

              
            </Box>
          </Grid>
        </Grid>

        {/* Module Detail Dialog */}
        {selectedModule && (
          <Dialog 
            open={!!selectedModule} 
            onClose={() => setSelectedModule(null)} 
            maxWidth="md" 
            fullWidth
          >
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ fontSize: '2rem' }}>{selectedModule.image}</Avatar>
                <Box>
                  <Typography variant="h6">{selectedModule.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedModule.description}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <Chip icon={<Timer />} label={selectedModule.duration} />
                  <Chip label={selectedModule.difficulty} color={getDifficultyColor(selectedModule.difficulty)} />
                  <Chip icon={<Assignment />} label={`${selectedModule.lessons.length} lessons`} />
                </Box>
                <Typography variant="body1">
                  This module contains {selectedModule.lessons.length} lessons covering various aspects of {selectedModule.title.toLowerCase()}.
                  Complete all lessons to earn your certificate.
                </Typography>
              </Box>

              <Typography variant="h6" gutterBottom>
                Lessons
              </Typography>
              <List>
                {selectedModule.lessons.map(renderLessonItem)}
              </List>

              {/* If module has interactive lessons, surface Quiz button */}
              {selectedModule && selectedModule.lessons.some(l => l.type === 'quiz_contest') && (
                <Box sx={{ mt: 3 }}>
                  <Button 
                    variant="contained" 
                    onClick={() => handleStartQuiz(selectedModule)}
                    startIcon={<Quiz />}
                    fullWidth
                  >
                    Take Quiz
                  </Button>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedModule(null)}>Close</Button>
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={() => handleShare(selectedModule)}
              >
                Share Module
              </Button>
              <Button
                variant="contained"
                startIcon={<Download />}
                disabled={getModuleProgress(selectedModule) < 100}
              >
                {getModuleProgress(selectedModule) < 100 ? 'Complete all lessons to download' : 'Download Certificate'}
              </Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Video Dialog */}
        <Dialog open={showVideoDialog} onClose={closeVideoDialog} maxWidth="md" fullWidth>
          <DialogTitle>{selectedLesson ? selectedLesson.title : 'Video'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              <Box sx={{ position: 'relative', paddingTop: '56.25%', borderRadius: 1, overflow: 'hidden' }}>
                {videoUnavailable ? (
                  <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.paper' }}>
                    <Typography color="error">Video not available</Typography>
                  </Box>
                ) : customVideoUrl ? (
                  <iframe
                    title={selectedLesson?.title || 'video'}
                    src={customVideoUrl}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                    <div id="yt-player" style={{ width: '100%', height: '100%' }} />
                    {/* pause overlay */}
                    {pauseOverlayVisible && (
                      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <Typography variant="h6" color="text.secondary">Paused</Typography>
                      </Box>
                    )}
                  </div>
                )}
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Box>
                  {videoUnavailable && fallbackUrl && (
                    <Button variant="outlined" onClick={() => window.open(fallbackUrl, '_blank')}>Open in new tab</Button>
                  )}
                </Box>
                {/* completion is automatic after full video playback; no manual button */}
              </Box>
              {showRatingPrompt && selectedModule && (
                <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="subtitle1">Rate this module:</Typography>
                  <Rating
                    name="post-video-rating"
                    value={ratingValueInput || getAverageRating(selectedModule.id, selectedModule.rating)}
                    onChange={(_, val) => setRatingValueInput(val)}
                  />
                  <Button
                    variant="contained"
                    onClick={() => {
                      if (ratingValueInput) submitModuleRating(selectedModule.id, ratingValueInput);
                      setShowRatingPrompt(false);
                    }}
                  >
                    Submit
                  </Button>
                  <Button variant="text" onClick={() => setShowRatingPrompt(false)}>Skip</Button>
                </Box>
              )}
            </Box>
          </DialogContent>
        </Dialog>

        {/* Lesson Content Dialog (article / interactive) */}
        <Dialog open={showLessonContentDialog} onClose={() => setShowLessonContentDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>{selectedLesson ? selectedLesson.title : 'Lesson'}</DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 2 }}>
              {selectedLesson?.type === 'article' && articlesForLessons[selectedLesson.title] ? (
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button variant={articleLang === 'en' ? 'contained' : 'outlined'} onClick={() => setArticleLang('en')}>English</Button>
                    <Button variant={articleLang === 'bn' ? 'contained' : 'outlined'} onClick={() => setArticleLang('bn')}>বাংলা</Button>
                    <Button variant={articleLang === 'hi' ? 'contained' : 'outlined'} onClick={() => setArticleLang('hi')}>हिन्दी</Button>
                  </Box>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                    {articlesForLessons[selectedLesson.title]?.[mapUiLangToKey(articleLang)] || selectedLesson?.content || 'No content available for this lesson.'}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedLesson?.content || 'No content available for this lesson.'}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button variant="contained" onClick={() => { markLessonComplete(selectedLesson); setShowLessonContentDialog(false); }} startIcon={<CheckCircle />}>Mark as Complete</Button>
                <Button variant="outlined" onClick={() => setShowLessonContentDialog(false)}>Close</Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Quiz Dialog */}
        {renderQuiz()}

        {/* Progress Report Dialog */}
        <Dialog open={showReport} onClose={() => setShowReport(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingUp />
              <Typography variant="h6">Progress Report</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            {(() => {
              const report = computeReportData();
              return (
                <Box>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>Overall</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}><Typography variant="body2">Modules: {report.overall.totalModules}</Typography></Grid>
                      <Grid item xs={6} md={3}><Typography variant="body2">Lessons: {report.overall.totalLessons}</Typography></Grid>
                      <Grid item xs={6} md={3}><Typography variant="body2">Completed Lessons: {report.overall.completedLessons}</Typography></Grid>
                      <Grid item xs={6} md={3}><Typography variant="body2">Completed Modules: {report.overall.completedModules}</Typography></Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" gutterBottom>Overall Progress</Typography>
                      <LinearProgress variant="determinate" value={report.overall.overallProgress} />
                      <Typography variant="caption" color="text.secondary">{report.overall.overallProgress}%</Typography>
                    </Box>
                  </Paper>
                  <Typography variant="subtitle1" gutterBottom>By Module</Typography>
                  <List>
                    {report.modules.map(m => (
                      <ListItem key={m.id}>
                        <ListItemText
                          primary={m.title}
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                {m.completedLessons} / {m.totalLessons} lessons
                              </Typography>
                              <LinearProgress variant="determinate" value={m.progress} />
                            </Box>
                          }
                        />
                        <Chip label={`${m.progress}%`} size="small" />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              );
            })()}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleExportReport} variant="outlined" startIcon={<Download />}>Export JSON</Button>
            <Button onClick={() => setShowReport(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Certificates Dialog */}
        <Dialog open={showCertificates} onClose={() => setShowCertificates(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EmojiEvents />
              <Typography variant="h6">Certificates</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <List>
              {educationModules
                .filter(m => getModuleProgress(m) >= 100)
                .map(m => (
                  <ListItem key={m.id} secondaryAction={
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={() => handleDownloadCertificate(m)}
                    >
                      Download
                    </Button>
                  }>
                    <ListItemIcon><EmojiEvents color="warning" /></ListItemIcon>
                    <ListItemText primary={m.title} secondary="Completed" />
                  </ListItem>
                ))}
              {educationModules.filter(m => getModuleProgress(m) >= 100).length === 0 && (
                <Typography variant="body2" color="text.secondary">No certificates yet. Complete modules to earn certificates.</Typography>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCertificates(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Schedule Dialog */}
        <Dialog open={showSchedule} onClose={() => setShowSchedule(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarToday />
              <Typography variant="h6">Learning Schedule</Typography>
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Module</InputLabel>
                <Select
                  label="Module"
                  value={scheduleForm.moduleId}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, moduleId: e.target.value }))}
                >
                  {educationModules.map(m => (
                    <MenuItem key={m.id} value={m.id}>{m.title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                type="date"
                label="Date"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.date}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, date: e.target.value }))}
              />
              <TextField
                type="time"
                label="Time"
                InputLabelProps={{ shrink: true }}
                value={scheduleForm.time}
                onChange={(e) => setScheduleForm(prev => ({ ...prev, time: e.target.value }))}
              />
              <Button
                variant="contained"
                onClick={() => {
                  if (!scheduleForm.moduleId || !scheduleForm.date || !scheduleForm.time) {
                    showError('Please select module, date and time');
                    return;
                  }
                  setScheduleEntries(prev => ([...prev, scheduleForm]));
                  setScheduleForm({ moduleId: '', date: '', time: '' });
                  showSuccess('Schedule saved');
                }}
              >
                Add Schedule
              </Button>
            </Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Your Schedule</Typography>
            <List>
              {scheduleEntries.map((entry, idx) => {
                const mod = educationModules.find(m => m.id === Number(entry.moduleId));
                return (
                  <ListItem key={idx} secondaryAction={
                    <Button color="error" onClick={() => setScheduleEntries(prev => prev.filter((_, i) => i !== idx))}>Remove</Button>
                  }>
                    <ListItemIcon><CalendarToday /></ListItemIcon>
                    <ListItemText primary={mod?.title || 'Module'} secondary={`${entry.date} ${entry.time}`} />
                  </ListItem>
                );
              })}
              {scheduleEntries.length === 0 && (
                <Typography variant="body2" color="text.secondary">No schedule yet. Add one above.</Typography>
              )}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSchedule(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default EducationPage;
