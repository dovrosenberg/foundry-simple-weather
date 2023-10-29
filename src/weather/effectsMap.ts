type CoreDetails = {
  effect: string;
}

type FXColor = {
  value: string;
  apply: boolean;
}

enum FXOptionTypes {
  Snowstorm = 'snowstorm',
  Bubbles = 'bubbles',
  Clouds = 'clouds',
  Embers = 'embers',
  RainSimple = 'rainsimple',
  Stars = 'stars',
  Crows = 'crows',
  Bats = 'bats',
  Spiders = 'spiders',
  Fog = 'fog',
  RainTop = 'raintop',
  Leaves = 'leaves',
  Rain = 'rain',
  Snow = 'snow',
};

type FXOptions = {
  [FXOptionTypes.Snowstorm] : { scale: number; direction: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Bubbles] : { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Clouds] : { scale: number; direction: number; speed: number; lifetime: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Embers] : { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.RainSimple] : { scale: number; direction: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Stars] : { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Crows] : { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Bats] : { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Spiders] : { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Fog] : { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.RainTop] : { scale: number; direction: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Leaves] : { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Rain] : { scale: number; direction: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
  [FXOptionTypes.Snow] : { scale: number; direction: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor },
}

type FXDetail<T extends FXOptionTypes> = {
  type: T;
  options: FXOptions[T]
}
    
type EffectDetails = {
  core: CoreDetails,
  fxMaster: FXDetail<FXOptionTypes>[],
}

// weather options
export const availableEffects: Record<string, EffectDetails> = {
  MistyRain: { 
    core: {
      effect: 'rain'
    }, 
    fxMaster: [
      {
        type: FXOptionTypes.Rain,
        options: {
          scale: 3, 
          speed: 1, 
          lifetime: 1, 
          density: 1, 
          alpha: 1, 
          tint: { value: '0x000000', apply: true },
        },
      },
    ],
  },
  LightRain: { 
    core: {
      effect: 'rain'
    },
    fxMaster: {

    }
  },
  ModerateRain: { 
    core: {
      effect: 'rainStorm'
    }
  },
  HeavyRain: {
    core: {
      effect: 'rainStorm'
    }
  },
  LightFog: { 
    core: {
      effect: 'fog'
    }
  },
  ModerateFog: { 
    core: {
      effect: 'fog'
    }
  },
  HeavyFog: { 
    core: {
      effect: 'fog'
    }
  },
  LightSnow: { 
    core: {
      effect: 'snow'
    }
  },
  ModerateSnow: { 
    core: {
      effect: 'snow'
    }
  },
  HeavySnow: { 
    core: {
      effect: 'blizzard'
    }
  },
  WhiteoutSnow: { 
    core: {
      effect: 'blizzard'
    }
  },
  Hail: { 
    core: {
      effect: 'rainStorm'
    }
  },
  Sleet: { 
    core: {
      effect: 'rainStorm'
    }
  },
}
