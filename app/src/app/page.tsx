import { OrderTable } from '@/components/order-table';
import { CreateListingForm } from '@/components/create-order-form';
import { MyOrders } from '@/components/my-orders';
import { RecentActivity } from '@/components/recent-activity';

export default function Home() {
  return (
    <div className="flex h-full justify-center">
      <div className="flex h-full w-full max-w-4xl">
        <div className="flex-1 border-r border-[#1a1a1f] flex flex-col min-w-0 overflow-auto">
          <MyOrders />
          <OrderTable />
          <RecentActivity />
        </div>
        <div className="w-72 shrink-0 bg-[#0c0c0f] flex flex-col hidden md:flex">
          <CreateListingForm />
        </div>
      </div>
    </div>
  );
}
