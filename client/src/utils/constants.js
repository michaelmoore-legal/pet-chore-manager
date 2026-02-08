export const AVATAR_OPTIONS = [
  { id: 'blue', color: '#0078d4' },
  { id: 'green', color: '#107c10' },
  { id: 'purple', color: '#8764b8' },
  { id: 'orange', color: '#ff8c00' },
  { id: 'red', color: '#d13438' },
  { id: 'teal', color: '#008272' },
  { id: 'pink', color: '#e3008c' },
  { id: 'navy', color: '#002050' },
];

export const getAvatarColor = (avatarId) => {
  const avatar = AVATAR_OPTIONS.find(a => a.id === avatarId);
  return avatar ? avatar.color : AVATAR_OPTIONS[0].color;
};

export const PET_TEMPLATES = {
  dog: {
    names: ['Buddy', 'Max', 'Charlie', 'Rocky', 'Bailey', 'Cooper', 'Duke', 'Buddy'],
    imageKeyword: 'dog'
  },
  cat: {
    names: ['Whiskers', 'Shadow', 'Luna', 'Mittens', 'Tiger', 'Smokey', 'Bella', 'Felix'],
    imageKeyword: 'cat'
  },
  parrot: {
    names: ['Polly', 'Squawk', 'Rio', 'Captain', 'Tweety', 'Kiwi', 'Bobo', 'Sunny'],
    imageKeyword: 'parrot'
  },
  rabbit: {
    names: ['Hopper', 'Bugs', 'Cottontail', 'Flopsy', 'Peter', 'Skippy', 'Clover', 'Nibbles'],
    imageKeyword: 'rabbit'
  },
  hamster: {
    names: ['Hammy', 'Whisper', 'Pepper', 'Peanut', 'Cheeks', 'Cocoa', 'Ginger', 'Rusty'],
    imageKeyword: 'hamster'
  },
  parakeet: {
    names: ['Chirpy', 'Melody', 'Bluebell', 'Pippin', 'Zephyr', 'Echo', 'Saffron', 'Azure'],
    imageKeyword: 'parakeet'
  },
  lizard: {
    names: ['Scales', 'Iggy', 'Spike', 'Reptile', 'Gecko', 'Slider', 'Scaley', 'Drako'],
    imageKeyword: 'lizard'
  },
  goldfish: {
    names: ['Bubbles', 'Goldie', 'Finn', 'Nemo', 'Flash', 'Sparkle', 'Splash', 'Swimmer'],
    imageKeyword: 'goldfish'
  }
};
