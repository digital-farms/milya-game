// Файл: MiniGameScene.js
// ОТВЕЧАЕТ ЗА: Мини-игру (сбор предметов)
// КОНТАКТЫ С ДРУГИМИ: Возвращает результат в UIScene/GameScene, использует ITEMS (config.js)
// ОСНОВНОЕ: Спавнит предметы, обрабатывает клики, завершает мини-игру и сообщает о результате

import { ITEMS, CLICK_SOUND, BACKGROUND_MINIGAME } from '../utils/config.js';

export default class MiniGameScene extends Phaser.Scene {
  constructor() {
    super('MiniGameScene');
  }

  init(data) {
    this.returnScene = data.returnScene || 'GameScene';
    this.newCharacterIdx = data.newCharacterIdx;
  }

  preload() {
    this.load.image('background-minigame', BACKGROUND_MINIGAME);
    ITEMS.forEach(it => {
      this.load.image(it.key, it.image);
    });
    this.load.audio('click', CLICK_SOUND);
  }

  create() {
    this.add.image(400, 300, 'background-minigame').setDisplaySize(800, 600);
    this.cleared = 0;
    this.inputSound = this.sound.add('click');
    this.spawnItems();
    // Удаляем лишний рюкзак, если он вдруг появляется (не спавнить его в мини-игре)
    // Если где-то есть this.add.image(..., 'backpack'), убрать/закомментировать
  }

  spawnItems() {
    this.items = [];
    Phaser.Utils.Array.Shuffle(ITEMS.filter(i => i.key !== 'backpack')).forEach((it, i) => {
      const x = 180 + i * 180;
      const y = 350;
      const sprite = this.add.sprite(x, y, it.key)
        .setInteractive()
        .setScale(0.22)
        .setAlpha(0.92);
      this.tweens.add({ targets: sprite, alpha: 1, duration: 400, ease: 'Quad.easeIn' });
      sprite.on('pointerdown', () => {
        this.inputSound.play();
        sprite.disableInteractive();
        this.tweens.add({ targets: sprite, scale: 1.3, alpha: 0, duration: 200, onComplete: () => { sprite.destroy(); } });
        this.cleared++;
        if (this.cleared >= ITEMS.length - 1) {
          this.time.delayedCall(400, () => this.finishMiniGame());
        }
      });
      this.items.push(sprite);
    });
  }

  finishMiniGame() {
    this.scene.get('UIScene').events.emit('miniGameSuccess', this.newCharacterIdx);
    this.scene.stop();
    this.scene.resume(this.returnScene, { newCharacter: this.newCharacterIdx });
  }
}
