import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Toggle } from '@/components/ui/toggle'
import { cn } from '@/utils/cn'
import React, { useReducer, useState } from 'react'
import { FieldErrors, FieldValues, UseFormRegister, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

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

const NewListingResponseSchema = z.object({
  epoch: z.string(),
  categories: z.record(z.array(z.string().min(1))),
  title: z.string(),
  price: z.string(),
  frequency: z.literal("one time"),
  description: z.string(),
  posterId: z.string(),
  totalTrustScore: z.string()
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
  active: boolean
  score: number
}

type TrustScoreKey = 'LP' | 'LO' | 'CB' | 'GV';

const trustScores: Record<TrustScoreKey, TrustScoreInfo> = {
  'LP': { title: 'Legit Posting Score', description: "Percentage of the member's listings that have resulted in successful deals.", active: true, score: 0 },
  'LO': { title: 'Legit Offer Score', description: "The member's record for successfully completing deals after their offer has been accepted.", active: true, score: 0 },
  'CB': { title: 'Community Building Score', description: "The member's record for submitting reviews of their deals.", active: true, score: 0 },
  'GV': { title: 'Good Vibes Score', description: 'Percentage of all possible points awarded to this member for being friendly, communicative, and respectful.', active: true, score: 0 }
}

type FormState = {
  fields: NewListingResponse
  step: FormStep
  selectedLabels: string[]
  trustScores: Record<TrustScoreKey, TrustScoreInfo>
  isLoading: boolean
  error?: string
}

type FormAction =
  | { type: 'CHANGE_CATEGORIES_FOR_SUBMISSION', payload: Record<string, string[]> }
  | { type: 'CHANGE_TEXT', payload: { key: string, value: string } }
  | { type: 'CHANGE_FORM_STEP', payload: FormStep }
  | { type: 'CHANGE_SELECTED_CATEGORIES', payload: string }
  | { type: 'TOGGLE_TRUST_SCORE', payload: { key: TrustScoreKey } }

type ListFormValues = FieldValues & NewListingResponse

type StepSectionProps = {
  // dispatch: React.Dispatch<FormAction>,
  // parentState: Readonly<FormState> // no mutating for you
  register: UseFormRegister<ListFormValues>,
  errors: FieldErrors<ListFormValues>
}

type FormFooterAndHeaderProps = StepSectionProps & { currentStep: number }

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
    price: '',
    frequency: 'one time',
    description: '',
    posterId: '',
    totalTrustScore: ''
  },
  step: FormSteps[0],
  isLoading: true,
  selectedLabels: [],
  trustScores
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'CHANGE_CATEGORIES_FOR_SUBMISSION':
      return {
        ...state,
        fields: {
          ...state.fields,
          categories: action.payload
        }
      };
    case 'CHANGE_TEXT': // just one action for the string literals
      return {
        ...state,
        fields: {
          ...state.fields,
          [action.payload.key]: action.payload.value
        }
      };
    case 'CHANGE_FORM_STEP':
      return {
        ...state,
        step: action.payload
      };
    case 'CHANGE_SELECTED_CATEGORIES':
      return {
        ...state,
        selectedLabels: state.selectedLabels.includes(action.payload)
          ? state.selectedLabels.filter(label => label !== action.payload)
          : [...state.selectedLabels, action.payload]
      };
    case 'TOGGLE_TRUST_SCORE':
      console.log({ ...action })
      return {
        ...state,
        trustScores: Object.fromEntries(
          Object.entries(state.trustScores).map(([key, score]) =>
            key === action.payload.key
              ? [key, { ...score, active: !score.active }]
              : [key, score]
          )
        ) as Record<TrustScoreKey, TrustScoreInfo>
      }
    default:
      return state;
  }
}

type SelectCategoryStepSectionProps = StepSectionProps & {
  setSelectedCategories: React.Dispatch<React.SetStateAction<{}>>
  selectedCategories: Readonly<Record<string, string[]>>
}
const SelectCategoryFormStep = ({ register, errors, setSelectedCategories, selectedCategories }: SelectCategoryStepSectionProps) => {
  return (
    <section>
      <div className='flex flex-col text-left'>
        {listingTypes.map(({ label: section, categories }) => (
          <div key={section} className='mt-4'>
            <p className='text-base font-semibold'>{section}</p>
            <hr className='my-1' />
            <section className='flex flex-wrap gap-3'>
              {
                categories.map((category, index) => {
                  const newLabel = `${section}--${category}`;
                  return (
                    <div key={index} className='flex space-x-1'>
                      <input
                        type="checkbox"
                        id={newLabel}
                        name={newLabel}
                        checked={selectedCategories[section]?.includes(category)}
                        onChange={(e) => {
                          setSelectedCategories((prev: Record<string, string[]>) => {
                            const newCategories = { ...prev }
                            if (e.target.checked) {
                              if (newCategories[section]) {
                                newCategories[section].push(category)
                              } else newCategories[section] = [category]
                            } else {
                              newCategories[section] = newCategories[section].filter(cat => cat !== category)
                            }
                            register(`categories.${section}`, { value: newCategories[section] });
                            return newCategories;
                          });
                        }}
                      />
                      <label htmlFor={newLabel} className='text-muted-foreground hover:cursor-pointer active:text-foreground hover:text-foreground hover:underline underline-offset-1'>{category}</label>
                    </div>
                  )
                })
              }
            </section>
          </div>
        ))}
      </div>
    </section>
  )
}

