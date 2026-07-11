const ROOM_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createRoomCode(existingCodes) {
  let code = '';

  do {
    code = Array.from({ length: 5 }, () => (
      ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)]
    )).join('');
  } while (existingCodes.has(code));

  return code;
}
