import { OrderTable } from '@/components/order-table';
import { CreateListingForm } from '@/components/create-order-form';
import { MyOrders } from '@/components/my-orders';
import { RecentActivity } from '@/components/recent-activity';

export default function Home() {
  return (
    <div className="flex h-full justify-center">
      <div className="flex flex-col md:flex-row h-full w-full max-w-4xl">
        <div className="flex-1 md:border-r border-[#1a1a1f] flex flex-col min-w-0 md:overflow-auto">
          <MyOrders />
          <OrderTable />
          <RecentActivity />
        </div>
        {/* Desktop sidebar */}
        <div className="w-72 shrink-0 bg-[#0c0c0f] flex-col hidden md:flex">
          <CreateListingForm />
        </div>
        {/* Mobile: sell form stacked below */}
        <div className="md:hidden border-t border-[#1a1a1f] bg-[#0c0c0f] min-h-[110px]">
          <CreateListingForm />
        </div>
      </div>
    </div>
  );
}
