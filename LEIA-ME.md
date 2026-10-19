# Ritmo (nome provisório) — app de rotina saudável

App iOS e Android feito com Expo (React Native), conectado ao banco Supabase `ritmo-app`.

## O que já funciona

- **Conta:** login, cadastro e "esqueci minha senha" por e-mail
- **Cadastro inicial (4 passos):** TMB (Mifflin-St Jeor), calorias, proteína, carboidrato, gordura e meta de água
- **Início:** checklist do dia (treino, alimentação, água), sequência 🔥, nível (Bronze → Lenda), calorias, água (+200/+300/+500 ml e desfazer), peso do dia e treino do dia
- **Nutrição:** resumo de calorias e macros; registro por foto, por texto (IA) ou manual; lista do dia por refeição; limite diário de IA (gratuito 3, premium 30)
- **Treino:** montar o treino do dia com a biblioteca de exercícios (ou exercícios próprios), marcar cada exercício, concluir o treino; registrar corrida com ritmo; histórico
- **Perfil:** dados, metas, IMC e sair

## Como testar no iPhone (pelo PC com Windows)

1. Instale o **Expo Go** no iPhone (App Store, gratuito).
2. Na pasta do projeto, dê dois cliques em **`abrir.bat`** (na primeira vez, use `iniciar.bat`, que instala tudo).
3. Escaneie o QR code com a câmera do iPhone. O PC precisa ficar ligado com a janela aberta.

## Pendências de configuração

- (concluído) IA da Nutrição: chave GEMINI_API_KEY cadastrada.
- (concluído) Banco: correção da corrida aplicada.

## Próximas etapas

1. Apple Saúde / Health Connect (treinos do relógio e peso da balança) — exige build próprio (não roda no Expo Go)
2. (feito) Excluir conta dentro do app. Login com Apple só será exigido se houver login com Google/redes sociais
3. Plano de treino por IA
4. Clube, ranking e notificações
5. Plano pago com compras dentro do app
6. Publicação na App Store e no Google Play
