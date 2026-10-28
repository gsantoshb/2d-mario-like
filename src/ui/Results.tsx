import { getLevel, nextLevel, type HEROES, type LevelId } from '../game/data/content';
import type { Result, Profile } from '../progression/profile';
import { Icon } from './Icon';
interface Props {
  result: Result;
  profile: Profile;
  heroData: (typeof HEROES)[number];
  start: (level: LevelId) => void;
  leave: () => void;
}
export function Results({ result, profile, heroData, start, leave }: Props) {
  const hero = heroData.id;
  return (
    <section className="result-screen">
      <span className="result-star">
        <Icon name="star" size={44} />
      </span>
      <span className="eyebrow">
        {result.level === 'fortress-finale' ? 'THE CREDITS ROLL' : 'LEVEL COMPLETE'}
      </span>
      <h1>
        {result.level === 'fortress-finale' ? 'A legendary finish.' : 'That’s a mass finish.'}
      </h1>
      <p>
        {result.level === 'fortress-finale'
          ? 'Prakash Raj is down. The spotlight is yours.'
          : `${getLevel(result.level).title} conquered. Your next scene is ready.`}
      </p>
      <img
        className="result-hero"
        src={`assets/${profile.equipped[hero]}-idle.png`}
        alt={heroData.name}
      />
      <div className="result-stats">
        <span>
          SCORE<strong>{result.score}</strong>
        </span>
        <span>
          COINS BANKED<strong>+{result.coins}</strong>
        </span>
        <span>
          ACTIVE TIME<strong>{result.seconds}s</strong>
        </span>
      </div>
      <div className="result-buttons">
        {nextLevel(result.level) && (
          <button className="button primary" onClick={() => start(nextLevel(result.level)!)}>
            Next act <Icon name="arrow" />
          </button>
        )}
        <button className="button secondary" onClick={() => start(result.level)}>
          Play again
        </button>
        <button className="button quiet" onClick={leave}>
          Choose hero / level
        </button>
      </div>
    </section>
  );
}
