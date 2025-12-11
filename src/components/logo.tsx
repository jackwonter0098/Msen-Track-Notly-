import Image from 'next/image';

export function Logo() {
  return (
    <div className="flex items-center gap-2 font-headline text-lg font-semibold text-primary">
      <Image 
        src="/logo.png" 
        alt="Msen Track Notely Logo" 
        width={24} 
        height={24} 
        className="h-auto"
      />
      <span>Msen Track Notely</span>
    </div>
  );
}
