// Biblioteca de exercícios.
// Imagens: Free Exercise DB (domínio público / Unlicense) — github.com/yuhonas/free-exercise-db
// Cada exercício tem duas fotos (início e fim do movimento), alternadas na tela como animação.
// Passo a passo escrito em português pelo app.

export type MuscleGroup =
  | "peito" | "costas" | "perna" | "gluteo" | "ombro"
  | "biceps" | "triceps" | "core" | "cardio" | "fullbody";

export type Equip = "corpo" | "halter" | "academia";

export type ExerciseTemplate = {
  name: string;
  groups: MuscleGroup[];
  sets: number;
  reps: string;
  rest: string;
  equip: Equip;
  img: string | null; // id no Free Exercise DB
  compound?: boolean; // multiarticular (vem primeiro no treino)
  steps: string[];
  tip?: string;
};

// Formato salvo no banco (compatível com os treinos antigos; weight e done são opcionais)
export type Exercise = {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  notes?: string;
  weight?: number | null;
  done?: boolean;
};

const IMG_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";
export const exerciseImages = (t: ExerciseTemplate | undefined | null): string[] =>
  t?.img ? [`${IMG_BASE}${t.img}/0.jpg`, `${IMG_BASE}${t.img}/1.jpg`] : [];

export const GROUP_LABEL: Record<MuscleGroup, string> = {
  peito: "Peito", costas: "Costas", perna: "Pernas", gluteo: "Glúteos", ombro: "Ombros",
  biceps: "Bíceps", triceps: "Tríceps", core: "Abdômen", cardio: "Cardio", fullbody: "Corpo todo",
};

export const WORKOUT_TYPES: { id: MuscleGroup | "livre"; label: string }[] = [
  { id: "fullbody", label: "Corpo todo" },
  { id: "peito", label: "Peito" },
  { id: "costas", label: "Costas" },
  { id: "perna", label: "Pernas" },
  { id: "gluteo", label: "Glúteos" },
  { id: "ombro", label: "Ombros" },
  { id: "biceps", label: "Bíceps" },
  { id: "triceps", label: "Tríceps" },
  { id: "core", label: "Abdômen" },
  { id: "cardio", label: "Cardio" },
  { id: "livre", label: "Todos" },
];

type Def = Omit<ExerciseTemplate, "name" | "groups" | "sets" | "reps" | "rest">;
const E = (name: string, groups: MuscleGroup[], sets: number, reps: string, rest: string, d: Def): ExerciseTemplate => ({
  name, groups, sets, reps, rest, ...d,
});

