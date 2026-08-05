# Áudio da Missão Espaço

O jogo **já toca música e efeitos sonoros** sem nenhum arquivo aqui dentro: o
`AudioService` sintetiza todos os sons em tempo real com a Web Audio API
(osciladores + envelopes). Isso mantém o projeto leve, offline e sem dependências.

## Como substituir por arquivos de áudio reais

1. Coloque os arquivos nesta pasta (`public/assets/audio/`), preferencialmente em
   `.mp3` e/ou `.ogg` para compatibilidade máxima entre navegadores.
2. Abra `src/config/AudioManifest.ts` e registre a chave correspondente:

```ts
export const AUDIO_MANIFEST: AudioManifestEntry[] = [
  { key: 'collect', urls: ['assets/audio/collect.mp3'] },
  { key: 'music',   urls: ['assets/audio/music.mp3'], loop: true },
];
```

3. Pronto. Sempre que uma chave existir no cache do Phaser, o arquivo real é
   usado; caso contrário o som sintetizado entra como alternativa automática.

## Chaves reconhecidas

| Chave         | Quando toca                                    |
| ------------- | ---------------------------------------------- |
| `music`       | música de fundo em loop                        |
| `click`       | clique em botões                               |
| `hover`       | ponteiro sobre um botão                        |
| `collect`     | coleta de item (orbe, gema, estrela)           |
| `star`        | estrela bônus                                  |
| `correct`     | acerto                                         |
| `wrong`       | erro (som suave, nunca punitivo)               |
| `unlock`      | porta / conteúdo desbloqueado                  |
| `achievement` | conquista desbloqueada                         |
| `complete`    | fase concluída                                 |
| `whoosh`      | transições e cartas voando                     |
| `launch`      | lançamento do foguete                          |
| `type`        | máquina de escrever nos diálogos               |

## Sugestões de bancos de áudio gratuitos

- [freesound.org](https://freesound.org) (verifique a licença de cada som)
- [opengameart.org](https://opengameart.org)
- [pixabay.com/sound-effects](https://pixabay.com/sound-effects/)
- [incompetech.com](https://incompetech.com) (músicas Creative Commons)
