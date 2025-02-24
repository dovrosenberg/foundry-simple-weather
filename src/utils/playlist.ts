import { ModuleSettingKeys, ModuleSettings } from '@/settings/ModuleSettings';
import { id as moduleId } from '@module';
import { isClientGM } from './game';

// the values are used as the track names
export enum Sounds {
  None = 'None',
  Rain = 'Rain',
  HeavyRain = 'HeavyRain',
  RainThunder = 'RainThunder', 
  Thunder = 'Thunder', 
  Hail = 'Hail',
  Snow = 'Snow',
  Blizzard = 'Blizzard',
  Wind = 'Wind',
  HeavyWind = 'HeavyWind',
  Tornado = 'Tornado',
  WildFire = 'WildFire',
}

const defaultFiles: Record<Sounds, string> = {
  [Sounds.None]: '',
  [Sounds.Rain]: 'modules/simple-weather/sounds/rain.ogg',   // https://pixabay.com/sound-effects/calming-rain-257596/
  [Sounds.HeavyRain]: 'modules/simple-weather/sounds/heavyRain.ogg',   // https://pixabay.com/sound-effects/rain-sounds-210646/
  [Sounds.RainThunder]: 'modules/simple-weather/sounds/rainThunder.ogg',   // https://pixabay.com/sound-effects/rain-weather-lightning-thunder-151314/
  [Sounds.Thunder]: 'modules/simple-weather/sounds/thunder.ogg',   // https://pixabay.com/sound-effects/peals-of-thunder-191992/
  [Sounds.Hail]: 'modules/simple-weather/sounds/hail.ogg',    // https://pixabay.com/sound-effects/hail-74904/
  [Sounds.Snow]: 'modules/simple-weather/sounds/snow.ogg',        // https://pixabay.com/sound-effects/snow-on-umbrella-61498/
  [Sounds.Blizzard]: 'modules/simple-weather/sounds/blizzard.ogg',    // https://pixabay.com/sound-effects/wind-artic-cold-6195/
  [Sounds.Wind]: 'modules/simple-weather/sounds/wind.ogg',            // https://pixabay.com/sound-effects/wind-sound-301491/ - the lighter part at the beginning
  [Sounds.HeavyWind]: 'modules/simple-weather/sounds/heavyWind.ogg',   //https://pixabay.com/sound-effects/wind-128967/
  [Sounds.Tornado]: 'modules/simple-weather/sounds/tornado.ogg',      // https://pixabay.com/sound-effects/tornado-sound-better-quality-68141/
  [Sounds.WildFire]: 'modules/simple-weather/sounds/wildfire.ogg',    // https://pixabay.com/sound-effects/search/wildfire/
};

const playlistName = `Simple Weather`;

let playlist: Playlist | undefined;

async function initSounds(): Promise<void> {
  if (!isClientGM())
    return;

  await generatePlaylist();
  
  // populate the playlist
  if (playlist) {
    // delete old ones
    await playlist.deleteEmbeddedDocuments('PlaylistSound', playlist.sounds.reduce((acc, s) => { if (s?.id) acc.push(s.id); return acc; }, [] as string[]));

    for (const [key, value] of Object.entries(defaultFiles)) {
      if (value)
        await addSound(key as Sounds, value);
    }
  }
}

async function generatePlaylist(): Promise<void> {
  if (!isClientGM())
    return;

  playlist = game.playlists?.find((p) => p.getFlag(moduleId, 'playlist'));

  if (!playlist) {
    playlist = await Playlist.create({
      name: playlistName,

      permission: {
        default: 0,
      },
      flags: {},
      sounds: [],
      mode: 0,
      playing: false,
    });
    await playlist?.setFlag(moduleId, 'playlist', true);
  }

  playlist = playlist || undefined;
}

async function addSound(soundType: Sounds, fileName: string) {
  if (!isClientGM())
    return;

  if (playlist) {
    let volume = ModuleSettings.get(ModuleSettingKeys.soundVolume);

    // map to the other volume so the setting matches what is set
    volume = Math.pow(volume/100, 1/0.62);

    await playlist.createEmbeddedDocuments(
      'PlaylistSound',
      [{ 
        name: Sounds[soundType], 
        path: fileName, 
        repeat: true, 
        volume: volume,
        channel: 'environment',   //CONST.AUDIO_CHANNELS.environment,
      }],
      {},
    );
  } else {
    throw new Error('Trying to add sound to playlist but no playlist present');
  }
}

async function playSound(sound: Sounds): Promise<void>  {
  if (!isClientGM())
    return;

  if (!playlist) {
    await generatePlaylist();
  }

  if (!playlist)
    return;

  await stopSounds();

  const playlistSound = playlist.sounds.getName(Sounds[sound]);

  if (playlistSound)
    await playlist.playSound(playlistSound)
}

async function stopSounds(): Promise<void>  {
  await playlist.stopAll();    
}

export { 
  initSounds,
  playSound,
  stopSounds,
}