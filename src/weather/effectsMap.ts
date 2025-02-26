import { Sounds } from '@/utils/playlist';

export type CoreDetails = {
  effect: string;
}

export type FXMColor = {
  value: string;
  apply: boolean;
}

export enum FXMStyleTypes {
  Filter,
  Particle,
}

export enum FXMParticleTypes {
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

export enum FXMFilterTypes {
  Lightning = 'lightning',
  Bloom = 'bloom',
}

// used to specify that this parameter will have a random value between the two specified
export type RandomRange = {
  start: number;
  end: number;
}

export interface FXMParticleOptions {
  scale: number; 
  direction?: RandomRange | number | undefined; 
  speed: number; 
  lifetime: number; 
  density: number; 
  alpha: number; 
  tint: FXMColor 
}
export interface FXMFilterOptions {
  blur?: number | undefined; 
  bloomScale?: number | undefined; 
  threshold?: number | undefined;
  frequency?: number | undefined; 
  spark_duration?: number | undefined; 
  brightness?: number | undefined;
}

export type FXDetailType =
| {
  style: FXMStyleTypes.Filter;
  type: FXMFilterTypes;
  options: FXMFilterOptions;
}
| {
  style: FXMStyleTypes.Particle;
  type: FXMParticleTypes;
  options: FXMParticleOptions;
}  

    
export type EffectDetails = {
  core: CoreDetails | null,
  fxMaster: FXDetailType[] | null,
  sound: Sounds
}

// weather options
export const availableEffects: Record<string, EffectDetails> = {
  LightClouds: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Clouds,
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
    sound: Sounds.None
  },

