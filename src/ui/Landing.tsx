import { HEROES, LEVELS, actNumber, type HeroId, type LevelId } from '../game/data/content';
import type { Profile } from '../progression/profile';
import { HeroSelect } from './HeroSelect';
import { Controls } from './Controls';
import { Icon } from './Icon';
interface Props {
  profile: Profile;
  hero: HeroId;
  heroData: (typeof HEROES)[number];
  chooseHero: (hero: HeroId) => void;
  level: LevelId;
  setLevel: (level: LevelId) => void;
  start: () => void;
}
export function Landing({ profile, hero, heroData, chooseHero, level, setLevel, start }: Props) {
  return (
    <>
      <section className="intro">
        <div className="intro-copy">
          <span className="eyebrow">
            <span className="status-dot" /> LIGHTS. PIXELS. ACTION.
          </span>
          <h1>
            A little pixel.
            <br />A lot of <span className="serif">mass.</span>
          </h1>
          <p>
            Three legends. One epic adventure.
            <br />
            Jump into a world where Telugu cinema goes 8-bit.
          </p>
          <div className="intro-tags">
            <span>
              <Icon name="bolt" size={14} /> SIGNATURE POWERS
            </span>
            <span>
              <i /> 5 ORIGINAL LEVELS
            </span>
          </div>
        </div>
        <div className="scene-preview">
          <div className="scene-topline">
            <span>
              <i /> NOW SHOWING
            </span>
            <span>8-BIT / FULL MASS</span>
          </div>
          <div className="scene-art">
            <img
              className="scene-bg"
              src="assets/village.png"
              alt="Pixel sunset over a Telugu village with festival bunting"
            />
            <div className="scene-cast">
              {HEROES.map((h) => (
                <img key={h.id} src={`assets/${h.id}-idle.png`} alt="" />
              ))}
            </div>
            <span className="scene-location">
              GODAVARI VILLAGE <span>→</span>
            </span>
          </div>
          <div className="scene-caption">
            <span>AN ADVENTURE BIGGER THAN ITS PIXELS</span>
            <span>EST. 2026</span>
          </div>
        </div>
      </section>
      <HeroSelect selected={hero} onSelect={chooseHero} profile={profile} />
      <section className="campaign-section" aria-labelledby="campaign-title">
        <div className="section-heading compact">
          <div>
            <span className="eyebrow">02 / THE ADVENTURE</span>
            <h2 id="campaign-title">
              Pick your scene<span className="accent">.</span>
            </h2>
          </div>
          <p>Finish an act to unlock the next.</p>
        </div>
        <div className="level-grid">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              className={`level-card ${level === l.id ? 'selected' : ''}`}
              disabled={!profile.unlocked.includes(l.id)}
              aria-pressed={level === l.id}
              onClick={() => setLevel(l.id)}
            >
              <img src={`assets/${l.theme}.png`} alt="" />
              <span className="level-number">0{actNumber(l.id)}</span>
              <span className="level-copy">
                <small>{l.location}</small>
                <strong>{l.title}</strong>
                <small>
                  {!profile.unlocked.includes(l.id)
                    ? 'Finish the previous act'
                    : profile.best[l.id]
                      ? `BEST ${profile.best[l.id]} · REPLAY`
                      : 'READY FOR YOUR DEBUT'}
                </small>
              </span>
              <span className="level-state">
                <Icon
                  name={
                    !profile.unlocked.includes(l.id) ? 'lock' : level === l.id ? 'check' : 'arrow'
                  }
                  size={16}
                />
              </span>
            </button>
          ))}
        </div>
      </section>
      <div className="launch-bar">
        <div>
          <span className="ready-dot" />
          <span>
            <strong>{heroData.name} is ready.</strong>
            <small>{heroData.skill} equipped. Let’s make an entrance.</small>
          </span>
        </div>
        <button className="button primary start-button" onClick={() => start()}>
          <Icon name="play" size={17} /> Start adventure <Icon name="arrow" />
        </button>
      </div>
      <Controls />
    </>
  );
}
