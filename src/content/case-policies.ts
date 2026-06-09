/* ================================================================
   Clinical Case Library — editorial & publishing policies.
   Bilingual content powering /cases/policies and /cases/policies/[doc].
   Written to satisfy DOAJ / Scopus governance criteria. Content is
   factual; ISSN and the full editorial board are marked as pending
   until assigned/recruited.
   ================================================================ */

export type Bi = { en: string; ar: string };
export type PolicySection = { h: Bi; p: Bi };
export type PolicyDoc = {
  slug: string;
  title: Bi;
  summary: Bi;
  sections: PolicySection[];
};

export const JOURNAL = {
  name: { en: "Clinical Case Library", ar: "مكتبة الحالات السريرية" } as Bi,
  publisher: { en: "Maytham Altaan", ar: "ميثم الطعان" } as Bi,
  editorInChief: { en: "Dr. Maytham Altaan", ar: "د. ميثم الطعان" } as Bi,
  /* ISSN is assigned by the national centre — left empty until issued. */
  issn: "",
  contactEmail: "Maytham.m.altaan@gmail.com",
  license: "CC BY 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
  firstPublished: "2026",
  frequency: { en: "Continuous (articles published on acceptance)", ar: "مستمر (تُنشر المقالات عند قبولها)" } as Bi,
};

