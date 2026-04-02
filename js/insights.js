const INSIGHT_RECENCY_KEY = 'asana_insight_recency_v1';
const RECENCY_WINDOW = 3;

export function getRecentInsightIds() {
  try { return JSON.parse(localStorage.getItem(INSIGHT_RECENCY_KEY)) || []; }
  catch { return []; }
}

export function recordInsightShown(insightId) {
  const recent = getRecentInsightIds();
  const updated = [insightId, ...recent.filter(id => id !== insightId)].slice(0, RECENCY_WINDOW);
  localStorage.setItem(INSIGHT_RECENCY_KEY, JSON.stringify(updated));
}

const ROOTS_SEEN_KEY = 'asana_roots_seen_v1';

export function getRootsSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(ROOTS_SEEN_KEY)) || []); }
  catch { return new Set(); }
}

export function recordRootSeen(insightId) {
  const seen = getRootsSeenIds();
  seen.add(insightId);
  localStorage.setItem(ROOTS_SEEN_KEY, JSON.stringify([...seen]));
}

export const INSIGHTS = [
  {
    id: 'ardha',
    root: 'Ardha',
    meaning: 'Half',
    explanation: 'Ardha signals that a pose takes only half its full expression. It\'s a modifier - wherever you see it, the shape borrows from a fuller pose and asks you to find balance within that limitation.',
    poseIds: ['ardha-chandrasana', 'ardha-matsyendrasana'],
  },
  {
    id: 'adho-urdhva',
    root: 'Adho & Urdhva',
    meaning: 'Down & Up',
    explanation: 'These two roots are opposites that often travel together. Adho points downward, Urdhva reaches upward - so when Mukha (face) sits between them, you already know which direction the pose is oriented before you step on the mat. Adho Mukha Vrksasana uses the same logic: a downward-facing tree.',
    poseIds: ['adho-mukha', 'urdhva-mukha', 'urdhva-dhanurasana', 'adho-mukha-vrksasana'],
  },
  {
    id: 'vira',
    root: 'Vira',
    meaning: 'Hero · Warrior',
    explanation: 'Vira means hero or warrior. Virabhadra was a fierce deity conjured by Shiva - so Virabhadrasana carries that mythic strength. Virasana, the quieter Hero Pose, shares the same root but without the deity. Same quality, different expression.',
    poseIds: ['virabhadrasana-i', 'virabhadrasana-ii', 'virabhadrasana-iii', 'virasana'],
  },
  {
    id: 'bala',
    root: 'Bala',
    meaning: 'Child · Young',
    explanation: 'Bala means child or young. Balasana is simply child\'s pose. Add Ananda - bliss - and you get Ananda Balasana: the blissful child. It\'s a good reminder that Sanskrit pose names are often exactly what they describe.',
    poseIds: ['balasana', 'ananda-balasana'],
  },
  {
    id: 'svana-mukha',
    root: 'Svana & Mukha',
    meaning: 'Dog & Face',
    explanation: 'Svana means dog; Mukha means face. The two dog poses share these roots - only Adho (down) or Urdhva (up) changes to tell you which way the dog faces. Mukha travels further too: Gomukhasana pairs it with Go (cow) for Cow Face. The word simply points to where the front of the shape is directed.',
    poseIds: ['adho-mukha', 'urdhva-mukha', 'gomukhasana'],
  },
  {
    id: 'asana',
    root: 'Āsana',
    meaning: 'Seat · Posture',
    explanation: 'Āsana literally means seat - a still, steady place to rest. It\'s the suffix that turns any Sanskrit word into a yoga pose. Once you see it, every name becomes two parts: the quality or shape, followed by the seat. Nearly every pose follows this pattern — the one exception in this library is Viparita Karani, where karani means action or doing rather than seat.',
    poseIds: [
      'tadasana', 'virabhadrasana-i', 'virabhadrasana-ii', 'virabhadrasana-iii',
      'trikonasana', 'parsvakonasana', 'vrikshasana', 'utkatasana', 'uttanasana',
      'ardha-chandrasana', 'garudasana', 'viparita-virabhadrasana', 'prasarita-padottanasana',
      'natarajasana', 'parsvottanasana', 'parivrtta-trikonasana',
      'anjaneyasana', 'parivrtta-parsvakonasana', 'parighasana',
      'dandasana', 'paschimottanasana', 'sukhasana', 'padmasana', 'baddha-konasana',
      'navasana', 'virasana', 'janu-sirsasana', 'gomukhasana', 'upavistha-konasana', 'marichyasana',
      'savasana', 'ananda-balasana', 'supta-baddha-konasana', 'matsyasana', 'supta-padangusthasana',
      'supta-virasana',
      'bhujangasana', 'urdhva-mukha', 'balasana', 'salabhasana', 'dhanurasana',
      'urdhva-dhanurasana', 'ustrasana',
      'adho-mukha', 'sirsasana', 'sarvangasana', 'halasana',
      'adho-mukha-vrksasana', 'pincha-mayurasana',
      'ardha-matsyendrasana',
      'bakasana', 'vasisthasana', 'chaturanga-dandasana',
      'hanumanasana', 'malasana', 'eka-pada-rajakapotasana',
    ],
  },
  {
    id: 'baddha-bandha',
    root: 'Baddha · Bandha',
    meaning: 'Bound · Lock',
    explanation: 'Baddha and Bandha share the same Sanskrit root and both suggest binding or locking. Baddha Konasana and Supta Baddha Konasana bind the angle of the legs; Setu Bandha creates a lock at the bridge. The slight spelling difference is grammar, not meaning.',
    poseIds: ['baddha-konasana', 'setu-bandha', 'supta-baddha-konasana'],
  },
  {
    id: 'danda',
    root: 'Danda',
    meaning: 'Staff',
    explanation: 'Danda means staff or rod. In Dandasana you become the staff - spine erect, legs straight, the whole body a single line. In Chaturanga Dandasana the staff is lowered to hover parallel to the earth, held there by four limbs. The image is identical; only the orientation changes.',
    poseIds: ['dandasana', 'chaturanga-dandasana'],
  },
  {
    id: 'anga',
    root: 'Anga',
    meaning: 'Limb · Body',
    explanation: 'Anga means limb or body part, and it quietly counts in the background. Chaturanga pairs it with chatur — four — to describe a pose balanced on all four limbs. Sarvangasana pairs it with sarva — all — because the whole body is engaged. A small word that tells you exactly how much of you is needed.',
    poseIds: ['chaturanga-dandasana', 'sarvangasana'],
  },
  {
    id: 'mythic-names',
    root: 'Mythic names',
    meaning: 'Deity · Legend',
    explanation: 'Not every pose is named for its shape. Virabhadra was a fierce deity summoned by Shiva — his three forms gave us the Warriors. Garuda is the divine eagle, vahana of Vishnu. Hanuman is the monkey god whose great leap inspired the splits. Nataraja is Shiva himself, Lord of the Dance. Marichi was a sage, one of the progenitors of the cosmos. These names carry an intention: step into the pose and borrow something of the figure.',
    poseIds: ['virabhadrasana-i', 'virabhadrasana-ii', 'virabhadrasana-iii', 'garudasana', 'hanumanasana', 'natarajasana', 'marichyasana', 'anjaneyasana'],
  },
  {
    id: 'pada',
    root: 'Pada',
    meaning: 'Foot · Leg',
    explanation: 'Pada means foot or leg — the place where you meet the ground. In Prasarita Padottanasana it combines with ut (intense) and tan (stretch) to describe exactly what\'s happening in the legs. In Eka Pada Rajakapotasana, eka (one) singles out which leg carries the shape. In Supta Padangusthasana, pada pairs with angustha (big toe) to name the target precisely.',
    poseIds: ['prasarita-padottanasana', 'eka-pada-rajakapotasana', 'supta-padangusthasana'],
  },
  {
    id: 'parsva',
    root: 'Parsva',
    meaning: 'Side · Flank',
    explanation: 'Parsva means side or flank. In Utthita Parsvakonasana it names the long side of the body being opened — the angle at the flank. In Parsvottanasana it combines with ut (intense) and tan (stretch): an intense stretch along the side. The root quietly orients you to where the action is before you\'ve taken the shape.',
    poseIds: ['parsvakonasana', 'parsvottanasana', 'parivrtta-parsvakonasana'],
  },
  {
    id: 'animal-names',
    root: 'Animal names',
    meaning: 'Creature · Form',
    explanation: 'A whole family of poses is named after animals. Matsyasana (fish), Bhujangasana (cobra), Salabhasana (locust), Bakasana (crane), Garudasana (eagle), Pincha Mayurasana (peacock feather). The name is a cue as much as a label — embody the creature\'s quality: the stillness of a locust, the lift of a crane, the spread of an eagle.',
    poseIds: ['matsyasana', 'bhujangasana', 'salabhasana', 'bakasana', 'garudasana', 'pincha-mayurasana'],
  },
  {
    id: 'vrksa',
    root: 'Vrksa',
    meaning: 'Tree',
    explanation: 'Vrksa means tree. In Vrikshasana you stand as one — rooted through the foot, branches reaching upward. Adho Mukha Vrksasana is the downward-facing tree: the same root word, the same vertical line, but inverted so the hands become the roots and the feet become the canopy. Two trees growing in opposite directions from the same word.',
    poseIds: ['vrikshasana', 'adho-mukha-vrksasana'],
  },
  {
    id: 'viparita',
    root: 'Viparita',
    meaning: 'Inverted · Reversed',
    explanation: 'Viparita means inverted or reversed — a signal to take the familiar and turn it around. In Viparita Virabhadrasana the warrior\'s typical forward drive is reversed, the torso opening backward. In Viparita Karani the whole body is upended, legs draining toward the sky. Wherever you see it, something is being deliberately flipped.',
    poseIds: ['viparita-virabhadrasana', 'viparita-karani'],
  },
];