  ModerateClouds: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Clouds,
        options: {
          scale: 1, 
          direction: {start: -30, end: 30},
          speed: 0.2, 
          lifetime: 2.6, 
          density: 0.1, 
          alpha: 0.7, 
          tint: { value: '#ffffff', apply: true },
        },
      },
    ],
    sound: Sounds.None,
  },

  HeavyClouds: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Clouds,
        options: {
          scale: 1, 
          direction: {start: -30, end: 30},
          speed: 0.1, 
          lifetime: 2.6, 
          density: 0.3, 
          alpha: 0.5, 
          tint: { value: '#ffffff', apply: true },
        },
      },
    ],
    sound: Sounds.None,
  },

  StormClouds: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Clouds,
        options: {
          scale: 1, 
          direction: {start: -30, end: 30},
          speed: 0.1, 
          lifetime: 2.6, 
          density: 0.6, 
          alpha: 1.0, 
          tint: { value: '#776e6e', apply: true },
        },
      },
    ],
    sound: Sounds.None,
  },

  Overcast: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Fog,
        options: {
          scale: 1.0, 
          speed: 0.3, 
          lifetime: 1.0,
          density: 0.08, 
          alpha: 1.0,
          tint: { value: '#c2bdbd', apply: true },
        },
      },
    ],
    sound: Sounds.None,
  },

  // drifting around, not linear
  BlusterWind: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Leaves,
        options: {
          scale: 0.7, 
          speed: 2.8, 
          lifetime: 1, 
          density: 0.1, 
          alpha: 0.8, 
          tint: { value: '#4F4040', apply: true },
        },
      },
    ],
    sound: Sounds.Wind,
  },

  // snow in each direction
  BlusterSnow: {
    core: { effect: 'snow' },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snow,
        options: {
          scale: 1.0, 
          direction: {start: -30, end: 30},
          speed: 2.8, 
          lifetime: 1.0, 
          density: 0.1, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snow,
        options: {
          scale: 1.0, 
          direction: {start: 60, end: 120},
          speed: 2.8, 
          lifetime: 1.0, 
          density: 0.1, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snow,
        options: {
          scale: 1.0, 
          direction: {start:150, end: 210},
          speed: 2.8, 
          lifetime: 1.0, 
          density: 0.1, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snow,
        options: {
          scale: 1.0, 
          direction: {start: 240, end: 300},
          speed: 2.8, 
          lifetime: 1.0, 
          density: 0.1, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Snow,
  },

  LightWind: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snow,
        options: {
          scale: 0.6, 
          direction: {start: -15, end: 15},
          speed: 1.0, 
          lifetime: 1.0, 
          density: 0.1, 
          alpha: 1.0, 
          tint: { value: '#1d1d1b', apply: true },
        },
      },
    ],
    sound: Sounds.Wind,
  },

  ModerateWind: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snow,
        options: {
          scale: 0.6, 
          direction: {start: -15, end: 15},
          speed: 2.0, 
          lifetime: 1.0, 
          density: 0.1, 
          alpha: 1.0, 
          tint: { value: '#1d1d1b', apply: true },
        },
      },
    ],
    sound: Sounds.Wind,
  },

  HeavyWind: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snow,
        options: {
          scale: 0.6, 
          direction: {start: -15, end: 15},
          speed: 3.0, 
          lifetime: 1.0, 
          density: 0.2, 
          alpha: 1.0, 
          tint: { value: '#1d1d1b', apply: true },
        },
      },
    ],
    sound: Sounds.HeavyWind,
  },

  BlusterRain: { 
    core: {
      effect: 'rain'
    }, 
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Rain,
        options: {
          scale: 0.4, 
          direction: {start: -30, end: 30},
          speed: 0.1, 
          lifetime: 0.8, 
          density: 0.1, 
          alpha: 0.7, 
          tint: { value: '#000000', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Rain,
        options: {
          scale: 0.4, 
          direction: {start: 60, end: 120},
          speed: 0.1, 
          lifetime: 0.8, 
          density: 0.1, 
          alpha: 0.7, 
          tint: { value: '#000000', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Rain,
        options: {
          scale: 0.4, 
          direction: {start: 150, end: 210 },
          speed: 0.1, 
          lifetime: 0.8, 
          density: 0.1, 
          alpha: 0.7, 
          tint: { value: '#000000', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Rain,
        options: {
          scale: 0.4, 
          direction: {start: 240, end: 300 },
          speed: 0.1, 
          lifetime: 0.8, 
          density: 0.1, 
          alpha: 0.7, 
          tint: { value: '#000000', apply: false },
        },
      },
    ],
    sound: Sounds.Rain,
  },
  LightRain: { 
    core: {
      effect: 'rain'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Rain,
        options: {
          scale: 1, 
          direction: {start: 60, end: 120},
          speed: 0.1, 
          lifetime: 0.8, 
          density: 0.1, 
          alpha: 0.7, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Rain,
  },
  ModerateRain: { 
    core: {
      effect: 'rainStorm'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Rain,
        options: {
          scale: 1, 
          direction: {start: 60, end: 120},
          speed: 0.5, 
          lifetime: 0.8, 
          density: 1.0, 
          alpha: 0.7, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Rain,
  },
  HeavyRain: {
    core: {
      effect: 'rainStorm'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Rain,
        options: {
          scale: 1.3,
          direction: {start: 60, end: 120},
          speed: 0.5, 
          lifetime: 0.8, 
          density: 1.7, 
          alpha: 0.7, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.HeavyRain,
  },
  LightFog: { 
    core: {
      effect: 'fog'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Fog,
        options: {
          scale: 1.0, 
          speed: 0.5, 
          lifetime: 1.0,
          density: 0.05, 
          alpha: 0.4,
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Rain,
  },
  ModerateFog: { 
    core: {
      effect: 'fog'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Fog,
        options: {
          scale: 1.0, 
          speed: 0.5, 
          lifetime: 1.0,
          density: 0.08, 
          alpha: 0.4,
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Rain,
  },
  HeavyFog: { 
    core: {
      effect: 'fog'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Fog,
        options: {
          scale: 1.0, 
          speed: 0.5, 
          lifetime: 1.0,
          density: 0.12, 
          alpha: 0.4,
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Rain,
  },
  RollingFog: { 
    core: {
      effect: 'fog'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Fog,
        options: {
          scale: 1.0, 
          speed: 3.5, 
          lifetime: 1.0,
          density: 0.08, 
          alpha: 0.4,
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],    
    sound: Sounds.Rain,
  },
  Lightning: {
    core: null,
    fxMaster: [
      {
        style: FXMStyleTypes.Filter,
        type: FXMFilterTypes.Lightning,
        options: {
          frequency: 500,
          spark_duration: 300,
          brightness: 1.3,
        },
      },
    ],
    sound: Sounds.Thunder,
  },

  Wildfire: {
    core: null,
    fxMaster: [
      // use lightning to make a flicker
      {
        style: FXMStyleTypes.Filter,
        type: FXMFilterTypes.Lightning,
        options: {
          frequency: 100,
          spark_duration: 2000,
          brightness: 1.1,
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Embers,
        options: {
          scale: 1.3, 
          speed: 1.0, 
          lifetime: 1.0, 
          density: 0.9, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.WildFire,
  },

  LightSnow: { 
    core: {
      effect: 'snow'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snow,
        options: {
          scale: 1.0, 
          direction: {start: 60, end: 120},
          speed: 1.0, 
          lifetime: 1.0, 
          density: 0.1, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Snow,
  },
  ModerateSnow: { 
    core: {
      effect: 'snow'
    },
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snowstorm,
        options: {
          scale: 1.0, 
          direction: {start: 60, end: 120},
          speed: 1.0, 
          lifetime: 1.0, 
          density: 0.9, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Snow,
  },
  HeavySnow: { 
    core: {
      effect: 'blizzard'
    },
    fxMaster: [
      // two different snow effects
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snowstorm,
        options: {
          scale: 1, 
          direction: {start: 60, end: 90},
          speed: 1.9, 
          lifetime: 1.0, 
          density: 0.9, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snowstorm,
        options: {
          scale: 1, 
          direction: {start: 90, end: 120},
          speed: 1.5, 
          lifetime: 1.0, 
          density: 0.9, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Blizzard,
  },
  WhiteoutSnow: { 
    core: {
      effect: 'blizzard'
    },
    // two different snow effects plus fog
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snowstorm,
        options: {
          scale: 1, 
          direction: {start: 60, end: 90},
          speed: 1.9, 
          lifetime: 1.0, 
          density: 0.9, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snowstorm,
        options: {
          scale: 1, 
          direction: {start: 90, end: 120},
          speed: 1.5, 
          lifetime: 1.0, 
          density: 0.9, 
          alpha: 1.0, 
          tint: { value: '#ffffff', apply: false },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Fog,
        options: {
          scale: 1.0, 
          speed: 1.0, 
          lifetime: 1.0, 
          density: 0.15, 
          alpha: 0.9, 
          tint: { value: '#ffffff', apply: false },
        },
      },
    ],
    sound: Sounds.Blizzard,
  },
  Hail: { 
    core: {
      effect: 'rainStorm'
    },
    fxMaster: [{
      style: FXMStyleTypes.Particle,
      type: FXMParticleTypes.RainSimple,
      options: {
        scale: 4.0, 
        direction: {start: 60, end: 120},
        speed: 0.2, 
        lifetime: 0.2, 
        density: 0.05, 
        alpha: 1.0, 
        tint: { value: '#ffffff', apply: false },
      },
    }],
    sound: Sounds.Hail,
  },
  Sleet: { 
    core: {
      effect: 'rainStorm'
    },
    // rain plus snow
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Rain,
        options: {
          scale: 1, 
          direction: {start: 60, end: 90 },  // tighter range because we need snow direction to be similar
          speed: 0.5, 
          lifetime: 0.8, 
          density: 1.0, 
          alpha: 0.7, 
          tint: { value: '#ffffff', apply: false },
        },
      },
      {
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
      },
    ],
    sound: Sounds.Hail,
  },
  // like a colored blizzard, with smaller particles
  DustStorm: { 
    core: {
      effect: ''
    },  
    fxMaster: [
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snowstorm,
        options: {
          scale: 0.5, 
          direction: {start: -30, end: 30},
          speed: 1.9, 
          lifetime: 1.0, 
          density: 0.9, 
          alpha: 1.0, 
          tint: { value: '#8f8c61', apply: true },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Snowstorm,
        options: {
          scale: 0.5, 
          direction: {start: 150, end: 210},
          speed: 1.5, 
          lifetime: 1.0, 
          density: 0.9, 
          alpha: 1.0, 
          tint: { value: '#8f8c61', apply: true },
        },
      },
      {
        style: FXMStyleTypes.Particle,
        type: FXMParticleTypes.Fog,
        options: {
          scale: 1.0, 
          speed: 1.0, 
          lifetime: 1.0, 
          density: 0.15, 
          alpha: 0.9, 
          tint: { value: '#8f8c61', apply: true },
        },
      },
    ],
    sound: Sounds.HeavyWind,
  },
}

// combine two effects into one
// for fx like core where there can only be one option, effect1 is used if present
export const joinEffects = function(effect1: EffectDetails, effect2: EffectDetails): EffectDetails {
  const output = foundry.utils.deepClone({
    ...effect1
  });

  if (!output.core)
    output.core = { effect: '' };
  if (!output.fxMaster)
    output.fxMaster = [];

  output.core.effect = output.core?.effect || effect2.core?.effect || '';
  output.fxMaster = output.fxMaster.concat(effect2.fxMaster || []);

  return output;
}
