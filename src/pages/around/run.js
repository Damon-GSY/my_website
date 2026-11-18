// The pages around the run (404, /lab, /short) share these lists. The chapter numbers and names are the
// ones the home page uses (CHAPTERS in src/pages/Home.jsx); they are repeated here so these routes do not
// load the home page's chunk.

export const CHAPTERS = [
  { id: 'statement', n: '01', label: { en: 'Statement', zh: '自述' } },
  { id: 'work', n: '02', label: { en: 'Work', zh: '作品' } },
  { id: 'evaluate', n: '03', label: { en: 'Evaluate', zh: '评测' } },
  { id: 'evidence', n: '04', label: { en: 'Evidence', zh: '证据' } },
  { id: 'path', n: '05', label: { en: 'Path', zh: '经历' } },
  { id: 'notes', n: '06', label: { en: 'Notes', zh: '笔记' } },
  { id: 'contact', n: '07', label: { en: 'Contact', zh: '联系' } },
];

// Credits. Damon built six React studies himself (commit 0e712cf); four standalone studies were built by
// Claude from his written briefs; the rest, and the eight concept boards, were drawn up by Claude.
export const CREDIT = {
  damon: { en: "Damon's study", zh: 'Damon 的研究' },
  brief: { en: "From Damon's brief", zh: '依 Damon 的设想' },
};

// Every study: where it lives, one line, and what it became. `thumb` is public/lab/thumbs/<id>.webp,
// a 1440 x 900 screenshot of the study.
export const STUDIES = {
  pill: {
    title: { en: 'Pill', zh: '胶囊' },
    href: '/lab/pill/',
    credit: 'brief',
    line: { en: 'A hairline opens into a pill and pushes the name apart.', zh: '一条细线张开成胶囊，把名字向两边推开。' },
  },
  ink: {
    title: { en: 'Wet ink', zh: '湿墨' },
    href: '/ink',
    credit: 'brief',
    line: { en: 'The cursor is wet; under the page there is moving ink.', zh: '光标是湿的，页面之下藏着流动的墨。' },
  },
  typist: {
    title: { en: 'Token typist', zh: '逐词打字机' },
    href: '/typist',
    credit: 'damon',
    line: {
      en: 'A model types the page; the words it did not pick stand in depth.',
      zh: '模型逐词打出页面，落选的候选词悬在纵深里。',
    },
  },
  parcel: {
    title: { en: 'Parcel box', zh: '快递纸箱' },
    href: '/parcel',
    line: { en: 'The page folds itself into a box and ships you to the work.', zh: '页面把自己折成一只箱子，把你送到作品面前。' },
  },
  parcels: {
    title: { en: 'Parcels', zh: '架上纸箱' },
    href: '/lab/parcels/',
    line: { en: 'Six cartons on a shelf; each unfolds into its case study.', zh: '架上六只纸箱，每只展开就是一个案例。' },
  },
  d20: {
    title: { en: 'D20', zh: '二十面骰' },
    href: '/d20',
    line: { en: 'Evaluation as a twenty-sided die, rolled twenty times.', zh: '把评测做成一枚二十面骰，掷二十次。' },
  },
  city: {
    title: { en: 'Metric city', zh: '尺度城市' },
    href: '/city',
    credit: 'damon',
    line: {
      en: 'Towers built to the figures level out into a log₁₀ chart.',
      zh: '按数据建起的高楼，被压平成一张 log₁₀ 图表。',
    },
  },
  paper: {
    title: { en: 'Crumpled paper', zh: '揉皱的纸' },
    href: '/lab/paper/',
    line: { en: 'One printed sheet that crumples into a ball between sections.', zh: '一张印刷纸，在章节之间揉成纸团，再摊平。' },
  },
  receipt: {
    title: { en: 'Thermal receipt', zh: '热敏小票' },
    href: '/receipt',
    credit: 'damon',
    line: { en: 'The profile prints as a receipt, with a stub to tear off.', zh: '档案打印成一张小票，底部有可撕下的存根。' },
  },
  agent: {
    title: { en: 'Agent site', zh: '智能体网页' },
    href: '/lab/agent/',
    line: { en: 'The page drives itself and asks before anything risky.', zh: '页面自己操作，遇到有风险的动作先问你。' },
  },
  bento: {
    title: { en: 'Bento', zh: 'Bento 卡片' },
    href: '/lab/bento/',
    alt: { href: '/bento', label: { en: "Damon's React version", zh: 'Damon 的 React 版' } },
    credit: 'brief',
    line: { en: 'A calm profile: six live cards on one stage.', zh: '一份安静的档案：一个舞台上六张会动的卡片。' },
  },
  shadow: {
    title: { en: '318° shadow', zh: '318° 投影' },
    href: '/shadow',
    credit: 'damon',
    line: {
      en: 'Turn the light; at 318° a wire’s shadow spells his name.',
      zh: '转动光源，到 318° 时铁丝的影子拼出他的名字。',
    },
  },
  descent: {
    title: { en: 'Descent', zh: '下降' },
    href: '/descent',
    line: { en: 'The flat page was lying on a loss landscape all along.', zh: '你读的平面，原来一直躺在一片损失地形上。' },
  },
  rollout: {
    title: { en: 'Rollout', zh: '轨迹' },
    href: '/rollout',
    line: { en: 'You are the agent. Twenty steps, one trace.', zh: '你就是智能体：二十步，一条轨迹。' },
  },
  night: {
    title: { en: 'Night', zh: '夜' },
    href: '/lab/night/',
    credit: 'brief',
    line: { en: 'A particle night, a ring of text, and a warp into amber.', zh: '粒子夜景、文字圆环，以及一次冲入琥珀色的跃迁。' },
  },
  arena: {
    title: { en: 'Agent arena', zh: '智能体竞技场' },
    href: '/arena',
    credit: 'damon',
    line: {
      en: 'Break the agent: inject tool drift and traps, and watch the guardrails.',
      zh: '对抗压测：注入工具漂移与陷阱，看护栏是否守住。',
    },
  },
};

