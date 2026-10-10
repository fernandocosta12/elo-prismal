# Cenários de batalha

Os fundos são desenhados por código (SVG) e salvos como WebP em `bg86/`.

    OUT=/tmp/bg node tools/fundos/render.mjs          # gera os PNG
    python3 -c "..."                                   # converte para bg86/<nome>.webp (qualidade 84)

- `lib.mjs`: perspectiva do chão (horizonte, escala por profundidade), céu, nuvens, montanhas, árvores, pedras, grama.
- `props.mjs`: objetos maiores e detalhes por bioma.
- `scenes.mjs`: um cenário por região (vale, bosque, charco, picos, costa, deserto, pantano, cume, recife, coracao, abismo, estelar) + arena e torre.

Regra de composição: o horizonte fica em ~45% da altura e a faixa onde as unidades ficam (x 30–690, y 725–1135 da imagem 720×1320) não recebe objetos altos.
