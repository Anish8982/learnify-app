import { Course } from '../types';

/**
 * Generates a self-contained HTML page for the course WebView.
 * Course data is injected server-side into the template so the
 * WebView needs no network calls.
 *
 * Native → WebView communication:
 *   The native app calls injectedJavaScript which calls
 *   window.receiveCourseData(payload) before the page renders.
 *
 * WebView → Native communication:
 *   The page calls window.ReactNativeWebView.postMessage(json)
 *   for user actions (enroll click, bookmark click, etc.)
 */
export function buildCourseHtml(course: Course, isDark: boolean): string {
    const bg = isDark ? '#0f172a' : '#ffffff';
    const cardBg = isDark ? '#1e293b' : '#f8fafc';
    const textMain = isDark ? '#f1f5f9' : '#0f172a';
    const textSub = isDark ? '#94a3b8' : '#64748b';
    const border = isDark ? '#334155' : '#e2e8f0';
    const accent = '#6366f1';

    const stars = '★'.repeat(Math.round(course.rating ?? 4)) +
        '☆'.repeat(5 - Math.round(course.rating ?? 4));

    const curriculum = [
        { title: 'Getting Started', lessons: 4, duration: '45 min' },
        { title: 'Core Concepts', lessons: 8, duration: '2h 10min' },
        { title: 'Advanced Topics', lessons: 6, duration: '1h 45min' },
        { title: 'Real-World Project', lessons: 10, duration: '3h 20min' },
        { title: 'Deployment & Beyond', lessons: 3, duration: '50 min' },
    ];

    const curriculumRows = curriculum.map((s, i) => `
    <div class="row">
      <div class="num">${i + 1}</div>
      <div class="row-body">
        <div class="row-title">${s.title}</div>
        <div class="row-sub">${s.lessons} lessons · ${s.duration}</div>
      </div>
    </div>`).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <title>${course.title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: ${bg};
      color: ${textMain};
      padding: 0 0 40px;
    }

    /* ── Hero ── */
    .hero {
      position: relative;
      width: 100%;
      height: 220px;
      overflow: hidden;
    }
    .hero img { width: 100%; height: 100%; object-fit: cover; }
    .hero-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,.7));
    }
    .hero-badges {
      position: absolute; bottom: 14px; left: 16px;
      display: flex; gap: 8px;
    }
    .badge {
      padding: 4px 12px; border-radius: 8px;
      font-size: 13px; font-weight: 700;
    }
    .badge-price { background: ${accent}; color: #fff; }
    .badge-level { background: #dcfce7; color: #16a34a; }

    /* ── Body ── */
    .body { padding: 20px 16px; }

    h1 { font-size: 20px; font-weight: 800; line-height: 1.35; margin-bottom: 14px; }

    /* ── Instructor ── */
    .instructor {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 20px;
    }
    .avatar {
      width: 44px; height: 44px; border-radius: 22px;
      object-fit: cover; background: #eef2ff;
    }
    .avatar-placeholder {
      width: 44px; height: 44px; border-radius: 22px;
      background: #eef2ff; display: flex;
      align-items: center; justify-content: center;
      font-size: 18px; color: ${accent};
    }
    .inst-label { font-size: 11px; color: ${textSub}; }
    .inst-name  { font-size: 15px; font-weight: 700; }

    /* ── Stats ── */
    .stats {
      display: flex; background: ${cardBg};
      border: 1px solid ${border}; border-radius: 16px;
      margin-bottom: 24px; overflow: hidden;
    }
    .stat {
      flex: 1; padding: 14px 8px; text-align: center;
      border-right: 1px solid ${border};
    }
    .stat:last-child { border-right: none; }
    .stat-value { font-size: 16px; font-weight: 700; }
    .stat-label { font-size: 11px; color: ${textSub}; margin-top: 2px; }
    .stars { color: #f59e0b; font-size: 13px; margin-bottom: 4px; }

    /* ── Section headings ── */
    h2 { font-size: 17px; font-weight: 700; margin-bottom: 12px; }

    /* ── Description ── */
    .desc {
      font-size: 14px; line-height: 1.7;
      color: ${textSub}; margin-bottom: 24px;
    }

    /* ── Card ── */
    .card {
      background: ${cardBg}; border: 1px solid ${border};
      border-radius: 16px; padding: 16px; margin-bottom: 24px;
    }

    /* ── Checklist ── */
    .check-item {
      display: flex; align-items: flex-start; gap: 10px;
      margin-bottom: 12px;
    }
    .check-item:last-child { margin-bottom: 0; }
    .check-icon {
      width: 22px; height: 22px; border-radius: 11px;
      background: #eef2ff; display: flex;
      align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 12px; color: ${accent};
    }
    .check-text { font-size: 14px; line-height: 1.5; color: ${textSub}; }

    /* ── Curriculum rows ── */
    .row {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 0; border-bottom: 1px solid ${border};
    }
    .row:last-child { border-bottom: none; }
    .num {
      width: 32px; height: 32px; border-radius: 10px;
      background: #eef2ff; display: flex;
      align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; color: ${accent};
      flex-shrink: 0;
    }
    .row-title { font-size: 14px; font-weight: 600; }
    .row-sub   { font-size: 12px; color: ${textSub}; margin-top: 2px; }

    /* ── Tags ── */
    .tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 28px; }
    .tag {
      background: #eef2ff; border-radius: 20px;
      padding: 5px 12px; font-size: 12px;
      font-weight: 600; color: ${accent};
    }

    /* ── CTA buttons ── */
    .cta { display: flex; gap: 12px; }
    .btn {
      flex: 1; padding: 15px; border-radius: 14px;
      font-size: 15px; font-weight: 700; border: none;
      cursor: pointer; transition: opacity .15s;
    }
    .btn:active { opacity: .8; }
    .btn-enroll {
      background: linear-gradient(90deg, ${accent}, #4f46e5);
      color: #fff;
    }
    .btn-bookmark {
      background: #eef2ff; color: ${accent};
    }

    /* ── Native bridge status ── */
    #bridge-status {
      font-size: 11px; color: ${textSub};
      text-align: center; margin-top: 16px;
    }
  </style>
</head>
<body>

  <!-- Hero -->
  <div class="hero">
    <img
      src="${course.thumbnail}"
      onerror="this.src='https://picsum.photos/seed/${course.id}/800/400'"
      alt="Course thumbnail"
    />
    <div class="hero-overlay"></div>
    <div class="hero-badges">
      <span class="badge badge-price">${course.price ? `₹${course.price}` : 'Free'}</span>
      <span class="badge badge-level">${course.level ?? 'Beginner'}</span>
    </div>
  </div>

  <div class="body">

    <!-- Title -->
    <h1 id="course-title">${course.title}</h1>

    <!-- Instructor -->
    <div class="instructor">
      ${course.instructorAvatar
            ? `<img class="avatar" src="${course.instructorAvatar}" alt="Instructor" />`
            : `<div class="avatar-placeholder">👤</div>`}
      <div>
        <div class="inst-label">Instructor</div>
        <div class="inst-name">${course.instructor}</div>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats">
      <div class="stat">
        <div class="stars">${stars}</div>
        <div class="stat-value">${course.rating?.toFixed(1) ?? '4.5'}</div>
        <div class="stat-label">Rating</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="font-size:20px">👥</div>
        <div class="stat-value">2.4k</div>
        <div class="stat-label">Students</div>
      </div>
      <div class="stat">
        <div class="stat-value" style="font-size:20px">⏱</div>
        <div class="stat-value">8h 50m</div>
        <div class="stat-label">Duration</div>
      </div>
    </div>

    <!-- Description -->
    <h2>About this course</h2>
    <p class="desc">${course.description}</p>

    <!-- What you'll learn -->
    <h2>What you'll learn</h2>
    <div class="card">
      ${['Build real-world projects from scratch', 'Understand core concepts deeply', 'Industry best practices and patterns', 'Deploy and ship production-ready apps', 'Debug and optimize performance', 'Work with modern tools and libraries']
            .map(item => `<div class="check-item"><div class="check-icon">✓</div><div class="check-text">${item}</div></div>`)
            .join('')}
    </div>

    <!-- Curriculum -->
    <h2>Course Curriculum</h2>
    <div class="card">${curriculumRows}</div>

    <!-- Tags -->
    <div class="tags">
      ${[course.level ?? 'Beginner', 'Certificate', 'Lifetime Access', 'Mobile Friendly', course.category ?? 'General']
            .map(t => `<span class="tag">${t}</span>`).join('')}
    </div>

    <!-- CTA -->
    <div class="cta">
      <button class="btn btn-enroll"  onclick="sendAction('enroll')">🚀 Enroll Now</button>
      <button class="btn btn-bookmark" onclick="sendAction('bookmark')">🔖 Bookmark</button>
    </div>

    <div id="bridge-status">Connected to Learnify native app</div>
  </div>

  <script>
    // ── WebView → Native ──────────────────────────────────────────────────────
    function sendAction(action) {
      var payload = JSON.stringify({ action: action, courseId: '${course.id}' });
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(payload);
      }
      document.getElementById('bridge-status').textContent =
        'Sent "' + action + '" to native app ✓';
    }

    // ── Native → WebView ──────────────────────────────────────────────────────
    // The native app calls this via injectedJavaScript to pass live data
    window.receiveCourseData = function(data) {
      if (data.isEnrolled) {
        var btn = document.querySelector('.btn-enroll');
        if (btn) { btn.textContent = '✓ Enrolled'; btn.style.background = '#10b981'; }
      }
      if (data.isBookmarked) {
        var bm = document.querySelector('.btn-bookmark');
        if (bm) { bm.textContent = '🔖 Saved'; bm.style.background = '#818cf8'; bm.style.color = '#fff'; }
      }
      if (data.userName) {
        document.getElementById('bridge-status').textContent =
          'Logged in as ' + data.userName + ' · Learnify';
      }
    };
  </script>
</body>
</html>`;
}
