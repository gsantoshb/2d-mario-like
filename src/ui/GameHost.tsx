import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { PlayScene } from '../game/scenes/PlayScene';
import { Bridge, type Hud, type RunConfig } from '../game/events';
import type { Result } from '../progression/profile';

declare global {
  interface Window {
    __MASS_QUEST__?: Phaser.Game;
  }
}
interface Props {
  config: RunConfig;
  bridge: Bridge;
  onHud: (hud: Hud) => void;
  onPause: (paused: boolean) => void;
  onComplete: (result: Result) => void;
}
export function GameHost({ config, bridge, onHud, onPause, onComplete }: Props) {
  const parent = useRef<HTMLDivElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(2);
  useEffect(() => {
    const measure = () => {
      const width = wrapper.current?.clientWidth ?? 768;
      setScale(Math.max(1, Math.floor(Math.min(width / 384, (window.innerHeight - 250) / 216))));
    };
    const observer = new ResizeObserver(measure);
    if (wrapper.current) observer.observe(wrapper.current);
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);
  useEffect(() => {
    const unsub = [
      bridge.on('hud', onHud),
      bridge.on('paused', onPause),
      bridge.on('complete', onComplete),
    ];
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: parent.current!,
      width: 384,
      height: 216,
      pixelArt: true,
      roundPixels: true,
      antialias: false,
      backgroundColor: '#2b2938',
      audio: { noAudio: true },
      physics: {
        default: 'arcade',
        arcade: { gravity: { x: 0, y: 760 }, fixedStep: true, fps: 60 },
      },
      scene: [new PlayScene(config, bridge)],
      render: { transparent: false },
    });
    if (import.meta.env.DEV) window.__MASS_QUEST__ = game;
    return () => {
      unsub.forEach((off) => off());
      if (window.__MASS_QUEST__ === game) delete window.__MASS_QUEST__;
      game.destroy(true);
    };
  }, [config, bridge, onHud, onPause, onComplete]);
  return (
    <div ref={wrapper} className="game-well">
      <div
        ref={parent}
        className="game-canvas"
        style={{ width: 384 * scale, height: 216 * scale }}
        role="img"
        aria-label="Mass Quest game. Move with A and D, jump with Space, use skill with X, pause with Escape."
      />
      <p className="small-screen">For the best experience, play on a desktop with a keyboard.</p>
    </div>
  );
}
