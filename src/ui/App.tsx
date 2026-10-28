import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HEROES, getLevel, SKINS, type HeroId, type LevelId } from '../game/data/content';
import { Bridge, type Hud, type RunConfig } from '../game/events';
import { defaults, reward, type Profile, type Result } from '../progression/profile';
import { loadProfile, saveProfile } from '../storage/profileStore';
import { audio } from '../game/systems/audio';
import { Landing } from './Landing';
import { Results } from './Results';
import { Controls } from './Controls';
import { Shop } from './Shop';
import { Icon } from './Icon';
const Gameplay = lazy(() => import('./Gameplay').then((module) => ({ default: module.Gameplay })));

type Page = 'play' | 'shop' | 'guide' | 'settings';
const emptyHud: Hud = {
  health: 3,
  grown: false,
  starSeconds: 0,
  coins: 0,
  score: 0,
  ready: 1,
  seconds: 0,
  checkpoint: false,
  message: '',
  bossHealth: null,
  bossPhase: '',
  escape: null,
  progress: 0,
};
const read = () => {
  try {
    return loadProfile(window.localStorage);
  } catch {
    return {
      profile: defaults(),
      notice: 'Browser storage is unavailable. Progress will last for this session only.',
    };
  }
};
export function App() {
  const [initial] = useState(read);
  const [profile, setProfile] = useState(initial.profile);
  const profileRef = useRef(profile);
  const [notice, setNotice] = useState(initial.notice);
  const [page, setPage] = useState<Page>('play');
  const [hero, setHero] = useState<HeroId>(profile.lastHero);
  const [level, setLevel] = useState<LevelId>('festival-run');
  const [config, setConfig] = useState<RunConfig | null>(null);
  const [hud, setHud] = useState(emptyHud);
  const [paused, setPaused] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const bridge = useMemo(() => new Bridge(), []);
  const heroData = HEROES.find((h) => h.id === hero)!;
  const updateProfile = useCallback((next: Profile) => {
    profileRef.current = next;
    setProfile(next);
    try {
      const message = saveProfile(window.localStorage, next);
      if (message) setNotice(message);
    } catch {
      setNotice('Progress could not be saved. It remains available this session.');
    }
  }, []);
  const complete = useCallback(
    (r: Result) => {
      updateProfile(reward(profileRef.current, r));
      setResult(r);
      setConfig(null);
      setPaused(false);
    },
    [updateProfile],
  );
  useEffect(() => {
    audio.mute(profile.muted);
  }, [profile.muted]);
  useEffect(() => {
    if (!paused) return;
    document.getElementById('resume-button')?.focus();
  }, [paused]);
  const chooseHero = (id: HeroId) => {
    setHero(id);
    updateProfile({ ...profileRef.current, lastHero: id });
  };
  const start = (selected: LevelId = level) => {
    if (!profileRef.current.unlocked.includes(selected)) return;
    audio.unlock();
    setLevel(selected);
    setResult(null);
    setPaused(false);
    setHud(emptyHud);
    setConfig({
      hero,
      level: selected,
      skin: SKINS.find((s) => s.id === profileRef.current.equipped[hero])!.sheet,
      runId: crypto.randomUUID(),
    });
    window.scrollTo(0, 0);
  };
  const leave = () => {
    setConfig(null);
    setResult(null);
    setPaused(false);
    setPage('play');
  };
  const mute = () => updateProfile({ ...profileRef.current, muted: !profileRef.current.muted });
  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          onClick={config ? undefined : leave}
          disabled={!!config}
          aria-label="Mass Quest home"
        >
          <span className="brand-mark">
            <i />
            <i />
            <i />
          </span>
          <span>
            MASS<span className="brand-light">QUEST</span>
            <small>A TELUGU PIXEL ADVENTURE</small>
          </span>
        </button>
        {!config ? (
          <nav aria-label="Main navigation">
            {(['play', 'shop', 'guide'] as Page[]).map((p) => (
              <button
                key={p}
                className={page === p ? 'active' : ''}
                onClick={() => {
                  setPage(p);
                  setResult(null);
                }}
              >
                {p === 'play' ? 'Play' : p === 'shop' ? 'Wardrobe' : 'How to play'}
                {p === 'shop' && <span className="nav-new">NEW</span>}
              </button>
            ))}
          </nav>
        ) : (
          <span className="playing-location">
            <span /> {getLevel(config.level).location}
          </span>
        )}
        <div className="header-actions">
          <span className="wallet">
            <Icon name="coin" size={16} />
            {profile.coins}
          </span>
          <button
            className="icon-button"
            aria-label={profile.muted ? 'Unmute sound' : 'Mute sound'}
            onClick={mute}
          >
            <Icon name={profile.muted ? 'mute' : 'sound'} />
          </button>
          {!config && (
            <button className="player-tag" onClick={() => setPage('settings')}>
              <span className="status-dot" /> PLAYER 01
            </button>
          )}
        </div>
      </header>
      {notice && (
        <div className="notice" role="status">
          {notice}
          <button onClick={() => setNotice('')} aria-label="Dismiss save notice">
            ×
          </button>
        </div>
      )}
      <main>
        {config ? (
          <Suspense
            fallback={
              <div className="loading-scene" role="status">
                SETTING THE SCENE…
              </div>
            }
          >
            <Gameplay
              config={config}
              heroData={heroData}
              hud={hud}
              paused={paused}
              bridge={bridge}
              setHud={setHud}
              setPaused={setPaused}
              complete={complete}
              leave={leave}
            />
          </Suspense>
        ) : result ? (
          <Results
            result={result}
            profile={profile}
            heroData={heroData}
            start={start}
            leave={leave}
          />
        ) : page === 'play' ? (
          <Landing
            profile={profile}
            hero={hero}
            heroData={heroData}
            chooseHero={chooseHero}
            level={level}
            setLevel={setLevel}
            start={start}
          />
        ) : page === 'shop' ? (
          <Shop profile={profile} update={updateProfile} />
        ) : page === 'guide' ? (
          <section className="inner-page guide">
            <span className="eyebrow">THE DIRECTOR’S NOTES</span>
            <h1>
              Easy to play.
              <br />
              <span className="serif">Hard to put down.</span>
            </h1>
            <Controls />
            <div className="guide-grid">
              <article>
                <span>01</span>
                <h3>Find your rhythm</h3>
                <p>
                  Run, jump over gaps, and land on enemies to bounce. Touching an enemy from the
                  side costs a heart. Green flags save your place.
                </p>
              </article>
              <article>
                <span>02</span>
                <h3>Own your power</h3>
                <p>
                  Press X for your hero’s signature move. Watch the cooldown in the HUD. Every hero
                  can complete every level.
                </p>
              </article>
              <article>
                <span>03</span>
                <h3>Make it to the credits</h3>
                <p>
                  Finish an act to bank collected coins and unlock the next. Spend coins in the
                  wardrobe. Against Prakash Raj, dodge his windup and strike when he glows green.
                </p>
              </article>
            </div>
            <button className="button primary" onClick={() => setPage('play')}>
              Choose your legend <Icon name="arrow" />
            </button>
          </section>
        ) : (
          <section className="inner-page settings">
            <span className="eyebrow">YOUR SETUP</span>
            <h1>
              Set the <span className="serif">scene.</span>
            </h1>
            <div className="setting-row">
              <div>
                <h3>Arcade sound</h3>
                <p>Original chiptune-inspired sound effects.</p>
              </div>
              <button className="button secondary" onClick={mute}>
                <Icon name={profile.muted ? 'mute' : 'sound'} />
                {profile.muted ? 'Sound off' : 'Sound on'}
              </button>
            </div>
            <div className="setting-row">
              <div>
                <h3>Saved on this browser</h3>
                <p>
                  Progress can be cleared or edited locally. No account sync or verified purchase
                  ownership. Unfinished runs restart after reload.
                </p>
              </div>
              <span className="local-badge">LOCAL SAVE</span>
            </div>
            <button className="button quiet" onClick={() => setPage('play')}>
              <Icon name="back" /> Back to the game
            </button>
          </section>
        )}
      </main>
      <footer>
        <span>
          <span className="footer-dot" /> SMALL PIXELS. BIG SCREEN ENERGY.
        </span>
        <span>
          A fan-made adventure <i>·</i> Built for the love of cinema.
        </span>
        <span>
          V 0.1 <i>·</i> LOCAL SAVE
        </span>
      </footer>
    </div>
  );
}
