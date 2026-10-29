import { Country } from '../types';
import {
  CountryGastronomyProfile,
  NationalDish,
  MealRoutine,
  ExpatDiningHurdle,
  DietaryRestrictionGuide,
  FoodCostsAndHygiene,
} from '../types';

/**
 * Curated authentic gastronomy profiles for top expat retirement havens
 */
const CURATED_GASTRONOMY_PROFILES: Record<string, CountryGastronomyProfile> = {
  portugal: {
    countryId: 'portugal',
    countryName: 'Portugal',
    cuisineHeadline: 'Atlantic Seafood, Rustic Tascas, Sun-Drenched Olive Oil & Sacred Pastel de Nata',
    culinaryTraditionsOverview:
      'Portuguese gastronomy is deeply unpretentious, ingredient-driven, and anchored in the Atlantic Ocean. Local dining revolves around neighbourhood "tascas" (family-run bistros), where fresh fish is grilled over open charcoal, seasonal vegetables are braised in golden Alentejo olive oil, and no meal is complete without warm crusty bread, olives, and a carafe of vinho da casa. Meals are slow, social rituals accompanied by the nation’s beloved "bica" espresso culture.',
    routines: [
      {
        mealName: 'Breakfast',
        timing: '7:30 AM – 9:30 AM',
        typicalFoods: [
          'Meia de leite (milky coffee in a glass) or Galão',
          'Torrada (thick country toast lavishly spread with salty butter)',
          'Freshly baked Pastel de Nata or Croissant francês',
        ],
        culturalImportance:
          'Eaten standing up at the local pastelaria counter in 5 to 10 minutes. A quick morning social hello with neighbours.',
      },
      {
        mealName: 'Mid-Morning Coffee & Snack',
        timing: '10:30 AM – 11:30 AM',
        typicalFoods: ['Um café / Uma bica (piping hot dark espresso)', 'Pastel de Chaves (flaky meat or cheese pastry)'],
        culturalImportance:
          'The sacred coffee break. Skipping mid-morning coffee is almost unthinkable in Portuguese office and social life.',
      },
      {
        mealName: 'Lunch',
        timing: '12:30 PM – 2:30 PM',
        typicalFoods: [
          'Prato do Dia (Daily lunch special with soup, main dish, bread, wine, and espresso)',
          'Grelhados mistos (grilled pork cuts) or Dourada grelhada (grilled sea bream)',
          'Caldo Verde (collard greens & potato soup)',
        ],
        culturalImportance:
          'The principal meal of the day. Tascas pack out with workers, retirees, and families enjoying warm sit-down lunches.',
      },
      {
        mealName: 'Afternoon Snack / Merienda',
        timing: '4:30 PM – 6:00 PM',
        typicalFoods: ['Tosta mista (toasted ham & cheese sandwich on crusty bread)', 'Fresh orange juice or Imperial (small draft beer)'],
        culturalImportance:
          'A gentle bridge between lunch and late dinner, common among retirees and children after school.',
      },
      {
        mealName: 'Dinner',
        timing: '8:00 PM – 10:00 PM',
        typicalFoods: [
          'Bacalhau à Brás (shredded salted cod with straw potatoes and eggs)',
          'Cataplana de Marisco (clam, shrimp & fish stew cooked in copper cataplana pan)',
          'Polvo à Lagareiro (roasted octopus drenched in garlic olive oil and punched potatoes)',
        ],
        culturalImportance:
          'A relaxed, leisurely affair with family or friends lasting 1.5 to 2 hours over Douro or Dão red wine.',
      },
    ],
    nationalDishes: [
      {
        name: 'Bacalhau à Brás',
        localName: 'Bacalhau à Brás',
        category: 'Signature Main',
        description:
          'Shredded salted cod sautéed with paper-thin crisp straw potatoes, caramelized onions, and bound together with gently scrambled eggs, garnished with black olives and fresh parsley.',
        traditionOrHistory:
          'Originated in Lisbon’s historic Bairro Alto district by a tavern owner named Brás. It is one of the 365+ mythical ways the Portuguese cook bacalhau.',
        flavorProfile: 'Savory, rich, comforting with crispy-soft potato contrast and gentle brininess.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Legumes à Brás (made with sautéed leeks, zucchini, and mushrooms instead of cod).',
        typicalCostUSD: 13,
        typicalCostLocalCurrency: '€12.00',
        bestAuthenticPlaces: [
          'Restaurante O Polícia (Rego, Lisbon)',
          'Tasca do Chico (Bairro Alto, Lisbon)',
          'Adega das Gravatas (Carnide, Lisbon)',
        ],
      },
      {
        name: 'Pastel de Nata',
        localName: 'Pastel de Belém / Pastel de Nata',
        category: 'Dessert / Pastry',
        description:
          'Iconic blistered custard tart with crisp, multi-layered puff pastry cups filled with velvety, caramelized egg-yolk custard dusted with cinnamon and powdered sugar.',
        traditionOrHistory:
          'Created before the 18th century by Catholic monks at the Jerónimos Monastery in Santa Maria de Belém, utilizing leftover egg yolks from starching nuns’ habits.',
        flavorProfile: 'Crunchy flaky pastry shell, creamy custard with caramelized spots, warm cinnamon sweetness.',
        vegetarianFriendly: true,
        typicalCostUSD: 1.4,
        typicalCostLocalCurrency: '€1.30',
        bestAuthenticPlaces: [
          'Pastéis de Belém (Rua de Belém 84, Lisbon)',
          'Manteigaria (Chiado, Lisbon & Rua das Flores, Porto)',
          'Fábrica da Nata (Avenida da Liberdade, Lisbon)',
        ],
      },
      {
        name: 'Polvo à Lagareiro',
        localName: 'Polvo à Lagareiro',
        category: 'Seafood Delicacy',
        description:
          'Tender octopus boiled then roasted in the oven until caramelized, served submerged in a fragrant puddle of heated extra-virgin olive oil, roasted garlic cloves, and punched baked potatoes (batatas a murro).',
        traditionOrHistory:
          'Named after the "lagareiro" (the pressman in an olive oil mill), celebrating the arrival of the season’s fresh peppery olive oil.',
        flavorProfile: 'Tender buttery octopus, rich garlic-infused olive oil, earthy roasted potatoes.',
        vegetarianFriendly: false,
        typicalCostUSD: 19,
        typicalCostLocalCurrency: '€17.50',
        bestAuthenticPlaces: [
          'A Cevicheria or Solar dos Presuntos (Lisbon)',
          'Taverna dos Trovadores (Sintra)',
          'Restaurante O Pescador (Cascais)',
        ],
      },
      {
        name: 'Francesinha',
        localName: 'Francesinha',
        category: 'Signature Main',
        description:
          'Porto’s legendary sandwich stacked with wet-cured ham, linguiça sausage, roast beef or fresh steak, covered with melted cheese and smothered in a hot, thick beer and tomato gravy, crowned with a fried egg and surrounded by french fries.',
        traditionOrHistory:
          'Invented in the 1950s by Daniel da Silva, a returned emigrant from France who adapted the Croque Monsieur to hearty northern Portuguese tastes.',
        flavorProfile: 'Decadent, hearty, spicy, deeply umami beer-infused sauce.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Francesinha Vegetariana (widely available in Porto using tofu, seitan, smoked vegan sausage & vegetable beer sauce).',
        typicalCostUSD: 14,
        typicalCostLocalCurrency: '€13.00',
        bestAuthenticPlaces: [
          'Café Santiago (Rua de Passos Manuel, Porto)',
          'Cervejaria Brasão (Aliados & Coliseu, Porto)',
          'Lado B Café (Porto)',
        ],
      },
      {
        name: 'Caldo Verde',
        localName: 'Caldo Verde',
        category: 'Soup / Stew',
        description:
          'Traditional peasant soup made of pureed potatoes, onions, and garlic, simmered with finely shredded couve-galega (collard greens) and drizzled with raw olive oil, traditionally finished with a slice of chouriço sausage.',
        traditionOrHistory:
          'Originating from the Minho province in northern Portugal, this soup is considered the nation’s ultimate comfort bowl, ubiquitous at festivals like Festa de São João.',
        flavorProfile: 'Earthy, comforting, velvety potato broth with slight bitterness of tender greens.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Order "Caldo Verde sem chouriço" (tascas are happy to omit the single pork sausage slice).',
        typicalCostUSD: 3.5,
        typicalCostLocalCurrency: '€3.20',
        bestAuthenticPlaces: [
          'A Merendinha do Arco Bandeira (Rossio, Lisbon)',
          'O Buraco (Santa Catarina, Porto)',
          'Any neighbourhood tasca during Festas dos Santos Populares',
        ],
      },
    ],
    dietaryRestrictions: {
      vegetarianRating: 'Moderate / Some Planning',
      veganRating: 'Moderate / Focus on Specialty Spots',
      glutenFreeRating: 'Very High Awareness',
      summary:
        'Traditional Portuguese cooking is historically meat and seafood heavy, and vegetables in old-school tascas are treated as sides rather than centerpieces. However, modern Lisbon, Porto, Cascais, and the Algarve are packed with world-class vegan bistros, Indian, and Mediterranean eateries. In traditional restaurants, asking for "Legumes grelhados", "Omolete de queijo", or "Sopa de legumes sem carne" is always accommodated with warm hospitality.',
      hiddenNonVegIngredients: [
        'Lard (banha de porco) occasionally used in traditional pastry crusts (e.g. empadas)',
        'Chouriço slice simmering in vegetable soups (Caldo Verde, Sopa de Feijão)',
        'Gelatin in egg-based traditional convent sweets',
      ],
      helpfulLocalPhrases: [
        {
          phrase: 'Sou vegetariano / Sou vegano.',
          english: 'I am vegetarian / I am vegan.',
          phonetic: 'soh veh-zheh-tah-ree-AH-noo / soh veh-GAH-noo',
        },
        {
          phrase: 'Tem algum prato sem carne nem peixe?',
          english: 'Do you have any dish without meat or fish?',
          phonetic: 'tayn ahl-GOONG PRAH-too sayng KAHR-neh nayng PAY-sheh?',
        },
        {
          phrase: 'Pode tirar o chouriço da sopa, por favor?',
          english: 'Can you take the chorizo out of the soup, please?',
          phonetic: 'POH-deh tee-RAHR oo shoo-REE-soo dah SOH-pah, poor fah-VOHR?',
        },
        {
          phrase: 'Não como produtos de origem animal.',
          english: 'I do not eat animal products.',
          phonetic: 'nowng KOH-moo proh-DOO-toosh deh oh-REE-zheng ah-nee-MAHL.',
        },
      ],
      stapleVegDishes: [
        'Sopa de Legumes (pureed vegetable soup)',
        'Legumes à Brás (scrambled eggs with straw potatoes, leeks & zucchini)',
        'Torta de espinafres ou cogumelos',
        'Queijo Serra da Estrela com pão rústico (raw sheep milk cheese with crusty bread)',
        'Arroz de Feijão / Arroz de Tomate (tomato or bean braised rice)',
      ],
    },
    expatHurdles: [
      {
        title: 'Rigid Lunch Hours in Traditional Tascas',
        category: 'Meal Timings & Schedules',
        description:
          'Local tasca kitchens strictly close between 3:00 PM and 7:30 PM. Expats trying to get a hot meal at 4:30 PM find kitchens dark and only pre-made pastelaria pastries available.',
        workaroundTip:
          'Eat lunch between 12:45 PM and 2:00 PM for the freshest "Prato do Dia". If caught between hours, pastelarias serve tostas mistas and soup all day.',
      },
      {
        title: 'The "Couvert" Charge on the Table',
        category: 'Payment & Tipping',
        description:
          'When you sit down, waitstaff immediately place bread, butter, olives, cheese, and paté on the table without asking. Many new expats assume this is complimentary.',
        workaroundTip:
          'If you eat it, it will be billed individually (usually €2–€5 total). If you don’t want it, simply say "Não, obrigado" immediately or leave it untouched; you will not be charged.',
      },
      {
        title: 'Understated Seasoning & Mild Spice Profile',
        category: 'Spice & Palate Adaptation',
        description:
          'Portuguese seasoning relies purely on salt, bay leaves, garlic, and high-grade olive oil. Spicy heat is rarely integrated directly into dishes.',
        workaroundTip:
          'Ask your waiter for "piri-piri" (homemade chili oil); almost every kitchen keeps a fiery jar behind the counter for guests to drizzle to taste.',
      },
      {
        title: 'Asking for the Check ("A Conta")',
        category: 'Ordering & Etiquette',
        description:
          'Waitstaff will never bring your check unprompted, as it is considered rude and rushed in Portuguese culture. Expats often wait 20 minutes wondering why nobody brings the bill.',
        workaroundTip:
          'Make eye contact and say "A conta, por favor" or make the universal air-signing gesture. Take your time enjoying the table.',
      },
    ],
    costsAndHygiene: {
      streetFoodOrMarketMealUSD: 5.5,
      casualRestaurantMealUSD: 11.0,
      midRangeDinnerForTwoUSD: 38.0,
      highEndFineDiningUSD: 95.0,
      localBeerOrWineGlassUSD: 2.2,
      specialtyCoffeeUSD: 1.8,
      groceriesVsDiningOutVerdict:
        'With €9 to €12 covering a complete 3-course "Prato do Dia" including wine and espresso at tascas, dining out casually is nearly as affordable as cooking at home for retirees.',
      waterSafety: '100% Safe from Tap',
      waterDetails:
        'Municipal tap water across Portugal meets strict EU drinking standards (EPAL in Lisbon) and is rigorously tested. In coastal areas with hard mineral water, simple Brita pitchers are used solely for taste preference.',
      eatingOutHygieneScore: 94,
      hygieneGuidance:
        'All food service businesses are regulated under strict EU HACCP health inspections (ASAE). Kitchens and display cases in both humble tascas and fine dining establishments are kept spotlessly clean.',
      streetFoodSafetyTips: [
        'Festa street sardine grills and bifana sandwich trailers are completely safe and turnover is extremely fast.',
        'Always check that seafood is laid over clean, fresh shaved ice in marisqueira display windows.',
      ],
      produceWashingAdvice:
        'Normal tap water rinsing is entirely sufficient for local vegetables and fruit purchased at Continente, Pingo Doce, or neighbourhood feiras.',
    },
    marketAndGroceryCulture: {
      freshMarketsOverview:
        'Every Portuguese municipality features a municipal "Mercado Municipal" open Tuesday through Sunday mornings. Stalls overflow with morning-catch sea bass, octopus, local cheeses, Alentejo cured meats, and fresh seasonal produce at a fraction of supermarket prices.',
      supermarketChains: ['Pingo Doce', 'Continente', 'Auchan', 'Lidl', 'Intermarché', 'El Corte Inglés (gourmet)'],
      importedWesternGoodsAvailability: 'Widely Available in Supermarkets',
    },
  },

  spain: {
    countryId: 'spain',
    countryName: 'Spain',
    cuisineHeadline: 'Tapas Crawls, Sun-Cured Jamón, Coastal Paella & Legendary Late-Night Tertulias',
    culinaryTraditionsOverview:
      'Spanish gastronomy is a high-spirited social art form. Eating in Spain is rarely an isolated domestic task—it is an outdoor social event consisting of tapeo (hopping between neighborhood bars), pairing small bites with cañas (chilled draft beer) or Rioja wine, and gathering for the venerable "Menú del Día". Regional pride is fierce, from Basque pintxos and Valencian paella to Andalusian gazpacho and Galician seafood.',
    routines: [
      {
        mealName: 'Breakfast',
        timing: '8:00 AM – 9:30 AM',
        typicalFoods: [
          'Pan con Tomate (toasted crusty baguette rubbed with fresh tomato pulp, garlic, and extra virgin olive oil)',
          'Café con Leche',
          'Churros con Chocolate (weekend treat)',
        ],
        culturalImportance:
          'Light and brief. Most Spaniards eat a light bite before heading out, saving room for their second breakfast.',
      },
      {
        mealName: 'Mid-Morning Coffee & Snack',
        timing: '10:30 AM – 11:30 AM',
        typicalFoods: ['Pincho de Tortilla Española (warm potato omelette slice with baguette)', 'Fresh squeezed orange juice (Zumo de naranja)'],
        culturalImportance:
          'Known as "El Almuerzo". Cafes fill with workers stepping away from desks to chat and eat a hearty warm pincho.',
      },
      {
        mealName: 'Lunch',
        timing: '2:00 PM – 4:00 PM',
        typicalFoods: [
          'Menú del Día (3 courses: primer plato, segundo plato, bread, drink, and postre)',
          'Gazpacho or Salmorejo',
          'Arroz a la Valenciana or Lentejas con chorizo',
          'Lubina a la plancha (grilled sea bass)',
        ],
        culturalImportance:
          'The undisputed centerpiece of the Spanish day. A leisurely, uninterrupted 1 to 2 hour sit-down experience.',
      },
      {
        mealName: 'Afternoon Snack / Merienda',
        timing: '5:30 PM – 7:30 PM',
        typicalFoods: ['Café solo or cortado', 'Pastry, fruit, or small bocadillo de jamón'],
        culturalImportance:
          'Crucial energy boost because Spanish dinner is eaten substantially later than anywhere else in the Western world.',
      },
      {
        mealName: 'Dinner',
        timing: '9:00 PM – 11:30 PM',
        typicalFoods: [
          'Ir de Tapas (standing at bars sharing Patatas Bravas, Pimientos de Padrón, Gambas al Ajillo)',
          'Tabla de Jamón Ibérico de Bellota y Queso Manchego',
          'Croquetas caseras (creamy béchamel croquettes)',
        ],
        culturalImportance:
          'Informal, social, and vibrant. Diners spill into pedestrian plazas and terraces, laughing and discussing politics into midnight.',
      },
    ],
    nationalDishes: [
      {
        name: 'Paella Valenciana',
        localName: 'Paella Valenciana Tradicional',
        category: 'Signature Main',
        description:
          'Traditional saffron-infused Bomba rice cooked in a wide shallow steel pan over orange wood, layered with rabbit, chicken, green beans (bajoqueta), butter beans (garrofó), and rosemary, boasting a crispy caramelized crust on the bottom (socarrat).',
        traditionOrHistory:
          'Born in the Albufera lagoon near Valencia as a field-workers lunch dish. Authentic paella contains rabbit and chicken, never chorizo, and is strictly a lunchtime meal.',
        flavorProfile: 'Smoky, aromatic saffron, rich savory rice with crunchy socarrat bites.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Paella de Verduras (cooked with artichokes, broad beans, peppers, and wild mushrooms).',
        typicalCostUSD: 18,
        typicalCostLocalCurrency: '€16.50',
        bestAuthenticPlaces: [
          'Casa Carmela (Playa de la Malvarrosa, Valencia)',
          'Restaurante Levante (Benisanó, Valencia)',
          'Arrocería D’Berto or El Chiringuito (Alicante/Valencia coast)',
        ],
      },
      {
        name: 'Tortilla Española',
        localName: 'Tortilla de Patatas',
        category: 'Signature Main',
        description:
          'Classic Spanish potato omelette made by gently poaching thinly sliced potatoes and onions in copious Spanish olive oil, folding them into beaten eggs, and searing until the exterior is golden while the center remains slightly runny (poco hecha) or creamy.',
        traditionOrHistory:
          'Documented as early as 1817 in Navarre. A national debate perpetually rages over "concebollistas" (with onion) vs. "sincebollistas" (without onion).',
        flavorProfile: 'Velvety, rich egg custard texture with sweet caramelized onions and tender olive-oil infused potatoes.',
        vegetarianFriendly: true,
        typicalCostUSD: 4.2,
        typicalCostLocalCurrency: '€3.80 / pincho',
        bestAuthenticPlaces: [
          'Casa Dani (Mercado de la Paz, Madrid)',
          'Bar Néstor (San Sebastián - Basque Country)',
          'El Pimpi (Málaga)',
        ],
      },
      {
        name: 'Jamón Ibérico de Bellota',
        localName: 'Jamón 100% Ibérico de Bellota (Pata Negra)',
        category: 'Signature Main',
        description:
          'Paper-thin, room-temperature hand-carved slices of cured ham from free-range black Iberian pigs that forage on acorns (bellotas) in oak dehesa pastures, cured for 36 to 48 months.',
        traditionOrHistory:
          'Spain’s undisputed culinary crown jewel. The oleic acid from acorns infiltrates the meat fat, melting instantly on the human tongue at body temperature (37°C).',
        flavorProfile: 'Nutty, deeply sweet-savory umami, silky melting fat, complex cured depth.',
        vegetarianFriendly: false,
        typicalCostUSD: 24,
        typicalCostLocalCurrency: '€22.00 / ración',
        bestAuthenticPlaces: [
          'Mercado San Miguel & Casa González (Madrid)',
          'Cinco Jotas (Salamanca / Jabugo)',
          'Mesón Cinco Jotas (Seville)',
        ],
      },
      {
        name: 'Gazpacho Andaluz',
        localName: 'Gazpacho Andaluz',
        category: 'Soup / Stew',
        description:
          'Chilled raw soup blended silky-smooth from vine-ripened tomatoes, cucumbers, green bell peppers, garlic, stale crusty bread, sherry vinegar (Vinagre de Jerez), and premium extra virgin olive oil.',
        traditionOrHistory:
          'Ancient Andalusian agricultural staple pre-dating tomatoes (originally Roman garlic and bread broth). Modern gazpacho was perfected in Seville and Córdoba after Columbus brought New World tomatoes.',
        flavorProfile: 'Crisp, refreshingly tart, garlic-scented, peppery olive oil finish.',
        vegetarianFriendly: true,
        typicalCostUSD: 5.5,
        typicalCostLocalCurrency: '€5.00',
        bestAuthenticPlaces: [
          'El Rinconcillo (Seville - founded 1670)',
          'Taberna Salinas (Córdoba)',
          'Bodegas Castañeda (Granada)',
        ],
      },
      {
        name: 'Pulpo a la Gallega',
        localName: 'Polbo á Feira',
        category: 'Seafood Delicacy',
        description:
          'Tender boiled octopus sliced into thick disks with copper kitchen shears over boiled potatoes, seasoned heavily with coarse sea salt crystals, spicy and sweet pimentón de la Vera paprika, and lavishly drizzled with olive oil on a round wooden platter.',
        traditionOrHistory:
          'Galician market fair dish perfected by traveling muleteers who preserved dried octopus with paprika from Extremadura.',
        flavorProfile: 'Firm yet melt-in-mouth octopus, smoky pimentón heat, sea salt crunch, earthy potatoes.',
        vegetarianFriendly: false,
        typicalCostUSD: 17,
        typicalCostLocalCurrency: '€15.50',
        bestAuthenticPlaces: [
          'Pulpería Melide (A Coruña)',
          'Mesón do Pulpo (Santiago de Compostela)',
          'O Pulpeiro (Vigo)',
        ],
      },
    ],
    dietaryRestrictions: {
      vegetarianRating: 'Very Easy',
      veganRating: 'Moderate / Focus on Specialty Spots',
      glutenFreeRating: 'Very High Awareness',
      summary:
        'Spanish culture loves vegetables, legumes, and olive oil, making it naturally friendly for vegetarians. Tapas bars feature Pimientos de Padrón, Tortilla, Berenjenas con Miel (fried eggplant with cane honey), and Escalivada (roasted peppers and onions). Spain has legally mandated allergen labelling across all hospitality menus (14 EU allergens with clear gluten, dairy, and nut icons).',
      hiddenNonVegIngredients: [
        'Jamón serrano diced cubes tossed into vegetable dishes (e.g. Habitas con jamón, Espinacas con garbanzos)',
        'Chicken or ham broth (caldo de pollo/jamón) used to cook paella and vegetable risottos',
        'Gelatin or animal fat in some traditional bakery sweets',
      ],
      helpfulLocalPhrases: [
        {
          phrase: 'Soy vegetariano / vegetariana.',
          english: 'I am vegetarian (male / female).',
          phonetic: 'soy veh-heh-tah-RYAH-noh / nah',
        },
        {
          phrase: '¿Lleva carne, jamón o caldo de pollo?',
          english: 'Does it contain meat, ham, or chicken broth?',
          phonetic: 'YEH-vah KAHR-neh, hah-MOHN oh KAHL-doh deh POH-yoh?',
        },
        {
          phrase: 'Sin carne ni pescado, por favor.',
          english: 'Without meat or fish, please.',
          phonetic: 'seen KAHR-neh nee pehs-KAH-doh, poor fah-VOHR',
        },
        {
          phrase: '¿Tienen opciones para celíacos (sin gluten)?',
          english: 'Do you have gluten-free / celiac options?',
          phonetic: 'TYEH-nehn ohp-SYOH-nehs PAH-rah seh-LEE-ah-kohs?',
        },
      ],
      stapleVegDishes: [
        'Pimientos de Padrón fritos (blistered mild green peppers with sea salt)',
        'Salmorejo sin jamón ni huevo (creamy chilled tomato and garlic soup)',
        'Berenjenas fritas con miel de caña (crisp eggplant with molasses)',
        'Tortilla de patatas con pan con tomate',
        'Champiñones al ajillo (sautéed garlic mushrooms)',
      ],
    },
    expatHurdles: [
      {
        title: 'Late Dining Timelines',
        category: 'Meal Timings & Schedules',
        description:
          'Restaurants do not open for dinner until 8:30 PM or 9:00 PM. Arriving at 7:00 PM expecting dinner will find locked dining rooms and baffled staff.',
        workaroundTip:
          'Adopt the Spanish rhythm: eat your main meal at 2:30 PM (Menú del Día), enjoy a late afternoon coffee/tostada at 6:00 PM, and go for evening tapas at 9:00 PM.',
      },
      {
        title: 'Ordering at Busy Tapas Bars',
        category: 'Ordering & Etiquette',
        description:
          'Crowded tapas bars don’t have queues or hostesses. You must squeeze to the counter, catch the bartender’s eye, and order assertively.',
        workaroundTip:
          'Make direct eye contact, raise your index finger slightly, and say "¡Oye, buenas!" or "Cuando puedas, jefe". Place your drink order first, then tapas.',
      },
      {
        title: 'Splitting the Bill ("Separar la cuenta")',
        category: 'Payment & Tipping',
        description:
          'Unlike US restaurants, Spanish waitstaff dislike itemizing checks for 6 different credit cards. Tipping is also strictly discretionary (small change only).',
        workaroundTip:
          'Elect one person to pay the full check with card, and use Bizum (Spain’s instant phone bank transfer app) or Revolut to settle between yourselves.',
      },
    ],
    costsAndHygiene: {
      streetFoodOrMarketMealUSD: 6.0,
      casualRestaurantMealUSD: 14.0,
      midRangeDinnerForTwoUSD: 44.0,
      highEndFineDiningUSD: 110.0,
      localBeerOrWineGlassUSD: 2.5,
      specialtyCoffeeUSD: 2.0,
      groceriesVsDiningOutVerdict:
        'The weekday "Menú del Día" (€12 to €16 including wine and dessert) is the gold standard of value in Southern Europe. Many retirees cook at home during weekends and eat out for lunch during the week.',
      waterSafety: '100% Safe from Tap',
      waterDetails:
        'Tap water is completely safe across Spain (Canal de Isabel II in Madrid is celebrated for exceptional mountain taste). In Mediterranean coastal resort towns, it is safe but high in calc minerals, so many residents use a Brita filter.',
      eatingOutHygieneScore: 95,
      hygieneGuidance:
        'Sanitary standards in restaurants and bars are strictly enforced by autonomous regional health inspectors. Throwing paper napkins on the floor in traditional old-school tapas bars was a historic tradition (sign of high turnover), but kitchens adhere to strict EU standards.',
      streetFoodSafetyTips: [
        'Outdoor market chiringuitos and festival food trailers are completely hygienic.',
        'Choose tapas displayed under refrigerated glass cases at the bar counter.',
      ],
      produceWashingAdvice:
        'Standard tap water wash is all that is required for fresh greens and citrus bought at municipal markets or Mercadona.',
    },
    marketAndGroceryCulture: {
      freshMarketsOverview:
        'Every district has its covered market (Mercado de Abastos) where fishmongers, butchers, and green grocers know their regular patrons by name. Seafood is delivered daily directly from coastal fish auctions (lonjas).',
      supermarketChains: ['Mercadona', 'Carrefour', 'Lidl', 'Aldi', 'Dia', 'El Corte Inglés Supermercado'],
      importedWesternGoodsAvailability: 'Widely Available in Supermarkets',
    },
  },

  thailand: {
    countryId: 'thailand',
    countryName: 'Thailand',
    cuisineHeadline: 'Night Market Woks, Fiery Herbal Balance, Street-Cart Pad Thai & Sweet Mango Sticky Rice',
    culinaryTraditionsOverview:
      'Thai cuisine is world-renowned for its harmony of the five core tastes: sour, sweet, salty, bitter, and spicy. Thai culture does not revolve around heavy sit-down 3-course formalities; instead, locals "graze" continuously throughout the day at open-air street carts, night markets, and mom-and-pop shophouses ("raan a-han tam sang"). Dining is an informal, communal joy centered on steaming jasmine rice (Khao Hom Mali) shared with fragrant curries and stir-fried greens.',
    routines: [
      {
        mealName: 'Breakfast',
        timing: '6:30 AM – 8:30 AM',
        typicalFoods: [
          'Jok (creamy Thai rice congee with minced pork meatballs, soft poached egg, and ginger slivers)',
          'Khao Tom (clear broth rice soup with fish or shrimp)',
          'Moo Ping (marinated sweet-savory grilled pork skewers) with sticky rice in a plastic pouch',
          'Oliang (sweet traditional Thai iced coffee)',
        ],
        culturalImportance:
          'Quick, soothing, and easily picked up on street corners from sidewalk pushcarts on the morning walk.',
      },
      {
        mealName: 'Mid-Morning Coffee & Snack',
        timing: '10:00 AM – 11:30 AM',
        typicalFoods: ['Cha Yen (orange Thai iced tea with condensed milk)', 'Kluay Tod (crispy sesame-battered fried bananas)'],
        culturalImportance:
          'A sweet chilled refresh during the rising tropical heat. Thailand has an extraordinary specialty cafe and cold brew scene.',
      },
      {
        mealName: 'Lunch',
        timing: '12:00 PM – 1:30 PM',
        typicalFoods: [
          'Guay Tiew (rice noodle soup with braised beef, pork, or wontons)',
          'Pad Kra Pao Gai Khai Dao (spicy holy basil chicken with jasmine rice and crispy-edged fried egg)',
          'Khao Man Gai (poached chicken over seasoned garlic rice with ginger chili dipping sauce)',
        ],
        culturalImportance:
          'Fast, hearty, and highly customizable. Shophouse cooks whip up individual orders in flaming woks in 90 seconds.',
      },
      {
        mealName: 'Afternoon Snack / Merienda',
        timing: '3:30 PM – 5:00 PM',
        typicalFoods: [
          'Fresh cut fruit (papaya, pineapple, dragonfruit, mango) with chili-sugar dip (prik glab klua)',
          'Kanom Krok (crispy coconut custard cups)',
        ],
        culturalImportance:
          'Fruit carts on almost every street corner slice cold fresh fruit to order for 50 cents (20 THB).',
      },
      {
        mealName: 'Dinner',
        timing: '6:30 PM – 9:00 PM',
        typicalFoods: [
          'Communal Thai family dinner with Tom Yum Goong soup, Massaman Curry, and stir-fried morning glory (Pad Pak Boong)',
          'Night market grazing: Som Tum papaya salad, grilled squid skewers, and Pad Thai',
          'Mango Sticky Rice (Khao Niew Mamuang)',
        ],
        culturalImportance:
          'Communal sharing. Rather than single plated meals, dishes are placed in the center and shared with serving spoons.',
      },
    ],
    nationalDishes: [
      {
        name: 'Pad Thai Boran',
        localName: 'Pad Thai (ผัดไทย)',
        category: 'Street Food / Snack',
        description:
          'Stir-fried thin rice noodles wok-charred with tamarind paste, palm sugar, fish sauce, eggs, firm pressed yellow tofu, dried baby shrimp, and sweet preserved radish, garnished with crushed roasted peanuts, fresh bean sprouts, and lime wedge.',
        traditionOrHistory:
          'Promoted during WWII by Prime Minister Plaek Phibunsongkhram to foster national identity and conserve rice grain stocks by utilizing rice flour noodles.',
        flavorProfile: 'Balanced sweet-tart tamarind, savory umami wok-hei (breath of the wok), nutty crunch.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Pad Thai Jay (ผัดไทยเจ) - Cooked with soy sauce and lime instead of fish sauce, no egg, extra tofu.',
        typicalCostUSD: 2.2,
        typicalCostLocalCurrency: '฿70 – ฿90',
        bestAuthenticPlaces: [
          'Thip Samai Pad Thai (Pratu Phi, Bangkok)',
          'Pad Thai Fai Ta Lu by Michelin Chef Andy Yang (Dinsor Rd, Bangkok)',
          'Night markets across Chiang Mai & Hua Hin',
        ],
      },
      {
        name: 'Tom Yum Goong',
        localName: 'Tom Yum Goong (ต้มยำกุ้ง)',
        category: 'Soup / Stew',
        description:
          'Fiery, aromatic hot and sour soup infused with fresh lemongrass stalks, bruised galangal, makrut lime leaves, crushed bird’s eye chilies (prik kee noo), and fresh river prawns, finished with lime juice and evaporated milk (Tom Yum Nam Khon).',
        traditionOrHistory:
          'The quintessential soul of Central Thai cuisine, reflecting ancient riverine lifestyle and medicinal herbal wisdom.',
        flavorProfile: 'Intensely sour and citrusy, fiery chili punch, fragrant medicinal galangal and lemongrass.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Tom Yum Hed (ต้มยำเห็ด) - Made with an assortment of straw, oyster, and shimeji mushrooms in vegetable stock.',
        typicalCostUSD: 4.5,
        typicalCostLocalCurrency: '฿150 – ฿180',
        bestAuthenticPlaces: [
          'Tom Yum Goong Banglamphu (Street stall outside car park, Banglamphu, Bangkok)',
          'Rung Rueang Pork Noodles & Soups (Sukhumvit 26, Bangkok)',
          'Baan Rim Pa (Patong, Phuket)',
        ],
      },
      {
        name: 'Khao Soi Gai',
        localName: 'Khao Soi (ข้าวซอยไก่)',
        category: 'Signature Main',
        description:
          'Northern Thai coconut curry noodle soup featuring tender bone-in chicken thighs submerged in rich, fragrant golden curry broth, topped with crispy fried egg noodles and served with pickled mustard greens, raw shallots, and fresh lime.',
        traditionOrHistory:
          'Born in Chiang Mai and Northern Thailand with influences from traveling Yunnanese Muslim (Chin Haw) traders along ancient spice routes.',
        flavorProfile: 'Rich velvety coconut cream, warming turmeric and cardamom spices, tangy pickle crunch.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Khao Soi Jay (made with pressed tofu, mushrooms, and rich coconut-curry broth).',
        typicalCostUSD: 2.5,
        typicalCostLocalCurrency: '฿80 – ฿100',
        bestAuthenticPlaces: [
          'Khao Soi Lam Duan Fah Ham (Charoen Rat Rd, Chiang Mai)',
          'Khao Soi Mae Sai (Ratchaphuek Rd, Chiang Mai)',
          'Ongtong Khaosoi (Ari, Bangkok)',
        ],
      },
      {
        name: 'Som Tum Thai',
        localName: 'Som Tum (ส้มตำไทย)',
        category: 'Signature Main',
        description:
          'Crisp green shredded unripe papaya hand-pounded in a wooden mortar and pestle with bird’s eye chilies, garlic, long beans, cherry tomatoes, roasted peanuts, dried shrimp, palm sugar, tamarind, and lime juice.',
        traditionOrHistory:
          'Hailing from Isan (Northeast Thailand) with Lao roots, Som Tum is Thailand’s most universally eaten salad, eaten daily alongside sticky rice and grilled chicken (Gai Yang).',
        flavorProfile: 'Extremely fresh, intensely sour lime, sweet palm sugar, fiery chili crunch.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Som Tum Jay (ส้มตำเจ) - mortar wiped clean, no dried shrimp, no fish sauce, seasoned with soy sauce and lime.',
        typicalCostUSD: 1.8,
        typicalCostLocalCurrency: '฿60 – ฿70',
        bestAuthenticPlaces: [
          'Somtum Der (Sala Daeng, Silom, Bangkok)',
          'Jay So Somtam (Silom Soi Convent, Bangkok)',
          'Street vendors at Nimman & Old City (Chiang Mai)',
        ],
      },
      {
        name: 'Mango Sticky Rice',
        localName: 'Khao Niew Mamuang (ข้าวเหนียวมะม่วง)',
        category: 'Dessert / Pastry',
        description:
          'Warm sweet sticky rice steeped in salted coconut milk cream, served alongside sweet chilled slices of ripe golden Nam Dok Mai mango, sprinkled with toasted crispy yellow mung beans.',
        traditionOrHistory:
          'Seasonal delicacy perfected during the hot mango harvest season (March to June), now enjoyed year-round across night markets.',
        flavorProfile: 'Sweet floral mango, rich sweet-salty coconut sticky rice, pleasant mung bean crunch.',
        vegetarianFriendly: true,
        typicalCostUSD: 3.0,
        typicalCostLocalCurrency: '฿100 – ฿120',
        bestAuthenticPlaces: [
          'Mae Varee Mango Sticky Rice (Thonglor, Bangkok)',
          'Kor Panich (Tanao Rd, Bangkok - royal family supplier since 1932)',
          'Chiang Mai Night Bazaar street stalls',
        ],
      },
    ],
    dietaryRestrictions: {
      vegetarianRating: 'Very Easy',
      veganRating: 'Very Easy',
      glutenFreeRating: 'Very High Awareness',
      summary:
        'Thailand is a vegetarian paradise thanks to Buddhist traditions, but requires one crucial vigilance: traditional street stalls use Fish Sauce (Nam Pla) and Oyster Sauce (Nam Man Hoy) as default salt in nearly every stir fry. However, Thailand has an official vegan code known as "Jay" (เจ)—symbolized by a bright yellow flag with red Thai script. Any restaurant or cart with this flag is 100% strictly vegan (no meat, no seafood, no fish sauce, no eggs, no garlic/onions).',
      hiddenNonVegIngredients: [
        'Fish Sauce (Nam Pla - น้ำปลา) added to almost all vegetable soups and stir-fries',
        'Oyster Sauce (Nam Man Hoy - น้ำมันหอย) in green stir-fries like morning glory',
        'Shrimp paste (Kapi - กะปิ) used as the flavor base for green and red curry pastes',
        'Chicken powder seasoning (Knorr cubes) dissolved into vegetable noodle broths',
      ],
      helpfulLocalPhrases: [
        {
          phrase: 'Gin Jay (กินเจ)',
          english: 'I eat strictly vegan (Buddhist Jay diet).',
          phonetic: 'gin JAY (most effective phrase for zero animal products)',
        },
        {
          phrase: 'Mai sai nam pla (ไม่ใส่น้ำปลา)',
          english: 'Do not put fish sauce.',
          phonetic: 'my sigh nahm PLAH',
        },
        {
          phrase: 'Mangsawirat (มังสวิรัติ)',
          english: 'I am vegetarian (may allow egg/milk).',
          phonetic: 'mung-sah-wee-RAHT',
        },
        {
          phrase: 'Mai pet (ไม่เผ็ด) / Pet nit noi (เผ็ดนิดหน่อย)',
          english: 'Not spicy / Just a little spicy.',
          phonetic: 'my PET / pet neat NOY',
        },
      ],
      stapleVegDishes: [
        'Pad Pak Ruam Mit Jay (stir-fried mixed vegetables with soy sauce)',
        'Tom Kha Hed Jay (aromatic coconut galangal soup with mushrooms)',
        'Pad Thai Jay (vegan Pad Thai with tofu and crushed peanuts)',
        'Spring rolls (Por Pia Tod) with sweet plum sauce',
        'Massaman Curry Tofu with potatoes and peanuts',
      ],
    },
    expatHurdles: [
      {
        title: 'Extreme Chili Heat ("Pet Mak")',
        category: 'Spice & Palate Adaptation',
        description:
          'Local street woks cook with fresh bird’s eye chilies that can overwhelm foreign palates within seconds. Saying "mild" often still produces a dish with 3 whole crushed chilies.',
        workaroundTip:
          'Explicitly say "Mai Pet" (not spicy) or "Pet Nit Noi" (only a tiny bit spicy). If burned, drink milk or eat plain white jasmine rice—water will spread the capsaicin.',
      },
      {
        title: 'Street Stall Seating & Ordering',
        category: 'Ordering & Etiquette',
        description:
          'Street cart menus are frequently written exclusively in Thai script without English translations or prices.',
        workaroundTip:
          'Use the Google Translate camera live view on your phone, point to what other patrons are eating and smile, or learn 3 key dish names: Pad Kra Pao, Khao Pad (fried rice), and Pad Thai.',
      },
      {
        title: 'Eating with Fork & Spoon (No Knives)',
        category: 'Ordering & Etiquette',
        description:
          'Thai meals are eaten with a large spoon in the right hand and a fork in the left. Putting the fork directly into your mouth is traditionally considered unrefined.',
        workaroundTip:
          'Use the fork only to push food onto the spoon, and eat exclusively from the spoon. Chopsticks are reserved exclusively for noodle soups.',
      },
      {
        title: 'Sugar Added to Savory Dishes',
        category: 'Hidden Ingredients / Allergens',
        description:
          'Thai cooks frequently add white sugar or condensed milk to curries, stir-fries, and iced coffees. New expats are often surprised by sweetness in meat dishes.',
        workaroundTip:
          'Request "Mai sai nam tan" (do not add sugar) when ordering street woks, or balance sweet notes with fresh squeezed lime.',
      },
    ],
    costsAndHygiene: {
      streetFoodOrMarketMealUSD: 2.2,
      casualRestaurantMealUSD: 5.5,
      midRangeDinnerForTwoUSD: 22.0,
      highEndFineDiningUSD: 65.0,
      localBeerOrWineGlassUSD: 2.8,
      specialtyCoffeeUSD: 2.2,
      groceriesVsDiningOutVerdict:
        'In Thailand, cooking at home is often MORE expensive and time-consuming than eating out. With complete delicious street meals costing $2 to $3 (70–100 THB), most expats rarely use their kitchen stoves.',
      waterSafety: 'Bottled or Filtered Only',
      waterDetails:
        'Never drink municipal tap water directly in Thailand. Tap water is safe for showering and brushing teeth, but drinking water must be bottled (7-Eleven sells large bottles for 40 cents) or filtered via reverse osmosis home dispensers.',
      eatingOutHygieneScore: 84,
      hygieneGuidance:
        'Street food in Thailand is extraordinarily popular, fast-moving, and generally very safe because food is cooked fresh to order at blistering wok temperatures (300°C) right before your eyes.',
      streetFoodSafetyTips: [
        'Always pick vendors with a continuous line of local Thai patrons; high turnover means ingredients never sit stagnant.',
        'Commercial ice with cylindrical tube shapes and a hole in the center is factory-purified and safe; avoid chipped ice blocks handled with bare hands.',
        'Avoid pre-cooked curries sitting in lukewarm trays late in the afternoon; order freshly wok-fried meals.',
      ],
      produceWashingAdvice:
        'Wash supermarket and market produce in filtered water or with a splash of baking soda / apple cider vinegar to remove surface pesticide residues.',
    },
    marketAndGroceryCulture: {
      freshMarketsOverview:
        'Every district has vibrant morning "Talat Sot" (fresh wet markets) opening at 5:00 AM and bustling night markets (like Chiang Mai’s Sunday Walking Street or Bangkok’s Jodd Fairs) packed with seafood grills and tropical smoothie stands.',
      supermarketChains: ['Lotus’s (Tesco)', 'Big C', 'Tops Supermarket', 'Villa Market (premium expat imports)', 'Gourmet Market (Siam Paragon)'],
      importedWesternGoodsAvailability: 'Available in Specialty Expat Delis',
    },
  },

  mexico: {
    countryId: 'mexico',
    countryName: 'Mexico',
    cuisineHeadline: 'Street Taquerías, Ancient Moles, Hand-Pressed Corn Tortillas & Fresh Ceviches',
    culinaryTraditionsOverview:
      'Traditional Mexican cuisine is so culturally monumental that UNESCO inscribed it as an Intangible Cultural Heritage of Humanity. Rooted in ancient Mesoamerican staples (corn, beans, and chilis) combined with European ingredients, Mexican food is rich, complex, and intensely varied by region. From Baja California fish tacos and Yucatecan cochinita pibil to the baroque moles of Oaxaca and Puebla, dining is an expressive, joyful celebration accompanied by fresh salsas, limes, and mezcal.',
    routines: [
      {
        mealName: 'Breakfast',
        timing: '8:00 AM – 10:00 AM',
        typicalFoods: [
          'Chilaquiles Verdes o Rojos (fried corn tortilla chips simmered in salsa, topped with crema, queso fresco, onion rings, and fried eggs)',
          'Huevos Rancheros or Motuleños',
          'Café de Olla (brewed in clay pot with cinnamon and piloncillo raw sugar)',
          'Pan dulce (sweet concha bread)',
        ],
        culturalImportance:
          'Hearty, savory, and slow. Breakfast is a revered morning feast that fuels the day until mid-afternoon.',
      },
      {
        mealName: 'Mid-Morning Coffee & Snack',
        timing: '11:00 AM – 12:00 PM',
        typicalFoods: ['Tamales al vapor (steamed masa in corn husks)', 'Jugo verde (green cactus/nopal juice)', 'Atole'],
        culturalImportance:
          'Tamale street carts outside metro stations and plaza corners provide quick, comforting nourishment.',
      },
      {
        mealName: 'Lunch',
        timing: '2:00 PM – 4:30 PM',
        typicalFoods: [
          'Comida Corrida (affordable multi-course fixed lunch: soup, rice/beans, main stew, agua fresca)',
          'Carne asada with fresh guacamole and hand-pressed corn tortillas',
          'Mole Poblano with chicken and warm tortillas',
        ],
        culturalImportance:
          'The main meal of the day ("La Comida"). Offices empty out as families and colleagues sit down together.',
      },
      {
        mealName: 'Afternoon Snack / Merienda',
        timing: '6:00 PM – 7:30 PM',
        typicalFoods: ['Agua fresca (Horchata, Jamaica hibiscus, Tamarindo)', 'Paletas (artisanal fruit popsicles)', 'Elote / Esquites (street corn with cotija cheese and mayo)'],
        culturalImportance:
          'Evening plaza strolls ("el paseo") are synonymous with grabbing a cup of esquites from street carts.',
      },
      {
        mealName: 'Dinner',
        timing: '8:30 PM – 10:30 PM',
        typicalFoods: [
          'Tacos al Pastor from sidewalk taquerías',
          'Quesadillas de comal with flor de calabaza (squash blossom) or huitlacoche',
          'Tortas (warm toasted Mexican sandwiches)',
        ],
        culturalImportance:
          'Informal and vibrant. Expats and locals cluster around taco trompo spits watching taqueros slice pork and pineapple.',
      },
    ],
    nationalDishes: [
      {
        name: 'Tacos al Pastor',
        localName: 'Tacos al Pastor',
        category: 'Street Food / Snack',
        description:
          'Thinly sliced pork marinated in achiote paste, dried guajillo and ancho chilis, and vinegar, roasted on a vertical spinning spit (trompo) topped with a peeled pineapple, sliced directly onto warm double corn tortillas with chopped cilantro, onions, and a flick of roasted pineapple.',
        traditionOrHistory:
          'Created in Puebla in the 1930s by Lebanese Christian immigrants adapting shawarma spit-roasting to local Mexican pork and chilies.',
        flavorProfile: 'Smoky, tangy achiote, caramelized pork, sweet pineapple burst, herbaceous cilantro.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Tacos de Champiñones al Pastor or Tacos de Jamaica (hibiscus flower al pastor).',
        typicalCostUSD: 1.2,
        typicalCostLocalCurrency: '$22 – $28 MXN / taco',
        bestAuthenticPlaces: [
          'Taquería El Turix (Polanco, Mexico City)',
          'El Huequito & El Vilsito (Narvarte, Mexico City)',
          'Taquería Franc (Tijuana) & Tacos Pepe (Puerto Vallarta)',
        ],
      },
      {
        name: 'Mole Poblano',
        localName: 'Mole Poblano Tradicional',
        category: 'Signature Main',
        description:
          'Luxurious, thick dark sauce crafted from over 30 roasted ingredients—including dried mulato, ancho, and pasilla chilies, Mexican dark chocolate, plantains, cloves, sesame seeds, almonds, and raisins—ladled over tender poultry and sprinkled with toasted sesame.',
        traditionOrHistory:
          'Invented in the 17th century by Sor Andrea de la Asunción at the Convent of Santa Rosa in Puebla to honor a visiting archbishop.',
        flavorProfile: 'Rich, bittersweet dark chocolate undertone, complex earthy chili warmth, subtle aromatic spices.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Mole con Enmoladas de Queso (cheese enchiladas smothered in mole sauce).',
        typicalCostUSD: 11,
        typicalCostLocalCurrency: '$200 – $240 MXN',
        bestAuthenticPlaces: [
          'El Mural de los Poblanos (Puebla)',
          'La Casa de la Abuela (Oaxaca City)',
          'Restaurante Nicos (Azcapotzalco, Mexico City)',
        ],
      },
      {
        name: 'Chiles en Nogada',
        localName: 'Chiles en Nogada',
        category: 'Signature Main',
        description:
          'Poblano chili peppers stuffed with picadillo (shredded pork and beef cooked with diced apples, pears, peaches, and raisins), bathed in a velvety chilled walnut-cream sauce (nogada), and garnished with bright red pomegranate seeds and fresh parsley.',
        traditionOrHistory:
          'Created in 1821 by Augustinian nuns in Puebla to celebrate Mexican Independence; its green chili, white sauce, and red pomegranate seeds mirror the three colors of the Mexican flag.',
        flavorProfile: 'Savory-sweet spiced meat, creamy nutty walnut sauce, tart juicy pomegranate pop.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Stuffed with sautéed wild mushrooms, plantains, and dried fruits.',
        typicalCostUSD: 16,
        typicalCostLocalCurrency: '$300 – $350 MXN',
        bestAuthenticPlaces: [
          'Fonda de Santa Clara (Puebla)',
          'Azul Histórico (Downtown Mexico City)',
          'Restaurante Las Campanas (Querétaro)',
        ],
      },
      {
        name: 'Pozole Verde / Rojo',
        localName: 'Pozole Tradicional',
        category: 'Soup / Stew',
        description:
          'Hearty pre-Hispanic ceremonial broth simmered with giant hominy corn kernels (cacahuazintle) and pork or chicken, customized table-side with lime juice, shredded iceberg lettuce, sliced radishes, dried oregano, crushed chili piquín, and crispy tostadas.',
        traditionOrHistory:
          'Ancient sacred Aztec dish cooked for emperors. Today it is the cornerstone of Mexican holidays, particularly Independence Day (El Grito, September 15).',
        flavorProfile: 'Robust, comforting hominy corn broth, herbal oregano, zesty lime, crunchy fresh radish.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Pozole de Setas (hearty oyster mushroom and zucchini blossom pozole).',
        typicalCostUSD: 6.5,
        typicalCostLocalCurrency: '$120 – $140 MXN',
        bestAuthenticPlaces: [
          'Casa de Toño (numerous locations in Mexico City - open 24/7)',
          'La Chulada Pozolería (Guadalajara)',
          'Pozolería Moctezuma (Guerrero style, CDMX)',
        ],
      },
    ],
    dietaryRestrictions: {
      vegetarianRating: 'Very Easy',
      veganRating: 'Very Easy',
      glutenFreeRating: 'Effortless & Abundant',
      summary:
        'Mexico is exceptionally hospitable for vegetarians and gluten-free eaters. Authentic Mexican corn tortillas are naturally 100% gluten-free (nixtamalized corn, water, and lime). Indigenous staples like beans, squash blossoms, nopales (cactus pads), avocados, and mushrooms are omnipresent. The main caution for vegetarians is asking whether refried beans are cooked with pork lard (manteca de cerdo).',
      hiddenNonVegIngredients: [
        'Pork lard (Manteca de cerdo) frequently used in refried beans (frijoles refritos) and tamale dough',
        'Chicken bouillon (Knorr Suiza powder) commonly stirred into Mexican red rice (arroz rojo)',
        'Gelatin in traditional party desserts',
      ],
      helpfulLocalPhrases: [
        {
          phrase: 'Soy vegetariano / vegetariana.',
          english: 'I am vegetarian (male / female).',
          phonetic: 'soy veh-heh-tah-RYAH-noh / nah',
        },
        {
          phrase: '¿Los frijoles están hechos con manteca de cerdo?',
          english: 'Are the beans made with pork lard?',
          phonetic: 'lohs free-HOH-lehs ehs-TAHN EH-chohs kohn mahn-TEH-kah deh SEHR-doh?',
        },
        {
          phrase: '¿El arroz tiene caldo de pollo?',
          english: 'Does the rice have chicken broth?',
          phonetic: 'ehl ah-ROHS TYEH-neh KAHL-doh deh POH-yoh?',
        },
        {
          phrase: 'Sin carne, por favor (solo queso y verduras).',
          english: 'Without meat, please (only cheese and vegetables).',
          phonetic: 'seen KAHR-neh poor fah-VOHR (SOH-loh KEH-soh ee vehr-DOO-rahs)',
        },
      ],
      stapleVegDishes: [
        'Quesadillas de Flor de Calabaza y Huitlacoche (squash blossom & corn truffle quesadillas)',
        'Enchiladas de Queso con Salsa Verde (corn tortillas with cheese and roasted tomatillo salsa)',
        'Tacos de Nopales asados con queso panela (grilled cactus pad tacos)',
        'Guacamole fresco con totopos y pico de gallo',
        'Chilaquiles verdes con frijoles de olla (pot beans without lard)',
      ],
    },
    expatHurdles: [
      {
        title: 'The "Moctezuma’s Revenge" Stomach Adjustment',
        category: 'Spice & Palate Adaptation',
        description:
          'Newcomers often experience digestive upset during their first 2 weeks due to unfamiliar endemic microbes and spicy chili oils.',
        workaroundTip:
          'Acclimate gradually: start with cooked meals and peeled fruits, avoid raw street salads for week 1, and always ask for salsas on the side ("salsa aparte") to test heat levels.',
      },
      {
        title: 'Salsa Heat Levels ("Pica o No Pica")',
        category: 'Spice & Palate Adaptation',
        description:
          'When asking a Mexican server if a salsa is spicy, a response of "No pica nada" (doesn’t burn at all) often translates to blisteringly hot for foreign palates.',
        workaroundTip:
          'Dip the tip of your tortilla chip into the salsa to test before pouring it across your taco. Keep a bowl of guacamole or sour cream nearby.',
      },
      {
        title: 'Drinking Water Rules ("El Garrafón")',
        category: 'Meal Timings & Schedules',
        description:
          'Tap water is not potable for drinking anywhere in Mexico. New expats often wonder how to manage cooking and drinking at home.',
        workaroundTip:
          'Homes use 20-liter purified water jugs called "garrafones" delivered to your doorstep for $2.50 ($45 MXN) or install an under-sink reverse-osmosis system.',
      },
    ],
    costsAndHygiene: {
      streetFoodOrMarketMealUSD: 3.2,
      casualRestaurantMealUSD: 8.5,
      midRangeDinnerForTwoUSD: 32.0,
      highEndFineDiningUSD: 85.0,
      localBeerOrWineGlassUSD: 2.2,
      specialtyCoffeeUSD: 2.5,
      groceriesVsDiningOutVerdict:
        'The weekday "Comida Corrida" lunch special ($4.00–$5.50 for soup, rice, main stew, and fruit water) makes frequent dining out overwhelmingly practical and affordable for expat retirees.',
      waterSafety: 'Bottled or Filtered Only',
      waterDetails:
        'Never drink untreated municipal tap water. All restaurants in Mexico serve ice and drinking water made from purified commercial water (agua purificada). In private homes, everyone drinks from delivered 20L garrafones.',
      eatingOutHygieneScore: 88,
      hygieneGuidance:
        'Street food hygiene has improved dramatically in Mexico. Taquerías that draw large crowds of local families, police officers, and office workers have rapid ingredient turnover and safe standards.',
      streetFoodSafetyTips: [
        'Check that the taco chef handling meat is NOT the same person taking cash payments, or wears a glove when collecting bills.',
        'Choose taquerías where meats are cooked directly in front of you over roaring flames or hot comal griddles.',
        'Squeeze fresh lime juice generously over street tacos—the natural citric acid helps digestion and provides an extra antibacterial layer.',
      ],
      produceWashingAdvice:
        'Soak raw fruits and vegetables from municipal markets in water with 5–8 drops of colloidal silver disinfectant (Microdyn, sold at every grocery checkout in Mexico for $1.50) for 10 minutes.',
    },
    marketAndGroceryCulture: {
      freshMarketsOverview:
        'Traditional municipal markets (Mercados Públicos) and weekly roving street markets (Tianguis) feature mountains of fresh avocados, mangos, papayas, and freshly pressed tortillas at pennies on the dollar.',
      supermarketChains: ['Chedraui Selecto', 'La Comer (gourmet expat favorite)', 'Soriana', 'Walmart México', 'Costco México'],
      importedWesternGoodsAvailability: 'Widely Available in Supermarkets',
    },
  },

  'costa-rica': {
    countryId: 'costa-rica',
    countryName: 'Costa Rica',
    cuisineHeadline: 'Pura Vida Comfort, Breakfast Gallo Pinto, Soda Casados & Fresh Farm-to-Table Fruit',
    culinaryTraditionsOverview:
      'Costa Rican food ("comida típica") is gentle, hearty, colorful, and built around wholesome farm staples: black beans, rice, sweet plantains, fresh white cheese, and garden-fresh vegetables. Eating out is centered around "Sodas"—friendly family-run diners where generous home-cooked plates called "Casados" are served alongside fresh tropical fruit juices. Unlike its northern neighbours, Costa Rican food is remarkably non-spicy, relying instead on Salsa Lizano (a beloved sweet-savory vegetable sauce).',
    routines: [
      {
        mealName: 'Breakfast',
        timing: '6:30 AM – 8:30 AM',
        typicalFoods: [
          'Gallo Pinto (black beans and rice seasoned with onions, peppers, and Salsa Lizano)',
          'Huevos revueltos o fritos (eggs)',
          'Maduro frito (fried sweet plantains)',
          'Queso Turrialba (mild fresh white cheese)',
          'Café chorreado (drip coffee brewed through cloth bag filter)',
        ],
        culturalImportance:
          'The national morning ritual. Eating Gallo Pinto is so foundational to Costa Rican identity that locals say "más tico que el gallo pinto" (more Costa Rican than gallo pinto).',
      },
      {
        mealName: 'Mid-Morning Coffee & Snack',
        timing: '10:00 AM – 11:00 AM',
        typicalFoods: ['Café con leche', 'Pan casero or Empanada de queso'],
        culturalImportance:
          'Quick pause to enjoy the country’s world-renowned Tarrazú or Central Valley highland coffee.',
      },
      {
        mealName: 'Lunch',
        timing: '12:00 PM – 2:00 PM',
        typicalFoods: [
          'Casado (the quintessential plate: rice, black beans, fried plantains, cabbage salad, picadillo vegetable hash, and choice of grilled chicken, beef, or fish)',
          'Natural juice (Refresco natural made with fresh passion fruit, guanabana, or blackberry)',
        ],
        culturalImportance:
          'The primary midday meal. Local sodas fill up with retirees, government workers, and farmers.',
      },
      {
        mealName: 'Afternoon Snack / Merienda',
        timing: '4:00 PM – 5:30 PM',
        typicalFoods: ['Chorreadas (sweet corn pancakes with sour cream / natilla)', 'Café chorreado'],
        culturalImportance:
          'Known as "el café de la tarde", a cherished afternoon chat with family as afternoon rains roll in.',
      },
      {
        mealName: 'Dinner',
        timing: '7:00 PM – 9:00 PM',
        typicalFoods: [
          'Olla de Carne (hearty beef and root vegetable soup with yucca and chayote)',
          'Sopa Negra (black bean soup with poached egg)',
          'Lighter evening Casado or ceviche',
        ],
        culturalImportance:
          'Calm, family-focused dinner at home or at local sodas, often finished with chamomile tea or coffee.',
      },
    ],
    nationalDishes: [
      {
        name: 'Gallo Pinto',
        localName: 'Gallo Pinto Tradicional',
        category: 'Signature Main',
        description:
          'Pre-cooked rice and black beans stir-fried together until speckled ("spotted rooster"), seasoned with finely diced onions, sweet peppers, cilantro, and generous dashes of sweet-tangy Salsa Lizano, served with fried eggs, sweet plantains, and sour cream (natilla).',
        traditionOrHistory:
          'A centuries-old breakfast staple originating in the Central Valley, perfected to make delicious use of the previous evening’s leftover beans and rice.',
        flavorProfile: 'Savory, slightly sweet and herbaceous with tangy Salsa Lizano notes and creamy bean texture.',
        vegetarianFriendly: true,
        typicalCostUSD: 5.5,
        typicalCostLocalCurrency: '₡3,000 – ₡3,500 CRC',
        bestAuthenticPlaces: [
          'Soda Tapia (La Sabana, San José)',
          'Mercado Central Soda Stalls (San José)',
          'Soda La Hormiga (Alajuela / Central Valley)',
        ],
      },
      {
        name: 'Casado Típico',
        localName: 'Casado con Pescado / Pollo / Vegetariano',
        category: 'Signature Main',
        description:
          'The ultimate balanced meal plate: white rice, simmered black beans, sweet caramelized plantains, crisp cabbage and tomato salad (ensalada de repollo), picadillo (diced chayote squash or potatoes), and your choice of grilled fish, chicken breast, or grilled white cheese.',
        traditionOrHistory:
          'Named "casado" (married man) because wives traditionally prepared these colorful, multi-compartment balanced lunches for their husbands working in the fields.',
        flavorProfile: 'Homestyle, wholesome, balanced, savory beans with sweet plantain contrast.',
        vegetarianFriendly: true,
        vegetarianAlternative: 'Casado Vegetariano (features grilled queso Turrialba, extra avocado, and seasonal sautéed vegetables).',
        typicalCostUSD: 7.5,
        typicalCostLocalCurrency: '₡4,000 – ₡5,000 CRC',
        bestAuthenticPlaces: [
          'Soda Tala (Mercado Central, San José)',
          'Soda Viquez (La Fortuna / Arenal)',
          'Restaurante Silvestre (Barrio Amón, San José - elevated version)',
        ],
      },
      {
        name: 'Ceviche Tico',
        localName: 'Ceviche de Corvina',
        category: 'Seafood Delicacy',
        description:
          'Fresh coastal sea bass (corvina) diced finely and cured in fresh lime juice with minced red onions, sweet peppers, and fresh cilantro, served chilled with soda crackers (galletas soda) and plantain chips (patacones).',
        traditionOrHistory:
          'Unlike Peruvian ceviche which cures in minutes, Tico ceviche marinates longer in the refrigerator, creating a tender, zesty seafood staple served in coastal beach towns.',
        flavorProfile: 'Clean, citrusy lime bite, tender sea bass, crisp onion crunch.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Ceviche de Palmito (made with fresh tender hearts of palm instead of fish).',
        typicalCostUSD: 8.0,
        typicalCostLocalCurrency: '₡4,500 – ₡5,500 CRC',
        bestAuthenticPlaces: [
          'Mercado Central Fish Stalls (San José)',
          'Marisquería El Barco (Puntarenas)',
          'Soda Nicole (Manuel Antonio / Quepos)',
        ],
      },
    ],
    dietaryRestrictions: {
      vegetarianRating: 'Very Easy',
      veganRating: 'Very Easy',
      glutenFreeRating: 'Very High Awareness',
      summary:
        'Costa Rica is one of the easiest Latin American destinations for vegetarians and vegans. The standard Casado is readily converted into a vegetarian feast with fried plantains, avocado, black beans, rice, and fresh cheese. Hearts of palm (palmito), papayas, mangoes, and yucca are locally grown and abundant.',
      hiddenNonVegIngredients: [
        'Chicken stock cubes (Consomé de pollo) occasionally added to rice or bean cooking liquid in commercial kitchens',
        'Lard is very rare in Costa Rica (vegetable oil is standard), but always verify in small rural sodas',
      ],
      helpfulLocalPhrases: [
        {
          phrase: 'Soy vegetariano / vegetariana.',
          english: 'I am vegetarian (male / female).',
          phonetic: 'soy veh-heh-tah-RYAH-noh / nah',
        },
        {
          phrase: 'Un Casado vegetariano con aguacate, por favor.',
          english: 'A vegetarian casado with avocado, please.',
          phonetic: 'oon kah-SAH-doh veh-heh-tah-RYAH-noh kohn ah-gwah-KAH-teh',
        },
        {
          phrase: '¿Los frijoles tienen caldo de carne?',
          english: 'Do the beans have meat broth?',
          phonetic: 'lohs free-HOH-lehs TYEH-nehn KAHL-doh deh KAHR-neh?',
        },
      ],
      stapleVegDishes: [
        'Casado Vegetariano con huevo o queso frito',
        'Ceviche de Palmito (hearts of palm ceviche)',
        'Gallo Pinto con aguacate y maduros',
        'Picadillo de Chayote con maíz',
        'Patacones con frijoles molidos y guacamole (smashed green plantains with mashed beans)',
      ],
    },
    expatHurdles: [
      {
        title: 'Mild Palate & Lack of Native Spicy Heat',
        category: 'Spice & Palate Adaptation',
        description:
          'Many North American expats anticipate spicy Mexican-style salsas in Costa Rica and are disappointed to find local food virtually heat-free.',
        workaroundTip:
          'Every soda table features "Chileras"—glass jars of pickled onions, carrots, and spicy habanero or panama chilies in vinegar. Spoon the chilera vinegar over your casado to add heat.',
      },
      {
        title: 'The Mandatory 23% Tip & Tax Addition ("10% + 13%")',
        category: 'Payment & Tipping',
        description:
          'Sit-down restaurant menu prices in Costa Rica often do not include the 13% VAT (IVA) and mandatory 10% service tip ("servicio").',
        workaroundTip:
          'Check if the menu states "Impuestos incluidos" (taxes included). If not, your final check will be 23% higher than the printed menu items. You do not need to leave additional tip beyond the 10% already on the bill.',
      },
      {
        title: 'High Supermarket Prices on Imported Brands',
        category: 'Payment & Tipping',
        description:
          'Imported North American groceries (cereals, peanut butter, cheeses, wine) carry heavy import tariffs and can cost double US prices at Auto Mercado.',
        workaroundTip:
          'Buy fresh produce, dairy, and coffee at weekly farmers markets ("Ferias del Agricultor") on Saturday mornings for enormous savings and peak organic freshness.',
      },
    ],
    costsAndHygiene: {
      streetFoodOrMarketMealUSD: 4.5,
      casualRestaurantMealUSD: 9.0,
      midRangeDinnerForTwoUSD: 36.0,
      highEndFineDiningUSD: 80.0,
      localBeerOrWineGlassUSD: 2.8,
      specialtyCoffeeUSD: 2.5,
      groceriesVsDiningOutVerdict:
        'Local sodas are affordable ($6–$8 per huge meal), but high-end tourist restaurants can quickly reach US/European prices. Shopping at local ferias and eating at neighbourhood sodas keeps expat food budgets very low.',
      waterSafety: 'Safe in Major Cities / Filter Preferred',
      waterDetails:
        'Tap water is completely safe to drink in the Greater San José Metropolitan Area (GAM), Central Valley (Heredia, Alajuela, Escazú), and Monteverde. In rural coastal beach areas (Guanacaste, Limón), many expats use filtered or bottled water due to seasonal salinity and local pipe infrastructure.',
      eatingOutHygieneScore: 92,
      hygieneGuidance:
        'Costa Rica has the highest health and environmental standards in Central America. Sodas and restaurants are rigorously inspected by the Ministry of Health (Ministerio de Salud).',
      streetFoodSafetyTips: [
        'Local fruit stands and cevicherías along the coast are safe; ensure ceviche is kept on clean ice.',
        'Drink freshly blended "refrescos naturales en agua" with complete confidence across Central Valley sodas.',
      ],
      produceWashingAdvice:
        'Standard tap water rinsing is all that is required for fruits and vegetables from weekly farmers ferias.',
    },
    marketAndGroceryCulture: {
      freshMarketsOverview:
        'Every town hosts a vibrant weekend "Feria del Agricultor" where farmers sell fresh pineapples, watermelons, papayas, avocados, and fresh cheeses at 70% less than supermarket prices.',
      supermarketChains: ['Auto Mercado (high-end expat import paradise)', 'Mas x Menos', 'Maxi Palí (budget owned by Walmart)', 'Mega Super'],
      importedWesternGoodsAvailability: 'Widely Available in Supermarkets',
    },
  },

  italy: {
    countryId: 'italy',
    countryName: 'Italy',
    cuisineHeadline: 'Hyper-Local Trattorias, Al Dente Pasta, Sacred Espresso Codes & Sun-Ripened Produce',
    culinaryTraditionsOverview:
      'Italian gastronomy is not a single national cuisine, but an extraordinary mosaic of 20 distinct regional micro-cuisines deeply bound to geography, seasonality, and centuries of tradition. Cooking is driven by supreme ingredient purity—few dishes contain more than four or five ingredients. Dining is a multi-course cultural ceremony consisting of Antipasto, Primo (pasta/risotto), Secondo (meat/fish) with Contorno (vegetable side), and Dolce, finished with Caffè and Amaro digestivo.',
    routines: [
      {
        mealName: 'Breakfast',
        timing: '7:30 AM – 9:30 AM',
        typicalFoods: ['Cappuccino or Espresso', 'Cornetto (warm Italian croissant filled with crema, jam, or pistachio)'],
        culturalImportance:
          'Eaten standing up at the neighbourhood bar counter ("al banco") in 5 minutes. Cappuccino is strictly a morning beverage.',
      },
      {
        mealName: 'Mid-Morning Coffee & Snack',
        timing: '10:30 AM – 11:30 AM',
        typicalFoods: ['Un caffè (single espresso)', 'Tramezzino or small focaccia slice'],
        culturalImportance:
          'Quick 2-minute counter pause to reset before the midday work stretch.',
      },
      {
        mealName: 'Lunch',
        timing: '12:45 PM – 2:30 PM',
        typicalFoods: [
          'Primo piatto: Pasta al dente (Carbonara, Cacio e Pepe, Trofie al Pesto) or Risotto',
          'Secondo: Tagliata di manzo or Orata al forno',
          'Contorno: Insalata mista or Cicoria ripassata',
          'Acqua frizzante and quartino di vino della casa',
        ],
        culturalImportance:
          'The traditional main meal. Even with modern schedules, Italians prioritize a warm, sit-down lunch break.',
      },
      {
        mealName: 'Afternoon Snack / Merienda',
        timing: '6:30 PM – 8:30 PM',
        typicalFoods: ['Aperitivo: Aperol Spritz, Negroni, or glass of Prosecco served with olives, potato crisps, and mini-pizzas'],
        culturalImportance:
          'The sacred Aperitivo hour. Piazzas come alive as locals socialize outdoors before late dinner.',
      },
      {
        mealName: 'Dinner',
        timing: '8:30 PM – 10:30 PM',
        typicalFoods: [
          'Pizza Napoletana or Roman thin-crust pizza (weekend favorite)',
          'Shared antipasti plates, pasta, or grilled seafood',
          'Dolce: Tiramisù or Panna Cotta, finished with Espresso and Limoncello / Amaro',
        ],
        culturalImportance:
          'Unrushed, passionate conversations stretching across 2 hours under piazza canopies or vaulted brick trattorias.',
      },
    ],
    nationalDishes: [
      {
        name: 'Pasta Carbonara / Cacio e Pepe',
        localName: 'Pasta alla Carbonara (Roma)',
        category: 'Signature Main',
        description:
          'Spaghetti or rigatoni tossed al dente with crispy cured pork jowl (guanciale), raw pasture-raised egg yolks, freshly grated Pecorino Romano cheese, and abundant cracked black pepper, emulsified into a creamy glossy sauce purely with starchy pasta water—never cream or peas.',
        traditionOrHistory:
          'Born in post-WWII Rome, celebrated worldwide for achieving pure silky decadence without a single drop of heavy cream.',
        flavorProfile: 'Rich, creamy egg yolk emulsion, salty-sharp Pecorino bite, crispy savory pork jowl, spicy pepper warmth.',
        vegetarianFriendly: false,
        vegetarianAlternative: 'Cacio e Pepe (made purely with Pecorino Romano cheese, black pepper, and pasta water—100% vegetarian).',
        typicalCostUSD: 14,
        typicalCostLocalCurrency: '€13.00',
        bestAuthenticPlaces: [
          'Da Enzo al 29 (Trastevere, Rome)',
          'Roscioli Salumeria con Cucina (Rome)',
          'Trattoria Da Felice a Testaccio (Rome)',
        ],
      },
      {
        name: 'Pizza Napoletana Verace',
        localName: 'Pizza Margherita S.T.G. (Napoli)',
        category: 'Signature Main',
        description:
          'Wood-fired pizza crafted from slow-fermented dough blistered at 485°C (900°F) for 60 to 90 seconds, topped with San Marzano tomatoes, fresh Buffalo Mozzarella (Mozzarella di Bufala Campana), fresh basil leaves, and a spiral of extra virgin olive oil.',
        traditionOrHistory:
          'Recognized by UNESCO. Created in 1889 by Neapolitan pizzaiolo Raffaele Esposito to honor Queen Margherita of Savoy, mirroring the red, white, and green Italian tricolor.',
        flavorProfile: 'Puffy, pillowy charred crust (cornicione), sweet tangy tomato, milky melting mozzarella, fragrant fresh basil.',
        vegetarianFriendly: true,
        typicalCostUSD: 8.5,
        typicalCostLocalCurrency: '€8.00',
        bestAuthenticPlaces: [
          "L'Antica Pizzeria da Michele (Via Cesare Sersale, Naples)",
          'Pizzeria Gino Sorbillo (Via dei Tribunali, Naples)',
          '50 Kalò di Ciro Salvo (Naples & Rome)',
        ],
      },
      {
        name: 'Bistecca alla Fiorentina',
        localName: 'Bistecca alla Fiorentina',
        category: 'Signature Main',
        description:
          'Massive thick-cut T-bone steak from ancient white Chianina cattle, grilled over glowing oak and chestnut charcoal coals, seasoned solely with sea salt, olive oil, and rosemary, served strictly rare (al sangue).',
        traditionOrHistory:
          'Tuscan Renaissance masterwork celebrating the Chianina breed raised in the Val di Chiana since Etruscan times.',
        flavorProfile: 'Charred smoky crust, intensely juicy tender beef, pure mineral richness.',
        vegetarianFriendly: false,
        typicalCostUSD: 48,
        typicalCostLocalCurrency: '€45.00 / kg',
        bestAuthenticPlaces: [
          'Trattoria Mario (San Lorenzo, Florence)',
          'Buca Lapi (Florence)',
          'Antica Macelleria Cecchini (Panzano in Chianti)',
        ],
      },
    ],
    dietaryRestrictions: {
      vegetarianRating: 'Effortless & Abundant',
      veganRating: 'Very Easy',
      glutenFreeRating: 'Very High Awareness',
      summary:
        'Italy is arguably the world’s easiest country for vegetarians and gluten-free diners. Traditional Italian cooking is anchored in legumes, vegetables, cheeses, and grains. The Italian Celiac Association (AIC) has made Italy one of the most gluten-free conscious countries in Europe, with certified gluten-free pizzerias and pasta available nationwide.',
      hiddenNonVegIngredients: [
        'Traditional Parmigiano-Reggiano and Pecorino Romano use animal rennet (caglio animale)',
        'Guanciale or pancetta frequently mixed into bean dishes (Pasta e Fagioli)',
        'Anchovies (alici/acciughe) dissolved into vegetable sauces in southern Italy',
      ],
      helpfulLocalPhrases: [
        {
          phrase: 'Sono vegetariano / vegetariana.',
          english: 'I am vegetarian (male / female).',
          phonetic: 'SOH-noh veh-zheh-tah-RYAH-noh / nah',
        },
        {
          phrase: 'Senza carne né pesce, per favore.',
          english: 'Without meat or fish, please.',
          phonetic: 'SEHN-tsah KAHR-neh neh PEH-sheh, pehr fah-VOH-reh',
        },
        {
          phrase: 'Ha opzioni senza glutine?',
          english: 'Do you have gluten-free options?',
          phonetic: 'ah ohp-TSYOH-nee SEHN-tsah GLOO-tee-neh?',
        },
      ],
      stapleVegDishes: [
        'Pasta Cacio e Pepe / Pasta al Pomodoro fresco',
        'Melanzane alla Parmigiana (baked eggplant with mozzarella & tomato)',
        'Pizza Margherita con Mozzarella di Bufala',
        'Caprese (fresh buffalo mozzarella, ripe tomatoes, basil & olive oil)',
        'Ribollita Toscana (vegetable, bean, and crusty bread stew)',
      ],
    },
    expatHurdles: [
      {
        title: 'The Coffee Etiquette Rules',
        category: 'Ordering & Etiquette',
        description:
          'Ordering a Cappuccino after 11:00 AM or after a meal is met with shock, as Italians believe hot milk disrupts digestion after savory food.',
        workaroundTip:
          'Drink Cappuccino only before 11:00 AM with breakfast. After lunch or dinner, order "Un caffè" (single espresso) or "Caffè macchiato" (espresso with a drop of warm milk).',
      },
      {
        title: 'The "Coperto" Cover Charge on the Bill',
        category: 'Payment & Tipping',
        description:
          'Almost every sit-down restaurant adds a legal "Coperto" charge (€2 to €4 per person) covering bread, tablecloth, and cutlery service.',
        workaroundTip:
          'This is statutory and completely normal. Because of the coperto and fair wages, tipping in Italy is strictly discretionary (leaving €1–€2 in coins for great service is ample).',
      },
      {
        title: 'Zero Modifications to Menu Dishes',
        category: 'Ordering & Etiquette',
        description:
          'Asking an Italian chef to substitute ingredients in a classic pasta or pizza is considered disrespectful to culinary balance.',
        workaroundTip:
          'Trust the chef’s regional recipe. If you have medical dietary restrictions, inform the server before ordering ("Ho un’allergia a...").',
      },
    ],
    costsAndHygiene: {
      streetFoodOrMarketMealUSD: 6.5,
      casualRestaurantMealUSD: 16.0,
      midRangeDinnerForTwoUSD: 52.0,
      highEndFineDiningUSD: 125.0,
      localBeerOrWineGlassUSD: 3.5,
      specialtyCoffeeUSD: 1.4,
      groceriesVsDiningOutVerdict:
        'Italian supermarket and fresh market produce (tomatoes, cheeses, cold cuts) is remarkably inexpensive and peerless in quality. Many expat retirees cook lunch at home and head out for aperitivo and trattoria dinners.',
      waterSafety: '100% Safe from Tap',
      waterDetails:
        'Italian municipal tap water is 100% safe to drink. Rome is famous for its historic "Nasoni" public drinking fountains running continuous ice-cold spring water throughout the city.',
      eatingOutHygieneScore: 96,
      hygieneGuidance:
        'Food hygiene standards are strictly enforced under EU regulations and the Italian NAS food inspection bureau.',
      streetFoodSafetyTips: [
        'Street pizza al taglio (pizza by the slice) and paninoteche are exceptionally fresh and safe.',
        'Gelato rule of thumb: Avoid neon-colored piled-high fluffy gelato; look for natural muted colors kept in metal tubs with lids (pozzetti).',
      ],
      produceWashingAdvice:
        'Standard tap water rinsing is all that is required for fresh produce purchased at local mercati rionali.',
    },
    marketAndGroceryCulture: {
      freshMarketsOverview:
        'Open-air neighborhood markets (Mercato Rionale) operate every morning Monday to Saturday in every Italian town, offering hyper-local seasonal produce, fresh mozzarella di bufala, and cured prosciutto.',
      supermarketChains: ['Conad', 'Coop', 'Esselunga (celebrated for premium quality)', 'Carrefour', 'Eurospin (discount)'],
      importedWesternGoodsAvailability: 'Available in Specialty Expat Delis',
    },
  },
};

