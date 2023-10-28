import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { useContext, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { TrustScoreKeyEnum, trustScores } from '@/data'
import { TrustScoreInfo, TrustScoreKey } from "@/types/local"
import { Input } from "@/components/ui/input"
import { Switch } from '@/components/ui/switch'
import { ToastContainer, toast } from 'react-toastify';
import { z } from 'zod'
import { cn } from '@/utils/cn'
import { zodResolver } from '@hookform/resolvers/zod'
import { FieldErrors, FieldValues, UseFormReturn, useForm } from 'react-hook-form'
import 'react-toastify/dist/ReactToastify.css';
import useTrustlist from "@/hooks/useTrustlist"
import User from '../contexts/User'

const NewOfferResponseSchema = z.object({
  epoch: z.number(),
  offerAmount: z.number().min(1, 'Please input the amount of your offer'),
  responderId: z.string(),
  revealTrustScores: z.record(z.boolean()),
  scores: z.record(z.string().optional())
})

export type NewOfferResponse = z.infer<typeof NewOfferResponseSchema>

type FormState = {
  fields: NewOfferResponse
  isLoading: boolean
  error?: string
}

type OfferFormValues = FieldValues & NewOfferResponse

type StepSectionProps = UseFormReturn<OfferFormValues>

const initialFormState: FormState = {
  fields: {
    epoch: 0,
    offerAmount: 0,
    responderId: '',
    revealTrustScores: {
      [TrustScoreKeyEnum.LP]: true,
      [TrustScoreKeyEnum.LO]: true,
      [TrustScoreKeyEnum.CB]: true,
      [TrustScoreKeyEnum.GV]: true,
    },
    scores: {
      [TrustScoreKeyEnum.LP]: '',
      [TrustScoreKeyEnum.LO]: '',
      [TrustScoreKeyEnum.CB]: '',
      [TrustScoreKeyEnum.GV]: '',
    }
  },
  isLoading: true,
}

const InputOfferAmount = ({ watch, control, formState: { errors }, setValue, trigger }: StepSectionProps) => {
  const amount = watch('offerAmount')
  const [displayAmount, setDisplayAmount] = useState('');

  useEffect(() => {
    if (amount)
      setDisplayAmount(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount));
  }, [])

  return (
    <section className='flex flex-col space-y-4'>
      <FormField
        control={control}
        name="offerAmount"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel className='text-base'>Enter the amount you're offering</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='text'
                  value={displayAmount}
                  className='w-[180px] text-base'
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/[^\d\.]/g, ''));
                    if (!isNaN(value)) {
                      setValue('offerAmount', value);
                      setDisplayAmount(e.target.value)
                    }
                  }}
                  onBlur={async () => {
                    await trigger('price');
                    field.onBlur();
                    setDisplayAmount(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount));
                  }}
                />
              </FormControl>
              {errors && <FormMessage>{errors.offerAmount?.message}</FormMessage>}
            </FormItem>
          )
        }}
      />
    </section>
  )
}

type TrustScoreFormStepProps = StepSectionProps & { trustScores: Record<TrustScoreKey, TrustScoreInfo> }

