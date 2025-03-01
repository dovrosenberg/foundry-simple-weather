import { Sounds } from '@/utils/playlist';
import { EffectDetails, FXMParticleTypes, FXMStyleTypes, joinEffects } from '@/weather/effectsMap';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

// create two effects with known properties
const effect1: EffectDetails = {
  core: { effect: 'rain' },
  fxMaster: null,
  sound: Sounds.Rain,
}
const effect2: EffectDetails = {
  core: { effect: 'snow' },
  fxMaster: null,
  sound: Sounds.Snow,
}
const effect3: EffectDetails = {
  core: null,
  fxMaster: [{
    style: FXMStyleTypes.Particle,
    type: FXMParticleTypes.Snowstorm,
    options: {
      scale: 1.0, 
      direction: {start: 60, end: 90 },
      speed: 1.0, 
      lifetime: 1.0, 
      density: 0.9, 
      alpha: 1.0, 
      tint: { value: '#ffffff', apply: false },
    },
  }],
  sound: Sounds.Rain,
}

export const registerEffectsMapTests = () => {
  quench.registerBatch(
    'simple-weather.weather.effectsMap',
    (context: QuenchBatchContext) => {
      const { describe, it, expect } = context;

      describe('joinEffects', () => {
        it('should blend core and fx', () => {

          expect(joinEffects(effect1, effect3)).to.deep.equal({
            core: effect1.core,
            fxMaster: effect3.fxMaster,
            sound: effect1.sound,
          });
        });

        it('should use 1st effect values for solo values', () => {
          expect(joinEffects(effect1, effect2)).to.deep.equal({
            core: effect1.core,
            fxMaster: null,
            sound: effect1.sound,
          });
          expect(joinEffects(effect2, effect1)).to.deep.equal({
            core: effect2.core,
            fxMaster: null,
            sound: effect2.sound,
          });
        });

        it('should handle null core', () => {
          expect(joinEffects(effect3, effect3).core).to.deep.equal({
            effect: ''
          });
        });

        it('should leave parameters unchanged', () => {
          joinEffects(effect1, effect3);

          expect(effect1).to.deep.equal({
            core: { effect: 'rain' },
            fxMaster: null,
            sound: Sounds.Rain,
          });
          expect(effect3).to.deep.equal({
            core: null,
            fxMaster: [{
              style: FXMStyleTypes.Particle,
              type: FXMParticleTypes.Snowstorm,
              options: {
                scale: 1.0, 
                direction: {start: 60, end: 90 },
                speed: 1.0, 
                lifetime: 1.0, 
                density: 0.9, 
                alpha: 1.0, 
                tint: { value: '#ffffff', apply: false },
              },
            }],
            sound: Sounds.Rain,
          });
        });
      });
    }
  )
};
