// https://ttsmp3.com/ (British English / Emma)
// https://www.narakeet.com/app/text-to-audio/?projectId=ffcc8b04-caab-440a-aed0-66a5c5f105b8

export function playInstruction(key) {
  playAudio(key);
}

// Load multiple audio files
const players = new Tone.Players({
  calibrationStart: "/audio/instructions/calibration-start.mp3",
  calibrationStand: "/audio/instructions/calibration-stand.mp3",
  calibrationSquat: "/audio/instructions/calibration-squat.mp3",
  gameStart: "/audio/instructions/calibration-gameStart.mp3",
  gong: "/audio/instructions/gong_1.mp3",
  serveCountdown: "/audio/instructions/race-start-beeps-125125.mp3",
  applause: "/audio/instructions/applause-108368.mp3",
}).toDestination();

// Function to play a specific audio file
function playAudio(audioKey) {
  const player = players.player(audioKey);
  if (player) {
    player.start();
  } else {
    console.error("Audio key not found:", audioKey);
  }
}
