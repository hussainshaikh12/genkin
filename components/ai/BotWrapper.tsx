import { Sparkles } from 'lucide-react';
import { PropsWithChildren } from 'react';

function BotWrapper({ children }: PropsWithChildren) {
  return (
    <div className="relative flex w-full">
      <Sparkles className="mt-4 mr-2 lg:mt-0 lg:mr-0 lg:absolute lg:-left-10 lg:top-4 h-5 w-5" />
      <div className="relative w-full">{children}</div>
    </div>
  );
}

export default BotWrapper;
