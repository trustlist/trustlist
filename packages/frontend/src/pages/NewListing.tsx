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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TrustScoreKeyEnum, listingCategories, trustScores as trustScoresFromData } from '@/data'
import { TrustScoreInfo, TrustScoreKey } from '@/types/local'
import { cn } from '@/utils/cn'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useState } from 'react'
import { FieldErrors, FieldValues, UseFormReturn, useForm } from 'react-hook-form'
import { z } from 'zod'

//TODO: Add field validation
//TODO: Hook up to Trustlist hook (maybe?) (if it needs to exist)
//TODO: User must be logged in to add listing
//TODO: When do we calculate trust scores and how? Seems like before sending the formData we calc it but ask to be sure
// TODO: Choosing what epoch key — I don't think this needs to be a user selected thing. Whats the difference between them choosing one long string vs another? Basically a coin flip right?

const NewListingResponseSchema = z.object({
  epoch: z.string(),
  categories: z.record(z.array(z.string())),
  title: z.string(),
  price: z.number(),
  frequency: z.literal("one time"),
  description: z.string(),
  posterId: z.string(),
  revealTrustScores: z.record(z.boolean())
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

type FormFooterAndHeaderProps = { currentStep: number, changeStep: React.Dispatch<React.SetStateAction<FormStep>> }


const createInitialCategories = (sectionsWithCategories: Record<string, string[]>) => {
  // create an empty array for each section in listing type
  return Object.keys(sectionsWithCategories).reduce<Record<string, string[]>>((acc, key) => {
    acc[key] = [];
    return acc;
  }, {});
}

const initialCategories = createInitialCategories(listingCategories);

const initialFormState: FormState = {
  fields: {
    epoch: '',
    categories: initialCategories,
    title: '',
    price: 0,
    frequency: 'one time',
    description: '',
    posterId: '',
    revealTrustScores: {
      [TrustScoreKeyEnum.LP]: true,
      [TrustScoreKeyEnum.LO]: true,
      [TrustScoreKeyEnum.CB]: true,
      [TrustScoreKeyEnum.GV]: true,
    }
  },
  step: FormSteps[0],
  isLoading: true,
  selectedLabels: [],
  trustScores: trustScoresFromData
}

// TODO: Persist categories when steps change
const SelectCategoryFormStep = ({ control }: StepSectionProps) => (
  <section>
    <div className='flex flex-col text-left'>
      {Object.entries(listingCategories).map(([section, categories]) => (
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
                        <FormLabel htmlFor={newLabel} className='text-base text-foreground hover:cursor-pointer active:text-foreground hover:text-foreground hover:underline underline-offset-1'>{category}</FormLabel>
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
    <section className='flex flex-col space-y-4'>
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-base">Title</FormLabel>
            <FormControl>
              <Input className='text-base' {...field} />
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
            <FormLabel className='text-base'>Price</FormLabel>
            <FormControl>
              <Input
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
            <FormLabel className='text-base'>Description</FormLabel>
            <FormControl>
              <Textarea className='text-base' {...field} />
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
      {Object.entries(trustScoresFromData).map(([key, scoreInfo]) => (
        <FormField
          key={key}
          control={control}
          name={`revealTrustScores.${key}`}
          render={({ field }) => (
            <FormItem className='flex justify-between items-start space-x-6 border border-muted-foreground p-3' key={key}>
              <div>
                <FormLabel className="text-foreground text-lg" htmlFor={key}>{scoreInfo.title}</FormLabel>
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
                  <p className='text-muted-foreground'>{field.value ? 'Shown' : 'Hidden'}</p>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      ))}
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

const FormFooter = ({ currentStep, changeStep }: FormFooterAndHeaderProps) => {
  return (
    <section className='py-3'>
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
      <section className={cn('flex space-x-3', currentStep > 1 ? 'justify-between' : 'justify-end')}>
        {currentStep > 1 &&
          <button className="px-2 py-1 border-muted-foreground text-muted-foreground" onClick={() => changeStep(FormSteps[currentStep - 2])}>Previous step</button>
        }
        {currentStep < FormSteps.length &&
          <button className='px-2 py-1 justify-self-end' onClick={() => changeStep(FormSteps[currentStep])}>Next step</button>
        }
        {currentStep === FormSteps.length &&
          <button className='px-2 py-1 bg-blue-600 hover:bg-blue-400 text-background' type="submit">Publish</button>
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

      //  TODO: Send form to DB
      //  TODO: Reroute to home page
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
        <FormHeader changeStep={changeStep} currentStep={currentStepNumber} />
        {content}
        <FormFooter currentStep={currentStepNumber} changeStep={changeStep} />
      </form>
    </Form>
  );
}

export default NewListingPage