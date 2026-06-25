/**
 * Living bibliography — keep in sync with docs/RESEARCH.md, ARCHITECTURE.md §2, and the in-app Research page.
 *
 * Note on accuracy: bibliographic details should be verified against original publications
 * before any formal/clinical use. DOIs and links provided where available.
 */
export type SourceTier = 'primary' | 'secondary'

export type ResearchCategory =
  | 'automaticity'
  | 'implementation_intentions'
  | 'digital_design'
  | 'adhd_executive'
  | 'adhd_reward'
  | 'autism'
  | 'depression_anxiety'
  | 'behaviour_change'
  | 'secondary'

export type ResearchSource = {
  id: string
  tier: SourceTier
  category: ResearchCategory
  authors: string
  year: number
  title: string
  summary: string
  informs: string[]
  citation?: string
  doi?: string
  url?: string
  note?: string
  verified: boolean
}

export function sourceUrl(source: ResearchSource): string | undefined {
  if (source.url) return source.url
  if (source.doi) return `https://doi.org/${source.doi}`
  return undefined
}

// ——— In-app disclaimer text (ready to paste) ———

export const RESEARCH_DISCLAIMER_FULL = `About the science behind this app

This app's approach to building habits is informed by peer-reviewed research in behavioural psychology and cognitive neuroscience, including studies on habit automaticity, implementation intentions, and behavioural activation. Features adapt to a profile you select; these profiles are non-clinical UX settings, not a diagnosis or assessment, and the app is not a medical or mental-health treatment tool. If you're struggling with your mental health, please speak to a qualified professional. A full list of sources is available under Research in the sidebar.`

export const RESEARCH_DISCLAIMER_SHORT =
  'Built on peer-reviewed habit-formation and behaviour-change research. Profiles are UX settings, not diagnoses. Not a substitute for professional mental-health care.'

export const RESEARCH_ACCURACY_NOTE =
  'Bibliographic details were compiled from a research summary and should be verified against the original publications before any formal or clinical use. DOIs and links are provided where available.'

export const RESEARCH_CAVEATS = [
  'Much of the ADHD exercise and executive-function evidence is from children and adolescents, not adults.',
  'The autism literature is largely about reducing rigidity and supporting transitions, not building newly chosen habits — the app applies it slightly off-label.',
  'Digital behavioural-activation benefits tend to fade by ~12 months, so the design assumes maintenance matters as much as onboarding.',
  'Habit-formation timelines are highly individual (18–254+ days); any single number is a median, not a promise.',
  'Delay discounting as a transdiagnostic marker has supporting preprint literature — cite cautiously until peer-reviewed.',
  'ADHD gamification claims rest mostly on applied/practitioner writing; the underlying delay-discounting mechanism is better supported than specific gamification designs.',
]

// ——— Sources ———

