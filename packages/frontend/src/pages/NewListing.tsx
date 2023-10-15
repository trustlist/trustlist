import { Checkbox } from '@/components/ui/checkbox'
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
import { Textarea } from '@/components/ui/textarea'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { FieldErrors, FieldValues, UseFormReturn, useForm } from 'react-hook-form'
import { z } from 'zod'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/utils/cn'
//TODO: Unlock for full validation
// const NewListingResponseSchema = z.object({
//   epoch: z.string().min(1),
//   categories: z.record(z.array(z.string().min(1))).refine(data => Object.keys(data).length > 0, {
//   message: "Categories should not be empty",
// }),
//   title: z.string().min(1),
//   price: z.string().min(1),
//   frequency: z.literal("one time"),
//   description: z.string().min(1),
//   posterId: z.string().min(1),
//   totalTrustScore: z.string().min(1)
// })

enum TrustScoreKeyEnum {
  LP = 'LP',
  LO = 'LO',
  CB = 'CB',
  GV = 'GV',
}

const NewListingResponseSchema = z.object({
  epoch: z.string(),
  categories: z.record(z.array(z.string())),
  title: z.string(),
  price: z.number(),
  frequency: z.literal("one time"),
  description: z.string(),
  posterId: z.string(),
  trustScores: z.record(z.object({
    score: z.number(),
    isRevealed: z.boolean()
  }), z.nativeEnum(TrustScoreKeyEnum))
})

type NewListingResponse = z.infer<typeof NewListingResponseSchema>

type FormStep = {
  id: string,
  description?: string,
  validate?: (data: NewListingResponse) => boolean,
}

const FormSteps: FormStep[] = [
  { id: 'select-category', description: 'Choose the categories for your listing' },
  { id: 'general-info', description: 'Enter general information' },
  { id: 'trust-scores', description: 'Choose what trust scores to show' },
]

type TrustScoreInfo = {
  title: string
  description: string
  isRevealed: boolean
  score: number
}

type TrustScoreKey = keyof typeof TrustScoreKeyEnum;

// type TrustScoreResponse = Record<TrustScoreKey, { score: number, isRevealed: boolean }>

const trustScores: Record<TrustScoreKey, TrustScoreInfo> = {
  [TrustScoreKeyEnum.LP]: { title: 'Legit Posting Score', description: "Percentage of the member's listings that have resulted in successful deals.", isRevealed: true, score: 0 },
  [TrustScoreKeyEnum.LO]: { title: 'Legit Offer Score', description: "The member's record for successfully completing deals after their offer has been accepted.", isRevealed: true, score: 0 },
  [TrustScoreKeyEnum.CB]: { title: 'Community Building Score', description: "The member's record for submitting reviews of their deals.", isRevealed: true, score: 0 },
  [TrustScoreKeyEnum.GV]: { title: 'Good Vibes Score', description: 'Percentage of all possible points awarded to this member for being friendly, communicative, and respectful.', isRevealed: true, score: 0 }
}

type FormState = {
  fields: NewListingResponse
  step: FormStep
  selectedLabels: string[]
  trustScores: Record<TrustScoreKey, TrustScoreInfo>
  isLoading: boolean
  error?: string
}

type ListFormValues = FieldValues & NewListingResponse

type StepSectionProps = UseFormReturn<ListFormValues>

type FormFooterAndHeaderProps = StepSectionProps & { currentStep: number, changeStep: React.Dispatch<React.SetStateAction<FormStep>> }

const listingTypes = [
  {
    label: 'devconnect',
    categories: ['available', 'wanted', 'digital asset', 'souvenir']
  },
  {
    label: 'for sale',
    categories: [
      'antiques',
      'appliances',
      'auto parts',
      'baby',
      'beauty',
      'bikes',
      'boats',
      'books',
      'cars/trucks',
      'clothes',
      'electronics',
      'farm/garden',
      'furniture',
      'household',
      'jewelry',
      'materials',
      'sporting',
      'tickets',
      'tools',
      'toys',
      'trailers',
      'video',
      'wanted',
    ]
  },
  {
    label: 'housing',
    categories: [
      'apts/houses',
      'swap',
      'wanted',
      'commercial',
      'parking/storage',
      'rooms/shared',
      'sublets/temporary',
      'vacation rentals',
    ]
  }
]

