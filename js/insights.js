const INSIGHT_RECENCY_KEY = 'asana_insight_recency_v1';
const RECENCY_WINDOW = 3;

function getRecentInsightIds() {
  try { return JSON.parse(localStorage.getItem(INSIGHT_RECENCY_KEY)) || []; }
  catch { return []; }
}

function recordInsightShown(insightId) {
  const recent = getRecentInsightIds();
  const updated = [insightId, ...recent.filter(id => id !== insightId)].slice(0, RECENCY_WINDOW);
  localStorage.setItem(INSIGHT_RECENCY_KEY, JSON.stringify(updated));
}

const INSIGHTS = [
  {
    id: 'ardha',
    root: 'Ardha',
    meaning: 'Half',
    explanation: 'Ardha signals that a pose takes only half its full expression. It\'s a modifier — wherever you see it, the shape borrows from a fuller pose and asks you to find balance within that limitation.',
    poseIds: ['ardha-chandrasana', 'ardha-matsyendrasana'],
  },
  {
    id: 'adho-urdhva',
    root: 'Adho & Urdhva',
    meaning: 'Down & Up',
    explanation: 'These two roots are opposites that often travel together. Adho points downward, Urdhva reaches upward — so when Mukha (face) sits between them, you already know which direction the pose is oriented before you step on the mat.',
    poseIds: ['adho-mukha', 'urdhva-mukha', 'urdhva-dhanurasana'],
  },
  {
    id: 'vira',
    root: 'Vira',
    meaning: 'Hero · Warrior',
    explanation: 'Vira means hero or warrior. Virabhadra was a fierce deity conjured by Shiva — so Virabhadrasana carries that mythic strength. Virasana, the quieter Hero Pose, shares the same root but without the deity. Same quality, different expression.',
    poseIds: ['virabhadrasana-i', 'virabhadrasana-ii', 'virabhadrasana-iii', 'virasana'],
  },
  {
    id: 'bala',
    root: 'Bala',
    meaning: 'Child · Young',
    explanation: 'Bala means child or young. Balasana is simply child\'s pose. Add Ananda — bliss — and you get Ananda Balasana: the blissful child. It\'s a good reminder that Sanskrit pose names are often exactly what they describe.',
    poseIds: ['balasana', 'ananda-balasana'],
  },
  {
    id: 'svana-mukha',
    root: 'Svana & Mukha',
    meaning: 'Dog & Face',
    explanation: 'Svana means dog; Mukha means face. Both dog poses share these two roots — the only word that changes is Adho (down) or Urdhva (up), which tells you exactly which way the dog is facing. Three words, one complete image.',
    poseIds: ['adho-mukha', 'urdhva-mukha'],
  },
  {
    id: 'asana',
    root: 'Āsana',
    meaning: 'Seat · Posture',
    explanation: 'Āsana literally means seat — a still, steady place to rest. It\'s the suffix that turns any Sanskrit word into a yoga pose. Once you see it, every name becomes two parts: the quality or shape, followed by the seat.',
    poseIds: [
      'tadasana', 'virabhadrasana-i', 'virabhadrasana-ii', 'virabhadrasana-iii',
      'trikonasana', 'parsvakonasana', 'vrikshasana', 'utkatasana', 'uttanasana',
      'ardha-chandrasana', 'dandasana', 'paschimottanasana', 'sukhasana', 'padmasana',
      'baddha-konasana', 'navasana', 'virasana', 'savasana', 'ananda-balasana',
      'bhujangasana', 'urdhva-mukha', 'balasana', 'salabhasana', 'urdhva-dhanurasana',
      'ustrasana', 'adho-mukha', 'sirsasana', 'sarvangasana', 'ardha-matsyendrasana',
    ],
  },
  {
    id: 'baddha-bandha',
    root: 'Baddha · Bandha',
    meaning: 'Bound · Lock',
    explanation: 'Baddha and Bandha share the same Sanskrit root and both suggest binding or locking. Baddha Konasana binds the angle of the legs; Setu Bandha creates a lock at the bridge. The slight spelling difference is grammar, not meaning.',
    poseIds: ['baddha-konasana', 'setu-bandha'],
  },
];
