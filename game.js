/* ============================================================
 * 猪了个猪  ——  消砖领小猪
 * ============================================================ */
(function () {
  'use strict';

  var $ = function (s) { return document.querySelector(s); };

  /* ---------------- 常量配置 ---------------- */
  var SAVE_KEY = 'zlgz_pig_save_v1';
  var TILE = 54;          // 砖块边长（逻辑像素）
  var HIT_PAD = 6;        // 遮挡判定内缩
  var SLOT_MAX = 7;

  // 砖块图案（农场主题）
  var EMOJIS = ['🐷', '🐮', '🐔', '🐑', '🌽', '🥕', '🍎', '🍆', '🌶️', '🥬', '🍄', '🌰'];

  // 小猪配色库：每个色系有专属品种名和名字池，随机叠加斑纹/配饰/眼睛 => 每头都独一无二
  var PIG_PALETTES = [
    { label: '小粉猪',  hue: 340, sat: 62, light: 80, names: ['嘟嘟','团团','粉团','桃桃','糯糯','奶盖','汤圆','莓莓','樱花','布丁'] },
    { label: '奶油猪',  hue: 42,  sat: 52, light: 84, names: ['奶油','曲奇','年糕','麻薯','奶糖','栗子','泡芙'] },
    { label: '薄荷猪',  hue: 152, sat: 42, light: 80, names: ['薄荷','青团','抹茶','小豆','青提','艾草'] },
    { label: '天空猪',  hue: 200, sat: 52, light: 80, names: ['云朵','海蓝','泡泡','晴空','奶蓝','海盐'] },
    { label: '丁香猪',  hue: 272, sat: 42, light: 78, names: ['丁香','葡萄','芋圆','紫米','薰衣草','蓝莓'] },
    { label: '焦糖猪',  hue: 28,  sat: 42, light: 72, names: ['焦糖','可可','咖啡','榛果','摩卡','红糖'] },
    { label: '黑金猪',  hue: 45,  sat: 80, light: 64, names: ['金宝','金豆','元宝','旺财','富贵','金条'] },
    { label: '夜影猪',  hue: 258, sat: 22, light: 56, names: ['墨墨','夜影','幽蓝','星尘','月影','黑曜石'] }
  ];

  var _pigUid = 0;
  // 生成独一无二的小猪 SVG（配色、斑纹、配饰、眼睛、腮红全部随机）
  function pigSVG(a) {
    if (!a) a = defaultPigAttrs();
    var uid = 'pc' + (_pigUid++);
    var clipId = 'clip' + uid;

    var pat = '';
    if (a.pattern === 'spots') {
      pat = '<g clip-path="url(#' + clipId + ')">' +
        '<circle cx="36" cy="42" r="4" fill="' + a.patternColor + '" opacity=".7"/>' +
        '<circle cx="62" cy="38" r="3.4" fill="' + a.patternColor + '" opacity=".7"/>' +
        '<circle cx="50" cy="32" r="3" fill="' + a.patternColor + '" opacity=".7"/>' +
        '<circle cx="44" cy="60" r="3" fill="' + a.patternColor + '" opacity=".7"/></g>';
    } else if (a.pattern === 'stripes') {
      pat = '<g clip-path="url(#' + clipId + ')" fill="' + a.patternColor + '" opacity=".5">' +
        '<rect x="31" y="26" width="5" height="40" rx="2.5"/>' +
        '<rect x="45" y="22" width="5" height="46" rx="2.5"/>' +
        '<rect x="59" y="26" width="5" height="40" rx="2.5"/></g>';
    } else if (a.pattern === 'heart') {
      pat = '<g clip-path="url(#' + clipId + ')" fill="' + a.patternColor + '" opacity=".7">' +
        '<path d="M34,44 c-2,-3 -6,-3 -6,1 c0,4 6,7 6,7 s6,-3 6,-7 c0,-4 -4,-4 -6,-1 z"/>' +
        '<path d="M62,40 c-2,-3 -6,-3 -6,1 c0,4 6,7 6,7 s6,-3 6,-7 c0,-4 -4,-4 -6,-1 z"/></g>';
    }

    var ears =
      '<path d="M22,33 L15,15 L33,27 Z" fill="' + a.ear + '"/>' +
      '<path d="M78,33 L85,15 L67,27 Z" fill="' + a.ear + '"/>' +
      '<path d="M24,31 L20,21 L30,26 Z" fill="' + a.body + '" opacity=".55"/>' +
      '<path d="M76,31 L80,21 L70,26 Z" fill="' + a.body + '" opacity=".55"/>';

    var eyes = '';
    if (a.eye === 'happy') {
      eyes = '<path d="M35,51 q4,-5 8,0" stroke="#3a2e44" stroke-width="2.6" fill="none" stroke-linecap="round"/>' +
             '<path d="M57,51 q4,-5 8,0" stroke="#3a2e44" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    } else if (a.eye === 'sleepy') {
      eyes = '<path d="M35,51 L43,51" stroke="#3a2e44" stroke-width="2.6" stroke-linecap="round"/>' +
             '<path d="M57,51 L65,51" stroke="#3a2e44" stroke-width="2.6" stroke-linecap="round"/>';
    } else if (a.eye === 'wink') {
      eyes = '<circle cx="39" cy="50" r="4" fill="#3a2e44"/>' +
             '<circle cx="40.4" cy="48.8" r="1.4" fill="#fff"/>' +
             '<path d="M57,51 q4,-5 8,0" stroke="#3a2e44" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    } else {
      eyes = '<circle cx="39" cy="50" r="4" fill="#3a2e44"/>' +
             '<circle cx="61" cy="50" r="4" fill="#3a2e44"/>' +
             '<circle cx="40.4" cy="48.8" r="1.4" fill="#fff"/>' +
             '<circle cx="62.4" cy="48.8" r="1.4" fill="#fff"/>';
    }

    var cheeks = a.blush
      ? '<circle cx="27" cy="63" r="5.5" fill="#ff9bb3" opacity=".55"/>' +
        '<circle cx="73" cy="63" r="5.5" fill="#ff9bb3" opacity=".55"/>'
      : '';

    var snout =
      '<ellipse cx="50" cy="66" rx="13" ry="9.5" fill="' + a.snout + '"/>' +
      '<ellipse cx="45" cy="66" rx="2" ry="2.7" fill="#c96a82"/>' +
      '<ellipse cx="55" cy="66" rx="2" ry="2.7" fill="#c96a82"/>';

    var acc = '';
    if (a.accessory === 'bow') {
      acc = '<g transform="translate(50,22)">' +
        '<path d="M0,0 L-11,-8 L-11,8 Z" fill="' + a.accessoryColor + '"/>' +
        '<path d="M0,0 L11,-8 L11,8 Z" fill="' + a.accessoryColor + '"/>' +
        '<circle cx="0" cy="0" r="2.6" fill="' + a.accessoryColor + '" opacity=".7"/></g>';
    } else if (a.accessory === 'hat') {
      acc = '<g transform="translate(50,20)">' +
        '<rect x="-15" y="-2" width="30" height="4.5" rx="2" fill="' + a.accessoryColor + '"/>' +
        '<rect x="-9" y="-15" width="18" height="15" rx="2.5" fill="' + a.accessoryColor + '"/></g>';
    } else if (a.accessory === 'glasses') {
      acc = '<g fill="none" stroke="' + a.accessoryColor + '" stroke-width="2.4">' +
        '<circle cx="39" cy="50" r="8.5"/><circle cx="61" cy="50" r="8.5"/>' +
        '<path d="M47.5,50 L52.5,50"/></g>';
    } else if (a.accessory === 'flower') {
      acc = '<g transform="translate(68,24)">' +
        '<circle cx="0" cy="-5.5" r="4.2" fill="' + a.accessoryColor + '"/>' +
        '<circle cx="5.5" cy="0" r="4.2" fill="' + a.accessoryColor + '"/>' +
        '<circle cx="-5.5" cy="0" r="4.2" fill="' + a.accessoryColor + '"/>' +
        '<circle cx="0" cy="5.5" r="4.2" fill="' + a.accessoryColor + '"/>' +
        '<circle cx="0" cy="0" r="3" fill="#ffd86b"/></g>';
    } else if (a.accessory === 'crown') {
      acc = '<g transform="translate(50,17)">' +
        '<path d="M-14,5 L-14,-7 L-8,-1 L0,-11 L8,-1 L14,-7 L14,5 Z" fill="' + a.accessoryColor + '" stroke="#b8893a" stroke-width="1"/>' +
        '<circle cx="0" cy="-9" r="2.2" fill="#ff6b9d"/></g>';
    } else if (a.accessory === 'scarf') {
      acc = '<path d="M18,80 Q50,94 82,80 L80,90 Q50,102 20,90 Z" fill="' + a.accessoryColor + '"/>' +
        '<rect x="63" y="85" width="11" height="16" rx="3" fill="' + a.accessoryColor + '"/>';
    }

    return '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">' +
      '<defs><clipPath id="' + clipId + '"><ellipse cx="50" cy="54" rx="33" ry="29"/></clipPath></defs>' +
      ears +
      '<ellipse cx="50" cy="54" rx="33" ry="29" fill="' + a.body + '"/>' +
      pat + cheeks + snout + eyes + acc +
      '</svg>';
  }

  function defaultPigAttrs() {
    return {
      body: 'hsl(340,62%,80%)', ear: 'hsl(340,62%,62%)', snout: 'hsl(340,72%,86%)',
      pattern: 'none', patternColor: 'hsl(340,62%,55%)',
      accessory: 'none', accessoryColor: '',
      eye: 'normal', blush: true
    };
  }

  // 兼容旧存档：没有 attrs 的老猪补成默认小粉猪
  function ensurePigAttrs(pig) {
    if (!pig.attrs) pig.attrs = defaultPigAttrs();
    return pig;
  }

  /* ---------------- 存档 ---------------- */
  function defaultSave() { return { pigs: [], level: 1, sfx: true, music: true }; }
  function loadSave() {
    try {
      var s = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (s && typeof s === 'object') {
        var pigs = (s.pigs || []).map(function (p) { return ensurePigAttrs(p); });
        // 兼容旧版 muted 字段
        var sfx = (s.sfx === undefined) ? !s.muted : !!s.sfx;
        return { pigs: pigs, level: s.level || 1, sfx: sfx, music: s.music === undefined ? true : !!s.music };
      }
    } catch (e) {}
    return defaultSave();
  }
  var save = loadSave();
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }

  /* ============================================================
   * 音频系统（Web Audio 程序化合成，无需外部资源）
   *   - 双总线：sfxBus（音效）/ musicBus（背景音乐）
   *   - 首次用户手势解锁 AudioContext
   * ============================================================ */
  var AC = null;
  var sfxBus = null, musicBus = null;
  var audioReady = false;

  function ac() {
    if (!AC) {
      try {
        AC = new (window.AudioContext || window.webkitAudioContext)();
        sfxBus = AC.createGain();
        sfxBus.gain.value = 0.5;
        sfxBus.connect(AC.destination);
        musicBus = AC.createGain();
        musicBus.gain.value = save.music ? 0.32 : 0;
        musicBus.connect(AC.destination);
        audioReady = true;
      } catch (e) { return null; }
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }

  // 首次任意交互解锁音频并启动 BGM
  function unlockAudio() {
    ac();
    if (save.music) startBgm();
    document.removeEventListener('pointerdown', unlockAudio);
    document.removeEventListener('keydown', unlockAudio);
  }

  // 基础合成音：freq 频率 / dur 时长 / type 波形 / vol 音量 / delay 延迟 / dest 目标总线
  function tone(freq, dur, type, vol, delay, dest) {
    var ctx = ac(); if (!ctx) return;
    var t = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'triangle';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.12));
    o.connect(g); g.connect(dest || sfxBus);
    o.start(t); o.stop(t + (dur || 0.12) + 0.02);
  }

  // 噪声爆破（用于点击被压砖块的"嗡"声）
  function noiseBurst(dur, vol, delay) {
    var ctx = ac(); if (!ctx) return;
    var t = ctx.currentTime + (delay || 0);
    var len = Math.floor(ctx.sampleRate * (dur || 0.1));
    var buf = ctx.createBuffer(1, len, ctx.sampleRate);
    var data = buf.getChannelData(0);
    for (var i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    var src = ctx.createBufferSource();
    src.buffer = buf;
    var filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 900;
    var g = ctx.createGain();
    g.gain.setValueAtTime(vol || 0.12, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + (dur || 0.1));
    src.connect(filt); filt.connect(g); g.connect(sfxBus);
    src.start(t);
  }

  /* ---------- 音效 ---------- */
  var snd = {
    tap: function () {
      if (!save.sfx) return;
      tone(660, 0.08, 'triangle', 0.16);
      tone(990, 0.06, 'sine', 0.08, 0.01);
    },
    block: function () {
      if (!save.sfx) return;
      noiseBurst(0.12, 0.1);
      tone(160, 0.14, 'sawtooth', 0.06);
    },
    match: function () {
      if (!save.sfx) return;
      // 上行琶音 C-E-G-C
      [523, 659, 784, 1047].forEach(function (f, i) {
        tone(f, 0.16, 'triangle', 0.14, i * 0.07);
      });
    },
    prop: function () {
      if (!save.sfx) return;
      tone(523, 0.09, 'sine', 0.12);
      tone(784, 0.12, 'sine', 0.12, 0.07);
      tone(1047, 0.14, 'sine', 0.1, 0.14);
    },
    win: function () {
      if (!save.sfx) return;
      // 胜利号角 C-E-G-C-E-G
      [523, 659, 784, 1047, 1319, 1568].forEach(function (f, i) {
        tone(f, 0.22, 'triangle', 0.15, i * 0.11);
        tone(f / 2, 0.22, 'sine', 0.08, i * 0.11);
      });
    },
    lose: function () {
      if (!save.sfx) return;
      [440, 392, 330, 262].forEach(function (f, i) {
        tone(f, 0.26, 'sawtooth', 0.1, i * 0.16);
      });
    }
  };

  /* ---------- 背景音乐：前瞻调度循环 ---------- */
  var bgm = {
    playing: false,
    timer: null,
    step: 0,
    nextTime: 0,
    tempo: 96,            // BPM
    // C 大调五声音阶旋律（半音偏移，null 为休止）
    melody: [0, 4, 7, 9, 7, 4, 2, 0, 4, 7, 11, 9, 7, 4, 2, 0],
    // 低音（每 4 步一个）
    bass: [-12, -12, -5, -7]
  };

  function midiToFreq(midi) { return 440 * Math.pow(2, (midi - 69) / 12); }

  function scheduleBgmStep(step, time) {
    // 旋律
    var semi = bgm.melody[step];
    if (semi !== null) {
      tone(midiToFreq(72 + semi), 0.26, 'triangle', 0.18, time, musicBus);
      // 柔和的八度叠加
      tone(midiToFreq(60 + semi), 0.3, 'sine', 0.06, time, musicBus);
    }
    // 低音
    if (step % 4 === 0) {
      var bs = bgm.bass[(step / 4) % bgm.bass.length];
      tone(midiToFreq(48 + bs), 0.55, 'sine', 0.22, time, musicBus);
    }
    // 轻打击（每 2 步）
    if (step % 2 === 1) {
      var ctx = ac();
      if (ctx) {
        var len = Math.floor(ctx.sampleRate * 0.05);
        var buf = ctx.createBuffer(1, len, ctx.sampleRate);
        var d = buf.getChannelData(0);
        for (var i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) * 0.5;
        var src = ctx.createBufferSource();
        src.buffer = buf;
        var hpf = ctx.createBiquadFilter();
        hpf.type = 'highpass';
        hpf.frequency.value = 4000;
        var g = ctx.createGain();
        g.gain.value = 0.05;
        src.connect(hpf); hpf.connect(g); g.connect(musicBus);
        src.start(time);
      }
    }
  }

  function bgmScheduler() {
    if (!bgm.playing) return;
    var ctx = ac(); if (!ctx) return;
    var stepDur = 60 / bgm.tempo / 2; // 八分音符
    while (bgm.nextTime < ctx.currentTime + 0.12) {
      scheduleBgmStep(bgm.step, bgm.nextTime);
      bgm.nextTime += stepDur;
      bgm.step = (bgm.step + 1) % bgm.melody.length;
    }
    bgm.timer = setTimeout(bgmScheduler, 25);
  }

  function startBgm() {
    var ctx = ac(); if (!ctx) return;
    if (bgm.playing) return;
    bgm.playing = true;
    bgm.step = 0;
    bgm.nextTime = ctx.currentTime + 0.08;
    bgmScheduler();
  }

  function stopBgm() {
    bgm.playing = false;
    if (bgm.timer) { clearTimeout(bgm.timer); bgm.timer = null; }
  }

  function setMusicVolume(on) {
    if (musicBus) {
      var ctx = ac();
      if (ctx) musicBus.gain.setTargetAtTime(on ? 0.32 : 0, ctx.currentTime, 0.1);
    }
  }

  /* ---------------- 页面元素 ---------------- */
  var homeScreen = $('#home'), gameScreen = $('#game');
  var boardEl = $('#board'), boardWrap = $('#boardWrap'), boardArea = $('#boardArea');
  var slotCells = Array.prototype.slice.call(document.querySelectorAll('.slot-cell'));
  var trayBar = $('#trayBar'), trayEl = $('#tray');

  var S = null; // 当前对局状态

  /* ---------------- 工具 ---------------- */
  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function showScreen(id) {
    homeScreen.classList.toggle('hidden', id !== 'home');
    gameScreen.classList.toggle('hidden', id !== 'game');
  }
  function openModal(id) { $('#' + id).classList.remove('hidden'); }
  function closeModal(el) { el.classList.add('hidden'); }

  /* ============================================================
   * 首页 & 小猪圈
   * ============================================================ */
  function renderHome() {
    $('#homeLevel').textContent = save.level;
    $('#pigCount').textContent = save.pigs.length;
    syncAudioIcons();

    var yard = $('#penYard');
    yard.innerHTML = '';
    if (save.pigs.length === 0) {
      yard.innerHTML = '<span class="pen-empty-hint">猪圈还空着，快去通关抱小猪吧～</span>';
    } else {
      var recent = save.pigs.slice(-10);
      recent.forEach(function (pig) {
        var sp = document.createElement('span');
        sp.className = 'mini-pig';
        sp.innerHTML = pigSVG(pig.attrs);
        yard.appendChild(sp);
      });
    }
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    var p = function (n) { return n < 10 ? '0' + n : '' + n; };
    return (d.getMonth() + 1) + '月' + d.getDate() + '日 ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  function openPen() {
    var stats = $('#penStats');
    var grid = $('#penGrid');
    stats.innerHTML = '';
    grid.innerHTML = '';

    var total = document.createElement('span');
    total.className = 'stat-chip';
    total.innerHTML = '共 <b style="color:#b07cc6;margin:0 3px">' + save.pigs.length + '</b> 头';
    stats.appendChild(total);

    // 按品种统计
    var labelCount = {};
    save.pigs.forEach(function (p) { labelCount[p.label || '小粉猪'] = (labelCount[p.label || '小粉猪'] || 0) + 1; });
    Object.keys(labelCount).forEach(function (lb) {
      var chip = document.createElement('span');
      chip.className = 'stat-chip';
      chip.textContent = lb + ' ×' + labelCount[lb];
      stats.appendChild(chip);
    });

    if (save.pigs.length === 0) {
      grid.innerHTML = '<div class="empty-pen">猪圈空空如也<br>通关第一关就能抱回小猪啦！</div>';
    } else {
      save.pigs.slice().reverse().forEach(function (pig, idx) {
        var card = document.createElement('div');
        card.className = 'pig-card' + (idx === 0 ? ' is-new' : '');
        card.innerHTML =
          '<div class="pig-face">' + pigSVG(pig.attrs) + '</div>' +
          '<div class="pig-name">' + pig.name + '</div>' +
          '<span class="pig-tag" style="background:' + (pig.color || '#b07cc6') + '">' + (pig.label || '小粉猪') + '</span>' +
          '<div class="pig-meta">第 ' + pig.level + ' 关获得<br>' + fmtTime(pig.time) + '</div>';
        grid.appendChild(card);
      });
    }
    openModal('penModal');
  }

  function rollPig(level) {
    var pal = PIG_PALETTES[Math.floor(Math.random() * PIG_PALETTES.length)];
    var hue = pal.hue + Math.floor(Math.random() * 30 - 15);
    var sat = pal.sat + Math.floor(Math.random() * 10 - 5);
    var light = pal.light;
    var body = 'hsl(' + hue + ',' + sat + '%,' + light + '%)';
    var ear = 'hsl(' + hue + ',' + sat + '%,' + Math.max(light - 18, 30) + '%)';
    var snout = 'hsl(' + hue + ',' + Math.min(sat + 12, 90) + '%,' + Math.min(light + 8, 92) + '%)';

    var patterns = ['none', 'none', 'none', 'spots', 'stripes', 'heart'];
    var pattern = patterns[Math.floor(Math.random() * patterns.length)];
    var patternColor = 'hsl(' + (hue + 28) + ',' + sat + '%,' + Math.max(light - 26, 28) + '%)';

    var accessories = ['none', 'none', 'none', 'none', 'bow', 'hat', 'glasses', 'flower', 'crown', 'scarf'];
    var accessory = accessories[Math.floor(Math.random() * accessories.length)];
    var accessoryColor = accessory === 'none' ? '' :
      'hsl(' + Math.floor(Math.random() * 360) + ',62%,60%)';

    var eyes = ['normal', 'normal', 'happy', 'sleepy', 'wink'];
    var eye = eyes[Math.floor(Math.random() * eyes.length)];

    var name = pal.names[Math.floor(Math.random() * pal.names.length)];

    return {
      id: Date.now() + '' + Math.floor(Math.random() * 1000),
      name: name,
      label: pal.label,
      color: 'hsl(' + hue + ',' + sat + '%,' + Math.max(light - 12, 38) + '%)',
      level: level,
      time: Date.now(),
      attrs: {
        body: body, ear: ear, snout: snout,
        pattern: pattern, patternColor: patternColor,
        accessory: accessory, accessoryColor: accessoryColor,
        eye: eye, blush: Math.random() < 0.72
      }
    };
  }

  /* ============================================================
   * 关卡生成
   * ============================================================ */
  function genLevel(level) {
    var layerCount = Math.min(3 + Math.floor((level - 1) / 2), 6);
    var cells = [];
    var L, r, c;
    for (L = 0; L < layerCount; L++) {
      var cols = Math.max(3, 7 - L);
      var rows = Math.max(3, 6 - L);
      var density = Math.max(0.55, 0.92 - L * 0.1);
      var ox = L === 0 ? 0 : (Math.floor(Math.random() * 3) - 1) * 0.5;
      var oy = L === 0 ? 0 : (Math.floor(Math.random() * 3) - 1) * 0.5;
      for (r = 0; r < rows; r++) {
        for (c = 0; c < cols; c++) {
          if (Math.random() < density) cells.push({ layer: L, gx: c + ox, gy: r + oy });
        }
      }
    }
    // 总数必须为 3 的倍数
    while (cells.length % 3 !== 0) cells.splice(Math.floor(Math.random() * cells.length), 1);

    var triples = cells.length / 3;
    var typeCount = Math.min(Math.max(4, Math.round(5 + (level - 1) * 1.1)), EMOJIS.length, triples);

    // 每种图案至少 1 组（3 块），其余随机分配
    var counts = [];
    for (var i = 0; i < typeCount; i++) counts.push(1);
    var left = triples - typeCount;
    while (left-- > 0) counts[Math.floor(Math.random() * typeCount)]++;

    var typeArr = [];
    counts.forEach(function (n, idx) {
      for (var k = 0; k < n * 3; k++) typeArr.push(EMOJIS[idx]);
    });
    shuffle(typeArr);

    var tiles = cells.map(function (cell, idx) {
      return {
        id: idx,
        type: typeArr[idx],
        layer: cell.layer,
        x: cell.gx * TILE,
        y: cell.gy * TILE,
        removed: false,
        blocked: false,
        el: null
      };
    });

    // 坐标归零
    var minX = Infinity, minY = Infinity;
    tiles.forEach(function (t) { minX = Math.min(minX, t.x); minY = Math.min(minY, t.y); });
    tiles.forEach(function (t) { t.x -= minX; t.y -= minY; });

    var w = 0, h = 0;
    tiles.forEach(function (t) { w = Math.max(w, t.x + TILE); h = Math.max(h, t.y + TILE); });
    return { tiles: tiles, w: w, h: h };
  }

  /* ============================================================
   * 对局流程
   * ============================================================ */
  function startLevel(level) {
    var data = genLevel(level);
    S = {
      level: level,
      tiles: data.tiles,
      slots: [],
      tray: [],
      history: [],          // 自上次消除以来放入木槽的砖块 id
      over: false,
      busy: false,
      powers: { undo: 3, shuffle: 1, out: 1 }
    };
    $('#gameLevel').textContent = level;
    trayEl.innerHTML = '';
    trayBar.classList.add('hidden');
    boardEl.innerHTML = '';
    boardEl.style.width = data.w + 'px';
    boardEl.style.height = data.h + 'px';

    S.tiles.forEach(function (t) {
      var el = document.createElement('div');
      el.className = 'tile';
      el.textContent = t.type;
      el.style.left = t.x + 'px';
      el.style.top = t.y + 'px';
      el.style.zIndex = t.layer * 100;
      el.addEventListener('click', function () { onTileClick(t); });
      t.el = el;
      boardEl.appendChild(el);
    });

    refreshBlocked();
    renderPowers();
    fitBoard();
  }

  function fitBoard() {
    var aw = boardArea.clientWidth - 12;
    var ah = boardArea.clientHeight - 6;
    var scale = Math.min(aw / boardEl.offsetWidth, ah / boardEl.offsetHeight, 1);
    boardWrap.style.transform = 'scale(' + scale + ')';
  }

  // 重新计算每块砖是否被上层砖块压住
  function refreshBlocked() {
    S.tiles.forEach(function (t) { t.blocked = false; });
    var alive = S.tiles.filter(function (t) { return !t.removed; });
    for (var i = 0; i < alive.length; i++) {
      var a = alive[i];
      for (var j = 0; j < alive.length; j++) {
        var b = alive[j];
        if (b.layer <= a.layer) continue;
        var hitX = Math.abs(a.x - b.x) < TILE - HIT_PAD;
        var hitY = Math.abs(a.y - b.y) < TILE - HIT_PAD;
        if (hitX && hitY) { a.blocked = true; break; }
      }
      a.el.classList.toggle('blocked', a.blocked);
    }
  }

  function onTileClick(tile) {
    if (!S || S.over || S.busy) return;
    if (tile.removed || tile.el.parentElement !== boardEl) return;
    if (tile.blocked) {
      tile.el.classList.remove('shake');
      void tile.el.offsetWidth;
      tile.el.classList.add('shake');
      snd.block();
      return;
    }
    moveToSlot(tile);
  }

  function moveToSlot(tile, fromTray) {
    tile.removed = true;
    tile.el.classList.remove('blocked');
    tile.el.classList.add('pop-in');
    setTimeout(function () { tile.el.classList.remove('pop-in'); }, 180);

    // 相同图案自动相邻摆放
    var idx = -1, i;
    for (i = 0; i < S.slots.length; i++) {
      if (S.slots[i].type === tile.type) idx = i;
    }
    S.slots.splice(idx + 1, 0, tile);
    if (!fromTray) S.history.push(tile.id);

    if (fromTray) {
      S.tray = S.tray.filter(function (t) { return t !== tile; });
      if (S.tray.length === 0) trayBar.classList.add('hidden');
    }
    layoutSlots();
    snd.tap();
    refreshBlocked();

    S.busy = true;
    setTimeout(resolveSlot, 130);
  }

  function layoutSlots() {
    S.slots.forEach(function (t, i) {
      // 清除牌桌遗留的行内定位，避免覆盖 inset:0 导致砖块在槽位外不可见
      t.el.style.left = '';
      t.el.style.top = '';
      t.el.style.zIndex = '';
      slotCells[i].appendChild(t.el);
    });
  }

  function resolveSlot() {
    // 找出达到 3 个的图案
    var map = {};
    S.slots.forEach(function (t) { map[t.type] = (map[t.type] || 0) + 1; });
    var matchType = null;
    for (var k in map) if (map[k] >= 3) { matchType = k; break; }

    if (!matchType) {
      S.busy = false;
      if (S.slots.length >= SLOT_MAX) gameOver(false);
      return;
    }

    var matched = S.slots.filter(function (t) { return t.type === matchType; }).slice(0, 3);
    matched.forEach(function (t) { t.el.classList.add('removing'); });
    snd.match();
    S.history = [];

    setTimeout(function () {
      matched.forEach(function (t) {
        if (t.el.parentNode) t.el.parentNode.removeChild(t.el);
      });
      S.slots = S.slots.filter(function (t) { return matched.indexOf(t) < 0; });
      layoutSlots();

      var boardLeft = S.tiles.some(function (t) { return !t.removed; });
      if (!boardLeft && S.slots.length === 0 && S.tray.length === 0) {
        gameOver(true);
      } else {
        S.busy = false;
        if (S.slots.length >= SLOT_MAX) gameOver(false);
      }
    }, 240);
  }

  function renderPowers() {
    $('#undoNum').textContent = '×' + S.powers.undo;
    $('#shuffleNum').textContent = '×' + S.powers.shuffle;
    $('#outNum').textContent = '×' + S.powers.out;
    $('#undoBtn').classList.toggle('disabled', S.powers.undo <= 0);
    $('#shuffleBtn').classList.toggle('disabled', S.powers.shuffle <= 0);
    $('#outBtn').classList.toggle('disabled', S.powers.out <= 0);
  }

  /* ---------- 道具：撤销 ---------- */
  function doUndo() {
    if (!S || S.over || S.busy || S.powers.undo <= 0 || S.history.length === 0) return;
    var id = S.history.pop();
    var pos = -1, tile = null;
    for (var i = 0; i < S.slots.length; i++) {
      if (S.slots[i].id === id) { tile = S.slots[i]; pos = i; break; }
    }
    if (!tile) return;
    S.slots.splice(pos, 1);
    tile.removed = false;
    // 恢复牌桌定位
    tile.el.style.left = tile.x + 'px';
    tile.el.style.top = tile.y + 'px';
    tile.el.style.zIndex = tile.layer * 100;
    boardEl.appendChild(tile.el);
    refreshBlocked();
    S.powers.undo--;
    renderPowers();
    snd.prop();
  }

  /* ---------- 道具：洗牌 ---------- */
  function doShuffle() {
    if (!S || S.over || S.busy || S.powers.shuffle <= 0) return;
    var onBoard = S.tiles.filter(function (t) { return !t.removed; });
    if (onBoard.length < 2) return;
    var types = shuffle(onBoard.map(function (t) { return t.type; }));
    onBoard.forEach(function (t, i) {
      t.type = types[i];
      t.el.textContent = t.type;
    });
    S.powers.shuffle--;
    renderPowers();
    snd.prop();
  }

  /* ---------- 道具：移出（暂存最后 3 块） ---------- */
  function doOut() {
    if (!S || S.over || S.busy || S.powers.out <= 0 || S.slots.length === 0) return;
    var n = Math.min(3, S.slots.length);
    var moved = S.slots.splice(S.slots.length - n, n);
    moved.forEach(function (t) {
      S.tray.push(t);
      trayEl.appendChild(t.el);
      t.el.addEventListener('click', function onBack() {
        if (S.over || S.busy) return;
        t.el.removeEventListener('click', onBack);
        moveToSlot(t, true);
      });
    });
    trayBar.classList.remove('hidden');
    layoutSlots();
    S.history = [];
    S.powers.out--;
    renderPowers();
    snd.prop();
  }

  /* ============================================================
   * 结算
   * ============================================================ */
  function gameOver(win) {
    S.over = true;
    S.busy = true;
    if (win) {
      var level = S.level;
      var pig = rollPig(level);
      save.pigs.push(pig);
      if (save.level <= level) save.level = level + 1;
      persist();

      var face = $('#rewardPig');
      face.innerHTML = pigSVG(pig.attrs);
      face.style.filter = '';
      $('#rewardName').textContent = pig.name;
      var tag = $('#rewardTag');
      tag.textContent = pig.label || '小粉猪';
      tag.style.background = pig.color || '#b07cc6';

      snd.win();
      confetti();
      setTimeout(function () { openModal('winModal'); }, 500);
    } else {
      snd.lose();
      setTimeout(function () { openModal('loseModal'); }, 350);
    }
  }

  function confetti() {
    var box = $('#confettiBox');
    var icons = ['✨', '🌸', '⭐', '💖', '🌟', '🎀'];
    for (var i = 0; i < 36; i++) {
      var s = document.createElement('span');
      s.className = 'confetti';
      s.textContent = icons[Math.floor(Math.random() * icons.length)];
      s.style.left = Math.random() * 100 + 'vw';
      s.style.fontSize = (16 + Math.random() * 16) + 'px';
      var dur = 1.6 + Math.random() * 1.8;
      s.style.animationDuration = dur + 's';
      s.style.animationDelay = (Math.random() * 0.8) + 's';
      box.appendChild(s);
      (function (el) { setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, (dur + 1) * 1000); })(s);
    }
  }

  /* ============================================================
   * 事件绑定
   * ============================================================ */
  $('#startBtn').addEventListener('click', function () {
    showScreen('game');
    startLevel(save.level);
  });
  $('#rulesBtn').addEventListener('click', function () { openModal('rulesModal'); });
  $('#penCard').addEventListener('click', openPen);
  $('#backBtn').addEventListener('click', function () {
    showScreen('home');
    renderHome();
  });
  $('#sfxBtn').addEventListener('click', function () {
    save.sfx = !save.sfx;
    persist();
    syncAudioIcons();
    if (save.sfx) snd.tap();
  });
  $('#musicBtn').addEventListener('click', function () {
    save.music = !save.music;
    persist();
    syncAudioIcons();
    if (save.music) {
      ac();
      startBgm();
    }
    setMusicVolume(save.music);
  });

  // 同步两个音频按钮的图标
  function syncAudioIcons() {
    var sfxBtn = $('#sfxBtn');
    var musicBtn = $('#musicBtn');
    if (sfxBtn) sfxBtn.textContent = save.sfx ? '🔊' : '🔇';
    if (musicBtn) musicBtn.textContent = save.music ? '🎵' : '🎶';
  }

  $('#undoBtn').addEventListener('click', doUndo);
  $('#shuffleBtn').addEventListener('click', doShuffle);
  $('#outBtn').addEventListener('click', doOut);

  $('#nextLevelBtn').addEventListener('click', function () {
    closeModal($('#winModal'));
    startLevel(save.level);
  });
  $('#visitPenBtn').addEventListener('click', function () {
    closeModal($('#winModal'));
    showScreen('home');
    renderHome();
    openPen();
  });
  $('#retryBtn').addEventListener('click', function () {
    closeModal($('#loseModal'));
    startLevel(S.level);
  });
  $('#loseHomeBtn').addEventListener('click', function () {
    closeModal($('#loseModal'));
    showScreen('home');
    renderHome();
  });

  $('#clearPigsBtn').addEventListener('click', function () {
    if (save.pigs.length === 0) return;
    if (confirm('确定要把所有小猪放生、清空猪圈吗？此操作不可恢复哦～')) {
      save.pigs = [];
      persist();
      renderHome();
      openPen();
    }
  });

  // 弹窗关闭（遮罩 / 关闭按钮 / data-close）
  document.querySelectorAll('.modal').forEach(function (modal) {
    modal.querySelector('.modal-mask').addEventListener('click', function () { closeModal(modal); });
    modal.querySelectorAll('[data-close]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeModal(modal); });
    });
  });

  window.addEventListener('resize', function () {
    if (!gameScreen.classList.contains('hidden')) fitBoard();
  });

  /* ---------------- 启动 ---------------- */
  var logoEl = $('#logoBadge');
  if (logoEl) logoEl.innerHTML = pigSVG({
    body: 'hsl(340,62%,80%)', ear: 'hsl(340,62%,62%)', snout: 'hsl(340,72%,86%)',
    pattern: 'none', patternColor: 'hsl(340,62%,55%)',
    accessory: 'bow', accessoryColor: 'hsl(20,70%,62%)',
    eye: 'happy', blush: true
  });
  // 首次用户手势解锁音频（浏览器自动播放策略要求）
  document.addEventListener('pointerdown', unlockAudio);
  document.addEventListener('keydown', unlockAudio);

  renderHome();
})();
