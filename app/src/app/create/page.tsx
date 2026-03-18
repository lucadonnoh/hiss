import { CreateListingForm } from '@/components/create-order-form';

export default function CreatePage() {
  return (
    <div className="max-w-sm mx-auto py-8 px-4 h-full">
      <div className="border border-[#1a1a1f] bg-[#0c0c0f] h-full max-h-[400px]">
        <CreateListingForm />
      </div>
    </div>
  );
}