export const EXERCISES: ExerciseTemplate[] = [
  // ---------- Peito ----------
  E("Supino reto com barra", ["peito"], 4, "8-10", "90", { equip: "academia", img: "Barbell_Bench_Press_-_Medium_Grip", compound: true, steps: [
    "Deite no banco com os olhos abaixo da barra e os pés firmes no chão.",
    "Segure a barra um pouco mais aberta que os ombros e tire do suporte com os braços estendidos.",
    "Desça a barra devagar até encostar de leve no meio do peito.",
    "Empurre de volta até estender os braços, sem tirar o quadril do banco.",
  ], tip: "Mantenha as escápulas juntas e os cotovelos a uns 45° do corpo." }),
  E("Supino inclinado com halteres", ["peito"], 4, "10", "75", { equip: "halter", img: "Incline_Dumbbell_Press", compound: true, steps: [
    "Ajuste o banco entre 30° e 45° e sente com um halter em cada mão sobre as coxas.",
    "Deite levando os halteres para a altura do peito, palmas para frente.",
    "Empurre para cima até quase encostar um halter no outro.",
    "Desça com controle até sentir o alongamento no peito.",
  ], tip: "Não deixe os halteres baterem no topo; controle a volta." }),
  E("Supino declinado", ["peito"], 3, "10", "75", { equip: "academia", img: "Decline_Barbell_Bench_Press", compound: true, steps: [
    "Prenda as pernas no banco declinado e deite com a cabeça mais baixa que o quadril.",
    "Tire a barra do suporte com os braços estendidos.",
    "Desça até a parte de baixo do peito.",
    "Empurre de volta à posição inicial.",
  ], tip: "Peça ajuda para tirar e devolver a barra no suporte." }),
  E("Crucifixo com halteres", ["peito"], 3, "12", "60", { equip: "halter", img: "Dumbbell_Flyes", steps: [
    "Deite no banco com os halteres acima do peito, palmas viradas uma para a outra.",
    "Com os cotovelos levemente dobrados, abra os braços em arco até a altura do peito.",
    "Feche o movimento pelo mesmo caminho, como se abraçasse uma árvore.",
  ], tip: "Use peso moderado: o foco é o alongamento, não a carga." }),
  E("Crossover na polia", ["peito"], 3, "12-15", "60", { equip: "academia", img: "Cable_Crossover", steps: [
    "Fique no centro do aparelho segurando as alças das polias altas, um pé à frente.",
    "Incline o tronco levemente para frente com os cotovelos um pouco dobrados.",
    "Traga as mãos para baixo e para o centro até se encontrarem na frente do quadril.",
    "Volte devagar até sentir o peito alongar.",
  ] }),
  E("Flexão de braço", ["peito", "fullbody"], 3, "máx", "60", { equip: "corpo", img: "Pushups", compound: true, steps: [
    "Apoie as mãos no chão um pouco mais abertas que os ombros e estenda as pernas.",
    "Mantenha o corpo reto, da cabeça aos calcanhares.",
    "Desça até o peito quase encostar no chão.",
    "Empurre o chão e volte a estender os braços.",
  ], tip: "Se ficar pesado, apoie os joelhos no chão." }),
  E("Peck deck (voador)", ["peito"], 3, "12", "60", { equip: "academia", img: "Butterfly", steps: [
    "Ajuste o banco para que as alças fiquem na altura do peito.",
    "Apoie os antebraços ou segure as alças com os braços abertos.",
    "Feche os braços à frente do peito, apertando o músculo.",
    "Abra devagar até sentir o alongamento.",
  ] }),
  E("Paralelas (mergulho no peito)", ["peito", "triceps"], 3, "8-10", "75", { equip: "academia", img: "Dips_-_Chest_Version", compound: true, steps: [
    "Segure as barras paralelas e suba com os braços estendidos.",
    "Incline o tronco para frente e dobre os cotovelos para descer.",
    "Desça até os ombros ficarem um pouco abaixo dos cotovelos.",
    "Empurre de volta para cima.",
  ] }),

  // ---------- Costas ----------
  E("Barra fixa", ["costas", "biceps"], 4, "máx", "90", { equip: "academia", img: "Pullups", compound: true, steps: [
    "Segure a barra com as palmas para frente, mãos mais abertas que os ombros.",
    "Fique pendurado com os braços estendidos.",
    "Puxe o corpo até o queixo passar da barra, levando os cotovelos para baixo.",
    "Desça com controle até estender os braços.",
  ], tip: "Use o elástico ou a máquina auxiliar se ainda não fizer sozinho." }),
  E("Puxada frontal (pulley)", ["costas"], 4, "10-12", "75", { equip: "academia", img: "Wide-Grip_Lat_Pulldown", compound: true, steps: [
    "Sente com as coxas presas no apoio e segure a barra bem aberta.",
    "Incline o tronco levemente para trás e estufe o peito.",
    "Puxe a barra até a parte de cima do peito, levando os cotovelos para baixo.",
    "Volte devagar até estender os braços.",
  ], tip: "Não puxe a barra atrás da nuca." }),
  E("Remada curvada com barra", ["costas"], 4, "8-10", "90", { equip: "academia", img: "Bent_Over_Barbell_Row", compound: true, steps: [
    "Segure a barra, dobre levemente os joelhos e incline o tronco para frente com as costas retas.",
    "Deixe a barra pendurada na altura dos joelhos.",
    "Puxe a barra até a barriga, apertando as escápulas.",
    "Desça devagar.",
  ], tip: "Coluna neutra o tempo todo; não arredonde as costas." }),
  E("Remada cavalinho", ["costas"], 3, "10", "75", { equip: "academia", img: "T-Bar_Row_with_Handle", compound: true, steps: [
    "Fique com uma perna de cada lado da barra e segure a pegada.",
    "Incline o tronco para frente com as costas retas e joelhos levemente dobrados.",
    "Puxe o peso em direção ao peito.",
    "Desça com controle.",
  ] }),
  E("Remada unilateral com halter", ["costas"], 3, "10 cada", "60", { equip: "halter", img: "One-Arm_Dumbbell_Row", compound: true, steps: [
    "Apoie um joelho e a mão do mesmo lado no banco.",
    "Segure o halter com a outra mão, braço estendido.",
    "Puxe o halter até a lateral da cintura, cotovelo próximo ao corpo.",
    "Desça devagar e troque de lado ao terminar a série.",
  ] }),
  E("Remada baixa na polia", ["costas"], 3, "12", "60", { equip: "academia", img: "Seated_Cable_Rows", compound: true, steps: [
    "Sente com os pés apoiados e segure o triângulo com os braços estendidos.",
    "Mantenha o tronco reto.",
    "Puxe a pegada até a barriga, levando os cotovelos para trás.",
    "Volte estendendo os braços sem curvar as costas.",
  ] }),
  E("Levantamento terra", ["costas", "perna", "fullbody"], 4, "6-8", "120", { equip: "academia", img: "Barbell_Deadlift", compound: true, steps: [
    "Fique com os pés na largura do quadril e a barra sobre o meio dos pés.",
    "Dobre o quadril e os joelhos e segure a barra, costas retas e peito aberto.",
    "Empurre o chão com os pés e suba estendendo quadril e joelhos juntos.",
    "Desça a barra rente às pernas, levando o quadril para trás.",
  ], tip: "Comece leve: a técnica vem antes da carga." }),
  E("Pull-over com halter", ["costas", "peito"], 3, "12", "60", { equip: "halter", img: "Bent-Arm_Dumbbell_Pullover", steps: [
    "Deite no banco segurando um halter com as duas mãos acima do peito.",
    "Com os cotovelos levemente dobrados, leve o halter para trás da cabeça.",
    "Traga de volta pelo mesmo arco até acima do peito.",
  ] }),
  E("Hiperextensão lombar", ["costas", "core"], 3, "15", "45", { equip: "academia", img: "Hyperextensions_Back_Extensions", steps: [
    "Posicione o quadril no apoio do banco e prenda os tornozelos.",
    "Cruze os braços no peito e desça o tronco com as costas retas.",
    "Suba até o corpo ficar alinhado, sem passar da linha.",
  ] }),

  // ---------- Pernas ----------
  E("Agachamento com peso do corpo", ["perna", "gluteo", "fullbody"], 3, "15", "45", { equip: "corpo", img: "Bodyweight_Squat", compound: true, steps: [
    "Fique com os pés na largura dos ombros, pontas levemente para fora.",
    "Leve o quadril para trás e para baixo, como se fosse sentar.",
    "Desça até as coxas ficarem paralelas ao chão.",
    "Suba empurrando o chão com os calcanhares.",
  ], tip: "Joelhos acompanham a direção das pontas dos pés." }),
  E("Agachamento livre", ["perna", "gluteo"], 4, "8-10", "120", { equip: "academia", img: "Barbell_Full_Squat", compound: true, steps: [
    "Apoie a barra na parte de cima das costas e tire do suporte.",
    "Pés na largura dos ombros, peito aberto.",
    "Desça levando o quadril para trás até as coxas passarem da linha do joelho.",
    "Suba empurrando o chão com os calcanhares.",
  ], tip: "Mantenha os calcanhares no chão e o olhar à frente." }),
  E("Agachamento frontal", ["perna"], 4, "8", "120", { equip: "academia", img: "Front_Barbell_Squat", compound: true, steps: [
    "Apoie a barra na frente dos ombros, cotovelos altos.",
    "Desça mantendo o tronco o mais reto possível.",
    "Suba até estender quadril e joelhos.",
  ] }),
  E("Leg press 45°", ["perna", "gluteo"], 4, "10-12", "90", { equip: "academia", img: "Leg_Press", compound: true, steps: [
    "Sente no aparelho e apoie os pés na plataforma na largura do quadril.",
    "Destrave e desça a plataforma dobrando os joelhos até uns 90°.",
    "Empurre de volta sem travar os joelhos no final.",
  ], tip: "Não tire o quadril do banco na descida." }),
  E("Cadeira extensora", ["perna"], 3, "12", "60", { equip: "academia", img: "Leg_Extensions", steps: [
    "Sente com o rolo apoiado na frente dos tornozelos.",
    "Estenda as pernas até ficarem retas.",
    "Segure um segundo e desça devagar.",
  ] }),
  E("Cadeira flexora", ["perna"], 3, "12", "60", { equip: "academia", img: "Seated_Leg_Curl", steps: [
    "Sente com o rolo atrás dos tornozelos e trave as coxas.",
    "Dobre os joelhos puxando o rolo para baixo.",
    "Volte devagar.",
  ] }),
  E("Mesa flexora", ["perna"], 3, "12", "60", { equip: "academia", img: "Lying_Leg_Curls", steps: [
    "Deite de bruços com o rolo atrás dos tornozelos.",
    "Dobre os joelhos levando os calcanhares em direção ao glúteo.",
    "Desça com controle.",
  ] }),
  E("Stiff com halteres", ["perna", "gluteo"], 4, "10", "75", { equip: "halter", img: "Stiff-Legged_Dumbbell_Deadlift", compound: true, steps: [
    "Segure os halteres na frente das coxas, joelhos levemente dobrados.",
    "Incline o tronco levando o quadril para trás, costas retas.",
    "Desça até sentir a parte de trás da coxa alongar.",
    "Suba contraindo glúteos.",
  ] }),
  E("Afundo (avanço)", ["perna", "gluteo"], 3, "10 cada", "75", { equip: "halter", img: "Dumbbell_Lunges", compound: true, steps: [
    "Fique em pé com um halter em cada mão (ou sem peso).",
    "Dê um passo grande à frente.",
    "Desça até o joelho de trás quase encostar no chão.",
    "Volte à posição inicial e alterne as pernas.",
  ] }),
  E("Búlgaro", ["perna", "gluteo"], 3, "10 cada", "75", { equip: "halter", img: "Split_Squat_with_Dumbbells", compound: true, steps: [
    "Apoie o peito do pé de trás num banco.",
    "Com o tronco reto, desça dobrando o joelho da frente.",
    "Suba empurrando o chão com o pé da frente.",
    "Termine a série e troque de perna.",
  ] }),
  E("Panturrilha em pé", ["perna"], 4, "15-20", "45", { equip: "corpo", img: "Standing_Calf_Raises", steps: [
    "Fique com a ponta dos pés num degrau.",
    "Suba na ponta dos pés o mais alto possível.",
    "Desça devagar até alongar a panturrilha.",
  ] }),
  E("Panturrilha sentado", ["perna"], 4, "15", "45", { equip: "academia", img: "Seated_Calf_Raise", steps: [
    "Sente com o apoio sobre os joelhos e a ponta dos pés na plataforma.",
    "Suba os calcanhares o máximo possível.",
    "Desça devagar.",
  ] }),

  // ---------- Glúteos ----------
  E("Hip thrust", ["gluteo"], 4, "10-12", "75", { equip: "academia", img: "Barbell_Hip_Thrust", compound: true, steps: [
    "Apoie a parte de cima das costas num banco, barra sobre o quadril.",
    "Pés firmes no chão, joelhos dobrados.",
    "Suba o quadril até o corpo ficar reto dos ombros aos joelhos.",
    "Aperte o glúteo no topo e desça com controle.",
  ] }),
  E("Elevação pélvica", ["gluteo"], 3, "12", "60", { equip: "corpo", img: "Butt_Lift_Bridge", steps: [
    "Deite de barriga para cima, joelhos dobrados e pés no chão.",
    "Suba o quadril até alinhar com joelhos e ombros.",
    "Aperte o glúteo por um segundo e desça.",
  ] }),
  E("Coice na polia", ["gluteo"], 3, "12 cada", "45", { equip: "academia", img: "One-Legged_Cable_Kickback", steps: [
    "Prenda a tornozeleira da polia baixa num pé.",
    "Segure no aparelho e leve a perna para trás, joelho estendido.",
    "Volte devagar e troque de perna ao final.",
  ] }),
  E("Abdução de quadril (máquina)", ["gluteo"], 3, "15", "45", { equip: "academia", img: "Thigh_Abductor", steps: [
    "Sente com as pernas encostadas nos apoios.",
    "Abra as pernas empurrando os apoios para fora.",
    "Volte devagar.",
  ] }),
  E("Glute kickback", ["gluteo"], 3, "12 cada", "45", { equip: "corpo", img: "Glute_Kickback", steps: [
    "Fique de quatro apoios, mãos sob os ombros.",
    "Leve uma perna para trás e para cima, joelho dobrado.",
    "Desça sem encostar o joelho e repita. Troque de lado.",
  ] }),

  // ---------- Ombros ----------
  E("Desenvolvimento militar com barra", ["ombro"], 4, "8-10", "90", { equip: "academia", img: "Standing_Military_Press", compound: true, steps: [
    "Em pé, segure a barra na frente dos ombros.",
    "Contraia o abdômen e empurre a barra acima da cabeça.",
    "Desça com controle até a altura dos ombros.",
  ] }),
  E("Desenvolvimento com halteres", ["ombro"], 4, "10", "75", { equip: "halter", img: "Dumbbell_Shoulder_Press", compound: true, steps: [
    "Sente com as costas apoiadas, halteres na altura das orelhas.",
    "Empurre os halteres para cima até quase se encostarem.",
    "Desça devagar.",
  ] }),
  E("Elevação lateral", ["ombro"], 4, "12-15", "45", { equip: "halter", img: "Side_Lateral_Raise", steps: [
    "Em pé, halteres ao lado do corpo.",
    "Com os cotovelos levemente dobrados, eleve os braços para os lados até a altura dos ombros.",
    "Desça devagar.",
  ], tip: "Não balance o tronco: use pouco peso." }),
  E("Elevação frontal", ["ombro"], 3, "12", "45", { equip: "halter", img: "Front_Dumbbell_Raise", steps: [
    "Em pé, halteres na frente das coxas.",
    "Eleve os braços à frente até a altura dos ombros.",
    "Desça com controle.",
  ] }),
  E("Crucifixo invertido", ["ombro", "costas"], 3, "12", "60", { equip: "halter", img: "Reverse_Flyes", steps: [
    "Incline o tronco à frente com os halteres pendurados.",
    "Abra os braços para os lados apertando as escápulas.",
    "Volte devagar.",
  ] }),
  E("Encolhimento (trapézio)", ["ombro", "costas"], 3, "15", "45", { equip: "halter", img: "Dumbbell_Shrug", steps: [
    "Em pé, halteres ao lado do corpo.",
    "Suba os ombros em direção às orelhas.",
    "Segure um segundo e desça.",
  ] }),
  E("Arnold press", ["ombro"], 3, "10", "75", { equip: "halter", img: "Arnold_Dumbbell_Press", compound: true, steps: [
    "Sente com os halteres na frente do rosto, palmas para você.",
    "Empurre para cima girando as palmas para frente.",
    "Desça fazendo o giro de volta.",
  ] }),

  // ---------- Bíceps ----------
  E("Rosca direta com barra", ["biceps"], 4, "10", "60", { equip: "academia", img: "Barbell_Curl", steps: [
    "Em pé, segure a barra com as palmas para frente.",
    "Dobre os cotovelos levando a barra até o peito, cotovelos parados.",
    "Desça devagar.",
  ], tip: "Não jogue o corpo para trás para subir o peso." }),
  E("Rosca alternada com halteres", ["biceps"], 3, "10 cada", "45", { equip: "halter", img: "Dumbbell_Alternate_Bicep_Curl", steps: [
    "Em pé, halteres ao lado do corpo.",
    "Suba um halter girando a palma para cima.",
    "Desça e repita com o outro braço.",
  ] }),
  E("Rosca martelo", ["biceps"], 3, "12", "45", { equip: "halter", img: "Hammer_Curls", steps: [
    "Segure os halteres com as palmas viradas para o corpo.",
    "Dobre os cotovelos mantendo essa pegada.",
    "Desça devagar.",
  ] }),
  E("Rosca scott", ["biceps"], 3, "10", "60", { equip: "academia", img: "Preacher_Curl", steps: [
    "Apoie a parte de trás dos braços no banco Scott.",
    "Suba a barra dobrando os cotovelos.",
    "Desça até quase estender os braços.",
  ] }),
  E("Rosca concentrada", ["biceps"], 3, "12 cada", "45", { equip: "halter", img: "Concentration_Curls", steps: [
    "Sente e apoie o cotovelo na parte de dentro da coxa.",
    "Suba o halter até o ombro.",
    "Desça devagar e troque de braço ao final.",
  ] }),
  E("Rosca 21", ["biceps"], 3, "21", "60", { equip: "academia", img: "Barbell_Curl", steps: [
    "Faça 7 repetições da metade de baixo do movimento.",
    "Depois 7 da metade de cima.",
    "Termine com 7 repetições completas.",
  ] }),

  // ---------- Tríceps ----------
  E("Tríceps na polia (corda)", ["triceps"], 4, "12", "45", { equip: "academia", img: "Triceps_Pushdown_-_Rope_Attachment", steps: [
    "De frente para a polia alta, segure a corda.",
    "Cotovelos colados ao corpo, estenda os braços para baixo abrindo a corda no final.",
    "Volte devagar até 90°.",
  ] }),
  E("Tríceps testa", ["triceps"], 3, "10", "60", { equip: "academia", img: "EZ-Bar_Skullcrusher", steps: [
    "Deite no banco segurando a barra com os braços estendidos.",
    "Dobre só os cotovelos levando a barra em direção à testa.",
    "Estenda os braços de volta.",
  ] }),
  E("Tríceps francês", ["triceps"], 3, "10", "60", { equip: "halter", img: "Standing_Dumbbell_Triceps_Extension", steps: [
    "Segure um halter com as duas mãos acima da cabeça.",
    "Dobre os cotovelos levando o halter para trás da cabeça.",
    "Estenda os braços de volta.",
  ] }),
  E("Tríceps coice", ["triceps"], 3, "12 cada", "45", { equip: "halter", img: "Tricep_Dumbbell_Kickback", steps: [
    "Incline o tronco e apoie uma mão no banco.",
    "Com o cotovelo junto ao corpo, estenda o braço para trás.",
    "Volte devagar e troque de lado.",
  ] }),
  E("Mergulho no banco", ["triceps"], 3, "12", "60", { equip: "corpo", img: "Bench_Dips", steps: [
    "Apoie as mãos na beira de um banco, atrás do corpo.",
    "Estenda as pernas à frente.",
    "Desça dobrando os cotovelos até 90° e suba.",
  ] }),
  E("Supino fechado", ["triceps", "peito"], 4, "8", "75", { equip: "academia", img: "Close-Grip_Barbell_Bench_Press", compound: true, steps: [
    "Deite no banco e segure a barra com as mãos na largura dos ombros.",
    "Desça a barra até o peito com os cotovelos junto ao corpo.",
    "Empurre de volta.",
  ] }),

  // ---------- Abdômen ----------
  E("Prancha frontal", ["core"], 3, "30-60s", "30", { equip: "corpo", img: "Plank", steps: [
    "Apoie antebraços e pontas dos pés no chão.",
    "Mantenha o corpo reto, abdômen e glúteos contraídos.",
    "Segure a posição pelo tempo indicado.",
  ], tip: "Não deixe o quadril cair nem subir demais." }),
  E("Prancha lateral", ["core"], 3, "30s cada", "30", { equip: "corpo", img: "Push_Up_to_Side_Plank", steps: [
    "Deite de lado e apoie o antebraço no chão.",
    "Suba o quadril até o corpo ficar reto.",
    "Segure e depois troque de lado.",
  ] }),
  E("Abdominal supra", ["core"], 3, "20", "30", { equip: "corpo", img: "Crunches", steps: [
    "Deite com os joelhos dobrados e as mãos atrás da cabeça.",
    "Suba os ombros do chão contraindo o abdômen.",
    "Desça devagar.",
  ], tip: "Não puxe o pescoço com as mãos." }),
  E("Abdominal infra (elevação de pernas)", ["core"], 3, "15", "30", { equip: "corpo", img: "Flat_Bench_Lying_Leg_Raise", steps: [
    "Deite de barriga para cima com as pernas estendidas.",
    "Suba as pernas até formar 90° com o tronco.",
    "Desça devagar sem encostar no chão.",
  ] }),
  E("Abdominal oblíquo", ["core"], 3, "15 cada", "30", { equip: "corpo", img: "Oblique_Crunches", steps: [
    "Deite de lado com os joelhos dobrados.",
    "Suba o tronco lateralmente contraindo a lateral do abdômen.",
    "Desça e troque de lado.",
  ] }),
  E("Russian twist", ["core"], 3, "20", "30", { equip: "corpo", img: "Russian_Twist", steps: [
    "Sente com os joelhos dobrados e incline o tronco para trás.",
    "Gire o tronco de um lado para o outro, levando as mãos ao chão.",
  ] }),
  E("Hollow hold", ["core"], 3, "20-30s", "30", { equip: "corpo", img: null, steps: [
    "Deite de barriga para cima com braços e pernas estendidos.",
    "Tire ombros e pernas do chão, lombar colada no solo.",
    "Segure a posição de 'canoa'.",
  ] }),
  E("Mountain climber", ["core", "cardio", "fullbody"], 3, "30s", "30", { equip: "corpo", img: "Mountain_Climbers", steps: [
    "Fique em posição de flexão com os braços estendidos.",
    "Traga um joelho em direção ao peito e volte.",
    "Alterne as pernas rapidamente.",
  ] }),
  E("Dead bug", ["core"], 3, "12 cada", "30", { equip: "corpo", img: "Dead_Bug", steps: [
    "Deite de barriga para cima com braços para o alto e joelhos a 90°.",
    "Estenda um braço e a perna oposta, lombar colada no chão.",
    "Volte e troque de lado.",
  ] }),

  // ---------- Cardio ----------
  E("Esteira (caminhada inclinada)", ["cardio"], 1, "20-30 min", "0", { equip: "academia", img: "Walking_Treadmill", steps: [
    "Ajuste a inclinação entre 8% e 12%.",
    "Caminhe em ritmo firme sem segurar no apoio.",
  ] }),
  E("Corrida (esteira/rua)", ["cardio"], 1, "20-40 min", "0", { equip: "corpo", img: "Running_Treadmill", steps: [
    "Aqueça caminhando por 5 minutos.",
    "Corra num ritmo em que ainda consiga falar frases curtas.",
    "Termine com 5 minutos de caminhada.",
  ] }),
  E("Bicicleta ergométrica", ["cardio"], 1, "20-30 min", "0", { equip: "academia", img: "Bicycling_Stationary", steps: [
    "Ajuste o banco na altura do quadril.",
    "Pedale em ritmo constante, aumentando a carga aos poucos.",
  ] }),
  E("Elíptico", ["cardio"], 1, "20-30 min", "0", { equip: "academia", img: "Elliptical_Trainer", steps: [
    "Suba no aparelho e segure as alças.",
    "Movimente braços e pernas em ritmo constante.",
  ] }),
  E("Pular corda", ["cardio", "fullbody"], 5, "2 min", "60", { equip: "corpo", img: "Rope_Jumping", steps: [
    "Segure a corda com os cotovelos junto ao corpo.",
    "Gire a corda com os punhos e salte baixo, na ponta dos pés.",
  ] }),
  E("Remo ergômetro", ["cardio", "fullbody"], 5, "500m", "90", { equip: "academia", img: "Rowing_Stationary", steps: [
    "Prenda os pés e segure a pegada.",
    "Empurre com as pernas, depois incline o tronco e puxe com os braços.",
    "Volte na ordem contrária: braços, tronco, pernas.",
  ] }),
  E("HIIT - sprint", ["cardio"], 8, "30s", "60", { equip: "corpo", img: "Wind_Sprints", steps: [
    "Aqueça por 5 minutos.",
    "Corra em velocidade máxima pelo tempo indicado.",
    "Descanse caminhando e repita.",
  ] }),
  E("Burpee", ["cardio", "fullbody"], 4, "10-15", "60", { equip: "corpo", img: null, steps: [
    "Em pé, agache e apoie as mãos no chão.",
    "Jogue as pernas para trás ficando em posição de flexão.",
    "Volte os pés para perto das mãos.",
    "Salte com os braços para cima.",
  ] }),

  // ---------- Corpo todo ----------
  E("Clean & press", ["fullbody", "ombro", "perna"], 4, "6", "120", { equip: "academia", img: "Clean_and_Press", compound: true, steps: [
    "Puxe a barra do chão até os ombros num movimento explosivo.",
    "Em seguida, empurre a barra acima da cabeça.",
    "Desça com controle.",
  ] }),
  E("Thruster", ["fullbody", "ombro", "perna"], 4, "8", "90", { equip: "halter", img: "Kettlebell_Thruster", compound: true, steps: [
    "Segure o peso na altura dos ombros e agache.",
    "Ao subir, use o impulso para empurrar o peso acima da cabeça.",
  ] }),
  E("Kettlebell swing", ["fullbody", "gluteo", "core"], 4, "15", "60", { equip: "halter", img: "One-Arm_Kettlebell_Swings", compound: true, steps: [
    "Segure o kettlebell com as duas mãos, pés afastados.",
    "Leve o quadril para trás deixando o peso passar entre as pernas.",
    "Estenda o quadril com força, balançando o peso até a altura do peito.",
  ] }),
  E("Turkish get-up", ["fullbody", "core"], 3, "5 cada", "60", { equip: "halter", img: "Kettlebell_Turkish_Get-Up_Squat_style", compound: true, steps: [
    "Deitado, segure o peso com o braço estendido para cima.",
    "Levante-se em etapas, mantendo o braço sempre esticado.",
    "Volte ao chão pelo mesmo caminho.",
  ] }),
  E("Snatch", ["fullbody"], 4, "5", "120", { equip: "academia", img: "Snatch", compound: true, steps: [
    "Segure a barra bem aberta.",
    "Em um só movimento, leve a barra do chão até acima da cabeça.",
    "Exercício técnico: aprenda com um profissional.",
  ] }),
];

const BY_NAME = new Map(EXERCISES.map((e) => [e.name, e]));
export const findExercise = (name: string) => BY_NAME.get(name);

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export function searchExercises(query: string, type: MuscleGroup | "livre" | null): ExerciseTemplate[] {
  const q = norm(query.trim());
  const pool = !type || type === "livre" ? EXERCISES : EXERCISES.filter((e) => e.groups.includes(type));
  return q ? pool.filter((e) => norm(e.name).includes(q)) : pool;
}

export function workoutTitle(type: MuscleGroup | "livre" | null): string {
  const t = WORKOUT_TYPES.find((w) => w.id === type);
  return !t || t.id === "livre" ? "Treino livre" : `Treino de ${t.label}`;
}

export function formatPace(secPerKm: number | null | undefined): string {
  if (!secPerKm || !isFinite(secPerKm)) return "–";
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}'${String(s).padStart(2, "0")}"/km`;
}
