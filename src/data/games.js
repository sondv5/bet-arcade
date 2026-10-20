import WheelGame from '../games/wheel/WheelGame.jsx'
import PlinkoGame from '../games/plinko/PlinkoGame.jsx'
import SlotsGame from '../games/slots/SlotsGame.jsx'
import BombGame from '../games/bomb/BombGame.jsx'
import SnailGame from '../games/snail/SnailGame.jsx'
import CardsGame from '../games/cards/CardsGame.jsx'
import HammerGame from '../games/hammer/HammerGame.jsx'
import TeamsGame from '../games/teams/TeamsGame.jsx'
import GachaGame from '../games/gacha/GachaGame.jsx'
import PairsGame from '../games/pairs/PairsGame.jsx'

export const CATEGORIES = [
  {
    id: 'pick',
    index: '01',
    title: 'Chọn một người',
    short: 'Chọn người',
    blurb: 'Quay, thả, nổ. Chốt một cái tên trước khi cả hội đổi ý.',
    accent: '#ff4d6d',
  },
  {
    id: 'lose',
    index: '02',
    title: 'Tìm kẻ về bét',
    short: 'Về bét',
    blurb: 'Nhân phẩm có hạn, hôm nay có đứa đã tiêu hết.',
    accent: '#9b7bff',
  },
  {
    id: 'teams',
    index: '03',
    title: 'Chia đội & ghép cặp',
    short: 'Chia đội',
    blurb: 'Chia đều, ghép cặp, không ai cãi được cái máy.',
    accent: '#2ee6a6',
  },
]

export const GAMES = [
  {
    id: 'wheel',
    category: 'pick',
    title: 'Vòng Quay Chia Tay',
    tagline: 'Quay đều, nhưng không đều với bạn.',
    description: 'Điền tên, bấm quay, đợi kim dừng. Một cái tên sẽ phải đứng dậy.',
    minPlayers: 2,
    maxPlayers: 24,
    duration: '~10 giây',
    accent: '#ff4d6d',
    badge: 'Kinh điển',
    Component: WheelGame,
  },
  {
    id: 'plinko',
    category: 'pick',
    title: 'Plinko Số Phận',
    tagline: 'Bóng rơi một đường, đời bạn rẽ một ngả.',
    description: 'Thả bóng vàng qua mê cung chốt. Rơi trúng ô nào, người đó lên thớt.',
    minPlayers: 2,
    maxPlayers: 12,
    duration: '~15 giây',
    accent: '#4d9bff',
    badge: 'Gây nghiện',
    Component: PlinkoGame,
  },
  {
    id: 'slots',
    category: 'pick',
    title: 'Máy Xèng Hên Xui',
    tagline: 'Nổ hũ hay nổ người, tuỳ cảm hứng của máy.',
    description: 'Kéo cần, ba trục quay tít. Khi cả ba dừng cùng một cái tên, hết hồn.',
    minPlayers: 2,
    maxPlayers: 10,
    duration: '~12 giây',
    accent: '#ffd23f',
    badge: 'Bựa',
    Component: SlotsGame,
  },
  {
    id: 'bomb',
    category: 'lose',
    title: 'Bom Chuyền Tay',
    tagline: 'Cầm chặt quá cũng nổ, thả sớm cũng tèo.',
    description: 'Quả bom nhảy qua từng người. Ai giữ nó lúc cháy ngòi thì nhận phạt.',
    minPlayers: 2,
    maxPlayers: 16,
    duration: '~20 giây',
    accent: '#ff8f6b',
    badge: 'Hồi hộp',
    Component: BombGame,
  },
  {
    id: 'snail',
    category: 'lose',
    title: 'Đua Ốc Sên',
    tagline: 'Chậm quá cũng là một tài năng.',
    description: 'Các khối ốc sên bò về đích. Về bét — hoặc vài đứa bét nhất — lĩnh phạt.',
    minPlayers: 2,
    maxPlayers: 16,
    duration: '~20 giây',
    accent: '#2ee6a6',
    badge: 'Về bét',
    Component: SnailGame,
  },
  {
    id: 'cards',
    category: 'lose',
    title: 'Lật Bài Sinh Tử',
    tagline: 'Một lá sọ. Ai lật trúng, người đó xui.',
    description: 'Cầm bài lần lượt. Cứ bình tĩnh, vì may mắn có nghe bạn đâu.',
    minPlayers: 2,
    maxPlayers: 12,
    duration: '~1 phút',
    accent: '#9b7bff',
    badge: 'Tương tác',
    Component: CardsGame,
  },
  {
    id: 'hammer',
    category: 'lose',
    title: 'Búa Tạ Số Phận',
    tagline: 'Thần tài không gõ cửa, búa gõ đầu.',
    description: 'Những khối người run rẩy dưới bóng búa. Một nhát thôi, ai cũng hiểu.',
    minPlayers: 2,
    maxPlayers: 16,
    duration: '~10 giây',
    accent: '#ff9f43',
    badge: 'Một hit',
    Component: HammerGame,
  },
  {
    id: 'teams',
    category: 'teams',
    title: 'Máy Chia Đội',
    tagline: 'Chia đều, không cãi, không xin.',
    description: 'Chọn 2–4 đội. Máy hốt từng khối bỏ vào giỏ, cân bằng đến từng người.',
    minPlayers: 2,
    maxPlayers: 24,
    duration: '~15 giây',
    accent: '#4d8bff',
    badge: 'Cân bằng',
    Component: TeamsGame,
  },
  {
    id: 'gacha',
    category: 'teams',
    title: 'Gacha Chia Đội',
    tagline: 'Capsule bay vào giỏ, định mệnh nằm trong nhựa.',
    description: 'Từng quả cầu chứa một người, rơi lộp độp vào đội của họ. Hồi hộp từng giây.',
    minPlayers: 2,
    maxPlayers: 20,
    duration: '~20 giây',
    accent: '#ff6fb5',
    badge: 'Gây nghiện',
    Component: GachaGame,
  },
  {
    id: 'pairs',
    category: 'teams',
    title: 'Máy Ghép Cặp',
    tagline: 'Ghép đôi hay ghép đấu, tuỳ độ thân thiết.',
    description: 'Chia thành các cặp ngẫu nhiên. Dùng để bắt cặp thi đấu, làm việc hay… chịu phạt.',
    minPlayers: 2,
    maxPlayers: 24,
    duration: '~10 giây',
    accent: '#22d3ee',
    badge: 'Chia cặp',
    Component: PairsGame,
  },
]

export const GAME_MAP = new Map(GAMES.map((game) => [game.id, game]))

export function getGame(id) {
  return GAME_MAP.get(id) ?? null
}

export function gamesByCategory(categoryId) {
  return GAMES.filter((game) => game.category === categoryId)
}

export const FEATURED_GAME_ID = 'wheel'
