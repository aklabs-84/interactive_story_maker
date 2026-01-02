import { useEffect, useRef, useCallback } from 'react';
import * as Tone from 'tone';
import { useConfigStore } from '../store/useConfigStore';

export const useSound = () => {
  const soundEnabled = useConfigStore((state) => state.soundEnabled);
  const synths = useRef({});
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    try {
      synths.current.typing = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.001, decay: 0.01, sustain: 0, release: 0.01 },
        volume: -15
      }).toDestination();

      synths.current.button = new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 },
        volume: -12
      }).toDestination();

      synths.current.ending = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.1, decay: 0.3, sustain: 0.5, release: 1 },
        volume: -10
      }).toDestination();

      synths.current.transition = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.01, decay: 0.1, sustain: 0, release: 0.1 },
        volume: -18
      }).toDestination();

      initialized.current = true;
    } catch (error) {
      console.error('Sound init error:', error);
    }

    return () => {
      Object.values(synths.current).forEach(synth => synth.dispose());
    };
  }, []);

  const playTyping = useCallback(async () => {
    if (!soundEnabled || !initialized.current) return;
    try {
      await Tone.start();
      const notes = ['C5', 'C#5', 'D5', 'D#5'];
      synths.current.typing.triggerAttackRelease(notes[Math.floor(Math.random() * notes.length)], '32n');
    } catch (e) {}
  }, [soundEnabled]);

  const playButtonClick = useCallback(async () => {
    if (!soundEnabled || !initialized.current) return;
    try {
      await Tone.start();
      synths.current.button.triggerAttackRelease('C3', '16n');
    } catch (e) {}
  }, [soundEnabled]);

  const playEnding = useCallback(async (type = 'happy') => {
    if (!soundEnabled || !initialized.current) return;
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
        synths.current.ending.triggerAttackRelease(note, '4n', now + i * 0.2);
      });
    } catch (e) {}
  }, [soundEnabled]);

  const playTransition = useCallback(async () => {
    if (!soundEnabled || !initialized.current) return;
    try {
      await Tone.start();
      synths.current.transition.triggerAttackRelease('A4', '8n');
    } catch (e) {}
  }, [soundEnabled]);

  return {
    playTyping,
    playButtonClick,
    playEnding,
    playTransition
  };
};
