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
