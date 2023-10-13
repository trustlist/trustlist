import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import React, { useReducer } from 'react'

type NewListingResponse = {
  epoch: any,
  categories: Record<string, string[]>,
  title: string,
  amount: string,
  amountType: string,
  description: string,
  posterId: string,
  scoreString: string
}

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

type FormState = {
  data: NewListingResponse
  step: FormStep
  selectedLabels: string[]
  isLoading: boolean
  error?: string
}

type FormAction =
  | { type: 'CHANGE_CATEGORIES_FOR_SUBMISSION', payload: Record<string, string[]> }
  | { type: 'CHANGE_TEXT', payload: { key: string, value: string } }
  | { type: 'CHANGE_FORM_STEP', payload: FormStep }
  | { type: 'CHANGE_SELECTED_CATEGORIES', payload: string }

type StepSectionProps = {
  dispatch: React.Dispatch<FormAction>,
  parentState: Readonly<FormState> // no mutating for you
}

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
  data: {
    epoch: '',
    categories: {},
    title: '',
    amount: '',
    amountType: '',
    description: '',
    posterId: '',
    scoreString: ''
  },
  step: FormSteps[0],
  isLoading: true,
  selectedLabels: []
}

function reducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'CHANGE_CATEGORIES_FOR_SUBMISSION': // for form
      return {
        ...state,
        data: {
          ...state.data,
          categories: action.payload
        }
      };
    case 'CHANGE_TEXT': // just one action for the string literals really
      return {
        ...state,
        data: {
          ...state.data,
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
    default:
      return state;
  }
}

const SelectCategory = ({ dispatch, parentState }: StepSectionProps) => {
  return (
    <div>
      <section>
        <div className='flex flex-col text-left'>
          {listingTypes.map(({ label, categories }) => (
            <div key={label} className='mt-4'>
              <p className='text-base font-semibold'>{label}</p>
              <hr className='my-1' />
              <section className='flex flex-wrap gap-3'>
                {
                  categories.map((category, index) => {
                    const newLabel = `${label}--${category}`;
                    return (
                      <div key={index} className='flex space-x-1'>
                        <input type="checkbox" id={newLabel} name={newLabel} value={newLabel}
                          checked={parentState.selectedLabels.includes(newLabel)}
                          onChange={() => dispatch({ type: 'CHANGE_SELECTED_CATEGORIES', payload: newLabel })} />
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
    </div>
  )
}

const GeneralInfo = ({ dispatch, parentState }: StepSectionProps) => {
  return (
    <section>
      <form className='flex flex-col gap-3'>
        <div>
          <label htmlFor="title">Title</label>
          <Input type="text" id="title" name="title" onChange={(e) => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'title', value: e.target.value } })} />
        </div>
        <div>
          <label htmlFor="description">Description</label>
          <Textarea id="description" name="description" onChange={(e) => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'description', value: e.target.value } })} />
        </div>
        <div className="flex space-x-3">
          <div>
            <label htmlFor="amount">Amount</label>
            <Input type="number" id="amount" name="amount" onChange={(e) => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'amount', value: e.target.value } })} />
          </div>
          <div>
            <label htmlFor="frequency">Frequency</label>
            <Select  name="frequency">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="one time" onClick={() => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'frequency', value: 'one time' } })}>One Time</SelectItem>
                <SelectItem value="every week" onClick={() => dispatch({ type: 'CHANGE_TEXT', payload: { key: 'frequency', value: 'every week' } })}>Every Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </form>
    </section>
  )
}

const TrustScores = ({ dispatch, parentState }: StepSectionProps) => {
  return (
    <section>
      <h2>Trust Scores</h2>
    </section>
  )
}
const NewListingPage = () => {
  const [state, dispatch] = useReducer(reducer, initialFormState);
  const { step } = state;

  const currentStep = FormSteps.findIndex(fs => fs.id === step.id) + 1

  let content;
  switch (step.id) {
    case 'select-category':
      content = <SelectCategory dispatch={dispatch} parentState={state} />;
      break;
    case 'general-info':
      content = <GeneralInfo dispatch={dispatch} parentState={state} />;
      break;
    case 'trust-scores':
      content = <TrustScores dispatch={dispatch} parentState={state} />;
      break;
    default:
      content = <div>Wait! This isn't a step... how did you get here?</div>;
  }

  return (
    <main className='flex flex-col p-3 justify-center container py-6 space-y-3 max-w-3xl'>
      <h1 className='text-3xl'>New Listing</h1>
      <div className='flex space-x-1 text-primary/70'>
        <p>Step {currentStep} of {FormSteps.length}</p>
        <p>&mdash;</p>
        <p>{FormSteps.find(fs => fs.id === step.id)?.description}</p>
      </div>
      {content}
      <section className='flex space-x-3 justify-end'>
      {currentStep > 1 &&
        <button className="px-2 py-1" onClick={() => dispatch({ type: 'CHANGE_FORM_STEP', payload: FormSteps[currentStep - 2] })}>Back</button>
      }
      {currentStep < FormSteps.length &&
        <button className='px-2 py-1' onClick={() => dispatch({ type: 'CHANGE_FORM_STEP', payload: FormSteps[currentStep]})}>Continue</button>
      }

      </section>
    </main>
  );
}

export default NewListingPage