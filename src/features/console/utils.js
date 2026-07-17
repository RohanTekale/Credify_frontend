// src/features/console/utils.js
// Helpers to present the signed-in user in the console shell.

export const userDisplayName = (user) => {
  if (!user) return 'User';
  if (user.first_name) return `${user.first_name} ${user.last_name || ''}`.trim();
  if (user.name) return user.name;
  if (user.username) return user.username;
  if (user.email) return user.email.split('@')[0];
  return 'User';
};

export const userInitials = (user) => {
  const name = userDisplayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : name.slice(0, 2);
  return initials.toUpperCase();
};

export const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};
