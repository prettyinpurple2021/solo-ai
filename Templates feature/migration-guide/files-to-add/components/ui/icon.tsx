
import * as icons from 'lucide-react';

type IconProps = {
  name: keyof typeof icons;
} & icons.LucideProps;

export const Icon = ({ name, ...props }: IconProps) => {
  const LucideIcon = icons[name] as React.ComponentType<icons.LucideProps>;
  return <LucideIcon {...props} />;
};
