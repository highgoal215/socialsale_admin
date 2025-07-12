
import { useState } from 'react';
import { 
  PlusCircle, 
  Search, 
  Tag, 
  Calendar, 
  Percent,
  DollarSign,
  Edit2,
  Trash2,
  Copy,
  Check,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CouponDialog } from '@/components/coupon/CouponDialog';
import { CouponDeleteDialog } from '@/components/coupon/CouponDeleteDialog';
import { Coupon } from '@/types/coupon';
import { Switch } from '@/components/ui/switch';
import { toast } from "@/hooks/use-toast";

// Mock coupon data
const mockCoupons: Coupon[] = [
  {
    id: '1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minCartValue: 0,
    maxUses: 100,
    usedCount: 42,
    startDate: '2023-05-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    isActive: true,
    services: null, // Applicable to all services
  },
  {
    id: '2',
    code: 'SUMMER20',
    type: 'percentage',
    value: 20,
    minCartValue: 50,
    maxUses: null, // Unlimited uses
    usedCount: 156,
    startDate: '2023-06-01T00:00:00Z',
    endDate: '2023-08-31T23:59:59Z',
    isActive: true,
    services: ['followers', 'likes'],
  },
  {
    id: '3',
    code: 'FLAT15',
    type: 'fixed',
    value: 15,
    minCartValue: 100,
    maxUses: 50,
    usedCount: 12,
    startDate: '2023-07-15T00:00:00Z',
    endDate: null, // No end date
    isActive: false,
    services: ['comments'],
  },
];

const Coupons = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>(mockCoupons);

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateCoupon = (coupon: Coupon) => {
    const newCoupon = {
      ...coupon,
      id: (coupons.length + 1).toString(),
      usedCount: 0,
    };
    setCoupons([newCoupon, ...coupons]);
    setIsCreateDialogOpen(false);
    toast({
      title: "Coupon Created",
      description: `${coupon.code} has been created successfully.`,
    });
  };

  const handleEditCoupon = (coupon: Coupon) => {
    setCoupons(coupons.map(c => c.id === coupon.id ? coupon : c));
    setIsEditDialogOpen(false);
    setSelectedCoupon(null);
    toast({
      title: "Coupon Updated",
      description: `${coupon.code} has been updated successfully.`,
    });
  };

  const handleDeleteCoupon = (couponId: string) => {
    const couponToDelete = coupons.find(c => c.id === couponId);
    setCoupons(coupons.filter(coupon => coupon.id !== couponId));
    setIsDeleteDialogOpen(false);
    setSelectedCoupon(null);
    toast({
      title: "Coupon Deleted",
      description: `${couponToDelete?.code} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleToggleActive = (couponId: string) => {
    setCoupons(coupons.map(coupon => {
      if (coupon.id === couponId) {
        const updated = { ...coupon, isActive: !coupon.isActive };
        toast({
          title: updated.isActive ? "Coupon Activated" : "Coupon Deactivated",
          description: `${coupon.code} has been ${updated.isActive ? 'activated' : 'deactivated'}.`,
        });
        return updated;
      }
      return coupon;
    }));
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `Coupon code ${code} copied to clipboard.`,
      });
    });
  };

  const formatServicesList = (services: string[] | null) => {
    if (!services || services.length === 0) {
      return "All Services";
    }
    
    return services.map(service => 
      service.charAt(0).toUpperCase() + service.slice(1)
    ).join(", ");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h1 className="text-2xl font-bold">Coupon Management</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create New Coupon
        </Button>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search coupons..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Validity</TableHead>
              <TableHead>Usage</TableHead>
              <TableHead>Services</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  <Tag className="mx-auto h-10 w-10 mb-2 opacity-30" />
                  <p>No coupons found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCoupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span>{coupon.code}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => copyToClipboard(coupon.code)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {coupon.type === 'percentage' ? (
                        <>
                          <Percent className="h-4 w-4 text-muted-foreground" />
                          <span>{coupon.value}% off</span>
                        </>
                      ) : (
                        <>
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span>${coupon.value} off</span>
                        </>
                      )}
                    </div>
                    {coupon.minCartValue > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Min. order: ${coupon.minCartValue}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(coupon.startDate).toLocaleDateString()}</span>
                    </div>
                    {coupon.endDate && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Expires: {new Date(coupon.endDate).toLocaleDateString()}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{coupon.usedCount}</span>
                      {coupon.maxUses && (
                        <span className="text-muted-foreground">/{coupon.maxUses}</span>
                      )}
                    </div>
                    {coupon.maxUses ? (
                      <div className="w-full bg-muted h-1 mt-1 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-1 rounded-full"
                          style={{ width: `${Math.min(100, (coupon.usedCount / coupon.maxUses) * 100)}%` }}
                        ></div>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-1">Unlimited</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {formatServicesList(coupon.services)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={coupon.isActive}
                      onCheckedChange={() => handleToggleActive(coupon.id)}
                      className="data-[state=checked]:bg-green-500"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="12" cy="5" r="1" />
                            <circle cx="12" cy="19" r="1" />
                          </svg>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Edit2 className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => copyToClipboard(coupon.code)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <CouponDialog 
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSave={handleCreateCoupon}
      />

      {selectedCoupon && (
        <CouponDialog 
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          coupon={selectedCoupon}
          onSave={handleEditCoupon}
        />
      )}

      {selectedCoupon && (
        <CouponDeleteDialog 
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          couponCode={selectedCoupon.code}
          onDelete={() => handleDeleteCoupon(selectedCoupon.id)}
        />
      )}
    </div>
  );
};

export default Coupons;
