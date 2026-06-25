import { useState } from 'react'

import {

  ONBOARDING_PROFILE_OPTIONS,

  PROFILE_BEHAVIOUR_CONFIGS,

} from '../profiles/profileConfig'

import { DEFAULT_PERSONALITY_TRAITS } from '../profiles/personalityTraits'

import type { BehaviourProfileId, PersonalityTraits } from '../domain/types'

import { useAppStore } from '../store/AppStoreContext'

import { ANTI_STREAK_NOTICE } from '../copy/messages'

import { PersonalityTraitsEditor } from '../components/PersonalityTraitsEditor'
import { SafetyBlockNotice } from '../components/SafetyBlockNotice'



export function Onboarding() {

  const { completeOnboarding } = useAppStore()

  const [step, setStep] = useState<1 | 2>(1)

  const [selected, setSelected] = useState<BehaviourProfileId[]>([])

  const [personality, setPersonality] = useState<PersonalityTraits>({
    ...DEFAULT_PERSONALITY_TRAITS,
  })
  const [safetyError, setSafetyError] = useState<string | null>(null)



  const toggle = (id: BehaviourProfileId) => {

    setSelected((prev) =>

      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],

    )

  }



  const profiles = selected.length > 0 ? selected : (['general'] as BehaviourProfileId[])



  const handleFinish = (withPersonality: boolean) => {
    setSafetyError(null)
    const err = completeOnboarding(
      profiles,
      withPersonality ? { ...personality, configured: true } : undefined,
    )
    if (err) setSafetyError(err)
  }



  if (step === 2) {

    return (

      <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">

        <div className="mb-6 text-center">

          <p className="text-xs font-medium uppercase tracking-wide text-accent">Step 2 of 2</p>

          <h1 className="mt-2 text-2xl font-semibold text-text">How do you usually approach habits?</h1>

          <p className="mt-2 text-sm text-text-muted">

            Optional sliders and traits fine-tune cues, copy, and feedback — on top of the profiles you

            picked. Skip if you prefer defaults.

          </p>

        </div>



        <PersonalityTraitsEditor

          value={personality}

          onChange={setPersonality}

          compact

        />

        {safetyError && <SafetyBlockNotice message={safetyError} className="mt-4" />}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row">

          <button

            type="button"

            onClick={() => handleFinish(true)}

            className="flex-1 rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover"

          >

            Save and continue

          </button>

          <button

            type="button"

            onClick={() => handleFinish(false)}

            className="flex-1 rounded-lg border border-border py-3 text-sm font-medium text-text hover:bg-slate-50"

          >

            Skip — use defaults

          </button>

        </div>



        <button

          type="button"

          onClick={() => setStep(1)}

          className="mt-4 text-center text-sm text-text-muted hover:text-text"

        >

          Back to profiles

        </button>

      </div>

    )

  }



  return (

    <div className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">

      <div className="mb-8 text-center">

        <p className="text-xs font-medium uppercase tracking-wide text-accent">Step 1 of 2</p>

        <div className="mx-auto mb-4 mt-4 flex size-12 items-center justify-center rounded-xl bg-accent text-white">

          <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">

            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />

          </svg>

        </div>

        <h1 className="text-2xl font-semibold text-text">Welcome to HabituAll</h1>

        <p className="mt-2 text-sm text-text-muted">

          What are you working with? Pick any that apply — profiles are combinable and

          not diagnoses.

        </p>

      </div>



      <div className="space-y-2">

        {ONBOARDING_PROFILE_OPTIONS.map((opt) => (

          <button

            key={opt.id}

            type="button"

            onClick={() => toggle(opt.id)}

            className={`w-full rounded-xl border p-4 text-left transition-colors ${

              selected.includes(opt.id)

                ? 'border-accent bg-accent/5'

                : 'border-border bg-surface-raised hover:border-slate-300'

            }`}

          >

            <span className="block font-medium text-text">{opt.label}</span>

            <span className="mt-1 block text-sm text-text-muted">{opt.description}</span>

          </button>

        ))}



        <button

          type="button"

          onClick={() => toggle('general')}

          className={`w-full rounded-xl border p-4 text-left transition-colors ${

            selected.length === 0 || selected.includes('general')

              ? 'border-accent bg-accent/5'

              : 'border-border bg-surface-raised'

          }`}

        >

          <span className="block font-medium text-text">

            {PROFILE_BEHAVIOUR_CONFIGS.general.label}

          </span>

          <span className="mt-1 block text-sm text-text-muted">

            {PROFILE_BEHAVIOUR_CONFIGS.general.description}

          </span>

        </button>

      </div>



      <p className="mt-6 text-center text-xs text-text-muted">{ANTI_STREAK_NOTICE}</p>



      <button

        type="button"

        onClick={() => setStep(2)}

        className="mt-6 w-full rounded-lg bg-accent py-3 text-sm font-medium text-white hover:bg-accent-hover"

      >

        Continue

      </button>

    </div>

  )

}

