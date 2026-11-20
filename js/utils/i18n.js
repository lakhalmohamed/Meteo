/**
 * AETHER Internationalization (i18n) Engine
 * Provides translations and localized formatters for English 🇬🇧, Français 🇫🇷, and العربية ��.
 */

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '��', dir: 'rtl' }
];

export const TRANSLATIONS = {
  en: {
    app: {
      title: 'MeteoLive',
      subtitle: 'Live Weather Intelligence',
      searchPlaceholder: 'Search cities worldwide...',
      searchShortcut: 'Ctrl K',
      locateMe: 'Use current GPS location',
      worldExplorer: 'World Weather Explorer',
      compareCities: 'Compare Cities',
      savedCities: 'Saved Places',
      settings: 'Settings',
      install: 'Install'
    },
    hero: {
      saveToFavorites: 'Save to favorites',
      removeFromFavorites: 'Remove from favorites',
      loadingDate: 'Loading date...',
      high: 'High',
      low: 'Low',
      feelsLike: 'Feels like',
      humidity: 'Humidity'
    },
    weather: {
      feelsLikeNarrative: 'Feels like {feelsLike} with high of {high} and low of {low}.',
      clear: 'Clear',
      partlyCloudy: 'Partly Cloudy',
      cloudy: 'Cloudy',
      rain: 'Rain',
      drizzle: 'Drizzle',
      snow: 'Snow',
      thunderstorm: 'Thunderstorm',
      fog: 'Fog'
    },
    settings: {
      title: 'Settings',
      subtitle: 'Personalize appearance and localization preferences',
      categoryAppearance: 'Appearance',
      categoryAppearanceDesc: 'Select visual interface theme',
      categoryLanguage: 'Language',
      categoryLanguageDesc: 'Choose your preferred language',
      themeDark: 'Dark Theme',
      themeDarkDesc: 'Futuristic deep midnight atmosphere with glowing luminous highlights.',
      themeLight: 'Light Theme',
      themeLightDesc: 'Clean, airy frosted glass interface with crisp daylight ambiance.',
      themeSystem: 'System Theme',
      themeSystemDesc: 'Automatically follows your operating system appearance preference.',
      themeActive: 'Active',
      langEnglish: 'English',
      langFrench: 'Français',
      langSpanish: 'Español',
      saveNote: 'Preferences are automatically saved to your device.'
    },
    hero: {
      high: 'High',
      low: 'Low',
      feelsLike: 'Feels like',
      humidity: 'Humidity',
      simulation: 'Simulation',
      removeFavorite: 'Remove from favorites',
      saveFavorite: 'Save to favorites'
    },
    timeMachine: {
      title: 'Weather Time Machine',
      subtitle: 'Scrub the timeline to simulate atmospheric conditions across the next 24 hours.',
      liveBadge: 'LIVE TELEMETRY',
      simulatedBadge: 'SIMULATED: +{hours}h ({time})',
      resetToNow: 'Reset to Now',
      temp: 'Simulated Temp',
      atmosphere: 'Atmosphere & Sky',
      daytime: 'Daytime',
      nightSky: 'Night Sky',
      precipChance: 'Precipitation Chance',
      windVelocity: 'Wind Velocity',
      precipExpected: 'Precipitation expected',
      precipIsolated: 'Isolated showers',
      precipDry: 'Dry conditions',
      quickJump: 'Quick Jump:',
      now: 'Now',
      in3Hours: '+3 Hours',
      in6Hours: '+6 Hours',
      in12Hours: '+12 Hours',
      evening: 'Evening',
      tomorrowDawn: 'Tomorrow Dawn'
    },
    hourly: {
      title: 'Hourly Outlook (Next 24h)',
      now: 'Now'
    },
    daily: {
      title: '7-Day Forecast',
      today: 'Today',
      tomorrow: 'Tomorrow'
    },
    details: {
      windTitle: 'Wind & Direction',
      sunTitle: 'Sun Horizon Arc',
      uvTitle: 'UV Radiation Index',
      humidityTitle: 'Relative Humidity',
      pressureTitle: 'Barometer Pressure',
      visibilityTitle: 'Visibility Horizon',
      cloudTitle: 'Cloud Sky Coverage',
      precipTitle: '24h Precipitation',
      rise: 'Rise',
      set: 'Set',
      stableBreeze: 'Stable breeze',
      daylightActive: 'Daylight active',
      dawnIn: 'Dawn in ~{hours}h',
      duskPassed: 'Dusk passed. Night sky active.',
      sunsetIn: 'Sunset in ~{hours}h',
      steadySystem: 'Steady system',
      highPressure: 'High pressure system (fair)',
      lowPressure: 'Low pressure system (unsettled)',
      dewPointIs: 'Dew point is {deg}°',
      cloudHeavy: 'Heavy overcast',
      cloudScattered: 'Scattered cumulus',
      cloudClear: 'Clear expanse',
      precipProbability: '{prob}% probability today'
    },
    insights: {
      title: 'Weather Intelligence & Insights',
      verified: 'Open-Meteo Verified Telemetry',
      briefTitle: "Today's Meteorological Brief",
      airQualityTitle: 'Atmospheric Air Quality',
      attireTitle: 'Attire & Gear Advisory',
      activityTitle: 'Outdoor Activity Index',
      activitySubtitle: 'Computed from real-time temperature, wind, humidity, precipitation & air quality.',
      aroundAverage: 'Right around seasonal weekly average.',
      warmerAverage: '{diff}° warmer than the weekly average high.',
      coolerAverage: '{diff}° cooler than the weekly average high.',
      dryConditions: 'Dry conditions expected throughout the day.',
      noRainExpected: 'No significant precipitation expected over the next 12 hours.',
      rainExpectedWindow: 'Elevated rain chance (up to {prob}%) expected around {start}{range}.',
      running: 'Running & Jogging',
      cycling: 'Road & Trail Cycling',
      stargazing: 'Celestial Stargazing',
      photography: 'Outdoor Photography',
      optimal: 'Optimal',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor'
    },
    explorer: {
      title: 'World Weather Explorer',
      subtitle: 'Interactive geographical telemetry map. Click any pin to jump to that city.',
      coordsPrompt: '0.00°N, 0.00°E',
      clickToSwitch: 'Click to switch location'
    },
    comparison: {
      title: 'Meteorological Comparison',
      subtitle: 'Side-by-side telemetry comparison of current city against global destinations.',
      compareWith: 'Compare with:',
      currentCityTag: 'Current City',
      targetCityTag: 'Comparison Target',
      dayRange: 'Day Range',
      humidity: 'Humidity',
      windVelocity: 'Wind Velocity',
      rainChance: 'Rain Chance',
      maxUv: 'Max UV Index',
      warmer: '+{diff}° Warmer',
      cooler: '{diff}° Cooler',
      equalTemp: 'Equal Temp',
      moreHumid: '{diff}% more humid',
      drier: '{diff}% drier',
      equalHumidity: 'Equal humidity',
      windier: '{diff} km/h windier',
      calmer: '{diff} km/h calmer',
      equalWind: 'Equal wind',
      switchTo: 'Switch to {city}',
      selectTarget: 'Select a target city above to compare telemetry.'
    },
    search: {
      popular: 'Popular Destinations',
      recent: 'Recent Searches',
      clearAll: 'Clear all',
      noResults: 'No matching locations found',
      noResultsSub: 'Check your spelling or try searching for a nearby major city.',
      searching: 'Searching satellite database...',
      recentTag: 'Recent'
    },
    favorites: {
      title: 'Saved Places',
      saveCurrent: 'Save Current Location',
      emptyTitle: 'No Favorite Cities Saved',
      emptySub: 'Click the star icon on any city to bookmark it for fast access.'
    },
    offline: {
      bannerText: 'You are currently offline. Displaying cached weather telemetry.',
      viewingCached: 'Viewing cached satellite data from {time}.',
      reconnect: 'Reconnect'
    },
    weather: {
      clearSky: 'Clear Sky',
      mainlyClear: 'Mainly Clear',
      partlyCloudy: 'Partly Cloudy',
      overcast: 'Overcast',
      fog: 'Fog',
      depositingRimeFog: 'Depositing Rime Fog',
      lightDrizzle: 'Light Drizzle',
      moderateDrizzle: 'Moderate Drizzle',
      denseDrizzle: 'Dense Drizzle',
      slightRain: 'Slight Rain',
      moderateRain: 'Moderate Rain',
      heavyRain: 'Heavy Rain',
      slightSnow: 'Slight Snow Fall',
      moderateSnow: 'Moderate Snow Fall',
      heavySnow: 'Heavy Snow Fall',
      snowGrains: 'Snow Grains',
      slightRainShowers: 'Slight Rain Showers',
      moderateRainShowers: 'Moderate Rain Showers',
      violentRainShowers: 'Violent Rain Showers',
      slightSnowShowers: 'Slight Snow Showers',
      heavySnowShowers: 'Heavy Snow Showers',
      thunderstorm: 'Thunderstorm',
      thunderstormHail: 'Thunderstorm with Hail',
      thunderstormHeavyHail: 'Thunderstorm with Heavy Hail',
      variableSky: 'Variable Sky'
    }
  },

  fr: {
    app: {
      title: 'MeteoLive',
      subtitle: 'Intelligence Météo en Direct',
      searchPlaceholder: 'Rechercher une ville dans le monde...',
      searchShortcut: 'Ctrl K',
      locateMe: 'Utiliser la position GPS actuelle',
      worldExplorer: 'Explorateur Météo Mondial',
      compareCities: 'Comparer les Villes',
      savedCities: 'Lieux Enregistrés',
      settings: 'Paramètres',
      install: 'Installer'
    },
    hero: {
      saveToFavorites: 'Sauvegarder dans les favoris',
      removeFromFavorites: 'Retirer des favoris',
      loadingDate: 'Chargement de la date...',
      high: 'Max',
      low: 'Min',
      feelsLike: 'Ressenti',
      humidity: 'Humidité'
    },
    weather: {
      feelsLikeNarrative: 'Ressenti {feelsLike} avec un maximum de {high} et un minimum de {low}.',
      clear: 'Dégagé',
      partlyCloudy: 'Partiellement nuageux',
      cloudy: 'Nuageux',
      rain: 'Pluie',
      drizzle: 'Bruine',
      snow: 'Neige',
      thunderstorm: 'Orage',
      fog: 'Brouillard'
    },
    settings: {
      title: 'Paramètres',
      subtitle: "Personnalisez l'apparence et les préférences linguistiques",
      categoryAppearance: 'Apparence',
      categoryAppearanceDesc: "Choisissez le thème visuel de l'interface",
      categoryLanguage: 'Langue',
      categoryLanguageDesc: 'Sélectionnez votre langue préférée',
      themeDark: 'Thème Sombre',
      themeDarkDesc: 'Atmosphère futuriste nocturne avec des reflets lumineux et contrastés.',
      themeLight: 'Thème Clair',
      themeLightDesc: 'Interface lumineuse et aérienne en verre dépoli avec ambiance diurne.',
      themeSystem: 'Thème Système',
      themeSystemDesc: "Suit automatiquement les préférences d'affichage de votre système d'exploitation.",
      themeActive: 'Actif',
      langEnglish: 'English',
      langFrench: 'Français',
      langSpanish: 'Español',
      saveNote: 'Vos préférences sont automatiquement enregistrées sur votre appareil.'
    },
    hero: {
      high: 'Max',
      low: 'Min',
      feelsLike: 'Ressenti',
      humidity: 'Humidité',
      simulation: 'Simulation',
      removeFavorite: 'Retirer des favoris',
      saveFavorite: 'Ajouter aux favoris'
    },
    timeMachine: {
      title: 'Machine Temporelle Météo',
      subtitle: 'Faites défiler la chronologie pour simuler les conditions des prochaines 24h.',
      liveBadge: 'TÉLÉMÉTRIE EN DIRECT',
      simulatedBadge: 'SIMULÉ : +{hours}h ({time})',
      resetToNow: 'Revenir au Direct',
      temp: 'Temp. Simulée',
      atmosphere: 'Atmosphère & Ciel',
      daytime: 'Journée',
      nightSky: 'Ciel Nocturne',
      precipChance: 'Risque de Précipitation',
      windVelocity: 'Vitesse du Vent',
      precipExpected: 'Précipitations attendues',
      precipIsolated: 'Averses isolées',
      precipDry: 'Conditions sèches',
      quickJump: 'Accès Rapide :',
      now: 'Maintenant',
      in3Hours: '+3 Heures',
      in6Hours: '+6 Heures',
      in12Hours: '+12 Heures',
      evening: 'Soirée',
      tomorrowDawn: 'Aube Demain'
    },
    hourly: {
      title: 'Prévisions Horaires (Prochaines 24h)',
      now: 'Actuel'
    },
    daily: {
      title: 'Prévisions sur 7 Jours',
      today: "Aujourd'hui",
      tomorrow: 'Demain'
    },
    details: {
      windTitle: 'Vent & Direction',
      sunTitle: 'Trajectoire Solaire',
      uvTitle: 'Indice Rayonnement UV',
      humidityTitle: 'Humidité Relative',
      pressureTitle: 'Pression Barométrique',
      visibilityTitle: 'Horizon de Visibilité',
      cloudTitle: 'Couverture Nuageuse',
      precipTitle: 'Précipitations 24h',
      rise: 'Lever',
      set: 'Coucher',
      stableBreeze: 'Brise régulière',
      daylightActive: 'Lumière du jour active',
      dawnIn: 'Aube dans ~{hours}h',
      duskPassed: 'Crépuscule passé. Ciel nocturne.',
      sunsetIn: 'Coucher dans ~{hours}h',
      steadySystem: 'Système barométrique stable',
      highPressure: 'Système anticyclonique (beau temps)',
      lowPressure: 'Système dépressionnaire (instable)',
      dewPointIs: 'Point de rosée à {deg}°',
      cloudHeavy: 'Ciel très couvert',
      cloudScattered: 'Cumulus épars',
      cloudClear: 'Ciel limpide',
      precipProbability: '{prob}% de probabilité aujourd’hui'
    },
    insights: {
      title: 'Intelligence & Analyses Météo',
      verified: 'Télémétrie Vérifiée Open-Meteo',
      briefTitle: 'Bulletin Météorologique du Jour',
      airQualityTitle: "Qualité de l'Air Atmosphérique",
      attireTitle: 'Conseils Vestimentaires & Équipement',
      activityTitle: "Indice d'Activités Extérieures",
      activitySubtitle: 'Calculé selon la température, le vent, l’humidité, la pluie et la qualité de l’air.',
      aroundAverage: 'Conforme aux moyennes saisonnières.',
      warmerAverage: '{diff}° de plus que la moyenne hebdomadaire.',
      coolerAverage: '{diff}° de moins que la moyenne hebdomadaire.',
      dryConditions: 'Temps sec attendu tout au long de la journée.',
      noRainExpected: 'Aucune précipitation notable prévue dans les 12 prochaines heures.',
      rainExpectedWindow: 'Risque accru de pluie (jusqu’à {prob}%) prévu vers {start}{range}.',
      running: 'Course & Running',
      cycling: 'Cyclisme & Vélo',
      stargazing: 'Observation des Étoiles',
      photography: 'Photographie Extérieure',
      optimal: 'Optimal',
      good: 'Bon',
      fair: 'Moyen',
      poor: 'Déconseillé'
    },
    explorer: {
      title: 'Explorateur Météo Mondial',
      subtitle: 'Carte géodésique interactive. Cliquez sur un repère pour voyager vers cette ville.',
      coordsPrompt: '0.00°N, 0.00°E',
      clickToSwitch: 'Cliquer pour changer de lieu'
    },
    comparison: {
      title: 'Comparaison Météorologique',
      subtitle: 'Comparatif direct de la ville actuelle avec les destinations mondiales.',
      compareWith: 'Comparer avec :',
      currentCityTag: 'Ville Actuelle',
      targetCityTag: 'Ville Cible',
      dayRange: 'Écart Journée',
      humidity: 'Humidité',
      windVelocity: 'Vitesse Vent',
      rainChance: 'Pluie',
      maxUv: 'Indice UV Max',
      warmer: '+{diff}° Plus Chaud',
      cooler: '{diff}° Plus Frais',
      equalTemp: 'Température Égale',
      moreHumid: '{diff}% plus humide',
      drier: '{diff}% plus sec',
      equalHumidity: 'Humidité égale',
      windier: '{diff} km/h plus venteux',
      calmer: '{diff} km/h plus calme',
      equalWind: 'Vent équivalent',
      switchTo: 'Basculer sur {city}',
      selectTarget: 'Sélectionnez une ville cible ci-dessus pour comparer la météo.'
    },
    search: {
      popular: 'Destinations Populaires',
      recent: 'Recherches Récentes',
      clearAll: 'Effacer tout',
      noResults: 'Aucun lieu trouvé',
      noResultsSub: 'Vérifiez l’orthographe ou recherchez une grande ville à proximité.',
      searching: 'Interrogation des satellites...',
      recentTag: 'Récent'
    },
    favorites: {
      title: 'Lieux Enregistrés',
      saveCurrent: 'Enregistrer la Ville Actuelle',
      emptyTitle: 'Aucun Favori Enregistré',
      emptySub: 'Cliquez sur l’étoile pour enregistrer une ville en accès rapide.'
    },
    offline: {
      bannerText: 'Vous êtes actuellement hors ligne. Affichage des données météo en cache.',
      viewingCached: 'Données satellites en cache datant de {time}.',
      reconnect: 'Reconnecter'
    },
    weather: {
      clearSky: 'Ciel Dégagé',
      mainlyClear: 'Largement Dégagé',
      partlyCloudy: 'Partiellement Nuageux',
      overcast: 'Couvert',
      fog: 'Brouillard',
      depositingRimeFog: 'Brouillard Givrant',
      lightDrizzle: 'Bruine Légère',
      moderateDrizzle: 'Bruine Modérée',
      denseDrizzle: 'Bruine Dense',
      slightRain: 'Pluie Faible',
      moderateRain: 'Pluie Modérée',
      heavyRain: 'Forte Pluie',
      slightSnow: 'Chute de Neige Faible',
      moderateSnow: 'Chute de Neige Modérée',
      heavySnow: 'Forte Chute de Neige',
      snowGrains: 'Neige en Grains',
      slightRainShowers: 'Averses Faibles',
      moderateRainShowers: 'Averses Modérées',
      violentRainShowers: 'Averses Violentes',
      slightSnowShowers: 'Averses de Neige Faibles',
      heavySnowShowers: 'Fortes Averses de Neige',
      thunderstorm: 'Orage',
      thunderstormHail: 'Orage avec Grêle',
      thunderstormHeavyHail: 'Orage avec Forte Grêle',
      variableSky: 'Ciel Variable'
    }
  },

  ar: {
    app: {
      title: 'ميتيو لايف',
      subtitle: 'الذكاء الجوي المباشر',
      searchPlaceholder: 'البحث عن المدن حول العالم...',
      searchShortcut: 'Ctrl K',
      locateMe: 'استخدام موقع GPS الحالي',
      worldExplorer: 'مستكشف الطقس العالمي',
      compareCities: 'مقارنة المدن',
      savedCities: 'الأماكن المحفوظة',
      settings: 'الإعدادات',
      install: 'تثبيت'
    },
    hero: {
      saveToFavorites: 'حفظ في المفضلة',
      removeFromFavorites: 'إزالة من المفضلة',
      loadingDate: 'جاري تحميل التاريخ...',
      high: 'الأعلى',
      low: 'الأدنى',
      feelsLike: 'مثل',
      humidity: 'الرطوبة'
    },
    weather: {
      feelsLikeNarrative: 'يشعر {feelsLike} مع أقصى {high} وأدنى {low}.',
      clear: 'صافي',
      partlyCloudy: 'غائم جزئياً',
      cloudy: 'غائم',
      rain: 'مطر',
      drizzle: 'رذاذ',
      snow: 'ثلج',
      thunderstorm: 'عاصفة رعدية',
      fog: 'ضباب'
    },
    settings: {
      title: 'الإعدادات',
      subtitle: 'تخصيص مظهر وإعدادات اللغة',
      categoryAppearance: 'المظهر',
      categoryAppearanceDesc: 'اختر سمة الواجهة المرئية',
      categoryLanguage: 'اللغة',
      categoryLanguageDesc: 'اختر لغتك المفضلة',
      themeDark: 'السمة الداكنة',
      themeDarkDesc: 'أجواء ليلية مستقبلية مع إضاءة متوهجة.',
      themeLight: 'السمة الفاتحة',
      themeLightDesc: 'واجهة نظيفة وشفافة مع جو نهاري مشرق.',
      themeSystem: 'سمة النظام',
      themeSystemDesc: 'تتبع تلقائياً تفضيلات نظام التشغيل.',
      themeActive: 'نشط',
      langEnglish: 'English',
      langFrench: 'Français',
      langArabic: 'العربية',
      saveNote: 'يتم حفظ تفضيلاتك تلقائياً على جهازك.'
    },
    hero: {
      high: 'الأعلى',
      low: 'الأدنى',
      feelsLike: 'المحسوس',
      humidity: 'الرطوبة',
      simulation: 'محاكاة',
      removeFavorite: 'إزالة من المفضلة',
      saveFavorite: 'حفظ في المفضلة'
    },
    timeMachine: {
      title: 'آلة الزمن للطقس',
      subtitle: 'مرر الجدول الزمني لمحاكاة الظروف خلال الـ 24 ساعة القادمة.',
      liveBadge: 'قياسات مباشرة',
      simulatedBadge: 'محاكاة: +{hours}س ({time})',
      resetToNow: 'العودة للوقت الحالي',
      temp: 'درجة الحرارة المحاكاة',
      atmosphere: 'الغلاف الجوي والسماء',
      daytime: 'النهار',
      nightSky: 'السماء الليلية',
      precipChance: 'احتمال الهطول',
      windVelocity: 'سرعة الرياح',
      precipExpected: 'هطول متوقع',
      precipIsolated: 'زخات معزولة',
      precipDry: 'ظروف جافة',
      quickJump: 'انتقال سريع:',
      now: 'الآن',
      in3Hours: '+3 ساعات',
      in6Hours: '+6 ساعات',
      in12Hours: '+12 ساعة',
      evening: 'المساء',
      tomorrowDawn: 'فجر الغد'
    },
    hourly: {
      title: 'التوقعات الساعية (الـ 24 ساعة القادمة)',
      now: 'الآن'
    },
    daily: {
      title: 'توقعات 7 أيام',
      today: 'اليوم',
      tomorrow: 'غداً'
    },
    details: {
      windTitle: 'الرياح والاتجاه',
      sunTitle: 'قوس الشمس',
      uvTitle: 'مؤشر الأشعة فوق البنفسجية',
      humidityTitle: 'الرطوبة النسبية',
      pressureTitle: 'الضغط الجوي',
      visibilityTitle: 'مدى الرؤية',
      cloudTitle: 'غطاء السحب',
      precipTitle: 'الهطول خلال 24 ساعة',
      rise: 'الشروق',
      set: 'الغروب',
      stableBreeze: 'نسيم مستقر',
      daylightActive: 'ضوء النهار نشط',
      dawnIn: 'الفجر خلال ~{hours}س',
      duskPassed: 'غروب الشمس مر. السماء الليلية نشطة.',
      sunsetIn: 'الغروب خلال ~{hours}س',
      steadySystem: 'نظام مستقر',
      highPressure: 'نظام ضغط مرتفع (طقس جيد)',
      lowPressure: 'نظام ضغط منخفض (غير مستقر)',
      dewPointIs: 'نقطة الندى {deg}°',
      cloudHeavy: 'غائم جداً',
      cloudScattered: 'سحب متفرقة',
      cloudClear: 'سماء صافية',
      precipProbability: '{prob}% احتمال اليوم'
    },
    insights: {
      title: 'الذكاء والتحليلات الجوية',
      verified: 'قياسات موثقة من Open-Meteo',
      briefTitle: 'الملخص الجوي لليوم',
      airQualityTitle: 'جودة الهواء الجوي',
      attireTitle: 'نصائح الملابس والمعدات',
      activityTitle: 'مؤشر الأنشطة الخارجية',
      activitySubtitle: 'محسوب بناءً على درجة الحرارة والرياح والرطوبة والهطول وجودة الهواء.',
      aroundAverage: 'قريب من المتوسط الموسمي الأسبوعي.',
      warmerAverage: '{diff}° أكثر دفئاً من المتوسط الأسبوعي.',
      coolerAverage: '{diff}° أكثر برودة من المتوسط الأسبوعي.',
      dryConditions: 'ظروف جافة متوقعة طوال اليوم.',
      noRainExpected: 'لا يوجد هطول مهم متوقع خلال الـ 12 ساعة القادمة.',
      rainExpectedWindow: 'احتمال متزايد للمطر (حتى {prob}%) متوقع حوالي {start}{range}.',
      running: 'الجري والعدو',
      cycling: 'ركوب الدراجات',
      stargazing: 'مراقبة النجوم',
      photography: 'التصوير الخارجي',
      optimal: 'ممتاز',
      good: 'جيد',
      fair: 'متوسط',
      poor: 'غير موصى به'
    },
    explorer: {
      title: 'مستكشف الطقس العالمي',
      subtitle: 'خريطة جغرافية تفاعلية. انقر على أي دبوس للانتقال إلى تلك المدينة.',
      coordsPrompt: '0.00°ش، 0.00°ج',
      clickToSwitch: 'انقر لتغيير الموقع'
    },
    comparison: {
      title: 'المقارنة الجوية',
      subtitle: 'مقارنة مباشرة للمدينة الحالية مع الوجهات العالمية.',
      compareWith: 'مقارنة مع:',
      currentCityTag: 'المدينة الحالية',
      targetCityTag: 'الوجهة المستهدفة',
      dayRange: 'نطاق اليوم',
      humidity: 'الرطوبة',
      windVelocity: 'سرعة الرياح',
      rainChance: 'احتمال المطر',
      maxUv: 'مؤشر الأشعة فوق البنفسجية الأقصى',
      warmer: '+{diff}° أكثر دفئاً',
      cooler: '{diff}° أكثر برودة',
      equalTemp: 'درجة حرارة متساوية',
      moreHumid: '{diff}% أكثر رطوبة',
      drier: '{diff}% أكثر جفافاً',
      equalHumidity: 'رطوبة متساوية',
      windier: '{diff} كم/س أكثر رياحاً',
      calmer: '{diff} كم/س أكثر هدوءاً',
      equalWind: 'رياح متساوية',
      switchTo: 'التبديل إلى {city}',
      selectTarget: 'اختر مدينة مستهدفة أعلاه لمقارنة القياسات.'
    },
    search: {
      popular: 'الوجهات الشائعة',
      recent: 'عمليات البحث الأخيرة',
      clearAll: 'مسح الكل',
      noResults: 'لم يتم العثور على مواقع',
      noResultsSub: 'تحقق من الإملاء أو ابحث عن مدينة رئيسية قريبة.',
      searching: 'البحث في قاعدة بيانات الأقمار الصناعية...',
      recentTag: 'حديث'
    },
    favorites: {
      title: 'الأماكن المحفوظة',
      saveCurrent: 'حفظ الموقع الحالي',
      emptyTitle: 'لا توجد مدن مفضلة محفوظة',
      emptySub: 'انقر على أيقونة النجمة لأي مدينة لإضافتها للوصول السريع.'
    },
    offline: {
      bannerText: 'أنت حالياً غير متصل. عرض بيانات الطقس المخزنة مؤقتاً.',
      viewingCached: 'عرض بيانات الأقمار الصناعية المخزنة من {time}.',
      reconnect: 'إعادة الاتصال'
    },
    weather: {
      clearSky: 'سماء صافية',
      mainlyClear: 'صافية غالباً',
      partlyCloudy: 'غائم جزئياً',
      overcast: 'غائم',
      fog: 'ضباب',
      depositingRimeFog: 'ضباب متجمد',
      lightDrizzle: 'رذاذ خفيف',
      moderateDrizzle: 'رذاذ معتدل',
      denseDrizzle: 'رذاذ كثيف',
      slightRain: 'مطر خفيف',
      moderateRain: 'مطر معتدل',
      heavyRain: 'مطر غزير',
      slightSnow: 'ثلج خفيف',
      moderateSnow: 'ثلج معتدل',
      heavySnow: 'ثلج غزير',
      snowGrains: 'حبيبات ثلج',
      slightRainShowers: 'زخات مطر خفيفة',
      moderateRainShowers: 'زخات مطر معتدلة',
      violentRainShowers: 'زخات مطر عنيفة',
      slightSnowShowers: 'زخات ثلج خفيفة',
      heavySnowShowers: 'زخات ثلج غزيرة',
      thunderstorm: 'عاصفة رعدية',
      thunderstormHail: 'عاصفة رعدية مع برد',
      thunderstormHeavyHail: 'عاصفة رعدية مع برد غزير',
      variableSky: 'سماء متغيرة'
    }
  }
};