const initialFormState: FormState = {
  fields: {
    epoch: '',
    categories: {},
    title: '',
    price: 0,
    frequency: 'one time',
    description: '',
    posterId: '',
    trustScores: {
      [TrustScoreKeyEnum.LP]: { score: 0, isRevealed: true },
      [TrustScoreKeyEnum.LO]: { score: 0, isRevealed: true },
      [TrustScoreKeyEnum.CB]: { score: 0, isRevealed: true },
      [TrustScoreKeyEnum.GV]: { score: 0, isRevealed: true },
    }
  },
  step: FormSteps[0],
  isLoading: true,
  selectedLabels: [],
  trustScores
}

// function formReducer(state: FormState, action: FormAction): FormState {
//   switch (action.type) {
//     case 'CHANGE_CATEGORIES_FOR_SUBMISSION':
//       return {
//         ...state,
//         fields: {
//           ...state.fields,
//           categories: action.payload
//         }
//       };
//     case 'CHANGE_TEXT': // just one action for the string literals
//       return {
//         ...state,
//         fields: {
//           ...state.fields,
//           [action.payload.key]: action.payload.value
//         }
//       };
//     case 'CHANGE_FORM_STEP':
//       return {
//         ...state,
//         step: action.payload
//       };
//     case 'CHANGE_SELECTED_CATEGORIES':
//       return {
//         ...state,
//         selectedLabels: state.selectedLabels.includes(action.payload)
//           ? state.selectedLabels.filter(label => label !== action.payload)
//           : [...state.selectedLabels, action.payload]
//       };
//     case 'TOGGLE_TRUST_SCORE':
//       console.log({ ...action })
//       return {
//         ...state,
//         trustScores: Object.fromEntries(
//           Object.entries(state.trustScores).map(([key, score]) =>
//             key === action.payload.key
//               ? [key, { ...score, active: !score.active }]
//               : [key, score]
//           )
//         ) as Record<TrustScoreKey, TrustScoreInfo>
//       }
//     default:
//       return state;
//   }
// }

const SelectCategoryFormStep = ({ control }: StepSectionProps) => (
  <section>
    <div className='flex flex-col text-left'>
      {listingTypes.map(({ label: section, categories }) => (
        <div key={section} className='mt-4'>
          <h6 className='text-base font-semibold'>{section}</h6>
          <hr className='my-1' />
          <section className='flex flex-wrap gap-3'>
            {
              categories.map((category, index) => {
                const newLabel = `${section}--${category}`;
                return (
                  <FormField
                    control={control}
                    key={newLabel}
                    name={`categories.${section}`}
                    render={({ field }) => (
                      <FormItem key={index} className='flex justify-center items-center space-x-1 space-y-0'>
                        <FormControl>
                          <Checkbox
                            id={newLabel}
                            className='data-[state=checked]:bg-blue-600'
                            checked={field.value?.includes(category)}
                            onCheckedChange={(checked) => {
                              if (checked) field.onChange([...(field.value || []), category])
                              else field.onChange((field.value || []).filter(cat => cat !== category))
                            }}
                          />
                        </FormControl>
                        <FormLabel htmlFor={newLabel} className='text-muted-foreground hover:cursor-pointer active:text-foreground hover:text-foreground hover:underline underline-offset-1'>{category}</FormLabel>
                      </FormItem>
                    )}
                  />
                )
              })
            }
          </section>
        </div>
      ))}
    </div>
  </section>
)

