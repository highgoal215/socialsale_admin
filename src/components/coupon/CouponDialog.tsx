
import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Coupon } from '@/types/coupon';

const formSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').max(20, 'Code cannot exceed 20 characters'),
  type: z.enum(['percentage', 'fixed']),
  value: z.number().min(1, 'Value must be at least 1'),
  minCartValue: z.number().min(0, 'Minimum cart value cannot be negative'),
  maxUses: z.number().nullable(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().nullable(),
  isActive: z.boolean().default(true),
  allServices: z.boolean().default(true),
  services: z.array(z.string()).nullable(),
});

type CouponFormValues = z.infer<typeof formSchema>;

interface CouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon?: Coupon;
  onSave: (coupon: Coupon) => void;
}

export function CouponDialog({ open, onOpenChange, coupon, onSave }: CouponDialogProps) {
  const [allServicesChecked, setAllServicesChecked] = useState(true);

  const services = [
    { id: 'followers', label: 'Followers' },
    { id: 'likes', label: 'Likes' },
    { id: 'views', label: 'Views' },
    { id: 'comments', label: 'Comments' },
  ];

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      type: 'percentage',
      value: 10,
      minCartValue: 0,
      maxUses: null,
      startDate: new Date().toISOString().split('T')[0],
      endDate: null,
      isActive: true,
      allServices: true,
      services: null,
    },
  });

  useEffect(() => {
    if (coupon) {
      const allServices = !coupon.services || coupon.services.length === 0;
      
      form.reset({
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minCartValue: coupon.minCartValue,
        maxUses: coupon.maxUses,
        startDate: new Date(coupon.startDate).toISOString().split('T')[0],
        endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : null,
        isActive: coupon.isActive,
        allServices,
        services: coupon.services,
      });
      
      setAllServicesChecked(allServices);
    } else {
      form.reset({
        code: '',
        type: 'percentage',
        value: 10,
        minCartValue: 0,
        maxUses: null,
        startDate: new Date().toISOString().split('T')[0],
        endDate: null,
        isActive: true,
        allServices: true,
        services: null,
      });
      setAllServicesChecked(true);
    }
  }, [coupon, form, open]);

  const onSubmit = (values: CouponFormValues) => {
    const submittedCoupon: Coupon = {
      id: coupon?.id ?? '',
      code: values.code.toUpperCase(),
      type: values.type,
      value: values.value,
      minCartValue: values.minCartValue,
      maxUses: values.maxUses,
      usedCount: coupon?.usedCount ?? 0,
      startDate: new Date(values.startDate).toISOString(),
      endDate: values.endDate ? new Date(values.endDate).toISOString() : null,
      isActive: values.isActive,
      services: values.allServices ? null : values.services,
    };
    
    onSave(submittedCoupon);
  };

  const handleAllServicesChange = (checked: boolean) => {
    setAllServicesChecked(checked);
    if (checked) {
      form.setValue('services', null);
    } else {
      form.setValue('services', []);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{coupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
          <DialogDescription>
            {coupon ? 'Update the coupon details' : 'Create a new discount coupon'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Coupon Code</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="SUMMER20" 
                        {...field} 
                        onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      />
                    </FormControl>
                    <FormDescription>
                      Unique code for customers to apply
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Activate this coupon for use
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select discount type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of discount to apply
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Value</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min={0}
                          placeholder={form.watch('type') === 'percentage' ? '10' : '5'}
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
                          {form.watch('type') === 'percentage' ? '%' : '$'}
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      {form.watch('type') === 'percentage' 
                        ? 'Percentage discount to apply' 
                        : 'Fixed amount to discount'}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="minCartValue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Order Value</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          min={0}
                          placeholder="0"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-muted-foreground">
                          $
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Minimum cart value required (0 for no minimum)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxUses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Uses</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                        min={0}
                        placeholder="Unlimited"
                        value={field.value === null ? '' : field.value}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum number of times this coupon can be used (blank for unlimited)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      When this coupon becomes active
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        type="date"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => field.onChange(e.target.value || null)}
                      />
                    </FormControl>
                    <FormDescription>
                      When this coupon expires (blank for no expiry)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="allServices"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={allServicesChecked}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        handleAllServicesChange(checked as boolean);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Apply to all services</FormLabel>
                    <FormDescription>
                      This coupon will work on all types of services
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            {!allServicesChecked && (
              <FormField
                control={form.control}
                name="services"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Select Services</FormLabel>
                      <FormDescription>
                        Choose which services this coupon can be applied to
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {services.map((service) => (
                        <FormField
                          key={service.id}
                          control={form.control}
                          name="services"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={service.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service.id)}
                                    onCheckedChange={(checked) => {
                                      const updatedServices = field.value || [];
                                      if (checked) {
                                        field.onChange([...updatedServices, service.id]);
                                      } else {
                                        field.onChange(
                                          updatedServices.filter(
                                            (s) => s !== service.id
                                          )
                                        );
                                      }
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {service.label}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {coupon ? 'Update Coupon' : 'Create Coupon'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