let currentLang = 'en';

export function setAppLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    
    // Set document direction (LTR/RTL) based on language
    const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === lang);
    if (langConfig) {
      document.documentElement.setAttribute('dir', langConfig.dir);
    }
    
    // Update all elements with data-i18n attributes
    updateAllTranslations();
  }
}

export function updateAllTranslations() {
  console.log('[i18n] Updating translations, current language:', currentLang);
  const elements = document.querySelectorAll('[data-i18n]');
  console.log('[i18n] Found', elements.length, 'elements with data-i18n');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key) {
      const translated = t(key);
      console.log('[i18n] Translating', key, '->', translated);
      el.textContent = translated;
    }
  });
}

export function getAppLanguage() {
  return currentLang;
}

/**
 * Translate a key string (e.g. 'hero.humidity', 'timeMachine.title')
 */
export function t(key, params = {}) {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  const parts = key.split('.');
  let val = dict;

  for (const part of parts) {
    if (val && typeof val === 'object' && part in val) {
      val = val[part];
    } else {
      // Fallback to English
      val = null;
      break;
    }
  }

  if (val === null || val === undefined) {
    let fallback = TRANSLATIONS.en;
    for (const part of parts) {
      if (fallback && typeof fallback === 'object' && part in fallback) {
        fallback = fallback[part];
      } else {
        return key;
      }
    }
    val = fallback;
  }

  if (typeof val === 'string') {
    return val.replace(/\{(\w+)\}/g, (_, k) => (params[k] !== undefined ? params[k] : `{${k}}`));
  }

  return val || key;
}
