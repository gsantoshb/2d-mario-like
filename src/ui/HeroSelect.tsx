import { HEROES, SKINS, type HeroId } from '../game/data/content';
import type { Profile } from '../progression/profile';
import { Icon } from './Icon';

export function HeroSelect({
  selected,
  onSelect,
  profile,
}: {
  selected: HeroId;
  onSelect: (hero: HeroId) => void;
  profile: Profile;
}) {
  return (
    <section aria-labelledby="hero-heading" className="selection-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">01 / THE CAST</span>
          <h2 id="hero-heading">
            Choose your legend<span className="accent">.</span>
          </h2>
        </div>
        <p>Same adventure. A different kind of power.</p>
      </div>
      <div className="hero-grid">
        {HEROES.map((h) => {
          const active = h.id === selected;
          const skin = SKINS.find((s) => s.id === profile.equipped[h.id])!;
          return (
            <button
              key={h.id}
              className={`hero-card ${active ? 'selected' : ''}`}
              style={{ '--hero-color': h.color } as React.CSSProperties}
              onClick={() => onSelect(h.id)}
              aria-pressed={active}
              aria-label={`Select ${h.name}. ${h.skill}. ${h.description}`}
            >
              <div className="hero-art">
                <span className="card-number">{h.number}</span>
                <span className="selection-mark">
                  {active ? <Icon name="check" size={15} /> : <span />}
                </span>
                <div className="hero-halo" />
                <span className="pixel-sparks">✦</span>
                <img className="hero-sprite" src={`assets/${skin.sheet}-idle.png`} alt="" />
                <span className="hero-shadow" />
                <span className="hero-watermark">
                  {h.id === 'balayya' ? 'SIMHA' : h.id === 'chiru' ? 'MEGA' : 'POWER'}
                </span>
              </div>
              <div className="hero-info">
                <div className="hero-title-row">
                  <div>
                    <span className="eyebrow">{h.title}</span>
                    <h3>{h.name}</h3>
                  </div>
                  <span className="skill-icon">
                    <Icon name="bolt" size={22} />
                  </span>
                </div>
                <p>{h.description}</p>
                <span className="skill-tag">
                  <span /> {h.skill}
                  <span className="keycap">X</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
