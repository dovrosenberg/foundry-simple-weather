import { id as moduleId } from '@module';

// the values are used as the track names
export enum Sounds {
  None = 'None',
  Rain = 'Rain',
  HeavyRain = 'HeavyRain',
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
  [Sounds.Rain]: 'modules/simple-weather/sounds/rain.mp3',
  [Sounds.HeavyRain]: 'modules/simple-weather/sounds/heavyrain.mp3',
  [Sounds.Thunder]: 'modules/simple-weather/sounds/thunder.mp3',
  [Sounds.Hail]: 'modules/simple-weather/sounds/hail.mp3',
  [Sounds.Snow]: 'modules/simple-weather/sounds/snow.mp3',
  [Sounds.Blizzard]: 'modules/simple-weather/sounds/blizzard.mp3',
  [Sounds.Wind]: 'modules/simple-weather/sounds/wind.mp3',
  [Sounds.HeavyWind]: 'modules/simple-weather/sounds/heavywind.mp3',
  [Sounds.Tornado]: 'modules/simple-weather/sounds/tornado.mp3',
  [Sounds.WildFire]: 'modules/simple-weather/sounds/wildfire.mp3',
};

const playlistName = `${moduleId}-playlist`;

let playlist: Playlist | undefined;

async function initSounds(): Promise<void> {
  await generatePlaylist();
  
  // populate the playlist
  if (playlist) {
    for (const [key, value] of Object.entries(defaultFiles)) {
      await addSound(key as Sounds, value);
    }
  }
}

async function generatePlaylist(): Promise<void> {
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
  if (playlist) {
    await playlist.createEmbeddedDocuments(
      'PlaylistSound',
      [{ name: Sounds[soundType], path: fileName, repeat: true, volume: 0.8 }],
      {},
    );
  } else {
    throw new Error('Trying to add sound to playlist but no playlist present');
  }
}

async function playSound(sound: Sounds): Promise<void>  {
  if (!playlist) {
    await generatePlaylist();
  }

  await stopSounds();

  if (playlist) {
    const playlistSound = playlist.sounds.getName(Sounds[sound]);

    if (playlistSound)
      await playlist.playSound(playlistSound)
  }
}

async function stopSounds(): Promise<void> {
  if (playlist) {
    await playlist.stopAll();    
  }
}

export { 
  initSounds,
  playSound,
  stopSounds,
}