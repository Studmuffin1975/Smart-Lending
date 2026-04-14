const translations = {
  es: {
    kicker: 'Evaluación preliminar para crédito hipotecario en México',
    title: 'Precalificador de crédito hipotecario',
    subtitle:
      'Completa tus datos para conocer si tu perfil podría ser sujeto de crédito con criterios bancarios comunes en México.',
    nameLabel: 'Nombre completo',
    ageLabel: 'Edad',
    maritalStatusLabel: 'Estado civil',
    employmentLabel: 'Empleo o actividad económica',
    monthlyIncomeLabel: 'Ingreso mensual antes de impuestos (MXN)',
    debtsLabel: 'Deudas mensuales vigentes (MXN)',
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
      'Esta herramienta es informativa y no constituye aprobación de crédito. La decisión final depende del análisis del banco y la regulación mexicana.',
    validation: 'Completa todos los campos con valores válidos.',
    likely:
      'Probable precalificación: tu perfil parece alineado con criterios bancarios comunes en México.',
    maybe:
      'Perfil intermedio: podrías calificar con mejor documentación, menor deuda o coacreditado.',
    unlikely:
      'Baja probabilidad de precalificación bajo criterios bancarios típicos en México actualmente.',
    scoreLabel: 'Puntaje estimado de perfil'
  },
  en: {
    kicker: 'Initial pre-assessment for home loans in Mexico',
    title: 'Home loan pre-qualifier',
    subtitle:
      'Complete your information to see if your profile could be creditworthy under common banking criteria in Mexico.',
    nameLabel: 'Full name',
    ageLabel: 'Age',
    maritalStatusLabel: 'Marital status',
    employmentLabel: 'Employment or economic activity',
    monthlyIncomeLabel: 'Monthly income before taxes (MXN)',
    debtsLabel: 'Outstanding monthly debts (MXN)',
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
      'This tool is informational only and is not a loan approval. Final decisions depend on full bank review and Mexican regulation.',
    validation: 'Please complete all fields with valid values.',
    likely:
      'Likely pre-qualifiable: your profile appears aligned with common banking criteria in Mexico.',
    maybe:
      'Borderline profile: you may qualify with stronger documentation, lower debt, or a co-borrower.',
    unlikely: 'Low pre-qualification probability under typical bank criteria in Mexico right now.',
    scoreLabel: 'Estimated profile score'
  }
};

let currentLang = 'es';
const form = document.getElementById('prequal-form');
const result = document.getElementById('result');

const outcomeByClass = {
  success: 'likely',
  warn: 'maybe',
  danger: 'unlikely'
};

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

  if (result.dataset.resultClass) {
    paintResult(result.dataset.resultClass, Number(result.dataset.score));
  }
}

function paintResult(resultClass, score) {
  const messageKey = outcomeByClass[resultClass] || 'unlikely';
  result.className = `result ${resultClass}`;
  result.dataset.resultClass = resultClass;
  result.dataset.score = String(score);
  result.textContent = `${t('scoreLabel')}: ${score} — ${t(messageKey)}`;
}

function calculateScore(values) {
  let score = 0;

  if (values.age >= 25 && values.age <= 65) score += 25;
  else if (values.age >= 18) score += 12;

  if (values.employment === 'formalEmployee' || values.employment === 'businessOwner') score += 25;
  else if (values.employment === 'selfEmployed') score += 18;
  else if (values.employment === 'informal') score += 8;

  const income = Number(values.monthlyIncome);
  if (income >= 60000) score += 20;
  else if (income >= 30000) score += 14;
  else if (income >= 15000) score += 8;

  const debt = Number(values.debts);
  if (debt <= 5000) score += 20;
  else if (debt <= 15000) score += 12;
  else score += 4;

  const dti = income > 0 ? debt / income : 1;
  if (dti <= 0.3) score += 10;
  else if (dti <= 0.45) score += 5;

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
    values.monthlyIncome !== '' &&
    values.debts !== '';

  if (!valid) {
    result.className = 'result danger';
    result.textContent = t('validation');
    result.dataset.resultClass = 'danger';
    result.dataset.score = '0';
    return;
  }

  const score = calculateScore(values);
  if (score >= 70) paintResult('success', score);
  else if (score >= 45) paintResult('warn', score);
  else paintResult('danger', score);
});

document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));
document.getElementById('lang-es').addEventListener('click', () => setLanguage('es'));
setLanguage('es');
