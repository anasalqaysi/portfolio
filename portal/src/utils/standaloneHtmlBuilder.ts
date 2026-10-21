import type { DeveloperWorkspaceData } from '../types';

/**
 * Generates a 100% standalone, offline-ready single HTML file containing
 * the full interactive Arabic Developer Workspace + embedded JSON state.
 * The user can save this single .html file to their computer and open it
 * directly in any browser (file://) without hosting, server, or internet.
 */
export function buildStandaloneHtmlFile(data: DeveloperWorkspaceData): string {
  const safeJson = JSON.stringify(data).replace(/</g, '\\u003c');

  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${data.developerName} — مرصد المبرمج (ملف HTML مستقل)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
  <style>
    :root {
      --bg: #f8fafc;
      --surface: #ffffff;
      --border: #e2e8f0;
      --text: #0f172a;
      --muted: #475569;
      --accent: #0f172a;
      --blue: #2563eb;
      --green: #16a34a;
      --amber: #d97706;
      --red: #dc2626;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, "Segoe UI", Tahoma, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      padding-bottom: 60px;
    }
    .mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; direction: ltr; display: inline-block; }
    header {
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      padding: 16px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 16px;
      position: sticky;
      top: 0;
      z-index: 20;
    }
    .brand { font-size: 18px; font-weight: 700; color: var(--text); }
    .nav-tabs { display: flex; gap: 8px; flex-wrap: wrap; }
    .tab-btn {
      padding: 8px 16px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--muted);
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
    }
    .tab-btn.active {
      background: var(--accent);
      color: #fff;
      border-color: var(--accent);
    }
    .container { max-width: 1360px; margin: 24px auto; padding: 0 24px; }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .kpi-label { font-size: 13px; color: var(--muted); margin-bottom: 6px; }
    .kpi-val { font-size: 26px; font-weight: 700; font-variant-numeric: tabular-nums; }
    .kpi-sub { font-size: 12px; color: var(--muted); margin-top: 4px; }
    h2 { font-size: 20px; margin-bottom: 14px; }
    h3 { font-size: 16px; margin-bottom: 8px; }
    table { width: 100%; border-collapse: collapse; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
    th, td { padding: 12px 14px; border-bottom: 1px solid var(--border); text-align: right; font-size: 13px; vertical-align: top; }
    th { background: #f1f5f9; font-weight: 600; color: var(--muted); }
    .btn {
      padding: 8px 16px;
      background: var(--blue);
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-family: inherit;
      font-size: 13px;
      font-weight: 600;
    }
    .btn-secondary {
      background: #f1f5f9;
      color: var(--text);
      border: 1px solid var(--border);
    }
    .btn-danger {
      background: #fee2e2;
      color: #b91c1c;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 14px;
    }
    input, select, textarea {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid var(--border);
      border-radius: 6px;
      font-family: inherit;
      font-size: 13px;
    }
    label { display: block; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 4px; }
    .meta-line { font-size: 12px; color: var(--muted); margin-top: 6px; }
    .hidden { display: none; }
    a { color: var(--blue); text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <header>
    <div class="brand" id="brandTitle">مرصد المبرمج — ملف HTML مستقل</div>
    <div class="nav-tabs">
      <button class="tab-btn active" onclick="switchTab('ideas', this)">الأفكار والتحقق من السوق</button>
      <button class="tab-btn" onclick="switchTab('contacts', this)">سجل تواصل المستخدمين والعملاء</button>
      <button class="tab-btn" onclick="switchTab('clients', this)">مشاريع العملاء والدفعات</button>
      <button class="tab-btn" onclick="switchTab('platforms', this)">المنصات الخاصة والسيرفرات</button>
    </div>
    <div style="display:flex;gap:8px;">
      <button class="btn" onclick="saveUpdatedHtmlFile()">حفظ نسخة HTML محدّثة ببياناتي</button>
    </div>
  </header>

  <div class="container">
    <div class="kpi-grid" id="kpiGrid"></div>

    <!-- Section: Ideas -->
    <section id="sec-ideas">
      <div class="card">
        <h3>إضافة فكرة مشروع جديدة</h3>
        <div class="form-grid" style="margin-top:10px;">
          <div><label>اسم الفكرة</label><input id="ideaTitle" placeholder="مثال: منصة أتمتة مواعيد العيادات" /></div>
          <div><label>الفئة المستهدفة</label><input id="ideaTarget" placeholder="مثال: العيادات الخاصة وأطباء الأسنان" /></div>
          <div><label>الوضع الحالي</label>
            <select id="ideaStatus">
              <option value="idea_stage">صياغة الفكرة</option>
              <option value="validating">تحقق وتواصل مع السوق</option>
              <option value="building_mvp">بناء النسخة الأولية MVP</option>
              <option value="in_execution">قيد التنفيذ والتطوير</option>
              <option value="launched">تم الإطلاق</option>
            </select>
          </div>
          <div><label>هل تواصلت مع مستخدمين فعليين قبل البدء؟</label>
            <select id="ideaValidated">
              <option value="true">نعم — تم التواصل والتحقق</option>
              <option value="false">لا — لم يتم التواصل بعد</option>
            </select>
          </div>
          <div><label>الاحتياجات والمتطلبات التقنية (مفصولة بفاصلة)</label><input id="ideaReqs" placeholder="Next.js, PostgreSQL, WhatsApp API" /></div>
          <div><label>نموذج الربح والتسعير</label><input id="ideaMonetization" placeholder="اشتراك شهري 149 ر.س" /></div>
        </div>
        <div style="margin-bottom:12px;">
          <label>المشكلة التي تحلها الفكرة وملاحظات التنفيذ</label>
          <textarea id="ideaProblem" rows="2" placeholder="اشرح المشكلة والحل باختصار..."></textarea>
        </div>
        <button class="btn" onclick="addIdea()">+ حفظ الفكرة في السجل</button>
      </div>
      <div id="ideasList"></div>
    </section>

    <!-- Section: Contacts -->
    <section id="sec-contacts" class="hidden">
      <div class="card">
        <h3>تسجيل شخص تم التواصل معه (تحقق من فكرة أو عميل محتمل)</h3>
        <div class="form-grid" style="margin-top:10px;">
          <div><label>الفكرة المرتبطة</label><select id="cntIdea"></select></div>
          <div><label>اسم الشخص</label><input id="cntName" placeholder="الاسم الكامل أو الكنية" /></div>
          <div><label>صفته / مجاله</label><input id="cntRole" placeholder="مثال: صاحب متجر عطور في سلة" /></div>
          <div><label>المرحلة الحالية معه</label>
            <select id="cntStage">
              <option value="contacted">تم التواصل</option>
              <option value="replied">تم الرد</option>
              <option value="interviewed">تم النقاش وجمع الملاحظات</option>
              <option value="potential_client">عميل محتمل مهتم</option>
              <option value="converted_user">عميل فعلي / مشترك مبكر</option>
              <option value="not_interested">غير مهتم حالياً</option>
            </select>
          </div>
          <div><label>رقم الجوال / واتساب</label><input id="cntPhone" class="mono" placeholder="+96650..." /></div>
          <div><label>حساب منصة X (تويتر)</label><input id="cntX" class="mono" placeholder="@username" /></div>
          <div><label>يوزر تيك توك (TikTok)</label><input id="cntTiktok" class="mono" placeholder="@tiktok_user" /></div>
          <div><label>تيليجرام / بريد / وسيلة أخرى</label><input id="cntOther" placeholder="@telegram أو email" /></div>
        </div>
        <div style="margin-bottom:12px;">
          <label>ملخص رأيه وملاحظات النقاش معه</label>
          <textarea id="cntFeedback" rows="2" placeholder="ماذا قال عن الفكرة؟ هل هو مستعد للدفع؟"></textarea>
        </div>
        <button class="btn" onclick="addContact()">+ إضافة سجل التواصل</button>
      </div>
      <div id="contactsTableWrap"></div>
    </section>

    <!-- Section: Clients -->
    <section id="sec-clients" class="hidden">
      <div class="card">
        <h3>إضافة مشروع عميل جديد</h3>
        <div class="form-grid" style="margin-top:10px;">
          <div><label>اسم المشروع</label><input id="cpName" placeholder="مثال: تطبيق متجر تمور" /></div>
          <div><label>اسم العميل</label><input id="cpClient" placeholder="اسم الشركة أو العميل" /></div>
          <div><label>جوال العميل</label><input id="cpPhone" class="mono" placeholder="+9665..." /></div>
          <div><label>حساب العميل في X</label><input id="cpX" class="mono" placeholder="@client_x" /></div>
          <div><label>إجمالي العقد (${data.currency})</label><input id="cpTotal" type="number" placeholder="15000" /></div>
          <div><label>المدفوع حتى الآن (${data.currency})</label><input id="cpPaid" type="number" placeholder="7500" /></div>
        </div>
        <button class="btn" onclick="addClientProject()">+ حفظ مشروع العميل</button>
      </div>
      <div id="clientsList"></div>
    </section>

    <!-- Section: Platforms -->
    <section id="sec-platforms" class="hidden">
      <div id="platformsList"></div>
    </section>
  </div>

  <script>
    const STORAGE_KEY = 'DEV_COMMAND_CENTER_STANDALONE_V1';
    const EMBEDDED_DATA = ${safeJson};
    let state = EMBEDDED_DATA;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) state = JSON.parse(saved);
    } catch (e) {}

    function persist() {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {}
      renderAll();
    }

    const STATUS_MAP = {
      idea_stage: 'صياغة الفكرة',
      validating: 'تحقق وتواصل مع السوق',
      building_mvp: 'بناء النسخة الأولية MVP',
      in_execution: 'قيد التنفيذ والتطوير',
      launched: 'تم الإطلاق',
      paused: 'مؤجل مؤقتاً'
    };

    const STAGE_MAP = {
      contacted: 'تم التواصل',
      replied: 'تم الرد',
      interviewed: 'تم النقاش وجمع الملاحظات',
      potential_client: 'عميل محتمل مهتم',
      converted_user: 'عميل فعلي / مشترك مبكر',
      not_interested: 'غير مهتم حالياً'
    };

    function switchTab(tab, btn) {
      ['ideas', 'contacts', 'clients', 'platforms'].forEach(id => {
        document.getElementById('sec-' + id).classList.toggle('hidden', id !== tab);
      });
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      if (btn) btn.classList.add('active');
    }

    function addIdea() {
      const title = document.getElementById('ideaTitle').value.trim();
      if (!title) return;
      state.ideas.unshift({
        id: 'idea-' + Date.now(),
        title,
        problemStatement: document.getElementById('ideaProblem').value.trim(),
        targetAudience: document.getElementById('ideaTarget').value.trim(),
        requirements: document.getElementById('ideaReqs').value.split(',').map(s => s.trim()).filter(Boolean),
        status: document.getElementById('ideaStatus').value,
        validatedBeforeStart: document.getElementById('ideaValidated').value === 'true',
        targetValidationCount: 10,
        monetizationModel: document.getElementById('ideaMonetization').value.trim(),
        estimatedCost: 0,
        notes: '',
        createdAt: new Date().toISOString().slice(0, 10)
      });
      document.getElementById('ideaTitle').value = '';
      document.getElementById('ideaProblem').value = '';
      persist();
    }

    function addContact() {
      const name = document.getElementById('cntName').value.trim();
      if (!name) return;
      state.contacts.unshift({
        id: 'cnt-' + Date.now(),
        ideaId: document.getElementById('cntIdea').value,
        name,
        roleOrPersona: document.getElementById('cntRole').value.trim(),
        stage: document.getElementById('cntStage').value,
        primaryChannel: 'whatsapp',
        channels: {
          phone: document.getElementById('cntPhone').value.trim(),
          whatsapp: document.getElementById('cntPhone').value.trim(),
          xHandle: document.getElementById('cntX').value.trim(),
          tiktokHandle: document.getElementById('cntTiktok').value.trim(),
          linkedinUrl: '',
          email: '',
          telegramHandle: '',
          otherChannel: document.getElementById('cntOther').value.trim()
        },
        feedbackSummary: document.getElementById('cntFeedback').value.trim(),
        willingToPay: true,
        expectedPriceMonthly: 0,
        lastContactDate: new Date().toISOString().slice(0, 10),
        nextFollowUpDate: ''
      });
      document.getElementById('cntName').value = '';
      document.getElementById('cntFeedback').value = '';
      persist();
    }

    function addClientProject() {
      const projectName = document.getElementById('cpName').value.trim();
      if (!projectName) return;
      state.clientProjects.unshift({
        id: 'cp-' + Date.now(),
        projectName,
        clientName: document.getElementById('cpClient').value.trim(),
        clientPhone: document.getElementById('cpPhone').value.trim(),
        clientXHandle: document.getElementById('cpX').value.trim(),
        clientEmail: '',
        projectType: 'مشروع برمجي',
        status: 'in_progress',
        totalBudget: Number(document.getElementById('cpTotal').value) || 0,
        paidAmount: Number(document.getElementById('cpPaid').value) || 0,
        startDate: new Date().toISOString().slice(0, 10),
        deadline: '',
        repoUrl: '',
        stagingUrl: '',
        milestones: [],
        notes: ''
      });
      document.getElementById('cpName').value = '';
      persist();
    }

    function updateContactStage(id, newStage) {
      const c = state.contacts.find(x => x.id === id);
      if (c) { c.stage = newStage; persist(); }
    }

    function renderAll() {
      const totalContacts = state.contacts.length;
      const leads = state.contacts.filter(c => c.stage === 'potential_client' || c.stage === 'converted_user').length;
      const totalContract = state.clientProjects.reduce((s, p) => s + (Number(p.totalBudget) || 0), 0);
      const totalPaid = state.clientProjects.reduce((s, p) => s + (Number(p.paidAmount) || 0), 0);

      document.getElementById('kpiGrid').innerHTML = \`
        <div class="card"><div class="kpi-label">إجمالي الأفكار والمشاريع قيد الدراسة</div><div class="kpi-val">\${state.ideas.length}</div><div class="kpi-sub">منها \${state.ideas.filter(i => i.validatedBeforeStart).length} تم التحقق منها مع مستخدمين</div></div>
        <div class="card"><div class="kpi-label">الأشخاص الذين تم التواصل معهم</div><div class="kpi-val">\${totalContacts}</div><div class="kpi-sub">\${leads} عملاء محتملين أو مشتركين فعليين</div></div>
        <div class="card"><div class="kpi-label">إجمالي عقود مشاريع العملاء</div><div class="kpi-val">\${totalContract.toLocaleString()} \${state.currency}</div><div class="kpi-sub">المدفوع: \${totalPaid.toLocaleString()} · المتبقي: \${(totalContract - totalPaid).toLocaleString()}</div></div>
        <div class="card"><div class="kpi-label">المنصات الخاصة (SaaS)</div><div class="kpi-val">\${state.platforms.length}</div><div class="kpi-sub">إيراد شهري: \${state.platforms.reduce((s, p) => s + (Number(p.monthlyRevenue)||0), 0).toLocaleString()} \${state.currency}</div></div>
      \`;

      const ideaOpts = state.ideas.map(i => \`<option value="\${i.id}">\${i.title}</option>\`).join('');
      document.getElementById('cntIdea').innerHTML = ideaOpts;

      document.getElementById('ideasList').innerHTML = state.ideas.map(idea => {
        const linked = state.contacts.filter(c => c.ideaId === idea.id);
        const replied = linked.filter(c => c.stage !== 'contacted').length;
        const potential = linked.filter(c => c.stage === 'potential_client' || c.stage === 'converted_user').length;
        return \`
          <div class="card">
            <h3>\${idea.title}</h3>
            <div class="meta-line">
              الوضع الحالي: <strong>\${STATUS_MAP[idea.status] || idea.status}</strong> ·
              التحقق قبل البدء: <strong>\${idea.validatedBeforeStart ? 'نعم تم التواصل' : 'لم يتم بعد'}</strong> ·
              تم التواصل مع: <strong>\${linked.length} أشخاص</strong> (تم الرد: \${replied} · عملاء محتملين: \${potential})
            </div>
            <p style="margin-top:8px;font-size:14px;"><strong>المشكلة:</strong> \${idea.problemStatement}</p>
            <p style="margin-top:4px;font-size:13px;"><strong>الفئة المستهدفة:</strong> \${idea.targetAudience} · <strong>نموذج الربح:</strong> \${idea.monetizationModel}</p>
            <p style="margin-top:4px;font-size:13px;color:#475569;"><strong>الاحتياجات التقنية:</strong> \${(idea.requirements || []).join(' ، ')}</p>
          </div>
        \`;
      }).join('');

      document.getElementById('contactsTableWrap').innerHTML = \`
        <table>
          <thead>
            <tr>
              <th>الاسم والصفة</th>
              <th>الفكرة المرتبطة</th>
              <th>المرحلة الحالية</th>
              <th>رقم الجوال / واتساب</th>
              <th>حساب X (تويتر)</th>
              <th>يوزر تيك توك</th>
              <th>قنوات أخرى</th>
              <th>ملخص النقاش ورأي المستخدم</th>
            </tr>
          </thead>
          <tbody>
            \${state.contacts.map(c => {
              const idea = state.ideas.find(i => i.id === c.ideaId);
              return \`
                <tr>
                  <td><strong>\${c.name}</strong><div class="meta-line">\${c.roleOrPersona}</div></td>
                  <td>\${idea ? idea.title : '-'}</td>
                  <td>
                    <select onchange="updateContactStage('\${c.id}', this.value)">
                      \${Object.entries(STAGE_MAP).map(([k, v]) => \`<option value="\${k}" \${c.stage === k ? 'selected' : ''}>\${v}</option>\`).join('')}
                    </select>
                  </td>
                  <td class="mono">\${c.channels.phone || c.channels.whatsapp || '-'}</td>
                  <td class="mono">\${c.channels.xHandle || '-'}</td>
                  <td class="mono">\${c.channels.tiktokHandle || '-'}</td>
                  <td>\${c.channels.otherChannel || c.channels.telegramHandle || c.channels.email || '-'}</td>
                  <td>\${c.feedbackSummary || '-'}</td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>
      \`;

      document.getElementById('clientsList').innerHTML = state.clientProjects.map(p => \`
        <div class="card">
          <h3>\${p.projectName} — \${p.clientName}</h3>
          <div class="meta-line">
            إجمالي العقد: <span class="mono">\${p.totalBudget.toLocaleString()}</span> \${state.currency} ·
            المدفوع: <span class="mono">\${p.paidAmount.toLocaleString()}</span> \${state.currency} ·
            المتبقي: <span class="mono">\${(p.totalBudget - p.paidAmount).toLocaleString()}</span> \${state.currency} ·
            جوال العميل: <span class="mono">\${p.clientPhone || '-'}</span> ·
            حساب X: <span class="mono">\${p.clientXHandle || '-'}</span>
          </div>
          <p style="margin-top:6px;font-size:13px;">\${p.notes || ''}</p>
        </div>
      \`).join('');

      document.getElementById('platformsList').innerHTML = state.platforms.map(pl => \`
        <div class="card">
          <h3>\${pl.name} (<span class="mono">\${pl.domain}</span>)</h3>
          <p style="font-size:13px;color:#475569;">\${pl.tagline}</p>
          <div class="meta-line">
            الاستضافة: \${pl.hostingProvider} · تكلفة السيرفر الشهري: <span class="mono">\${pl.monthlyServerCost}</span> \${state.currency} ·
            المستخدمون النشطون: <span class="mono">\${pl.activeUsersCount}</span> ·
            الإيراد الشهري: <span class="mono">\${pl.monthlyRevenue}</span> \${state.currency}
          </div>
        </div>
      \`).join('');
    }

    function saveUpdatedHtmlFile() {
      const htmlContent = document.documentElement.outerHTML.replace(
        /const EMBEDDED_DATA = .*?;/,
        'const EMBEDDED_DATA = ' + JSON.stringify(state) + ';'
      );
      const blob = new Blob(['<!doctype html>\\n' + htmlContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'developer-command-center.html';
      a.click();
      URL.revokeObjectURL(url);
    }

    renderAll();
  </script>
</body>
</html>`;
}
