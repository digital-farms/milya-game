// Файл: config.js
// ОТВЕЧАЕТ ЗА: Конфигурацию игры (персонажи, предметы, звуки)
// КОНТАКТЫ С ДРУГИМИ: Используется всеми сценами (GameScene, UIScene, MiniGameScene)
// ОСНОВНОЕ: Описывает массивы CHARACTERS и ITEMS, экспортирует настройки для всей игры

export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 600;

export const CHARACTERS = [
  {
    key: 'character1',
    name: 'Скай',
    image: 'assets/characters/character1.png',
    unlockScore: 0
  },
  {
    key: 'character2',
    name: 'Маршалл',
    image: 'assets/characters/character2.png',
    unlockScore: 5 // Второй персонаж — 5 очков
  },
  {
    key: 'character3',
    name: 'Гончик',
    image: 'assets/characters/character3.png',
    unlockScore: 11 // Третий персонаж — ещё +6 очков
  }
];

export const ITEMS = [
  { key: 'item1', image: 'assets/items/item1.png' },
  { key: 'item2', image: 'assets/items/item2.png' },
  { key: 'item3', image: 'assets/items/item3.png' },
  { key: 'backpack', image: 'assets/items/backpack-for-minigame.png' }, // рюкзак
];

export const BACKGROUND = 'assets/background.png';
export const BACKGROUND_MINIGAME = 'assets/background-minigame.png';
export const CLICK_SOUND = 'assets/sounds/click.mp3';
export const BACKPACK_SOUND = 'assets/sounds/click-backpack.mp3';
