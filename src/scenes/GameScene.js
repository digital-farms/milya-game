// Файл: GameScene.js
// ОТВЕЧАЕТ ЗА: Основной игровой процесс (спавн героев, подсчет очков, обработка кликов)
// КОНТАКТЫ С ДРУГИМИ: Взаимодействует с UIScene (UI), MiniGameScene (мини-игра), CHARACTERS (config.js)
// ОСНОВНОЕ: Управляет логикой появления героев, начислением очков, переходами между сценами

import { CHARACTERS, BACKGROUND, CLICK_SOUND, ITEMS } from '../utils/config.js';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.score = 0;
    this.unlockedCharacters = [0]; // Индексы открытых персонажей
    this.currentCharacterIdx = 0;
    this.characterSprite = null;
  }

  init(data) {
    if (data && data.unlockedCharacters) {
      this.unlockedCharacters = data.unlockedCharacters;
    }
    if (data && data.score) {
      this.score = data.score;
    }
    this.currentCharacterIdx = 0;
  }

  preload() {
    this.load.image('background', BACKGROUND);
    CHARACTERS.forEach(ch => {
      this.load.image(ch.key, ch.image);
    });
    this.load.image('backpack', ITEMS.find(i => i.key === 'backpack').image);
    this.load.audio('click', CLICK_SOUND);
  }

  create() {
    this.add.image(400, 300, 'background').setDisplaySize(800, 600);
    this.scoreText = this.scene.get('UIScene').events;
    this.inputSound = this.sound.add('click');

    this.spawnNextCharacter();

    this.events.on('resume', (sys, data) => {
      if (data && data.newCharacter) {
        this.unlockedCharacters.push(data.newCharacter);
      }
    });

    // Гарантированно запускаем UI поверх
    this.scene.launch('UIScene');
  }

  spawnNextCharacter() {
    if (this.characterSprite) {
      this.characterSprite.destroy();
    }
    // Берём только текущего персонажа (по индексу)
    const idx = this.unlockedCharacters[this.currentCharacterIdx];
    const ch = CHARACTERS[idx];
    const x = Phaser.Math.Between(120, 680);
    const y = Phaser.Math.Between(180, 500);
    this.characterSprite = this.add.sprite(x, y, ch.key)
      .setInteractive()
      .setScale(0.22)
      .setAlpha(0);
    this.tweens.add({ targets: this.characterSprite, alpha: 1, duration: 400, ease: 'Quad.easeIn' });
    this.characterSprite.on('pointerdown', () => {
      this.inputSound.play();
      this.tweens.add({
        targets: this.characterSprite,
        scale: 0.22,
        alpha: 0,
        duration: 120,
        onComplete: () => {
          this.incrementScore();
          this.currentCharacterIdx = (this.currentCharacterIdx + 1) % this.unlockedCharacters.length;
          this.spawnNextCharacter();
        }
      });
    });
  }

  incrementScore() {
    this.score++;
    this.scene.get('UIScene').events.emit('scoreChanged', this.score, this.nextUnlockScore());
    // Проверка на открытие нового персонажа
    if (this.unlockedCharacters.length < CHARACTERS.length) {
      const nextIdx = this.unlockedCharacters.length;
      if (this.score >= CHARACTERS[nextIdx].unlockScore) {
        this.scene.get('UIScene').events.emit('showUnlock', nextIdx);
        this.scene.pause();
      }
    }
  }

  nextUnlockScore() {
    if (this.unlockedCharacters.length < CHARACTERS.length) {
      return CHARACTERS[this.unlockedCharacters.length].unlockScore;
    }
    return null;
  }

  unlockCharacter(idx) {
    this.unlockedCharacters.push(idx);
    this.scene.restart({ score: this.score, unlockedCharacters: this.unlockedCharacters });
  }
}
