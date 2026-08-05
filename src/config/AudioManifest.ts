/**
 * Manifesto de áudio.
 *
 * O jogo funciona 100% sem arquivos: o `AudioService` sintetiza cada som com a
 * Web Audio API. Basta registrar uma entrada aqui (e colocar o arquivo em
 * `public/assets/audio/`) para que o arquivo real substitua o som sintetizado.
 *
 * Veja `public/assets/audio/README.md` para a lista de chaves reconhecidas.
 */

export interface AudioManifestEntry {
  key: string;
  /** Uma ou mais URLs (formatos alternativos, ex.: .ogg e .mp3). */
  urls: string[];
}

export const AUDIO_MANIFEST: AudioManifestEntry[] = [
  // Exemplo (descomente após adicionar o arquivo):
  // { key: 'music', urls: ['assets/audio/music.mp3'] },
];
