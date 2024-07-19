'use client';

import {
  ArrowDownToLine,
  Calendar as CalendarIcon,
  Check,
  LoaderCircle,
  Plus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { TransactionFormProvider } from '@/hooks/transaction';
import { useFieldArray, useForm } from 'react-hook-form';
import { nanoid } from '@/lib/helpers';
import {
  categorySchema,
  formCreateTransaction,
  transactionsSchema,
} from '@/schemas/form';
import { FormControl, FormField, FormItem } from '../ui/form';
import { z } from 'zod';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { useState } from 'react';

export default function CreateTransactionForm({
  state,
  data,
}: {
  state: 'idle' | 'loading' | 'saved';
  data: any;
}) {
  return (
    <TransactionFormProvider>
      <CreateTransaction state={state} data={data} />
    </TransactionFormProvider>
  );
}

function CreateTransaction({
  state,
  data,
}: {
  state: 'idle' | 'loading' | 'saved';
  data: any;
}) {
  const {
    register,
    formState: { errors },
    watch,
    control,
    handleSubmit,
  } = useForm<formCreateTransaction>({
    defaultValues: {
      transactions: data.map((transaction) => ({
        id: nanoid(),
        description: transaction.transactionDescription,
        category: transaction.category,
        amount: transaction.amount,
        date: transaction.date,
      })),
    },
  });

  const [submitting, setIsSubmitting] = useState(false);
  const [done, setIsDone] = useState(false);

  const { append, remove, fields } = useFieldArray({
    name: 'transactions',
    control,
  });

  async function onSubmit(values: z.infer<typeof transactionsSchema>) {
    if (done) return;

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/save-transaction', {
        body: JSON.stringify(values),
        method: 'POST',
      });

      console.log(response);
      setIsSubmitting(false);
      setIsDone(true);
    } catch (error) {
      console.log(error);
      setIsSubmitting(false);
      setIsDone(true);
    }
  }

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="pt-6 space-y-4">
          {fields.map((transaction, index) => (
            <div key={transaction.id} className="flex items-center space-x-2">
              <FormField
                control={control}
                name={`transactions.${index}.date`}
                render={({ field }) => (
                  <FormItem>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            size={'icon'}
                            className="p-2"
                            variant={'outline'}
                          >
                            <CalendarIcon />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>

                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={new Date(field.value)}
                          onSelect={field.onChange}
                          initialFocus
                          disabled={(date) =>
                            date > new Date() || date < new Date('1900-01-01')
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <Input
                placeholder="Bought three equities"
                disabled={done}
                {...register(`transactions.${index}.description`)}
              />
              <FormField
                defaultValue={transaction.category}
                control={control}
                name={`transactions.${index}.category`}
                render={({ field }) => (
                  <Select
                    disabled={done}
                    key={field.value}
                    value={field.value}
                    defaultValue={transaction.category
                      .split(' ')
                      .map((word: string) => word.toLowerCase())
                      .join('-')}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue
                        defaultValue={transaction.category
                          .split(' ')
                          .map((word: string) => word.toLowerCase())
                          .join('-')}
                        placeholder="Category"
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categorySchema.options.map(
                        (category: string, index: number) => (
                          <SelectItem key={index} value={category}>
                            {category}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />

              <Input
                disabled={done}
                placeholder="$1000"
                {...register(`transactions.${index}.amount`)}
              />
            </div>
          ))}
        </CardContent>

        <CardFooter className="flex justify-between items-center space-x-2">
          <Button
            variant={'outline'}
            onClick={() =>
              append({
                amount: 0,
                id: nanoid(),
                description: '',
                category: 'Other',
                date: Date.now().toString(),
              })
            }
            disabled={done}
          >
            <Plus className="mr-2" />
            Add another
          </Button>
          <Button
            disabled={done}
            variant={state === 'saved' ? 'secondary' : 'default'}
          >
            {done && <Check className="mr-2" />}
            {!done && !submitting && <ArrowDownToLine className="mr-2" />}
            {!done && !submitting ? (
              'Save entry'
            ) : submitting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              done && 'Saved!'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