// const GeneralInfoFormStep = ({ dispatch, parentState }: StepSectionProps) => {
//   return (
//     <section>
//       <form className='flex flex-col gap-3'>
//         <div>
//           <label htmlFor="title">Title</label>
//           <Input type="text" id="title" name="title" onChange={(e) => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'title', value: e.target.value } })} />
//         </div>
//         <div>
//           <label htmlFor="description">Description</label>
//           <Textarea id="description" name="description" onChange={(e) => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'description', value: e.target.value } })} />
//         </div>

//         <div className='w-[180px]'>
//           <label htmlFor="amount">Price</label>
//           <Input type="number" id="amount" name="amount" onChange={(e) => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'price', value: e.target.value } })} />
//         </div>
//         {/* <div>
//             <label htmlFor="frequency">Frequency</label>
//             <Select name="frequency">
//               <SelectTrigger className="w-[180px]">
//                 <SelectValue placeholder="Frequency" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="one time" onClick={() => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'frequency', value: 'one time' } })}>One Time</SelectItem>
//                 <SelectItem value="every week" onClick={() => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'frequency', value: 'every week' } })}>Every Week</SelectItem>
//               </SelectContent>
//             </Select>
//           </div> */}

//       </form>
//     </section>
//   )
// }

// const TrustScoreFormStep = ({ register, errors }: StepSectionProps) => {
//   return (
//     <section className='flex flex-col space-y-4'>
//       {Object.entries(parentState.trustScores).map(([key, scoreInfo]) => (
//         <div className='flex justify-between space-x-6' key={key}>
//           <div>
//             <label className="font-semibold text-foreground" htmlFor={key}>{scoreInfo.title}</label>
//             <p className='text-foreground/80'>{scoreInfo.description}</p>
//           </div>
//           <Toggle size={'lg'} name={key} aria-label={`Toggle ${key} score`} variant={'outline'} defaultChecked={scoreInfo.active}
//             className={cn(scoreInfo.active ? 'border-blue-700' : '')}
//             onClick={(e) =>
//               dispatch({ type: 'TOGGLE_TRUST_SCORE', payload: { key: key as TrustScoreKey } })
//             }>
//             <label>{scoreInfo.active ? 'ON' : 'OFF'}</label>
//           </Toggle>
//         </div>
//       ))}
//     </section>
//   )
// }

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

// const FormFooter = ({ dispatch, parentState, currentStep }: FormFooterAndHeaderProps) => (
//   <section>
//     {/* Post preview */}
//     {parentState.data.title && parentState.data.description && parentState.data.price && parentState.selectedLabels.length > 0 && currentStep === FormSteps.length && (
//       <div className='p-4 border-2 border-foreground bg-foreground/5 rounded-sm'>
//         <p>Post preview</p>
//         <h2 className='text-xl font-semibold'>{parentState.data.title}</h2>
//         <p className="text-foreground/70">{parentState.selectedLabels.length} categories • ${parentState.data.price}</p>
//         <p className='text-gray-600 max-h-16 overflow-hidden text-clip'>{parentState.data.description}</p>
//       </div>
//     )}

//     {/* Back, continue and publish buttons */}
//     <section className='flex space-x-3 justify-end'>
//       {currentStep > 1 &&
//         <button className="px-2 py-1" onClick={() => dispatch({ type: 'CHANGE_FORM_STEP', payload: FormSteps[currentStep - 2] })}>Back</button>
//       }
//       {currentStep < FormSteps.length &&
//         <button className='px-2 py-1' onClick={() => dispatch({ type: 'CHANGE_FORM_STEP', payload: FormSteps[currentStep] })}>Continue</button>
//       }
//       {currentStep === FormSteps.length &&
//         <button className='px-2 py-1' onClick={() => console.log('Publish Post')}>Publish</button>
//       }
//     </section>
//   </section>
// )


const NewListingPage = () => {
  // const [formState, dispatch] = useReducer(formReducer, initialFormState);
  const [step, changeStep] = useState<FormStep>(FormSteps[0])
  const [selectedCategories, setSelectedCategories] = useState<Record<string, string[]>>({});


  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(NewListingResponseSchema),
    defaultValues: initialFormState.fields
  });


  const onFormError = (errors: FieldErrors) => console.error({ errors })

  const publishPost = (data: ListFormValues) => {
    console.log({ data })
    try {
      const newData = {
        ...data,
        categories: selectedCategories
      } as NewListingResponse
      console.log(newData);
    } catch (error) {
      console.error("Error while publishing post: ", error);
    }
  }

  const currentStepNumber = FormSteps.findIndex(fs => fs.id === step.id) + 1

  let content;
  switch (step.id) {
    case 'select-category':
      content = <SelectCategoryFormStep
        register={register}
        errors={errors}
        setSelectedCategories={setSelectedCategories}
        selectedCategories={selectedCategories}
      />;
      break;
    // case 'general-info':
    //   content = <GeneralInfoFormStep register={register} errors={errors} />;
    //   break;
    // case 'trust-scores':
    //   content = <TrustScoreFormStep register={register} errors={errors} />;
    //   break;
    default:
      content = <div>Wait! This isn't a step... how did you get here?</div>;
  }

  return (
    <form onSubmit={handleSubmit(publishPost, onFormError)} className='flex flex-col p-3 justify-center container py-6 space-y-3 max-w-3xl text-foreground'>
      {/* <FormHeader dispatch={dispatch} parentState={formState} currentStep={currentStepNumber} /> */}
      {content}
      <button type="submit">Submit</button>
      {/* <FormFooter dispatch={dispatch} parentState={formState} currentStep={currentStepNumber} /> */}
    </form>
  );
}

export default NewListingPage