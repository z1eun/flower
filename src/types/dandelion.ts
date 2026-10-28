export interface SeedItem {
  id: number; // 1 to 10
  code: string; // e.g. "DANDELION-SEED-1"
  name: string;
  theme: string;
  message: string;
  icon: string;
  color: string;
  collected: boolean;
  collectedAt?: string;
  collectedBy?: string;
}

export const INITIAL_SEEDS: SeedItem[] = [
  {
    id: 1,
    code: "DANDELION-SEED-1",
    name: "반가운 인사 홀씨",
    theme: "인사",
    message: "친구를 만나면 눈을 맞추고 '안녕!' 밝게 인사해요.",
    icon: "👋",
    color: "#FFD13B",
    collected: false,
  },
  {
    id: 2,
    code: "DANDELION-SEED-2",
    name: "따뜻한 칭찬 홀씨",
    theme: "칭찬",
    message: "'너 정말 멋지다!' 친구에게 예쁜 말 한마디를 선물해요.",
    icon: "✨",
    color: "#FFE066",
    collected: false,
  },
  {
    id: 3,
    code: "DANDELION-SEED-3",
    name: "사이좋은 양보 홀씨",
    theme: "양보",
    message: "놀잇감을 차례차례 사이좋게 나누어 써요.",
    icon: "🤝",
    color: "#A8E063",
    collected: false,
  },
  {
    id: 4,
    code: "DANDELION-SEED-4",
    name: "다정한 도움 홀씨",
    theme: "도움",
    message: "어려워하는 친구가 있으면 달려가 손을 꼭 잡아줘요.",
    icon: "🌱",
    color: "#7CE08A",
    collected: false,
  },
  {
    id: 5,
    code: "DANDELION-SEED-5",
    name: "귀 기울이기 홀씨",
    theme: "경청",
    message: "친구가 이야기할 때 끄덕끄덕 눈을 보며 들어줘요.",
    icon: "👂",
    color: "#FFD13B",
    collected: false,
  },
  {
    id: 6,
    code: "DANDELION-SEED-6",
    name: "함께 웃는 미소 홀씨",
    theme: "미소",
    message: "기쁜 일이 있을 때 친구와 마주 보며 방긋 웃어요.",
    icon: "😄",
    color: "#FFE066",
    collected: false,
  },
  {
    id: 7,
    code: "DANDELION-SEED-7",
    name: "용기 있는 사과 홀씨",
    theme: "화해",
    message: "실수했을 때는 용기 내어 '미안해' 하고 사과해요.",
    icon: "💌",
    color: "#A8E063",
    collected: false,
  },
  {
    id: 8,
    code: "DANDELION-SEED-8",
    name: "토닥토닥 위로 홀씨",
    theme: "위로",
    message: "친구가 속상해할 때 따뜻하게 안아주며 '괜찮아' 해줘요.",
    icon: "💛",
    color: "#7CE08A",
    collected: false,
  },
  {
    id: 9,
    code: "DANDELION-SEED-9",
    name: "으쌰으쌰 협동 홀씨",
    theme: "협동",
    message: "놀이가 끝나면 친구들과 힘을 모아 쓱싹 정리해요.",
    icon: "🎈",
    color: "#FFD13B",
    collected: false,
  },
  {
    id: 10,
    code: "DANDELION-SEED-10",
    name: "영원한 우정 홀씨",
    theme: "우정",
    message: "우리는 세상에서 가장 소중한 단짝 친구예요!",
    icon: "🌻",
    color: "#FFAE19",
    collected: false,
  },
];