/**
 * Intelligent regional generator for all other countries in the global catalog
 */
export function getCountryGastronomyProfile(country: Country): CountryGastronomyProfile {
  // If curated profile exists, return directly
  const existing = CURATED_GASTRONOMY_PROFILES[country.id];
  if (existing) {
    return existing;
  }

  const region = country.region;
  const budget = country.costOfLiving?.monthlyBudgetSingleUSD || 1800;
  const isHighCost = budget > 2400;
  const isLowCost = budget < 1600;

  // Regional logic for authentic fallback generation
  let headline = `Authentic ${country.name} Food Traditions, Local Markets & Culinary Heritage`;
  let traditions = `Gastronomy in ${country.name} is deeply intertwined with local culture, seasonal agriculture, and family gatherings. Dining out is an everyday social pleasure that bridges traditional neighborhood eateries with modern cosmopolitan culinary hubs.`;
  let waterSafety: '100% Safe from Tap' | 'Safe in Major Cities / Filter Preferred' | 'Bottled or Filtered Only' =
    region === 'Europe' ? '100% Safe from Tap' : 'Safe in Major Cities / Filter Preferred';
  let waterDetails =
    region === 'Europe'
      ? `Municipal tap water across ${country.name} is rigorously tested and 100% safe to drink.`
      : `Most expats and locals in ${country.name} use reverse-osmosis filtered water or bottled water for drinking and cooking.`;

  let streetMeal = isLowCost ? 3.0 : isHighCost ? 8.5 : 5.0;
  let casualMeal = isLowCost ? 7.0 : isHighCost ? 18.0 : 12.0;
  let midDinner = isLowCost ? 26.0 : isHighCost ? 65.0 : 40.0;
  let hygieneScore = region === 'Europe' ? 94 : 86;

  // Regional default national dishes
  const fallbackDishes: NationalDish[] = [
    {
      name: `${country.name} Traditional Specialty Platter`,
      localName: `Plato Típico de ${country.name}`,
      category: 'Signature Main',
      description: `The signature regional staple of ${country.name}, combining slow-simmered local grains, farm-fresh protein, seasonal greens, and aromatic herbs cultivated in the surrounding countryside.`,
      traditionOrHistory: `Passed down across generations, this comfort dish is the centerpiece of Sunday family lunches and local municipal festivals across ${country.name}.`,
      flavorProfile: 'Hearty, balanced, savory, seasoned with native spices and cold-pressed local oil.',
      vegetarianFriendly: false,
      vegetarianAlternative: 'Vegetarian version substituting braised beans, lentils, or local cheeses for meat.',
      typicalCostUSD: casualMeal,
      typicalCostLocalCurrency: `$${Math.round(casualMeal * 1.1)}`,
      bestAuthenticPlaces: [
        `Historic district family-run bistros in ${country.capital}`,
        `Municipal food markets across ${country.topCities[0]?.name || country.capital}`,
        `Countryside traditional tavernas and coastal eateries`,
      ],
    },
    {
      name: `${country.name} Artisan Savory Pastry / Street Bite`,
      localName: 'Bocadillo / Street Snack',
      category: 'Street Food / Snack',
      description: `Beloved everyday on-the-go snack freshly baked in neighborhood bakeries every morning, wrapped in warm paper and enjoyed alongside coffee or tea.`,
      traditionOrHistory: `An indispensable part of the workday routine, picked up on the morning commute or during mid-afternoon breaks.`,
      flavorProfile: 'Crisp flaky pastry, savory filling, warm comforting texture.',
      vegetarianFriendly: true,
      typicalCostUSD: Math.round(streetMeal * 0.7),
      typicalCostLocalCurrency: `$${Math.round(streetMeal * 0.8)}`,
      bestAuthenticPlaces: [
        `Central bakeries in ${country.capital}`,
        `Railway and metro station bakeries`,
        `Local street food plazas`,
      ],
    },
    {
      name: `${country.name} Slow-Simmered Comfort Stew`,
      localName: 'Sopa / Guiso Tradicional',
      category: 'Soup / Stew',
      description: `A velvety, slow-cooked soup or stew simmered for hours with root vegetables, indigenous legumes, and fragrant herbs in a rich golden broth.`,
      traditionOrHistory: `The ultimate remedy for chilly evenings and family reunions, celebrating local agricultural produce.`,
      flavorProfile: 'Warm, earthy, deeply savory and revitalizing.',
      vegetarianFriendly: true,
      typicalCostUSD: Math.round(casualMeal * 0.65),
      typicalCostLocalCurrency: `$${Math.round(casualMeal * 0.7)}`,
      bestAuthenticPlaces: [
        `Traditional family diners in ${country.capital}`,
        `Neighborhood markets in ${country.topCities[0]?.name || 'coastal hubs'}`,
      ],
    },
  ];

  return {
    countryId: country.id,
    countryName: country.name,
    cuisineHeadline: headline,
    culinaryTraditionsOverview: traditions,
    routines: [
      {
        mealName: 'Breakfast',
        timing: '7:30 AM – 9:30 AM',
        typicalFoods: [
          'Locally roasted coffee or herbal tea',
          'Freshly baked bread with butter, jam, or savory spreads',
          'Fresh seasonal fruit or eggs',
        ],
        culturalImportance: 'Quick morning recharge, often enjoyed at local bakeries or cafes.',
      },
      {
        mealName: 'Lunch',
        timing: '12:30 PM – 2:30 PM',
        typicalFoods: [
          'Daily lunch menu special with soup, main dish, and beverage',
          'Seasonal grilled proteins, grains, and fresh side salad',
        ],
        culturalImportance: 'The main meal of the day where colleagues and friends sit down together.',
      },
      {
        mealName: 'Afternoon Snack / Merienda',
        timing: '4:30 PM – 6:00 PM',
        typicalFoods: ['Espresso or tea with artisanal pastry or local fruit'],
        culturalImportance: 'A gentle social break bridging the gap to late evening dining.',
      },
      {
        mealName: 'Dinner',
        timing: '7:30 PM – 10:00 PM',
        typicalFoods: [
          'Shared plates, grilled fish or meats, and regional wine or craft beer',
          'Light vegetable soups or salads',
        ],
        culturalImportance: 'Unrushed evening social gatherings lasting 1.5 to 2 hours.',
      },
    ],
    nationalDishes: fallbackDishes,
    dietaryRestrictions: {
      vegetarianRating: region === 'Europe' ? 'Very Easy' : 'Moderate / Some Planning',
      veganRating: region === 'Europe' ? 'Very Easy' : 'Moderate / Focus on Specialty Spots',
      glutenFreeRating: region === 'Europe' ? 'Very High Awareness' : 'Moderate / Common Substitutes',
      summary: `Vegetarian and vegan dining is expanding rapidly across ${country.name}, especially in ${country.capital} and major expat centers. Traditional cuisine offers rich vegetable and legume foundations, and servers are accustomed to tailoring orders.`,
      hiddenNonVegIngredients: [
        'Animal fat or lard used in select traditional pastry preparations',
        'Meat broth used as the base for some vegetable soups',
      ],
      helpfulLocalPhrases: [
        {
          phrase: `Soy vegetariano / I am vegetarian.`,
          english: 'I am vegetarian (please no meat or fish).',
        },
        {
          phrase: `Sin carne, por favor.`,
          english: 'Without meat, please.',
        },
        {
          phrase: `¿Tiene opciones vegetarianas?`,
          english: 'Do you have vegetarian options?',
        },
      ],
      stapleVegDishes: [
        'Seasonal roasted vegetable platters with local herbs and olive oil',
        'Hearty legume and grain soups',
        'Fresh artisanal cheeses with country bread',
      ],
    },
    expatHurdles: [
      {
        title: 'Local Kitchen & Dining Schedules',
        category: 'Meal Timings & Schedules',
        description: `Traditional restaurants in ${country.name} strictly adhere to local meal hours, with kitchens closing between mid-afternoon and evening.`,
        workaroundTip: 'Plan main meals between 1:00 PM – 2:30 PM and dinner after 8:00 PM, or visit cafes for snacks between hours.',
      },
      {
        title: 'Language Barriers at Traditional Eateries',
        category: 'Ordering & Etiquette',
        description: `Authentic neighborhood bistros outside tourist quarters often have handwritten daily menus in the local language without English translations.`,
        workaroundTip: 'Use smartphone camera live translation, or ask the server for the daily special ("Plato del Día / Specialty").',
      },
      {
        title: 'Tipping Norms & Service Charges',
        category: 'Payment & Tipping',
        description: `Tipping customs in ${country.name} differ from North America; aggressive tipping is neither expected nor customary.`,
        workaroundTip: 'A modest 5% to 10% round-up in cash for attentive service is welcomed and appreciated.',
      },
    ],
    costsAndHygiene: {
      streetFoodOrMarketMealUSD: streetMeal,
      casualRestaurantMealUSD: casualMeal,
      midRangeDinnerForTwoUSD: midDinner,
      highEndFineDiningUSD: midDinner * 2.2,
      localBeerOrWineGlassUSD: Math.round(casualMeal * 0.25),
      specialtyCoffeeUSD: Math.round(casualMeal * 0.2),
      groceriesVsDiningOutVerdict: `Dining out casually in ${country.name} offers tremendous quality and value. Many retirees combine weekly farmers market shopping with frequent visits to neighborhood bistros.`,
      waterSafety,
      waterDetails,
      eatingOutHygieneScore: hygieneScore,
      hygieneGuidance: `Hospitality establishments in ${country.name} are subject to regular government health inspections. Both neighborhood bistros and modern restaurants maintain clean, professional standards.`,
      streetFoodSafetyTips: [
        'Select busy stalls with high local foot traffic and fast turnover.',
        'Choose foods cooked fresh to order at high heat.',
      ],
      produceWashingAdvice: 'Wash raw produce in potable tap or filtered water before consumption.',
    },
    marketAndGroceryCulture: {
      freshMarketsOverview: `Towns across ${country.name} feature bustling fresh produce markets where regional farmers sell fruits, vegetables, cheeses, and seafood at affordable local prices.`,
      supermarketChains: ['Major Regional Supermarkets', 'Local Neighborhood Mini-Markets', 'Carrefour / Lidl / Local Chains'],
      importedWesternGoodsAvailability: 'Widely Available in Supermarkets',
    },
  };
}