export const POLICY_DOCS: PolicyDoc[] = [
  /* ---------------------------------------------------------------- */
  {
    slug: "about",
    title: { en: "About & Aims and Scope", ar: "عن المكتبة ونطاقها" },
    summary: {
      en: "What the Clinical Case Library publishes and who it serves.",
      ar: "ما تنشره مكتبة الحالات السريرية ومن تخدم.",
    },
    sections: [
      {
        h: { en: "Aims", ar: "الأهداف" },
        p: {
          en: "The Clinical Case Library is an open-access, peer-reviewed collection of clinical case reports from Iraqi and Arab clinicians. It exists to document instructive rare presentations, drug toxicities, complications, and diagnostic challenges, and to make them freely available for education and reference.",
          ar: "مكتبة الحالات السريرية مجموعة مفتوحة الوصول ومُحكَّمة من تقارير الحالات السريرية لأطباء العراق والوطن العربي. تهدف إلى توثيق الحالات النادرة والسميّات الدوائية والمضاعفات والتحديات التشخيصية المفيدة تعليمياً، وإتاحتها مجاناً للتعليم والمرجعية.",
        },
      },
      {
        h: { en: "Scope", ar: "النطاق" },
        p: {
          en: "We accept anonymized case reports across all medical and surgical specialties and clinical pharmacy. Each report follows a structured format: presentation, investigations, diagnosis, treatment, outcome, and learning points. Submissions should follow the CARE reporting guideline.",
          ar: "نقبل تقارير الحالات المجهولة الهوية في جميع التخصصات الطبية والجراحية والصيدلة السريرية. يتبع كل تقرير صيغة منظمة: العرض السريري، الفحوصات، التشخيص، العلاج، المآل، ونقاط التعلّم. ويُفضَّل اتباع دليل CARE في كتابة التقرير.",
        },
      },
      {
        h: { en: "Publication model", ar: "نموذج النشر" },
        p: {
          en: "Open access with no submission or publication charges. Articles are published continuously on acceptance. Publisher: Maytham Altaan. ISSN: pending assignment.",
          ar: "وصول مفتوح دون أي رسوم تقديم أو نشر. تُنشر المقالات بشكل مستمر عند القبول. الناشر: ميثم الطعان. الرقم الدولي المعياري (ISSN): قيد الإصدار.",
        },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "editorial-board",
    title: { en: "Editorial Board", ar: "هيئة التحرير" },
    summary: {
      en: "Who oversees review and editorial decisions.",
      ar: "من يشرف على التحكيم والقرارات التحريرية.",
    },
    sections: [
      {
        h: { en: "Editor-in-Chief", ar: "رئيس التحرير" },
        p: {
          en: "Dr. Maytham Altaan — Clinical Pharmacist & Biostatistician, Medical City, Baghdad, Iraq. ORCID: 0000-0003-4528-4716.",
          ar: "د. ميثم الطعان — صيدلاني سريري وإحصائي حيوي، مدينة الطب، بغداد، العراق. ORCID: 0000-0003-4528-4716.",
        },
      },
      {
        h: { en: "Review committee", ar: "لجنة التحكيم" },
        p: {
          en: "Submissions are evaluated by the editorial review committee before publication. The board is actively being expanded with senior clinicians across specialties.",
          ar: "تُقيَّم المساهمات من قبل لجنة التحكيم التحريرية قبل النشر. ويجري توسيع الهيئة بانتظام بأطباء استشاريين من مختلف التخصصات.",
        },
      },
      {
        h: { en: "Join the board", ar: "الانضمام للهيئة" },
        p: {
          en: "Qualified clinicians and researchers interested in serving as reviewers or editors are invited to contact Maytham.m.altaan@gmail.com with a short CV.",
          ar: "نرحب بالأطباء والباحثين المؤهلين الراغبين في العمل محكّمين أو محرّرين عبر مراسلة Maytham.m.altaan@gmail.com مع سيرة ذاتية مختصرة.",
        },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "peer-review",
    title: { en: "Peer-Review Policy", ar: "سياسة التحكيم العلمي" },
    summary: {
      en: "How submissions are reviewed before publication.",
      ar: "كيف تُحكَّم المساهمات قبل النشر.",
    },
    sections: [
      {
        h: { en: "Process", ar: "آلية التحكيم" },
        p: {
          en: "Every submission undergoes single-blind peer review: the reviewer sees the submission, the author does not know the reviewer's identity. The review committee assesses clinical accuracy, educational value, originality, anonymization, and adherence to the CARE format before a case is approved and published.",
          ar: "تخضع كل مساهمة لتحكيم أحادي التعمية: يطّلع المحكّم على المساهمة دون أن يعرف المؤلف هوية المحكّم. تقيّم اللجنة الدقة السريرية والقيمة التعليمية والأصالة وإخفاء الهوية والالتزام بصيغة CARE قبل اعتماد الحالة ونشرها.",
        },
      },
      {
        h: { en: "Decisions & timeline", ar: "القرارات والمدة" },
        p: {
          en: "Possible decisions are: accept, request revisions, or reject. Authors are notified by email, typically within 7 days. Reviewers declare any conflict of interest and recuse themselves when needed.",
          ar: "القرارات الممكنة: القبول، أو طلب تعديلات، أو الرفض. يُبلَّغ المؤلفون بالبريد الإلكتروني عادةً خلال 7 أيام. ويُفصح المحكّمون عن أي تضارب مصالح ويتنحّون عند اللزوم.",
        },
      },
      {
        h: { en: "Appeals & post-publication", ar: "الطعون وما بعد النشر" },
        p: {
          en: "Authors may appeal a decision by replying to the notification email. Published cases remain open to scholarly comment, and substantive concerns are handled under our corrections and retractions policy.",
          ar: "يمكن للمؤلفين الطعن في القرار بالرد على بريد الإشعار. وتبقى الحالات المنشورة مفتوحة للتعليق العلمي، وتُعالَج الملاحظات الجوهرية وفق سياسة التصحيحات والسحب لدينا.",
        },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "ethics",
    title: { en: "Publication Ethics & Patient Consent", ar: "أخلاقيات النشر وموافقة المريض" },
    summary: {
      en: "Integrity, consent, and how we handle misconduct.",
      ar: "النزاهة والموافقة والتعامل مع سوء السلوك.",
    },
    sections: [
      {
        h: { en: "Standards", ar: "المعايير" },
        p: {
          en: "The Library follows the principles of the Committee on Publication Ethics (COPE). Editors, reviewers, and authors are expected to act with integrity, transparency, and respect for patient welfare.",
          ar: "تلتزم المكتبة بمبادئ لجنة أخلاقيات النشر (COPE). ويُتوقَّع من المحرّرين والمحكّمين والمؤلفين التصرّف بنزاهة وشفافية واحترام لمصلحة المريض.",
        },
      },
      {
        h: { en: "Patient consent & anonymization", ar: "موافقة المريض وإخفاء الهوية" },
        p: {
          en: "Every case must be fully anonymized — no name, medical-record number, date of birth, face, or any other identifier in the text or images. Authors confirm anonymization on submission. Where a patient could still be identifiable, written informed consent (or guardian consent) must be uploaded. Cases must comply with the Declaration of Helsinki and local/IRB requirements.",
          ar: "يجب أن تكون كل حالة مجهولة الهوية بالكامل — دون اسم أو رقم ملف أو تاريخ ميلاد أو وجه أو أي معرّف في النص أو الصور. ويؤكد المؤلفون إخفاء الهوية عند التقديم. وإذا بقي المريض قابلاً للتعرّف، فيجب رفع موافقة خطية مستنيرة (أو موافقة الولي). وتلتزم الحالات بإعلان هلسنكي ومتطلبات لجان الأخلاقيات المحلية.",
        },
      },
      {
        h: { en: "Authorship & conflicts", ar: "التأليف وتضارب المصالح" },
        p: {
          en: "Authorship requires substantial contribution to the case. All authors must approve submission. Financial or personal conflicts of interest must be disclosed. The submitting author may choose to be named or to remain anonymous, subject to committee approval.",
          ar: "يتطلب التأليف إسهاماً جوهرياً في الحالة. ويجب أن يوافق جميع المؤلفين على التقديم. ويجب الإفصاح عن أي تضارب مصالح مالي أو شخصي. ويجوز للمؤلف المقدِّم اختيار ذكر اسمه أو البقاء مجهولاً، بموافقة اللجنة.",
        },
      },
      {
        h: { en: "Plagiarism, corrections & retractions", ar: "الانتحال والتصحيحات والسحب" },
        p: {
          en: "Submissions must be original and not under review elsewhere; plagiarism or fabricated content is rejected. Genuine errors are corrected with a dated correction notice; serious problems (e.g., consent or integrity violations) lead to a clearly-labelled retraction while preserving the record.",
          ar: "يجب أن تكون المساهمات أصيلة وغير قيد التحكيم في مكان آخر؛ ويُرفض الانتحال أو المحتوى الملفّق. وتُصحَّح الأخطاء الحقيقية بإشعار تصحيح مؤرّخ؛ أما المشكلات الجسيمة (كانتهاك الموافقة أو النزاهة) فتؤدي إلى سحب موسوم بوضوح مع حفظ السجل.",
        },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "author-guidelines",
    title: { en: "Author Guidelines", ar: "إرشادات المؤلفين" },
    summary: {
      en: "How to prepare and submit a case (CARE-based).",
      ar: "كيفية إعداد الحالة وتقديمها (وفق CARE).",
    },
    sections: [
      {
        h: { en: "Before you submit", ar: "قبل التقديم" },
        p: {
          en: "Confirm the case is fully anonymized and, where needed, that consent is obtained. Prepare the content following the CARE checklist for case reports.",
          ar: "تأكد أن الحالة مجهولة الهوية بالكامل، وأن الموافقة مأخوذة عند الحاجة. وأعدّ المحتوى وفق قائمة CARE لتقارير الحالات.",
        },
      },
      {
        h: { en: "Required structure", ar: "البنية المطلوبة" },
        p: {
          en: "Title; one-paragraph summary (abstract); specialty and case type; anonymized patient demographics (age, sex); presentation; investigations; diagnosis; treatment; outcome; and learning points. References should be listed with DOIs where available. An illustrative image (scan, ECG, clinical photo) is welcome if de-identified.",
          ar: "العنوان؛ ملخص من فقرة واحدة (مستخلص)؛ التخصص ونوع الحالة؛ بيانات المريض المجهّلة (العمر، الجنس)؛ العرض السريري؛ الفحوصات؛ التشخيص؛ العلاج؛ المآل؛ ونقاط التعلّم. وتُدرَج المراجع مع معرّفات DOI إن وُجدت. ويُرحَّب بصورة توضيحية (أشعة، تخطيط قلب، صورة سريرية) إن كانت مجرّدة من الهوية.",
        },
      },
      {
        h: { en: "How to submit", ar: "كيفية التقديم" },
        p: {
          en: "Use the online submission form at /cases/submit. You will receive a decision by email after peer review, usually within 7 days. There are no fees at any stage.",
          ar: "استخدم نموذج التقديم الإلكتروني على /cases/submit. وستصلك النتيجة بالبريد بعد التحكيم، عادةً خلال 7 أيام. ولا توجد أي رسوم في أي مرحلة.",
        },
      },
    ],
  },
  /* ---------------------------------------------------------------- */
  {
    slug: "open-access",
    title: { en: "Open Access, Copyright & Archiving", ar: "الوصول المفتوح وحقوق النشر والأرشفة" },
    summary: {
      en: "Licensing, ownership, fees, and preservation.",
      ar: "الترخيص والملكية والرسوم والحفظ.",
    },
    sections: [
      {
        h: { en: "Open access & license", ar: "الوصول المفتوح والترخيص" },
        p: {
          en: "All content is open access under the Creative Commons Attribution 4.0 (CC BY 4.0) license. Anyone may read, share, and reuse the work with proper attribution to the author and the Clinical Case Library.",
          ar: "كل المحتوى مفتوح الوصول بموجب رخصة المشاع الإبداعي للنسب 4.0 (CC BY 4.0). يحق للجميع القراءة والمشاركة وإعادة الاستخدام مع النسب الصحيح للمؤلف ولمكتبة الحالات السريرية.",
        },
      },
      {
        h: { en: "Copyright", ar: "حقوق النشر" },
        p: {
          en: "Authors retain copyright of their work and grant the Library a license to publish under CC BY 4.0.",
          ar: "يحتفظ المؤلفون بحقوق النشر لأعمالهم، ويمنحون المكتبة ترخيصاً للنشر بموجب CC BY 4.0.",
        },
      },
      {
        h: { en: "Fees", ar: "الرسوم" },
        p: {
          en: "There are no article-processing charges (APCs), submission fees, or any other charges. Publication is free for authors and readers.",
          ar: "لا توجد رسوم معالجة مقالات (APC) ولا رسوم تقديم ولا أي رسوم أخرى. والنشر مجاني للمؤلفين والقرّاء.",
        },
      },
      {
        h: { en: "Digital preservation", ar: "الحفظ الرقمي" },
        p: {
          en: "Each case has a persistent URL and, once issued, a DOI. Article metadata and content are version-controlled and backed up, and pages are openly archivable (e.g., the Internet Archive). Enrolment in a long-term preservation service is planned as the collection grows.",
          ar: "لكل حالة رابط دائم، ومعرّف DOI عند إصداره. وتُدار بيانات المقالات ومحتواها بنظام إصدارات مع نسخ احتياطي، والصفحات قابلة للأرشفة العلنية (مثل Internet Archive). ويُخطَّط للانضمام إلى خدمة حفظ طويلة المدى مع نمو المجموعة.",
        },
      },
    ],
  },
];

export function getPolicyDoc(slug: string): PolicyDoc | undefined {
  return POLICY_DOCS.find((d) => d.slug === slug);
}
