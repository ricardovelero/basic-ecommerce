import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className='flex space-x-2'>
      <Loader2 className='h-5 w-5 animate-spin' />
      <span className='animate-pulse'>Cargando...</span>
    </div>
  );
}
