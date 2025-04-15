// Файл: main.js
// ОТВЕЧАЕТ ЗА: Запуск игры и конфиг Phaser
// КОНТАКТЫ С ДРУГИМИ: Импортирует сцены (GameScene, UIScene, MiniGameScene), config.js
// ОСНОВНОЕ: Создаёт Phaser.Game, настраивает параметры, добавляет сцены

import GameScene from './scenes/GameScene.js';
import MiniGameScene from './scenes/MiniGameScene.js';
import UIScene from './scenes/UIScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './utils/config.js';

const config = {
  type: Phaser.CANVAS,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#222',
  scene: [GameScene, MiniGameScene, UIScene],
  audio: { disableWebAudio: true },
  render: { pixelArt: false, roundPixels: true, antialias: true },
};

window.game = new Phaser.Game(config);