const GeneralInfoFormStep = ({ watch, control, setValue }: StepSectionProps) => {
  const price = watch('price')
  const [displayPrice, setDisplayPrice] = useState('');

  return (
    <section>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price</FormLabel>
            <FormControl>
              <Input
                type='text'
                value={displayPrice}
                className='w-[180px]'
                onChange={(e) => {
                  const value = parseFloat(e.target.value.replace(/[^\d\.]/g, ''));
                  if (!isNaN(value)) {
                    setValue('price', value);
                    setDisplayPrice(e.target.value)
                  }
                }}
                onBlur={() => {
                  setDisplayPrice(new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </section >
  )
}

const TrustScoreFormStep = ({ control }: StepSectionProps) => {
  return (
    <section className='flex flex-col space-y-4'>
      {Object.entries(trustScores).map(([key, scoreInfo]) => (
        <FormField
          control={control}
          name={`trustScores.${key}.isRevealed`}
          render={({ field }) => (
            <FormItem className='flex justify-between space-x-6' key={key}>
              <div>
                <FormLabel className="font-semibold text-foreground" htmlFor={key}>{scoreInfo.title}</FormLabel>
                <FormDescription className='text-foreground/80'>{scoreInfo.description}</FormDescription>
              </div>
              <FormControl>
                <Switch
                  id={key}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className={cn(field.value ? 'data-[state=checked]:bg-blue-700' : '')}
                />
              </FormControl>
            </FormItem>
          )}
        />
      ))}
    </section>
  )
}

// const FormHeader = ({ parentState, currentStep }: FormFooterAndHeaderProps) => (
//   <section>
//     <h6 className='text-sm font-semibold tracking-widest uppercase text-foreground/70'>New Listing</h6>
//     <h2 className='text-2xl'>
//       {/* Create the header text from the step id */}
//       {parentState.step.id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
//     </h2>
//     <div className='flex space-x-1 text-primary/70'>
//       <p>Step {currentStep} of {FormSteps.length}</p>
//       <p>&mdash;</p>
//       <p>{FormSteps.find(fs => fs.id === parentState.step.id)?.description}</p>
//     </div>
//   </section>
// )

const FormFooter = ({ currentStep, changeStep }: FormFooterAndHeaderProps) => {
  return (
    <section>
      {/* Post preview */}
      {/* {getValues().title && getValues().description && getValues().price && formState.selectedLabels.length > 0 && currentStep === FormSteps.length && (
      <div className='p-4 border-2 border-foreground bg-foreground/5 rounded-sm'>
        <p>Post preview</p>
        <h2 className='text-xl font-semibold'>{formState.data.title}</h2>
        <p className="text-foreground/70">{formState.selectedLabels.length} categories • ${formState.data.price}</p>
        <p className='text-gray-600 max-h-16 overflow-hidden text-clip'>{formState.data.description}</p>
      </div>
    )} */}

      {/* Back, continue and publish buttons */}
      <section className='flex space-x-3 justify-end'>
        {currentStep > 1 &&
          <button className="px-2 py-1" onClick={() => changeStep(FormSteps[currentStep - 2])}>Previous step</button>
        }
        {currentStep < FormSteps.length &&
          <button className='px-2 py-1' onClick={() => changeStep(FormSteps[currentStep])}>Continue</button>
        }
        {currentStep === FormSteps.length &&
          <button className='px-2 py-1' type="submit">Publish</button>
        }
      </section>
    </section>
  )
}


const NewListingPage = () => {
  const [step, changeStep] = useState<FormStep>(FormSteps[0])

  const listForm = useForm({
    resolver: zodResolver(NewListingResponseSchema),
    defaultValues: initialFormState.fields
  });

  const onFormError = (errors: FieldErrors) => console.error({ errors })

  const publishPost = (data: ListFormValues) => {
    try {
      const newData = {
        ...data,
      } as NewListingResponse

      console.log({ newData });
    } catch (error) {
      console.error("Error while publishing post: ", error);
    }
  }

  const currentStepNumber = FormSteps.findIndex(fs => fs.id === step.id) + 1

  let content;
  switch (step.id) {
    case 'select-category':
      content = <SelectCategoryFormStep {...listForm} />;
      break;
    case 'general-info':
      content = <GeneralInfoFormStep {...listForm} />;
      break;
    case 'trust-scores':
      content = <TrustScoreFormStep {...listForm} />;
      break;
    default:
      content = <div>Wait! This isn't a step... how did you get here?</div>;
  }

  return (
    <Form {...listForm} >
      <form onSubmit={listForm.handleSubmit(publishPost, onFormError)} className='flex flex-col p-3 justify-center container py-6 space-y-3 max-w-3xl text-foreground'>
        {/* <FormHeader dispatch={dispatch} parentState={formState} currentStep={currentStepNumber} /> */}
        {content}
        <FormFooter {...listForm} currentStep={currentStepNumber} changeStep={changeStep} />
      </form>
    </Form>
  );
}

export default NewListingPage