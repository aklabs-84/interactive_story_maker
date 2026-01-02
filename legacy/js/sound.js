// ==========================================
// 사운드 모듈
// ==========================================

const SoundModule = {
  initialized: false,
  enabled: true,
  synths: {},

  init() {
    if (this.initialized || typeof Tone === 'undefined') return;
    
    try {
      this.synths.typing = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.01 },
        volume: -15
      }).toDestination();

      this.synths.button = new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
        volume: -12
      }).toDestination();

      this.synths.ending = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1 },
        volume: -10
      }).toDestination();

      this.synths.transition = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        volume: -18
      }).toDestination();

      this.initialized = true;
      
      // 저장된 설정 불러오기
      const saved = localStorage.getItem(STORAGE_KEYS.SOUND);
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch (error) {
      console.error('Sound init error:', error);
    }
  },

  async playTyping() {
    if (!this.enabled || !this.initialized) return;
    try {
      await Tone.start();
      const notes = ['C5', 'C#5', 'D5', 'D#5'];
      this.synths.typing.triggerAttackRelease(notes[Math.floor(Math.random() * notes.length)], '32n');
    } catch (e) {}
  },

  async playButtonClick() {
    if (!this.enabled || !this.initialized) return;
    try {
      await Tone.start();
      this.synths.button.triggerAttackRelease('C3', '16n');
    } catch (e) {}
  },

  async playEnding(type = 'happy') {
    if (!this.enabled || !this.initialized) return;
    try {
      await Tone.start();
      const melodies = {
        happy: ['C4', 'E4', 'G4', 'C5'],
        sad: ['A3', 'C4', 'E4', 'A4'],
        neutral: ['C4', 'F4', 'A4', 'C5']
      };
      const melody = melodies[type] || melodies.neutral;
      const now = Tone.now();
      melody.forEach((note, i) => {
        this.synths.ending.triggerAttackRelease(note, '4n', now + i * 0.2);
      });
    } catch (e) {}
  },

  async playTransition() {
    if (!this.enabled || !this.initialized) return;
    try {
      await Tone.start();
      this.synths.transition.triggerAttackRelease('A4', '8n');
    } catch (e) {}
  },

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(STORAGE_KEYS.SOUND, this.enabled);
    this.updateIcons();
    showToast(this.enabled ? '🔊 사운드 켜짐' : '🔇 사운드 꺼짐');
  },

  updateIcons() {
    document.querySelectorAll('.sound-icon').forEach(icon => {
      icon.textContent = this.enabled ? '🔊' : '🔇';
    });
  }
};