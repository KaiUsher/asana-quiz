const POSES = [
  // Standing
  { id: 'tadasana',            english: 'Mountain Pose',           sanskrit: 'Tadasana',                   category: 'Standing' },
  { id: 'virabhadrasana-i',    english: 'Warrior I',               sanskrit: 'Virabhadrasana I',            category: 'Standing' },
  { id: 'virabhadrasana-ii',   english: 'Warrior II',              sanskrit: 'Virabhadrasana II',           category: 'Standing' },
  { id: 'virabhadrasana-iii',  english: 'Warrior III',             sanskrit: 'Virabhadrasana III',          category: 'Standing' },
  { id: 'trikonasana',         english: 'Triangle Pose',           sanskrit: 'Trikonasana',                 category: 'Standing' },
  { id: 'parsvakonasana',      english: 'Extended Side Angle',     sanskrit: 'Utthita Parsvakonasana',      category: 'Standing' },
  { id: 'vrikshasana',         english: 'Tree Pose',               sanskrit: 'Vrikshasana',                 category: 'Standing' },
  { id: 'utkatasana',          english: 'Chair Pose',              sanskrit: 'Utkatasana',                  category: 'Standing' },
  { id: 'uttanasana',          english: 'Standing Forward Fold',   sanskrit: 'Uttanasana',                  category: 'Standing' },
  { id: 'ardha-chandrasana',   english: 'Half Moon Pose',          sanskrit: 'Ardha Chandrasana',           category: 'Standing' },
  // Seated
  { id: 'dandasana',           english: 'Staff Pose',              sanskrit: 'Dandasana',                   category: 'Seated'   },
  { id: 'paschimottanasana',   english: 'Seated Forward Fold',     sanskrit: 'Paschimottanasana',           category: 'Seated'   },
  { id: 'sukhasana',           english: 'Easy Pose',               sanskrit: 'Sukhasana',                   category: 'Seated'   },
  { id: 'padmasana',           english: 'Lotus Pose',              sanskrit: 'Padmasana',                   category: 'Seated'   },
  { id: 'baddha-konasana',     english: 'Butterfly Pose',          sanskrit: 'Baddha Konasana',             category: 'Seated'   },
  { id: 'navasana',            english: 'Boat Pose',               sanskrit: 'Navasana',                    category: 'Seated'   },
  { id: 'virasana',            english: 'Hero Pose',               sanskrit: 'Virasana',                    category: 'Seated'   },
  // Supine
  { id: 'savasana',            english: 'Corpse Pose',             sanskrit: 'Savasana',                    category: 'Supine'   },
  { id: 'ananda-balasana',     english: 'Happy Baby',              sanskrit: 'Ananda Balasana',             category: 'Supine'   },
  { id: 'setu-bandha',         english: 'Bridge Pose',             sanskrit: 'Setu Bandha Sarvangasana',    category: 'Supine'   },
  // Prone
  { id: 'bhujangasana',        english: 'Cobra Pose',              sanskrit: 'Bhujangasana',                category: 'Prone'    },
  { id: 'urdhva-mukha',        english: 'Upward Dog',              sanskrit: 'Urdhva Mukha Svanasana',      category: 'Prone'    },
  { id: 'balasana',            english: "Child's Pose",            sanskrit: 'Balasana',                    category: 'Prone'    },
  { id: 'salabhasana',         english: 'Locust Pose',             sanskrit: 'Salabhasana',                 category: 'Prone'    },
  // Backbend
  { id: 'urdhva-dhanurasana',  english: 'Wheel Pose',              sanskrit: 'Urdhva Dhanurasana',          category: 'Backbend' },
  { id: 'ustrasana',           english: 'Camel Pose',              sanskrit: 'Ustrasana',                   category: 'Backbend' },
  // Inversion
  { id: 'adho-mukha',          english: 'Downward Dog',            sanskrit: 'Adho Mukha Svanasana',        category: 'Inversion'},
  { id: 'sirsasana',           english: 'Headstand',               sanskrit: 'Sirsasana',                   category: 'Inversion'},
  { id: 'sarvangasana',        english: 'Shoulder Stand',          sanskrit: 'Sarvangasana',                category: 'Inversion'},
  // Twist
  { id: 'ardha-matsyendrasana',english: 'Half Lord of the Fishes', sanskrit: 'Ardha Matsyendrasana',        category: 'Twist'    },
];
