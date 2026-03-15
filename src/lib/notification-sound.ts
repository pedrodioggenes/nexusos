/**
 * Simple notification sound generator using Web Audio API
 * Generates different tones for different alert levels
 */

type SoundType = 'critical' | 'warning' | 'info';

class NotificationSoundPlayer {
  private audioContext: AudioContext | null = null;
  private enabled: boolean = true;

  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }
    return this.audioContext;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Play a notification sound based on type
   */
  async play(type: SoundType): Promise<void> {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      
      // Resume context if suspended (required by browsers)
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      switch (type) {
        case 'critical':
          await this.playCriticalSound(ctx);
          break;
        case 'warning':
          await this.playWarningSound(ctx);
          break;
        case 'info':
          await this.playInfoSound(ctx);
          break;
      }
    } catch (error) {
      console.warn('[Sound] Failed to play notification sound:', error);
    }
  }

  /**
   * Critical: Urgent double beep (high pitch)
   */
  private async playCriticalSound(ctx: AudioContext): Promise<void> {
    // First beep
    this.playTone(ctx, 880, 0.15, 0.3); // A5
    // Second beep after short pause
    setTimeout(() => {
      this.playTone(ctx, 880, 0.15, 0.3);
    }, 200);
  }

  /**
   * Warning: Single medium tone
   */
  private async playWarningSound(ctx: AudioContext): Promise<void> {
    this.playTone(ctx, 587.33, 0.2, 0.2); // D5
  }

  /**
   * Info: Soft low ping
   */
  private async playInfoSound(ctx: AudioContext): Promise<void> {
    this.playTone(ctx, 440, 0.1, 0.15); // A4
  }

  /**
   * Generate and play a simple sine wave tone
   */
  private playTone(
    ctx: AudioContext,
    frequency: number,
    duration: number,
    volume: number
  ): void {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    // Envelope for smoother sound
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Attack
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, now + duration * 0.5); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    oscillator.start(now);
    oscillator.stop(now + duration);
  }
}

// Singleton instance
export const notificationSound = new NotificationSoundPlayer();
