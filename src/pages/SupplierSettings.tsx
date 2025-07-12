import { useState } from 'react';
import { SupplierService, SupplierOrderRequest, SupplierOrderResponse } from '@/services/supplier-service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Save,
  Send,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Link as LinkIcon
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const apiSettingsSchema = z.object({
  apiKey: z.string().min(10, "API key must be at least 10 characters"),
  apiEndpoint: z.string().url("Please enter a valid URL")
});

const testOrderSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  serviceType: z.enum(['followers', 'likes', 'views', 'comments'], {
    required_error: "Please select a service type",
  }),
  quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
  target: z.string().min(1, "Target is required"),
  customerEmail: z.string().email("Please enter a valid email").optional(),
});

type ApiSettingsFormValues = z.infer<typeof apiSettingsSchema>;
type TestOrderFormValues = z.infer<typeof testOrderSchema>;

const SupplierSettings = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isTestingOrder, setIsTestingOrder] = useState(false);
  const [testResult, setTestResult] = useState<SupplierOrderResponse | null>(null);

  const apiSettingsForm = useForm<ApiSettingsFormValues>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      apiKey: localStorage.getItem('supplier_api_key') || '',
      apiEndpoint: localStorage.getItem('supplier_api_endpoint') || 'https://api.supplierpanel.com',
    }
  });

  const testOrderForm = useForm<TestOrderFormValues>({
    resolver: zodResolver(testOrderSchema),
    defaultValues: {
      orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
      serviceType: 'followers',
      quantity: 100,
      target: 'instagram_user',
      customerEmail: 'customer@example.com',
    }
  });

  const onSubmitApiSettings = async (data: ApiSettingsFormValues) => {
    setIsConnecting(true);

    try {
      const success = await SupplierService.configureApiSettings(data.apiKey, data.apiEndpoint);

      if (success) {
        toast.success('API settings saved successfully');
        setIsConnected(true);
      } else {
        toast.error('Failed to connect to supplier API');
        setIsConnected(false);
      }
    } catch (error) {
      console.error('Error connecting to supplier API:', error);
      toast.error('An error occurred while connecting to the supplier API');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const onSubmitTestOrder = async (data: TestOrderFormValues) => {
    setIsTestingOrder(true);
    setTestResult(null);

    try {
      const supplierOrderData: SupplierOrderRequest = {
        orderId: data.orderId,
        serviceType: data.serviceType,
        quantity: data.quantity,
        target: data.target,
        customerEmail: data.customerEmail
      };

      const result = await SupplierService.sendOrderToSupplier(supplierOrderData);
      setTestResult(result);

      if (result.success) {
        toast.success('Test order sent successfully');
      } else {
        toast.error('Failed to send test order');
      }
    } catch (error) {
      console.error('Error sending test order:', error);
      toast.error('An error occurred while sending the test order');
    } finally {
      setIsTestingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Supplier API Integration</h1>
        <p className="text-muted-foreground">
          Connect to your supplier's API to automatically fulfill orders
        </p>
      </div>

      <Tabs defaultValue="settings">
        <TabsList className="mb-6">
          <TabsTrigger value="settings">API Settings</TabsTrigger>
          <TabsTrigger value="test">Test API</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Supplier API Configuration</CardTitle>
                <CardDescription>
                  Set up your connection to the supplier panel API
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...apiSettingsForm}>
                  <form onSubmit={apiSettingsForm.handleSubmit(onSubmitApiSettings)} className="space-y-6">
                    <Alert>
                      <ShieldCheck className="h-4 w-4" />
                      <AlertTitle>Secure Connection</AlertTitle>
                      <AlertDescription>
                        Your API credentials are stored securely in your browser's local storage.
                        In a production environment, these should be stored on your secure server.
                      </AlertDescription>
                    </Alert>

                    <FormField
                      control={apiSettingsForm.control}
                      name="apiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="password"
                              placeholder="Enter your supplier API key"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={apiSettingsForm.control}
                      name="apiEndpoint"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Endpoint</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="https://api.example.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end">
                      <Button type="submit" className="w-full sm:w-auto" disabled={isConnecting}>
                        {isConnecting ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <LinkIcon size={16} className="mr-2" />
                            {isConnected ? 'Update Connection' : 'Connect to API'}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>

              {isConnected && (
                <CardFooter className="border-t px-6 py-4 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Connected to supplier API successfully
                    </p>
                  </div>
                </CardFooter>
              )}
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="test">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Test Order</CardTitle>
                <CardDescription>
                  Send a test order to verify your API connection
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...testOrderForm}>
                  <form onSubmit={testOrderForm.handleSubmit(onSubmitTestOrder)} className="space-y-4">
                    <FormField
                      control={testOrderForm.control}
                      name="orderId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Order ID</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="ORD-12345"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={testOrderForm.control}
                      name="serviceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Type</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="w-full p-2 border rounded text-black"
                            >
                              <option value="followers">Followers</option>
                              <option value="likes">Likes</option>
                              <option value="views">Views</option>
                              <option value="comments">Comments</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={testOrderForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min="1"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={testOrderForm.control}
                      name="target"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Target (Instagram handle or post URL)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="username or https://instagram.com/p/example"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={testOrderForm.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Customer Email (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="customer@example.com"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full" disabled={isTestingOrder || !isConnected}>
                      {isTestingOrder ? (
                        <>
                          <Loader2 size={16} className="mr-2 animate-spin" />
                          Sending...
                        </>
                      ) : !isConnected ? (
                        'Connect API First'
                      ) : (
                        <>
                          <Send size={16} className="mr-2" />
                          Send Test Order
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>
                  View the response from the supplier API
                </CardDescription>
              </CardHeader>

              <CardContent>
                {testResult ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                      <h3 className="font-medium">
                        {testResult.success ? 'Order Sent Successfully' : 'Order Failed'}
                      </h3>
                    </div>

                    {testResult.success && (
                      <>
                        <div>
                          <Label>Reference ID</Label>
                          <p className="text-sm mt-1 font-mono bg-secondary p-2 rounded">
                            {testResult.reference}
                          </p>
                        </div>

                        <div>
                          <Label>Status</Label>
                          <p className="text-sm mt-1">
                            {testResult.status}
                          </p>
                        </div>

                        {testResult.estimatedCompletionTime && (
                          <div>
                            <Label>Estimated Completion</Label>
                            <p className="text-sm mt-1">
                              {new Date(testResult.estimatedCompletionTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                    {testResult.message && (
                      <div>
                        <Label>Message</Label>
                        <p className="text-sm mt-1">
                          {testResult.message}
                        </p>
                      </div>
                    )}

                    <div>
                      <Label>Raw Response</Label>
                      <pre className="text-xs mt-1 p-2 bg-secondary rounded overflow-auto max-h-40">
                        {JSON.stringify(testResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                    <ArrowRight size={40} className="mb-2" />
                    <p>Send a test order to see results</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SupplierSettings;
