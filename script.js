const translations = {
  en: {
    eyebrow: 'Smart Lending',
    title: 'Home Loan Pre-Qualifier',
    subtitle:
      'Check in minutes whether your profile could be creditworthy for a mortgage in Mexico.',
    nameLabel: 'Full name',
    ageLabel: 'Age',
    maritalStatusLabel: 'Marital status',
    employmentLabel: 'Employment / economic activity',
    debtsLabel: 'Outstanding monthly debt payments (MXN)',
    creditHistoryLabel: 'Credit history',
    selectPlaceholder: 'Select an option',
    single: 'Single',
    married: 'Married',
    divorced: 'Divorced',
    widowed: 'Widowed',
    formalEmployee: 'Formal employee',
    selfEmployed: 'Self-employed',
    businessOwner: 'Business owner',
    informal: 'Informal worker',
    unemployed: 'Unemployed',
    excellent: 'Excellent (no missed payments)',
    good: 'Good (few minor delays)',
    fair: 'Fair (several delays)',
    poor: 'Poor (defaults/collections)',
    none: 'No credit history',
    submit: 'Evaluate profile',
    disclaimer:
      'This tool is an informational pre-screen only and is not a loan approval. Final decision depends on full bank underwriting and Mexican regulations.',
    validation: 'Please complete all fields with valid values.',
    likely:
      'Likely pre-qualifiable: your profile appears aligned with common Mexican banking credit criteria.',
    maybe:
      'Borderline profile: you may qualify with stronger documentation, lower debt, or a co-borrower.',
    unlikely:
      'Low pre-qualification probability under typical bank criteria in Mexico at this time.',
    scoreLabel: 'Estimated profile score'
  },
  es: {
    eyebrow: 'Smart Lending',
    title: 'Precalificador de Crédito Hipotecario',
    subtitle:
      'Evalúa en minutos si tu perfil podría ser sujeto de crédito hipotecario en México.',
    nameLabel: 'Nombre completo',
    ageLabel: 'Edad',
    maritalStatusLabel: 'Estado civil',
    employmentLabel: 'Empleo / actividad económica',
    debtsLabel: 'Pagos mensuales de deudas vigentes (MXN)',
    creditHistoryLabel: 'Historial crediticio',
    selectPlaceholder: 'Selecciona una opción',
    single: 'Soltero/a',
    married: 'Casado/a',
    divorced: 'Divorciado/a',
    widowed: 'Viudo/a',
    formalEmployee: 'Empleado formal',
    selfEmployed: 'Trabajador independiente',
    businessOwner: 'Dueño de negocio',
    informal: 'Trabajador informal',
    unemployed: 'Desempleado/a',
    excellent: 'Excelente (sin atrasos)',
    good: 'Bueno (pocos atrasos menores)',
    fair: 'Regular (varios atrasos)',
    poor: 'Malo (incumplimientos/cobranza)',
    none: 'Sin historial crediticio',
    submit: 'Evaluar perfil',
    disclaimer:
      'Esta herramienta es solo informativa y no constituye aprobación de crédito. La decisión final depende del análisis integral del banco y la regulación mexicana.',
    validation: 'Completa todos los campos con valores válidos.',
    likely:
      'Probable precalificación: tu perfil parece alineado con criterios bancarios comunes en México.',
    maybe:
      'Perfil intermedio: podrías calificar con mejor documentación, menor deuda o coacreditado.',
    unlikely:
      'Baja probabilidad de precalificación bajo criterios bancarios típicos en México actualmente.',
    scoreLabel: 'Puntaje estimado de perfil'
  }
};

let currentLang = 'en';
const form = document.getElementById('prequal-form');
const result = document.getElementById('result');

function t(key) {
  return translations[currentLang][key] ?? key;
}

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((node) => {
    const key = node.getAttribute('data-i18n');
    node.textContent = t(key);
  });

  document.getElementById('lang-en').classList.toggle('active', lang === 'en');
  document.getElementById('lang-es').classList.toggle('active', lang === 'es');

  if (result.dataset.key) {
    updateResult(result.dataset.key, result.dataset.score);
  }
}

function updateResult(key, score) {
  result.className = `result ${key}`;
  result.dataset.key = key;
  result.dataset.score = score;
  result.textContent = `${t('scoreLabel')}: ${score} — ${t(key)}`;
}

function calculateScore(values) {
  let score = 0;

  if (values.age >= 25 && values.age <= 65) score += 25;
  else if (values.age >= 18) score += 12;

  if (values.employment === 'formalEmployee' || values.employment === 'businessOwner') score += 25;
  else if (values.employment === 'selfEmployed') score += 18;
  else if (values.employment === 'informal') score += 8;

  const debt = Number(values.debts);
  if (debt <= 5000) score += 20;
  else if (debt <= 15000) score += 12;
  else score += 4;

  const historyScores = {
    excellent: 30,
    good: 22,
    fair: 14,
    none: 10,
    poor: 0
  };
  score += historyScores[values.creditHistory] || 0;

  return Math.min(score, 100);
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const values = Object.fromEntries(formData.entries());
  values.age = Number(values.age);

  const valid =
    values.fullName?.trim() &&
    Number.isFinite(values.age) &&
    values.age >= 18 &&
    values.maritalStatus &&
    values.employment &&
    values.creditHistory &&
    values.debts !== '';

  if (!valid) {
    result.className = 'result danger';
    result.textContent = t('validation');
    result.dataset.key = 'validation';
    result.dataset.score = '';
    return;
  }

  const score = calculateScore(values);
  if (score >= 70) updateResult('success', score);
  else if (score >= 45) updateResult('warn', score);
  else updateResult('danger', score);
});

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-es').addEventListener('click', () => setLanguage('es'));
setLanguage('en');
