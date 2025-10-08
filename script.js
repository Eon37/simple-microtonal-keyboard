document.addEventListener('DOMContentLoaded', () => {
  const stepsFromA4toC2 = {
    12: -33, // 12-TET: A4 is 33 semitones above C2
    19: -52, // 19-TET: roughly same pitch distance but in 19 divisions
    31: -85  // 31-TET: same idea, finer divisions
  };
  assignFrequencies(12);

  const keyboard = document.getElementById('keyboard');
  const select = document.getElementById('tuning');

  select.addEventListener('change', e => {
    const tet = parseInt(e.target.value);
    keyboard.classList.remove('tet12', 'tet19', 'tet31');
    keyboard.classList.add('tet' + tet);
    
    // defer assignment so the browser applies the new classes first
    setTimeout(() => assignFrequencies(tet), 200);
  });

  function assignFrequencies(tet) {
    const whiteKeys = document.querySelectorAll('.white');
    const blackKeys = document.querySelectorAll('.black-slot');

    let whiteIndex = 0;
    let blackIndex = 0;

    let currentStep = stepsFromA4toC2[tet];
    let freq = getFrequencyFromA4(currentStep++, tet);

    let isWhite = true;

    while (whiteIndex < whiteKeys.length) {
      if (isWhite) {
        whiteKeys[whiteIndex++].dataset.freq = freq.toFixed(2);
        freq = getFrequencyFromA4(currentStep++, tet);
      } else if (blackIndex < blackKeys.length) {
        let key = blackKeys[blackIndex++];
        let parts = [
          ...Array.from(key.querySelectorAll('.slice.s1')).slice(0,1),
          ...Array.from(key.querySelectorAll('.slice.s2')).slice(0,1),
          ...Array.from(key.querySelectorAll('.slice.s3')).slice(0,1),
          ...Array.from(key.querySelectorAll('.slice.s4')).slice(0,1),
          ...Array.from(key.querySelectorAll('.slice.s0')).slice(0,1),
          ...Array.from(key.querySelectorAll('.slice.s01')).slice(0,1)
        ].filter(Boolean);
        
        parts.forEach(part => {
          const opacity = parseFloat(window.getComputedStyle(part).opacity);
          if (opacity >= 0.1) {
            part.dataset.freq = freq.toFixed(2);
            freq = getFrequencyFromA4(currentStep++, tet);
          }
        });
      }
      isWhite = !isWhite;
    }
  }

  function getFrequencyFromA4(stepsFromA4, tet) {
    return 440 * Math.pow(2, stepsFromA4 / tet);
  }

  const synth = new Tone.PolySynth(Tone.Synth).toDestination();
  
  document.querySelectorAll('.white, .slice.s1, .slice.s2, .slice.s3, .slice.s4, .slice.s0, .slice.s01').forEach(key => {
    key.addEventListener('mousedown', async () => {
      // Tone.js needs the AudioContext resumed by user interaction
      await Tone.start();

      const freq = parseFloat(key.dataset.freq);
      if (!isNaN(freq)) {
        synth.triggerAttackRelease(freq, '8n');
      }
    });
  });
});