// What the run is made of, in its own order: each chapter (or mode) and the studies it was assembled from.
export const ASSEMBLY = [
  {
    n: '00',
    label: { en: 'Arrival', zh: '开场' },
    does: { en: 'A hairline opens into the ink under the name.', zh: '一条细线张开，成为名字下面的墨。' },
    href: '/',
    frame: 'run-arrival',
    from: ['pill', 'ink'],
  },
  {
    n: '01',
    label: { en: 'Statement', zh: '自述' },
    does: { en: 'The claim is typed token by token.', zh: '那句自述逐词打出来。' },
    href: '/#statement',
    frame: 'run-statement',
    from: ['typist'],
  },
  {
    n: '02',
    label: { en: 'Work', zh: '作品' },
    does: { en: 'A carton folds, travels and unpacks onto a shelf.', zh: '纸箱折起、运来，在架上拆开。' },
    href: '/#work',
    frame: 'run-work',
    from: ['parcel', 'parcels'],
  },
  {
    n: '03',
    label: { en: 'Evaluate', zh: '评测' },
    does: { en: 'You roll the die twenty times.', zh: '你把骰子掷二十次。' },
    href: '/#evaluate',
    frame: 'run-evaluate',
    from: ['d20'],
  },
  {
    n: '04',
    label: { en: 'Evidence', zh: '证据' },
    does: { en: 'The figures rise into towers, then level into a chart.', zh: '数字升成高楼，再压平成图表。' },
    href: '/#evidence',
    frame: 'run-evidence',
    from: ['city'],
  },
  {
    n: '06',
    label: { en: 'Notes', zh: '笔记' },
    does: { en: 'A note un-crumples when you open it.', zh: '打开一篇笔记，纸团随之摊平。' },
    href: '/#notes',
    frame: 'run-notes',
    from: ['paper'],
  },
  {
    n: '07',
    label: { en: 'Contact', zh: '联系' },
    does: { en: 'Your visit prints as a receipt, stamped.', zh: '你的这次访问打印成一张盖了章的小票。' },
    href: '/#contact',
    frame: 'run-contact',
    from: ['receipt'],
  },
  {
    n: '→',
    label: { en: 'Guided', zh: '代驾' },
    does: { en: 'A button in the bar: the page drives itself.', zh: '顶栏里的一个按钮：页面自己操作。' },
    href: '/',
    frame: null,
    from: ['agent'],
  },
  {
    n: '→',
    label: { en: 'Short version', zh: '简短版' },
    does: { en: 'The sixty-second version, for someone in a hurry.', zh: '六十秒的版本，给赶时间的人。' },
    href: '/short',
    frame: null,
    from: ['bento'],
  },
  {
    n: '404',
    label: { en: 'Not found', zh: '未找到' },
    does: { en: 'A wire whose shadow spells 404.', zh: '一根影子拼出 404 的铁丝。' },
    href: '/off-the-record',
    frame: null,
    from: ['shadow'],
  },
];

// Studies that stay studies, and why.
export const KEPT = [
  { id: 'descent', why: { en: 'Makes the die’s point; the die is the one you act on.', zh: '与骰子说的是同一件事；骰子是你能亲手掷的那个。' } },
  { id: 'rollout', why: { en: 'Makes the die’s point; the die is the one you act on.', zh: '与骰子说的是同一件事；骰子是你能亲手掷的那个。' } },
  { id: 'night', why: { en: 'Kept as its own study, not a theme of the site.', zh: '保留为独立研究，而不是网站的夜间主题。' } },
  { id: 'arena', why: { en: 'A sandbox of its own; it stays one.', zh: '它本身就是一个沙盒，就让它保持独立。' } },
];

// The eight concept boards (public/lab/concepts/), and what each became.
export const BOARDS = [
  { n: '01', id: 'mountain', title: { en: 'Mountain range', zh: '山脉' }, line: { en: 'The name is the mountain range.', zh: '名字本身就是等高线山脉。' }, built: null },
  { n: '02', id: 'parcels', title: { en: 'Parcels', zh: '纸箱' }, line: { en: 'Every project is a sealed parcel.', zh: '每个项目都是一只封好的纸箱。' }, built: 'parcels' },
  { n: '03', id: 'agent', title: { en: 'Agent site', zh: '智能体网页' }, line: { en: 'The site operates itself.', zh: '网页自己运行。' }, built: 'agent' },
  { n: '04', id: 'paper', title: { en: 'Crumpled paper', zh: '揉皱的纸' }, line: { en: 'One sheet, crumpled between sections.', zh: '一张纸，在章节之间揉皱。' }, built: 'paper' },
  { n: '05', id: 'typist', title: { en: 'Typist', zh: '打字机' }, line: { en: 'A model types the site.', zh: '模型逐词打出网页。' }, built: 'typist' },
  { n: '06', id: 'shadow', title: { en: 'Shadow theatre', zh: '影子剧场' }, line: { en: 'A wire tangle whose shadow is a name.', zh: '一团铁丝，影子是一个名字。' }, built: 'shadow' },
  { n: '07', id: 'receipt', title: { en: 'Receipt', zh: '小票' }, line: { en: 'The site prints as one long receipt.', zh: '整个网站打印成一张长小票。' }, built: 'receipt' },
  { n: '08', id: 'city', title: { en: 'City', zh: '城市' }, line: { en: 'Towers that level into a chart.', zh: '会压平成图表的高楼。' }, built: 'city' },
];
