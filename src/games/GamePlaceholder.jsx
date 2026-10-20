import { sfx } from '../lib/sfx'

export default function GamePlaceholder({ title = 'Mini game', players = [], onFinish }) {
  return (
    <div className="game-root game-stub">
      <div className="game-stub-card">
        <span className="hud-kicker">Đang lắp khối</span>
        <h2>{title}</h2>
        <p>Mini game này đang được ráp. Bấm nút để xem kết quả mẫu.</p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            sfx.win()
            onFinish({
              type: 'players',
              playerIds: players.slice(0, 1).map((player) => player.id),
              headline: 'Người được chọn',
              tone: 'pick',
            })
          }}
        >
          Chạy thử kết quả
        </button>
      </div>
    </div>
  )
}