export const RESEARCH_SOURCES: ResearchSource[] = [
  // ── Habit formation & automaticity ──
  {
    id: 'lally-2010',
    tier: 'primary',
    category: 'automaticity',
    authors: 'Lally, P., et al.',
    year: 2010,
    title: 'How are habits formed: Modelling habit formation in the real world',
    summary:
      'The "66 days, range 18–254" study. Habit automaticity grows asymptotically; median ~66 days to high automaticity with wide individual variation.',
    informs: ['No-reset automaticity engine', 'Honest timeline copy', 'No "21 days" promises'],
    citation:
      'Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.',
    verified: true,
  },
  {
    id: 'habit-meta-2024-healthcare',
    tier: 'primary',
    category: 'automaticity',
    authors: 'Systematic review & meta-analysis (2024)',
    year: 2024,
    title: 'Habit formation systematic review — Healthcare',
    summary:
      '~20 studies, ~2,601 participants; confirmed median habit-formation times of ~59–66 days. Supports asymptotic automaticity model over fixed-day counters.',
    informs: ['Automaticity curve', 'Honest timeline messaging', 'No streak resets'],
    note: 'Verify author list and exact journal citation against original publication.',
    verified: false,
  },
  {
    id: 'buabang-2024',
    tier: 'primary',
    category: 'automaticity',
    authors: 'Buabang, E. K., Donegan, K. R., Rafei, P., & Gillan, C. M.',
    year: 2024,
    title: 'Leveraging cognitive neuroscience for making and breaking real-world habits',
    summary:
      'Reviews cognitive neuroscience of real-world habit formation and change — informs automaticity as a distinct system from goal-directed behaviour.',
    informs: ['Automaticity engine design', 'Habit vs goal-directed framing'],
    citation:
      'Buabang, E. K., Donegan, K. R., Rafei, P., & Gillan, C. M. (2024). Trends in Cognitive Sciences.',
    doi: '10.1016/j.tics.2024.10.006',
    verified: true,
  },
  {
    id: 'wood-2022',
    tier: 'primary',
    category: 'automaticity',
    authors: 'Wood, W., et al.',
    year: 2022,
    title: 'Habits and goals in human behavior: Separate but interacting systems',
    summary:
      'Habits and goals are separate but interacting systems — supports cue-driven habits and not over-relying on willpower.',
    informs: ['Cue-anchored habits', 'Offload executive function principle'],
    citation:
      'Wood, W., et al. (2022). Perspectives on Psychological Science, 17(3), 590–605.',
    verified: false,
  },
  {
    id: 'gardner-2024',
    tier: 'primary',
    category: 'automaticity',
    authors: 'Gardner, B., et al.',
    year: 2024,
    title: 'What is habit and how can it be used to change real-world behaviour?',
    summary:
      'Contemporary synthesis of habit theory applied to real-world behaviour change.',
    informs: ['Automaticity metric', 'Behaviour-change framing', 'Personality-informed UX adaptation'],
    citation: 'Gardner, B., et al. (2024). Social and Personality Psychology Compass, 18, e12975.',
    verified: false,
  },
  {
    id: 'roberts-2014-conscientiousness',
    tier: 'secondary',
    category: 'behaviour_change',
    authors: 'Roberts, B. W., et al.',
    year: 2014,
    title: 'What is conscientiousness and how can it be assessed?',
    summary:
      'Conscientiousness relates to self-regulation and sustained behaviour — informs scaffolding (cues, tiny starts) when users report lower planning follow-through.',
    informs: ['Personality sliders', 'Cue scaffolding for low conscientiousness'],
    citation:
      'Roberts, B. W., Jackson, J. J., Fayard, J. V., Edmonds, G., & Meints, J. (2014). Developmental Psychology, 50(5), 1315–1330.',
    verified: false,
  },
  {
    id: 'wood-neal-2007',
    tier: 'primary',
    category: 'behaviour_change',
    authors: 'Wood, W., & Neal, D. T.',
    year: 2007,
    title: 'A new look at habits and the habit-goal interface',
    summary:
      'Habits are cue-response associations strengthened in stable context — inconsistent contexts slow encoding.',
    informs: ['Cue stability (planned engine tuning)', 'Anchor cues over arbitrary schedules'],
    citation:
      'Wood, W., & Neal, D. T. (2007). Psychological Review, 114(4), 843–863.',
    verified: true,
  },

  // ── Implementation intentions ──
  {
    id: 'gollwitzer-sheeran-2006',
    tier: 'primary',
    category: 'implementation_intentions',
    authors: 'Gollwitzer, P. M., & Sheeran, P.',
    year: 2006,
    title: 'Implementation intentions and goal achievement: A meta-analysis of effects and processes',
    summary: 'Medium-to-large effect (d ≈ 0.65) for if-then plans on goal attainment.',
    informs: ['If-then habit builder', 'Cue-anchored habits'],
    citation:
      'Gollwitzer, P. M., & Sheeran, P. (2006). Advances in Experimental Social Psychology, 38, 69–119.',
    verified: true,
  },
  {
    id: 'sheeran-2024-642',
    tier: 'primary',
    category: 'implementation_intentions',
    authors: 'Sheeran, P., et al.',
    year: 2024,
    title: 'The When and How of Planning: Meta-Analysis of Implementation Intentions in 642 Tests',
    summary:
      'Contingent "if-then" plans outperform plain scheduling across 642 tests.',
    informs: ['Cue types (anchor preferred)', 'Reminders on cues not clocks alone (planned)'],
    verified: false,
  },
  {
    id: 'mci-meta-2021',
    tier: 'primary',
    category: 'implementation_intentions',
    authors: 'Mental Contrasting with Implementation Intentions meta-analysis',
    year: 2021,
    title: 'MCII meta-analysis — 21 studies, 15,907 participants',
    summary: 'Combined mental contrasting + implementation intentions: g ≈ 0.336 across 21 studies.',
    informs: ['If-then planning', 'Future: values-linked goal framing'],
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8149892/',
    verified: true,
  },

  // ── Digital behaviour-change design ──
  {
    id: 'zhu-2024-jmir',
    tier: 'primary',
    category: 'digital_design',
    authors: 'Zhu, Y., et al.',
    year: 2024,
    title: 'Digital Behavior Change Intervention Designs for Habit Formation: Systematic Review',
    summary:
      'Self-monitoring, goal setting, and prompts/cues are among the most-used effective techniques in digital habit interventions.',
    informs: ['Daily view design', 'Cue-based reminders (planned)', 'Progress self-monitoring'],
    citation: 'Journal of Medical Internet Research.',
    doi: '10.2196/54375',
    verified: true,
  },

  // ── ADHD executive function ──
  {
    id: 'adhd-exec-2024-jcm',
    tier: 'primary',
    category: 'adhd_executive',
    authors: 'Systematic Review (2024)',
    year: 2024,
    title: 'Executive Function Stimulation Methods in the ADHD Population',
    summary:
      'Working memory, inhibition, and cognitive flexibility benefit most from stimulation approaches — supports offloading EF to the app.',
    informs: ['ADHD profile: external reminders', 'Offload executive function principle'],
    citation: 'Journal of Clinical Medicine, 13, 4208.',
    doi: '10.3390/jcm13144208',
    verified: true,
  },
  {
    id: 'adhd-exec-meta-2023',
    tier: 'primary',
    category: 'adhd_executive',
    authors: 'Systematic review & meta-analysis (2023)',
    year: 2023,
    title: 'Non-pharmacological interventions on executive functions in ADHD',
    summary: '67 studies, 3,147 participants; combined g ≈ 0.673; exercise shows large effects on inhibitory control.',
    informs: ['ADHD profile design', 'Tiny-version / low-friction starts'],
    note: 'ScienceDirect — verify exact citation.',
    verified: false,
  },
  {
    id: 'adhd-exercise-nma',
    tier: 'primary',
    category: 'adhd_executive',
    authors: 'Network meta-analysis',
    year: 0,
    title: 'Comparative effectiveness of physical exercise on executive functions in ADHD',
    summary: '59 studies; open-skill activities most effective for executive functions.',
    informs: ['ADHD profile (exercise habits context)'],
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10080114/',
    verified: true,
  },
  {
    id: 'liang-2021',
    tier: 'primary',
    category: 'adhd_executive',
    authors: 'Liang, X., et al.',
    year: 2021,
    title: 'Exercise interventions and executive functions in children/adolescents with ADHD',
    summary: 'Systematic review & meta-analysis of exercise for EF in youth with ADHD.',
    informs: ['ADHD evidence base', 'Caveat: largely paediatric samples'],
    doi: '10.1186/s12966-021-01135-6',
    verified: true,
  },

  // ── ADHD reward / delay discounting ──
  {
    id: 'tripp-wickens-2008',
    tier: 'primary',
    category: 'adhd_reward',
    authors: 'Tripp, G., & Wickens, J. R.',
    year: 2008,
    title: 'Dopamine transfer deficit: Altered reinforcement mechanisms in ADHD',
    summary:
      'Neurobiological theory of altered reinforcement — supports immediate reward delivery on completion.',
    informs: ['Immediate completion reward', 'ADHD high-intensity feedback'],
    doi: '10.1111/j.1469-7610.2007.01851.x',
    verified: true,
  },
  {
    id: 'adhd-delay-young-children',
    tier: 'primary',
    category: 'adhd_reward',
    authors: 'Delay discounting in ADHD (young children)',
    year: 0,
    title: 'Delay discounting of reward in ADHD',
    summary: 'Steeper delay discounting in young children with ADHD — distant rewards under-register.',
    informs: ['No distant-only rewards', 'Immediate feedback on every action'],
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3059765/',
    verified: true,
  },
  {
    id: 'adhd-delay-animal',
    tier: 'primary',
    category: 'adhd_reward',
    authors: 'Animal model of ADHD',
    year: 0,
    title: 'Previous experience with delays affects delay discounting',
    summary: 'Animal model evidence for altered delay discounting mechanisms.',
    informs: ['Reward timing design'],
    url: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9926738/',
    verified: true,
  },

  // ── Autism ──
  {
    id: 'cooper-russell-2025',
    tier: 'primary',
    category: 'autism',
    authors: 'Cooper, K., & Russell, A.',
    year: 2025,
    title: 'Insistence on sameness, repetitive negative thinking and mental health in autistic adults',
    summary: 'Links insistence on sameness to mental health in autistic adults.',
    informs: ['Predictability as reward', 'No surprise UI changes'],
    doi: '10.1177/13623613241275468',
    verified: true,
  },
  {
    id: 'spackman-2023',
    tier: 'primary',
    category: 'autism',
    authors: 'Spackman, E., et al.',
    year: 2023,
    title: 'Characterizing Subdomains of Insistence on Sameness in Autistic Youth',
    summary:
      'Sameness splits into routines, rituals, and insistence on others\' sameness — informs graded change design.',
    informs: ['Advance change notice', 'Graded change introduction (planned)'],
    doi: '10.1002/aur.3033',
    verified: true,
  },
  {
    id: 'autism-transitions-2015',
    tier: 'primary',
    category: 'autism',
    authors: 'Review (2015)',
    year: 2015,
    title: 'Behavioral Strategies for Assisting Persons with Difficulties Transitioning between Activities',
    summary: 'Transition-support strategies for activity changes — basis for "next up" cards.',
    informs: ['"Next up" transition card', 'Autism profile transition support'],
    doi: '10.1007/s40489-015-0056-7',
    verified: true,
  },

  // ── Depression / anxiety (BA) ──
  {
    id: 'alber-2023',
    tier: 'primary',
    category: 'depression_anxiety',
    authors: 'Alber, C. S., et al.',
    year: 2023,
    title: 'Internet-Based Behavioral Activation for Depression: Systematic Review and Meta-Analysis',
    summary: 'Digital BA shows moderate-to-large effects for depression.',
    informs: ['Depression profile', 'Values tags', 'Mood-after tracking'],
    doi: '10.2196/41643',
    verified: true,
  },
  {
    id: 'jia-2025',
    tier: 'primary',
    category: 'depression_anxiety',
    authors: 'Jia, E., et al.',
    year: 2025,
    title: 'Effectiveness of Digital Behavioral Activation for Depression and Anxiety',
    summary:
      'Effective short-to-mid term; benefits diminish by 12 months — maintenance design matters.',
    informs: ['Depression/anxiety profiles', 'Maintenance over onboarding', 'Mood chart'],
    doi: '10.2196/68054',
    verified: true,
  },
  {
    id: 'yisma-2025',
    tier: 'primary',
    category: 'depression_anxiety',
    authors: 'Yisma, E., et al.',
    year: 2025,
    title: 'Efficacy and safety of behavioural activation on depression with co-occurring NCDs',
    summary: 'BA efficacy in depression with co-occurring conditions.',
    informs: ['Behavioural activation model in depression profile'],
    doi: '10.1192/bjo.2024.870',
    verified: true,
  },
  {
    id: 'ba-meta-2023',
    tier: 'primary',
    category: 'depression_anxiety',
    authors: 'Individual behavioural activation meta-analysis (2023)',
    year: 2023,
    title: 'Individual behavioral activation in the treatment of depression',
    summary: '22 RCTs, 819 patients; effect sizes comparable to other established therapies.',
    informs: ['Tiny version / low activation threshold', 'Completion as reward'],
    doi: '10.1080/10503307.2023.2197630',
    verified: true,
  },

  // ── Secondary / applied (use with caution) ──
  {
    id: 'sci-am-2024',
    tier: 'secondary',
    category: 'secondary',
    authors: 'Scientific American',
    year: 2024,
    title: 'How Long Does It Really Take to Form a Habit?',
    summary: 'Science journalism — secondary reporting of Lally et al., not primary research.',
    informs: ['Timeline messaging (secondary only)'],
    note: 'Not peer-reviewed. Use Lally 2010 as primary cite.',
    verified: false,
  },
  {
    id: 'healthline-2025',
    tier: 'secondary',
    category: 'secondary',
    authors: 'Healthline',
    year: 2025,
    title: 'Consumer-health summary of habit-formation timelines',
    summary: 'Popular health media summary — not primary research.',
    informs: [],
    note: 'Not peer-reviewed.',
    verified: false,
  },
  {
    id: 'james-clear',
    tier: 'secondary',
    category: 'secondary',
    authors: 'James Clear',
    year: 0,
    title: 'Popular synthesis of Lally et al. (jamesclear.com)',
    summary: 'Widely cited popular synthesis — not peer-reviewed.',
    informs: [],
    note: 'Cite Lally 2010 directly for any formal use.',
    verified: false,
  },
  {
    id: 'adhd-gamification-applied',
    tier: 'secondary',
    category: 'secondary',
    authors: 'Applied / practitioner sources',
    year: 0,
    title: 'ADHD gamification (Medium, practitioner sites)',
    summary:
      'Applied writing on gamification for ADHD — underlying delay-discounting mechanism is better supported than specific gamification designs.',
    informs: ['ADHD visible rewards (directionally supported, not RCT-grade)'],
    note: 'happiful.com, adhdcentre.co.uk, etc. — not RCT-grade.',
    verified: false,
  },
]

export const RESEARCH_CATEGORIES: Record<ResearchCategory, string> = {
  automaticity: 'Habit formation & automaticity',
  implementation_intentions: 'Implementation intentions ("if-then" cues)',
  digital_design: 'Digital behaviour-change design',
  adhd_executive: 'ADHD — executive function',
  adhd_reward: 'ADHD — reward & delay discounting',
  autism: 'Autism — routine, sameness & transitions',
  depression_anxiety: 'Depression & anxiety — behavioural activation',
  behaviour_change: 'Behaviour change mechanisms',
  secondary: 'Secondary / applied sources (use with caution)',
}

export const PRIMARY_CATEGORIES = (
  Object.keys(RESEARCH_CATEGORIES) as ResearchCategory[]
).filter((c) => c !== 'secondary')
