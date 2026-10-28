import { getLevel, actNumber, type HEROES } from '../game/data/content';
import { Bridge, type Hud, type RunConfig } from '../game/events';
import type { Result } from '../progression/profile';
import { GameHost } from './GameHost';
import { audio } from '../game/systems/audio';
import { Controls } from './Controls';
import { Icon } from './Icon';
interface Props {
  config: RunConfig;
  heroData: (typeof HEROES)[number];
  hud: Hud;
  paused: boolean;
  bridge: Bridge;
  setHud: (hud: Hud) => void;
  setPaused: (value: boolean) => void;
  complete: (result: Result) => void;
  leave: () => void;
}
export function Gameplay({
  config,
  heroData,
  hud,
  paused,
  bridge,
  setHud,
  setPaused,
  complete,
  leave,
}: Props) {
  return (
    <section className="play-screen">
      <div className="game-heading">
        <div>
          <span className="eyebrow">ACT 0{actNumber(config.level)}</span>
          <h2>{getLevel(config.level).title}</h2>
        </div>
        <div className="game-actions">
          <button
            className="button quiet"
            onClick={() => bridge.emit('resume', undefined)}
            hidden={!paused}
          >
            Resume
          </button>
          <button className="button quiet" onClick={() => bridge.emit('pause', undefined)}>
            <Icon name="pause" /> Pause
          </button>
        </div>
      </div>
      <div className="game-frame">
        <div className="hud">
          <span className="hud-hero">{heroData.name}</span>
          <span className="hearts" aria-label={`${hud.health} health`}>
            {[0, 1, 2].map((i) => (
              <span key={i} className={i < hud.health ? 'full' : ''}>
                <Icon name="heart" size={17} />
              </span>
            ))}
          </span>
          <span>
            <Icon name="coin" size={15} /> {String(hud.coins).padStart(2, '0')}
          </span>
          <span className="hud-score">{String(hud.score).padStart(5, '0')}</span>
          <span className="hud-time">
            {String(Math.floor(hud.seconds / 60)).padStart(2, '0')}:
            {String(hud.seconds % 60).padStart(2, '0')}
          </span>
          <span className="hud-skill">
            <Icon name="bolt" size={14} />
            {heroData.skill}
            <i style={{ '--ready': `${hud.ready * 100}%` } as React.CSSProperties} />
            <b>{hud.ready === 1 ? 'READY' : `${((1 - hud.ready) * 3).toFixed(1)}s`}</b>
          </span>
        </div>
        <div className="power-status" aria-live="polite">
          <span className={hud.grown ? 'power-chip grown' : 'power-chip'}>
            {hud.grown ? '🍄 GROWN · +1 HIT' : '🍄 Find a Growshroom'}
          </span>
          <span className={hud.starSeconds > 0 ? 'power-chip star' : 'power-chip'}>
            {hud.starSeconds > 0 ? `★ MASS STAR · ${hud.starSeconds}s` : '★ Find a Mass Star'}
          </span>
          <small>Collect by touch · your X skill stays equipped</small>
        </div>
        <div className="game-stage">
          <GameHost
            config={config}
            bridge={bridge}
            onHud={setHud}
            onPause={setPaused}
            onComplete={complete}
          />
          {hud.bossHealth !== null && (
            <div className="boss-bar">
              <span>
                PRAKASH RAJ <b>{hud.bossHealth <= 3 ? 'PHASE II' : 'PHASE I'}</b>
              </span>
              <div>
                <i style={{ width: `${(hud.bossHealth / 6) * 100}%` }} />
              </div>
              <small>
                {hud.bossPhase === 'VULNERABLE'
                  ? 'OPENING! STRIKE NOW'
                  : hud.bossPhase === 'WINDUP'
                    ? 'WATCH THE WINDUP'
                    : 'DODGE THE ATTACK'}
              </small>
            </div>
          )}
          {hud.escape !== null && <div className="escape-clock">ESCAPE · {hud.escape}s</div>}
          {paused && (
            <div
              className="game-overlay"
              role="dialog"
              aria-modal="true"
              aria-labelledby="pause-title"
              onKeyDown={(event) => {
                if (event.key !== 'Tab') return;
                const buttons = event.currentTarget.querySelectorAll<HTMLButtonElement>('button');
                const first = buttons[0],
                  last = buttons[buttons.length - 1];
                if (event.shiftKey && document.activeElement === first) {
                  event.preventDefault();
                  last.focus();
                } else if (!event.shiftKey && document.activeElement === last) {
                  event.preventDefault();
                  first.focus();
                }
              }}
            >
              <span className="eyebrow">TAKE A BREATHER</span>
              <h2 id="pause-title">Even legends pause.</h2>
              <p>Your next big moment can wait.</p>
              <button
                id="resume-button"
                className="button primary"
                onClick={() => {
                  audio.unlock();
                  bridge.emit('resume', undefined);
                }}
              >
                <Icon name="play" /> Resume adventure
              </button>
              <button className="button quiet" onClick={leave}>
                Leave run · unbanked coins are lost
              </button>
            </div>
          )}
        </div>
        <div className="game-message" role="status">
          {hud.message ||
            `${hud.checkpoint ? '⚑ Checkpoint secured' : 'Find the green checkpoint flags'} · ${hud.bossHealth !== null ? 'Green glow = your opening.' : 'Keep going. Your moment is ahead.'}`}
        </div>
        <div className="progress-track">
          <i style={{ width: `${hud.progress * 100}%` }} />
        </div>
      </div>
      <Controls />
      <p className="play-note">No lives to run out of. Retry, find your rhythm, make it mass.</p>
    </section>
  );
}
