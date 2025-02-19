import { id as moduleId } from '@module';

const playlistName = `${moduleId}-playlist`;

let playlist: Playlist | undefined;

function initSOunds
async function generatePlaylist(): Promise<void> {
  playlist = game.playlists?.contents.find((p) => p.getFlag(moduleId, 'playlist'));

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

  TODO - add all the sounds... then play should just play one
}

async function addSound(trackName: string, fileName: string) {
  if (_playlist) {
    await _playlist.createEmbeddedDocuments(
      'PlaylistSound',
      [{ name: trackName, path: fileName, repeat: true, volume: 0.8 }],
      {},
    );
  } else {
    throw new Error('Trying to add sound to playlist but no playlist present');
  }
}

export async function playSound(sound: Sounds) {
  if (!playlist) {
    await generatePlaylist();
  }

  if (playlist) {
  }
}