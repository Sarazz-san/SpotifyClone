import type {Playlist} from '../models/Playlist';
import type {Track} from '../models/Track';

const coverAbstract = require('../assets/images/cover_abstract_neon.png');
const coverSynthwave = require('../assets/images/cover_synthwave.png');
const coverDaylist = require('../assets/images/cover_daylist.png');
const coverPodcast = require('../assets/images/cover_daily_podcast.png');
const logo = require('../assets/images/cover_abstract_neon.png');

export const tracks: Track[] = [
  {
    id: 'quantum-shift',
    title: 'Quantum Shift',
    artist: 'Neo Pulse',
    album: 'Aurora Echo',
    durationMs: 214000,
    cover: coverAbstract,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'midnight-circuit',
    title: 'Midnight Circuit',
    artist: 'Luna Sol',
    album: 'Cyberpunk Focus',
    durationMs: 189000,
    cover: coverSynthwave,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'daily-pulse',
    title: 'Daily Pulse',
    artist: 'Daily Insights',
    album: 'Morning Brief',
    durationMs: 132000,
    cover: coverPodcast,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'late-night-vibes',
    title: 'Late Night Vibes',
    artist: 'Melodic Lab',
    album: 'Your Daylist',
    durationMs: 241000,
    cover: coverDaylist,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
];

export const playlists: Playlist[] = [
  {
    id: 'liked',
    title: 'Liked Songs',
    subtitle: 'Playlist - 124 songs',
    cover: logo,
    trackIds: ['quantum-shift', 'midnight-circuit'],
    category: 'playlist',
    pinned: true,
  },
  {
    id: 'daylist',
    title: 'Melodic, Pulsing, Late Night Vibes',
    subtitle: 'Your daylist updates with your mood',
    cover: coverDaylist,
    trackIds: ['late-night-vibes', 'quantum-shift'],
    category: 'playlist',
    pinned: true,
  },
  {
    id: 'aurora',
    title: 'Aurora Echo',
    subtitle: 'Album - Neo Pulse',
    cover: coverAbstract,
    trackIds: ['quantum-shift'],
    category: 'album',
  },
  {
    id: 'cyberpunk',
    title: 'Cyberpunk Focus',
    subtitle: 'Playlist - Dark synth and deep focus',
    cover: coverSynthwave,
    trackIds: ['midnight-circuit'],
    category: 'playlist',
  },
  {
    id: 'daily-insights',
    title: 'Daily Insights',
    subtitle: 'Podcast - Daily news and culture',
    cover: coverPodcast,
    trackIds: ['daily-pulse'],
    category: 'podcast',
  },
];

export const categories = [
  'Music',
  'Podcasts',
  'Live Events',
  'Made For You',
  'New Releases',
  'Hip-Hop',
  'Electronic',
  'Focus',
];
