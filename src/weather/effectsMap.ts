export type CoreDetails = {
  effect: string;
}

export type FXColor = {
  value: string;
  apply: boolean;
}

export enum FXOptionTypes {
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

// used to specify that this parameter will have a random value between the two specified
export type RandomRange = {
  start: number;
  end: number;
}

export type FXDetail = 
  { type: FXOptionTypes.Snowstorm; options: { scale: number; direction: RandomRange; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Bubbles; options: { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Clouds; options: { scale: number; direction: RandomRange; speed: number; lifetime: number; density: number, alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Embers; options: { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.RainSimple; options: { scale: number; direction: RandomRange; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Stars; options: { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Crows; options: { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Bats; options: { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Spiders; options: { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Fog; options: { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.RainTop; options: { scale: number; direction: RandomRange; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Leaves; options: { scale: number; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Rain; options: { scale: number; direction: RandomRange; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } |
  { type: FXOptionTypes.Snow; options: { scale: number; direction: RandomRange; speed: number; lifetime: number; density: number; alpha: number; tint: FXColor }, } 

    
export type EffectDetails = {
  core: CoreDetails | null,
  fxMaster: FXDetail[] | null,
}

// weather options
export const availableEffects: Record<string, EffectDetails> = {
  FleecyClouds: {
    core: null,
    fxMaster: [
      {
        type: FXOptionTypes.Clouds,
        options: {
          scale: 1, 
          direction: {start: -30, end: 30},
          speed: 0.4, 
          lifetime: 2, 
          density: 0.03, 
          alpha: 0.7, 
          tint: { value: '#000000', apply: false },
        },
      },
    ],
  },

  LightWind: {
    core: null,
    fxMaster: [
      {
        type: FXOptionTypes.RainSimple,
        options: {
          scale: 0.6, 
          direction: {start: -15, end: 15},
          speed: 0.1, 
          lifetime: 0.8, 
          density: 0.2, 
          alpha: 1, 
          tint: { value: '#1d1d1b', apply: true },
        },
      },
    ],
  },

  ModestWind: {
    core: null,
    fxMaster: [
      {
        type: FXOptionTypes.RainSimple,
        options: {
          scale: 0.6, 
          direction: {start: -15, end: 15},
          speed: 0.3, 
          lifetime: 0.8, 
          density: 0.2, 
          alpha: 1, 
          tint: { value: '#1d1d1b', apply: true },
        },
      },
    ],
  },

  MistyRain: { 
    core: {
      effect: 'rain'
    }, 
    fxMaster: [
      {
        type: FXOptionTypes.Rain,
        options: {
          scale: 3, 
          direction: {start: 0, end: 360},
          speed: 1, 
          lifetime: 1, 
          density: 1, 
          alpha: 1, 
          tint: { value: '#000000', apply: true },
        },
      },
    ],
  },
  LightRain: { 
    core: {
      effect: 'rain'
    },
    fxMaster: [
      {
        type: FXOptionTypes.Rain,
        options: {
          scale: 1, 
          direction: {start: 60, end: 120},
          speed: 0.1, 
          lifetime: 0.8, 
          density: 0.4, 
          alpha: 0.7, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
  },
  ModerateRain: { 
    core: {
      effect: 'rainStorm'
    },
    fxMaster: [
      {
        type: FXOptionTypes.Rain,
        options: {
          scale: 1, 
          direction: {start: 60, end: 120},
          speed: 0.1, 
          lifetime: 0.8, 
          density: 0.4, 
          alpha: 0.7, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ]
  },
  HeavyRain: {
    core: {
      effect: 'rainStorm'
    },
    fxMaster: null,
  },
  LightFog: { 
    core: {
      effect: 'fog'
    },
    fxMaster: null,
  },
  ModerateFog: { 
    core: {
      effect: 'fog'
    },
    fxMaster: null,
  },
  HeavyFog: { 
    core: {
      effect: 'fog'
    },
    fxMaster: null,
  },
  LightSnow: { 
    core: {
      effect: 'snow'
    },
    fxMaster: null,
  },
  ModerateSnow: { 
    core: {
      effect: 'snow'
    },
    fxMaster: null,
  },
  HeavySnow: { 
    core: {
      effect: 'blizzard'
    },
    fxMaster: null,
  },
  WhiteoutSnow: { 
    core: {
      effect: 'blizzard'
    },
    fxMaster: null,
  },
  Hail: { 
    core: {
      effect: 'rainStorm'
    },
    fxMaster: null,
  },
  Sleet: { 
    core: {
      effect: 'rainStorm'
    },
    fxMaster: null,
  },
}
