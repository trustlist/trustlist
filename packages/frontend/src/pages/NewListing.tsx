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
import { cn } from '@/utils/cn'
import { zodResolver } from '@hookform/resolvers/zod'
import React, { useContext, useEffect, useState } from 'react'
import { FieldErrors, FieldValues, UseFormReturn, UseFormTrigger, useForm } from 'react-hook-form'
import { z } from 'zod'

//TODO: ✅ Add field validation
//TODO: Hook up to Trustlist hook (maybe?) (if it needs to exist)
//TODO: User must be logged in to add listing
//TODO: When do we calculate trust scores and how? Seems like before sending the formData we calc it but ask to be sure
// TODO: Choosing what epoch key — I don't think this needs to be a user selected thing. Whats the difference between them choosing one long string vs another? Basically a coin flip right?

const trustScoresFromData = {...trustScores}; // Make copy we can use

const NewListingResponseSchema = z.object({
  epoch: z.string(),
  categories: z.record(z.string().min(1, 'Please choose an option')),
  title: z.string().min(1, 'Please add a title'),
  price: z.number().min(1, 'Please add the price'), //TODO: usd now , include crypto (?)
  frequency: z.literal("one time"),
  description: z.string().min(1, 'Please describe what you are listing'),
  posterId: z.string(),
  revealTrustScores: z.record(z.boolean()),
  // scores: z.record(z.number())
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
  { id: 'trust-scores', description: 'Choose what trust scores to show', fields: ['revealTrustScores'] },
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
    },
    // scores: {
    //   [TrustScoreKeyEnum.LP]: 0.3,
    //   [TrustScoreKeyEnum.LO]: 0.2,
    //   [TrustScoreKeyEnum.CB]: 0.03,
    //   [TrustScoreKeyEnum.GV]: 0.5,
    // }
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
                <FormLabel className="text-foreground text-lg" htmlFor={key}>
                  {scoreInfo.title}:{' '}<span className="text-blue-700 font-extrabold">{scoreInfo.score}%</span>
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
  const { calcScoreFromUserData } = useTrustlist() // @CJ-Rose: you can destructure just the fns you need
  const user = useContext(User) // TODO: This should be a hook
  const [step, changeStep] = useState<FormStep>(FormSteps[0])

  // @CJ-Rose: Btw have we been making the assumption that the order of the array and the order of the provableData array are the same? Or do you know?
  const trustScoreKeys = Object.keys(TrustScoreKeyEnum) as (keyof typeof TrustScoreKeyEnum)[]

  useEffect(() => {
    if (user.provableData.length === 0) return; // @CJ-Rose: Re NaN Provable data was an empty array so provableData[i] was undefined and Number(undefined) is NaN
    for (let i = 0; i < 4; i++) {
      let data = calcScoreFromUserData(Number(user.provableData[i]))
      trustScoresFromData[TrustScoreKeyEnum[trustScoreKeys[i]]].score = data; // @CJ-Rose: We can directly update the scores of data/trustScores
    }
  }, [])

  const listForm = useForm({
    resolver: zodResolver(NewListingResponseSchema),
    defaultValues: initialFormState.fields,
  });

  const onFormError = (errors: FieldErrors) => console.error({ errors })

  const publishPost = (data: ListingFormValues) => {
    try {
      const newData = {
        ...data,
        // TODO: Add epochKey
        //TODO: Add scores (?)
      } as NewListingResponse

      console.log({ newData });

      //  TODO: Send form to DB
      //  TODO: Reroute to home page
      listForm.reset();
      changeStep(FormSteps[0])
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
        <FormHeader changeStep={changeStep} currentStep={currentStepNumber} trigger={listForm.trigger} />
        {content}
        <FormFooter currentStep={currentStepNumber} changeStep={changeStep} trigger={listForm.trigger} />
      </form>
    </Form>
  );
}

export default NewListingPage