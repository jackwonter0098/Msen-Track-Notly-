import { premiumQuotes } from '@/lib/premium-quotes';

export default function PremiumPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Premium Quotes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {premiumQuotes.map((quote, index) => (
          <div key={index} className="border p-4 rounded-lg shadow">
            <p className="text-lg font-semibold">{quote.en}</p>
            <p className="text-md text-gray-600">{quote.hi}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <h2 className="text-xl font-bold">Unlock More with Premium!</h2>
        <p className="text-gray-500">This is a premium feature. Subscribe now to get access to all exclusive content.</p>
        <button className="mt-4 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold">
          Upgrade to Premium
        </button>
      </div>
    </div>
  );
}
