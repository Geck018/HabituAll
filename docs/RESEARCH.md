# Research Basis & References

This app's habit-formation logic is grounded in published behaviour-change research. This file lists the sources behind each design decision and provides disclaimer text for in-app use.

**Canonical machine-readable list:** [`src/research/sources.ts`](../src/research/sources.ts) (powers the in-app **Research** page).

> **Note on accuracy:** Bibliographic details below were compiled from the research summary and should be verified against the original publications before any formal/clinical use. DOIs and links are provided where available.

---

## In-app disclaimer (ready to paste)

### Full (`RESEARCH_DISCLAIMER_FULL`)

See `src/research/sources.ts` — rendered on the Research page under "About the science".

### Shorter variant (sidebar footer / about)

> Built on peer-reviewed habit-formation and behaviour-change research. Profiles are UX settings, not diagnoses. Not a substitute for professional mental-health care.

---

## Core peer-reviewed sources

### Habit formation & automaticity

- **Lally, P., et al. (2010).** How are habits formed: Modelling habit formation in the real world. *European Journal of Social Psychology*, 40(6), 998–1009. — The "66 days, range 18–254" study; basis for the no-reset automaticity engine.
- **Systematic review & meta-analysis (2024),** *Healthcare* — ~20 studies, ~2,601 participants; confirmed median habit-formation times of ~59–66 days. *(Verify author list/exact cite.)*
- **Buabang, E. K., Donegan, K. R., Rafei, P., & Gillan, C. M. (2024).** Leveraging cognitive neuroscience for making and breaking real-world habits. *Trends in Cognitive Sciences*. DOI: [10.1016/j.tics.2024.10.006](https://doi.org/10.1016/j.tics.2024.10.006)
- **Wood, W., et al. (2022).** Habits and goals in human behavior: Separate but interacting systems. *Perspectives on Psychological Science*, 17(3), 590–605.
- **Gardner, B., et al. (2024).** What is habit and how can it be used to change real-world behaviour? *Social and Personality Psychology Compass*, 18, e12975. — Also informs personality-informed UX adaptation.
- **Roberts, B. W., et al. (2014).** What is conscientiousness and how can it be assessed? *Developmental Psychology*, 50(5), 1315–1330. — Informs cue scaffolding when users report lower planning follow-through.

### Implementation intentions ("if-then" cues)

- **Gollwitzer, P. M., & Sheeran, P. (2006).** Implementation intentions and goal achievement: A meta-analysis of effects and processes. *Advances in Experimental Social Psychology*, 38, 69–119. — Medium-to-large effect (d≈0.65).
- **Sheeran, P., et al. (2024).** The When and How of Planning: Meta-Analysis of the Scope and Components of Implementation Intentions in 642 Tests. — Contingent "if-then" plans outperform plain scheduling.
- **Mental Contrasting with Implementation Intentions meta-analysis (2021),** 21 studies / 15,907 participants, g≈0.336. [PMC8149892](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8149892/)

### Digital behaviour-change design

- **Zhu, Y., et al. (2024).** Digital Behavior Change Intervention Designs for Habit Formation: Systematic Review. *Journal of Medical Internet Research*. DOI: [10.2196/54375](https://doi.org/10.2196/54375)

### ADHD (executive function & exercise)

- **Systematic Review of Executive Function Stimulation Methods in the ADHD Population (2024).** *Journal of Clinical Medicine*, 13, 4208. DOI: [10.3390/jcm13144208](https://doi.org/10.3390/jcm13144208)
- **Non-pharmacological interventions on executive functions in ADHD (2023).** ScienceDirect — 67 studies, 3,147 participants; combined g≈0.673.
- **Comparative effectiveness of physical exercise on executive functions in ADHD:** network meta-analysis. [PMC10080114](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10080114/)
- **Liang, X., et al. (2021).** Exercise interventions and executive functions in children/adolescents with ADHD. DOI: [10.1186/s12966-021-01135-6](https://doi.org/10.1186/s12966-021-01135-6)

### ADHD (reward / delay discounting)

- **Tripp, G., & Wickens, J. R. (2008).** Dopamine transfer deficit. DOI: [10.1111/j.1469-7610.2007.01851.x](https://doi.org/10.1111/j.1469-7610.2007.01851.x)
- Delay discounting of reward in ADHD (young children). [PMC3059765](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3059765/)
- Previous experience with delays affects delay discounting (animal model). [PMC9926738](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9926738/)

### Autism (routine, sameness, transitions)

- **Cooper, K., & Russell, A. (2025).** Insistence on sameness… *Autism*. DOI: [10.1177/13623613241275468](https://doi.org/10.1177/13623613241275468)
- **Spackman, E., et al. (2023).** Characterizing Subdomains of Insistence on Sameness. DOI: [10.1002/aur.3033](https://doi.org/10.1002/aur.3033)
- **Transition support review (2015).** DOI: [10.1007/s40489-015-0056-7](https://doi.org/10.1007/s40489-015-0056-7)

### Depression / anxiety (Behavioural Activation)

- **Alber, C. S., et al. (2023).** Internet-Based BA for Depression. DOI: [10.2196/41643](https://doi.org/10.2196/41643)
- **Jia, E., et al. (2025).** Digital BA for Depression and Anxiety. DOI: [10.2196/68054](https://doi.org/10.2196/68054)
- **Yisma, E., et al. (2025).** BA on depression with co-occurring NCDs. DOI: [10.1192/bjo.2024.870](https://doi.org/10.1192/bjo.2024.870)
- **Individual BA meta-analysis (2023).** DOI: [10.1080/10503307.2023.2197630](https://doi.org/10.1080/10503307.2023.2197630)

---

## Secondary / applied sources (use with caution)

- Scientific American (2024) — secondary reporting of Lally
- Healthline (2025) — consumer-health summary
- jamesclear.com — popular synthesis of Lally
- ADHD gamification — Medium, practitioner sites (directionally supported, not RCT-grade)

---

## Honesty caveats

See `RESEARCH_CAVEATS` in `src/research/sources.ts` — also shown in-app on the Research page.

## Content safety (not research — product policy)

Local pattern checks (`src/safety/contentModeration.ts`) block harmful wording in **replacement-behaviour** fields before save. The optional `leavingBehind` field (what the user is quitting) is exempt so recovery goals can be named honestly. Nothing is reported or sent off-device.

---

## Maintenance

When adding a source: update `src/research/sources.ts` → this file → ARCHITECTURE.md §2 summary table.
