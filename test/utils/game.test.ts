import { isClientGM, localize } from '@/utils/game';
import { QuenchBatchContext } from '@ethaks/fvtt-quench'

export const registerGameTests = () => {
  quench.registerBatch(
    'simple-weather.utils.game',
    (context: QuenchBatchContext) => {
      const { describe, it, expect } = context;

      describe('isClientGM', () => {
        it('return proper value (run as different user to test other case)', () => {
          expect(isClientGM()).to.equal(game.user?.isGM || false);
        });
      });

      describe('localize', () => {
        it('adds "sweath."', () => {
          expect(localize('abc')).to.equal('sweath.abc');
        });
      });
    }
  )
};



