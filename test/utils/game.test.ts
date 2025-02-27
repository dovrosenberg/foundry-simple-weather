import { getGame, isClientGM, localize } from '@/utils/game';
import { QuenchBatchContext } from '@ethaks/fvtt-quench'

export const registerGameTests = () => {
  quench.registerBatch(
    'simple-weather.utils.game',
    (context: QuenchBatchContext) => {
      const { describe, it, expect } = context;

      describe('getGame', () => {
        it('return the game if present', () => {
          expect(getGame()).to.equal(game);
        });
      
        // can't really test this...
        // it('return throw if game is not present', () => {
        //   expect(getGame()).toThrow();
        // });
      });
      
      describe('isClientGM', () => {
        it('return proper value (run as different user to test other case)', () => {
          expect(isClientGM()).to.equal(getGame()?.user?.isGM || false);
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



