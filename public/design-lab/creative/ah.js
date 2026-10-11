(() => {
  const $ = selector => document.querySelector(selector);
  const home = $('.ah-home'), film = $('.ah-film'), heroStage = $('.ah-stage');
  const opening = $('.ah-opening-sequence'), openingStage = $('.ah-opening-stage');
  const hero = { canvas: $('.ah-canvas'), renderer: null, last: '' };
  const workSequence = $('.ah-work-sequence'), workStage = $('.ah-work-stage'), workTitle = $('.ah-work-title');
  const toolsSequence = $('.ah-tools-sequence'), toolsStage = $('.ah-tools-stage');
  const thread = $('.ah-thread'), dot = $('.ah-thread-dot'), bridgeArt = $('.ah-bridge-art');
  const researchSequence = $('.ah-research-sequence'), researchStage = $('.ah-research');
  const mode = $('.ah-mode'), language = $('.ah-language'), header = $('.ah-header');
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const ui = (zh, en) => document.body.dataset.language === 'en' ? en : zh;
  let frame = 0, geometry, motion, composition, approved, bridgeModule, bridgeRenderer, manual = false, failed = false, resizeObserver;
  const still = () => manual || media.matches || failed;
  const steps = [
    ['QUERY', '理解任务', 'Understand', '先明确要完成什么。', 'Start with the task.', '把用户意图、当前状态和必要约束放在同一份任务上下文里。', 'Bring user intent, current state, and constraints into one task context.'],
    ['LOOKUP', '发现能力', 'Discover', '找能力，不猜工具名。', 'Find capabilities, not names.', '从持续变化的能力注册表中，发现当前可用的工具与调用契约。', 'Discover available tools and their contracts in a changing capability registry.'],
    ['SEARCH', '筛选工具', 'Search', '从候选中缩小范围。', 'Narrow the candidates.', '区分相似描述与真正匹配的能力，避免把“能调用”当成“该调用”。', 'Separate similar descriptions from capabilities that actually match the task.'],
    ['VERIFY', '检查边界', 'Verify', '行动之前，再确认一次。', 'Check before acting.', '检查输入、工具前置条件和权限边界；缺少信息时先澄清。', 'Check inputs, preconditions, and authority; clarify missing information first.'],
    ['ROUTE', '执行与追踪', 'Execute', '让每次执行可追溯。', 'Make execution traceable.', '选中合适工具再执行，把调用、结果和异常保存在可复盘的轨迹里。', 'Execute with the selected tool. Keep calls, results, and exceptions in a reviewable trace.'],
    ['HANDOFF', '交接与评估', 'Hand off', '知道什么时候停下来。', 'Know when to stop.', '无法可靠继续时交给人；将错误、缺失和过度调用送回评估与训练。', 'Hand off when reliability runs out. Feed wrong, missing, and excessive calls back into evaluation.'],
  ];
  const text = (zh, en) => `data-ui-zh="${zh}" data-ui-en="${en}"`;
  steps.forEach(([name, label, labelEn, title, titleEn, body, bodyEn], index) => {
    const row = document.createElement('li');
    row.className = 'ah-tool-row';
    row.innerHTML = `<button type="button" aria-pressed="false"><span class="ah-row-dock" aria-hidden="true"></span><span class="ah-row-number">0${index + 1}</span><span class="ah-tool-name">${name}</span><span class="ah-row-label" ${text(label, labelEn)}>${label}</span></button><p class="ah-static-detail" ${text(title + body, titleEn + ' ' + bodyEn)}>${title + body}</p>`;
    row.querySelector('button').addEventListener('click', () => {
      if (geometry && !still()) scrollTo({ top: geometry.tools.start + (approved.ROW_BEATS[index] + .025) * (geometry.tools.end - geometry.tools.start), behavior: 'smooth' });
    });
    $('.ah-tool-list ol').append(row);
    const note = document.createElement('div'); note.className = 'ah-step-note';
    note.innerHTML = `<h3><span>0${index + 1}</span><b ${text(title, titleEn)}>${title}</b></h3><p ${text(body, bodyEn)}>${body}</p>`;
    $('.ah-step-notes').append(note);
  });
  const rows = [...document.querySelectorAll('.ah-tool-row')], notes = [...document.querySelectorAll('.ah-step-note')];
  const policy = [...document.querySelectorAll('.ah-policy li')];
  const sections = [...document.querySelectorAll('.ah-journey-nav a')].map(link => ({ link, element: document.getElementById(link.dataset.section), top: 0 }));
  const topics = [
    ['AGENTIC RL', '从反馈中学习', 'Learn from feedback', '让策略随真实反馈改进。', 'Improve policies through feedback.'],
    ['AGENTS', '让行动有依据', 'Act with intention', '连接目标、规划与可追溯的行动。', 'Connect goals, plans and actions.'],
    ['TOOLS', '找到合适的能力', 'Find the right tool', '先发现与验证，再调用。', 'Discover. Verify. Then execute.'],
    ['MEMORY', '让经验参与决策', 'Remember what matters', '保留有用上下文，检查过期假设。', 'Keep context. Revisit assumptions.'],
  ];
  function point(element, radius) {
    const r = element.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + scrollY + r.height / 2, radius: radius ?? r.width / 2 };
  }
  function localPoint(element, stage, radius) {
    const p = point(element, radius), r = stage.getBoundingClientRect();
    return { ...p, y: p.y - scrollY - r.top };
  }
  function bounds(element) { const r = element.getBoundingClientRect(); return { top: r.top + scrollY, bottom: r.bottom + scrollY, height: r.height }; }
  function measure() {
    if (home.hidden || !hero.renderer || !motion) return;
    const height = innerHeight, width = innerWidth, radius = width <= 760 ? 8 : 10;
    const openingTop = bounds(opening).top;
    const timeline = composition.openingTimeline(height, openingTop);
    const { heroEnd, workStart, workSpan } = timeline;
    if (!still()) opening.style.height = (timeline.toolsEnd - openingTop + openingStage.offsetHeight) + 'px';
    else opening.style.removeProperty('height');
    // Reset the only entrance offset before measuring physical glyph anchors.
    workTitle.style.transform = 'none';
    const canvas = hero.canvas.getBoundingClientRect(), stageRect = heroStage.getBoundingClientRect();
    const scale = Math.min(canvas.width / 1920, canvas.height / 1080);
    const heroLocal = { x: canvas.left + (canvas.width - 1920 * scale) / 2, y: canvas.top - stageRect.top + (canvas.height - 1080 * scale) / 2, scale };
    const heroAnchor = hero.renderer.anchors().hero;
    const stops = [{ id: 'hero', at: heroEnd, point: { x: heroLocal.x + heroAnchor.x * scale, y: heroEnd + heroLocal.y + heroAnchor.y * scale, radius: heroAnchor.radius * scale } }];
    stops.push({ id: 'hero-hold', at: timeline.heroHoldEnd, point: { ...stops[0].point, y: timeline.heroHoldEnd + heroLocal.y + heroAnchor.y * scale } });
    // Match the two glyph counters in the same sticky composition.
    $('.ah-impact').style.transform = 'none';
    const letter = point($('.ah-built-dock')), percent = point($('.ah-percent-dock'));
    if (!still()) $('.ah-impact').style.transform = `translateY(${letter.y - percent.y}px)`;
    const metric = localPoint($('.ah-percent-dock'), workStage);
    const workStageTop = workStage.getBoundingClientRect().top;
    const workLane = Math.max(header.offsetHeight + 22, Math.min(workTitle.querySelector('h2').getBoundingClientRect().top, $('.ah-impact strong').getBoundingClientRect().top) - workStageTop - 26);
    stops.push(...motion.workStops(localPoint($('.ah-built-dock'), workStage), metric, workStart, workSpan));
    const list = $('.ah-tool-list'), listRect = list.getBoundingClientRect(), toolRect = toolsStage.getBoundingClientRect();
    const tools = {
      start: timeline.toolsStart, end: timeline.toolsEnd,
      source: metric,
      rows: rows.map(row => localPoint(row.querySelector('.ah-row-dock'), toolsStage, radius)),
      exit: localPoint($('.ah-tools-exit'), toolsStage, radius),
      listY: listRect.top - toolRect.top + list.clientTop,
      rowHeight: rows[0].getBoundingClientRect().height,
    };
    stops.push({ id: 'tools-start', at: tools.start, point: { ...tools.source, y: tools.source.y + tools.start } });
    stops.push({ id: 'tools-end', at: tools.end, point: { ...tools.exit, y: tools.exit.y + tools.end } });
    const bridgeBox = bounds($('.ah-transition'));
    const add = (id, p, at) => { const previous = stops.at(-1); const stop = { id, point: p, at: Math.max(at, previous.at + 1) }; stops.push(stop); return stop; };
    const shapeStart = Math.max(tools.end + height * .3, bridgeBox.top - height * .6);
    add('shape-in', { x: width * .5, y: shapeStart + height * .5, radius }, shapeStart);
    const researchStart = bounds(researchSequence).top, researchEnd = researchStart + height * 2.4;
    if (!still()) researchSequence.style.height = (height * 2.4 + researchStage.offsetHeight) + 'px';
    else researchSequence.style.removeProperty('height');
    const researchRect = researchStage.getBoundingClientRect(), arcRect = $('.ah-research-arc svg').getBoundingClientRect(), arcScale = arcRect.width / 520;
    const research = { start: researchStart, end: researchEnd,
      nodes: [...document.querySelectorAll('.ah-topic-dock')].map(element => localPoint(element, researchStage, radius)),
      papers: [...document.querySelectorAll('.ah-paper-dock')].map(element => localPoint(element, researchStage, radius)),
      rail: { cx: arcRect.left + 260 * arcScale, cy: arcRect.top - researchRect.top + 270 * arcScale, rx: 190 * arcScale, ry: 160 * arcScale },
      nodeAngles: [Math.PI, Math.PI * 4 / 3, Math.PI * 5 / 3, Math.PI * 2],
      paperLane: arcRect.bottom - researchRect.top + 12,
    };
    add('research', { ...research.nodes[0], y: research.nodes[0].y + researchStart }, researchStart);
    const secondPaper = { ...research.papers[1], y: research.papers[1].y + researchEnd };
    add('research-end', secondPaper, researchEnd);
    add('paper-02-hold', secondPaper, researchEnd + height * .08);
    researchStage.dataset.start = researchStart.toFixed(2); researchStage.dataset.end = researchEnd.toFixed(2);
    const blog = point($('.ah-blog-dock'), radius), blogStop = add('blog', blog, blog.y - height * .48);
    add('blog-hold', blog, blogStop.at + height * .15);
    document.querySelectorAll('.ah-principle-dock').forEach((element, index) => {
      const p = point(element, radius), stop = add('principle-' + index, p, p.y - height * .46);
      add('principle-' + index + '-hold', p, stop.at + height * .07);
    });
    const contact = point($('.ah-contact-dock'), 1.1), maxScroll = document.documentElement.scrollHeight - height;
    const closing = { start: stops.at(-1).at, end: maxScroll - 24,
      source: stops.at(-1).point, target: contact, laneY: bounds($('.ah-closing')).top + 28 };
    stops.push({ id: 'contact', point: contact, at: closing.end });
    $('.ah-closing').dataset.start = closing.start.toFixed(2); $('.ah-closing').dataset.end = closing.end.toFixed(2);
    $('#ah-work').style.top = (workStart - openingTop + workSpan * .13) + 'px';
    $('#ah-tools').style.top = (tools.start - openingTop + height * .95) + 'px';
    // Native hash targets remain useful even with absolute scene layers.
    if (still()) {
      workSequence.before($('#ah-work'));
      toolsStage.before($('#ah-tools'));
    } else {
      opening.prepend($('#ah-work'), $('#ah-tools'));
    }
    sections.forEach(item => item.top = bounds(item.element).top);
    geometry = { stops, tools, research, closing, workLane, timeline, width, height, heroLocal, heroStart: openingTop, heroEnd, workStart, workSpan, origin: bounds(home).top, researchTop: researchStart, aboutTop: bounds($('.ah-personal')).top };
    queue();
  }
  function paintHero(time) {
    const key = time.toFixed(5) + '/' + document.body.dataset.language + '/' + still();
    if (key !== hero.last) {
      hero.state = hero.renderer.seek(time, { lang: document.body.dataset.language, embedded: true, actor: still() });
      hero.last = key;
    }
    return hero.state;
  }
  function paintTools(progress, flow) {
    const f = approved.toolsFrame(progress, geometry.tools), g = geometry.tools;
    const selection = $('.ah-selection');
    selection.style.height = g.rowHeight + 'px';
    selection.style.transform = `translate3d(0,${f.selectionY - g.listY - g.rowHeight / 2}px,0)`;
    selection.style.opacity = f.selectionOpacity;
    $('.ah-tools-current').style.opacity = flow.toolsTitle;
    $('.ah-tools-current').style.transform = `translate3d(0,${(1 - f.introOpacity) * 24}px,0)`;
    $('.ah-tools-current').inert = flow.toolsTitle < .05 && !still();
    $('.ah-tools-list-wrap').style.opacity = flow.toolsList;
    // Leave the landing corridor clear, especially in the stacked phone
    // layout. The first explanation appears as the dot reaches row 01.
    document.querySelectorAll('.ah-step-notes,.ah-tools-head,.ah-tools-fact,.ah-tools-current>.ah-case-link').forEach(element => element.style.opacity = still() ? 1 : flow.toolsContext);
    $('.ah-tools-current>.ah-case-link').inert = !still() && flow.toolsContext < .05;
    $('.ah-tools-next').style.opacity = flow.toolsList * (.18 + .82 * f.nextOpacity);
    rows.forEach((row, index) => {
      const color = Math.round(18 + 222 * clamp(1 - Math.abs(f.position - index)) * f.selectionOpacity);
      row.style.color = `rgb(${color},${color},${color})`;
      row.querySelector('button').setAttribute('aria-pressed', String(f.phase === 'scan' && f.active === index));
      const opacity = motion.ease((1 - Math.abs(f.position - index) - .62) / .38);
      notes[index].style.opacity = opacity;
      notes[index].style.transform = `translate3d(0,${(index - f.position) * 14}px,0)`;
      notes[index].setAttribute('aria-hidden', String(f.active !== index));
    });
    toolsStage.dataset.phase = f.phase; toolsStage.dataset.row = f.active + 1; toolsStage.dataset.progress = progress.toFixed(5);
  }
  function layer(element, visible) {
    element.style.visibility = visible ? 'visible' : 'hidden';
    element.inert = !visible;
    element.setAttribute('aria-hidden', String(!visible));
  }
  function paintOpening(flow) {
    const staticMode = still();
    layer(film, staticMode || flow.hero > .001);
    layer($('.ah-work'), staticMode || flow.workTitle + flow.workContext + flow.metric > .001);
    layer(toolsSequence, staticMode || flow.toolsTitle + flow.toolsList > .001);
    $('.ah-film-frame').style.opacity = flow.hero;
    $('.ah-hero-bottom').style.opacity = flow.heroContext;
    $('.ah-film-top').style.opacity = flow.heroContext;
    workTitle.style.opacity = flow.workTitle;
    workTitle.style.transform = `translateY(${flow.workTitleY}px)`;
    workTitle.querySelectorAll(':scope>.ah-eyebrow,:scope>p').forEach(element => element.style.opacity = flow.workContext);
    $('.ah-impact').style.opacity = flow.metric;
    $('.ah-policy').style.opacity = flow.workContext;
    $('.ah-work-composition>.ah-case-link').style.opacity = flow.workContext;
    $('.ah-work-composition>.ah-case-link').inert = !staticMode && flow.workContext < .05;
    $('.ah-scene-caption').style.opacity = flow.workContext;
    openingStage.dataset.handoff = flow.handoff;
  }
  function paintResearch(progress, staticMode) {
    const f = motion.researchFrame(progress, geometry.research);
    document.querySelectorAll('.ah-topic').forEach((element, i) => element.style.setProperty('--topic-weight', staticMode ? 1 : f.nodeWeights[i]));
    document.querySelectorAll('.ah-paper').forEach((element, i) => element.style.setProperty('--paper-weight', staticMode ? 1 : f.paperWeights[i]));
    const index = Math.max(0, f.activeNode), topic = topics[index];
    $('.ah-topic-index').textContent = f.activeNode < 0 ? 'RESEARCH / IN PRACTICE' : `0${index + 1} / ${topic[0]}`;
    $('.ah-topic-title').textContent = f.activeNode < 0 ? ui('把问题变成证据', 'Questions into evidence') : ui(topic[1], topic[2]);
    $('.ah-topic-detail').textContent = f.activeNode < 0 ? ui('继续阅读我的研究。', 'Read the research behind the work.') : ui(topic[3], topic[4]);
    $('.ah-orbit-progress').style.strokeDashoffset = 1 - f.nodeProgress / 3;
    researchStage.dataset.topic = f.activeNode < 0 ? 'papers' : topic[0];
    researchStage.dataset.progress = progress.toFixed(5);
  }
  function paintContact(shaft = 1, head = 1) {
    const end = 10 * shaft, arm = 17 * head;
    $('.ah-contact-shaft').setAttribute('d', `M${-end} ${end}L${end} ${-end}`);
    $('.ah-contact-head').setAttribute('d', `M${end - arm} ${-end}H${end}V${-end + arm}`);
    $('.ah-contact-dock').style.opacity = shaft;
  }
  function render() {
    frame = 0;
    if (!geometry || home.hidden || document.hidden) return;
    const { stops, tools, height, heroLocal } = geometry;
    const at = id => stops.find(s => s.id === id).at;
    const staticMode = still(), heroTime = staticMode ? 2.05 : clamp((scrollY - geometry.heroStart) / (geometry.heroEnd - geometry.heroStart)) * 2.35;
    const flow = composition.openingFrame(scrollY, geometry.timeline);
    if (flow.hero > 0 || staticMode) paintHero(heroTime);
    paintOpening(flow);
    film.dataset.time = heroTime.toFixed(3);
    const workP = clamp((scrollY - geometry.workStart) / geometry.workSpan);
    const work = composition.workFrame(staticMode ? 1 : workP);
    const jumpP = clamp((scrollY - at('built-hold')) / (at('percent') - at('built-hold')));
    const captionVisibility = staticMode ? 1 : 1 - motion.ease(jumpP / .07) * (1 - motion.ease((jumpP - .93) / .07));
    workTitle.querySelector(':scope>.ah-eyebrow').style.opacity = flow.workContext * captionVisibility;
    $('.ah-impact>.ah-eyebrow').style.opacity = captionVisibility;
    document.querySelectorAll('.ah-impact p,.ah-impact small').forEach(element => element.style.opacity = .35 + .65 * work.result);
    policy.forEach((element, i) => {
      element.style.setProperty('--policy-fill', work.policy[i]);
      element.style.opacity = .36 + .64 * work.policy[i];
      element.style.transform = `translateY(${(1 - work.policy[i]) * 14}px)`;
    });
    paintTools(flow.toolProgress, flow);
    const bridgeP = clamp((scrollY - at('shape-in')) / (at('research') - at('shape-in')));
    $('.ah-transition').dataset.dark = String(bridgeP >= .73);
    header.dataset.tone = bridgeP >= .73 && scrollY < geometry.aboutTop - 60 ? 'dark' : 'light';
    paintResearch(clamp((scrollY - geometry.research.start) / (geometry.research.end - geometry.research.start)), staticMode);
    if (!staticMode) {
      let result;
      if (scrollY <= geometry.heroEnd) {
        const state = paintHero(heroTime);
        const stageY = clamp(scrollY, geometry.heroStart, tools.end);
        result = { point: { x: heroLocal.x + state.dot.x * heroLocal.scale, y: stageY + heroLocal.y + state.dot.y * heroLocal.scale, radius: state.radius * heroLocal.scale }, phase: 'hero' };
      } else result = composition.siteFrame(scrollY, geometry);
      const p = result.point, y = p.y - geometry.origin;
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', y); dot.setAttribute('r', p.radius);
      dot.style.opacity = result.dotOpacity ?? 1;
      dot.setAttribute('transform', `translate(${p.x} ${y}) scale(${p.scaleX ?? 1} ${p.scaleY ?? 1}) translate(${-p.x} ${-y})`);
      bridgeArt.setAttribute('transform', `translate(0 ${scrollY - geometry.origin})`);
      bridgeRenderer.render(result.bridge, document.body.dataset.language);
      // The normal black tittle returns only after the orange actor leaves it.
      const built = stops.find(s => s.id === 'built');
      const builtY = built.point.y - built.at + clamp(scrollY, geometry.heroStart, tools.end);
      $('.ah-built-dock').style.opacity = clamp((Math.hypot(p.x - built.point.x, p.y - builtY) - built.point.radius * 2) / 22);
      paintContact(result.closing?.shaft ?? 0, result.closing?.head ?? 0);
      $('.ah-closing').dataset.progress = (result.closing?.progress ?? 0).toFixed(5);
      thread.dataset.phase = result.phase; thread.dataset.x = p.x.toFixed(2); thread.dataset.y = (p.y - scrollY).toFixed(2); thread.dataset.radius = p.radius.toFixed(2);
    } else paintContact();
    let current = sections[0];
    sections.forEach(item => { if (item.top < scrollY + height * .48) current = item; });
    sections.forEach(item => { if (item === current) item.link.setAttribute('aria-current', 'location'); else item.link.removeAttribute('aria-current'); });
  }
  function queue() { if (!frame && !home.hidden && !document.hidden) frame = requestAnimationFrame(render); }
  function setMode(reset = false) {
    const staticMode = still();
    document.body.dataset.ahMotion = staticMode ? 'static' : 'scroll'; film.dataset.mode = staticMode ? 'static' : 'film';
    document.documentElement.style.scrollBehavior = staticMode ? 'auto' : '';
    mode.setAttribute('aria-pressed', String(staticMode)); mode.disabled = media.matches || failed;
    mode.textContent = failed ? ui('静态阅读', 'Static reading') : staticMode ? ui('开启动效', 'Enable motion') : ui('减少动态', 'Reduce motion');
    if (staticMode) paintContact();
    rows.forEach(row => row.querySelector('button').disabled = staticMode);
    if (staticMode) $('.ah-tools-current').inert = false;
    if (staticMode) for (const element of [film, $('.ah-work'), toolsSequence]) layer(element, true);
    if (reset) scrollTo({ top: 0, behavior: 'instant' });
    measure();
  }
  function setLanguage(lang, write = false) {
    document.body.dataset.language = lang; document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    language.textContent = lang === 'en' ? '中' : 'EN'; language.setAttribute('aria-label', lang === 'en' ? '切换中文界面' : 'Switch to English');
    if (write) { const url = new URL(location.href); url.searchParams.set('lang', lang); history.replaceState(history.state, '', url); }
    document.dispatchEvent(new CustomEvent('prototype:language')); setMode();
  }
  language.addEventListener('click', () => setLanguage(document.body.dataset.language === 'en' ? 'zh' : 'en', true));
  addEventListener('popstate', () => setLanguage(new URL(location.href).searchParams.get('lang') === 'en' ? 'en' : 'zh'));
  mode.addEventListener('click', () => { manual = !manual; setMode(true); });
  media.addEventListener('change', () => setMode());
  $('[data-ah-replay]').addEventListener('click', () => scrollTo({ top: 0, behavior: 'instant' }));
  document.querySelectorAll('[data-ah-case]').forEach(link => link.addEventListener('click', () => { document.getElementById(link.dataset.ahCase).open = true; }));
  document.querySelectorAll('.ah-project').forEach(project => project.addEventListener('toggle', () => {
    const label = project.querySelector('.ah-project-open');
    label.dataset.uiZh = project.open ? '收起项目 −' : '展开我的工作 +'; label.dataset.uiEn = project.open ? 'Close the project −' : 'Inside the project +';
    label.textContent = ui(label.dataset.uiZh, label.dataset.uiEn); measure();
  }));
  addEventListener('scroll', queue, { passive: true }); addEventListener('resize', measure, { passive: true });
  document.addEventListener('prototype:view', () => {
    cancelAnimationFrame(frame); frame = 0; header.dataset.tone = 'light';
    const brand = $('.ah-brand');
    if (document.body.dataset.view === 'home') brand.setAttribute('aria-current', 'page'); else brand.removeAttribute('aria-current');
    if (!home.hidden) requestAnimationFrame(measure);
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else measure(); });
  async function connect() {
    try {
      [motion, composition, approved, bridgeModule] = await Promise.all([import('./ah-journey.mjs'), import('./ah-site-motion.mjs'), import('../storyboard-v3/tools-motion.mjs'), import('./ah-bridge.mjs')]);
      bridgeRenderer = bridgeModule.createBridge(bridgeArt);
      const response = await fetch('./creative/ah-film.html');
      if (!response.ok) throw new Error('Motion source unavailable');
      const doc = new DOMParser().parseFromString(await response.text(), 'text/html');
      const source = doc.querySelector('script[data-film-renderer]');
      if (!source) throw new Error('Motion renderer unavailable');
      const script = document.createElement('script'); script.textContent = source.textContent; document.body.append(script);
      hero.renderer = window.createOrangeFilm(hero.canvas, { embedded: true }); await hero.renderer.ready;
      film.dataset.state = 'ready'; document.body.dataset.ahReady = 'true';
      resizeObserver = new ResizeObserver(measure); resizeObserver.observe(home);
      measure();
    } catch (error) {
      failed = true; film.dataset.state = 'fallback'; document.body.dataset.ahReady = 'false'; setMode();
      console.warn('AH motion could not load; the portfolio remains available.', error);
    }
  }
  for (const [tag, attribute, path] of [['link', 'href', './creative/ah-reading.css'], ['script', 'src', './creative/ah-reading.js'], ['script', 'src', './creative/ah-navigation.js']]) {
    const element = document.createElement(tag); element[attribute] = path; if (tag === 'link') element.rel = 'stylesheet'; document.head.append(element);
  }
  connect(); setLanguage(new URL(location.href).searchParams.get('lang') === 'en' ? 'en' : 'zh');
  document.fonts.ready.then(measure);
  addEventListener('pagehide', () => { cancelAnimationFrame(frame); frame = 0; }); addEventListener('pageshow', measure);
})();
