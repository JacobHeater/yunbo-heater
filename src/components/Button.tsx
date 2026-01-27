interface ButtonProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export default function Button({
  children,
  href,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button'
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-full transition-colors font-medium';

  const variantClasses = {
    primary: 'bg-foreground text-background hover:bg-foreground/90',
    secondary: 'border border-foreground/20 text-foreground hover:bg-foreground/5',
    danger: 'bg-red-600 text-white hover:bg-red-700 transition-colors rounded-full',
    gray: 'bg-gray-600 text-white hover:bg-gray-700 transition-colors rounded-full'
  };

  const sizeClasses = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-6 text-base',
    lg: 'h-14 px-8 text-lg'
  };

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} disabled={disabled} type={type} className={classes}>
      {children}
    </button>
  );
}