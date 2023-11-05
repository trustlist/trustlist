export const getRandomEmoji = () => {
  const emojis = ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '☠️', '😎', '🧑🏽‍🚀', '🤑', '👻', '👽', '🐉', '🧛🏽'];
  return emojis[Math.floor(Math.random() * emojis.length)];
}
