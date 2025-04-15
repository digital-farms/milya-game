// Файл: UIScene.js
// ОТВЕЧАЕТ ЗА: Весь пользовательский интерфейс (UI): очки, силуэт героя, рюкзак, всплывающие окна
// КОНТАКТЫ С ДРУГИМИ: Получает CHARACTERS из config.js, взаимодействует с GameScene и MiniGameScene
// ОСНОВНОЕ: Показывает очки, силуэт следующего героя, иконку рюкзака, окна разблокировки

import { CHARACTERS, BACKPACK_SOUND } from '../utils/config.js';

export default class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.score = 0;
    this.nextUnlock = CHARACTERS[1]?.unlockScore || null;
    this.pendingUnlockIdx = null;

    // --- Новый кастомный UI ---
    // Силуэт следующего героя
    this.silhouette = this.add.image(100, 110, CHARACTERS[1]?.key || CHARACTERS[0].key)
      .setOrigin(0.5)
      .setScale(0.19)
      .setTint(0x171b3c)
      .setTintFill(0x171b3c)
      .setAlpha(1);
    this.silhouette.setTintFill(0x171b3c);
    // Белый бордер (имитация)
    // this.silhouetteBorder = this.add.circle(90, 90, 60, 0xffffff, 0).setStrokeStyle(5, 0x000000);

    // Очки до следующего героя
    this.nextScoreText = this.add.text(90, 110, '0', {
      fontFamily: 'Carter One',
      fontSize: '48px',
      color: '#fff',
      fontStyle: 'normal',
      stroke: '#000',
      strokeThickness: 8,
      align: 'center',
      fixedWidth: 65,
      fixedHeight: 48,
    }).setOrigin(0.5, 0); // Смещение вправо на 10 пикселей

    // Общее количество очков
    this.scoreText = this.add.text(90, 200, '0', {
      fontFamily: 'Carter One',
      fontSize: '72px',
      color: '#fff',
      fontStyle: 'normal',
      stroke: '#000',
      strokeThickness: 8,
      align: 'center',
      fixedWidth: 120,
      fixedHeight: 70,
    }).setOrigin(0.5, 0);


    // --- END кастомный UI ---

    this.unlockText = this.add.text(20, 54, '', { font: '22px Arial', fill: '#fff', stroke: '#000', strokeThickness: 2 });
    this.unlockText.setVisible(true);
    this.unlockWindow = null;

    // --- Иконка рюкзака ---
    this.backpackIcon = this.add.image(700, 100, 'backpack')
      .setInteractive({ useHandCursor: true })
      .setScale(0.18)
      .setDepth(3);
    this.backpackPulseTween = null;

    // --- Клик по рюкзаку ---
    this.backpackIcon.on('pointerdown', () => {
      console.log('backpack click', this.backpackIcon.pulseActive, this.pendingUnlockIdx);
      if (this.backpackIcon.pulseActive && this.pendingUnlockIdx !== null) {
        if (this.backpackSound) this.backpackSound.play();
        this.scene.get('GameScene').scene.pause();
        this.scene.launch('MiniGameScene', { returnScene: 'GameScene', newCharacterIdx: this.pendingUnlockIdx });
        this.setBackpackPulse(false);
        this.pendingUnlockIdx = null;
      }
    });

    // --- Функция управления прыгающей анимацией ---
    this.setBackpackPulse = (active) => {
      if (active) {
        if (!this.backpackPulseTween) {
          this.backpackPulseTween = this.tweens.add({
            targets: this.backpackIcon,
            y: { from: 100, to: 80 },
            yoyo: true,
            repeat: -1,
            duration: 320,
            ease: 'Sine.easeInOut',
          });
          this.backpackIcon.pulseActive = true;
        }
      } else {
        if (this.backpackPulseTween) {
          this.backpackPulseTween.stop();
          this.backpackPulseTween = null;
          this.backpackIcon.y = 100;
          this.backpackIcon.pulseActive = false;
        }
      }
    };

    this.load.audio('backpack', BACKPACK_SOUND);
    this.backpackSound = null;
    this.load.once('complete', () => {
      this.backpackSound = this.sound.add('backpack');
    });

    // --- Обработка очков и pulse ---
    this.events.on('scoreChanged', (tapsSinceLastUnlock, score) => {
      this.scoreText.setText(score);
      let nextIdx = -1;
      for (let i = 0; i < CHARACTERS.length; ++i) {
        if (!this.scene.get('GameScene').unlockedCharacters.includes(i)) {
          nextIdx = i;
          break;
        }
      }
      if (nextIdx !== -1) {
        const needTaps = CHARACTERS[nextIdx].unlockScore;
        this.nextScoreText.setText(Math.max(0, needTaps - tapsSinceLastUnlock));
        this.silhouette.setTexture(CHARACTERS[nextIdx].key).setTint(0x171b3c);
        if (tapsSinceLastUnlock >= needTaps) {
          this.setBackpackPulse(true);
          this.pendingUnlockIdx = nextIdx;
        } else {
          this.setBackpackPulse(false);
          this.pendingUnlockIdx = null;
        }
      } else {
        this.nextScoreText.setText('0');
        this.setBackpackPulse(false);
        this.pendingUnlockIdx = null;
      }
    });

    this.events.on('miniGameSuccess', idx => {
      this.showSuccessWindow(idx);
    });
  }

  showSuccessWindow(idx) {
    if (this.unlockWindow) this.unlockWindow.destroy();
    const ch = CHARACTERS[idx];
    const bg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x222222, 0.5).setDepth(10);

    // Делаем картинку персонажа такого же размера, как в showUnlockWindow
    const img = this.add.image(400, 270, ch.key).setScale(0.42).setDepth(11);
    const txt = this.add.text(400, 200, `Герой открыт: ${ch.name}!`, { font: '26px Arial', fill: '#fff' }).setOrigin(0.5).setDepth(11);
    const btn = this.add.text(400, 360, 'Продолжить', { font: '22px Arial', fill: '#ff0', backgroundColor: '#444', padding: { left: 16, right: 16, top: 8, bottom: 8 } })
      .setOrigin(0.5).setInteractive().setDepth(11);
    btn.on('pointerdown', () => {
      bg.destroy(); img.destroy(); txt.destroy(); btn.destroy();
      this.unlockWindow = null;
      this.events.emit('scoreChanged', this.score, this.nextUnlock);
    });
    this.unlockWindow = bg;
  }
}
