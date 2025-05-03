import { localize } from '@/utils/game';
import { biomeSelections, initializeLocalizedText } from '@/weather/climateData';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';

export const registerClimateDataTests = () => {
  quench.registerBatch(
    'simple-weather.weather.climateData',
    (context: QuenchBatchContext) => {
      const { describe, it, expect } = context;

      describe('initializeLocalizedText', () => {
        it('should load the strings', () => {
          initializeLocalizedText();
      
          expect(biomeSelections.length).to.equal(10);
          expect(biomeSelections[0]).to.deep.equal({
            value: '', text: localize('options.biome.useClimateHumidity') 
          });
        });
      });
    }
  )
};