const TrustScoreFormStep = ({ control, trustScores: trustScoresFromData }: TrustScoreFormStepProps) => {
  return (
    <section className='flex flex-col space-y-4'>
      {Object.entries(trustScoresFromData).map(([key, scoreInfo]) => (
        <FormField
          key={key}
          control={control}
          name={`revealTrustScores.${key}`}
          render={({ field }) => (
            <FormItem className='flex justify-between items-start space-x-6 border border-muted-foreground p-3' key={key}>
              <div>
                <FormLabel className="text-foreground text-lg" htmlFor={key}>
                  {scoreInfo.title}:{' '}<span className="text-blue-700 font-extrabold">{scoreInfo.score}{scoreInfo.score === 'n/a' ? null : '%'}</span>
                </FormLabel>
                <FormDescription className='text-foreground/80'>{scoreInfo.description}</FormDescription>
              </div>
              <FormControl>
                <div className="flex space-x-2">
                  <Switch
                    id={key}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className={cn(field.value ? 'data-[state=checked]:bg-blue-700' : '')}
                  />
                  <p className='text-muted-foreground'>{field.value ? 'Show' : 'Hide'}</p>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </section>
  )
}

const NewOfferPage = () => {
  const { listingId, listingTitle }: any = useParams()
  const { calcScoreFromUserData, makeOffer } = useTrustlist()
  const user = useContext(User)
  const navigate = useNavigate()
  const [trustScoresFromData, setTrustScoresFromData] = useState({ ...trustScores })

  const listForm = useForm({
    resolver: zodResolver(NewOfferResponseSchema),
    defaultValues: initialFormState.fields,
  });
  const onFormError = (errors: FieldErrors) => console.error({ errors })

  const trustScoreKeys = Object.keys(TrustScoreKeyEnum) as (keyof typeof TrustScoreKeyEnum)[]

  const updateScores = useCallback(() => {
    if (user.provableData.length === 0) return;
    for (let i = 0; i < 4; i++) {
      let cumulativeScore = calcScoreFromUserData(Number(user.provableData[i]))
      setTrustScoresFromData((prevData) => {
        return {
          ...prevData,
          [TrustScoreKeyEnum[trustScoreKeys[i]]]: {
            ...prevData[TrustScoreKeyEnum[trustScoreKeys[i]]],
            score: String(cumulativeScore)
          }
        }
      })
    }
  }, [user.provableData]);

  useEffect(() => {
    updateScores();
  }, [])

  const autoTransition = async () => {
    await user.transitionToCurrentEpoch()
    updateScores()
  }

  const transitionAlert = () => toast.promise(autoTransition, {
    pending: "Please wait a moment while you are tranistioned to the current epoch...",
    success: "Transition successful!  Please confirm whether you would like your updated scores to be shown and re-submit your offer.",
    error: "Failed to transition to the current epoch, please try again in a moment."
  });

  const getEpochAndKey = async () => {
    const { userState } = user
    if (!userState) throw new Error('Please join as a member and try again');
    let userStateUpdated = false
    const currentEpoch = userState.sync.calcCurrentEpoch()
    if (currentEpoch !== (await userState.latestTransitionedEpoch())) {
      try {
        transitionAlert()
        console.log('transitioning...')
      } catch (error) {
        throw new Error("Failed to transition to the new epoch");
      }
      userStateUpdated = true
    }

    const epkNonce = Math.floor(Math.random() * 3)
    const responderId = user.epochKey(epkNonce) 

    return { userUpdated: userStateUpdated, currentEpoch: currentEpoch, userEpochKey: responderId, nonce: epkNonce }
  }

  const generateScores = (scoresRevealed: Record<TrustScoreKey, boolean>) => {
    return Object.entries(scoresRevealed).reduce((newScores, [scoreKey, isRevealed]) => {
      if(isRevealed){
        return { ...newScores, [scoreKey as TrustScoreKey]: trustScoresFromData[scoreKey as TrustScoreKey].score }
      }
      return { ...newScores, [scoreKey as TrustScoreKey]: 'X' }
    }, {})
  }

  const submitOfferAlert = (newData: any) => toast.promise(makeOffer(newData), {
    pending: "Please wait a moment while your offer is being submitted...",
    success: { render: 
                <div className="flex space-around gap-3">
                  <div>
                    <div>Offer submitted! One "offered" point will be added to your LO score if your offer is accepted by the lister.</div>
                    <div>You will have access to the lister's contact info if they accept your offer, open your Dashboard to check the status.  </div>
                  </div>
                  <button className="text-white font-lg border-1 border-white px-4 py-2"
                          onClick={() => {
                            listForm.reset();
                            navigate('/')
                          }}>
                    Home
                  </button>
                </div>,
              closeButton: false },
    error: "There was a problem submitting you offer, please try again"
  });

  const submitOffer = async (data: OfferFormValues) => {
    try {
      const epochAndKey = await getEpochAndKey();
      if (!epochAndKey) {
        throw new Error("Failed to get epoch and key");
      }
      const { userUpdated, currentEpoch, userEpochKey, nonce } = epochAndKey;
      if (userUpdated) return

      const currentScores = generateScores(data.revealTrustScores);
      try {
        const newData = {
          ...data,
          epoch: currentEpoch,
          listingId: listingId,
          listingTitle: listingTitle,
          responderId: userEpochKey,
          offerAmount: String(data.offerAmount),
          scoreString: JSON.stringify(currentScores)
        }
        console.log({ newData });
        submitOfferAlert(newData)
      } catch (offerError) {
        console.error("Error while publishing post: ", offerError);
      }
      
    } catch (epochError) {
      console.error("Error while getting epoch and key: ", epochError);
    }
  }

  return (
    <Form {...listForm} >
      <form onSubmit={listForm.handleSubmit(submitOffer, onFormError)} className='flex flex-col p-3 justify-center container py-6 space-y-3 max-w-3xl text-foreground'>
        <h6 className='text-sm font-semibold tracking-widest uppercase text-foreground/70'>New Offer</h6>
        <InputOfferAmount {...listForm} />
        <TrustScoreFormStep {...listForm} trustScores={trustScoresFromData} />
        <button className='px-2 py-1 bg-blue-600 hover:bg-blue-400 text-background' type="submit">Submit offer</button>
      </form>
      <ToastContainer className='listing-toast' toastClassName='toast' bodyClassName='toast-body' position='bottom-center' autoClose={false} />
    </Form>
  );
}

export default NewOfferPage
