import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import User from "@/contexts/User"
import { TrustScoreKeyEnum, listingCategories, trustScores } from '@/data'
import useTrustlist from "@/hooks/useTrustlist"
import { TrustScoreInfo, TrustScoreKey } from "@/types/local"
import { cn } from '@/utils/cn'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useCallback, useContext, useEffect, useState } from 'react'
import { FieldErrors, FieldValues, UseFormReturn, UseFormTrigger, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import Tooltip from "@/components/Tooltip"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const NewListingResponseSchema = z.object({
  epoch: z.number(),
  categories: z.record(z.string().min(1, 'Please choose an option')),
  title: z.string().min(1, 'Please add a title'),
  price: z.number().min(1, 'Please add the price'), //TODO: usd now , include crypto (?)
  frequency: z.literal("one time"),
  description: z.string().min(1, 'Please describe what you are listing'),
  contact: z.string().min(1, 'Please add a TG or Discord handle'),
  posterId: z.string(),
  revealTrustScores: z.record(z.boolean()),
  scores: z.record(z.number().optional())
})

export type NewListingResponse = z.infer<typeof NewListingResponseSchema>

type FormStep = {
  id: string,
  description?: string,
  fields: string[]
  validate?: (data: NewListingResponse) => boolean,
}

const FormSteps: FormStep[] = [
  { id: 'select-category', description: 'Choose the categories for your listing', fields: ['categories'] },
  { id: 'general-info', description: 'Enter general information', fields: ['title', 'description', 'price'] },
  { id: 'trust-scores', description: 'Choose which trust scores to show', fields: ['revealTrustScores'] },
]

type FormState = {
  fields: NewListingResponse
  step: FormStep
  isLoading: boolean
  error?: string
}

type ListingFormValues = FieldValues & NewListingResponse

type StepSectionProps = UseFormReturn<ListingFormValues>

type FormFooterAndHeaderProps = { currentStep: number, changeStep: React.Dispatch<React.SetStateAction<FormStep>>, trigger: UseFormTrigger<ListingFormValues> }


const createInitialCategories = (sectionsWithCategories: Record<string, string[]>) => {
  // create an empty array for each section in listing type
  return Object.keys(sectionsWithCategories).reduce<Record<string, string>>((acc, key) => {
    acc[key] = '';
    return acc;
  }, {});
}

const initialCategories = createInitialCategories(listingCategories);

const initialFormState: FormState = {
  fields: {
    epoch: 0,
    categories: initialCategories,
    title: '',
    price: 0,
    frequency: 'one time',
    description: '',
    contact: '',
    posterId: '',
    revealTrustScores: {
      [TrustScoreKeyEnum.LP]: true,
      [TrustScoreKeyEnum.LO]: true,
      [TrustScoreKeyEnum.CB]: true,
      [TrustScoreKeyEnum.GV]: true,
    },
    scores: {
      [TrustScoreKeyEnum.LP]: undefined,
      [TrustScoreKeyEnum.LO]: undefined,
      [TrustScoreKeyEnum.CB]: undefined,
      [TrustScoreKeyEnum.GV]: undefined,
    }
  },
  step: FormSteps[0],
  isLoading: true,
}

const SelectCategoryFormStep = ({ control }: StepSectionProps) => (
  <section>
    <div className='flex flex-col text-left'>
      {Object.entries(listingCategories).map(([section, categories]) => (
        <div key={section} className='mt-4'>
          <h6 className='text-base font-semibold'>{section}</h6>
          <hr className='my-1' />
          <section className='flex flex-wrap gap-3'>
            <FormField
              control={control}
              name={`categories.${section}`}
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {categories.map((category, index) => {
                        const newLabel = `${section}--${category}`;
                        return (
                          <FormItem key={index} className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={category} />
                            </FormControl>
                            <FormLabel className="font-normal">{category}</FormLabel>
                          </FormItem>
                        )
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
              }
            />
          </section>
        </div>
      ))}
    </div>
  </section>
)

const GeneralInfoFormStep = ({ watch, control, formState: { errors }, setValue, trigger }: StepSectionProps) => {
  const price = watch('price')
  const [displayPrice, setDisplayPrice] = useState('');

  useEffect(() => {
    if (price)
      setDisplayPrice(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price));
  }, [])

  return (
    <section className='flex flex-col space-y-4'>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Title</FormLabel>
            <FormControl>
              <Input className='text-base'
                {...field}
                onBlur={async (e) => {
                  await trigger('title');
                  field.onBlur();
                }}
              />
            </FormControl>
            {errors && <FormMessage>{errors.title?.message}</FormMessage>}
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="price"
        render={({ field }) => {
          return (
            <FormItem>
              <FormLabel className='text-base'>Price</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type='text'
                  value={displayPrice}
                  className='w-[180px] text-base'
                  onChange={(e) => {
                    const value = parseFloat(e.target.value.replace(/[^\d\.]/g, ''));
                    if (!isNaN(value)) {
                      setValue('price', value);
                      setDisplayPrice(e.target.value)
                    }
                  }}
                  onBlur={async () => {
                    await trigger('price');
                    field.onBlur();
                    setDisplayPrice(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price));
                  }}
                />
              </FormControl>
              {errors && <FormMessage>{errors.price?.message}</FormMessage>}
            </FormItem>
          )
        }}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base'>Description</FormLabel>
            <FormControl>
              <Textarea className='text-base'
                {...field}
                onBlur={async (e) => {
                  await trigger('description');
                  field.onBlur();
                }}
              />
            </FormControl>
            {errors && <FormMessage>{errors.description?.message}</FormMessage>}
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="contact"
        render={({ field }) => (
          <FormItem>
            <FormLabel className='text-base flex gap-2 items-center'>
              Contact
              <Tooltip text='Please include a Telegram or Discord handle. Your contact information will only be shown to the member whose offer you accept.'
                content={
                  <img
                    src={require('../../public/info_icon.svg')}
                    alt="info icon"
                  />
                }
              />
            </FormLabel>
            <FormControl>
              <Input className='text-base'
                {...field}
                onBlur={async (e) => {
                  await trigger('contact');
                  field.onBlur();
                }}
              />
            </FormControl>
            {errors && <FormMessage>{errors.contact?.message}</FormMessage>}
          </FormItem>
        )}
      />
    </section >
  )
}

type TrustScoreFormStepProps = StepSectionProps & { trustScores: Record<TrustScoreKey, TrustScoreInfo> }

const TrustScoreFormStep = ({ control, trustScores: trustScoresFromData }: TrustScoreFormStepProps) => {
  const user = useContext(User)
  const { calcScoreFromUserData } = useTrustlist()
  return (
    <section className='flex flex-col space-y-4'>
      {Object.entries(trustScoresFromData).map(([key, scoreInfo]) => {
        // determine if user has initiated an action for this metric
        const initiated = user.provableData[scoreInfo.index] ? Number(user.provableData[scoreInfo.index] >> BigInt(23)) : 0
        const score =  calcScoreFromUserData(Number(scoreInfo.score))
        return (
          <FormField
            key={key}
            control={control}
            name={`revealTrustScores.${key}`}
            render={({ field }) => (
              <FormItem className='flex justify-between items-start space-x-6 border border-muted-foreground p-3' key={key}>
                <div>
                  <FormLabel className="text-foreground text-lg" htmlFor={key}>
                    {scoreInfo.title}:{' '}<span className="text-blue-700 font-extrabold">{initiated == 0 ? 'n/a' : `${score}%`}</span>
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
        )
        })}
    </section>
  )
}

const FormHeader = ({ currentStep }: FormFooterAndHeaderProps) => (
  <section>
    <h6 className='text-sm font-semibold tracking-widest uppercase text-foreground/70'>New Listing</h6>
    <h2 className='text-2xl'>
      {/* Create the header text from the step id */}
      {FormSteps[currentStep - 1].id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </h2>
    <div className='flex space-x-1 text-primary/70'>
      <p>Step {currentStep} of {FormSteps.length}</p>
      <p>&mdash;</p>
      <p>{FormSteps[currentStep - 1].description}</p>
    </div>
  </section>
)

const FormFooter = ({ currentStep, changeStep, trigger }: FormFooterAndHeaderProps) => {
  return (
    <section className='py-3'>
      <section className={cn('flex space-x-3', currentStep > 1 ? 'justify-between' : 'justify-end')}>
        {currentStep > 1 &&
          <button type="button" className="px-2 py-1 border-muted-foreground text-muted-foreground" onClick={() => changeStep(FormSteps[currentStep - 2])}>Previous step</button>
        }
        {currentStep < FormSteps.length &&
          <button
            type="button"
            className='px-2 py-1 justify-self-end'
            onClick={async () => {
              const isValid = await trigger(FormSteps[currentStep - 1].fields);
              if (isValid) {
                changeStep(FormSteps[currentStep]);
              }
            }}
          >
            Next step
          </button>
        }
        {currentStep === FormSteps.length &&
          <button className='px-2 py-1 bg-blue-600 hover:bg-blue-400 text-background' type="submit">Publish</button>
        }
      </section>
    </section>
  )
}

const NewListingPage = () => {
  const { createNewListing } = useTrustlist()
  const user = useContext(User) // TODO: This should be a hook
  const navigate = useNavigate()
  const [step, changeStep] = useState<FormStep>(FormSteps[0])
  const [trustScoresFromData, setTrustScoresFromData] = useState({ ...trustScores }); // Make copy we can use
  const currentStepNumber = FormSteps.findIndex(fs => fs.id === step.id) + 1

  const listForm = useForm({
    resolver: zodResolver(NewListingResponseSchema),
    defaultValues: initialFormState.fields,
  });
  const onFormError = (errors: FieldErrors) => console.error({ errors })

  const trustScoreKeys = Object.keys(TrustScoreKeyEnum) as (keyof typeof TrustScoreKeyEnum)[]

  const updateScores = useCallback(async () => {
    // if (user.provableData.length === 0) return;
    for (let i = 0; i < 4; i++) {
      let userData = user.provableData[i]
      // let cumulativeScore = calcScoreFromUserData(Number(user.provableData[i]))
      setTrustScoresFromData((prevData) => {
        return {
          ...prevData,
          [TrustScoreKeyEnum[trustScoreKeys[i]]]: {
            ...prevData[TrustScoreKeyEnum[trustScoreKeys[i]]],
            score: Number(userData)
          }
        }
      })
    }
  }, [user.provableData]);

  useEffect(() => {
    updateScores();
  }, [])

  const transitionAlert = () => toast.promise(async () => {
    await user.transitionToCurrentEpoch()
    updateScores()  
  }, {
    pending: "Please wait a moment while you are tranistioned to the current epoch...",
    success: "Transition successful!  Please confirm whether you would like your updated scores to be shown and click publish to complete your listing.",
    error: "Failed to transition to the current epoch, please try again in a moment."
  });

  const getEpochAndKey = async () => {
    const { userState } = user
    if (!userState) throw new Error('Please join as a member and try again');
    let userStateUpdated = false
    const currentEpoch = userState.sync.calcCurrentEpoch()
    if (currentEpoch !== (await userState.latestTransitionedEpoch())) {
      // transition user to the current epoch if they're not on it
      try {
        transitionAlert()
        console.log('transitioning...')
      } catch (error) {
        throw new Error("Failed to transition to the new epoch");
      }
      userStateUpdated = true
    }

    const epkNonce = Math.floor(Math.random() * 3)// randomly choose between 2 and 0
    const posterId = user.epochKey(epkNonce) 

    return { userUpdated: userStateUpdated, currentEpoch: currentEpoch, userEpochKey: posterId, nonce: epkNonce }
  }

  const generateScores = (scoresRevealed: Record<TrustScoreKey, boolean>) => {
    return Object.entries(scoresRevealed).reduce((newScores, [scoreKey, isRevealed]) => {
      if(isRevealed){
        return { ...newScores, [scoreKey as TrustScoreKey]: trustScoresFromData[scoreKey as TrustScoreKey].score }
      }
      // return { ...newScores, [scoreKey as TrustScoreKey]: 'X' }
      return newScores;
    }, {})
  }

  const publishingAlert = (newData: any) => toast.promise(async () => {
    await createNewListing(newData)
    // +1 to current member's initiated LP score
    await user.requestData(
      { [0]: 1 << 23 },
      newData.nonce,
      ''
    )
  }, {
    pending: "Please wait a moment while your listing is being published...",
    success: { render: 
                <div className="flex space-around gap-3">
                  <div>
                    <div>Listing published! One "initiated" point has been added to your Legitimate Posting score.</div>
                    <div>Please complete your deal during this epoch to build your LP reputation.</div>
                  </div>
                  <button 
                    className="text-white font-lg border-1 border-white px-4 py-2"
                    onClick={() => {
                      listForm.reset();
                      changeStep(FormSteps[0])
                      navigate('/')
                    }}
                  >
                    Home
                  </button>
                </div>,
              closeButton: false },
    error: "There was a problem publishing your listing, please try again"
  });

  const publishPost = async (data: ListingFormValues) => {
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
          nonce: nonce,
          epoch: currentEpoch,
          category: Object.values(data.categories)[0],
          section: Object.keys(data.categories)[0],
          posterId: userEpochKey,
          amount: String(data.price),
          amountType: data.frequency,
          scoreString: JSON.stringify(currentScores)
        }
        console.log({ newData });
        publishingAlert(newData)
      } catch (publishingError) {
        console.error("Error while publishing post: ", publishingError);
      }
      
    } catch (epochError) {
      console.error("Error while getting epoch and key: ", epochError);
    }
  }

  let content;
  switch (step.id) {
    case 'select-category':
      content = <SelectCategoryFormStep {...listForm} />;
      break;
    case 'general-info':
      content = <GeneralInfoFormStep {...listForm} />;
      break;
    case 'trust-scores':
      content = <TrustScoreFormStep {...listForm} trustScores={trustScoresFromData} />;
      break;
    default:
      content = <div>Wait! This isn't a step... how did you get here?</div>;
  }
  return (
    <Form {...listForm} >
      <form onSubmit={listForm.handleSubmit(publishPost, onFormError)} className='flex flex-col p-3 justify-center container py-6 space-y-3 max-w-3xl text-foreground'>
        <FormHeader changeStep={changeStep} currentStep={currentStepNumber} trigger={listForm.trigger} />
        {content}
        <FormFooter currentStep={currentStepNumber} changeStep={changeStep} trigger={listForm.trigger} />
      </form>
      <ToastContainer className='listing-toast' toastClassName='toast' bodyClassName='toast-body' position='bottom-center' autoClose={false} />
    </Form>
  );
}

export default NewListingPage