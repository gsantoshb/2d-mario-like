import { HEROES, SKINS } from '../game/data/content';
import { equip, purchase, type Profile } from '../progression/profile';
import { Icon } from './Icon';
export function Shop({
  profile,
  update,
}: {
  profile: Profile;
  update: (profile: Profile) => void;
}) {
  return (
    <section className="inner-page">
      <span className="eyebrow">THE WARDROBE</span>
      <h1>
        New look.
        <br />
        <span className="serif">Same legend.</span>
      </h1>
      <p className="page-description">
        Earn coins. Make the role your own. Every outfit is purely cosmetic.
      </p>
      <div className="wallet-banner">
        <span>
          <Icon name="coin" /> YOUR WALLET
        </span>
        <strong>
          {profile.coins} <small>earned coins</small>
        </strong>
      </div>
      <div className="shop-grid">
        {SKINS.map((s) => {
          const hero = HEROES.find((h) => h.id === s.hero)!;
          const owned = profile.owned.includes(s.id),
            equipped = profile.equipped[s.hero] === s.id;
          return (
            <article className="shop-card" key={s.id}>
              <div
                className="shop-art"
                style={{ '--hero-color': hero.color } as React.CSSProperties}
              >
                <img src={`assets/${s.sheet}-idle.png`} alt={`${hero.name} in ${s.name} outfit`} />
                <span className="eyebrow">{hero.name}</span>
              </div>
              <div className="shop-info">
                <h3>{s.name}</h3>
                <p>
                  {s.price === 0
                    ? 'The classic. Always yours.'
                    : 'A fresh palette for a familiar face.'}
                </p>
                <button
                  className={equipped ? 'button quiet' : 'button secondary'}
                  disabled={equipped || (!owned && profile.coins < s.price)}
                  onClick={() => update(owned ? equip(profile, s.id) : purchase(profile, s.id))}
                >
                  {equipped ? (
                    <>
                      <Icon name="check" /> Equipped
                    </>
                  ) : owned ? (
                    'Equip outfit'
                  ) : (
                    <>
                      <Icon name="coin" /> {s.price} coins{' '}
                      {profile.coins < s.price ? `· Need ${s.price - profile.coins} more` : ''}
                    </>
                  )}
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="save-note">
        Coins are earned by finishing levels. No real-money purchases. Progress stays in this
        browser and can be cleared or edited locally; there is no account sync or verified purchase
        ownership.
      </p>
    </section>
  );
}
